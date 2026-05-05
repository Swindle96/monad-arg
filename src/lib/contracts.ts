export { puzzleChainAbi }    from './abi/PuzzleChain'
export { argGameAbi }        from './abi/ARGGame'
export { playerRegistryAbi } from './abi/PlayerRegistry'

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as `0x${string}`

function requireEnv(name: string, val: string | undefined): `0x${string}` {
  if (!val) {
    console.error(`[contracts] Missing env var ${name} — contract calls will fail. Set it in .env.local.`)
    return ZERO_ADDR
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(val)) {
    console.error(`[contracts] Env var ${name} is not a valid Ethereum address: "${val}"`)
    return ZERO_ADDR
  }
  return val as `0x${string}`
}

export const CONTRACT_ADDRESSES = {
  argGame:        requireEnv('NEXT_PUBLIC_ARG_GAME',         process.env.NEXT_PUBLIC_ARG_GAME),
  puzzleChain:    requireEnv('NEXT_PUBLIC_PUZZLE_CONTRACT',  process.env.NEXT_PUBLIC_PUZZLE_CONTRACT),
  playerRegistry: requireEnv('NEXT_PUBLIC_PLAYER_REGISTRY', process.env.NEXT_PUBLIC_PLAYER_REGISTRY),
}

// Detect duplicate addresses (copy-paste misconfiguration)
const seen = new Set<string>()
for (const [name, addr] of Object.entries(CONTRACT_ADDRESSES)) {
  const key = addr.toLowerCase()
  if (seen.has(key)) {
    console.error(`[contracts] Duplicate address for ${name}: ${addr} — check your env vars`)
  }
  seen.add(key)
}
