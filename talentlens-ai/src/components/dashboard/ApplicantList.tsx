import { useState, type ReactNode } from "react";
import { useQuery } from "convex/react";
import { ChevronDown, FileText, Users } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import ScoreRing from "../ui/ScoreRing";
import StatusBadge, { type ApplicationStatus } from "../ui/StatusBadge";

type Filter = ApplicationStatus | "all";

const STATUS_ORDER: ApplicationStatus[] = ["shortlisted", "pending", "interviewed", "selected", "rejected"];

export default function ApplicantList({ job }: { job: Doc<"jobs"> }) {
  // The backend already returns these sorted by ATS score, highest first
  const applications = useQuery(api.screening.listByJob, { jobId: job._id });
  const [filter, setFilter] = useState<Filter>("all");

  const ranked = (applications ?? []).map((application, index) => ({ application, rank: index + 1 }));
  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: ranked.filter(({ application }) => application.status === status).length,
  })).filter(({ count }) => count > 0);

  // If nobody is left in the chosen status (e.g. after a live update), fall back to "All"
  const activeFilter: Filter = statusCounts.some(({ status }) => status === filter) ? filter : "all";
  const visible =
    activeFilter === "all" ? ranked : ranked.filter(({ application }) => application.status === activeFilter);

  return (
    <section aria-labelledby="applicants-title" className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 id="applicants-title" className="text-xl font-semibold tracking-tight">{job.title}</h2>
        {job.description && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{job.description}</p>}
        <ul aria-label="Skills for this role" className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((skill) => (
            <li key={skill} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-5 sm:px-6">
        {applications === undefined ? (
          <LoadingRows />
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div role="group" aria-label="Filter applicants by status" className="flex flex-wrap gap-1.5">
                <FilterChip active={activeFilter === "all"} onClick={() => setFilter("all")}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                    All <span className="tabular-nums opacity-75">{ranked.length}</span>
                  </span>
                </FilterChip>
                {statusCounts.map(({ status, count }) => (
                  <FilterChip key={status} active={activeFilter === status} onClick={() => setFilter(status)}>
                    <StatusBadge status={status} count={count} />
                  </FilterChip>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Ranked by ATS score. 70 and above is shortlisted automatically.
              </p>
            </div>

            <ol className="mt-4 divide-y divide-slate-100">
              {visible.map(({ application, rank }) => (
                <ApplicantRow key={application._id} application={application} rank={rank} />
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

function ApplicantRow({ application, rank }: { application: Doc<"applications">; rank: number }) {
  const [showResume, setShowResume] = useState(false);
  const resumeId = `resume-${application._id}`;
  const appliedOn = new Date(application._creationTime).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

  return (
    <li className="py-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="w-6 shrink-0 text-right text-sm font-medium tabular-nums text-slate-500">
          <span className="sr-only">Rank </span>
          {rank}
        </span>
        <ScoreRing score={application.atsScore} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-900">{application.name}</p>
          <p className="truncate text-sm text-slate-500">{application.email}</p>
          <div className="mt-1.5 sm:hidden">
            <StatusBadge status={application.status} />
          </div>
        </div>

        <div className="hidden sm:block">
          <StatusBadge status={application.status} />
        </div>
        <span className="hidden w-16 shrink-0 text-right text-sm text-slate-500 md:block">{appliedOn}</span>

        <button
          type="button"
          onClick={() => setShowResume((open) => !open)}
          aria-expanded={showResume}
          aria-controls={resumeId}
          className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
        >
          <FileText className="size-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Resume</span>
          <span className="sr-only"> of {application.name}</span>
          <ChevronDown
            className={`size-4 motion-safe:transition-transform ${showResume ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id={resumeId}
        hidden={!showResume}
        className="mt-3 max-h-72 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 sm:ml-26"
      >
        {application.resumeText}
      </div>
    </li>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full p-0.5 ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
        active ? "ring-teal-600" : "ring-transparent hover:ring-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function LoadingRows() {
  return (
    <div role="status" className="space-y-3">
      <span className="sr-only">Loading applicants…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="h-14 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <Users className="size-8 text-slate-400" aria-hidden="true" />
      <p className="mt-3 font-medium text-slate-900">No applicants yet</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Candidates who apply for this role will show up here instantly, ranked by ATS score.
      </p>
    </div>
  );
}

