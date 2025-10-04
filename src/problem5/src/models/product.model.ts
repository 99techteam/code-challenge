import { IBaseModel } from "./base.model";
import * as yup from "yup";

export interface IProduct extends IBaseModel {
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  publishDate: string;
  manufacturer: string;
}

export const insertBodyShape = {
  name: yup.string().required("name is required"),
  description: yup.string().required("description is required"),
  price: yup.string().required("price is required"),
  publishDate: yup
    .string()
    .required("publishDate is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "publishDate must be in YYYY-MM-DD format"),
};

export const updateBodyShape = {
  name: yup.string(),
  description: yup.string(),
  price: yup.number(),
  publishDate: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "publishDate must be in YYYY-MM-DD format"),
};

export type CreateProductDto = Omit<
  IProduct,
  "id" | "createdAt" | "updatedAt" | "delFlg"
>;

export type UpdateProductDto = Partial<CreateProductDto>;

export default interface IResponseProductList
  extends Pick<IProduct, "name" | "price"> {}
