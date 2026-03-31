import { Router } from "express";
import {
  deliverJob,
  getAllJobs,
  getDeliveriesForJob,
  getJobById,
  processJob,
} from "../controllers/jobController";

const router = Router();

router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);
router.post("/jobs/:id/process", processJob);
router.post("/jobs/:id/deliver", deliverJob);
router.get("/jobs/:id/deliveries", getDeliveriesForJob);

export default router;