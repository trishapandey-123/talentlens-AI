import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import Button from "./ui/Button.tsx";

interface Props {
  jobId: Id<"jobs">;
  jobTitle: string;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

export default function CandidateApplicationForm({ jobId, jobTitle, onSubmitted, onCancel }: Props) {
  const applyMutation = useMutation(api.screening.saveApplication);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !resumeText) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await applyMutation({
        jobId,
        name,
        email,
        resumeText,
        atsScore: 85,
      });
      setName("");
      setEmail("");
      setResumeText("");
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setError(err?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Apply for {jobTitle}</h2>
        <p className="text-sm text-slate-500">Submit your resume text for real-time ATS screening.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. rahul@example.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Resume Content / Skills Summary</label>
          <textarea
            required
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste candidate work history, projects, and skills here..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} type="button">
              Cancel
            </Button>
          )}
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </div>
  );
}