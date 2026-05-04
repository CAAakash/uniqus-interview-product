"use client";

import { useState } from "react";
import AppShell, { ViewKey } from "@/components/AppShell";
import Dashboard from "@/components/views/Dashboard";
import TBWorkspace from "@/components/views/TBWorkspace";
import ICEliminations from "@/components/views/ICEliminations";
import Adjustments from "@/components/views/Adjustments";
import ConsolidatedFS from "@/components/views/ConsolidatedFS";
import Notes from "@/components/views/Notes";
import type { Unit } from "@/lib/format";
import { AppProvider } from "@/lib/store";
import ToastHost from "@/components/ui/ToastHost";
import DialogHost from "@/components/ui/DialogHost";

export default function Home() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [unit, setUnit] = useState<Unit>("crore");

  return (
    <AppProvider>
      <AppShell view={view} setView={setView} unit={unit} setUnit={setUnit}>
        {view === "dashboard" && <Dashboard unit={unit} setView={setView} />}
        {view === "tb" && <TBWorkspace unit={unit} />}
        {view === "ic" && <ICEliminations unit={unit} />}
        {view === "adjustments" && <Adjustments unit={unit} />}
        {view === "fs" && <ConsolidatedFS unit={unit} />}
        {view === "notes" && <Notes />}
      </AppShell>
      <ToastHost />
      <DialogHost />
    </AppProvider>
  );
}
