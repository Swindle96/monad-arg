export type PuzzleCategory =
  | "Blockchain Fundamentals"
  | "Cryptography"
  | "EVM Deep Dive"
  | "DeFi"
  | "Monad Architecture"
  | "Bitcoin & Tokens"
  | "Security & Keys"
  | "Cipher Puzzles"
  | "Core Properties";

export interface PuzzleMeta {
  id: number;
  category: PuzzleCategory;
  description: string;
}

// Descriptions only — answers are never stored client-side.
// All 100 puzzles, indexed by puzzle ID (0-based, matches on-chain puzzleId).
export const PUZZLE_META: PuzzleMeta[] = [
  // ── Blockchain Fundamentals (0-14) ──────────────────────────────────────────
  { id: 0,  category: "Blockchain Fundamentals", description: "The pseudonymous creator of Bitcoin. Their true identity has never been proven. What is their first name?" },
  { id: 1,  category: "Blockchain Fundamentals", description: "A number used exactly once. Miners brute-force billions of these per second trying to produce a valid block hash." },
  { id: 2,  category: "Blockchain Fundamentals", description: "The very first block in a blockchain. It has no parent. What is it called?" },
  { id: 3,  category: "Blockchain Fundamentals", description: "A fixed-length cryptographic fingerprint of arbitrary data. It is the glue that chains blocks together." },
  { id: 4,  category: "Blockchain Fundamentals", description: "A binary tree where leaf nodes are transaction hashes and parent nodes hash their children. Used to prove transaction inclusion efficiently." },
  { id: 5,  category: "Blockchain Fundamentals", description: "Software that stores your cryptographic keys and signs transactions. Without it you cannot interact with the blockchain." },
  { id: 6,  category: "Blockchain Fundamentals", description: "12 or 24 randomly chosen words that can regenerate your entire cryptographic key hierarchy. Lose this and lose everything." },
  { id: 7,  category: "Blockchain Fundamentals", description: "A unit of computational work on the EVM. Every opcode costs some amount. Run out and the transaction reverts." },
  { id: 8,  category: "Blockchain Fundamentals", description: "One billionth of an Ether (10^9 wei). The standard denomination for transaction fees." },
  { id: 9,  category: "Blockchain Fundamentals", description: "The smallest indivisible unit of Ether. One ETH equals exactly 10^18 of these." },
  { id: 10, category: "Blockchain Fundamentals", description: "A backward-incompatible protocol upgrade. Nodes that refuse to upgrade diverge onto a permanent separate chain." },
  { id: 11, category: "Blockchain Fundamentals", description: "The staging area where valid but unconfirmed transactions wait. Miners and bots watch this pool for opportunity." },
  { id: 12, category: "Blockchain Fundamentals", description: "A fixed time period in Proof of Stake Ethereum. It consists of 32 slots, each exactly 12 seconds long." },
  { id: 13, category: "Blockchain Fundamentals", description: "In Proof of Stake, this node proposes blocks and attests to others. Requires exactly 32 ETH staked as collateral." },
  { id: 14, category: "Blockchain Fundamentals", description: "The act of locking up cryptocurrency to participate in network consensus and earn protocol rewards in return." },

  // ── Cryptography (15-24) ────────────────────────────────────────────────────
  { id: 15, category: "Cryptography", description: "Ethereum uses this hash function, a variant of SHA-3 developed before the NIST standard was finalized. Outputs 256 bits." },
  { id: 16, category: "Cryptography", description: "Elliptic Curve Digital Signature Algorithm. The signing scheme that authorizes every Ethereum transaction." },
  { id: 17, category: "Cryptography", description: "The specific elliptic curve used by both Bitcoin and Ethereum for key generation. Its equation is y² = x³ + 7." },
  { id: 18, category: "Cryptography", description: "A measure of unpredictability or randomness. Insufficient amounts during key generation make your private key vulnerable." },
  { id: 19, category: "Cryptography", description: "The original input that produces a given hash output. Finding it for a cryptographically secure function is infeasible." },
  { id: 20, category: "Cryptography", description: "When two distinct inputs produce the same hash output. A secure hash function must make finding one computationally impossible." },
  { id: 21, category: "Cryptography", description: "Random data mixed with a password before hashing. Ensures identical passwords produce different hash values." },
  { id: 22, category: "Cryptography", description: "A precomputed lookup table mapping hash outputs back to their original inputs. Defeated by adding a salt." },
  { id: 23, category: "Cryptography", description: "A signature scheme adopted in Bitcoin's Taproot upgrade. More efficient and privacy-preserving than ECDSA." },
  { id: 24, category: "Cryptography", description: "A cryptographic proof that demonstrates knowledge of a secret without revealing anything about the secret itself." },

  // ── EVM Deep Dive (25-39) ───────────────────────────────────────────────────
  { id: 25, category: "EVM Deep Dive", description: "A single instruction executed by the Ethereum Virtual Machine. ADD, PUSH1, SLOAD, and JUMP are all examples." },
  { id: 26, category: "EVM Deep Dive", description: "The raw input bytes sent with a transaction or contract call. It encodes the function selector and its arguments." },
  { id: 27, category: "EVM Deep Dive", description: "The persistent key-value store in a smart contract. A single write costs 20,000+ gas. Persists across calls forever." },
  { id: 28, category: "EVM Deep Dive", description: "Temporary byte-array space available during EVM execution. It is wiped after the call ends and is cheaper than storage." },
  { id: 29, category: "EVM Deep Dive", description: "The EVM executes all arithmetic on this last-in-first-out data structure. Max depth 1024. Each slot is 256 bits wide." },
  { id: 30, category: "EVM Deep Dive", description: "Application Binary Interface. Defines how to encode function calls and decode return values for smart contracts." },
  { id: 31, category: "EVM Deep Dive", description: "The first 4 bytes of keccak256(function_signature). The EVM uses this to route calls to the correct function." },
  { id: 32, category: "EVM Deep Dive", description: "A contract mechanism for broadcasting information. Stored in transaction logs. Indexed and queryable off-chain." },
  { id: 33, category: "EVM Deep Dive", description: "A Solidity keyword that wraps function logic with reusable preconditions. The onlyOwner pattern uses this." },
  { id: 34, category: "EVM Deep Dive", description: "A Solidity data structure for O(1) key-value lookups. It cannot be iterated. Unset keys return the zero value." },
  { id: 35, category: "EVM Deep Dive", description: "Write raw EVM bytecode instructions inline inside a Solidity contract using this block-level keyword." },
  { id: 36, category: "EVM Deep Dive", description: "Execute another contract's code while maintaining your own storage context and msg.sender. Proxy patterns depend on this." },
  { id: 37, category: "EVM Deep Dive", description: "An EVM call type that cannot modify state. Any attempt to SSTORE inside one causes the entire call to revert." },
  { id: 38, category: "EVM Deep Dive", description: "Halt execution and undo all state changes from this call. Returns remaining gas (post EIP-140)." },
  { id: 39, category: "EVM Deep Dive", description: "EVM opcode that returns the size of an address's deployed bytecode. Returns 0 for externally owned accounts." },

  // ── DeFi (40-49) ────────────────────────────────────────────────────────────
  { id: 40, category: "DeFi", description: "What automated market makers require from depositors to function. Providers earn a share of every trading fee." },
  { id: 41, category: "DeFi", description: "The difference between the expected execution price and the actual price. Grows as trade size increases relative to pool depth." },
  { id: 42, category: "DeFi", description: "Borrow any amount from a lending protocol with zero collateral — as long as you repay it within the same transaction." },
  { id: 43, category: "DeFi", description: "A data feed that bridges real-world information to smart contracts. Chainlink is the dominant provider of this." },
  { id: 44, category: "DeFi", description: "Exploiting price differences between two or more markets for risk-free profit. In crypto, bots execute this in milliseconds." },
  { id: 45, category: "DeFi", description: "An MEV attack: buy before a large detected pending trade, then sell immediately after it executes at a higher price." },
  { id: 46, category: "DeFi", description: "Copy a profitable pending transaction from the mempool and resubmit it with higher gas to execute it first." },
  { id: 47, category: "DeFi", description: "A smart contract that holds assets and automatically executes yield-generating strategies on behalf of depositors." },
  { id: 48, category: "DeFi", description: "The return generated on deposited or staked assets. Typically expressed as an annual percentage rate." },
  { id: 49, category: "DeFi", description: "Maximal Extractable Value. Profit miners or validators capture by reordering, including, or excluding transactions." },

  // ── Monad Architecture (50-59) ──────────────────────────────────────────────
  { id: 50, category: "Monad Architecture", description: "A high-performance EVM-compatible Layer 1 with parallel transaction execution. This entire ARG runs on its testnet." },
  { id: 51, category: "Monad Architecture", description: "Monad executes transactions this way — concurrently, not sequentially. This is the core innovation enabling 10,000 TPS." },
  { id: 52, category: "Monad Architecture", description: "Monad's block processing technique inspired by CPU architecture: execution, consensus, and storage overlap simultaneously." },
  { id: 53, category: "Monad Architecture", description: "The current deployment phase of Monad. Free to use, not production-ready, and where this ARG is live." },
  { id: 54, category: "Monad Architecture", description: "Monad's signature brand color. Also the dominant hue of this interface and the glow behind every neon element." },
  { id: 55, category: "Monad Architecture", description: "Monad delays state finalization until after speculative execution of multiple blocks. This describes that execution model." },
  { id: 56, category: "Monad Architecture", description: "The process by which distributed nodes agree on the canonical state of the chain. MonadBFT implements this." },
  { id: 57, category: "Monad Architecture", description: "Once achieved, a block cannot be reorganized or reverted. The ultimate goal of every consensus protocol." },
  { id: 58, category: "Monad Architecture", description: "In pre-Merge Ethereum, a valid block that was mined correctly but not included in the main chain. Also called an ommer." },
  { id: 59, category: "Monad Architecture", description: "A periodic state snapshot that allows nodes to sync from a trusted recent point rather than the genesis block." },

  // ── Bitcoin & Tokens (60-69) ────────────────────────────────────────────────
  { id: 60, category: "Bitcoin & Tokens", description: "The original cryptocurrency. Genesis block mined January 3, 2009, by Satoshi Nakamoto. Ticker: BTC." },
  { id: 61, category: "Bitcoin & Tokens", description: "Approximately every 4 years, Bitcoin's block reward is cut in half. This event drives supply scarcity." },
  { id: 62, category: "Bitcoin & Tokens", description: "In Proof of Work, this network parameter adjusts every 2016 blocks to maintain approximately 10-minute block times." },
  { id: 63, category: "Bitcoin & Tokens", description: "In Proof of Work, the block hash must numerically be less than this value. A lower value means a harder puzzle." },
  { id: 64, category: "Bitcoin & Tokens", description: "New cryptocurrency issued to miners or validators per block. For Bitcoin it started at 50 BTC and halves every 210,000 blocks." },
  { id: 65, category: "Bitcoin & Tokens", description: "The Ethereum standard for fungible tokens. Defines transfer, approve, transferFrom, and allowance functions." },
  { id: 66, category: "Bitcoin & Tokens", description: "The Ethereum standard for non-fungible tokens. Each token ID is unique and cannot be split. Used for NFTs." },
  { id: 67, category: "Bitcoin & Tokens", description: "The Ethereum standard for multi-token contracts. Handles fungible and non-fungible tokens in a single deployment." },
  { id: 68, category: "Bitcoin & Tokens", description: "A token designed to maintain a stable value, typically pegged 1:1 to USD. USDC and DAI are the largest examples." },
  { id: 69, category: "Bitcoin & Tokens", description: "Tokens that grant holders voting rights over protocol parameters, upgrades, and treasury decisions." },

  // ── Security & Keys (70-79) ─────────────────────────────────────────────────
  { id: 70, category: "Security & Keys", description: "An attack where a malicious contract re-enters the calling contract before balances are updated. Drained The DAO in 2016." },
  { id: 71, category: "Security & Keys", description: "A malicious exit where developers drain protocol liquidity and abandon the project. Also called an exit scam." },
  { id: 72, category: "Security & Keys", description: "A network attack where one entity creates many fake identities to gain disproportionate influence. Named after a 1973 novel." },
  { id: 73, category: "Security & Keys", description: "A network attack isolating a specific node by controlling all of its peers, cutting it off from the honest network." },
  { id: 74, category: "Security & Keys", description: "A secret 256-bit number that is the root of your blockchain identity. Anyone who has it controls your funds forever." },
  { id: 75, category: "Security & Keys", description: "Derived from the private key via elliptic curve multiplication. Can be shared freely. Used to verify signatures." },
  { id: 76, category: "Security & Keys", description: "A cryptographic proof that a specific private key signed a specific message. In Ethereum it has components r, s, and v." },
  { id: 77, category: "Security & Keys", description: "The last 20 bytes of keccak256(public_key). Your on-chain identity. Always starts with 0x on Ethereum." },
  { id: 78, category: "Security & Keys", description: "The compiled low-level instructions deployed on-chain when you publish a smart contract. Stored at the contract address." },
  { id: 79, category: "Security & Keys", description: "A contract pattern that delegates all calls to an implementation contract. Enables upgradeable smart contracts." },

  // ── Cipher Puzzles (80-89) ──────────────────────────────────────────────────
  { id: 80, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Decode the following hexadecimal string to reveal a core blockchain unit. Hex: 0x424c4f434b" },
  { id: 81, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Decode the following hexadecimal string to reveal what links blocks together. Hex: 0x434841494e" },
  { id: 82, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Convert each binary byte to ASCII to find a participant in the P2P network. Binary: 01001110 01001111 01000100 01000101" },
  { id: 83, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Apply ROT13 to decode this string. The answer is what you write smart contracts in. Encoded: PBQR" },
  { id: 84, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Each letter is shifted +3 in the alphabet (Caesar cipher). Decode to find what validators do with ETH. Encoded: VWDNH" },
  { id: 85, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Reverse this string to reveal the smart contract development framework used in this project. Reversed: EGROF" },
  { id: 86, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Unscramble this anagram to find a node type that forwards transactions between networks. Anagram: EARLY" },
  { id: 87, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Convert these ASCII decimal codes to characters to reveal a blockchain split event. Codes: 70 79 82 75" },
  { id: 88, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Decode the Morse code to find the blockchain synonym for an immutable record book. Morse: .-.. . -.. --. . .-." },
  { id: 89, category: "Cipher Puzzles", description: "CIPHER CHALLENGE — Reverse this string to find the entity that secures a Proof of Work blockchain. Reversed: RENIM" },

  // ── Core Properties (90-99) ─────────────────────────────────────────────────
  { id: 90, category: "Core Properties", description: "Smart contracts cannot be altered after deployment. This single adjective describes that foundational property." },
  { id: 91, category: "Core Properties", description: "You do not need to trust a counterparty — cryptographic math and code enforce the rules. This adjective describes that property." },
  { id: 92, category: "Core Properties", description: "Anyone can use the network, deploy contracts, or submit transactions without requesting access from any authority." },
  { id: 93, category: "Core Properties", description: "DeFi protocols can be combined like building blocks. A single atomic transaction can touch a flash loan, a DEX, and a vault." },
  { id: 94, category: "Core Properties", description: "Every transaction and every byte of contract code is visible on the blockchain to any observer in the world." },
  { id: 95, category: "Core Properties", description: "Blockchains are designed to resist this — the act of selectively blocking or delaying specific transactions." },
  { id: 96, category: "Core Properties", description: "No single server, company, or authority controls the network. Thousands of independent nodes collectively hold the state." },
  { id: 97, category: "Core Properties", description: "The EVM always produces the same output for the same input, on every node, everywhere. This single adjective describes it." },
  { id: 98, category: "Core Properties", description: "The core consensus problem in distributed systems: reaching agreement even when some participants actively lie or fail. Adjective form." },
  { id: 99, category: "Core Properties", description: "FINAL PUZZLE — The Russian-Canadian prodigy who conceived Ethereum at age 19 and published its whitepaper in 2013. First name only." },
];

export const PUZZLE_COUNT = PUZZLE_META.length; // 100

export const CATEGORY_COLORS: Record<PuzzleCategory, string> = {
  "Blockchain Fundamentals": "#6E54FF",
  "Cryptography":            "#FF8EE4",
  "EVM Deep Dive":           "#85E6FF",
  "DeFi":                    "#FFAE45",
  "Monad Architecture":      "#A78BFA",
  "Bitcoin & Tokens":        "#F97316",
  "Security & Keys":         "#EF4444",
  "Cipher Puzzles":          "#10B981",
  "Core Properties":         "#F59E0B",
};

export function getPuzzleMeta(id: number): PuzzleMeta | undefined {
  return PUZZLE_META[id];
}

export function getPuzzlesByCategory(category: PuzzleCategory): PuzzleMeta[] {
  return PUZZLE_META.filter((p) => p.category === category);
}
