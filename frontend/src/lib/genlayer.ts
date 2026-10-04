import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus, type GenLayerTransaction } from "genlayer-js/types";
import { finalizeWriteWithConfirmation, type ReceiptOutcome } from "@/lib/write-confirmation";
export const CONTRACT_ADDRESS = import.meta.env.VITE_PROOFPATCH_CONTRACT;
export const ENDPOINT = import.meta.env.VITE_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
export function ensureContract() { if (!CONTRACT_ADDRESS) throw new Error("ProofPatch contract is not configured. Set VITE_PROOFPATCH_CONTRACT."); return CONTRACT_ADDRESS; }
export function readClient() { return createClient({ chain: studionet, endpoint: ENDPOINT, account: createAccount() }); }

export function errorText(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
    const reason = (error as { shortMessage?: unknown }).shortMessage;
    if (typeof reason === "string" && reason.trim()) return reason;
    const code = (error as { code?: unknown }).code;
    if (code !== undefined) {
      const data = (error as { data?: unknown }).data;
      return `Wallet error ${String(code)}${data ? `: ${errorText(data, "no detail")}` : ""}`;
    }
    // Never fall back to JSON.stringify here: GenLayer receipts are large and
    // stringify into unreadable calldata dumps that hide the actual reason.
  }
  return fallback;
}

// Writes go through the injected provider's eth_sendTransaction, so only the
// network switch is required: the GenLayer snap that client.connect() would
// install is never used by this app, and wallets without snap support fail it.
async function ensureStudioChain(): Promise<void> {
  const provider = window.ethereum;
  if (!provider) throw new Error("No injected wallet found.");
  const chainId = `0x${studionet.id.toString(16)}`;
  const current = await provider.request({ method: "eth_chainId" });
  if (typeof current === "string" && current.toLowerCase() === chainId) return;
  const chainParams = {
    chainId,
    chainName: studionet.name,
    rpcUrls: studionet.rpcUrls.default.http,
    nativeCurrency: studionet.nativeCurrency,
    blockExplorerUrls: [studionet.blockExplorers?.default.url].filter(Boolean),
  };
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId }] });
    return;
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902 && code !== -32603) {
      throw new Error(`${errorText(error, "The wallet rejected the network switch.")} Approve the prompt to move your wallet to ${studionet.name} (chain ${studionet.id}), then try again.`);
    }
  }
  try {
    await provider.request({ method: "wallet_addEthereumChain", params: [chainParams as never] });
  } catch (error) {
    throw new Error(`${errorText(error, "The wallet could not add StudioNet.")} Add ${studionet.name} (chain ${studionet.id}, RPC ${studionet.rpcUrls.default.http[0]}) in your wallet, switch to it, then try again.`);
  }
  const after = await provider.request({ method: "eth_chainId" });
  if (typeof after !== "string" || after.toLowerCase() !== chainId) {
    throw new Error(`StudioNet was added, but the wallet is still on chain ${String(after)}. Switch to ${studionet.name} (chain ${studionet.id}) in your wallet, then try again.`);
  }
}

export async function injectedClient(address: `0x${string}`) {
  if (!window.ethereum) throw new Error("No injected wallet found.");
  await ensureStudioChain();
  return createClient({ chain: studionet, endpoint: ENDPOINT, account: address, provider: window.ethereum });
}

export async function waitFinalized(client: ReturnType<typeof readClient>, hash: `0x${string}`) { return client.waitForTransactionReceipt({ hash: hash as never, status: TransactionStatus.FINALIZED, interval: 5000, retries: 90 }); }

// StudioNet omits txExecutionResultName on some FINALIZED receipts, so a missing
// label means "unconfirmed", not "failed". Reading that as failure reported
// successful writes as errors. Treat a definite non-success as an error, and an
// unlabelled receipt as inconclusive the caller must resolve against chain state.
export type ExecutionOutcome = ReceiptOutcome;

export function executionOutcome(receipt: GenLayerTransaction): ExecutionOutcome {
  return receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_RETURN
    ? "success"
    : receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR || receipt.txExecutionResultName === ExecutionResult.NOT_VOTED
      ? "failed"
      : "unconfirmed";
}

/**
 * A finalized receipt without txExecutionResultName is inconclusive on
 * StudioNet. Every write caller supplies a state-specific confirmation, so an
 * unlabeled receipt can never be reported as success or clear a local draft.
 */
export type ConfirmWrite = () => Promise<boolean>;

export async function waitFinalizedSuccessful(client: ReturnType<typeof readClient>, hash: `0x${string}`, confirm: ConfirmWrite): Promise<GenLayerTransaction> {
  const receipt=await waitFinalized(client,hash);
  const outcome=executionOutcome(receipt);
  if(outcome==="failed"){
    throw new Error(`Transaction finalized with a GenVM execution error (${receipt.txExecutionResultName ?? receipt.txExecutionResult ?? "unknown"}). The contract reverted and no state changed.`);
  }
  await finalizeWriteWithConfirmation(outcome, confirm, String(hash));
  return receipt;
}
declare global { interface Window { ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown>; on?(name: string, listener: (...args: unknown[]) => void): void; removeListener?(name: string, listener: (...args: unknown[]) => void): void } } }
