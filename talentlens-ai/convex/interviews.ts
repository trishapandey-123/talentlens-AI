import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Same shapes as interviewSessions in schema.ts
const qaPair = v.object({
  question: v.string(),
  answer: v.optional(v.string()),
});

const probingPair = v.object({
  question: v.string(),
  answer: v.optional(v.string()),
  parentIndex: v.number(), // index in `questions` that this follow-up probes
});

// Create or update a candidate's interview session (one session per candidate).
// Call it after each answer with the full arrays to save progress,
// then once more with finalRating (1-10) when the interview ends.
export const saveSession = mutation({
  args: {
    candidateId: v.id("applications"),
    questions: v.array(qaPair),
    probingQuestions: v.array(probingPair),
    finalRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get("applications", args.candidateId);
    if (!candidate) throw new ConvexError("Candidate not found.");

    // Every probing question must point at an existing main question
    for (const p of args.probingQuestions) {
      const valid =
        Number.isInteger(p.parentIndex) &&
        p.parentIndex >= 0 &&
        p.parentIndex < args.questions.length;
      if (!valid) throw new ConvexError(`Invalid parentIndex: ${p.parentIndex}`);
    }

    let finalRating = args.finalRating;
    if (finalRating !== undefined) {
      if (!Number.isFinite(finalRating)) throw new ConvexError("Rating must be a number.");
      // Clamp to 1-10 and keep one decimal place
      finalRating = Math.round(Math.min(10, Math.max(1, finalRating)) * 10) / 10;
    }

    // Interview finished: move the candidate along (never overrides an HR decision)
    const canAdvance = candidate.status === "pending" || candidate.status === "shortlisted";
    if (finalRating !== undefined && canAdvance) {
      await ctx.db.patch("applications", args.candidateId, { status: "interviewed" });
    }

    const existing = await ctx.db
      .query("interviewSessions")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", args.candidateId))
      .unique();

    if (existing) {
      await ctx.db.patch("interviewSessions", existing._id, {
        questions: args.questions,
        probingQuestions: args.probingQuestions,
        // Keep an earlier rating if this save doesn't include one
        finalRating: finalRating ?? existing.finalRating,
      });
      return existing._id;
    }

    return await ctx.db.insert("interviewSessions", {
      candidateId: args.candidateId,
      questions: args.questions,
      probingQuestions: args.probingQuestions,
      finalRating,
    });
  },
});

// A candidate's interview session, or null if it hasn't started yet.
export const getByCandidate = query({
  args: { candidateId: v.id("applications") },
  handler: async (ctx, { candidateId }) => {
    return await ctx.db
      .query("interviewSessions")
      .withIndex("by_candidateId", (q) => q.eq("candidateId", candidateId))
      .unique();
  },
});
