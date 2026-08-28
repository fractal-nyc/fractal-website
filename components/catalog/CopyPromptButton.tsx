import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "error";

export function plainAgentPrompt(prompt: string) {
  return prompt.replaceAll("**", "");
}

export function CopyPromptButton({ componentName, prompt, className = "" }: {
  componentName: string;
  prompt: string;
  className?: string;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(plainAgentPrompt(prompt));
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const label = state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "Copy prompt";
  const announcement = state === "copied"
    ? `Prompt copied for ${componentName}`
    : state === "error"
      ? `Could not copy prompt for ${componentName}`
      : "";

  return <span className="library-copy-control">
    <button type="button" className={className} aria-label={`Copy prompt for ${componentName}`} onClick={copy}>{label}</button>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </span>;
}
