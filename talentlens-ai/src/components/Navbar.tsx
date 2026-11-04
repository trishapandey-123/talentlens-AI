import { useConvexConnectionState } from "convex/react";
import { Aperture, type LucideIcon } from "lucide-react";

export type NavItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type NavbarProps<T extends string> = {
  items: NavItem<T>[];
  current: T;
  onNavigate: (id: T) => void;
};

export default function Navbar<T extends string>({ items, current, onNavigate }: NavbarProps<T>) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-8 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-2.5">
          <Aperture className="size-6 text-teal-700" strokeWidth={2.25} aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight text-slate-900">TalentLens AI</span>
        </div>

        <ul className="flex items-center gap-1">
          {items.map(({ id, label, icon: Icon }) => {
            const active = id === current;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onNavigate(id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                    active
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <ConnectionStatus />
      </nav>
    </header>
  );
}

// Shows whether the browser is connected to Convex. While it is, data updates live.
function ConnectionStatus() {
  const { isWebSocketConnected } = useConvexConnectionState();

  return (
    <p role="status" className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${isWebSocketConnected ? "bg-teal-500" : "bg-amber-500"}`}
      />
      <span className="sr-only sm:not-sr-only">{isWebSocketConnected ? "Live" : "Connecting…"}</span>
    </p>
  );
}
