import useIPFS from "../hooks/useIPFS";

type IpfsDownloadProps = {
  hash: string;
  filename: string;
  cta: string;
};

const IpfsDownload = ({ hash, filename }: IpfsDownloadProps) => {
  const file = useIPFS(hash, filename);
  return (
    <div>
      {file ? (
        <div className="download-component">
          <a className="download-button" href={file} download={filename}>
            Download
          </a>
        </div>
      ) : (
        <p>Downloading file...</p>
      )}
    </div>
  );
};

export default IpfsDownload;
