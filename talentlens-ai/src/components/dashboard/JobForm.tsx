import { useState, type ReactNode } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Button from "../ui/Button";

type JobFormProps = {
  onCreated: (jobId: Id<"jobs">) => void;
  onCancel?: () => void; // omit to hide the Cancel button
};

const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20";

// "React, node.js, , react" -> ["React", "node.js"]
function parseSkills(input: string): string[] {
  const skills: string[] = [];
  for (const part of input.split(",")) {
    const skill = part.trim();
    if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      skills.push(skill);
    }
  }
  return skills;
}

export default function JobForm({ onCreated, onCancel }: JobFormProps) {
  const createJob = useMutation(api.jobs.create);
  const [title, setTitle] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const skills = parseSkills(skillsInput);
  const canSubmit = title.trim() !== "" && skills.length > 0 && !saving;

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const jobId = await createJob({ title, skills, description });
      setTitle("");
      setSkillsInput("");
      setDescription("");
      onCreated(jobId);
    } catch (err) {
      setError(
        err instanceof ConvexError
          ? String(err.data)
          : "Couldn’t post the job. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="job-form"
      aria-labelledby="job-form-title"
      className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 id="job-form-title" className="text-lg font-semibold">Post a job</h2>
      <p className="mt-1 text-sm text-slate-600">
        Resumes are scored against the skills you list, so name the ones that matter most.
      </p>

      <form
        className="mt-6 grid gap-5 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) void handleSubmit();
        }}
      >
        <Field id="job-title" label="Job title">
          <input
            id="job-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Frontend Developer"
            required
            className={inputClass}
          />
        </Field>

        <Field id="job-skills" label="Required skills">
          <input
            id="job-skills"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="React, TypeScript, REST APIs"
            aria-describedby="job-skills-hint"
            className={inputClass}
          />
          <p id="job-skills-hint" className="mt-1.5 text-xs text-slate-500">
            Separate skills with commas.
          </p>
          {skills.length > 0 && (
            <ul aria-label="Skills that will be saved" className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <li
                  key={skill.toLowerCase()}
                  className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}
        </Field>

        <Field id="job-description" label="Description" className="md:col-span-2">
          <textarea
            id="job-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What the role involves, who it’s for, and anything candidates should know."
            className={`${inputClass} resize-y`}
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 md:col-span-2"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 md:col-span-2">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={!canSubmit}>
            {saving && <LoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />}
            {saving ? "Posting…" : "Post job"}
          </Button>
        </div>
      </form>
    </section>
  );
}

type FieldProps = {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
};

function Field({ id, label, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-800">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
