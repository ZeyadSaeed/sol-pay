import { NextApiRequest, NextApiResponse } from "next";
import Orders from "../../models/OrdersModel";
import dbConnect from "../../util/dbConnect";

interface OrderType {
  buyer: string;
  orderID: string;
  itemID: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      try {
        await dbConnect();
        const { buyer } = req.query;
        const buyerOrders = await Orders.find({ buyer });

        if (buyerOrders.length === 0) {
          res.status(204).send(null);
        } else {
          res.status(200).json(buyerOrders);
        }
      } catch (err) {
        res.status(500).send("Something went wrong");
      }
      break;
    case "POST":
      console.log("Received add order request", req.body);
      // Add new order to orders.json
      try {
        await dbConnect();
        const newOrder: OrderType = req.body;

        // If this address has not purchased this item, add order to orders.json
        const orders = await Orders.find({
          buyer: newOrder.buyer.toString(),
          itemID: newOrder.itemID,
        });

        if (orders.length === 0) {
          const addNewOrder = new Orders(newOrder);
          await addNewOrder.save();
          res.status(200).json(addNewOrder);
        } else {
          res.status(400).send("Order already exists");
        }
      } catch (err) {
        res.status(400).send(err);
      }
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
  }
};

export default handler;
