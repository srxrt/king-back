import Errors, { HttpCode, Message } from "../libs/Errors";
import { OrderItem } from "../libs/types/order";
import OrderItemModel from "../schema/OrderItem.model";

class OrderItemService {
	private readonly orderItemModel;

	constructor() {
		this.orderItemModel = OrderItemModel;
	}

	public async createOrderItem(input: OrderItem): Promise<void> {
		try {
			this.orderItemModel.create(input);
		} catch (err) {
			console.log("ERROR:Model:createOrderItem", err);
			throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
		}
	}
}

export default OrderItemService;
