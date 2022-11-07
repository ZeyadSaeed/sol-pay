const useIPFS = (hash: string, filename: string): string => {
  return `https://gateway.ipfs.io/ipfs/${hash}?filename=${filename}`;
};

export default useIPFS;
