"use client";

import { useEffect, useState } from "react";
import { sepolia } from "wagmi/chains";
import {
  useAccount,
  useBlockNumber,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";
import { contractAddress, fallbackAddress, learningDemoAbi } from "../lib/contract";

function formatAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const contractReady = Boolean(contractAddress);
  const activeAddress = contractAddress ?? fallbackAddress;
  const walletReady = mounted;
  const walletConnected = walletReady && isConnected;
  const onSepolia = mounted && chain?.id === sepolia.id;
  const displayNetworkName = mounted ? chain?.name ?? "No wallet session" : "Checking wallet";
  const displayWalletAddress = mounted ? address ?? "Not connected" : "Checking wallet";

  const { data: count, refetch: refetchCount } = useReadContract({
    address: activeAddress,
    abi: learningDemoAbi,
    functionName: "count",
    chainId: sepolia.id,
    query: {
      enabled: contractReady
    }
  });

  const { data: message, refetch: refetchMessage } = useReadContract({
    address: activeAddress,
    abi: learningDemoAbi,
    functionName: "message",
    chainId: sepolia.id,
    query: {
      enabled: contractReady
    }
  });

  const { data: owner } = useReadContract({
    address: activeAddress,
    abi: learningDemoAbi,
    functionName: "owner",
    chainId: sepolia.id,
    query: {
      enabled: contractReady
    }
  });

  const receipt = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: sepolia.id,
    query: {
      enabled: Boolean(txHash)
    }
  });
  const { data: blockNumber } = useBlockNumber({
    chainId: sepolia.id,
    watch: true,
    query: {
      enabled: contractReady
    }
  });
  const canTransact =
    walletConnected && contractReady && onSepolia && !isWriting && !receipt.isLoading;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function syncAfterReceipt() {
      await Promise.all([refetchCount(), refetchMessage()]);
      setDraftMessage("");
      setFeedback("Transaction confirmed on Sepolia.");
      setTxHash(undefined);
    }

    if (receipt.isSuccess) {
      void syncAfterReceipt();
    }
  }, [receipt.isSuccess, refetchCount, refetchMessage]);

  useEffect(() => {
    if (!contractReady || !blockNumber) return;

    void refetchCount();
    void refetchMessage();
  }, [blockNumber, contractReady, refetchCount, refetchMessage]);

  useEffect(() => {
    if (!mounted) {
      setFeedback("Checking wallet connection...");
      return;
    }

    if (!walletConnected) {
      setFeedback("Connect your wallet to begin.");
      return;
    }

    if (!contractReady) {
      setFeedback("Set NEXT_PUBLIC_CONTRACT_ADDRESS to your deployed Sepolia contract.");
      return;
    }

    if (!onSepolia) {
      setFeedback("Your wallet is connected to the wrong network. Switch to Sepolia to interact.");
      return;
    }

    setFeedback("Wallet connected. You can read and write to the Sepolia contract.");
  }, [contractReady, mounted, onSepolia, walletConnected]);

  async function handleConnect() {
    if (!connectors[0]) {
      setFeedback("No injected wallet was detected. Please install or unlock MetaMask.");
      return;
    }

    setFeedback(null);

    try {
      await connect({ connector: connectors[0], chainId: sepolia.id });
    } catch {
      setFeedback("Wallet connection was cancelled. Reconnect when you are ready.");
    }
  }

  async function handleSwitchNetwork() {
    setFeedback(null);

    try {
      await switchChainAsync({ chainId: sepolia.id });
      setFeedback("Wallet switched to Sepolia.");
    } catch {
      setFeedback("Network switch was rejected. Please select Sepolia in MetaMask and try again.");
    }
  }

  async function handleIncrement() {
    if (!contractAddress || !onSepolia) return;

    setFeedback("Submitting increment transaction...");

    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: learningDemoAbi,
        functionName: "increment",
        chainId: sepolia.id
      });

      setTxHash(hash);
    } catch {
      setFeedback("Increment transaction was rejected or failed before broadcast.");
    }
  }

  async function handleSetMessage() {
    if (!contractAddress || !draftMessage.trim() || !onSepolia) return;

    setFeedback("Submitting message update...");

    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: learningDemoAbi,
        functionName: "setMessage",
        args: [draftMessage.trim()],
        chainId: sepolia.id
      });

      setTxHash(hash);
    } catch {
      setFeedback("Message update was rejected or failed before broadcast.");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="badge">Sepolia control room</span>
          <h1>Ship transactions with a sharper on-chain interface.</h1>
          <p>
            A crypto-native dashboard for watching state, pushing writes, and
            keeping your demo anchored to Sepolia instead of drifting into
            mainnet by accident.
          </p>
        </div>

        <div className="hero-status">
          <span className={`status-dot ${onSepolia ? "online" : "offline"}`} />
          <div>
            <strong>{onSepolia ? "Ready for Sepolia" : "Network action required"}</strong>
            <p>{feedback}</p>
          </div>
        </div>

        <div className="ticker-grid">
          <div className="ticker-card">
            <span className="section-label">Network</span>
            <strong>{sepolia.name}</strong>
            <p>Testnet routing locked in for reads and writes.</p>
          </div>
          <div className="ticker-card">
            <span className="section-label">Contract mode</span>
            <strong>Mutable State</strong>
            <p>Counter and message actions are live on-chain.</p>
          </div>
          <div className="ticker-card">
            <span className="section-label">Wallet path</span>
            <strong>{walletConnected ? "Injected" : "Standby"}</strong>
            <p>Optimized for MetaMask and browser wallet flow.</p>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <div className="primary-panel">
          <div className="panel-header">
            <div>
              <span className="section-label">On-chain telemetry</span>
              <h2>LearningDemo</h2>
            </div>
            <div className="network-chip">{sepolia.name}</div>
          </div>

          {!contractReady ? (
            <div className="notice notice-warning">
              <strong>Missing contract address</strong>
              <p>Add your deployed address to `frontend/.env.local` before using the app.</p>
            </div>
          ) : null}

          {!onSepolia && walletConnected ? (
            <div className="notice notice-danger">
              <strong>Wrong wallet network</strong>
              <p>
                Your wallet is currently on {displayNetworkName}.
                Switch to Sepolia before sending a transaction.
              </p>
            </div>
          ) : null}

          <div className="stats-grid">
            <article className="stat-card">
              <span className="section-label">Counter state</span>
              <strong>{count?.toString() ?? "0"}</strong>
              <p>Latest confirmed value read directly from Sepolia.</p>
            </article>

            <article className="stat-card">
              <span className="section-label">Owner signer</span>
              <strong className="mono">{formatAddress(owner)}</strong>
              <p>Deployment wallet currently controlling contract ownership.</p>
            </article>
          </div>

          <article className="message-card">
            <span className="section-label">Broadcast message</span>
            <p>{message ?? "No message has been stored yet."}</p>
          </article>

          <div className="action-grid">
            <button className="button button-primary" onClick={handleIncrement} disabled={!canTransact}>
              {receipt.isLoading ? "Confirming on-chain..." : "Increment counter"}
            </button>

            <div className="composer">
              <label htmlFor="message" className="section-label">
                Push a message update
              </label>
              <input
                id="message"
                className="input"
                placeholder="Compose a fresh on-chain signal"
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
              />
              <button
                className="button button-secondary"
                onClick={handleSetMessage}
                disabled={!canTransact || !draftMessage.trim()}
              >
                Update message
              </button>
            </div>
          </div>
        </div>

        <aside className="side-panel">
          <div className="panel-header">
            <div>
              <span className="section-label">Wallet gateway</span>
              <h2>Session</h2>
            </div>
          </div>

          <div className="detail-list">
            <div className="detail-item">
              <span>Wallet</span>
              <strong className="mono">{displayWalletAddress}</strong>
            </div>
            <div className="detail-item">
              <span>Active network</span>
              <strong>{displayNetworkName}</strong>
            </div>
            <div className="detail-item">
              <span>Expected network</span>
              <strong>{sepolia.name}</strong>
            </div>
            <div className="detail-item">
              <span>Contract address</span>
              <strong className="mono">{contractAddress ?? "Missing env value"}</strong>
            </div>
            {txHash ? (
              <div className="detail-item">
                <span>Pending transaction</span>
                <strong className="mono">{txHash}</strong>
              </div>
            ) : null}
          </div>

          <div className="stack">
            {!walletConnected ? (
              <button
                className="button button-primary"
                onClick={handleConnect}
                disabled={isConnecting || connectors.length === 0}
              >
                {isConnecting ? "Connecting..." : "Connect wallet"}
              </button>
            ) : (
              <>
                <button
                  className="button button-secondary"
                  onClick={handleSwitchNetwork}
                  disabled={onSepolia || isSwitching}
                >
                  {onSepolia ? "Already on Sepolia" : isSwitching ? "Switching..." : "Switch to Sepolia"}
                </button>
                <button className="button button-ghost" onClick={() => disconnect()}>
                  Disconnect wallet
                </button>
              </>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
