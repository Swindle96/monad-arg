export type PuzzleCategory =
  | "Monad Architecture"
  | "Monad Math"
  | "Monad Cryptography"
  | "Monad Economics"
  | "EVM & Solidity"
  | "Bitcoin & Ethereum"
  | "Pure Algorithms";

export interface PuzzleMeta {
  id: number;
  category: PuzzleCategory;
  description: string;
}

// Descriptions only — answers are never stored client-side.
// All 100 puzzles, indexed by puzzle ID (0-based, matches on-chain puzzleId).
export const PUZZLE_META: PuzzleMeta[] = [

  // ── Monad Architecture (0-14) ────────────────────────────────────────────────
  {
    id: 0,
    category: "Monad Architecture",
    description:
      "Monad testnet chain ID is 10143. Compute the sum of its decimal digits. Answer: integer.",
  },
  {
    id: 1,
    category: "Monad Architecture",
    description:
      "Monad chain ID 10143 factors as 3^2 x 7^2 x 23. Sum all unique prime factors (3, 7, 23). Answer: integer.",
  },
  {
    id: 2,
    category: "Monad Architecture",
    description:
      "Convert Monad chain ID 10143 to hexadecimal. Answer: uppercase hex string, no 0x prefix.",
  },
  {
    id: 3,
    category: "Monad Architecture",
    description:
      "Monad produces one block every 500 milliseconds. How many complete blocks are produced in exactly 24 hours? Answer: integer.",
  },
  {
    id: 4,
    category: "Monad Architecture",
    description:
      "Monad targets 10,000 TPS with a 500 ms block time. What is the maximum number of transactions per block? Answer: integer.",
  },
  {
    id: 5,
    category: "Monad Architecture",
    description:
      "MonadBFT requires floor(2/3 x N) + 1 validators for consensus. With N = 100 validators, what is the minimum quorum? Answer: integer.",
  },
  {
    id: 6,
    category: "Monad Architecture",
    description:
      "MonadBFT requires floor(2/3 x N) + 1 validators for consensus. With N = 150 validators, what is the minimum quorum? Answer: integer.",
  },
  {
    id: 7,
    category: "Monad Architecture",
    description:
      "Compute the sum of ASCII values of the string 'MONAD'. (M=77, O=79, N=78, A=65, D=68). Answer: integer.",
  },
  {
    id: 8,
    category: "Monad Architecture",
    description:
      "How many 1-bits are in the binary representation of Monad chain ID 10143? Vibe code it. Answer: integer.",
  },
  {
    id: 9,
    category: "Monad Architecture",
    description:
      "Monad uses a 4-phase execution pipeline: Propose, Execute, Commit, Persist. Compute 4 factorial (4!). Answer: integer.",
  },
  {
    id: 10,
    category: "Monad Architecture",
    description:
      "What is Monad chain ID 10143 modulo 256? Answer: integer.",
  },
  {
    id: 11,
    category: "Monad Architecture",
    description:
      "What is the floor of the square root of Monad chain ID 10143? Answer: integer.",
  },
  {
    id: 12,
    category: "Monad Architecture",
    description:
      "Compute 10143 squared, then take the result modulo 10000. Answer: integer.",
  },
  {
    id: 13,
    category: "Monad Architecture",
    description:
      "Sum the squares of each digit in Monad chain ID 10143: (1^2 + 0^2 + 1^2 + 4^2 + 3^2). Answer: integer.",
  },
  {
    id: 14,
    category: "Monad Architecture",
    description:
      "How many bits are needed to represent 10143 in binary? (length of its binary string). Answer: integer.",
  },

  // ── Monad Math (15-34) ──────────────────────────────────────────────────────
  {
    id: 15,
    category: "Monad Math",
    description:
      "Find the sum of all positive multiples of 7 that are less than or equal to 10143 (Monad chain ID). Vibe code it. Answer: integer.",
  },
  {
    id: 16,
    category: "Monad Math",
    description:
      "How many integers from 1 to 10143 are divisible by both 3 and 7 (i.e. divisible by 21)? Answer: integer.",
  },
  {
    id: 17,
    category: "Monad Math",
    description:
      "Reverse the decimal digits of Monad chain ID 10143. Answer: integer.",
  },
  {
    id: 18,
    category: "Monad Math",
    description:
      "Convert Monad chain ID 10143 to octal (base 8). Vibe code it. Answer: octal digits as string.",
  },
  {
    id: 19,
    category: "Monad Math",
    description:
      "Compute the Greatest Common Divisor of 10143 (Monad chain ID) and 10000 using the Euclidean algorithm. Answer: integer.",
  },
  {
    id: 20,
    category: "Monad Math",
    description:
      "Compute the Least Common Multiple of 10143 (Monad chain ID) and 500 (Monad block time in ms). Vibe code it. Answer: integer.",
  },
  {
    id: 21,
    category: "Monad Math",
    description:
      "Find the digital root of 10143: repeatedly sum its digits until a single digit remains. Answer: integer.",
  },
  {
    id: 22,
    category: "Monad Math",
    description:
      "Compute the sum of all even integers from 2 to 10142 (the largest even number less than or equal to Monad chain ID 10143). Vibe code it. Answer: integer.",
  },
  {
    id: 23,
    category: "Monad Math",
    description:
      "Monad block time is 500 ms. How many complete blocks are produced in exactly 1 hour (3,600,000 ms)? Answer: integer.",
  },
  {
    id: 24,
    category: "Monad Math",
    description:
      "Compute the bitwise XOR of 10143 (Monad chain ID) and 5000. Vibe code it. Answer: integer.",
  },
  {
    id: 25,
    category: "Monad Math",
    description:
      "Multiply 10143 (chain ID) by 500 (block time ms). Sum the decimal digits of that product. Answer: integer.",
  },
  {
    id: 26,
    category: "Monad Math",
    description:
      "Compute floor(10143 / 7). Answer: integer.",
  },
  {
    id: 27,
    category: "Monad Math",
    description:
      "Find the sum of all Fibonacci numbers that are less than or equal to 10143. (F1=1, F2=1, F3=2, ...). Vibe code it. Answer: integer.",
  },
  {
    id: 28,
    category: "Monad Math",
    description:
      "Compute the sum of all perfect squares from 1^2 to 100^2. Formula: n*(n+1)*(2n+1)/6 with n=100. Answer: integer.",
  },
  {
    id: 29,
    category: "Monad Math",
    description:
      "How many perfect squares (1, 4, 9, 16, ...) are less than or equal to Monad chain ID 10143? Answer: integer.",
  },
  {
    id: 30,
    category: "Monad Math",
    description:
      "Convert Monad chain ID 10143 to base 3 (ternary). Vibe code it. Answer: ternary digits as string.",
  },
  {
    id: 31,
    category: "Monad Math",
    description:
      "Find the 1-based index of the first Fibonacci number strictly greater than Monad chain ID 10143. (F1=1, F2=1, ...). Vibe code it. Answer: integer.",
  },
  {
    id: 32,
    category: "Monad Math",
    description:
      "Using the Sieve of Eratosthenes, find the sum of all prime numbers strictly less than 100. Vibe code it. Answer: integer.",
  },
  {
    id: 33,
    category: "Monad Math",
    description:
      "Compute the 10143rd triangular number: T(n) = n*(n+1)/2, where n = 10143. Vibe code it. Answer: integer.",
  },
  {
    id: 34,
    category: "Monad Math",
    description:
      "Compute the sum of all integers from 1 to 500 (Monad block time value in ms). Answer: integer.",
  },

  // ── Monad Cryptography (35-49) ──────────────────────────────────────────────
  {
    id: 35,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'monad' (all lowercase). Return the first 8 hex characters of the hash output. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 36,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'chain_detective'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 37,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'vibecode'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 38,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'monad:10143'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 39,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'parallel_evm'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 40,
    category: "Monad Cryptography",
    description:
      "Encode the string 'MONAD' as ASCII hexadecimal. Each character maps to its hex byte: M=4D, O=4F, N=4E, A=41, D=44. Concatenate all hex pairs. Answer: uppercase hex string, no spaces or 0x prefix.",
  },
  {
    id: 41,
    category: "Monad Cryptography",
    description:
      "Compute the sum of the ASCII decimal values of each character in 'ETH': E=69, T=84, H=72. Answer: integer.",
  },
  {
    id: 42,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'MonadBFT' (capital M, capital B, F, T). Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 43,
    category: "Monad Cryptography",
    description:
      "Encode the 3-character string 'MON' using standard Base64. Vibe code it. Answer: 4-character Base64 string.",
  },
  {
    id: 44,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'leaderboard'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 45,
    category: "Monad Cryptography",
    description:
      "The SHA-256 hash of the empty string '' starts with byte 0xe3. What is 0xe3 expressed as a decimal integer? Answer: integer.",
  },
  {
    id: 46,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'commit_reveal'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 47,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'season_01'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },
  {
    id: 48,
    category: "Monad Cryptography",
    description:
      "Monad chain ID 10143 in hex is 0x279F. XOR the two byte values 0x27 and 0x9F. Return the result as a decimal integer. Answer: integer.",
  },
  {
    id: 49,
    category: "Monad Cryptography",
    description:
      "Compute keccak256 of the UTF-8 string 'prize_pool'. Return the first 8 hex characters. Answer: 8 lowercase hex chars, no 0x prefix.",
  },

  // ── Monad Economics (50-59) ─────────────────────────────────────────────────
  {
    id: 50,
    category: "Monad Economics",
    description:
      "At 52 gwei per gas, 21000 gas per transaction, and 10,000 TPS, compute the total gwei burned in exactly 60 seconds. Vibe code it. Answer: integer.",
  },
  {
    id: 51,
    category: "Monad Economics",
    description:
      "Monad block time is 500 ms. How many seconds pass from block 0 until block 1,000,000 is produced? Answer: integer.",
  },
  {
    id: 52,
    category: "Monad Economics",
    description:
      "At 1 gwei per gas, 21000 gas per transaction, and 10,000 TPS, compute the total gwei collected as fees in exactly 24 hours (86,400 seconds). Vibe code it. Answer: integer.",
  },
  {
    id: 53,
    category: "Monad Economics",
    description:
      "Monad targets 10,000 transactions per second. How many transactions does it process in exactly 1 hour (3,600 seconds)? Answer: integer.",
  },
  {
    id: 54,
    category: "Monad Economics",
    description:
      "Monad produces 172,800 blocks per day. If each block averages 500 bytes, what is the total daily data in kilobytes? (1 KB = 1024 bytes, integer division). Answer: integer.",
  },
  {
    id: 55,
    category: "Monad Economics",
    description:
      "Monad processes 10,000 TPS. Ethereum L1 processes 15 TPS. How many more transactions does Monad handle in exactly 1 hour? Answer: integer.",
  },
  {
    id: 56,
    category: "Monad Economics",
    description:
      "Monad block time is 500 ms. After exactly 1,000 blocks, how many complete minutes have elapsed? Use floor division. Answer: integer.",
  },
  {
    id: 57,
    category: "Monad Economics",
    description:
      "Monad targets 10,000 TPS. Ethereum L1 achieves approximately 15 TPS. Compute floor(10000 / 15). Answer: integer.",
  },
  {
    id: 58,
    category: "Monad Economics",
    description:
      "Monad block time is 500 ms. How many seconds must you wait to receive exactly 100 block confirmations? Answer: integer.",
  },
  {
    id: 59,
    category: "Monad Economics",
    description:
      "Monad's parallel EVM uses 4 execution threads. If 12,000 transactions are split equally across all threads, how many does each thread process? Answer: integer.",
  },

  // ── EVM & Solidity (60-74) ──────────────────────────────────────────────────
  {
    id: 60,
    category: "EVM & Solidity",
    description:
      "What is the maximum value of a Solidity uint8? (2^8 - 1). Answer: integer.",
  },
  {
    id: 61,
    category: "EVM & Solidity",
    description:
      "What is the maximum value of a Solidity uint16? (2^16 - 1). Answer: integer.",
  },
  {
    id: 62,
    category: "EVM & Solidity",
    description:
      "An Ethereum address is 20 bytes. How many hexadecimal characters represent a full address, excluding the 0x prefix? Answer: integer.",
  },
  {
    id: 63,
    category: "EVM & Solidity",
    description:
      "A Solidity bytes32 value: how many hexadecimal characters does it occupy, excluding the 0x prefix? Answer: integer.",
  },
  {
    id: 64,
    category: "EVM & Solidity",
    description:
      "keccak256 produces a hash of N bits. What is N? Answer: integer.",
  },
  {
    id: 65,
    category: "EVM & Solidity",
    description:
      "The EVM stack has a maximum depth of 1024 slots, each 32 bytes wide. What is the total maximum stack size in bytes? Answer: integer.",
  },
  {
    id: 66,
    category: "EVM & Solidity",
    description:
      "A Solidity function selector is the first N bytes of keccak256(function_signature). What is N? Answer: integer.",
  },
  {
    id: 67,
    category: "EVM & Solidity",
    description:
      "Compute the function selector for 'transfer(address,uint256)': first 4 bytes of keccak256 of that exact string. Return as 8 lowercase hex characters, no 0x prefix. Vibe code it. Answer: 8 lowercase hex chars.",
  },
  {
    id: 68,
    category: "EVM & Solidity",
    description:
      "How many bytes does a Solidity uint256 occupy in a storage slot? Answer: integer.",
  },
  {
    id: 69,
    category: "EVM & Solidity",
    description:
      "The EVM opcode PUSH1 has the hex value 0x60. What is its decimal value? Answer: integer.",
  },
  {
    id: 70,
    category: "EVM & Solidity",
    description:
      "A transaction performs 10 warm SLOAD operations (800 gas each) and 5 warm SSTORE operations (100 gas each). What is the total gas cost for just these operations? Answer: integer.",
  },
  {
    id: 71,
    category: "EVM & Solidity",
    description:
      "Solidity packs variables into 32-byte slots when possible. If you declare 4 consecutive uint64 variables (each 8 bytes), how many 32-byte storage slots do they occupy? Answer: integer.",
  },
  {
    id: 72,
    category: "EVM & Solidity",
    description:
      "A transaction: 21,000 gas base fee + 10 non-zero calldata bytes (16 gas each) + 5 zero calldata bytes (4 gas each). What is the total gas cost? Answer: integer.",
  },
  {
    id: 73,
    category: "EVM & Solidity",
    description:
      "keccak256 of the empty string starts with byte 0xc5. What is the decimal value of 0xc5? Answer: integer.",
  },
  {
    id: 74,
    category: "EVM & Solidity",
    description:
      "The EVM word size is 32 bytes. How many complete 32-byte words fit inside exactly 1 kilobyte (1024 bytes)? Answer: integer.",
  },

  // ── Bitcoin & Ethereum (75-84) ──────────────────────────────────────────────
  {
    id: 75,
    category: "Bitcoin & Ethereum",
    description:
      "Bitcoin block reward started at 50 BTC. After the 4th halving it is 50 / 2^4 BTC. Express that value in satoshi (1 BTC = 100,000,000 satoshi). Answer: integer.",
  },
  {
    id: 76,
    category: "Bitcoin & Ethereum",
    description:
      "Ethereum targets a 12-second block time. How many complete blocks are produced in exactly 24 hours (86,400 seconds)? Answer: integer.",
  },
  {
    id: 77,
    category: "Bitcoin & Ethereum",
    description:
      "Bitcoin genesis block contained the message 'The Times 03/Jan/2009'. Count the exact number of characters in that string (no quotes). Answer: integer.",
  },
  {
    id: 78,
    category: "Bitcoin & Ethereum",
    description:
      "Bitcoin total supply is capped at 21,000,000 BTC. Express the entire supply in satoshi (1 BTC = 100,000,000 satoshi). Vibe code it. Answer: integer.",
  },
  {
    id: 79,
    category: "Bitcoin & Ethereum",
    description:
      "An Ethereum address string with the '0x' prefix has how many total characters? (2 prefix chars + 40 hex chars). Answer: integer.",
  },
  {
    id: 80,
    category: "Bitcoin & Ethereum",
    description:
      "SHA-256 produces a hash output of N bits. What is N? Answer: integer.",
  },
  {
    id: 81,
    category: "Bitcoin & Ethereum",
    description:
      "Bitcoin difficulty adjusts every 2,016 blocks. If miners find each block in exactly 10 minutes, how many hours does one full adjustment period last? Answer: integer.",
  },
  {
    id: 82,
    category: "Bitcoin & Ethereum",
    description:
      "A Merkle tree is built from 8 leaf nodes arranged in a complete binary tree. Count the total number of nodes (leaves + all internal nodes + root). Answer: integer.",
  },
  {
    id: 83,
    category: "Bitcoin & Ethereum",
    description:
      "EIP-1559 burns the base fee. If base fee = 10 gwei, each tx uses 21,000 gas, and a block contains 1,000 transactions, how many gwei are burned in that one block? Answer: integer.",
  },
  {
    id: 84,
    category: "Bitcoin & Ethereum",
    description:
      "Ethereum mainnet chain ID = 1. Ethereum Sepolia testnet chain ID = 11155111. What is their sum? Answer: integer.",
  },

  // ── Pure Algorithms (85-99) ─────────────────────────────────────────────────
  {
    id: 85,
    category: "Pure Algorithms",
    description:
      "Use the Sieve of Eratosthenes to find all prime numbers up to and including 1000. Compute their sum. Vibe code it. Answer: integer.",
  },
  {
    id: 86,
    category: "Pure Algorithms",
    description:
      "Sort the array [64, 34, 25, 12, 22, 11, 90] in ascending order. Return the element at 0-based index 3. Answer: integer.",
  },
  {
    id: 87,
    category: "Pure Algorithms",
    description:
      "Find the length of the Longest Increasing Subsequence in [10, 9, 2, 5, 3, 7, 101, 18]. Vibe code it. Answer: integer.",
  },
  {
    id: 88,
    category: "Pure Algorithms",
    description:
      "Using dynamic programming (coin change), find the minimum number of coins from denominations [1, 5, 6, 9] needed to make exactly 11. Answer: integer.",
  },
  {
    id: 89,
    category: "Pure Algorithms",
    description:
      "Apply binary search on sorted array [2, 5, 8, 12, 16, 23, 38, 56, 72, 91] to find value 23. Count total comparisons including the successful one. Answer: integer.",
  },
  {
    id: 90,
    category: "Pure Algorithms",
    description:
      "Find the length of the longest substring without repeating characters in the string 'abcabcabc'. Answer: integer.",
  },
  {
    id: 91,
    category: "Pure Algorithms",
    description:
      "Sort array [3,1,4,1,5,9,2,6,5,3,5] in ascending order. Sum all elements at even 0-based indices (positions 0, 2, 4, 6, 8, 10). Vibe code it. Answer: integer.",
  },
  {
    id: 92,
    category: "Pure Algorithms",
    description:
      "Compute the 30th Fibonacci number where F(1)=1 and F(2)=1. Vibe code it. Answer: integer.",
  },
  {
    id: 93,
    category: "Pure Algorithms",
    description:
      "Compute 15 factorial (15!). Vibe code it. Answer: integer.",
  },
  {
    id: 94,
    category: "Pure Algorithms",
    description:
      "How many ways can you choose 3 items from a set of 10? Compute the binomial coefficient C(10, 3). Answer: integer.",
  },
  {
    id: 95,
    category: "Pure Algorithms",
    description:
      "Tower of Hanoi: find the minimum number of moves required to transfer 10 disks from peg A to peg C. Formula: 2^n - 1. Answer: integer.",
  },
  {
    id: 96,
    category: "Pure Algorithms",
    description:
      "Compute the Levenshtein edit distance between the strings 'MONAD' and 'NOMAD'. Vibe code it. Answer: integer.",
  },
  {
    id: 97,
    category: "Pure Algorithms",
    description:
      "Apply Kadane's algorithm to find the maximum subarray sum in [-2, 1, -3, 4, -1, 2, 1, -5, 4]. Vibe code it. Answer: integer.",
  },
  {
    id: 98,
    category: "Pure Algorithms",
    description:
      "Reverse the order of words in 'the quick brown fox' (words separated by single spaces). Count the total characters in the result string, including spaces. Answer: integer.",
  },
  {
    id: 99,
    category: "Pure Algorithms",
    description:
      "FINAL MISSION — Count distinct ways to tile a 2x10 grid using 1x2 dominoes. Use DP: f(1)=1, f(2)=2, f(n)=f(n-1)+f(n-2). Vibe code it. Answer: integer.",
  },
];

export const PUZZLE_COUNT = PUZZLE_META.length; // 100

export const CATEGORY_COLORS: Record<PuzzleCategory, string> = {
  "Monad Architecture":  "#6E54FF",
  "Monad Math":          "#85E6FF",
  "Monad Cryptography":  "#FF8EE4",
  "Monad Economics":     "#FFAE45",
  "EVM & Solidity":      "#4ECDC4",
  "Bitcoin & Ethereum":  "#F97316",
  "Pure Algorithms":     "#10B981",
};

export function getPuzzleMeta(id: number): PuzzleMeta | undefined {
  return PUZZLE_META[id];
}

export function getPuzzlesByCategory(category: PuzzleCategory): PuzzleMeta[] {
  return PUZZLE_META.filter((p) => p.category === category);
}
