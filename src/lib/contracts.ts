import type { Abi } from 'viem'
import ARGGameABI from './abi/ARGGame.json'
import PuzzleChainABI from './abi/PuzzleChain.json'
import PlayerRegistryABI from './abi/PlayerRegistry.json'

// MED-04: validate all required env vars at module load time.
// Missing vars cause a clear error instead of a silent undefined address.
function requireEnv(name: string, val: string | undefined): `0x${string}` {
  if (!val) throw new Error(`Missing required env var: ${name}`)
  if (!val.startsWith('0x')) throw new Error(`Env var ${name} must start with 0x`)
  return val as `0x${string}`
}

export const CONTRACT_ADDRESSES = {
  argGame:        requireEnv('NEXT_PUBLIC_ARG_GAME',         process.env.NEXT_PUBLIC_ARG_GAME),
  puzzleChain:    requireEnv('NEXT_PUBLIC_PUZZLE_CONTRACT',  process.env.NEXT_PUBLIC_PUZZLE_CONTRACT),
  playerRegistry: requireEnv('NEXT_PUBLIC_PLAYER_REGISTRY', process.env.NEXT_PUBLIC_PLAYER_REGISTRY),
}

export const argGameAbi        = ARGGameABI as Abi
export const puzzleChainAbi    = PuzzleChainABI as Abi
export const playerRegistryAbi = PlayerRegistryABI as Abi
