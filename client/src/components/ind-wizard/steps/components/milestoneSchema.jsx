// src/components/ind-wizard/steps/components/milestoneSchema.jsx
import * as z from 'zod';

// Define the milestone schema with Zod
export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Milestone title is required"),
  dueDate: z.date().optional().nullable(),
  status: z.enum(['Pending', 'InProgress', 'Completed', 'Blocked']),
  description: z.string().optional().nullable(),
});

// Define the Milestone type
export const Milestone = milestoneSchema.shape;

// Export schema and type definitions
export default milestoneSchema;