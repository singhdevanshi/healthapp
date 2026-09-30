import { HeaderActionsProvider } from "@agent-native/toolkit/app-shell";
import {
  IconCalendarEvent,
  IconClipboardHeart,
  IconContrast,
  IconHome2,
  IconMicrophone,
  IconMoon,
  IconPill,
  IconVolume,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

interface LayoutProps {
  children: React.ReactNode;
}

type SpeechRecognitionLike = {
  lang: string;
  onresult:
    | ((event: {
        results: ArrayLike<ArrayLike<{ transcript: string }>>;
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const destinations = [
  { label: "Home", href: "/", Icon: IconHome2 },
  { label: "Medicines", href: "/medicines", Icon: IconPill },
  { label: "Appointments", href: "/appointments", Icon: IconCalendarEvent },
  { label: "My Plan", href: "/plan", Icon: IconClipboardHeart },
];

const textSizes = [
  { label: "Standard", value: "standard" },
  { label: "Large", value: "large" },
  { label: "Extra large", value: "extra-large" },
  { label: "Maximum", value: "maximum" },
];

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [textSize, setTextSize] = useState("standard");
  const [highContrast, setHighContrast] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [listening, setListening] = useState(false);
  const [reading, setReading] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("everwell-accessibility");
    if (!saved) return;
    try {
      const preferences = JSON.parse(saved) as {
        textSize?: string;
        highContrast?: boolean;
        darkMode?: boolean;
        reduceMotion?: boolean;
      };
      if (textSizes.some((size) => size.value === preferences.textSize)) {
        setTextSize(preferences.textSize!);
      }
      setHighContrast(preferences.highContrast ?? false);
      setDarkMode(preferences.darkMode ?? false);
      setReduceMotion(preferences.reduceMotion ?? false);
    } catch {
      localStorage.removeItem("everwell-accessibility");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = textSize;
    root.dataset.highContrast = String(highContrast);
    root.dataset.reduceMotion = String(reduceMotion);
    root.classList.toggle("dark", darkMode);
    localStorage.setItem(
      "everwell-accessibility",
      JSON.stringify({ textSize, highContrast, darkMode, reduceMotion }),
    );
  }, [textSize, highContrast, darkMode, reduceMotion]);

  function toggleReadAloud() {
    if (reading) {
      window.speechSynthesis?.cancel();
      setReading(false);
      return;
    }
    const content = document
      .querySelector(".wellness-main")
      ?.textContent?.trim();
    if (!content || !window.speechSynthesis) {
      setVoiceStatus("Read-aloud is not available in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => setReading(false);
    utterance.onerror = () => setReading(false);
    window.speechSynthesis.speak(utterance);
    setReading(true);
  }

  function toggleVoiceNavigation() {
    if (recognition.current) {
      recognition.current.stop();
      recognition.current = null;
      setListening(false);
      return;
    }
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceStatus("Voice navigation is not available in this browser.");
      return;
    }
    const activeRecognition = new SpeechRecognition();
    activeRecognition.lang = document.documentElement.lang || "en-US";
    activeRecognition.onresult = (event) => {
      const phrase = event.results[0]?.[0]?.transcript.toLowerCase() ?? "";
      const destination =
        phrase.includes("appointment") || phrase.includes("visit")
          ? "/appointments"
          : phrase.includes("plan")
            ? "/plan"
            : phrase.includes("refill")
              ? "/refill"
              : phrase.includes("medicine") || phrase.includes("medication")
                ? "/medicines"
                : phrase.includes("home")
                  ? "/"
                  : null;
      if (destination) {
        navigate(destination);
        setVoiceStatus(
          `Opening ${destination === "/" ? "home" : destination.slice(1)}.`,
        );
      } else {
        setVoiceStatus(
          "I did not catch that. Try medicines, appointments, plan, or home.",
        );
      }
    };
    activeRecognition.onerror = () =>
      setVoiceStatus("I could not hear that. Please try again.");
    activeRecognition.onend = () => {
      recognition.current = null;
      setListening(false);
    };
    recognition.current = activeRecognition;
    setVoiceStatus(
      "Listening. Say medicines, appointments, plan, refill, or home.",
    );
    setListening(true);
    activeRecognition.start();
  }

  return (
    <HeaderActionsProvider>
      <div className="wellness-shell">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <header className="wellness-header">
          <Link className="brand-link" to="/" aria-label="Everwell home">
            <span className="brand-mark" aria-hidden="true">
              e
            </span>
            <span>Everwell</span>
          </Link>
          <div className="header-actions">
            <details className="accessibility-menu">
              <summary>Text size & access</summary>
              <div className="accessibility-panel">
                <fieldset>
                  <legend>Text size</legend>
                  <div className="size-options">
                    {textSizes.map((size) => (
                      <button
                        aria-pressed={textSize === size.value}
                        className="size-option"
                        key={size.value}
                        onClick={() => setTextSize(size.value)}
                        type="button"
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="setting-toggle">
                  <span>
                    <IconContrast aria-hidden="true" size={24} /> High contrast
                  </span>
                  <input
                    checked={highContrast}
                    onChange={(event) => setHighContrast(event.target.checked)}
                    type="checkbox"
                  />
                </label>
                <label className="setting-toggle">
                  <span>
                    <IconMoon aria-hidden="true" size={24} /> Dark mode
                  </span>
                  <input
                    checked={darkMode}
                    onChange={(event) => setDarkMode(event.target.checked)}
                    type="checkbox"
                  />
                </label>
                <label className="setting-toggle">
                  <span>Reduce motion</span>
                  <input
                    checked={reduceMotion}
                    onChange={(event) => setReduceMotion(event.target.checked)}
                    type="checkbox"
                  />
                </label>
              </div>
            </details>
            <button
              className="utility-button"
              onClick={toggleReadAloud}
              type="button"
            >
              <IconVolume aria-hidden="true" size={24} />{" "}
              {reading ? "Stop reading" : "Listen"}
            </button>
            <button
              aria-pressed={listening}
              className="utility-button"
              onClick={toggleVoiceNavigation}
              type="button"
            >
              <IconMicrophone aria-hidden="true" size={24} />{" "}
              {listening ? "Stop voice" : "Speak"}
            </button>
          </div>
        </header>
        <main className="wellness-main" id="main-content" tabIndex={-1}>
          {children}
          <p aria-live="polite" className="sr-only">
            {voiceStatus}
          </p>
        </main>
        <nav aria-label="Main navigation" className="bottom-navigation">
          {destinations.map(({ label, href, Icon }) => (
            <Link
              aria-current={
                pathname === href ||
                (href === "/medicines" && pathname === "/refill")
                  ? "page"
                  : undefined
              }
              className="navigation-link"
              key={href}
              to={href}
            >
              <Icon aria-hidden="true" size={27} stroke={2} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </HeaderActionsProvider>
  );
}
