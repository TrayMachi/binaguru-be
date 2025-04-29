import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Level } from 'generated/prisma';

const LevelEnum = z.nativeEnum(Level);

export const EditProfileSchema = z.object({
  username: z.string().optional(),
  yoe: z.number().min(0, 'Pengalaman mengajar tidak boleh negatif').optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  location: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  level: LevelEnum.optional(),
});

export class EditProfileDto extends createZodDto(EditProfileSchema) {}
