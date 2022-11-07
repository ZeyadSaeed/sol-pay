import Image from "next/image";
import styles from "../styles/Product.module.css";
import Buy from "./Buy";

type ProductProps = {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    image_url: string;
    seller: string;
  };
};

const Product = ({ product }: ProductProps) => {
  const { _id, name, price, description, image_url, seller } = product;
  return (
    <div className={styles.product_container}>
      <div>
        <Image
          className={styles.product_image}
          src={image_url}
          alt={name}
          width={200}
          height={200}
        />
      </div>

      <div className={styles.product_details}>
        <div className={styles.product_text}>
          <div className={styles.product_title}>{name}</div>
          <div className={styles.product_description}>{description}</div>
        </div>

        <div className={styles.product_action}>
          <div className={styles.product_price}>{price} USDC</div>
          <Buy itemID={_id} />
        </div>
        <p className="seller">
          by{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://solscan.io/account/${seller}`}
          >
            {seller.slice(0, 3)}...{seller.slice(-4, -1)}
          </a>
        </p>
      </div>
    </div>
  );
};

export default Product;
