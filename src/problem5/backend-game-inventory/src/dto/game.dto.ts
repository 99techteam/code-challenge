export type CreateGameDTO = {
  title: string;
  genre: string;
  platform: string;
  quantity: number;
  price: number;
};

export type UpdateGameDTO = Partial<CreateGameDTO>;