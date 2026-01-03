export interface Score {
  id: string;
  userId: string;
  score: number;
  updatedAt: string;
}

export interface ScoreWithUser {
  userId: string;
  username: string;
  score: number;
  rank: number;
  updatedAt: string;
}

export interface ScoreUpdateRequest {
  increment: number;
}

export interface ScoreUpdateResponse {
  message: string;
  userId: string;
  previousScore: number;
  newScore: number;
  rank: number;
}

export interface ScoreboardResponse {
  scores: ScoreWithUser[];
  totalPlayers: number;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

