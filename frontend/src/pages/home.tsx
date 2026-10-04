import { Link } from "react-router-dom";
import { ConsensusField } from "@/components/consensus-field";

export default function Home() {
  return <main>
    <section className="hero hero-home">
      <div className="hero-copy">
        <p className="eyebrow">ON-CHAIN SECURITY INFRASTRUCTURE · GENLAYER</p>
        <h1 id="title">Make security<br /><span>verifiable.</span></h1>
        <p className="hero-lede">ProofPatch turns vulnerability research into a transparent on-chain workflow — from bounty creation to evidence review and settlement.</p>
        <div className="hero-actions">
          <Link className="connect" to="/programs">Explore programs</Link>
          <Link className="outline-link" to="/programs/new">Launch a bounty <span>↗</span></Link>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
        <div className="orb-ring ring-a" /><div className="orb-ring ring-b" />
        <ConsensusField />
        <div className="hero-card hero-card-top"><span>NETWORK</span><strong>STUDIONET</strong><i /></div>
        <div className="hero-card hero-card-bottom"><span>VERIFICATION</span><strong>CONSENSUS READY</strong><b>●</b></div>
      </div>
    </section>

    <section className="intro-grid">
      <div><p className="eyebrow">01 / THE PLATFORM</p><h2>Security research,<br /><span>with proof attached.</span></h2></div>
      <div className="intro-copy"><p>ProofPatch gives teams and researchers a shared, verifiable place to coordinate vulnerability disclosures. Program rules are public, evidence is bound to the workflow, and final outcomes are recorded through GenLayer.</p><Link className="text-link" to="/disclosures">Explore reports <span>↗</span></Link></div>
    </section>

    <section className="feature-grid">
      <article className="feature feature-dark"><small>01</small><h3>Open by design</h3><p>Program scope, reports and outcomes can be inspected instead of hidden behind a private dashboard.</p><Link to="/programs">View programs →</Link></article>
      <article className="feature feature-blue"><small>02</small><h3>Evidence first</h3><p>Researchers submit public evidence that stays connected to the report as it moves through review.</p><Link to="/disclosures">Browse reports →</Link></article>
      <article className="feature feature-light"><small>03</small><h3>Consensus driven</h3><p>GenLayer provides the intelligent-contract layer used to evaluate evidence and advance the report lifecycle.</p><Link to="/precedent">See precedent →</Link></article>
    </section>

    <section className="flow-section">
      <div className="flow-heading"><p className="eyebrow">02 / HOW IT WORKS</p><h2>From signal<br />to settlement.</h2></div>
      <div className="flow-list">
        <div><span>01</span><div><h3>Set the scope</h3><p>A sponsor defines the target, rules, funding and disclosure window.</p></div></div>
        <div><span>02</span><div><h3>Submit evidence</h3><p>A researcher submits a vulnerability report with supporting public evidence.</p></div></div>
        <div><span>03</span><div><h3>Verify with consensus</h3><p>GenLayer coordinates an evidence-based adjudication of the submission.</p></div></div>
        <div><span>04</span><div><h3>Record the outcome</h3><p>The contract moves the report to its terminal state and applies the program rules.</p></div></div>
      </div>
    </section>

    <section className="cta-section">
      <p className="eyebrow">BUILD WITH PROOFPATCH</p>
      <h2>Turn security work<br /><span>into public infrastructure.</span></h2>
      <div><Link className="connect" to="/programs/new">Create a program</Link><Link className="outline-link" to="/programs">Explore the network <span>↗</span></Link></div>
    </section>

    <footer><span>PROOFPATCH</span><p>Verifiable vulnerability coordination powered by GenLayer.</p><b>STUDIONET · ON-CHAIN</b></footer>
  </main>;
}
