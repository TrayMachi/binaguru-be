import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const RegisterDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  username: z.string().nonempty('Username is required'),
  yoe: z.number().min(0, 'Years of experience must be a positive number'),
  location: z.string().nonempty('Location is required'),
  pros: z.string().nonempty('Pros are required'),
  cons: z.string().nonempty('Cons are required'),
});

export class LoginDtoClass extends createZodDto(LoginDto) {}
export class RegisterDtoClass extends createZodDto(RegisterDto) {}
