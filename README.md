# ProofPatch

Public findings. Bound scope. Consensus settlement.

ProofPatch is a GenLayer-native public vulnerability-disclosure bounty protocol. A sponsor funds a time-bound, immutable target and scope in GEN. A researcher posts a public disclosure and exact bond. GenLayer validators independently retrieve bounded public evidence, reach a comparative consensus verdict, and deterministic code applies the payout/refund/slash rule.

## Why GenLayer

A conventional deterministic contract can escrow money, but it cannot inspect a changing public disclosure, a pinned source component, or whether two security reports describe the same root cause. Removing GenLayer from ProofPatch would leave an administrator or oracle deciding those facts. ProofPatch instead asks validators to fetch the supplied disclosure, a pinned GitHub component when applicable, supplementary evidence, and selected same-program precedent disclosures inside the consensus block.

All fetched material is treated as untrusted evidence: the adjudication prompt explicitly ignores instructions, credentials, and policy-changing text found in it. Fetch failures, empty content, malformed model output, and consensus transport failures revert as transient errors; they never settle a report or move GEN.

## Precedent and settlement

Embeddings perform bounded deterministic retrieval only. `preview_precedents` and adjudication keep at most three semantic context precedents, but adjudication also performs a full same-program scan for settled VALID reports that share the submitted component or public disclosure URL. That duplicate-scan is independent of researcher identity and vector rank, so a matching settled report cannot be omitted merely because it is the same researcher or falls outside the three semantic candidates. Semantic distance is never a confidence score and can never decide `DUPLICATE`; validators still make the adjudication decision from fetched evidence. Every validator independently SHA-256 hashes the exact bytes it fetched (disclosure, pinned target, supplementary evidence, duplicate/context precedents); the per-source digests travel inside the compared consensus envelope, so agreement proves byte-identical evidence, not merely similar prose.

Deterministic code alone enforces program date windows, exact bonds, sponsor permissions, payout matrix, pool sufficiency, no double settlement, and close/reclaim rules. `NEEDS_EVIDENCE` creates a seven-day future deadline. The researcher may append one public HTTPS URL; after expiry anyone can return the full bond through the explicit safe expiry path. A sponsor cannot close while reports are unresolved and only receives unused bounty pool, never researcher bonds. The slash policy is capped at 5000 bps so an out-of-scope verdict is a penalty, never confiscation. Evidence requests are bounded to two rounds before the report settles as unestablished with a full refund.

## Product surface

- `/`: concise index and network proof
- `/programs`, `/programs/new`, `/programs/[id]`: live program ledger, creation, and dossier
- `/programs/[id]/submit`: exact bond read from contract and shared injected-wallet write
- `/disclosures`, `/disclosures/[id]`: public ledger and state-aware Scope Rail dossier with adjudication, researcher-only supplementary-evidence recovery, post-deadline expiry/refund, and finalized settlement state
- `/precedent`: settled-valid contextual precedents (semantic distance is not duplicate; adjudication also scans the full program history for deterministic duplicate candidates)
- `/settlements`: final on-chain payout/refund/slash ledger

The persistent application shell owns the sole production wallet identity. Browser-generated/local-storage wallets are absent. Production writes use the connected injected wallet, wait for finalization, verify `FINISHED_WITH_RETURN` GenVM execution, refresh chain state, and fail clearly when `VITE_PROOFPATCH_CONTRACT` is missing. A finalized transaction with failed GenVM execution is never presented as application success.

### Application lifecycle

```text
create program -> submit bonded disclosure -> RUN ADJUDICATION
  -> terminal verdict -> deterministic settlement
  -> NEEDS_EVIDENCE -> researcher adds supplementary public HTTPS evidence
       -> SUBMITTED -> RUN ADJUDICATION -> settlement
       (at most 2 evidence rounds, then EXPLOITABILITY_NOT_ESTABLISHED)
  OR evidence deadline passes -> any account expires request -> full bond refund
  OR 14-day adjudication deadline passes -> any account expires report -> full bond refund
  OR researcher recalls within 1 hour -> WITHDRAWN -> full bond refund
```

The dossier matches contract authorization exactly: any connected account may adjudicate before the adjudication deadline; only the recorded researcher may supplement evidence before the deadline; and any connected account may expire a request after the deadline. The researcher may withdraw within one hour of submission; any connected account may expire a report past its adjudication deadline. Terminal reports expose no further lifecycle write.

## Contract API

Writes: `create_program`, `top_up`, `pause_program`, `close_program`, `submit_report`, `withdraw_report`, `adjudicate`, `add_supplementary_evidence`, `expire_submitted`, `expire_needs_evidence`.

Views: full bounded `get_program`, `get_report`, `preview_precedents`, counts, and paginated `list_program_ids`, `list_report_ids`, and `list_program_report_ids`.

## Deployment status

This repository is a freshly rebranded ProofPatch build. The previous deployment is **not** used by the frontend.

Before using the DApp, deploy `contracts/proofpatch.py` as a new contract in GenLayer StudioNet and set the resulting address in `frontend/.env.local` as `VITE_PROOFPATCH_CONTRACT`.

The contract filename, Python contract class, frontend environment variable, browser storage keys, prompts, tests, scripts, documentation, and visible application branding have all been renamed to ProofPatch.

## Verification

```powershell
& "$env:LOCALAPPDATA\Python\pythoncore-3.14-64\Scripts\genvm-lint.exe" check contracts/proofpatch.py
./scripts/check-contract-candidates.ps1
python -m pytest tests/direct -v
cd frontend; npm run lint; npx tsc --noEmit; npm run build
```

The candidate audit finds exactly one candidate: `contracts/proofpatch.py`. The prior rejection came from tracked pytest helper imports being interpreted as contract candidates; the test compatibility shim now avoids runtime SDK imports, while the audit enforces the single-candidate invariant.

The Direct Mode suite contains 47 tests and passes 47/47. It covers the original invariants plus top-up/close lifecycle, stale-submission expiry and researcher recall, the slash cap and pool guards, URL/ref validation, pagination and precedent preview, bounded evidence rounds, code-computed evidence digests, prompt-injection guards, the positive DUPLICATE path, and the comparative consensus round itself (validator agreement on identical evidence, rejection on divergent bytes, fail-closed fetch). Three node-gated integration tests exercise the live consensus path and skip without a node.
