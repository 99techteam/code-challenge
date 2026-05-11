import { connect, JSONCodec } from "nats";
import type { NatsClient, NatsConfig } from "../types";

export const createNatsClient = async (
  config: NatsConfig,
): Promise<NatsClient> => {
  const nc = await connect({ servers: config.url, token: config.token });
  const jc = JSONCodec<unknown>();

  const request: NatsClient["request"] = async (subject, payload, opts) => {
    const res = await nc.request(subject, jc.encode(payload), {
      timeout: opts?.timeout ?? 3000,
    });
    return jc.decode(res.data) as never;
  };

  const publish: NatsClient["publish"] = (subject, payload) => {
    nc.publish(subject, jc.encode(payload));
  };

  const subscribe: NatsClient["subscribe"] = (subject, opts, handler) => {
    const sub = nc.subscribe(subject, opts);
    (async () => {
      for await (const m of sub) {
        let data: unknown = {};
        try {
          data = jc.decode(m.data);
        } catch {
          data = {};
        }
        await handler({
          data: data as never,
          respond: (payload) => m.respond(jc.encode(payload)),
        });
      }
    })();
  };

  return {
    getServer: () => nc.getServer(),
    request,
    publish,
    subscribe,
    drain: () => nc.drain(),
  };
};
