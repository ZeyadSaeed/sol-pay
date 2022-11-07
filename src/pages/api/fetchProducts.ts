import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../util/dbConnect";
import Products from "../../models/ProductsModel";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await dbConnect();
      const products = await Products.find({});

      const productNoHash = products.map(
        ({ _id, name, price, description, image_url, seller }) => {
          return {
            _id,
            name,
            price,
            description,
            image_url,
            seller,
          };
        }
      );

      res.status(200).json(productNoHash);
    } catch (err) {
      res.status(500).json({ message: "Unexpected Server Error", err });
    }
  } else {
    res.status(405).send({ message: `Method ${req.method} not allowed` });
  }
}
