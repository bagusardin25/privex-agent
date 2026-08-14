You are the lead engineer responsible for building a hackathon-ready MVP called "Private AI Financial Agent" for the Flare Summer Signal hackathon.

Your goal is NOT to build a huge production system. Your goal is to build a polished, functional vertical slice that clearly demonstrates why Flare Confidential Compute is essential to the product.

==================================================
1. PRODUCT VISION
==================================================

Build a web application where users can connect a wallet, describe their financial preferences in natural language, privately analyze their portfolio, receive an AI-assisted recommendation, approve the recommendation, and execute the resulting action through a Flare smart contract.

Core product statement:

"An AI financial agent that can understand your financial preferences, privately analyze your portfolio, and execute approved financial actions on Flare without exposing sensitive financial information."

Example user instruction:

"Keep my XRP exposure below 40% and maintain a low-risk portfolio."

The application should understand this instruction, convert it into structured rules, privately evaluate the user's portfolio against those rules, generate a recommendation, ask the user for approval, and execute the approved action.

The product must make the privacy aspect obvious during the demo.

==================================================
2. IMPORTANT PRODUCT PRINCIPLES
==================================================

1. The LLM must NOT directly control the user's funds.

2. The LLM only interprets natural-language instructions and produces structured intent/rules.

3. A deterministic risk/recommendation engine evaluates the rules against portfolio data.

4. Sensitive portfolio information should be processed inside the intended confidential execution boundary wherever supported by the Flare Confidential Compute architecture.

5. The user must explicitly approve a financial action before execution.

6. Smart contracts must enforce basic safety constraints.

7. Never implement arbitrary AI-generated transaction execution.

8. Never expose private portfolio information unnecessarily in frontend logs, backend logs, blockchain events, or public responses.

9. The MVP must work end-to-end on Flare testnet.

10. Prefer a small number of fully working features over many incomplete features.

==================================================
3. TARGET USER FLOW
==================================================

Implement this exact primary flow:

STEP 1 — Landing page

Show:

Private AI Financial Agent

"Manage your portfolio with AI.
Keep your financial strategy private."

Primary CTA:

"Launch App"

Explain in simple language:

- Tell the agent your financial goal.
- Your private financial rules are analyzed confidentially.
- Review the recommendation.
- Approve the action.
- Execute on Flare.

Do not use excessive blockchain jargon.

--------------------------------------------------
STEP 2 — Connect Wallet
--------------------------------------------------

User connects an EVM-compatible wallet.

Target network:

Flare Testnet.

Display:

Wallet address
Network
Current testnet balance

Provide:

Connect Wallet
Disconnect Wallet
Switch Network

Do not require the user to manually configure complicated blockchain settings.

--------------------------------------------------
STEP 3 — Portfolio Dashboard
--------------------------------------------------

Create a clean financial dashboard.

Display example/demo portfolio:

Total Portfolio Value
XRP exposure
FXRP exposure
Cash balance
Risk profile

Example:

Portfolio Value
$5,000

XRP
60%

FXRP
30%

Cash
10%

Risk Profile
Low

IMPORTANT:

For the hackathon MVP, if live wallet asset indexing is too complex, implement a clearly labeled DEMO PORTFOLIO mode.

The demo must still be architecturally ready to replace demo data with real on-chain data later.

Do NOT fake blockchain transactions.

--------------------------------------------------
STEP 4 — AI INSTRUCTION
--------------------------------------------------

Provide a chat-style interface.

Example:

User:

"Keep my XRP exposure below 40% and maintain a low-risk portfolio."

The LLM should convert this into structured output.

Example:

{
  "asset": "XRP",
  "maxExposure": 0.40,
  "riskProfile": "LOW",
  "action": "REBALANCE"
}

Use structured JSON/schema validation.

Never trust arbitrary free-form LLM output.

Validate the result using a schema library such as Zod.

The LLM should NOT generate Solidity code.

The LLM should NOT generate arbitrary transaction calldata.

The LLM should NOT determine the final transaction destination.

--------------------------------------------------
STEP 5 — PRIVATE ANALYSIS
--------------------------------------------------

After the user instruction is parsed, evaluate the portfolio against the user's rules.

Example:

Portfolio:

XRP = 60%
FXRP = 30%
Cash = 10%

User rule:

XRP <= 40%

Result:

Current XRP exposure: 60%
Maximum allowed: 40%

Recommendation:

Reduce XRP exposure by approximately 20 percentage points.

The UI should communicate:

"Your portfolio is being analyzed privately."

Then show a clear privacy indicator.

Example:

PRIVATE ANALYSIS
Sensitive portfolio data is processed inside the confidential execution environment.

Do not claim stronger privacy guarantees than the actual implementation provides.

If a true Flare Confidential Compute integration is unavailable in the current local development environment, create a clean abstraction/interface for it and implement a development/mock provider.

Clearly label mock mode.

Do NOT pretend the mock implementation is real TEE execution.

--------------------------------------------------
STEP 6 — AI RECOMMENDATION
--------------------------------------------------

Show a recommendation card.

Example:

Portfolio Risk
HIGH

Issue detected:

XRP represents 60% of your portfolio.
Your maximum allowed exposure is 40%.

Recommended action:

Reduce XRP exposure to approximately 40%.

Expected result:

XRP exposure: ~40%
Risk profile: LOW

Buttons:

[Approve Action]

[Reject]

Do not automatically execute anything.

--------------------------------------------------
STEP 7 — USER APPROVAL
--------------------------------------------------

When the user clicks Approve Action:

Show a confirmation modal.

Example:

You are about to:

Reduce XRP exposure
Target exposure: 40%

Network:
Flare Testnet

Estimated transaction:
...

Buttons:

Cancel
Confirm & Execute

The user must explicitly confirm.

--------------------------------------------------
STEP 8 — BLOCKCHAIN EXECUTION
--------------------------------------------------

After confirmation:

Call a Solidity smart contract deployed on Flare Testnet.

The contract should execute or record the approved action in a safe, deterministic way.

For the MVP, if actual token swapping introduces excessive complexity, implement a safe portfolio-action registry/rebalancing simulation that is genuinely written to the Flare testnet.

However, the UI must clearly distinguish:

"Executed on-chain"

from

"Simulation"

Never label a simulated action as a real trade.

If actual FXRP/XRP execution is feasible within the available Flare testnet infrastructure, prefer real testnet execution.

--------------------------------------------------
STEP 9 — RESULT
--------------------------------------------------

After successful transaction:

Show:

Action Executed

Status:
Confirmed

Transaction Hash:
0x...

Network:
Flare Testnet

Portfolio:

Before:
XRP 60%

After:
XRP 40%

Include a link to the appropriate Flare testnet block explorer.

==================================================
4. TECHNOLOGY STACK
==================================================

Frontend:

Next.js
TypeScript
App Router
Tailwind CSS
shadcn/ui

Backend:

Next.js server-side API routes or a small Node.js service.

Do not introduce a separate backend framework unless necessary.

Database:

PostgreSQL if persistent data is required.

Use Prisma only if it provides clear value.

AI:

Use an LLM API through a server-side adapter.

The architecture must make the model provider replaceable.

Create something similar to:

AIProvider
  ├── OpenAIProvider
  ├── GeminiProvider
  └── ClaudeProvider

Do not expose API keys to the browser.

Blockchain:

Solidity
Hardhat or Foundry
ethers.js or viem

Use the simplest reliable option.

Flare:

Flare Testnet
Flare Confidential Compute integration/adapter
FTSO where useful
FDC where useful

Wallet:

Use a modern EVM wallet connection library such as wagmi + viem if appropriate.

==================================================
5. ARCHITECTURE
==================================================

Use clear separation of concerns.

Suggested architecture:

frontend/
  app/
  components/
  hooks/
  lib/

backend/
  api/
  services/
  ai/
  privacy/
  portfolio/
  risk/

contracts/
  contracts/
  scripts/
  test/

shared/
  schemas/
  types/

Core flow:

Browser
  ↓
Next.js API
  ↓
AI Intent Parser
  ↓
Validated Financial Intent
  ↓
Private Portfolio Analysis
  ↓
Risk Engine
  ↓
Recommendation
  ↓
User Approval
  ↓
Smart Contract
  ↓
Flare Testnet
  ↓
Transaction Receipt

==================================================
6. AI ARCHITECTURE
==================================================

The LLM is an interpreter, NOT the financial authority.

Input:

"Keep my XRP exposure below 40% and maintain a low-risk portfolio."

Output:

{
  "asset": "XRP",
  "maxExposure": 0.40,
  "riskProfile": "LOW",
  "action": "REBALANCE"
}

Create a strict schema.

Reject:

- missing fields
- invalid percentages
- unknown assets
- unsafe instructions
- arbitrary transaction instructions
- contract addresses generated by the model
- calldata generated by the model

The model must never output:

contract addresses
private keys
raw transaction calldata
signatures
wallet credentials

==================================================
7. RISK ENGINE
==================================================

Implement deterministic logic.

Example:

if XRP exposure > maxExposure:
    recommendation = REBALANCE

Calculate:

currentExposure
targetExposure
difference
recommendedAction

Example:

current XRP = 60%
maximum XRP = 40%

difference = 20%

Recommendation:

REDUCE_XRP_EXPOSURE

The risk engine must be deterministic and testable independently of the LLM.

==================================================
8. CONFIDENTIAL COMPUTE ABSTRACTION
==================================================

Create an interface such as:

ConfidentialComputeProvider

with methods conceptually similar to:

analyzePortfolio()
evaluateRules()
generateAttestedResult()

Implement:

DevelopmentConfidentialProvider

and

FlareConfidentialProvider

The development provider can use local/mock execution.

The Flare provider should contain the real integration when technically possible.

IMPORTANT:

Never claim that local/mock execution is confidential compute.

The UI must show:

Development Mode
or
Flare Confidential Compute

depending on the active provider.

==================================================
9. SMART CONTRACT
==================================================

Create a minimal Solidity contract.

The contract should:

- record approved portfolio actions
- associate actions with user wallet
- prevent unauthorized callers where applicable
- emit clear events
- store action status
- include timestamps
- include an action identifier

Example conceptual structure:

PortfolioAction {
    user
    actionType
    asset
    targetExposure
    timestamp
    status
}

Do not put sensitive portfolio information into public contract storage.

Do not store:

income
total net worth
private risk profile
private strategy
private financial history

on-chain.

Only store the minimum information necessary for execution/verification.

==================================================
10. SECURITY
==================================================

Treat this as a financial application.

Implement:

- strict input validation
- schema validation
- server-side API key protection
- wallet ownership verification where appropriate
- replay protection for approvals
- transaction simulation before execution where feasible
- maximum action limits
- supported asset allowlist
- no arbitrary contract calls
- no arbitrary recipient addresses from LLM output
- no private key handling by backend
- no private key storage
- no automatic execution without user approval

Add rate limiting to AI endpoints if practical.

Do not log sensitive portfolio information.

==================================================
11. DATABASE
==================================================

Only store non-sensitive information required for the application.

Possible entities:

User
Wallet
AgentPreference
Action
Transaction

Do NOT persist sensitive financial data unless absolutely necessary.

If sensitive data must be temporarily processed, minimize retention.

==================================================
12. UI / UX
==================================================

The UI should look like a serious fintech product.

Avoid:

- excessive Web3 aesthetics
- neon colors everywhere
- meaningless blockchain terminology
- overly complicated dashboards
- dozens of cards

Prefer:

- clean typography
- clear hierarchy
- professional financial dashboard
- visible privacy state
- obvious action approval
- clear transaction status

Main screens:

1. Landing
2. Dashboard
3. AI Agent
4. Recommendation
5. Approval
6. Transaction Result

Create a polished demo state so the complete flow can be demonstrated quickly.

==================================================
13. DEMO MODE
==================================================

Implement a Demo Mode.

The demo should allow the evaluator to experience the entire flow without needing real assets.

Example:

Demo portfolio:

$5,000
XRP 60%
FXRP 30%
Cash 10%

User prompt:

"Keep XRP below 40% and maintain a low-risk portfolio."

Expected recommendation:

Reduce XRP exposure.

Then:

Approve

Then:

Execute on Flare Testnet.

The demo must clearly distinguish simulated portfolio data from real blockchain execution.

==================================================
14. OBSERVABILITY
==================================================

Create a simple activity timeline.

Example:

1. Instruction received
2. Intent parsed
3. Private analysis completed
4. Recommendation generated
5. User approved
6. Transaction submitted
7. Transaction confirmed

Do not expose confidential information in the timeline.

==================================================
15. TESTING
==================================================

Write tests for:

AI output schema validation
Risk engine
Portfolio calculations
Approval flow
Smart contract
Unauthorized actions
Invalid percentages
Unsupported assets

At minimum, the core financial logic and smart contract must have automated tests.

==================================================
16. DOCUMENTATION
==================================================

Create a high-quality README containing:

Project name
Problem
Solution
Why Flare
Architecture
Technology stack
How Confidential Compute is used
How AI is used
How the smart contract is used
Local development
Environment variables
Testnet deployment
Demo instructions
Known limitations

Clearly distinguish:

REAL IMPLEMENTATION

from

MOCK/DEVELOPMENT IMPLEMENTATION.

Never exaggerate technical capabilities.

==================================================
17. DEVELOPMENT STRATEGY
==================================================

Work incrementally.

First inspect the existing repository.

Do NOT immediately rewrite the entire project.

Determine:

- current framework
- existing files
- package manager
- existing dependencies
- existing Flare integration
- existing smart contracts
- environment configuration

Then propose the minimum implementation plan.

Implement in this order:

PHASE 1
Project structure + UI shell

PHASE 2
Wallet connection

PHASE 3
Demo portfolio

PHASE 4
AI natural-language intent parser

PHASE 5
Risk engine

PHASE 6
Confidential Compute abstraction

PHASE 7
Solidity contract

PHASE 8
Flare Testnet deployment

PHASE 9
End-to-end approval + execution

PHASE 10
Testing

PHASE 11
Polish

PHASE 12
README + demo preparation

After each major phase, verify that the project builds and tests pass.

Do not leave broken code behind.

==================================================
18. HACKATHON PRIORITY
==================================================

Prioritize these five things:

1. A working end-to-end demo.

2. Meaningful Flare integration.

3. A credible Confidential Compute use case.

4. Clear privacy explanation.

5. Excellent 2-minute demonstration experience.

Do NOT waste time implementing:

- social features
- complex authentication
- mobile app
- advanced portfolio analytics
- dozens of financial assets
- complicated trading strategies
- production-grade multi-chain indexing
- unnecessary microservices

==================================================
19. 2-MINUTE DEMO TARGET
==================================================

The finished product must support this exact demonstration:

1. Connect wallet.
2. Show portfolio.
3. User enters:

"Keep my XRP exposure below 40% and maintain a low-risk portfolio."

4. AI interprets the instruction.
5. Show private analysis state.
6. Show recommendation.
7. User clicks Approve.
8. User confirms transaction.
9. Transaction executes on Flare Testnet.
10. Show transaction hash.
11. Show final portfolio/action state.
12. Explain that sensitive financial logic is processed confidentially rather than being exposed publicly.

The entire flow should be fast enough to demonstrate within approximately two minutes.

==================================================
20. ENGINEERING RULE
==================================================

When there are multiple implementation choices, choose the simplest one that:

- actually works
- can be demonstrated
- has clear Flare relevance
- is technically honest
- can be completed reliably within a hackathon

Do not over-engineer.

Do not invent Flare APIs.

Before implementing a Flare-specific feature, inspect the currently available official Flare documentation and SDK/API interfaces.

If an intended Flare Confidential Compute feature cannot be integrated reliably, create an explicit adapter and document the limitation rather than fabricating an integration.

==================================================
21. FIRST TASK
==================================================

Before writing substantial code:

1. Inspect the repository.
2. Identify the current stack.
3. Identify what already exists.
4. Identify missing components.
5. Produce a concise implementation plan.
6. Then begin implementation.

Do not ask unnecessary questions if reasonable defaults can be made.

Make reasonable engineering decisions autonomously.

The final result should be a polished hackathon MVP, not a toy tutorial project.