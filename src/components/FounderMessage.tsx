"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FounderMessageProps {
  onClose: () => void;
  session: { user: { user_metadata?: { user_name?: string; preferred_username?: string } } } | null;
  hasClaimed: boolean;
  onSignIn: () => void;
}

type Lang = "en" | "pt";

const MESSAGES: Record<Lang, string[]> = {
  en: [
    "Welcome to a 3D visualization of the Ethiopian Telegram ecosystem.",
    "This city is built from real data. Each building represents a channel, with heights determined by subscribers and widths by engagement. From news hubs to entertainment districts, this is a map of our digital community.",
    "Explore the districts, find your favorite channels, and see the scale of the network.",
  ],
  pt: [
   
  ],
};

const SIGNATURE: Record<Lang, string> = {
  en: "// Samuel Fikre, Developer",
  pt: "// Samuel Fikre",
};


const CHAR_DELAY = 25;
const PARAGRAPH_PAUSE = 400;

export default function FounderMessage({ onClose, session, hasClaimed, onSignIn }: FounderMessageProps) {
  const [lang, setLang] = useState<Lang>("en");
  const [typedText, setTypedText] = useState("");
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [paragraphsDone, setParagraphsDone] = useState<string[]>([]);
  const [showSignature, setShowSignature] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showPS, setShowPS] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charIndexRef = useRef(0);

  const paragraphs = MESSAGES[lang];
  const allParagraphsDone = currentParagraph >= paragraphs.length;

  // Fade in overlay
  useEffect(() => {
    requestAnimationFrame(() => {
      if (overlayRef.current) overlayRef.current.style.opacity = "1";
    });
  }, []);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll helper
  const scrollToBottom = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // Typing effect
  useEffect(() => {
    if (allParagraphsDone) return;

    const text = paragraphs[currentParagraph];
    if (!text) return;

    charIndexRef.current = 0;
    setTypedText("");

    const type = () => {
      if (charIndexRef.current < text.length) {
        charIndexRef.current++;
        setTypedText(text.slice(0, charIndexRef.current));
        scrollToBottom();
        typingRef.current = setTimeout(type, CHAR_DELAY);
      } else {
        // Paragraph done, pause then move to next
        typingRef.current = setTimeout(() => {
          setParagraphsDone((prev) => [...prev, text]);
          setTypedText("");
          setCurrentParagraph((p) => p + 1);
        }, PARAGRAPH_PAUSE);
      }
    };

    // Small initial delay before starting
    typingRef.current = setTimeout(type, currentParagraph === 0 ? 500 : 200);

    return () => {
      if (typingRef.current) clearTimeout(typingRef.current);
    };
  }, [currentParagraph, paragraphs, allParagraphsDone, scrollToBottom]);

  // After all paragraphs done, show signature, support, PS
  useEffect(() => {
    if (!allParagraphsDone) return;

    const t1 = setTimeout(() => {
      setShowSignature(true);
      scrollToBottom();
    }, 600);
    const t2 = setTimeout(() => {
      setShowSupport(true);
      scrollToBottom();
    }, 1800);
    const t3 = setTimeout(() => {
      setShowPS(true);
      scrollToBottom();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [allParagraphsDone, scrollToBottom]);

  // Skip: reveal everything instantly
  const skip = useCallback(() => {
    if (allParagraphsDone) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    setParagraphsDone([...paragraphs]);
    setTypedText("");
    setCurrentParagraph(paragraphs.length);
    setShowSignature(true);
    setShowSupport(true);
    setShowPS(true);
    setTimeout(scrollToBottom, 50);
  }, [allParagraphsDone, paragraphs, scrollToBottom]);

  // Reset typing on language change
  const switchLang = (newLang: Lang) => {
    if (newLang === lang) return;
    if (typingRef.current) clearTimeout(typingRef.current);
    setLang(newLang);
    setTypedText("");
    setCurrentParagraph(0);
    setParagraphsDone([]);
    setShowSignature(false);
    setShowSupport(false);
    setShowPS(false);
    charIndexRef.current = 0;
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-700"
      style={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/90" />

      {/* Message container */}
      <div
        className="relative mx-4 w-full max-w-xl max-h-[85vh] flex flex-col"
        style={{
          border: "2px solid rgba(0, 255, 65, 0.3)",
          background: "rgba(5, 10, 5, 0.95)",
          boxShadow: "4px 4px 0px rgba(0, 255, 65, 0.1)",
        }}
      >
        {/* Header with lang toggle and close */}
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ borderBottom: "1px solid rgba(0, 255, 65, 0.15)" }}
        >
          <div
            className="font-pixel text-[8px] sm:text-[9px] tracking-wider"
            style={{ color: "rgba(0, 255, 65, 0.3)" }}
          >
            &gt; &gt; TG-CITY: Ethiopia
          </div>

          <div className="flex items-center gap-1">
            {/* Language toggle */}
            <button
              onClick={() => switchLang("en")}
              className="font-pixel text-[9px] px-2 py-0.5 cursor-pointer transition-colors"
              style={{
                color: lang === "en" ? "#00ff41" : "rgba(0, 255, 65, 0.25)",
                background: lang === "en" ? "rgba(0, 255, 65, 0.1)" : "transparent",
                border: `1px solid ${lang === "en" ? "rgba(0, 255, 65, 0.3)" : "transparent"}`,
              }}
            >
              EN
            </button>
            <button
              onClick={() => switchLang("pt")}
              className="font-pixel text-[9px] px-2 py-0.5 cursor-pointer transition-colors"
              style={{
                color: lang === "pt" ? "#00ff41" : "rgba(0, 255, 65, 0.25)",
                background: lang === "pt" ? "rgba(0, 255, 65, 0.1)" : "transparent",
                border: `1px solid ${lang === "pt" ? "rgba(0, 255, 65, 0.3)" : "transparent"}`,
              }}
            >
              PT
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="font-pixel text-[12px] ml-3 cursor-pointer transition-colors"
              style={{ color: "rgba(0, 255, 65, 0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.4)")}
            >
              [X]
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div ref={contentRef} className="overflow-y-auto p-6 sm:p-8">
          {/* Completed paragraphs */}
          <div className="flex flex-col gap-4">
            {paragraphsDone.map((text, i) => (
              <p
                key={`${lang}-${i}`}
                className="font-pixel text-[10px] sm:text-[11px] leading-relaxed"
                style={{ color: "#e0e0e0" }}
              >
                {text}
              </p>
            ))}

            {/* Currently typing paragraph */}
            {!allParagraphsDone && typedText.length > 0 && (
              <p
                className="font-pixel text-[10px] sm:text-[11px] leading-relaxed"
                style={{ color: "#e0e0e0" }}
              >
                {typedText}
                <span
                  className="inline-block w-1.75 h-2.75 ml-px align-middle"
                  style={{
                    background: cursorVisible ? "#00ff41" : "transparent",
                    transition: "background 0.1s",
                  }}
                />
              </p>
            )}

            {/* Cursor when waiting for first char */}
            {!allParagraphsDone && typedText.length === 0 && paragraphsDone.length > 0 && (
              <p className="font-pixel text-[10px] sm:text-[11px]">
                <span
                  className="inline-block w-1.75 h-2.75 align-middle"
                  style={{
                    background: cursorVisible ? "#00ff41" : "transparent",
                    transition: "background 0.1s",
                  }}
                />
              </p>
            )}
          </div>

          {/* Signature */}
          <p
            className="font-pixel text-[9px] sm:text-[10px] mt-8 transition-all duration-700"
            style={{
              color: "#00ff41",
              opacity: showSignature ? 0.7 : 0,
              transform: showSignature ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {SIGNATURE[lang]}
          </p>

          {/* CTAs */}
          <div
            className="mt-6 flex flex-col gap-3 transition-all duration-700"
            style={{
              opacity: showSupport ? 1 : 0,
              transform: showSupport ? "translateY(0)" : "translateY(8px)",
            }}
          >
            {/* Primary CTA */}
            {!session || !hasClaimed ? (
              <button
                onClick={() => { onClose(); onSignIn(); }}
                className="inline-block font-pixel text-[10px] sm:text-[11px] px-4 py-2 uppercase tracking-wider transition-all duration-300 cursor-pointer text-left"
                style={{
                  color: "#0d0d0f",
                  background: "#00ff41",
                  border: "2px solid #00ff41",
                  boxShadow: "3px 3px 0px rgba(0, 255, 65, 0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#00cc33"; e.currentTarget.style.borderColor = "#00cc33"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#00ff41"; e.currentTarget.style.borderColor = "#00ff41"; }}
              >
                {lang === "en" ? "Join the City" : "Join the city"}
              </button>
            ) : (
              <a
                href="https://discord.gg/2bTjFAkny7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-pixel text-[10px] sm:text-[11px] px-4 py-2 uppercase tracking-wider transition-all duration-300"
                style={{
                  color: "#0d0d0f",
                  background: "#00ff41",
                  border: "2px solid #00ff41",
                  boxShadow: "3px 3px 0px rgba(0, 255, 65, 0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#00cc33"; e.currentTarget.style.borderColor = "#00cc33"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#00ff41"; e.currentTarget.style.borderColor = "#00ff41"; }}
              >
                {lang === "en" ? "Join the Discord" : "Entrar no Discord"}
              </a>
            )}

            {/* Secondary CTA */}
            {session && hasClaimed ? (
              <a
                href={`/?user=${session.user.user_metadata?.user_name ?? session.user.user_metadata?.preferred_username}`}
                onClick={onClose}
                className="inline-block font-pixel text-[10px] sm:text-[11px] px-4 py-2 uppercase tracking-wider transition-all duration-300"
                style={{
                  color: "#00ff41",
                  border: "2px solid rgba(0, 255, 65, 0.4)",
                  background: "rgba(0, 255, 65, 0.05)",
                  boxShadow: "3px 3px 0px rgba(0, 255, 65, 0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 255, 65, 0.15)"; e.currentTarget.style.borderColor = "#00ff41"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0, 255, 65, 0.05)"; e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.4)"; }}
              >
                {lang === "en" ? "See your building" : "Ver seu prédio"}
              </a>
            ) : (
              <a
                href="https://github.com/Samuel-Fikre/tg-city"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-pixel text-[10px] sm:text-[11px] px-4 py-2 uppercase tracking-wider transition-all duration-300"
                style={{
                  color: "#00ff41",
                  border: "2px solid rgba(0, 255, 65, 0.4)",
                  background: "rgba(0, 255, 65, 0.05)",
                  boxShadow: "3px 3px 0px rgba(0, 255, 65, 0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0, 255, 65, 0.15)"; e.currentTarget.style.borderColor = "#00ff41"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0, 255, 65, 0.05)"; e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.4)"; }}
              >
                {lang === "en" ? "View Project" : "Ver Projeto"}
              </a>
            )}

            
          </div>

          {/* P.S. removed */}
        </div>

        {/* Skip footer */}
        {!allParagraphsDone && (
          <div
            className="px-6 py-3 flex justify-center"
            style={{ borderTop: "1px solid rgba(0, 255, 65, 0.1)" }}
          >
            <button
              onClick={skip}
              className="font-pixel text-[9px] px-3 py-1 cursor-pointer transition-colors tracking-wider"
              style={{ color: "rgba(0, 255, 65, 0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00ff41")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0, 255, 65, 0.3)")}
            >
              SKIP &gt;&gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
