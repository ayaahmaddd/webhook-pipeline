export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type Job = {
  id: string;
  pipelineId: string;
  status: JobStatus;
  inputPayload: unknown;
  processedPayload?: unknown;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};