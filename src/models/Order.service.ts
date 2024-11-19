import mongoose from "mongoose";
import OrderModel from "../schema/Order.model";
import {
	Order,
	OrderInput,
	OrderInquiry,
	OrderItemInput,
	OrderUpdateInput,
} from "../libs/types/order";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import OrderItemModel from "../schema/OrderItem.model";
import { Member } from "../libs/types/member";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { T } from "../libs/types/common";
import MemberService from "./Member.service";

class OrderService {
	private readonly orderModel;
	private readonly orderItemModel;
	private readonly memberService;

	constructor() {
		this.orderModel = OrderModel;
		this.orderItemModel = OrderItemModel;
		this.memberService = new MemberService();
	}

	public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
		const amount = input.reduce((total: number, ele) => {
			return total + ele.itemPrice * ele.itemQuantity;
		}, 0);

		const delivery = amount < 100 ? 5 : 0;
		const orderInput: OrderInput = {
			orderTotal: amount + delivery,
			orderDelivery: delivery,
			orderStatus: OrderStatus.PAUSE,
			memberId: shapeIntoMongooseObjectId(member._id),
		};

		try {
			const newOrder = await this.orderModel.create(orderInput);

			if (!newOrder) {
				throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
			}
			const orderId = newOrder._id;
			await this.recordOrderItem(orderId, input);
			return newOrder;
		} catch (err) {
			console.log("ERROR:Model:createOrder");
			throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
		}
	}

	public async getMyOrders(member: Member, inquiry: OrderInquiry) {
		const match: T = {
			memberId: shapeIntoMongooseObjectId(member._id),
			orderStatus: inquiry.orderStatus,
		};
		const result = await this.orderModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{ $skip: (inquiry.page - 1) * inquiry.limit },
				{ $limit: inquiry.limit },
				{
					$lookup: {
						from: "orderItems",
						localField: "_id",
						foreignField: "orderId",
						as: "orderItems",
					},
				},
				{
					$lookup: {
						from: "products",
						as: "productData",
						localField: "orderItems.productId", // bu arrayku, qanaqb olyapti
						foreignField: "_id",
					},
				},
			])
			.exec();
		if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

		return result;
	}

	public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
		const memberId = shapeIntoMongooseObjectId(member._id),
			orderId = shapeIntoMongooseObjectId(input.orderId),
			orderStatus = input.orderStatus as OrderStatus;

		const result = await this.orderModel
			.findOneAndUpdate(
				{ _id: orderId, memberId: memberId },
				{ orderStatus: orderStatus },
				{ new: true }
			)
			.exec();
		if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

		if (result.orderStatus === OrderStatus.PROCESS) {
			await this.memberService.addUserPoint(member, 1);
		}
		return result;
	}

	private async recordOrderItem(
		orderId: mongoose.ObjectId,
		input: OrderItemInput[]
	): Promise<void> {
		const promisedList = input.map(async (item: OrderItemInput) => {
			item.orderId = orderId;
			item.productId = shapeIntoMongooseObjectId(item.productId);
			await this.orderItemModel.create(item);
		});
		await Promise.all(promisedList);
	}
}

export default OrderService;
