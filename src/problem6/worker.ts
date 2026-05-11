import { v7 as uuidv7 } from "uuid";
import { createNatsClient } from "./atoms/nats";
import type {
  ExecutionEvent,
  JobRequest,
  JobResponse,
} from "./types";

const url = process.env.NATS_URL ?? "nats://localhost:4222";
const token = process.env.NATS_AUTH_TOKEN;

const nats = await createNatsClient({ url, token });
console.log(`worker connected to ${nats.getServer()}`);

nats.subscribe<JobRequest>(
  "jobs.create",
  { queue: "workers" },
  async ({ data, respond }) => {
    const prefix =
      typeof data.prefix === "string" && data.prefix ? data.prefix : "default";
    const executionId = uuidv7();
    const response: JobResponse = { executionId, prefix };
    respond(response);
    console.log(`[worker] ${prefix}/${executionId} <- ${JSON.stringify(data)}`);

    const event: ExecutionEvent = {
      executionId,
      prefix,
      status: "succeeded",
      at: new Date().toISOString(),
    };
    nats.publish(`executions.${prefix}.${executionId}.event`, event);
  },
);

console.log("listening on jobs.create");
