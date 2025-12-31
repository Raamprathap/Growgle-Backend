const { z } = require('zod');

const MilestoneSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.enum(['course', 'project', 'certification']).optional().default('course'),
  duration: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  provider: z.string().optional(),
});

const PhaseSchema = z.object({
  id: z.number(),
  title: z.string(),
  duration: z.string(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
  progress: z.number().min(0).max(100).default(0),
  milestones: z.array(MilestoneSchema).default([]),
});

const RoadmapSchema = z.object({
  title: z.string(),
  totalDuration: z.string(),
  completionRate: z.number().min(0).max(100).default(0),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string(),
  phases: z.array(PhaseSchema).default([]),
  // Optional linkage to user
  email: z.string().email().optional(),
  userId: z.string().optional(),
  ownerName: z.string().optional(),
});

const RoadmapUpdateSchema = RoadmapSchema.partial();

module.exports = { RoadmapSchema, RoadmapUpdateSchema };
