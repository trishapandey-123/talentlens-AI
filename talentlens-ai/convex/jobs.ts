import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a job posting. Returns the new job's ID.
export const create = mutation({
  args: {
    title: v.string(),
    skills: v.array(v.string()),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    const description = args.description.trim();

    // Trim, drop blanks and remove duplicates ("React" and "react" count once)
    const skills: string[] = [];
    for (const raw of args.skills) {
      const skill = raw.trim();
      if (skill && !skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
        skills.push(skill);
      }
    }

    if (!title) throw new ConvexError("Job title is required.");
    if (skills.length === 0) throw new ConvexError("Add at least one skill.");

    return await ctx.db.insert("jobs", { title, skills, description });
  },
});

// All jobs, newest first.
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("jobs").order("desc").collect();
  },
});

// One job by ID, or null if it doesn't exist (useful for the apply page).
export const get = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, { jobId }) => {
    return await ctx.db.get("jobs", jobId);
  },
});
