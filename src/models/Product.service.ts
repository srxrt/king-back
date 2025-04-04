import { T } from "../libs/types/common";
import { hashRedisKey, shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  Product,
  ProductInput,
  ProductInquiry,
  ProductUpdateInput,
} from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import mongoose from "mongoose";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import ViewService from "./View.service";
import { cacheData, deleteKeysByPattern } from "../libs/utils/cache";

class ProductService {
  private readonly productModel;
  public viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  /**
   * SPA
   */
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    console.log(inquiry);
    const match: T = { productStatus: ProductStatus.PROCESS };
    if (inquiry.productCollection)
      match.productCollection = inquiry.productCollection;
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }
    const sort: T =
      inquiry.order === "productPrice"
        ? { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };
    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    const key = `products:${hashRedisKey(JSON.stringify(inquiry))}`;
    cacheData(key, result)
      .then(() => {
        console.log("Cache created for products!");
      })
      .catch((err) => {
        console.log("Error creating cache for product!", err);
      });
    return result;
  }

  public async getProduct(
    memberId: mongoose.ObjectId | null,
    id: string,
  ): Promise<Product> {
    const productId = shapeIntoMongooseObjectId(id);
    let result = await this.productModel
      .findOne({ _id: productId, productStatus: ProductStatus.PROCESS })
      .lean()
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    if (memberId) {
      const input: ViewInput = {
        viewGroup: ViewGroup.PRODUCT,
        memberId: memberId,
        viewRefId: productId,
      };
      const existView = await this.viewService.checkViewExistence(input);
      console.log("exists", !!existView);
      if (!existView) {
        await this.viewService.insertMemberView(input);
        result = await this.productModel
          .findByIdAndUpdate(
            productId,
            { $inc: { productViews: +1 } },
            { new: true },
          )
          .exec();
      }
    }
    const key = `product:${hashRedisKey(id)}`;
    cacheData(key, result)
      .then(() => {
        console.log("Cache created for product:", id);
      })
      .catch((err) => {
        console.log("Error creating cache for product!", err);
      });
    return result;
  }

  /**
   * SSR
   */

  public async getAllProducts(): Promise<Product[]> {
    const result = await this.productModel.find();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async createNewProduct(input: ProductInput): Promise<Product> {
    try {
      deleteKeysByPattern("products:*").then();
      return await this.productModel.create(input);
    } catch (err) {
      console.error("ERROR:Model:getAllProducts", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateChosenProduct(
    id: string,
    input: ProductUpdateInput,
  ): Promise<Product> {
    id = shapeIntoMongooseObjectId(id);
    const result = await this.productModel
      .findOneAndUpdate({ _id: id }, input, { new: true })
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
    cacheData(`product:${id}`, result)
      .then(() => {
        console.log("Update cache for product:", id);
      })
      .catch((err) => {
        console.log("Error updating cache for product!", err);
      });
    return result;
  }
}

export default ProductService;
