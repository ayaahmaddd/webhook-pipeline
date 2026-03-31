import { eq } from "drizzle-orm";
import { db } from "../db";
import { jobs, pipelines } from "../db/schema";
import {
  enrichMetadata,
  filterImportantFields,
  transformFields,
} from "../actions/processors";

export async function processJobById(jobId: string) {
  const jobResult = await db
    .select()
    .from(jobs)
    .where(eq(jobs.id, jobId));

  const job = jobResult[0];

  if (!job) {
    return { error: "Job not found", status: 404 };
  }

  const pipelineResult = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.id, job.pipelineId));

  const pipeline = pipelineResult[0];

  if (!pipeline) {
    await db
      .update(jobs)
      .set({
        status: "failed",
        errorMessage: "Pipeline not found",
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    return { error: "Pipeline not found", status: 404 };
  }

  try {
    await db
      .update(jobs)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    let processedPayload: any;

    switch (pipeline.actionType) {
      case "transform":
        processedPayload = transformFields(job.inputPayload);
        break;

      case "enrich":
        processedPayload = enrichMetadata(job.inputPayload, pipeline.id);
        break;

      case "filter":
        processedPayload = filterImportantFields(job.inputPayload);
        break;

      default:
        processedPayload = job.inputPayload;
    }

    await db
      .update(jobs)
      .set({
        status: "completed",
        processedPayload,
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));
return {
  success: true,
  jobId,
  pipelineId: pipeline.id,  
  processedPayload,
  actionType: pipeline.actionType,
};
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    await db
      .update(jobs)
      .set({
        status: "failed",
        errorMessage: message,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    return { error: message, status: 500 };
  }
}