import { CircleCheck, CircleX, Clock, MessagesSquare, Star, type LucideIcon } from "lucide-react";
import type { Doc } from "../../../convex/_generated/dataModel";

export type ApplicationStatus = Doc<"applications">["status"];

const STATUS_STYLES: Record<ApplicationStatus, { label: string; icon: LucideIcon; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-slate-100 text-slate-700" },
  shortlisted: { label: "Shortlisted", icon: Star, className: "bg-teal-50 text-teal-800" },
  interviewed: { label: "Interviewed", icon: MessagesSquare, className: "bg-sky-50 text-sky-800" },
  selected: { label: "Selected", icon: CircleCheck, className: "bg-emerald-50 text-emerald-800" },
  rejected: { label: "Rejected", icon: CircleX, className: "bg-rose-50 text-rose-700" },
};

type StatusBadgeProps = {
  status: ApplicationStatus;
  count?: number; // shown after the label (used by the filters)
};

export default function StatusBadge({ status, count }: StatusBadgeProps) {
  const { label, icon: Icon, className } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${className}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
      {count !== undefined && <span className="tabular-nums opacity-75">{count}</span>}
    </span>
  );
}
