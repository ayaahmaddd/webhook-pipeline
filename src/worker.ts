import "dotenv/config";
import { eq } from "drizzle-orm";
import { getBoss, QUEUE_NAME } from "./lib/queue";
import { processJobById } from "./services/jobProcessor";
import { db } from "./db";
import { subscribers } from "./db/schema";

async function startWorker() {
  console.log("WORKER STARTING...");
  console.log("DATABASE_URL =", process.env.DATABASE_URL);
  console.log("QUEUE_NAME =", QUEUE_NAME);

  const boss = await getBoss();

  console.log("BOSS READY");

  boss.on("error", (err: unknown) => {
    console.error("WORKER BOSS ERROR:", err);
  });

  const workerId = await boss.work(QUEUE_NAME, async (jobsArg: any) => {
    console.log("RAW JOBS ARG:", jobsArg);

    const queueJob = Array.isArray(jobsArg) ? jobsArg[0] : jobsArg;

    console.log("JOB AFTER NORMALIZE:", queueJob);

    if (!queueJob) {
      console.log("NO JOB RECEIVED");
      return;
    }

    const { jobId } = queueJob.data;

    if (!jobId) {
      console.error("Queue job is missing jobId");
      return;
    }

    console.log("Processing queued jobId:", jobId);

    try {
      const result = await processJobById(jobId);

      console.log("Processing result:", result);

      if (!result || "error" in result) {
        throw new Error(result?.error || "Processing failed");
      }

      const subscriberRows = await db
        .select()
        .from(subscribers)
        .where(eq(subscribers.pipelineId, result.pipelineId));

      for (const subscriber of subscriberRows) {
        const response = await fetch(subscriber.targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
            actionType: result.actionType,
            result: result.processedPayload,
          }),
        });

        console.log(`Delivered to ${subscriber.targetUrl} -> ${response.status}`);

        if (!response.ok) {
          throw new Error(
            `Failed to send webhook to ${subscriber.targetUrl}: ${response.status}`
          );
        }
      }

      console.log("All subscribers notified ✅");
    } catch (error) {
      console.error("WORKER PROCESSING FAILED:", error);
      throw error;
    }
  });

  console.log("WORKER REGISTERED:", workerId);
  console.log("Worker started");
}

startWorker().catch((err) => {
  console.error("Worker failed to start:", err);
  process.exit(1);
});