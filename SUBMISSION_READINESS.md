# ProofPatch submission readiness

## Pavel review remediation

Official review from Pavel Kolosov, Aug 14, 2026:

> "Please add application write paths for adjudication and the supplementary-evidence and expiry flow so a submitted report can reach settlement or recover from a request for more evidence. Add direct tests for those report-state transitions and settlement outcomes."

Implemented in the disclosure dossier using the existing injected-wallet architecture:

- `SUBMITTED`: any connected account can call `adjudicate(report_id)`.
- `NEEDS_EVIDENCE` before deadline: only the recorded researcher sees the public HTTPS supplementary-evidence form and can call `add_supplementary_evidence(report_id, url)`.
- Successful supplementation refreshes the on-chain report to `SUBMITTED`, making adjudication available again.
- `NEEDS_EVIDENCE` after deadline: any connected account can call `expire_needs_evidence(report_id)` and refresh the full-bond refund / `EXPIRED` state.
- Terminal reports show settlement details and no additional lifecycle write.
- Every write waits for `FINALIZED`, requires `FINISHED_WITH_RETURN`, and then refreshes `get_report`; finality without successful GenVM execution is shown as failure.

Direct Mode result: **14 passed, 0 failed**. Coverage includes VALID/HIGH payout and refund, KNOWN_ISSUE, exact OUT_OF_SCOPE slash arithmetic, EXPLOITABILITY_NOT_ESTABLISHED, NEEDS_EVIDENCE with funds still locked, researcher-only supplementary evidence, recovery and re-adjudication, premature expiry rejection, post-deadline expiry/full refund by any caller, invalid duplicate-reference rejection, double-adjudication protection, and all four original basic invariants. A positive DUPLICATE settlement was not fabricated because the contract requires a real VecDB-selected settled-valid precedent; the direct suite verifies the settlement-critical invalid-reference guard. Fresh execution context, tool versions, and release-gate results are recorded in [`docs/RESUBMISSION_VERIFICATION.md`](docs/RESUBMISSION_VERIFICATION.md); GitHub Actions/CI are intentionally not used.

Application flow:

```text
create program -> submit bonded disclosure -> RUN ADJUDICATION
  -> terminal verdict -> deterministic settlement
  -> NEEDS_EVIDENCE -> researcher supplements public evidence
       -> SUBMITTED -> RUN ADJUDICATION -> settlement
  OR deadline passes -> anyone expires request -> full bond refund
```

## Source and candidate proof

ProofPatch has exactly one GenLayer contract candidate: `contracts/proofpatch.py`. The old deployment binding has intentionally been removed because the full rebrand requires a fresh ProofPatch deployment.

Before release:

1. Run the contract lint and direct tests.
2. Deploy `contracts/proofpatch.py` to GenLayer StudioNet.
3. Record the new contract address in `frontend/.env.local` as `VITE_PROOFPATCH_CONTRACT`.
4. Run the frontend against that fresh address and verify the complete write lifecycle.


## Write confirmation invariant

Frontend writes wait for a FINALIZED receipt. If StudioNet omits the execution label, the UI does not treat the receipt as success: each write supplies a state-specific chain-read confirmation, with retries, before reporting success or clearing its local draft. An inconclusive receipt remains recoverable and the UI instructs the user to reload the ledger before retrying.
