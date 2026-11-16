import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/button";
import { MandelbrotCorners } from "@/components/ui/MandelbrotCorners";
import { Field, Notice, controlClass } from "@/pages/parlor/fields";
import { lookupInvitation } from "@/parlor/client";

export function Gate() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const result = await lookupInvitation(email);
      if (result.found) {
        navigate(`/parlor?g=${encodeURIComponent(result.token)}`);
        return;
      }
      setError("We couldn't find an invitation for that address. Check the spelling, or ask the person who invited you.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The door is stuck. Try once more.");
    } finally {
      setPending(false);
    }
  }

  return (
    <FadeIn>
      <div className="rounded-lg border border-foreground/20 bg-background p-2 text-foreground">
        <MandelbrotCorners
          size="xs"
          opacity={0.45}
          className="rounded-md border border-foreground-faint bg-background p-6 text-foreground"
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-6" data-parlor-gate>
            <div className="flex flex-col gap-3 text-center">
              <p className="text-label text-foreground-muted">Parlor</p>
              <h1 className="text-title text-foreground">Who goes there?</h1>
              <p className="text-aside text-foreground-muted">
                The evening is invited. Give the address on your card.
              </p>
            </div>
            <Field label="Email">
              <input
                className={controlClass}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                spellCheck={false}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            {error ? <Notice>{error}</Notice> : null}
            <div className="flex flex-col" data-testid="parlor-gate-actions">
              <Button type="submit" disabled={pending} className="w-full whitespace-normal text-center">
                {pending ? "One moment" : "Present yourself"}
              </Button>
            </div>
          </form>
        </MandelbrotCorners>
      </div>
    </FadeIn>
  );
}
