import Link from 'next/link';
import type { Metadata } from 'next';

const headlineWords = ['Crack', 'Every', 'Interview', 'With', 'AI', 'Precision'];

export const metadata: Metadata = {
  title: 'MIRA - AI Interview Coach for Pakistani Jobs',
  description: 'Practice interviews with live AI feedback, speech intelligence HUD, and role-specific Pakistani hiring context.',
};

export default function HomePage() {
  return (
    <section className="home-hero pro-page" aria-label="MIRA home">
      <div className="mesh-grid" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-cyan" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-violet" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-amber" aria-hidden="true" />
      <div className="mesh-blob mesh-blob-blue" aria-hidden="true" />

      <div className="home-hero-content">
        <div className="hero-badge">AI-Powered Interview Platform</div>

        <h1 className="hero-headline" aria-label="Crack Every Interview With AI Precision">
          {headlineWords.map((word, index) => (
            <span key={word} style={{ animationDelay: `${index * 100}ms` }}>
              {word}
            </span>
          ))}
        </h1>

        <p className="hero-subheadline">
          Live AI feedback, speech intelligence HUD, and role-specific Pakistani hiring context.
        </p>

        <div className="hero-ctas">
          <Link href="/auth" className="hero-btn hero-btn-primary shimmer-on-load">
            Get Started Free
          </Link>
          <Link href="/how-it-works" className="hero-btn hero-btn-secondary shimmer-on-load">
            Watch Demo
          </Link>
        </div>

        <div className="hero-stats" aria-label="Mira platform stats">
          {[
            ['10K+', 'Mock Interviews'],
            ['95%', 'Success Rate'],
            ['50+', 'Pakistani Roles'],
          ].map(([value, label], index) => (
            <div className="hero-stat-card" key={label} style={{ animationDelay: `${950 + index * 150}ms` }}>
              <strong className="gradient-text">{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <a className="scroll-indicator" href="#home-preview" aria-label="Scroll to platform preview">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <div id="home-preview" className="home-preview reveal revealed">
        <div className="glass-card home-preview-panel">
          <span className="section-kicker">Live readiness stack</span>
          <h2 className="gradient-text">Practice, optimize, apply, and improve from one command center.</h2>
          <p>
            MIRA connects mock interviews, speech telemetry, LinkedIn profile scoring, Pakistani job context, and recruiter intelligence in one polished workflow.
          </p>
        </div>
      </div>
    </section>
  );
}
