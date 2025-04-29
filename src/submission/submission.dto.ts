import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const youtubeRegex =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/((watch\?v=)|shorts\/)?([^&]+).*/;

export const CreateSubmissionSchema = z.object({
  assignmentId: z.string(),
  contentLink: z.string().refine((value) => youtubeRegex.test(value), {
    message: 'Invalid YouTube link. Please provide a valid YouTube URL',
  }),
});

export class CreateSubmissionDto extends createZodDto(CreateSubmissionSchema) {}
