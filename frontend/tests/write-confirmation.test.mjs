import assert from "node:assert/strict";
import test from "node:test";
import { finalizeWriteWithConfirmation } from "../src/lib/write-confirmation.ts";

test("unconfirmed finalized receipt is accepted only after chain state confirms it", async () => {
  let reads = 0;
  await finalizeWriteWithConfirmation("unconfirmed", async () => {
    reads += 1;
    return reads === 2;
  }, "0xabc", 3);
  assert.equal(reads, 2);
});

test("unconfirmed finalized receipt never reports success when expected state is absent", async () => {
  let reads = 0;
  await assert.rejects(
    finalizeWriteWithConfirmation("unconfirmed", async () => {
      reads += 1;
      return false;
    }, "0xdef", 2),
    /expected on-chain state could not be confirmed/,
  );
  assert.equal(reads, 2);
});

test("labeled successful receipt does not require a confirmation read", async () => {
  let reads = 0;
  await finalizeWriteWithConfirmation("success", async () => {
    reads += 1;
    return false;
  }, "0x123", 2);
  assert.equal(reads, 0);
});
