import { NextApiRequest, NextApiResponse } from "next";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import dbConnect from "../../util/dbConnect";
import Products from "../../models/ProductsModel";

const usdcAddress = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
);
const sellerAddress = "AHrRbV5eKdnRfDXoTEa4bSXjfPvAw7MDx4JhZdkZQcmF";
const sellerPublicKey = new PublicKey(sellerAddress);

type CreateTransactionRes =
  | { transaction: string }
  | { error: string }
  | { message: string };

const createTransaction = async (
  req: NextApiRequest,
  res: NextApiResponse<CreateTransactionRes>
) => {
  try {
    await dbConnect();
    // Extract the transaction data from the request body
    const { buyer, orderID, itemID } = req.body;

    // If we don't have something we need, stop!
    if (!buyer) {
      return res.status(400).json({
        message: "Missing buyer address",
      });
    }

    if (!orderID) {
      return res.status(400).json({
        message: "Missing order ID",
      });
    }

    // Fetch item price from products.json using itemID
    const product = await Products.findOne({ _id: itemID });

    if (!product) {
      return res.status(404).json({
        message: "Item not found. please check item ID",
      });
    }

    // Convert our price to the correct format
    const bigAmount = BigNumber(product.price);
    const buyerPublicKey = new PublicKey(buyer);
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = clusterApiUrl(network);
    const connection = new Connection(endpoint);

    // A blockhash is sort of like an ID for a block. It lets you identify each block.
    const buyerUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      buyerPublicKey
    );
    const shopUsdcAddress = await getAssociatedTokenAddress(
      usdcAddress,
      sellerPublicKey
    );
    const { blockhash } = await connection.getLatestBlockhash("finalized");

    // This is new, we're getting the mint address of the token we want to transfer
    const usdcMint = await getMint(connection, usdcAddress);

    // The first two things we need - a recent block ID
    // and the public key of the fee payer
    const tx = new Transaction({
      recentBlockhash: blockhash,
      feePayer: buyerPublicKey,
    });

    // This is the "action" that the transaction will take
    // We're just going to transfer some SOL
    const transferInstruction = createTransferCheckedInstruction(
      buyerUsdcAddress,
      usdcAddress,
      shopUsdcAddress,
      buyerPublicKey,
      bigAmount.toNumber() * 10 ** (await usdcMint).decimals,
      usdcMint.decimals
    );

    //* THAT'S FOR SOL TRANSACTION
    // const transferInstruction = SystemProgram.transfer({
    //   fromPubkey: buyerPublicKey,
    //   // Lamports are the smallest unit of SOL, like Gwei with Ethereum
    //   lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
    //   toPubkey: sellerPublicKey,
    // });

    // We're adding more instructions to the transaction
    transferInstruction.keys.push({
      // We'll use our OrderId to find this transaction later
      pubkey: new PublicKey(orderID),
      isSigner: false,
      isWritable: false,
    });

    tx.add(transferInstruction);

    // Formatting our transaction
    const serializedTransaction = tx.serialize({
      requireAllSignatures: false,
    });
    const base64 = serializedTransaction.toString("base64");

    res.status(200).json({
      transaction: base64,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error creating tx" });
    return;
  }
};

export default createTransaction;
