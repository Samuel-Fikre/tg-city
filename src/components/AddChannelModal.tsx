"use client";

import { useState, useCallback, useEffect } from "react";

interface AddChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (handle: string) => void;
  accentColor: string;
}

type ModalState = "idle" | "loading" | "success" | "error";

// Loading phases for real-time scraper feedback
const LOADING_PHASES = [
  { delay: 0, text: "Connecting to Telegram..." },
  { delay: 3000, text: "Fetching channel metrics..." },
  { delay: 6000, text: "Analyzing posts & views..." },
  { delay: 9000, text: "Generating 3D building..." },
];

export function AddChannelModal({ isOpen, onClose, onSuccess, accentColor }: AddChannelModalProps) {
  const [handle, setHandle] = useState("");
  const [state, setState] = useState<ModalState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [addedHandle, setAddedHandle] = useState<string>("");

  const reset = useCallback(() => {
    setHandle("");
    setState("idle");
    setErrorMsg("");
    setPhaseIndex(0);
    setAddedHandle("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  // Manage loading phases
  useEffect(() => {
    if (state !== "loading") {
      // Reset phase index async to avoid ESLint warning
      const timer = setTimeout(() => setPhaseIndex(0), 0);
      return () => clearTimeout(timer);
    }
    const timers = LOADING_PHASES.map((phase, i) =>
      setTimeout(() => setPhaseIndex(i), phase.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [state]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedHandle = handle.trim().toLowerCase().replace(/^@/, "");
    if (!cleanedHandle) return;

    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: cleanedHandle }),
      });

      if (res.ok) {
        const data = await res.json();
        const returnedHandle = data.handle || cleanedHandle;
        setAddedHandle(returnedHandle);
        setState("success");
        onSuccess?.(returnedHandle);
        // Auto-close after 2 seconds on success
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || "Failed to add channel. Please try again.");
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }, [handle, onSuccess, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={state !== "loading" ? handleClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 border-2 border-border bg-bg-raised/95 backdrop-blur-md p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={state !== "loading" ? handleClose : undefined}
          disabled={state === "loading"}
          className="absolute top-3 right-3 text-[12px] text-muted transition-colors hover:text-cream disabled:opacity-50"
        >
          &#10005;
        </button>

        {/* Header */}
        <h2 className="mb-4 text-lg font-pixel text-cream uppercase tracking-wide">
          Add Telegram Channel
        </h2>

        {/* Content based on state */}
        {state === "idle" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] text-muted uppercase">
                Channel Handle
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@tikvahethiopia or tikvahethiopia"
                className="w-full border-2 border-border bg-bg px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-dim focus:border-border-light"
                onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={!handle.trim()}
              className="btn-press w-full py-2.5 text-sm text-bg uppercase tracking-wider disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              Add to City
            </button>
          </form>
        )}

        {state === "loading" && (
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div 
                className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-transparent"
                style={{ borderTopColor: accentColor }}
              />
            </div>
            <p className="text-[12px] text-muted normal-case animate-pulse">
              {LOADING_PHASES[phaseIndex]?.text || "Processing..."}
            </p>
            <p className="mt-2 text-[10px] text-muted/60 normal-case">
              This may take 5-10 seconds
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="py-6 text-center">
            <div className="mb-3 text-4xl">🏗️</div>
            <p className="text-[13px] text-cream normal-case mb-1">
              Building Construction Started!
            </p>
            <p className="text-[11px] text-muted normal-case">
              The channel will appear in the city shortly.
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="py-4 text-center">
            <div className="mb-3 text-3xl">⚠️</div>
            <p className="text-[12px] text-cream normal-case mb-3">
              {errorMsg}
            </p>
            <button
              onClick={() => setState("idle")}
              className="btn-press px-4 py-2 text-[11px] text-bg uppercase"
              style={{ backgroundColor: accentColor }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Footer hint */}
        <p className="mt-4 text-[9px] text-muted/60 text-center normal-case">
          The channel must be public on Telegram to be added.
        </p>
      </div>
    </div>
  );
}
