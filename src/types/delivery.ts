export type DeliveryStatus = "success" | "failed";

export type DeliveryAttempt = {
  id: string;
  jobId: string;
  subscriberUrl: string;
  attemptNumber: number;
  status: DeliveryStatus;
  responseStatus?: number;
  errorMessage?: string;
  createdAt: string;
};