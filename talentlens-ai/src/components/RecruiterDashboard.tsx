import { useState } from "react";
import { useQuery } from "convex/react";
import { Plus, X, UserPlus } from "lucide-react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import ApplicantList from "./dashboard/ApplicantList.tsx";
import JobForm from "./dashboard/JobForm.tsx";
import JobList from "./dashboard/JobList.tsx";
import Button from "./ui/Button.tsx";
import CandidateApplicationForm from "./CandidateApplicationForm.tsx";

export default function RecruiterDashboard() {
  const jobs = useQuery(api.jobs.list); // undefined while loading
  const [selectedJobId, setSelectedJobId] = useState<Id<"jobs"> | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [candidateFormOpen, setCandidateFormOpen] = useState(false);

  // Until the recruiter picks a job, show the newest one
  const selectedJob = jobs?.find((job) => job._id === selectedJobId) ?? jobs?.[0];
  const hasNoJobs = jobs !== undefined && jobs.length === 0;
  const showJobForm = formOpen || hasNoJobs;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Recruiter dashboard</h1>
          <p className="mt-1 text-slate-600">Post roles and review applicants ranked by ATS score.</p>
        </div>

        {!hasNoJobs && (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCandidateFormOpen((open) => !open);
                if (formOpen) setFormOpen(false);
              }}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              {candidateFormOpen ? "Close Candidate Form" : "Apply as Candidate"}
            </Button>

            <Button
              variant={showJobForm ? "secondary" : "primary"}
              onClick={() => {
                setFormOpen((open) => !open);
                if (candidateFormOpen) setCandidateFormOpen(false);
              }}
              aria-expanded={showJobForm}
              aria-controls="job-form"
            >
              {showJobForm ? <X className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
              {showJobForm ? "Close form" : "Post a job"}
            </Button>
          </div>
        )}
      </div>

      {showJobForm && (
        <JobForm
          onCreated={(jobId: Id<"jobs">) => {
            setSelectedJobId(jobId);
            setFormOpen(false);
          }}
          onCancel={hasNoJobs ? undefined : () => setFormOpen(false)}
        />
      )}

      {candidateFormOpen && selectedJob && (
        <CandidateApplicationForm
          jobId={selectedJob._id}
          jobTitle={selectedJob.title}
          onSubmitted={() => setCandidateFormOpen(false)}
          onCancel={() => setCandidateFormOpen(false)}
        />
      )}

      {!hasNoJobs && (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <JobList jobs={jobs} selectedJobId={selectedJob?._id} onSelect={setSelectedJobId} />

          {selectedJob ? (
            <ApplicantList key={selectedJob._id} job={selectedJob} />
          ) : (
            <div
              aria-hidden="true"
              className="h-96 rounded-2xl border border-slate-200 bg-white motion-safe:animate-pulse"
            />
          )}
        </div>
      )}
    </div>
  );
}