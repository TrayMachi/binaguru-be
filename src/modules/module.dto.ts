import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const CreateModuleSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  contentMarkdown: z.string().min(20, 'Content must be at least 20 characters'),
  assignment: z
    .object({
      title: z
        .string()
        .min(3, 'Assignment title must be at least 3 characters'),
      description: z
        .string()
        .min(10, 'Assignment description must be at least 10 characters'),
    })
    .optional(),
});

export class CreateModuleDto extends createZodDto(CreateModuleSchema) {}
