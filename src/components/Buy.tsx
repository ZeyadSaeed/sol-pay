import { useMemo, useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, Transaction } from "@solana/web3.js";
import { RotatingLines } from "react-loader-spinner";
import IpfsDownload from "./IpfsDownload";
import { findReference, FindReferenceError } from "@solana/pay";
import { addOrder, hasPurchased, fetchItem } from "../util/api";

type BuyProps = {
  itemID: string;
};

type ItemType = {
  hash: string;
  filename: string;
};

const STATUS = {
  Initial: "Initial",
  Submitted: "Submitted",
  Paid: "Paid",
};

const Buy = ({ itemID }: BuyProps) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [item, setItem] = useState<ItemType>(); // IPFS hash & filename of the purchased item
  const [loading, setLoading] = useState(false); // Loading state of all above
  const [status, setStatus] = useState(STATUS.Initial); // Tracking transaction status
  const orderID = useMemo(() => Keypair.generate().publicKey, []); // Public key used to identify the order

  const order = useMemo(
    () => ({
      buyer: publicKey && publicKey.toString(),
      orderID: orderID.toString(),
      itemID: itemID,
    }),
    [publicKey, orderID, itemID]
  );

  const processTransaction = async () => {
    setLoading(true);

    const txResponse = await fetch("/api/createTransaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });

    const txData = await txResponse.json();
    // We create a transaction object
    const tx = Transaction.from(Buffer.from(txData.transaction, "base64"));
    console.log("Tx data is", tx);

    // Attempt to send the transaction to the network
    try {
      // Send the transaction to the network
      const txHash = await sendTransaction(tx, connection);
      console.log(
        `Transaction sent: https://solscan.io/tx/${txHash}?cluster=devnet`
      );
      setStatus(STATUS.Submitted);
      // Even though this could fail, we're just going to set it to true for now
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if this address has already purchased this item
    // If so, fetch the item and set paid to true
    // Async function to avoid blocking the UI
    async function checkPurchased() {
      if (!publicKey) return;
      const purchased = await hasPurchased(publicKey, itemID);
      if (purchased) {
        setStatus(STATUS.Paid);
        const item = await fetchItem(itemID);
        setItem(item);
      }
    }
    checkPurchased();
  }, [publicKey, itemID]);

  useEffect(() => {
    // Check if transaction was confirmed
    if (status === STATUS.Submitted) {
      setLoading(true);
      const interval = setInterval(async () => {
        try {
          const result = await findReference(connection, orderID);
          if (
            result.confirmationStatus === "confirmed" ||
            result.confirmationStatus === "finalized"
          ) {
            clearInterval(interval);
            setStatus(STATUS.Paid);
            addOrder(order);
            setLoading(false);
            alert("Thank you for your purchase!");
          }
          console.log("Finding tx reference", result.confirmationStatus);
        } catch (err) {
          if (err instanceof FindReferenceError) {
            return null;
          }
          console.error("Unknow error", err);
        } finally {
          setLoading(false);
        }
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }

    async function getItem(itemID: string) {
      const item = await fetchItem(itemID);
      setItem(item);
    }

    if (status === STATUS.Paid) {
      getItem(itemID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (loading) {
    return (
      <RotatingLines strokeColor="gray" width="37" animationDuration="0.75" />
    );
  }

  if (!publicKey) {
    return (
      <div>
        <p>You need to connect your wallet to make transactions</p>
      </div>
    );
  }
  return (
    <div>
      {status === STATUS.Paid && item ? (
        <IpfsDownload
          filename={item.filename}
          hash={item.hash}
          cta="Download Image"
        />
      ) : (
        <button
          disabled={loading}
          className="buy-button"
          onClick={processTransaction}
        >
          Buy now 🠚
        </button>
      )}
    </div>
  );
};

export default Buy;
