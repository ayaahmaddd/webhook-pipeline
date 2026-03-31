import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { deliveryAttempts, jobs, subscribers } from "../db/schema";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryDeliver(
  jobId: string,
  subscriberId: string,
  subscriberUrl: string,
  payload: unknown,
  attemptNumber: number
) {
  try {
    const response = await fetch(subscriberUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId,
        result: payload,
      }),
    });

    const attempt = {
      id: randomUUID(),
      jobId,
      subscriberId,
      targetUrl: subscriberUrl,
      attemptNumber,
      status: response.ok ? "success" : "failed",
      statusCode: response.status,
      errorMessage: response.ok ? null : `HTTP ${response.status}`,
      createdAt: new Date(),
    };

    await db.insert(deliveryAttempts).values(attempt);

    return attempt;
  } catch (error) {
    const attempt = {
      id: randomUUID(),
      jobId,
      subscriberId,
      targetUrl: subscriberUrl,
      attemptNumber,
      status: "failed",
      statusCode: null,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      createdAt: new Date(),
    };

    await db.insert(deliveryAttempts).values(attempt);

    return attempt;
  }
}

export async function deliverJobResults(jobId: string) {
  const jobRows = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  const job = jobRows[0];

  if (!job) {
    return { error: "Job not found", status: 404 };
  }

  if (job.status !== "completed") {
    return { error: "Job is not completed yet", status: 400 };
  }

  const subscriberRows = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, job.pipelineId));

  if (subscriberRows.length === 0) {
    return {
      status: 200,
      results: [],
      message: "No subscribers found for this pipeline",
    };
  }

  const results = [];

  for (const subscriber of subscriberRows) {
    let success = false;
    let finalAttempt = null;

    for (let attemptNumber = 1; attemptNumber <= 3; attemptNumber++) {
      const attempt = await tryDeliver(
        job.id,
        subscriber.id,
        subscriber.targetUrl,
        job.processedPayload,
        attemptNumber
      );

      finalAttempt = attempt;

      if (attempt.status === "success") {
        success = true;
        break;
      }

      if (attemptNumber < 3) {
        await sleep(2000);
      }
    }

    results.push({
      subscriberId: subscriber.id,
      subscriberUrl: subscriber.targetUrl,
      delivered: success,
      finalAttempt,
    });
  }

  return {
    status: 200,
    results,
  };
}