const LAST_UPDATED = "2026-05-12";

export default function PrivacyPage() {
  return (
    <main
      style={{
        maxWidth: "820px",
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      {/* Classified header stamp */}
      <div
        style={{
          display: "inline-block",
          padding: "8px 16px",
          border: "2px solid var(--red)",
          color: "var(--red)",
          textShadow: "0 0 6px var(--red-glow)",
          letterSpacing: "0.28em",
          fontSize: "0.62rem",
          fontWeight: 700,
          textTransform: "uppercase",
          marginBottom: "24px",
          transform: "rotate(-1.5deg)",
          background: "rgba(255, 0, 60, 0.06)",
        }}
      >
        ▣ CLASSIFIED ▣ DOC-07 ▣ EYES-ONLY
      </div>

      <h1
        className="display"
        style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", marginBottom: "10px" }}
        data-text="PRIVACY POLICY"
      >
        <span className="glitch" data-text="PRIVACY POLICY">PRIVACY POLICY</span>
      </h1>
      <p style={{ color: "var(--text-faint)", fontSize: "0.72rem", letterSpacing: "0.16em", marginBottom: "44px" }}>
        // last_modified: {LAST_UPDATED} · classification: open
      </p>

      <Section title="01_WHO_WE_ARE">
        chain_detective is a web3 alternate reality game (arg) on monad testnet. this policy explains
        what data we collect and how it is used.
      </Section>

      <Section title="02_DATA_WE_COLLECT">
        <ul style={listStyle}>
          <li>
            <span style={kw}>wallet_address</span> — provided voluntarily on connect. tracks puzzle
            progress on-chain.
          </li>
          <li>
            <span style={kw}>on_chain_activity</span> — all commit/reveal txs are public on monad testnet.
            we do not store separately.
          </li>
          <li>
            <span style={kw}>session_storage</span> — commit data (answer hash + nonce) stored in browser
            sessionStorage. cleared on tab close.
          </li>
          <li>
            <span style={kw}>cookies</span> — none. zero tracking.
          </li>
          <li>
            <span style={kw}>personal_info</span> — none. no names, emails, ip logs.
          </li>
        </ul>
      </Section>

      <Section title="03_HOW_WE_USE_DATA">
        wallet addresses are used solely to display leaderboard rankings and puzzle completion state.
        we do not sell, share, or process personal data for advertising.
      </Section>

      <Section title="04_THIRD_PARTY_SERVICES">
        <ul style={listStyle}>
          <li>
            <span style={kw}>monad_testnet_rpc</span> — blockchain calls routed through public rpc endpoint.
          </li>
          <li>
            <span style={kw}>connectkit/walletconnect</span> — wallet ui handled by connectkit. their
            privacy policy applies to that interaction.
          </li>
          <li>
            <span style={kw}>monad_explorer</span> — transaction links open testnet.monadexplorer.com.
          </li>
        </ul>
      </Section>

      <Section title="05_DATA_RETENTION">
        we hold no persistent user data on our servers. all game state lives on-chain.
        sessionStorage is transient and browser-controlled.
      </Section>

      <Section title="06_YOUR_RIGHTS">
        because we hold no personal data, there is nothing to delete or export on our end.
        disconnect your wallet at any time via the wallet ui.
      </Section>

      <Section title="07_TESTNET_DISCLAIMER">
        chain_detective runs exclusively on monad testnet. no real monetary value is involved.
        testnet tokens have no financial value.
      </Section>

      <Section title="08_CONTACT">
        questions? reach out via official chain_detective community channels.
      </Section>

      <p style={{ marginTop: 56, color: "var(--text-faint)", fontSize: "0.66rem", letterSpacing: "0.18em", textAlign: "center" }}>
        ▣ END_OF_DOCUMENT ▣
      </p>
    </main>
  );
}

const kw: React.CSSProperties = {
  color: "var(--monad)",
  textShadow: "0 0 3px var(--monad-glow)",
};

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
  title: "Privacy Policy",
  description: "Privacy Policy for CHAIN_DETECTIVE — Web3 ARG on Monad Testnet.",
};
