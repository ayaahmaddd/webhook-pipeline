import "dotenv/config";

const { PgBoss } = require("pg-boss");

const connectionString = process.env.DATABASE_URL;
const QUEUE_NAME = "process-job";

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

let bossInstance: any = null;

export async function startQueue() {
  if (bossInstance) {
    return bossInstance;
  }

  bossInstance = new PgBoss({
    connectionString,
  });

  bossInstance.on("error", (err: unknown) => {
    console.error("PgBoss error:", err);
  });

  await bossInstance.start();

  await bossInstance.createQueue(QUEUE_NAME);

  console.log(`Queue started: ${QUEUE_NAME}`);

  return bossInstance;
}

export async function getBoss() {
  if (!bossInstance) {
    return await startQueue();
  }

  return bossInstance;
}

export async function sendToQueue(data: any) {
  const boss = await getBoss();
  return await boss.send(QUEUE_NAME, data);
}

export { QUEUE_NAME };