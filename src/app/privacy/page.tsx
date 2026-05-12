const LAST_UPDATED = "2026-05-12";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", color: "var(--green)", fontFamily: "var(--font-mono, monospace)" }}>
      <p style={{ color: "var(--purple)", fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>
        CLASSIFIED // DOCUMENT-07
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>PRIVACY POLICY</h1>
      <p style={{ color: "var(--muted, #666)", fontSize: 13, marginBottom: 40 }}>
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. WHO WE ARE">
        CHAIN_DETECTIVE is a Web3 alternate reality game (ARG) running on the Monad Testnet.
        This policy explains what data we collect and how it is used.
      </Section>

      <Section title="2. DATA WE COLLECT">
        <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
          <li><strong>Wallet address</strong> — provided voluntarily when you connect a wallet. Used to track your puzzle progress on-chain.</li>
          <li><strong>On-chain activity</strong> — all commit and reveal transactions are public on the Monad Testnet blockchain. We do not control or store this data separately.</li>
          <li><strong>Session storage</strong> — commit data (answer hash + nonce) is stored in your browser&apos;s sessionStorage for the duration of the tab session only. It is cleared when the tab is closed.</li>
          <li><strong>No cookies</strong> — we do not set any tracking or analytics cookies.</li>
          <li><strong>No personal information</strong> — we do not collect names, email addresses, or IP addresses.</li>
        </ul>
      </Section>

      <Section title="3. HOW WE USE DATA">
        Wallet addresses are used solely to display leaderboard rankings and puzzle completion state.
        We do not sell, share, or process personal data for advertising purposes.
      </Section>

      <Section title="4. THIRD-PARTY SERVICES">
        <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
          <li><strong>Monad Testnet RPC</strong> — blockchain read/write calls are routed through the public Monad Testnet RPC endpoint.</li>
          <li><strong>ConnectKit / WalletConnect</strong> — wallet connection is handled by ConnectKit. Their privacy policy applies to that interaction.</li>
          <li><strong>Monad Explorer</strong> — transaction links open testnet.monadexplorer.com in a new tab.</li>
        </ul>
      </Section>

      <Section title="5. DATA RETENTION">
        We hold no persistent user data on our servers. All game state lives on-chain.
        Session storage data is transient and browser-controlled.
      </Section>

      <Section title="6. YOUR RIGHTS">
        Because we hold no personal data, there is nothing to delete or export on our end.
        You can disconnect your wallet at any time via the wallet UI.
      </Section>

      <Section title="7. TESTNET DISCLAIMER">
        CHAIN_DETECTIVE runs exclusively on the Monad Testnet. No real monetary value is involved.
        Testnet tokens have no financial value.
      </Section>

      <Section title="8. CONTACT">
        Questions? Reach out via the official CHAIN_DETECTIVE community channels.
      </Section>

      <p style={{ marginTop: 48, color: "var(--muted, #666)", fontSize: 12 }}>
        &mdash; END OF DOCUMENT &mdash;
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 14, letterSpacing: 2, color: "var(--purple)", marginBottom: 12 }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--green)" }}>{children}</div>
    </section>
  );
}
