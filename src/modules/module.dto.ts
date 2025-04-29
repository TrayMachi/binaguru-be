import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const ModuleDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  courseId: z.string(),
  contentMarkdown: z.string(),
  assignmentId: z.string().nullable().optional(),
  submissionLink: z.string().nullable().optional(),
});

export class ModuleDetailDto extends createZodDto(ModuleDetailSchema) {}
