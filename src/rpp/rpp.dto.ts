import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Level } from '../../generated/prisma';

export const CreateRPPSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export class CreateRPPDto extends createZodDto(CreateRPPSchema) {}
