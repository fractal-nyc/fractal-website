import { AdminDesk } from "@/pages/parlor/AdminDesk";
import { ParlorShell } from "@/pages/parlor/ParlorShell";

export function ParlorAdminPage() {
  return (
    <ParlorShell title="The desk — Parlor">
      <AdminDesk />
    </ParlorShell>
  );
}
