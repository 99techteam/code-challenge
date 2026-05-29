import Redis from 'ioredis';
import WebSocket from 'ws';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface PlayerStats {
  username: string;
  rank: number;
  score: number;
}

interface PlayerMetadata {
  [key: string]: string | number;
}

class LeaderboardService {
  private readonly leaderboardKey: string;
  private readonly playerMetaPrefix: string;
  private readonly playerMetaTtlSeconds: number;
  private readonly redis: Redis;
  private readonly wss: WebSocket.Server;

  constructor(redisCli: Redis, webSocketServer: WebSocket.Server) {
    this.redis = redisCli;
    this.wss = webSocketServer;
    this.leaderboardKey = process.env.LEADERBOARD_KEY || "game:leaderboard";
    this.playerMetaPrefix = process.env.PLAYER_META_PREFIX || "player:meta:";
    this.playerMetaTtlSeconds = process.env.PLAYER_META_TTL_SECONDS ||  60 * 60 * 24 * 30;
  }

  private getMetaKey(username: string): string {
    return `${this.playerMetaPrefix}${username}`;
  }

  private toLeaderboardEntries(
    rawEntries: (string | number)[],
    startRank: number = 1
  ): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];

    for (let i = 0; i < rawEntries.length; i += 2) {
      entries.push({
        rank: startRank + i / 2,
        username: rawEntries[i] as string,
        score: Number.parseInt(rawEntries[i + 1] as string, 10),
      });
    }

    return entries;
  }

  private broadcastToClients(message: string): void {
    this.wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private createBroadcastMessage(type: string, data: any): string {
    return JSON.stringify({
      type,
      data, 
      timestamp: Date.now(),
    });
  }


  async setScore(username: string, score: number): Promise<void> {
    await this.redis.zadd(this.leaderboardKey, score, username);
  }

  async incrementScore(username: string, amount: number): Promise<void> {
    const newScore = await this.redis.zincrby(
      this.leaderboardKey,
      amount,
      username
    );
    await this.broadcastLeaderboard();
    await this.broadcastScoreChange(username, newScore);
  }

  async removePlayer(username: string): Promise<void> {
    await this.redis.zrem(this.leaderboardKey, username);
  }

  async resetLeaderboard(): Promise<void> {
    await this.redis.del(this.leaderboardKey);
  }

  async getTopN(limit: number = 10): Promise<LeaderboardEntry[]> {
    const rawEntries = await this.redis.zrange(
      this.leaderboardKey,
      0,
      limit - 1,
      "REV",
      "WITHSCORES"
    );

    return this.toLeaderboardEntries(rawEntries, 1);
  }

  async getRankRange(
    fromRank: number,
    toRank: number
  ): Promise<LeaderboardEntry[]> {
    const rawEntries = await this.redis.zrange(
      this.leaderboardKey,
      fromRank - 1,
      toRank - 1,
      "REV",
      "WITHSCORES"
    );

    return this.toLeaderboardEntries(rawEntries, fromRank);
  }

  async getPlayerStats(username: string): Promise<PlayerStats | null> {
    const score = await this.redis.zscore(this.leaderboardKey, username);
    if (score === null) {
      return null;
    }

    let rank: number;

    try {
      const descendingRank = await this.redis.call(
        "ZRANK",
        this.leaderboardKey,
        username,
        "REV"
      );
      rank = (descendingRank as number) + 1;
    } catch {
      const [ascendingRank, totalPlayers] = await Promise.all([
        this.redis.zrank(this.leaderboardKey, username),
        this.redis.zcard(this.leaderboardKey),
      ]);
      rank = (totalPlayers as number) - (ascendingRank as number);
    }

    return {
      username,
      rank,
      score: Number.parseInt(score as string, 10),
    };
  }

  async getTotalPlayers(): Promise<number> {
    return this.redis.zcard(this.leaderboardKey) as Promise<number>;
  }

  async getByScoreRange(
    minScore: number,
    maxScore: number
  ): Promise<LeaderboardEntry[]> {
    const rawEntries = await this.redis.zrange(
      this.leaderboardKey,
      maxScore,
      minScore,
      "BYSCORE",
      "REV",
      "WITHSCORES"
    );

    return this.toLeaderboardEntries(rawEntries, 1);
  }

  async setPlayerMeta(
    username: string,
    metadata: PlayerMetadata
  ): Promise<void> {
    if (!metadata || Object.keys(metadata).length === 0) {
      return;
    }

    const metaKey = this.getMetaKey(username);
    await this.redis.hset(metaKey, metadata);
    await this.redis.expire(metaKey, this.playerMetaTtlSeconds);
  }

  async getPlayerMeta(username: string): Promise<PlayerMetadata> {
    return this.redis.hgetall(
      this.getMetaKey(username)
    ) as Promise<PlayerMetadata>;
  }

  async broadcastLeaderboard(): Promise<void> {
    const leaderboard = await this.getTopN();
    const message = this.createBroadcastMessage("LEADERBOARD_UPDATE", leaderboard);
    this.broadcastToClients(message);
  }

  async broadcastScoreChange(username: string, newScore: number): Promise<void> {
    const message = this.createBroadcastMessage("SCORE_CHANGED", { username, newScore });
    this.broadcastToClients(message);
  }
}

export { LeaderboardService, LeaderboardEntry, PlayerStats, PlayerMetadata };
