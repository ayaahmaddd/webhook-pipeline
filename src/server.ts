import { app } from "./app";
import { startQueue } from "./lib/queue";

const PORT = process.env.PORT || 3000;

async function start() {
  await startQueue();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
});