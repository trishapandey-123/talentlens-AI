import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Applications scoring at or above this are auto-shortlisted for the AI interview.
const SHORTLIST_THRESHOLD = 70;

// Save an application with its parsed ATS score (0-100).
// Returns the new application's ID and the status it was given.
export const saveApplication = mutation({
  args: {
    jobId: v.id("jobs"),
    name: v.string(),
    email: v.string(),
    resumeText: v.string(),
    atsScore: v.number(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get("jobs", args.jobId);
    if (!job) throw new ConvexError("This job no longer exists.");

    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const resumeText = args.resumeText.trim();

    if (!name) throw new ConvexError("Name is required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new ConvexError("Enter a valid email address.");
    if (!resumeText) throw new ConvexError("No text could be read from the resume.");
    if (!Number.isFinite(args.atsScore)) throw new ConvexError("ATS score must be a number.");

    // One application per email per job
    const jobApplications = await ctx.db
      .query("applications")
      .withIndex("by_jobId_and_atsScore", (q) => q.eq("jobId", args.jobId))
      .collect();
    if (jobApplications.some((a) => a.email === email)) {
      throw new ConvexError("This email has already applied for this job.");
    }

    const atsScore = Math.round(Math.min(100, Math.max(0, args.atsScore)));
    const status = atsScore >= SHORTLIST_THRESHOLD ? "shortlisted" : "pending";

    const applicationId = await ctx.db.insert("applications", {
      jobId: args.jobId,
      name,
      email,
      resumeText,
      atsScore,
      status,
    });

    return { applicationId, status };
  },
});

// All applications for a job, highest ATS score first.
export const listByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_jobId_and_atsScore", (q) => q.eq("jobId", jobId))
      .order("desc")
      .collect();
  },
});

// One application by ID, or null (the interview screen uses this to load the candidate).
export const getApplication = query({
  args: { applicationId: v.id("applications") },
  handler: async (ctx, { applicationId }) => {
    return await ctx.db.get("applications", applicationId);
  },
});
