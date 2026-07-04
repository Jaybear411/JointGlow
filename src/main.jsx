import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const HERO_VIDEO_URL = "https://pub-78e94e798dbf4918b688d466943cd24b.r2.dev/JointGlow%20Video.mp4";
const HERO_POSTER_URL = new URL("../generated/jointglow-cinematic-v2/frame-01-machine-intro.png", import.meta.url).href;
const AMBIENT_AUDIO_URL = "/assets/elegy-for-peace.mp3";

const assets = {
  logo: "/assets/jointglow-logo.png",
  yoga: "/assets/lifestyle-yoga.png",
  walking: "/assets/lifestyle-walking.png",
  garden: "/assets/lifestyle-garden.png",
};

const navItems = [
  ["Pain relief reimagined", "/#pain-relief"],
  ["Your treatment journey", "/#journey"],
  ["Your care team", "/#care-team"],
  ["Research", "/#research"],
  ["Blog", "/#blog"],
];

function App() {
  const path = window.location.pathname;
  const page = path.startsWith("/glowy") ? "glowy" : "home";

  useEffect(() => {
    document.title =
      page === "glowy" ? "Glowy Assessment | JointGlow" : "JointGlow | Low-Dose Radiotherapy for Joint Pain Relief";
  }, [page]);

  useAmbientAudio();

  return (
    <>
      <Header />
      {page === "glowy" ? <GlowyPage /> : <HomePage />}
      <ScheduleModal />
    </>
  );
}

function useAmbientAudio() {
  useEffect(() => {
    const audio = new Audio(AMBIENT_AUDIO_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.32;

    let unlocked = false;

    const play = async () => {
      if (unlocked) return;
      try {
        await audio.play();
        unlocked = true;
        cleanupUnlockListeners();
      } catch (error) {
        addUnlockListeners();
      }
    };

    const unlock = () => {
      play();
    };

    const stop = () => {
      cleanupUnlockListeners();
      audio.pause();
      audio.currentTime = 0;
      unlocked = true;
    };

    const addUnlockListeners = () => {
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
      window.addEventListener("touchstart", unlock, { once: true });
    };

    const cleanupUnlockListeners = () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };

    play();
    window.addEventListener("jointglow:stop-ambient-audio", stop);

    return () => {
      cleanupUnlockListeners();
      window.removeEventListener("jointglow:stop-ambient-audio", stop);
      audio.pause();
      audio.src = "";
    };
  }, []);
}

function stopAmbientAudio() {
  window.dispatchEvent(new Event("jointglow:stop-ambient-audio"));
}

function Header() {
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-open", open);
    return () => document.body.classList.remove("nav-open");
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header ${elevated ? "is-elevated" : ""}`}>
      <a className="brand" href="/" aria-label="JointGlow home" onClick={close}>
        <img src={assets.logo} alt="JointGlow" />
      </a>
      <button className="menu-button" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span />
        <span />
      </button>
      <nav className="main-nav" aria-label="Primary navigation">
        {navItems.map(([label, href]) => (
          <a href={href} onClick={close} key={href}>{label}</a>
        ))}
      </nav>
      <button className="header-cta liquid-glass-strong" type="button" onClick={openSchedule}>Schedule a consultation</button>
    </header>
  );
}

function HomePage() {
  useReveal();

  return (
    <main id="home" className="home-page">
      <HeroSection />

      <section className="intro-band" aria-label="JointGlow overview">
        <div className="intro-statement reveal">
          <span>JointGlow</span>
          <p>Modern joint pain care, guided by radiotherapy specialists.</p>
        </div>
        <div className="intro-metrics reveal">
          <Metric value="Decades" label="European use" />
          <Metric value="6-10" label="brief visits" />
          <Metric value="2" label="locations" />
        </div>
      </section>

      <TreatmentSection />
      <ProcessSection />
      <DoctorsSection />
      <ResearchSection />

      <section className="image-break">
        <img src={assets.garden} alt="Older adult gardening comfortably at home" />
        <div className="image-break-copy reveal">
          <p className="eyebrow">For everyday life</p>
          <h2>More time doing what still feels like you.</h2>
        </div>
      </section>

      <LocationsSection />
      <BlogSection />

      <section className="final-cta">
        <div className="reveal">
          <p className="eyebrow">Begin with clarity</p>
          <h2>Start with a clear next step.</h2>
        </div>
        <div className="final-actions reveal">
          <button className="button primary" type="button" onClick={openSchedule}>Schedule Consultation</button>
          <a className="button secondary light" href="/glowy">Start Assessment with Glowy</a>
        </div>
      </section>
    </main>
  );
}

function HeroSection() {
  const [mode, setMode] = useState("hero");
  const hasOpenedChat = useRef(false);
  const chat = useGlowyChat();
  const voice = useVapiVoice();

  function submitHeroMessage(event) {
    event.preventDefault();
    stopAmbientAudio();
    const sent = chat.sendHeroMessage();
    if (sent) {
      if (!hasOpenedChat.current) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        hasOpenedChat.current = true;
      }
      setMode("chat");
    }
  }

  function startVoiceMode() {
    stopAmbientAudio();
    setMode("voice");
    voice.startVoice();
  }

  function closeVoiceMode() {
    voice.stopVoice();
    setMode("hero");
  }

  return (
    <section className={`hero-section cinematic-hero mode-${mode}`} aria-label="JointGlow AI consultation">
      <div className="hero-media" aria-hidden="true">
        <video
          className="hero-video"
          src={HERO_VIDEO_URL}
          poster={HERO_POSTER_URL}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-scrim" />
      </div>

      <div className="hero-content">
        <h1>Pain relief, reimagined.</h1>
        <LiquidGlassInput
          value={chat.draft}
          onChange={chat.setDraft}
          onSubmit={submitHeroMessage}
          onVoice={startVoiceMode}
          disabled={chat.loading}
        />
      </div>

      <ChatOverlay
        active={mode === "chat"}
        messages={chat.messages}
        typedResponse={chat.typedResponse}
        loading={chat.loading}
        draft={chat.draft}
        setDraft={chat.setDraft}
        onSubmit={submitHeroMessage}
        onClose={() => setMode("hero")}
      />

      <VoiceOverlay active={mode === "voice"} status={voice.status} onClose={closeVoiceMode} />
    </section>
  );
}

function LiquidGlassInput({ value, onChange, onSubmit, onVoice, disabled }) {
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      onSubmit(event);
    }
  }

  return (
    <form className="hero-chat-bar liquid-glass-strong" onSubmit={onSubmit}>
      <input
        aria-label="Talk to Glowy"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Talk to Glowy for more information."
        disabled={disabled}
      />
      <button className="voice-button liquid-glass" type="button" aria-label="Start voice consultation" onClick={onVoice}>
        <EarIcon />
      </button>
    </form>
  );
}

function ChatOverlay({ active, messages, typedResponse, loading, draft, setDraft, onSubmit, onClose }) {
  return (
    <div className={`chat-overlay ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <button className="overlay-close liquid-glass" type="button" onClick={onClose}>Close</button>
      <div className="immersive-chat">
        <div className="immersive-messages">
          {messages.map((message, index) => (
            <div className={`immersive-bubble ${message.role}`} key={`${message.role}-${index}`}>
              {message.content}
            </div>
          ))}
          {(loading || typedResponse) && (
            <div className="immersive-bubble assistant">
              {typedResponse || <span className="typing-dots"><i /><i /><i /></span>}
            </div>
          )}
        </div>
        <form className="chat-dock liquid-glass-strong" onSubmit={onSubmit}>
          <input
            aria-label="Continue with Glowy"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSubmit(event);
            }}
            placeholder="Continue with Glowy..."
          />
          <button className="dock-send" type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

function VoiceOverlay({ active, status, onClose }) {
  return (
    <div className={`voice-overlay ${active ? "is-active" : ""}`} aria-hidden={!active}>
      <button className="overlay-close liquid-glass" type="button" onClick={onClose}>Close</button>
      <div className="voice-stage">
        <VoiceOrb status={status} />
        <p className="voice-state">{voiceStatusLabel(status)}</p>
      </div>
    </div>
  );
}

function VoiceOrb({ status }) {
  return (
    <div className={`voice-orb ${status}`} aria-label={`Glowy voice status: ${voiceStatusLabel(status)}`}>
      <span />
      <span />
      <span />
    </div>
  );
}

function EarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.2 10.2c0-3.1 2.3-5.4 5.2-5.4 2.8 0 5 2.1 5 4.9 0 2.1-.9 3.2-2.5 4.7-1.1 1-1.6 1.7-1.6 2.7 0 1.5-1.2 2.7-2.9 2.7-1.1 0-2.1-.4-2.9-1.2" />
      <path d="M11 10.1c0-1.4 1-2.4 2.4-2.4s2.4 1 2.4 2.4c0 .9-.4 1.5-1.1 2.1-.8.8-1.3 1.4-1.3 2.5" />
      <path d="M6 12.2c0-4.7 3.3-8.3 7.6-8.3" />
    </svg>
  );
}

function useGlowyChat() {
  const [conversationId, setConversationId] = useState(() => localStorage.getItem("jointglowConversationId") || "");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typedResponse, setTypedResponse] = useState("");

  function sendHeroMessage() {
    const trimmed = draft.trim();
    if (!trimmed || loading) return false;

    const userMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setTypedResponse("");
    setLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, message: trimmed }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Unable to reach Glowy.");
        }

        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem("jointglowConversationId", data.conversationId);
        }

        typeAssistantReply(data.reply || "Thank you. Tell me a little more.", nextMessages);
      })
      .catch((error) => {
        typeAssistantReply(error.message || "I could not connect just now. Please try again in a moment.", nextMessages);
      });

    return true;
  }

  function typeAssistantReply(response, nextMessages) {
    let index = 0;
    setLoading(false);
    const timer = window.setInterval(() => {
      index += 1;
      setTypedResponse(response.slice(0, index));
      if (index >= response.length) {
        window.clearInterval(timer);
        setMessages([...nextMessages, { role: "assistant", content: response }]);
        setTypedResponse("");
      }
    }, 18);
  }

  return { draft, setDraft, messages, loading, typedResponse, sendHeroMessage };
}

function useVapiVoice() {
  const [status, setStatus] = useState("idle");
  const vapiRef = useRef(null);

  async function startVoice() {
    if (status === "connecting" || status === "listening" || status === "speaking") return;

    setStatus("connecting");
    try {
      const conversationId = localStorage.getItem("jointglowConversationId") || "";
      const configResponse = await fetch(`/api/vapi/config${conversationId ? `?conversationId=${conversationId}` : ""}`);
      const config = await configResponse.json().catch(() => ({}));

      if (!configResponse.ok) {
        throw new Error("Unable to load Vapi configuration.");
      }

      if (!config.publicKey || !config.assistantId) {
        setStatus("not-configured");
        return;
      }

      const { default: Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(config.publicKey);
      vapiRef.current = vapi;

      vapi.on("call-start", () => setStatus("listening"));
      vapi.on("speech-start", () => setStatus("speaking"));
      vapi.on("speech-end", () => setStatus("listening"));
      vapi.on("call-end", () => {
        vapiRef.current = null;
        setStatus("ended");
      });
      vapi.on("error", () => {
        vapiRef.current = null;
        setStatus("error");
      });

      await vapi.start(config.assistantId, {
        variableValues: {
          ...(config.variableValues || {}),
          conversationId: conversationId || "new",
          firstQuestion: config.firstMessage || "Hi, I'm Glowy, what is your name?",
        },
      });
    } catch (error) {
      vapiRef.current = null;
      setStatus("error");
    }
  }

  function stopVoice() {
    if (vapiRef.current) {
      vapiRef.current.stop();
      vapiRef.current = null;
    }
    setStatus("ended");
  }

  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  return { status, startVoice, stopVoice };
}

function voiceStatusLabel(status) {
  const labels = {
    idle: "Glowy is ready",
    connecting: "Connecting",
    listening: "Listening",
    speaking: "Speaking",
    ended: "Call ended",
    error: "Voice unavailable",
    "not-configured": "Add Vapi keys to enable voice",
  };
  return labels[status] || labels.idle;
}

function Metric({ value, label }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

const conditionContent = {
  osteoarthritis: ["Osteoarthritis", "For stiffness that limits movement."],
  bursitis: ["Bursitis", "For painful, inflamed cushioning around joints."],
  tendon: ["Tendon pain", "For persistent irritation and limited function."],
  plantar: ["Foot and ankle pain", "For standing, walking, and travel."],
};

function TreatmentSection() {
  const [active, setActive] = useState("osteoarthritis");
  const [title, body] = conditionContent[active];

  return (
    <section className="section split-section" id="pain-relief">
      <div className="section-copy reveal">
        <p className="eyebrow">Pain relief reimagined</p>
        <h2>Targeted care for movement that matters.</h2>
        <p>A small, focused dose designed to calm inflammation without surgery or injections.</p>
        <div className="condition-list">
          <button className={`condition ${active === "osteoarthritis" ? "active" : ""}`} type="button" onClick={() => setActive("osteoarthritis")}>Osteoarthritis</button>
          <button className={`condition ${active === "bursitis" ? "active" : ""}`} type="button" onClick={() => setActive("bursitis")}>Bursitis</button>
          <button className={`condition ${active === "tendon" ? "active" : ""}`} type="button" onClick={() => setActive("tendon")}>Tendon pain</button>
          <button className={`condition ${active === "plantar" ? "active" : ""}`} type="button" onClick={() => setActive("plantar")}>Foot and ankle pain</button>
        </div>
        <div className="condition-panel" aria-live="polite">
          <h3>{title}</h3>
          <p>{body}</p>
        </div>
      </div>
      <div className="editorial-image reveal">
        <img src={assets.walking} alt="Older couple walking confidently outside" />
      </div>
    </section>
  );
}

function ProcessSection() {
  const items = [
    ["01", "Consultation", "Symptoms, imaging, and goals."],
    ["02", "Planning", "Candidacy and care path."],
    ["03", "Treatment", "Short outpatient visits."],
    ["04", "Follow-up", "Progress you can track."],
  ];

  return (
    <section className="section process-section" id="journey">
      <div className="section-heading reveal">
        <p className="eyebrow">Your treatment journey</p>
        <h2>Clear from the first conversation.</h2>
      </div>
      <div className="timeline">
        {items.map(([num, title, copy]) => (
          <article className="timeline-item reveal" key={num}>
            <span>{num}</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DoctorsSection() {
  return (
    <section className="section doctors-section" id="care-team">
      <div className="section-heading reveal">
        <p className="eyebrow">Clinical expertise</p>
        <h2>Specialist-led care.</h2>
      </div>
      <div className="doctor-grid">
        <Doctor initials="ET" name="Evan Thomas, MD, PhD" copy="Physician-scientist in precision radiotherapy." />
        <Doctor initials="BK" name="Bobby Koneru, MD, FASTRO" copy="Nationally recognized radiation oncology leader." />
      </div>
    </section>
  );
}

function ResearchSection() {
  const items = [
    ["Measured inflammation", "Low-dose radiotherapy is planned around the precise painful region and clinical history."],
    ["Specialist review", "Your symptoms, imaging, and goals are reviewed before treatment guidance is offered."],
    ["Clear follow-up", "Progress is tracked over time so next steps stay visible and practical."],
  ];

  return (
    <section className="section research-section" id="research">
      <div className="section-heading reveal">
        <p className="eyebrow">Research</p>
        <h2>Evidence-minded care, explained plainly.</h2>
      </div>
      <div className="research-grid">
        {items.map(([title, copy]) => (
          <article className="research-card liquid-glass reveal" key={title}>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Doctor({ initials, name, copy }) {
  return (
    <article className="doctor-card reveal">
      <div className="doctor-monogram">{initials}</div>
      <div>
        <p className="doctor-role">Radiation Oncology</p>
        <h3>{name}</h3>
        <p>{copy}</p>
      </div>
    </article>
  );
}

function LocationsSection() {
  return (
    <section className="section locations-section" id="locations">
      <div className="section-heading reveal">
        <p className="eyebrow">Locations</p>
        <h2>Care in Central Florida.</h2>
      </div>
      <div className="location-grid">
        <Location name="JointGlow Winter Park" area="Winter Park" copy="Consultation and treatment planning." />
        <Location name="JointGlow Ocoee" area="Ocoee" copy="West-side access for evaluation and follow-up." />
      </div>
    </section>
  );
}

function BlogSection() {
  const posts = [
    ["What makes joint pain linger?", "How inflammation, mechanics, and daily movement can overlap."],
    ["Preparing for a consultation", "The symptoms, records, and goals that make the first visit clearer."],
    ["Treatment without surgery", "A look at non-invasive paths for stubborn osteoarthritis and bursitis pain."],
  ];

  return (
    <section className="section blog-section" id="blog">
      <div className="section-heading reveal">
        <p className="eyebrow">Blog</p>
        <h2>Helpful reading before your next step.</h2>
      </div>
      <div className="blog-grid">
        {posts.map(([title, copy]) => (
          <article className="blog-card reveal" key={title}>
            <span>Guide</span>
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Location({ area, name, copy }) {
  return (
    <article className="location-card reveal">
      <span>{area}</span>
      <h3>{name}</h3>
      <p>{copy}</p>
      <button className="text-button" type="button" onClick={openSchedule}>Schedule here</button>
    </article>
  );
}

function GlowyPage() {
  useReveal();

  return (
    <main className="glowy-page">
      <section className="glowy-hero">
        <div className="glowy-hero-copy reveal">
          <p className="eyebrow">Glowy Assessment</p>
          <h1>Your visit, already organized.</h1>
          <p className="hero-copy">Chat with Glowy or start a voice call.</p>
        </div>
      </section>
      <section className="section chat-section">
        <div className="assessment-copy reveal">
          <p className="eyebrow">Specialist-ready</p>
          <h2>Simple answers. Clear summary.</h2>
          <p>Glowy remembers what you share and asks only what is needed.</p>
          <ul className="quiet-list">
            <li>Symptoms</li>
            <li>Goals</li>
            <li>Records</li>
          </ul>
        </div>
        <GlowyChat />
      </section>
    </main>
  );
}

function GlowyChat() {
  const [conversationId, setConversationId] = useState(() => localStorage.getItem("jointglowConversationId") || "");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I'm Glowy, what is your name?" },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [intake, setIntake] = useState({});
  const [voiceStatus, setVoiceStatus] = useState("idle");

  const completeCount = useMemo(() => Object.values(intake).filter(Boolean).length, [intake]);

  async function sendMessage(event) {
    event?.preventDefault();
    stopAmbientAudio();
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setText("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to reach Glowy.");

      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem("jointglowConversationId", data.conversationId);
      }

      setIntake(data.intake || {});
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages([...nextMessages, { role: "assistant", content: error.message || "I could not connect just now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  async function startVoiceCall() {
    stopAmbientAudio();
    setVoiceStatus("connecting");
    try {
      const configResponse = await fetch(`/api/vapi/config${conversationId ? `?conversationId=${conversationId}` : ""}`);
      const config = await configResponse.json();
      if (!config.publicKey || !config.assistantId) {
        setVoiceStatus("not-configured");
        return;
      }

      const { default: Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(config.publicKey);
      vapi.on("call-start", () => setVoiceStatus("live"));
      vapi.on("call-end", () => setVoiceStatus("ended"));
      vapi.on("error", () => setVoiceStatus("error"));
      await vapi.start(config.assistantId, {
        variableValues: {
          conversationId: conversationId || "new",
          firstQuestion: "Hi, I'm Glowy, what is your name?",
        },
      });
    } catch (error) {
      setVoiceStatus("error");
    }
  }

  return (
    <section className="chat-shell reveal" aria-label="Glowy chat">
      <div className="glowy-header">
        <div className="glowy-mark">G</div>
        <div>
          <span>Glowy</span>
          <strong>{completeCount} intake details captured</strong>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
            {message.content}
          </div>
        ))}
        {loading && <div className="chat-bubble assistant">Thinking...</div>}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          aria-label="Message Glowy"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your answer..."
        />
        <button className="button primary" type="submit" disabled={loading}>Send</button>
      </form>

      <div className="voice-row">
        <button className="button ghost" type="button" onClick={startVoiceCall}>Prefer to talk? Start voice call</button>
        <span>{voiceLabel(voiceStatus)}</span>
      </div>
    </section>
  );
}

function voiceLabel(status) {
  const labels = {
    idle: "Vapi-ready",
    connecting: "Connecting...",
    live: "Voice call live",
    ended: "Call ended",
    error: "Voice unavailable",
    "not-configured": "Add Vapi keys to enable voice",
  };
  return labels[status] || labels.idle;
}

function ScheduleModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.openScheduleModal = () => setOpen(true);
    return () => {
      delete window.openScheduleModal;
    };
  }, []);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="schedule-modal" onSubmit={(event) => event.preventDefault()}>
        <button className="modal-close" type="button" aria-label="Close consultation form" onClick={() => setOpen(false)}>Close</button>
        <p className="eyebrow">Consultation request</p>
        <h2>Tell us where to reach you.</h2>
        <div className="form-grid">
          <label>Full name<input type="text" placeholder="Jane Smith" /></label>
          <label>Preferred location<select><option>Winter Park</option><option>Ocoee</option></select></label>
          <label>Phone<input type="tel" placeholder="(407) 555-0123" /></label>
          <label>Email<input type="email" placeholder="jane@example.com" /></label>
        </div>
        <label>What is bothering you?<textarea placeholder="Briefly describe your pain and goals." /></label>
        <button className="button primary full" type="button" onClick={() => setOpen(false)}>Request Consultation</button>
        <p className="fine-print">Demo only. Final intake should use secure, compliant handling.</p>
      </form>
    </div>
  );
}

function openSchedule() {
  window.openScheduleModal?.();
}

function useReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    reveals.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

createRoot(document.getElementById("root")).render(<App />);
