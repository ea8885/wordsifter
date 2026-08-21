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
  ["♫", "Songs & Lyrics", "Craft stronger lyrics and hooks.", "purple"],
  ["▣", "Scripts & Screenplays", "Build sharper scenes and dialogue.", "blue"],
  ["▤", "Stories & Novels", "Develop stronger chapters and prose.", "green"],
  ["✎", "Poems & Spoken Word", "Shape rhythm, tone, and impact.", "orange"],
  ["⚑", "Copy & Content", "Write clearer messaging that converts.", "red"],
  [
    "◌",
    "Dialogue & Games",
    "Create natural, believable conversations.",
    "purple",
  ],
];
const reviews = [
  [
    "WordSifter changed how I write. I can see what works, what doesn’t, and level up every time.",
    "JM",
    "Jake M.",
    "Songwriter",
  ],
  [
    "I ship better scripts faster. The sift score is like having an editor in the room.",
    "SL",
    "Sarah L.",
    "Screenwriter",
  ],
  [
    "Finally, a tool that helps me keep my best ideas and cut the rest. Total game changer.",
    "MD",
    "Marcus D.",
    "Content Creator",
  ],
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
              Find what
              <br />
              <span>works.</span>
            </h1>
            <p>
              WordSifter helps you turn rough writing into finished work by
              comparing, scoring, rewriting, and keeping the strongest parts.
            </p>
            <div className="actions">
              <a className="gradient" href="#account">
                Start Sifting Free
              </a>
              <a className="outline" href="#how">
                See It In Action　▷
              </a>
            </div>
            <div className="trust">
              <span>JM</span>
              <span>SL</span>
              <span>AK</span>
              <span>MD</span> Trusted by creators, writers, and teams
              <br />
              　　in 120+ countries.
            </div>
          </div>
          <Demo />
        </div>
        <div className="brands">
          <span>W Writers</span>
          <span>♧ LyricLab</span>
          <span>◉ Studio Ink</span>
          <span>CC Create Co.</span>
          <span>◉ Storyline</span>
          <span>♢ VerseVault</span>
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
          <p className="eye">MADE FOR EVERY CREATOR</p>
          <h2>
            Works the way
            <br />
            you create.
          </h2>
          <p>
            Songs, scripts, stories, poems, copy, dialogue, captions, and more.
            WordSifter fits any process.
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
      <section className="reviews dark">
        <p className="eye">LOVED BY CREATORS</p>
        <div className="reviewGrid">
          {reviews.map((x, i) => (
            <article key={x[2]}>
              <b className={`q${i}`}>“</b>
              <p>{x[0]}</p>
              <div>
                <span>{x[1]}</span>
                <strong>
                  {x[2]}
                  <small>{x[3]}</small>
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="cta" id="signup">
        <span className="bigmark">
          <Logo />
        </span>
        <div>
          <h2>Ready to find what works?</h2>
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
          <small>Find what works.</small>
          <p>●　◎　◉　♪</p>
        </div>
        {[
          ["Product", "Features", "How It Works", "Pricing", "Download desktop beta"],
          ["Resources", "Blog", "Help Center", "Templates", "Guides"],
          ["Company", "About", "Careers", "Contact", "Privacy"],
        ].map((c) => (
          <div className="col" key={c[0]}>
            <b>{c[0]}</b>
            {c.slice(1).map((x) => (
              x === "Download desktop beta" ? (
                <DesktopDownload key={x} />
              ) : (
                <a href={x === "Features" ? "#features" : x === "How It Works" ? "#how" : x === "Resources" ? "#resources" : x === "Contact" ? "mailto:hello@wordsifter.app" : x === "Privacy" ? "/privacy" : "#account"} key={x}>
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
