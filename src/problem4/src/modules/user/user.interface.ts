export interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
