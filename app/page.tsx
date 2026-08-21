"use client";
import { useState } from "react";
import DesktopDownload from "./desktop-download";
import AuthPanel from "./auth-panel";
const Logo = () => (
  <a className="logo" href="#top">
    <span className="mark">
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
    Word<span>Sifter</span>
  </a>
);
const steps = [
  ["⌁", "Sift", "Analyze and score every part."],
  ["☷", "Compare", "See all your options side by side."],
  ["✓", "Keep", "Keep what works best."],
  ["×", "Cut", "Cut what doesn’t serve your work."],
  ["↻", "Rewrite", "Make it better and try again."],
  ["⚑", "Finish", "Build your final piece with confidence."],
];
const types = [
  ["♫", "Lyrics & hooks", "Shape stronger lines without losing the original.", "purple"],
  ["◌", "AI variations", "Compare alternate wording side by side.", "blue"],
  ["✓", "Review decisions", "Score, tag, and keep the version that earns its place.", "green"],
  ["⚑", "Suno-ready output", "Format, tag, and export a draft ready for your next generation.", "orange"],
];
function Demo() {
  const [pick, setPick] = useState(2);
  const lines = [
    ["Every city light feels like a question", "Keep", 92],
    ["I’m learning how to let the silence speak", "Keep", 88],
    ["We built a sky no one remembers", "Cut", 32],
    ["But we still chase the morning", "Keep", 90],
    ["Across the noise, we find the meaning", "Revise", 64],
    ["And make it something worth believing", "Keep", 91],
  ];
  return (
    <div className="demo">
      <div className="demoTop">
        <Logo />
        <span>Pass 04⌄</span>
        <button>New Pass</button>
      </div>
      <div className="demoBody">
        <aside>
          {[
            "⌁ Sifter",
            "▦ Board",
            "▤ Bank",
            "◷ Passes",
            "↶ History",
            "⌘ Cuts",
            "⚙ Settings",
          ].map((x, i) => (
            <div className={i ? "" : "on"} key={x}>
              {x}
            </div>
          ))}
        </aside>
        <section className="score">
          <div className="scoreHead">
            <b>Sift Score</b>
            <strong>87</strong>
            <small>
              <em>18</em>Keep
            </small>
            <small>
              <i>7</i>Cut
            </small>
            <small>
              <mark>4</mark>Revise
            </small>
          </div>
          <div className="lines">
            {lines.map((x, i) => (
              <button
                className={pick === i ? "picked" : ""}
                onClick={() => setPick(i)}
                key={x[0]}
              >
                <small>{i + 1}</small>
                <span>{x[0]}</span>
                <em className={String(x[1]).toLowerCase()}>{x[1]}</em>
                <b>{x[2]}</b>
              </button>
            ))}
          </div>
          <div className="tools">
            B　<i>I</i>　<u>U</u>　↗　☷　≡　▣
          </div>
        </section>
        <section className="variants">
          <b>Variants　×</b>
          {[
            "We built a sky no one remembers",
            "We built a world that slipped away",
            "We built a sky that we outgrew",
          ].map((x, i) => (
            <button
              onClick={() => setPick(i)}
              className={pick % 3 === i ? "chosen" : ""}
              key={x}
            >
              {x}
              <strong>{[32, 58, 72][i]}</strong>
            </button>
          ))}
          <button>＋ New Variant</button>
          <div>
            <button>Rewrite</button>
            <button>Keep</button>
          </div>
        </section>
      </div>
    </div>
  );
}
export default function Home() {
  const [menu, setMenu] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  return (
    <main id="top">
      <section className="hero dark">
        <header>
          <Logo />
          <nav id="primary-navigation" className={menu ? "open" : ""} aria-label="Primary navigation">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources⌄</a>
          </nav>
          <button
            className="hamb"
            type="button"
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
            aria-controls="primary-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? "×" : "☰"}
          </button>
        </header>
        <div className="heroGrid">
          <div className="copy">
            <h1>
              Find the
              <br />
              <span>gold.</span>
            </h1>
            <p>
              WordSifter helps songwriters turn rough lyrics and AI-generated
              variations into finished songs by comparing, scoring, rewriting,
              and keeping the strongest parts.
            </p>
            <div className="actions">
              <a className="gradient" href="#account">
                Start Sifting Free
              </a>
              <a className="outline" href="#how">
                See It In Action　▷
              </a>
            </div>
            <div className="trust productProof">
              <span>LOCAL-FIRST</span>
              <span>WINDOWS</span>
              <span>SUNO-READY</span>
            </div>
          </div>
          <Demo />
        </div>
        <div className="brands productProofBar">
          <span>Protected original drafts</span>
          <span>Independent line versions</span>
          <span>Local analysis</span>
          <span>Explicit export</span>
        </div>
      </section>
      <section className="process dark" id="features">
        <p className="eye">EVERYTHING YOU NEED</p>
        <h2>The complete writing refinement workspace</h2>
        <div className="steps">
          {steps.map((x, i) => (
            <article className={`s${i}`} key={x[1]}>
              <i>{x[0]}</i>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="creators" id="how">
        <div className="intro">
          <p className="eye">MADE FOR SONGWRITERS</p>
          <h2>
            From rough draft
            <br />
            to keeper lines.
          </h2>
          <p>
            Built for songwriters working across drafts, alternate lines, and
            AI-music workflows. Keep the original, compare every variation,
            and finish with confidence.
          </p>
          <a className="gradient" href="#account">
            Try WordSifter Free　→
          </a>
        </div>
        <div className="typeGrid">
          {types.map((x) => (
            <article className={x[3]} key={x[1]}>
              <i>{x[0]}</i>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="pricing dark" id="pricing">
        <p className="eye">SIMPLE PRODUCT ACCESS</p>
        <h2>One workspace. No recurring software bill.</h2>
        <div className="priceCard">
          <div>
            <span className="priceLabel">WORD SIFTER DESKTOP</span>
            <strong className="price">$29.99</strong>
            <span className="priceTerms">one-time purchase · Windows</span>
          </div>
          <ul>
            <li>Review lyrics line by line</li>
            <li>Compare and preserve alternate versions</li>
            <li>Import, tag, format, and export Suno-ready work</li>
            <li>Local analysis with optional AI providers</li>
          </ul>
          <p className="priceNote">Free beta access is available for 30 days. No card required during beta.</p>
          <a className="gradient" href="#account">Start the free beta</a>
        </div>
      </section>
      <section className="cta" id="signup">
        <span className="bigmark">
          <Logo />
        </span>
        <div>
          <h2>Ready to find the gold?</h2>
          <p>Start your first sift in seconds.</p>
        </div>
        <a className="gradient" href="#account">
          Start Sifting Free　→
        </a>
      </section>
      <AuthPanel />
      <footer className="dark" id="resources">
        <div className="footBrand">
          <Logo />
          <small>Find the gold.</small>
          <p>●　◎　◉　♪</p>
        </div>
        {[
          ["Product", "Features", "How It Works", "Pricing", "Download desktop beta"],
          ["Support", "Contact"],
        ].map((c) => (
          <div className="col" key={c[0]}>
            <b>{c[0]}</b>
            {c.slice(1).map((x) => (
              x === "Download desktop beta" ? (
                <DesktopDownload key={x} />
              ) : (
                <a href={x === "Features" ? "#features" : x === "How It Works" ? "#how" : x === "Contact" ? "mailto:hello@wordsifter.app" : x === "Pricing" ? "#pricing" : "#account"} key={x}>
                  {x}
                </a>
              )
            ))}
          </div>
        ))}
        <div className="newsletter">
          <b>Newsletter</b>
          <p>
            Get writing tips and WordSifter updates delivered to your inbox.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); setNewsletterMessage("Thanks — you’re on the list."); }}>
            <label className="srOnly" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" placeholder="Email address" required />
            <button type="submit" aria-label="Subscribe to newsletter">→</button>
          </form>
          {newsletterMessage && <p role="status">{newsletterMessage}</p>}
        </div>
        <small className="copyright">
          © 2026 WordSifter. All rights reserved.
        </small>
      </footer>
    </main>
  );
}
