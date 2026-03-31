import { Router } from "express";
import {
  addSubscriber,
  createPipeline,
  deletePipeline,
  getAllPipelines,
  getPipelineById,
  getSubscribers,
  receiveWebhook,
  updatePipeline,
} from "../controllers/pipelineController";

const router = Router();

router.post("/pipelines", createPipeline);
router.get("/pipelines", getAllPipelines);
router.get("/pipelines/:id", getPipelineById);
router.put("/pipelines/:id", updatePipeline);
router.delete("/pipelines/:id", deletePipeline);

router.post("/pipelines/:id/subscribers", addSubscriber);
router.get("/pipelines/:id/subscribers", getSubscribers);

router.post("/webhooks/:sourcePath", receiveWebhook);

export default router;