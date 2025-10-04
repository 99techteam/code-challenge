import IResponseProductList, {
  IProduct,
  CreateProductDto,
  UpdateProductDto,
  insertBodyShape,
} from "../models/product.model";
import { HTTPError } from "../shared/errors";
import productDAO from "../daos/product.dao";
import { IResponseCommon, IResponseSuccess } from "../models/base.model";
import STT from "http-status";
import { ERROR_MESSAGE } from "../shared/constants";
import * as yup from "yup";
import { objIgnoreKeys, objIncludeKeys } from "../shared/functions";

interface ISearchProductParams {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface IPaginationParams {
  limit?: number;
  offset?: number;
}

class ProductService {
  async getList(
    params: ISearchProductParams,
    pagination: IPaginationParams
  ): Promise<IResponseCommon<IResponseProductList[]>> {
    const { name, minPrice } = params;
    const { limit = 10, offset = 0 } = pagination;

    const condition = {
      name: name ? ["LIKE", `%${name}%`] : undefined,
      price: minPrice ? [">=", minPrice] : undefined,
    };

    const [products, total] = await Promise.all([
      productDAO.getMany(condition, {
        limit,
        offset,
      }),
      productDAO.getTotal(condition),
    ]);

    return {
      result: <IResponseProductList[]>(
        products.map((p) => objIncludeKeys(p, ["id", "name", "price"]))
      ),
      meta: {
        total,
        offset,
        limit,
      },
    };
  }

  async getDetail(id: string): Promise<IResponseCommon<IProduct>> {
    const product = await productDAO.getOne({ id: id });

    if (!product) {
      throw new HTTPError(ERROR_MESSAGE.RESOURCE_NOT_FOUND, STT.NOT_FOUND);
    }

    return {
      result: <IProduct>objIgnoreKeys(product, ["delFlg"]),
      meta: {},
    };
  }

  async create(data: CreateProductDto): Promise<IResponseSuccess> {
    try {
      await productDAO.add(data);
      return { success: true };
    } catch (error: any) {
      throw new HTTPError(
        error.message ? error.message : ERROR_MESSAGE.RESOURCE_CREATION_FAILED,
        error.status ? error.status : STT.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(
    id: string,
    productData: UpdateProductDto
  ): Promise<IResponseSuccess> {
    try {
      await this.getDetail(id);
      await productDAO.update({ id }, productData);
      return { success: true };
    } catch (error: any) {
      throw new HTTPError(
        error.message ? error.message : ERROR_MESSAGE.RESOURCE_UPDATE_FAILED,
        error.statusCode ? error.statusCode : STT.INTERNAL_SERVER_ERROR
      );
    }
  }

  async delete(id: string): Promise<IResponseSuccess> {
    try {
      await this.getDetail(id);
      await productDAO.delete({ id });
      return { success: true };
    } catch (error: any) {
      throw new HTTPError(
        error.message ? error.message : ERROR_MESSAGE.RESOURCE_DELETION_FAILED,
        error.statusCode ? error.statusCode : STT.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export default new ProductService();
