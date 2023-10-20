import { skipPage } from "../utils";
import { productModel } from "../models";

export default class ProductRepository {
  static async getProduct(productId: string) {
    return await productModel.findById(productId).lean().exec();
  }
  static async getAllProducts(limit: number, page: number) {
    return await productModel
      .find()
      .limit(limit)
      .skip(skipPage({ limit, page }))
      .lean()
      .exec();
  }
  static async searchProducts(limit: number, page: number, keySearch: string) {
    // const regSearch = new RegExp(keySearch, "i");
    return await productModel
      .find({ $text: { $search: keySearch } })
      .limit(limit)
      .skip(skipPage({ limit, page }))
      .lean()
      .exec();
  }
  static async updateProduct(productId: string, payload: any) {
    return await productModel
      .findByIdAndUpdate(productId, payload,{new:true})
      .lean()
      .exec();
  }

  static async deleteProduct(productId: string) {
    return await productModel.findByIdAndDelete(productId).lean().exec();
  }
}
