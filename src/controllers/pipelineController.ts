import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { pipelines, subscribers, jobs } from "../db/schema";
import { getBoss } from "../lib/queue";

export async function createPipeline(req: Request, res: Response) {
  try {
    console.log("CREATE PIPELINE START");
    const { name, actionType } = req.body;
    console.log("BODY:", req.body);

    if (!name || !actionType) {
      return res.status(400).json({
        message: "name and actionType are required",
      });
    }

    const webhookKey = randomUUID();

    console.log("BEFORE DB INSERT");

    const result = await db
      .insert(pipelines)
      .values({
        name,
        actionType,
        webhookKey,
        active: true,
      })
      .returning();

    console.log("AFTER DB INSERT");

    const pipeline = result[0];

    console.log("BEFORE RESPONSE");

    return res.status(201).json({
      id: pipeline.id,
      name: pipeline.name,
      actionType: pipeline.actionType,
      webhookKey: pipeline.webhookKey,
      sourcePath: `/webhooks/${pipeline.webhookKey}`,
      active: pipeline.active,
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
    });
  } catch (error) {
    console.error("CREATE PIPELINE ERROR:", error);

    return res.status(500).json({
      message: "Failed to create pipeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getAllPipelines(_req: Request, res: Response) {
  try {
    const result = await db.select().from(pipelines);

    const formatted = result.map((pipeline) => ({
      ...pipeline,
      sourcePath: `/webhooks/${pipeline.webhookKey}`,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pipelines",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getPipelineById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const result = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id));

    const pipeline = result[0];

    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    return res.status(200).json({
      ...pipeline,
      sourcePath: `/webhooks/${pipeline.webhookKey}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pipeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function updatePipeline(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { name, actionType, active } = req.body;

    const existing = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id));

    if (!existing[0]) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const result = await db
      .update(pipelines)
      .set({
        name: name ?? existing[0].name,
        actionType: actionType ?? existing[0].actionType,
        active: active ?? existing[0].active,
        updatedAt: new Date(),
      })
      .where(eq(pipelines.id, id))
      .returning();

    const pipeline = result[0];

    return res.status(200).json({
      ...pipeline,
      sourcePath: `/webhooks/${pipeline.webhookKey}`,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update pipeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function deletePipeline(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const existing = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id));

    if (!existing[0]) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const result = await db
      .delete(pipelines)
      .where(eq(pipelines.id, id))
      .returning();

    return res.status(200).json({
      message: "Pipeline deleted",
      pipeline: result[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete pipeline",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function addSubscriber(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const { subscriberUrl } = req.body;

    if (!subscriberUrl) {
      return res.status(400).json({
        message: "subscriberUrl is required",
      });
    }

    const existingPipeline = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id));

    if (!existingPipeline[0]) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const result = await db
      .insert(subscribers)
      .values({
        pipelineId: id,
        targetUrl: subscriberUrl,
      })
      .returning();

    return res.status(201).json({
      message: "Subscriber added",
      subscriber: result[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add subscriber",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getSubscribers(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const existingPipeline = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.id, id));

    if (!existingPipeline[0]) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    const result = await db
      .select()
      .from(subscribers)
      .where(eq(subscribers.pipelineId, id));

    return res.status(200).json({
      pipelineId: id,
      subscribers: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch subscribers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function receiveWebhook(req: Request, res: Response) {
  try {
    const sourcePath = req.params.sourcePath as string;

    const pipelineResult = await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.webhookKey, sourcePath));

    const pipeline = pipelineResult[0];

    if (!pipeline) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    if (!pipeline.active) {
      return res.status(400).json({ message: "Pipeline is inactive" });
    }

    const createdJobs = await db
      .insert(jobs)
      .values({
        pipelineId: pipeline.id,
        status: "queued",
        inputPayload: req.body,
      })
      .returning();

    const job = createdJobs[0];

    const boss = await getBoss();

    await boss.send("process-job", {
      jobId: job.id,
      pipelineId: pipeline.id,
      payload: req.body,
    });

    return res.status(202).json({
      message: "Webhook accepted and queued",
      job,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to receive webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}