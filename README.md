# Private AI Financial Agent

**An AI financial agent that understands your financial preferences, analyses your portfolio privately, and executes approved actions on Flare — without exposing your holdings, net worth, or strategy.**

Built for the [Flare Summer Signal](https://dorahacks.io/hackathon/flaresummersignal/detail) hackathon, **Confidential Compute Apps** track.

| | |
|---|---|
| **Live demo** | **[privex-agent.vercel.app](https://privex-agent.vercel.app)** — open it and click *Try it in demo mode*; no wallet needed, nothing is broadcast |
| **Network** | Flare Testnet (Coston2), chain ID `114` |
| **Contract** | [`0x21e908dc15cb5Dbd659f107DC0058Fe2D762E385`](https://coston2-explorer.flare.network/address/0x21e908dc15cb5Dbd659f107DC0058Fe2D762E385) |
| **Deploy tx** | [`0x7b83ffe3ef99d2a660f200f70e72bac487c78285daabc98fe34c1b9c72234883`](https://coston2-explorer.flare.network/tx/0x7b83ffe3ef99d2a660f200f70e72bac487c78285daabc98fe34c1b9c72234883) |
| **Stack** | Next.js 16 (App Router) · TypeScript · Tailwind v4 · wagmi v3 + viem · Solidity 0.8.20 · Hardhat 3 |

---

## The problem

To get useful portfolio advice from an AI, you normally have to hand over the thing you least want to share: your balances, your net worth, and your strategy. Today that means pasting them into a prompt, where they become training data, log lines, and a permanent record on somebody else's infrastructure.

The blockchain half is no better. Recording a rebalancing decision on-chain usually means publishing amounts and positions to anyone who cares to index them.

So users face a bad trade: **useful advice, or privacy — pick one.**

## The solution

This agent separates the three jobs that are normally fused into one prompt:

1. **The language model interprets, and only interprets.** It turns *"keep my XRP exposure under 40%"* into a structured, schema-validated intent. It never sees your balances, never produces a number that reaches the chain, and is structurally incapable of emitting an address, calldata, or a signature.
2. **A deterministic risk engine decides.** Plain, testable arithmetic evaluates your portfolio against the rule. A hallucination cannot change a percentage, because the model is not in this path.
3. **You approve, and your own wallet signs.** The contract is an audit log with no transfer path — it cannot hold, move, or spend anything.

What actually lands on-chain is deliberately thin: action type, asset symbol, target basis points, and a hash of the recommendation. **No amounts, no totals, no strategy.**

---

## Why Flare

- **Confidential Compute** is the reason this product can exist. The risk evaluation is the one step that must see real balances, and it is the one step designed to run inside a TEE rather than in a prompt or a public contract. The whole architecture is built around that boundary. *(See [Honest status](#honest-status) — the enclave execution itself is not yet live.)*
- **Coston2** hosts the on-chain audit trail, giving a verifiable record of approved decisions without publishing the financial data behind them.
- **FAssets / XRPFi context** — the supported-asset allowlist covers `XRP`, `FXRP`, `FLR`, `WFLR`, `C2FLR`, `USDC`, `USDT`, so the same flow extends naturally to bridged XRP positions on Flare.

---

## Architecture

```
Browser (Next.js client)
   │  natural-language instruction
   ▼
/api/ai/parse-intent ──► AIProvider (OpenRouter | OpenAI | Gemini)
   │                        └─ output validated with Zod, rejected if malformed
   ▼  FinancialIntent { asset, maxExposure, riskProfile, action }
/api/portfolio/analyze ──► ConfidentialComputeProvider
   │                        ├─ DevConfidentialProvider    (local mock)
   │                        └─ FlareConfidentialProvider  (TEE adapter — stub)
   ▼  RiskAnalysis (verdict only; balances never returned)
/api/recommendation ──► deterministic risk engine
   ▼  Recommendation
User approval modal  ──► shows contract, function, asset, bps, raw calldata
   ▼
/api/execute ──► encodes recordAction() calldata (server owns the mapping)
   ▼
User's wallet signs ──► PortfolioActionAgent.sol on Coston2
   ▼
Transaction receipt + explorer link
```

The client never fabricates what gets written: `/api/execute` owns the action→enum and exposure→basis-points mapping, and returns unsigned calldata that only the user's wallet can broadcast.

### Layout

```
contracts/          PortfolioActionAgent.sol, deploy script, Hardhat tests
src/app/            Landing (/), dashboard (/dashboard), API routes
src/lib/ai/         Provider abstraction + system prompt + Zod schemas
src/lib/privacy/    ConfidentialComputeProvider interface + two implementations
src/lib/risk/       Deterministic risk engine (no LLM involvement)
src/lib/blockchain/ Chain config, contract ABI, wagmi config
src/components/     UI (agent console, portfolio, enclave, approval, timeline)
src/hooks/          useFinancialAgent — orchestrates the whole journey
```

---

## The smart contract

`PortfolioActionAgent.sol` is intentionally small and holds no funds.

| Safety property | How it is enforced |
|---|---|
| Cannot move funds | No `transfer`, no `payable`, no token approvals anywhere in the contract |
| Asset allowlist | `recordAction` reverts with `UnsupportedAsset` for anything not pre-registered |
| Bounded exposure | Reverts with `InvalidExposure` above `10000` bps (100%) |
| Anti-spam | Reverts with `TooManyActions` past `MAX_ACTIONS_PER_USER` (100) |
| Ownership | `cancelAction` reverts with `NotActionOwner` for anyone but the recorder |
| No sensitive storage | Only action type, asset, target bps, timestamp, and a recommendation hash |

**Tests: 15/15 passing** (`npx hardhat test`) covering recording, allowlist rejection, exposure bounds, per-user tracking, ownership, the action limit, and boundary values at 0% and 100%.

---

## Honest status

This section exists because the project's own engineering rules require it, and because a privacy product that overstates its guarantees is worse than one that admits its gaps.

### Real, working, verifiable
- End-to-end flow from natural language to a signed Coston2 transaction.
- Contract deployed and live on Coston2 (address above); `getSupportedAssets()` returns all seven assets on-chain.
- LLM intent parsing with strict Zod validation — malformed or unsafe output is rejected, not patched.
- Deterministic risk engine, independent of the model and unit-testable.
- Non-custodial by construction: every write requires a signature from the user's own wallet.
- Minimal on-chain footprint: no amounts, no totals, no strategy.
- Demo mode that runs the entire journey with no wallet and broadcasts nothing.

### Not real yet — stated plainly
- **The confidential enclave does not execute in a TEE.** Both providers currently compute locally. `DevConfidentialProvider` is an explicit mock; `FlareConfidentialProvider` is an adapter stub that falls back to local execution and **returns no attestation**. The UI marks every such run as `simulated` and says so on screen regardless of which provider is selected — choosing `flare-fcc` does not buy a green badge.
- **Portfolio data is demo data.** `getPortfolio()` returns a fixed sample portfolio. The interface is ready for real on-chain indexing; the indexer is not built.
- **Recording an action is not a trade.** The contract writes an audit entry. It does not swap, rebalance, or move any asset.
- **`cancelAction` is currently unreachable.** `recordAction` stores actions as `EXECUTED`, so the `PENDING` state never occurs and every cancel attempt reverts with `ActionAlreadyFinalized`. The test suite documents this rather than hiding it. Fixing it means storing `PENDING` and adding a separate finalisation step.
- **No rate limiting** on the AI endpoint yet.
- This is a **testnet prototype**, and **nothing here is financial advice**.

---

## Running it locally

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

Open the app and use **demo mode** — no wallet required, nothing is broadcast.

### Environment variables

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | `openrouter` (default), `openai`, or `gemini` |
| `OPENROUTER_API_KEY` | Server-side only; never exposed to the browser |
| `OPENROUTER_MODEL` | Defaults to `google/gemini-2.5-flash` |
| `CONFIDENTIAL_MODE` | `development` (mock) or `flare-fcc` (adapter stub) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed `PortfolioActionAgent` address |
| `NEXT_PUBLIC_FLARE_TESTNET_RPC` | Coston2 RPC endpoint |
| `DEPLOYER_PRIVATE_KEY` | Deployment only. **Never commit this** — `.env.local` is gitignored |

### Contracts

```bash
npx hardhat test                                              # 15 passing
npx hardhat run contracts/scripts/deploy.ts --network coston2
```

> **Hardhat 3 note:** this project uses Hardhat 3, which ships no dotenv and exposes `ethers` on a network connection rather than the `hardhat` module. `hardhat.config.ts` calls `process.loadEnvFile('.env.local')` explicitly, and scripts use `hre.network.create(...)`. Hardhat 2 idioms will fail here.

Get testnet C2FLR from the [Coston2 faucet](https://faucet.flare.network/coston2).

---

## Two-minute demo

Hosted at **[privex-agent.vercel.app](https://privex-agent.vercel.app)** — no install required.

1. Open `/` — the landing page states the privacy claim and its limits.
2. Click **Try it in demo mode** → `/dashboard`.
3. The demo portfolio loads: **$5,000** — XRP 60%, FXRP 30%, C2FLR 10%.
4. Send: *"Keep my XRP exposure under 40%"*.
5. Watch the intent get parsed into `{ asset: XRP, maxExposure: 0.4, riskProfile: MEDIUM, action: REBALANCE }`, shown as chips so a misreading is caught before anything proceeds.
6. The enclave panel runs and reports **limit breach detected** — 60% against a 40% cap, delta −20% — with the simulation notice visible.
7. The recommendation card proposes the rebalance. Click **Review & approve**.
8. The approval modal shows the exact contract, function signature, asset, `4000` bps, signer, and expandable raw calldata — plus what is *not* being sent.
9. Confirm. In live mode your wallet signs and the receipt links to the Coston2 explorer.

Switch **Demo → Live** in the header, connect a Coston2-funded wallet, and step 9 writes a real transaction.

---

## Roadmap

1. **Replace the enclave stub with real Flare Confidential Compute**, returning a genuine hardware attestation that the UI can verify — the single highest-value next step.
2. **Real portfolio indexing** to replace demo data, behind the existing `getPortfolio()` interface.
3. **Fix the action lifecycle** so `PENDING → EXECUTED / CANCELLED` is reachable and `cancelAction` works.
4. **FTSO price feeds** to value positions from live oracle data rather than static figures.
5. **FDC attestations** to prove off-chain portfolio state at the moment a decision was made.
6. **Rate limiting and replay protection** on the AI and approval endpoints.

---

## License

MIT
