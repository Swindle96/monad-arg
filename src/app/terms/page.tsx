const LAST_UPDATED = "2026-05-12";

export default function TermsPage() {
  return (
    <main
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "8px 16px",
          border: "2px solid var(--acid)",
          color: "var(--acid)",
          textShadow: "0 0 6px var(--acid-glow)",
          letterSpacing: "0.28em",
          fontSize: "0.62rem",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "24px",
          transform: "rotate(1.2deg)",
          background: "rgba(204, 255, 0, 0.06)",
        }}
      >
        ▣ AUTHORIZED ▣ DOC-08 ▣ READ-WRITE
      </div>

      <h1
        className="display"
        style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", marginBottom: "10px" }}
        data-text="TERMS OF SERVICE"
      >
        <span className="glitch" data-text="TERMS OF SERVICE">TERMS OF SERVICE</span>
      </h1>
      <p style={{ color: "var(--text-faint)", fontSize: "0.72rem", letterSpacing: "0.16em", marginBottom: "44px" }}>
        // last_modified: {LAST_UPDATED} · jurisdiction: applicable
      </p>

      <Section title="01_ACCEPTANCE">
        by accessing chain_detective you agree to these terms of service.
        if you do not agree, do not use the platform.
      </Section>

      <Section title="02_NATURE_OF_THE_GAME">
        chain_detective is a free-to-play alternate reality game (arg) deployed on monad testnet.
        all in-game actions (puzzle commits and reveals) are on-chain transactions on a test network.
        no real cryptocurrency or monetary value is involved at any time.
      </Section>

      <Section title="03_ELIGIBILITY">
        you must be of legal age in your jurisdiction to participate.
        you are responsible for complying with all applicable local laws.
      </Section>

      <Section title="04_WALLET_AND_TRANSACTIONS">
        <ul style={listStyle}>
          <li>you are solely responsible for your wallet private keys and seed phrase.</li>
          <li>testnet transactions may be irreversible on the monad testnet ledger.</li>
          <li>we are not responsible for lost or compromised wallet access.</li>
          <li>you are responsible for any gas fees (testnet — no real-world value).</li>
        </ul>
      </Section>

      <Section title="05_PROHIBITED_CONDUCT">
        <ul style={listStyle}>
          <li>attempting to exploit smart contract vulnerabilities maliciously.</li>
          <li>automated mass-submission or bots that degrade service for others.</li>
          <li>front-running other players&apos; commits through mempool analysis or collusion.</li>
          <li>any activity that violates applicable law.</li>
        </ul>
      </Section>

      <Section title="06_INTELLECTUAL_PROPERTY">
        all puzzle content, narrative, artwork, and code are owned by the chain_detective team.
        you may not reproduce or redistribute game content without permission.
      </Section>

      <Section title="07_DISCLAIMER_OF_WARRANTIES">
        chain_detective is provided &quot;as is&quot; without warranty of any kind.
        we do not guarantee uptime, puzzle availability, or accuracy of on-chain data displayed.
        the game runs on a test network and may be reset or discontinued at any time.
      </Section>

      <Section title="08_LIMITATION_OF_LIABILITY">
        to the maximum extent permitted by law, we are not liable for any damages arising
        from your use of chain_detective, including loss of testnet tokens, wallet compromise,
        or inability to access the platform.
      </Section>

      <Section title="09_CHANGES_TO_TERMS">
        we reserve the right to update these terms at any time.
        continued use after changes constitutes acceptance of the new terms.
      </Section>

      <Section title="10_GOVERNING_LAW">
        these terms are governed by applicable law. any disputes shall be resolved in accordance
        with applicable jurisdiction.
      </Section>

      <p style={{ marginTop: 56, color: "var(--text-faint)", fontSize: "0.66rem", letterSpacing: "0.18em", textAlign: "center" }}>
        ▣ END_OF_DOCUMENT ▣
      </p>
    </main>
  );
}

const listStyle: React.CSSProperties = {
  paddingLeft: "20px",
  lineHeight: 1.9,
  fontSize: "0.86rem",
  color: "var(--text)",
  listStyle: "'> '",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "32px" }}>
      <h2
        style={{
          fontSize: "0.78rem",
          letterSpacing: "0.2em",
          color: "var(--green)",
          textShadow: "0 0 4px var(--green-glow)",
          marginBottom: "12px",
          fontFamily: "var(--font-mono), monospace",
        }}
      >
        // {title}
      </h2>
      <div style={{ fontSize: "0.88rem", lineHeight: 1.85, color: "var(--text)" }}>{children}</div>
    </section>
  );
}

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for CHAIN_DETECTIVE — Web3 ARG on Monad Testnet.",
};
