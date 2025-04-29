import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Level } from '../../generated/prisma';

export const BaseCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.nativeEnum(Level),
});

export const UserCourseSchema = BaseCourseSchema.extend({
  progress: z.number().min(0).max(100).default(0),
});

export const CourseGroupsSchema = z.object({
  courseku: z.array(UserCourseSchema),
  rekomendasi: z.array(BaseCourseSchema),
  allcourse: z.array(BaseCourseSchema),
});

export class CourseGroupsDto extends createZodDto(CourseGroupsSchema) {}
