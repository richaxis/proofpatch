export type ReceiptOutcome = "success" | "unconfirmed" | "failed";
export type ConfirmWrite = () => Promise<boolean>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Finalized GenLayer receipts can omit the execution label. In that case the
 * receipt is not proof that a write committed. Callers must prove the expected
 * state transition from a fresh chain read before reporting success.
 */
export async function finalizeWriteWithConfirmation(
  outcome: ReceiptOutcome,
  confirm: ConfirmWrite,
  hash: string,
  attempts = 5,
): Promise<void> {
  if (outcome === "failed") {
    throw new Error("The finalized receipt reports a failed GenVM execution.");
  }
  if (outcome === "success") return;

  let confirmed = false;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      if (await confirm()) {
        confirmed = true;
        break;
      }
    } catch {
      // A transient RPC read is not confirmation. Retry before treating the
      // write as inconclusive.
    }
    if (attempt + 1 < attempts) await sleep(1500);
  }
  if (!confirmed) {
    throw new Error(
      `Transaction ${hash} finalized without an execution label, and the expected on-chain state could not be confirmed. Reload the ledger before retrying so the write is not duplicated.`,
    );
  }
}
