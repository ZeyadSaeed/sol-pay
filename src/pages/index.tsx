import Image from "next/image";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import HeadComponent from "../components/Head";
import RenderNotConnectedContainer from "../components/RenderNotConnectedContainer";
import RenderItemBuyContainer from "../components/RenderItemBuyContainer";
import CreateProduct from "../components/CreateProduct";

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

type products = {
  _id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  seller: string;
}[];

const App = () => {
  const { publicKey } = useWallet();
  const [products, setProducts] = useState<products>([]);
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const res = await fetch("/api/fetchProducts");
    const data = await res.json();
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (publicKey) {
      fetchData();
    }
  }, [publicKey]);

  return (
    <div className="App">
      <HeadComponent />
      <div className="container">
        <header className="header-container">
          <p className="header">Used NFTs Store</p>
          <p className="sub-text">The only used NFTs in the space</p>
          <button
            className="create-product-button"
            onClick={() => setCreating(!creating)}
          >
            {creating ? "Close" : "Create Product"}
          </button>
        </header>

        <main>
          {creating && <CreateProduct />}
          {publicKey ? (
            <RenderItemBuyContainer products={products} isLoading={isLoading} />
          ) : (
            <RenderNotConnectedContainer />
          )}
        </main>

        <div className="footer-container">
          <Image
            alt="Twitter Logo"
            className="twitter-logo"
            src="/twitter-logo.svg"
            width={22}
            height={22}
          />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
