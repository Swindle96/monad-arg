"use client";

const LAST_UPDATED = "2026-05-12";

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", color: "var(--green)", fontFamily: "var(--font-mono, monospace)" }}>
      <p style={{ color: "var(--purple)", fontSize: 11, letterSpacing: 4, marginBottom: 8 }}>
        CLASSIFIED // DOCUMENT-08
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>TERMS OF SERVICE</h1>
      <p style={{ color: "var(--muted, #666)", fontSize: 13, marginBottom: 40 }}>
        Last updated: {LAST_UPDATED}
      </p>

      <Section title="1. ACCEPTANCE">
        By accessing CHAIN_DETECTIVE you agree to these Terms of Service.
        If you do not agree, do not use the platform.
      </Section>

      <Section title="2. NATURE OF THE GAME">
        CHAIN_DETECTIVE is a free-to-play alternate reality game (ARG) deployed on the Monad Testnet.
        All in-game actions (puzzle commits and reveals) are on-chain transactions on a test network.
        No real cryptocurrency or monetary value is involved at any time.
      </Section>

      <Section title="3. ELIGIBILITY">
        You must be of legal age in your jurisdiction to participate.
        You are responsible for complying with all applicable local laws.
      </Section>

      <Section title="4. WALLET AND TRANSACTIONS">
        <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
          <li>You are solely responsible for your wallet private keys and seed phrase.</li>
          <li>Testnet transactions may be irreversible on the Monad Testnet ledger.</li>
          <li>We are not responsible for lost or compromised wallet access.</li>
          <li>You are responsible for any gas fees incurred on the testnet (which have no real-world monetary value).</li>
        </ul>
      </Section>

      <Section title="5. PROHIBITED CONDUCT">
        <ul style={{ paddingLeft: 20, lineHeight: 1.9 }}>
          <li>Attempting to exploit smart contract vulnerabilities maliciously.</li>
          <li>Automated mass-submission or bot-based puzzle solving that degrades service for others.</li>
          <li>Front-running other players&apos; commits through mempool analysis or collusion.</li>
          <li>Any activity that violates applicable law.</li>
        </ul>
      </Section>

      <Section title="6. INTELLECTUAL PROPERTY">
        All puzzle content, narrative, artwork, and code are owned by the CHAIN_DETECTIVE team.
        You may not reproduce or redistribute game content without permission.
      </Section>

      <Section title="7. DISCLAIMER OF WARRANTIES">
        CHAIN_DETECTIVE is provided &quot;AS IS&quot; without warranty of any kind.
        We do not guarantee uptime, puzzle availability, or accuracy of on-chain data displayed.
        The game runs on a test network and may be reset or discontinued at any time.
      </Section>

      <Section title="8. LIMITATION OF LIABILITY">
        To the maximum extent permitted by law, we are not liable for any damages arising
        from your use of CHAIN_DETECTIVE, including but not limited to loss of testnet tokens,
        wallet compromise, or inability to access the platform.
      </Section>

      <Section title="9. CHANGES TO TERMS">
        We reserve the right to update these Terms at any time.
        Continued use of the platform after changes constitutes acceptance of the new Terms.
      </Section>

      <Section title="10. GOVERNING LAW">
        These Terms are governed by applicable law. Any disputes shall be resolved in accordance
        with applicable jurisdiction.
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
