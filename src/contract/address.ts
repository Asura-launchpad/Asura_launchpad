export const BONDING_CURVE_ADDRESSES = {
    mainnet: "0xF1d9E186365ACb95249E05cc7273329135eEB039",
    testnet: "0xF1d9E186365ACb95249E05cc7273329135eEB039"
  } as const;
  
  export const getContractAddress = (network: keyof typeof BONDING_CURVE_ADDRESSES) => {
    return BONDING_CURVE_ADDRESSES[network];
  };
  
  export const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "0xd9Ebdc29deC126279A4C0b4e85A60Cd77e230fb3";