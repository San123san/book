import express from "express";
import { 
  seedDatabase, 
  createLead, 
  getDashboardStats, 
  resetQuotaWebhook 
} from "../controllers/index.js";

const router = express.Router();

router.get("/seed", seedDatabase);
router.post("/request-service", createLead);
router.get("/dashboard", getDashboardStats);
router.post("/webhook/reset-quota", resetQuotaWebhook);

export default router;