import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Level } from '../../generated/prisma';

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.nativeEnum(Level),
  language: z.string(),
  courseType: z.string(),
  courseSubject: z.string(),
  ownerCons: z.array(z.string()),
});

export const UserCourseSchema = CourseSchema.extend({
  progress: z.number().min(0).max(100).default(0),
});

export const CourseGroupsSchema = z.object({
  courseku: z.array(UserCourseSchema),
  rekomendasi: z.array(CourseSchema),
  allcourse: z.array(CourseSchema),
});

export class CourseGroupsDto extends createZodDto(CourseGroupsSchema) {}

export const ModuleWithSubmissionSchema = z.object({
  id: z.string(),
  title: z.string(),
  hasAssignment: z.boolean(),
  submissionLink: z.string().optional(),
});

export const CourseDetailSchema = z.object({
  course: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    level: z.nativeEnum(Level),
  }),
  modules: z.array(ModuleWithSubmissionSchema),
});

export class CourseDetailDto extends createZodDto(CourseDetailSchema) {}

export const CreateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  level: z.nativeEnum(Level),
  language: z.string(),
  courseType: z.string(),
  courseSubject: z.string(),
});

export class CreateCourseDto extends createZodDto(CreateCourseSchema) {}
