import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";
import { useWallet } from "@/components/wallet-provider";

const links = [
  ["EXPLORE", "/"],
  ["PROGRAMS", "/programs"],
  ["REPORTS", "/disclosures"],
  ["PRECEDENT", "/precedent"],
  ["SETTLEMENTS", "/settlements"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = useLocation().pathname;
  const wallet = useWallet();
  const { theme, toggle } = useTheme();
  const [connectError, setConnectError] = useState("");
  const short = wallet.address ? `${wallet.address.slice(0, 6)}…${wallet.address.slice(-4)}` : "Connect wallet";

  const connect = async () => {
    setConnectError("");
    try { await wallet.connect(); }
    catch (error) { setConnectError(error instanceof Error ? error.message : "Wallet connection failed. Try again after unlocking your wallet."); }
  };

  const network = wallet.address && wallet.networkStatus === "ready"
    ? `StudioNet · ${short}`
    : wallet.address
      ? "Account connected · switch to StudioNet for writes"
      : "StudioNet · read-only until a wallet is connected";

  return <>
    <header className="masthead">
      <Link className="wordmark" to="/" aria-label="ProofPatch home">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>PROOFPATCH</span>
      </Link>
      <nav aria-label="Primary navigation">
        {links.map(([name, href]) => {
          const active = path === href || (href !== "/" && path.startsWith(`${href}/`));
          return <Link key={href} className={active ? "active" : ""} aria-current={active ? "page" : undefined} to={href}>{name}</Link>;
        })}
      </nav>
      <div className="wallet-actions">
        <button className="theme-toggle" onClick={toggle} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={theme === "light"} title={theme === "dark" ? "Light mode" : "Dark mode"}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="theme-icon">{theme === "dark" ? <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" /> : <g><circle cx="12" cy="12" r="4.4" /><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" /></g>}</svg>
        </button>
        {wallet.address
          ? <><span className="connected-address">{short}</span><button className="disconnect" onClick={wallet.disconnect}>Disconnect</button></>
          : <button className="connect" disabled={wallet.status === "connecting"} onClick={() => void connect()}>{wallet.status === "connecting" ? "Connecting…" : "Connect wallet"}</button>}
      </div>
    </header>
    <div className="network-strip"><span className="status-dot" />{network}</div>
    {wallet.error || connectError ? <p className="wallet-error" role="alert" aria-live="polite">{connectError || wallet.error}</p> : null}
    {children}
  </>;
}
