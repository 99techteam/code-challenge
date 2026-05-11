export type NatsConfig = {
  url: string;
  token?: string;
};

export type NatsRequestOptions = {
  timeout?: number;
};

export type NatsSubscribeOptions = {
  queue?: string;
};

export type NatsIncomingMessage<T> = {
  data: T;
  respond: (payload: unknown) => void;
};

export type NatsMessageHandler<T> = (
  msg: NatsIncomingMessage<T>,
) => void | Promise<void>;

export type NatsClient = {
  getServer: () => string;
  request: <Res, Req = unknown>(
    subject: string,
    payload: Req,
    opts?: NatsRequestOptions,
  ) => Promise<Res>;
  publish: <T>(subject: string, payload: T) => void;
  subscribe: <T>(
    subject: string,
    opts: NatsSubscribeOptions,
    handler: NatsMessageHandler<T>,
  ) => void;
  drain: () => Promise<void>;
};

export type JobRequest = {
  prefix?: string;
} & Record<string, unknown>;

export type JobResponse = {
  executionId: string;
  prefix: string;
};

export type ExecutionStatus = "succeeded";

export type ExecutionEvent = {
  executionId: string;
  prefix: string;
  status: ExecutionStatus;
  at: string;
};
