import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Exported so mutations can reuse it for argument validation
export const applicationStatus = v.union(
  v.literal("pending"),
  v.literal("shortlisted"),
  v.literal("interviewed"),
  v.literal("selected"),
  v.literal("rejected"),
);

// One interview Q&A pair (answer is filled in once the candidate responds)
const qaFields = {
  question: v.string(),
  answer: v.optional(v.string()),
};

export default defineSchema({
  jobs: defineTable({
    title: v.string(),
    skills: v.array(v.string()),
    description: v.string(),
  }),

  applications: defineTable({
    jobId: v.id("jobs"), // the job this resume is scored against
    name: v.string(),
    email: v.string(),
    resumeText: v.string(),
    atsScore: v.optional(v.number()), // 0-100, set after AI scoring
    status: applicationStatus,
  }).index("by_jobId_and_atsScore", ["jobId", "atsScore"]),

  interviewSessions: defineTable({
    candidateId: v.id("applications"), // the application holds the candidate's details
    questions: v.array(v.object(qaFields)),
    // Follow-ups; parentIndex = index of the main question being probed
    probingQuestions: v.array(
      v.object({ ...qaFields, parentIndex: v.number() }),
    ),
    finalRating: v.optional(v.number()), // e.g. 1-10, set after evaluation
  }).index("by_candidateId", ["candidateId"]),
});
