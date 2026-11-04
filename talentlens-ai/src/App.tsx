import { useState } from "react";
import { BriefcaseBusiness } from "lucide-react";
import Navbar, { type NavItem } from "./components/Navbar";
import RecruiterDashboard from "./components/RecruiterDashboard";

// The app's views. Add the candidate Apply and Interview views here in later steps.
type View = "recruiter";

const NAV_ITEMS: NavItem<View>[] = [
  { id: "recruiter", label: "Recruiter", icon: BriefcaseBusiness },
];

export default function App() {
  const [view, setView] = useState<View>("recruiter");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Navbar items={NAV_ITEMS} current={view} onNavigate={setView} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {view === "recruiter" && <RecruiterDashboard />}
      </main>
    </div>
  );
}
