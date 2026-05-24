import mongoose from "mongoose";
import { Provider, Service, Lead, Assignment, RoundRobin, WebhookLog } from "../models/index.js";

// --- 1. SEED DATA (Database mein initial data dalne ke liye) ---
export const seedDatabase = async (req, res) => {
  try {
    await Provider.deleteMany({});
    await Service.deleteMany({});
    await RoundRobin.deleteMany({});
    await Lead.deleteMany({});
    await Assignment.deleteMany({});

    const providers = Array.from({ length: 8 }, (_, i) => ({
      providerId: i + 1,
      name: `Provider ${i + 1}`,
      quota: 10
    }));
    await Provider.insertMany(providers);

    const services = [
      { serviceId: 1, name: "Service 1" },
      { serviceId: 2, name: "Service 2" },
      { serviceId: 3, name: "Service 3" }
    ];
    await Service.insertMany(services);

    res.json({ message: "Database Seeded Successfully! 8 Providers & 3 Services added." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 2. CREATE LEAD (Main Assignment Logic) ---
const RULES = {
  1: { mandatory: [1], pool: [2, 3, 4] },
  2: { mandatory: [5], pool: [6, 7, 8] },
  3: { mandatory: [1, 4], pool: [2, 3, 5, 6, 7, 8] }
};

export const createLead = async (req, res) => {
  const { name, phone, city, serviceId } = req.body;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create Lead (Duplicate phone+serviceId will fail here)
    const [newLead] = await Lead.create([{ name, phone, city, serviceId }], { session });

    const rule = RULES[serviceId];
    let assignedProviders = [];
    let slotsToFill = 3;

    // Assign Mandatory Providers
    for (let pId of rule.mandatory) {
      const provider = await Provider.findOneAndUpdate(
        { providerId: pId, quota: { $gt: 0 } },
        { $inc: { quota: -1 } },
        { session, new: true }
      );
      if (provider) {
        assignedProviders.push(pId);
        slotsToFill--;
      }
    }

    // Assign Remaining from Pool (Round-Robin)
    if (slotsToFill > 0) {
      let rrState = await RoundRobin.findOne({ serviceId }).session(session);
      if (!rrState) {
        rrState = await RoundRobin.create([{ serviceId, lastAssignedIndex: -1 }], { session }).then(res => res[0]);
      }

      let pool = rule.pool;
      let currentIndex = rrState.lastAssignedIndex;
      let attempts = 0;

      while (slotsToFill > 0 && attempts < pool.length) {
        currentIndex = (currentIndex + 1) % pool.length;
        attempts++;
        let candidateId = pool[currentIndex];

        if (assignedProviders.includes(candidateId)) continue;

        const provider = await Provider.findOneAndUpdate(
          { providerId: candidateId, quota: { $gt: 0 } },
          { $inc: { quota: -1 } },
          { session, new: true }
        );

        if (provider) {
          assignedProviders.push(candidateId);
          slotsToFill--;
          attempts = 0;
          rrState.lastAssignedIndex = currentIndex;
        }
      }
      await rrState.save({ session });
    }

    // Save Assignments
    const assignmentDocs = assignedProviders.map(pId => ({
      leadId: newLead._id,
      providerId: pId
    }));
    if (assignmentDocs.length > 0) await Assignment.insertMany(assignmentDocs, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, assignedTo: assignedProviders });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) return res.status(400).json({ error: "Duplicate Lead: This phone already requested this service." });
    res.status(500).json({ error: "Server Error", details: error.message });
  }
};

// --- 3. DASHBOARD STATS ---
export const getDashboardStats = async (req, res) => {
  try {
    const providers = await Provider.find({}).sort({ providerId: 1 }).lean();
    const stats = await Promise.all(providers.map(async (p) => {
      const leadsCount = await Assignment.countDocuments({ providerId: p.providerId });
      return { ...p, leadsCount };
    }));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- 4. WEBHOOK (Idempotency) ---
export const resetQuotaWebhook = async (req, res) => {
  const { providerId, idempotencyKey } = req.body;
  try {
    const existingLog = await WebhookLog.findOne({ idempotencyKey });
    if (existingLog) {
      return res.json({ message: "Webhook already processed (Idempotent success)." });
    }

    await Provider.findOneAndUpdate({ providerId }, { $set: { quota: 10 } });
    await WebhookLog.create({ idempotencyKey });
    
    res.json({ success: true, message: `Provider ${providerId} quota reset to 10.` });
  } catch (error) {
    if (error.code === 11000) return res.json({ message: "Webhook already processed (Idempotent success)." });
    res.status(500).json({ error: error.message });
  }
};