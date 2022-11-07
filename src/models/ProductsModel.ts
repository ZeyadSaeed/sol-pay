import { Schema, model, models } from "mongoose";

interface Productstype {
  name: string;
  price: number;
  description: string;
  image_url: string;
  filename: string;
  hash: string;
  seller: string;
}

export const prodcutsSchema: Schema = new Schema<Productstype>({
  name: String,
  price: Number,
  description: String,
  image_url: String,
  filename: String,
  hash: String,
  seller: String,
});

export default models.Products || model("Products", prodcutsSchema);
