import { useSearchParams } from "wouter";

import { Gate } from "@/pages/parlor/Gate";
import { InvitationCard } from "@/pages/parlor/Invitation";
import { ParlorShell } from "@/pages/parlor/ParlorShell";

export function ParlorPage() {
  const [params] = useSearchParams();
  const token = params.get("g")?.trim() ?? "";

  if (!token) {
    return (
      <ParlorShell title="Who goes there? — Parlor">
        <Gate />
      </ParlorShell>
    );
  }

  return (
    <ParlorShell title="Parlor — an invitation">
      <InvitationCard token={token} />
    </ParlorShell>
  );
}
