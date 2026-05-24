import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  providerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  quota: { type: Number, default: 10 }
});
export const Provider = mongoose.model('Provider', providerSchema);

const serviceSchema = new mongoose.Schema({
  serviceId: { type: Number, required: true, unique: true },
  name: { type: String, required: true }
});
export const Service = mongoose.model('Service', serviceSchema);

const leadSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true },
  city: String,
  serviceId: { type: Number, required: true },
});
leadSchema.index({ phone: 1, serviceId: 1 }, { unique: true });
export const Lead = mongoose.model('Lead', leadSchema);

const assignmentSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  providerId: { type: Number },
});
export const Assignment = mongoose.model('Assignment', assignmentSchema);

const roundRobinSchema = new mongoose.Schema({
  serviceId: { type: Number, required: true, unique: true },
  lastAssignedIndex: { type: Number, default: -1 }
});
export const RoundRobin = mongoose.model('RoundRobin', roundRobinSchema);

const webhookSchema = new mongoose.Schema({
  idempotencyKey: { type: String, required: true, unique: true },
});
export const WebhookLog = mongoose.model('WebhookLog', webhookSchema);