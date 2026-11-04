import type { Doc, Id } from "../../../convex/_generated/dataModel";

type JobListProps = {
  jobs: Doc<"jobs">[] | undefined; // undefined while loading
  selectedJobId: Id<"jobs"> | undefined;
  onSelect: (jobId: Id<"jobs">) => void;
};

export default function JobList({ jobs, selectedJobId, onSelect }: JobListProps) {
  return (
    <section
      aria-labelledby="open-roles-title"
      className="rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-24"
    >
      <div className="flex items-baseline justify-between border-b border-slate-200 px-5 py-4">
        <h2 id="open-roles-title" className="font-semibold">Open roles</h2>
        {jobs && <span className="text-sm tabular-nums text-slate-500">{jobs.length}</span>}
      </div>

      {jobs === undefined ? (
        <div role="status" className="space-y-2 p-3">
          <span className="sr-only">Loading roles…</span>
          {[0, 1, 2].map((i) => (
            <div key={i} aria-hidden="true" className="h-16 rounded-xl bg-slate-100 motion-safe:animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="max-h-96 space-y-1 overflow-y-auto p-2 lg:max-h-[calc(100vh-12rem)]">
          {jobs.map((job) => {
            const selected = job._id === selectedJobId;
            const extraSkills = job.skills.length - 3;
            return (
              <li key={job._id}>
                <button
                  type="button"
                  onClick={() => onSelect(job._id)}
                  aria-current={selected ? "true" : undefined}
                  className={`w-full cursor-pointer rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                    selected ? "bg-teal-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className={`block font-medium ${selected ? "text-teal-900" : "text-slate-900"}`}>
                    {job.title}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-slate-600">
                    {job.skills.slice(0, 3).join(", ")}
                    {extraSkills > 0 && ` +${extraSkills}`}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Posted{" "}
                    {new Date(job._creationTime).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
