import Product from "./Product";
import { TailSpin } from "react-loader-spinner";

type ProductsProps = {
  isLoading: boolean;
  products: {
    _id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    seller: string;
  }[];
};

const RenderItemBuyContainer = ({ products, isLoading }: ProductsProps) => {
  return (
    <div className="products-container">
      {isLoading ? (
        <TailSpin
          height="80"
          width="80"
          color="#ffffff"
          ariaLabel="tail-spin-loading"
          radius="1"
          wrapperClass="spinner"
          visible={true}
        />
      ) : (
        products.map((product) => (
          <Product key={product._id} product={product} />
        ))
      )}
    </div>
  );
};

export default RenderItemBuyContainer;
