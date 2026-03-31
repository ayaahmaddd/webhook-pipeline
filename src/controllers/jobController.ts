import { Request, Response } from "express";
import { jobs } from "../data/jobs";
import { deliveries } from "../data/deliveries";
import { processJobById } from "../services/jobProcessor";
import { deliverJobResults } from "../services/deliveryService";

export function getAllJobs(_req: Request, res: Response) {
  return res.status(200).json(jobs);
}

export function getJobById(req: Request, res: Response) {
  const id = req.params.id as string;

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  return res.status(200).json(job);
}

export async function processJob(req: Request, res: Response) {
  const id = req.params.id as string;

  const result = await processJobById(id);

  if ("error" in result) {
    const errorResult = result as { error: string; status: number };
    return res.status(errorResult.status).json({ message: errorResult.error });
  }

  return res.status(200).json({
    message: "Job processed successfully",
    job: (result as any).job,
  });
}

export async function deliverJob(req: Request, res: Response) {
  const id = req.params.id as string;

  const result = await deliverJobResults(id);

  if ("error" in result) {
    return res.status(result.status).json({ message: result.error });
  }

  return res.status(200).json({
    message: "Delivery attempts completed",
    deliveries: result.results,
  });
}

export function getDeliveriesForJob(req: Request, res: Response) {
  const id = req.params.id as string;

  const jobDeliveries = deliveries.filter((d) => d.jobId === id);

  return res.status(200).json(jobDeliveries);
}