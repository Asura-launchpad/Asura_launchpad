export const getRpcEndpoint = () => {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (!endpoint || !endpoint.startsWith('http')) {
    return "https://api.mainnet-beta.solana.com";
  }
  return endpoint;
}; 