import { Schema, model, models } from "mongoose";

interface OrderType {
  buyer: string;
  orderID: string;
  itemID: string;
}

export const ordersSchema: Schema = new Schema<OrderType>({
  buyer: String,
  orderID: String,
  itemID: String,
});

export default models.Orders || model("Orders", ordersSchema);
