import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const SubmissionInfoSchema = z.object({
  id: z.string(),
  contentLink: z.string(),
  attempts: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AssignmentDetailSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  description: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  module: z.object({
    id: z.string(),
    title: z.string(),
    courseId: z.string(),
  }),
  userSubmission: SubmissionInfoSchema.nullable(),
});

export class AssignmentDetailDto extends createZodDto(AssignmentDetailSchema) {}
