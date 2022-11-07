import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../util/dbConnect";
import Products from "../../models/ProductsModel";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { itemID } = req.body;

    if (!itemID) {
      res.status(400).send("Missing itemID");
    }
    await dbConnect();

    const product = await Products.findOne({ _id: itemID });

    if (product) {
      const { hash, filename } = product;
      return res.status(200).send({ hash, filename });
    } else {
      return res.status(404).send("Item not found");
    }
  } else {
    return res.status(405).send(`Method ${req.method} not allowed`);
  }
}

export default handler;
