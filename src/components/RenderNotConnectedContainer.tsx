import Image from "next/image";
import dynamic from "next/dynamic";

const RenderNotConnectedContainer = () => {
  const WalletMultiButtonDynamic = dynamic(
    async () =>
      (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
    { ssr: false }
  );

  return (
    <div>
      <Image
        src="https://img-cdn.magiceden.dev/rs:fill:640:640:0:0/plain/https://metadata.y00ts.com/y/12585.png"
        alt="y00ts nft"
        width={620}
        height={620}
        priority
      />
      <div className="button-container">
        <WalletMultiButtonDynamic className="cta-button connect-wallet-button" />
      </div>
    </div>
  );
};

export default RenderNotConnectedContainer;
