import Redis from "ioredis";

class RedisClient {
  private client: Redis;
  private host: string;
  private port: number;

  constructor() {
    this.host = process.env.REDIS_HOST || "127.0.0.1";
    this.port = Number.parseInt(process.env.REDIS_PORT || "6379", 10);

    this.client = new Redis({
      host: this.host,
      port: this.port,
      lazyConnect: true,
      retryStrategy: this.retryStrategy.bind(this),
    });

    this.setupEventHandlers();
  }

  private retryStrategy(retryCount: number): number | null {
    if (retryCount > 5) {
      console.error("Redis connection failed after 5 retries.");
      console.error("Make sure your Redis server is running.");
      return null;
    }

    return Math.min(retryCount * 300, 3000);
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      console.log(`Redis connected at ${this.host}:${this.port}`);
    });

    this.client.on("error", (error) => {
      console.error("Redis error:", error.message);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  zrange(
    key: string,
    start: number,
    stop: number,
    ...args: string[]
  ): Promise<(string | number)[]> {
    return this.client.zrange(key, start, stop, ...args);
  }

  zscore(key: string, member: string): Promise<string | null> {
    return this.client.zscore(key, member);
  }

  zincrby(key: string, increment: number, member: string): Promise<string> {
    return this.client.zincrby(key, increment, member);
  }

  zrem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member);
  }

  zrank(key: string, member: string): Promise<number | null> {
    return this.client.zrank(key, member);
  }

  zcard(key: string): Promise<number> {
    return this.client.zcard(key);
  }

  del(key: string): Promise<number> {
    return this.client.del(key);
  }

  hset(key: string, data: Record<string, string | number>): Promise<number> {
    return this.client.hset(key, data);
  }

  hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  call(command: string, ...args: (string | number)[]): Promise<unknown> {
    return this.client.call(command, ...args);
  }
}

export { RedisClient };