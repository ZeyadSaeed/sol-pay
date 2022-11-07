import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../util/dbConnect";
import Products from "../../models/ProductsModel";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      await dbConnect();
      const productInfo = req.body;

      const newProduct = new Products(productInfo);
      await newProduct.save();

      res.status(200).send({ status: "ok" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "error adding product" });
      return;
    }
  } else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
};

export default handler;
