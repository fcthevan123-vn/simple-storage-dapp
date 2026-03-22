import { injected } from "@wagmi/core";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({
      shimDisconnect: true
    })
  ],
  transports: {
    [sepolia.id]: http(sepolia.rpcUrls.default.http[0])
  }
});
