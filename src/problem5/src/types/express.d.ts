declare global {
  namespace Express {
    interface Request {
    };
    interface Response {
      success: (data: any) => void;
      error: (message: string, status?: number) => void;
    }
  }
}

export {}