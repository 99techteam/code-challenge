import { 
  IsEmail, 
  IsEnum, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUUID, 
  Length, 
  MaxLength 
} from "class-validator";
import { UserGender } from "../enums/UserGender";
import { SortBy } from "../enums/SortBy";

export class GetParamsUsersDto {
  @IsEnum(SortBy)
  sortBy?: SortBy;

  search?: string;

  limit?: number;

  offset?: number;
}


export class CreateUserDto {

  @IsNotEmpty({ message: 'First name should not be empty' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName!: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  lastName!: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email!: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsNumber()
  @IsEnum(UserGender, { message: 'Status must be either 0 or 1' })
  gender?: number;

  @IsOptional()
  @IsUUID()
  createdBy?: string;
}

export class UserDto {
  constructor(
    id: string,
    firebaseId: string,
    firstName: string,
    lastName: string,
    email: string,
    gender: number,
    createdBy: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.firebaseId = firebaseId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.gender = gender;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  @IsUUID()
  @MaxLength(36)
  id: string;

  @MaxLength(36)
  firebaseId: string;

  @IsNotEmpty({ message: 'First name should not be empty' })
  @Length(2, 50, { message: 'First name must be between 2 and 50 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name should not be empty' })
  @Length(2, 50, { message: 'Last name must be between 2 and 50 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsNumber()
  @IsEnum(UserGender, { message: 'Status must be either 0 or 1' })
  gender: number;

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}