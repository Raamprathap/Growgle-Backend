 const { z } = require("zod");
const moment = require("moment-timezone");

const EducationSchema = z.object({
  id: z.number().optional(),
  school: z.string().optional(),
  degree: z.string().optional(),
  year: z.string().optional(),
  gpa: z.string().optional(),
});

const ExperienceSchema = z.object({
  id: z.number().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

const SkillSchema = z.object({
  name: z.string().optional(),
  level: z.number().optional(),
  category: z.string().optional(),
});

const SocialSchema = z.object({
  website: z.string().url().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
}).optional();

const PreferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  jobAlerts: z.boolean().optional(),
  skillRecommendations: z.boolean().optional(),
}).optional();

const ResumeSuggestionSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low","medium","high"]).optional(),
});

const ResumeAnalysisSchema = z.object({
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
}).optional();

const ResumeSchema = z.object({
  score: z.number().optional(),
  lastUpdated: z.string().optional(),
  fileName: z.string().optional(),
  url: z.string().url().optional(),
  publicId: z.string().optional(),
  latex: z.string().optional(),
  suggestions: z.array(ResumeSuggestionSchema).optional(),
  analysis: ResumeAnalysisSchema,
}).optional();

const ActivitySchema = z.object({
  action: z.string().optional(),
  item: z.string().optional(),
  time: z.string().optional(),
  type: z.enum(["course", "roadmap", "achievement", "skill", "certification"]).optional(),
}).optional();

const MilestoneSchema = z.object({
  title: z.string().optional(),
  deadline: z.string().optional(),
  progress: z.number().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  category: z.string().optional(),
}).optional();

const RecommendationSchema = z.object({
  type: z.enum(["course", "certification", "job", "skill", "project"]).optional(),
  title: z.string().optional(),
  provider: z.string().optional(),
  duration: z.string().optional(),
  rating: z.number().optional(),
  relevance: z.number().optional(),
  url: z.string().optional(),
}).optional();

const DashboardDataSchema = z.object({
  skillsMastered: z.number().optional(),
  careerScore: z.number().optional(),
  coursesCompleted: z.number().optional(),
  certifications: z.number().optional(),
  profileCompleteness: z.number().optional(),
  recentActivities: z.array(ActivitySchema).optional(),
  upcomingMilestones: z.array(MilestoneSchema).optional(),
  recommendations: z.array(RecommendationSchema).optional(),
}).optional();

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),

  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().default(() => moment().tz('Asia/Kolkata').toISOString()),

  location: z.string().optional(),
  title: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  education: z.array(EducationSchema).optional(),
  experience: z.array(ExperienceSchema).optional(),
  skills: z.array(SkillSchema).optional(),
  social: SocialSchema,
  preferences: PreferencesSchema,

  resume: ResumeSchema,
  dashboardData: DashboardDataSchema,
});

module.exports = { UserSchema };