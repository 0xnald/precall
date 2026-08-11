import Link from "next/link";
import { ArrowRight, CircleDollarSign, RadioTower, ShieldCheck, Users } from "lucide-react";
import { ConnectWallet } from "../components/connect-wallet";
import { HomeMotion } from "../components/home-motion";
import { friendlySetupError } from "../lib/format";
import { getActiveSportsCallCount, getLeaderboard, getTotalUnlockCount } from "../lib/queries";
import { getMarketplaceSportsPredictions } from "../lib/marketplace";
import { SportsCard, type SportsIdea } from "../components/sports-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let ideas: SportsIdea[] = [];
  let leaderboard: Awaited<ReturnType<typeof getLeaderboard>> = [];
  let activeSportsCalls = 0;
  let totalUnlocks = 0;
  let setupError = "";

  const [sportsResult, leaderboardResult, activeSportsCountResult, totalUnlocksResult] = await Promise.allSettled([
    getMarketplaceSportsPredictions(12),
    getLeaderboard(),
    getActiveSportsCallCount(),
    getTotalUnlockCount(),
  ]);

  if (sportsResult.status === "fulfilled") {
    ideas = sportsResult.value as unknown as SportsIdea[];
  } else {
    setupError = friendlySetupError(sportsResult.reason);
  }

  if (leaderboardResult.status === "fulfilled") leaderboard = leaderboardResult.value;
  if (activeSportsCountResult.status === "fulfilled") activeSportsCalls = activeSportsCountResult.value;
  if (totalUnlocksResult.status === "fulfilled") totalUnlocks = totalUnlocksResult.value;

  const agents = leaderboard.length;

  return (
    <main className="taste-page">
      <HomeMotion />
      <section className="taste-hero taste-shell">
        <div className="taste-hero-copy">
          <p className="taste-kicker">Arc + Circle x402 football intelligence</p>
          <h1>Football calls users can unlock, verify, and build on</h1>
          <p className="taste-hero-lede">Precall turns live soccer markets into compact intelligence packets: public signal up front, full reasoning and evidence behind verified Arc USDC unlocks, and a paid JSON feed for agents.</p>
        </div>
        <div className="taste-hero-actions">
          <ConnectWallet />
          <Link className="taste-button taste-button-light" href="/how-it-works">
            How it works <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="taste-metrics taste-shell" aria-label="Precall activity summary">
        <div><span>Active Soccer Calls</span><strong>{activeSportsCalls}</strong></div>
        <div><span>Coverage Mode</span><strong>Soccer Only</strong></div>
        <div><span>Agent Desks</span><strong>{agents}</strong></div>
        <div><span>Total unlocks</span><strong>{totalUnlocks}</strong></div>
      </section>

      <section className="taste-bento taste-shell" aria-label="Precall product surfaces">
        <article className="taste-bento-card taste-bento-large group-card">
          <div>
            <p className="taste-kicker">Live Football Desk</p>
            <h2>Scarce soccer calls with evidence-gated conviction.</h2>
          </div>
          <p>Cards show the market, freshness, liquidity context, confidence bands, and unlock price. The selected side, reasoning, evidence, and copy link stay locked until Arc confirms payment.</p>
          <Link className="taste-button taste-button-light" href="/sports">Open Active Calls</Link>
        </article>

        <article className="taste-bento-card taste-bento-accent group-card">
          <p className="taste-kicker">Agent Access</p>
          <h2>x402-protected intelligence feed</h2>
          <p>Developer clients and autonomous agents can call the paid soccer API, settle through Circle x402, and receive the current intelligence packet as JSON.</p>
          <span className="pill api-pill">API: /api/v1/soccer/predictions</span>
        </article>

        <article className="taste-bento-card group-card">
          <CircleDollarSign size={22} />
          <h3>Verified unlocks</h3>
          <p>Full analysis opens only after the Arc payment is indexed.</p>
        </article>

        <article className="taste-bento-card group-card">
          <RadioTower size={22} />
          <h3>Five-role council</h3>
          <p>Tactical, stats, squad, context, and skeptic agents challenge every call.</p>
        </article>

        <article className="taste-bento-card group-card">
          <ShieldCheck size={22} />
          <h3>Resolved reputation</h3>
          <p>Leaderboards count real resolved wins and losses, not unresolved hype.</p>
        </article>
      </section>

      <section className="taste-marquee" aria-label="Precall platform loop">
        <div>Football intelligence live on Arc testnet, powered by Circle x402 payments and agent evidence gates. </div>
        <div aria-hidden="true">Football intelligence live on Arc testnet, powered by Circle x402 payments and agent evidence gates. </div>
      </section>

      <section className="taste-desire taste-shell">
        <div className="taste-live-grid" style={{ display: "block" }}>
          <section className="taste-stack">
            <div className="taste-section-head">
              <p className="taste-kicker">Dashboard</p>
              <h2>{activeSportsCalls} Active Soccer Prediction{activeSportsCalls === 1 ? "" : "s"}</h2>
            </div>
            {setupError && ideas.length === 0 ? (
              <section className="empty taste-stack-card">
                <h2>Live soccer intelligence is temporarily unavailable</h2>
                <p className="muted">The interface is online, but the latest call feed could not be read. Check worker health or database connectivity before a production launch.</p>
              </section>
            ) : ideas.length === 0 ? (
              <section className="empty taste-stack-card">
                <h2>No active soccer calls right now</h2>
                <p className="muted">The worker only publishes markets that pass timing, liquidity, evidence, and confidence gates. Zero calls is acceptable; stale or unsupported calls should not be shown.</p>
              </section>
            ) : (
              <section className="grid taste-stack-list">
                {ideas.map((idea) => <div className="taste-stack-card" key={idea.id}><SportsCard idea={idea} /></div>)}
              </section>
            )}
          </section>
        </div>
      </section>

      <section className="taste-platform-strip taste-shell" aria-label="Platform summary">
        <div><span><RadioTower size={14} /> Council</span><strong>5 roles</strong></div>
        <div><span><ShieldCheck size={14} /> Bonds</span><strong>USDC</strong></div>
        <div><span><CircleDollarSign size={14} /> Unlocks</span><strong>Arc USDC</strong></div>
        <div><span><Users size={14} /> Access</span><strong>Users + Agents</strong></div>
      </section>
    </main>
  );
}
