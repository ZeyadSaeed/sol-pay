import { useState } from "react";
import { create } from "ipfs-http-client";
import styles from "../styles/CreateProduct.module.css";
import { Oval } from "react-loader-spinner";
import { useWallet } from "@solana/wallet-adapter-react";

const auth =
  "Basic " +
  Buffer.from(
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID +
      ":" +
      process.env.NEXT_PUBLIC_INFURA_API_SECRET
  ).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

type FileType = {
  filename: string;
  hash: string;
};

const CreateProduct = () => {
  const { publicKey } = useWallet();
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image_url: "",
    description: "",
  });

  const [file, setFile] = useState<FileType>();
  const [isLoading, setIsLoading] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsLoading(true);
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const added = await client.add(file);
      setFile({ filename: file.name, hash: added.path });
    } catch (error) {
      console.log("Error uploading file: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Combine product data and file.name
      const product = { ...newProduct, ...file, seller: publicKey };
      console.log("Sending product to api", product);
      const response = await fetch("/api/addProduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
      const data = await response.json();
      if (response.status === 200) {
        window.location.reload();
      } else {
        console.log("Unable to add product: ", data.error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.background_blur}>
      <div className={styles.create_product_container}>
        <div className={styles.create_product_form}>
          <header className={styles.header}>
            <h1>Create Product</h1>
          </header>

          <form
            className={styles.form_container}
            onSubmit={(e) => createProduct(e)}
          >
            <input
              type="file"
              className={styles.input}
              accept=".zip,.rar,.7zip"
              placeholder="Emojis"
              onChange={onChange}
            />
            {file && file.filename != null && (
              <p className="file-name">{file.filename}</p>
            )}
            <div className={styles.flex_row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Product Name"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, name: e.target.value });
                }}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="0.01 USDC"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, price: e.target.value });
                }}
              />
            </div>

            <div className={styles.flex_row}>
              <input
                className={styles.input}
                type="url"
                placeholder="Image URL ex: https://i.imgur.com/rVD8bjt.png"
                onChange={(e) => {
                  setNewProduct({ ...newProduct, image_url: e.target.value });
                }}
              />
            </div>
            <textarea
              className={styles.text_area}
              placeholder="Description here..."
              onChange={(e) => {
                setNewProduct({ ...newProduct, description: e.target.value });
              }}
            />

            <button className={styles.button} disabled={isLoading}>
              {isLoading ? (
                <Oval
                  height={24}
                  width={24}
                  color="#000000"
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="#000012"
                  strokeWidth={5}
                  strokeWidthSecondary={2}
                />
              ) : (
                "Create Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
