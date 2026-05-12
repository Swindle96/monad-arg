export const playerRegistryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "acceptOwnership",    inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "addAuthorizedCaller", inputs: [{ name: "caller", type: "address", internalType: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "authorizedCallers",   inputs: [{ name: "", type: "address", internalType: "address" }], outputs: [{ name: "", type: "bool", internalType: "bool" }], stateMutability: "view" },
  // HIGH-09: current season id (1-indexed, incremented by resetForNewSeason)
  { type: "function", name: "currentSeasonId",     inputs: [], outputs: [{ name: "", type: "uint256", internalType: "uint256" }], stateMutability: "view" },
  {
    type: "function", name: "getLeaderboard", inputs: [],
    outputs: [
      { name: "topAddrs",         type: "address[10]", internalType: "address[10]" },
      { name: "topScores",        type: "uint256[10]", internalType: "uint256[10]" },
      { name: "topPuzzlesSolved", type: "uint256[10]", internalType: "uint256[10]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function", name: "getPlayer",
    inputs: [{ name: "player", type: "address", internalType: "address" }],
    outputs: [
      { name: "puzzlesSolved",   type: "uint256", internalType: "uint256" },
      { name: "score",           type: "uint256", internalType: "uint256" },
      { name: "firstSolveBlock", type: "uint256", internalType: "uint256" },
      { name: "registered",      type: "bool",    internalType: "bool"    },
    ],
    stateMutability: "view",
  },
  // HIGH-09: historical lookup — same shape as getPlayer but for any seasonId
  {
    type: "function", name: "getPlayerInSeason",
    inputs: [
      { name: "player",   type: "address", internalType: "address" },
      { name: "seasonId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "puzzlesSolved",   type: "uint256", internalType: "uint256" },
      { name: "score",           type: "uint256", internalType: "uint256" },
      { name: "firstSolveBlock", type: "uint256", internalType: "uint256" },
      { name: "registered",      type: "bool",    internalType: "bool"    },
    ],
    stateMutability: "view",
  },
  { type: "function", name: "getPlayerCount",         inputs: [], outputs: [{ name: "", type: "uint256", internalType: "uint256" }], stateMutability: "view" },
  // HIGH-09: per-season player count for historical/archive views
  { type: "function", name: "getPlayerCountInSeason", inputs: [{ name: "seasonId", type: "uint256", internalType: "uint256" }], outputs: [{ name: "", type: "uint256", internalType: "uint256" }], stateMutability: "view" },
  { type: "function", name: "owner",                  inputs: [], outputs: [{ name: "", type: "address", internalType: "address" }], stateMutability: "view" },
  { type: "function", name: "pendingOwner",           inputs: [], outputs: [{ name: "", type: "address", internalType: "address" }], stateMutability: "view" },
  { type: "function", name: "playerList",             inputs: [{ name: "idx", type: "uint256", internalType: "uint256" }], outputs: [{ name: "", type: "address", internalType: "address" }], stateMutability: "view" },
  { type: "function", name: "playerSolvedPuzzle",     inputs: [{ name: "player", type: "address", internalType: "address" }, { name: "puzzleId", type: "uint256", internalType: "uint256" }], outputs: [{ name: "", type: "bool", internalType: "bool" }], stateMutability: "view" },
  { type: "function", name: "playerSolvedPuzzleBySeason", inputs: [{ name: "", type: "uint256", internalType: "uint256" }, { name: "", type: "address", internalType: "address" }, { name: "", type: "uint256", internalType: "uint256" }], outputs: [{ name: "", type: "bool", internalType: "bool" }], stateMutability: "view" },
  { type: "function", name: "registerSolve",          inputs: [{ name: "player", type: "address", internalType: "address" }, { name: "puzzleId", type: "uint256", internalType: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "removeAuthorizedCaller", inputs: [{ name: "caller", type: "address", internalType: "address" }], outputs: [], stateMutability: "nonpayable" },
  // HIGH-09: roll to a new season — owner or authorized caller (e.g. ARGGame at startSeason)
  { type: "function", name: "resetForNewSeason",      inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "transferOwnership",      inputs: [{ name: "newOwner", type: "address", internalType: "address" }], outputs: [], stateMutability: "nonpayable" },
  { type: "event", name: "OwnershipTransferStarted", inputs: [{ name: "currentOwner",  type: "address", indexed: true,  internalType: "address" }, { name: "pendingOwner", type: "address", indexed: true,  internalType: "address" }], anonymous: false },
  { type: "event", name: "OwnershipTransferred",     inputs: [{ name: "previousOwner", type: "address", indexed: true,  internalType: "address" }, { name: "newOwner",     type: "address", indexed: true,  internalType: "address" }], anonymous: false },
  // HIGH-09: signature now includes seasonId
  { type: "event", name: "PlayerRegistered",         inputs: [{ name: "player",   type: "address", indexed: true,  internalType: "address" }, { name: "seasonId", type: "uint256", indexed: true, internalType: "uint256" }, { name: "blockNumber", type: "uint256", indexed: false, internalType: "uint256" }], anonymous: false },
  // HIGH-09: emitted when ARGGame.startSeason rolls the registry to a new season
  { type: "event", name: "SeasonReset",              inputs: [{ name: "newSeasonId", type: "uint256", indexed: true,  internalType: "uint256" }, { name: "blockNumber", type: "uint256", indexed: false, internalType: "uint256" }], anonymous: false },
  { type: "event", name: "SolveRecorded",            inputs: [{ name: "player",   type: "address", indexed: true,  internalType: "address" }, { name: "puzzleId",    type: "uint256", indexed: true,  internalType: "uint256" }, { name: "newScore", type: "uint256", indexed: false, internalType: "uint256" }], anonymous: false },
  { type: "error", name: "AlreadyCredited" },
  { type: "error", name: "NotAuthorized"   },
  { type: "error", name: "NotOwner"        },
  { type: "error", name: "NotPendingOwner" },
  { type: "error", name: "ZeroAddress"     },
] as const
