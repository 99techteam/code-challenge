
export interface IWithMongoID {
  readonly _id: string;
}

export interface IWithID {
  readonly id: string;
}

export interface IUserData {
  email: string;
  password: string;
  emailVerified: boolean;
  name: string;
  picture: string | null;
  phone: string;
  city: string;
  address: string;
  age: number;
  gender: string;
  fatherName: string;
  joinDate: string;
  userRole: number;
  isBlock: boolean;
  updatedAt?: string | null;
}

export type IStoredUser = IUserData & IWithMongoID;

export interface UserFilters {
  email?: string;
  name?: string;
  city?: string;
  gender?: string;
  userRole?: number;
  isBlock?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}
