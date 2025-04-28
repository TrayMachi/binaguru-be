import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const LoginDto = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const RegisterDto = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter"),
  username: z.string().nonempty("Nama pengguna tidak boleh kosong"),
  yoe: z.number().min(0, "Pengalaman mengajar tidak boleh negatif"),
  location: z.string().nonempty("Lokasi tidak boleh kosong"),
  pros: z.array(z.string()).nonempty('Pilih setidaknya satu minat Anda'),
  cons: z.array(z.string()).nonempty('Pilih setidaknya satu kendala Anda'),
  birthDate: z.string().date("Tanggal lahir tidak valid"),
  level: z.string(),
});

export class LoginDtoClass extends createZodDto(LoginDto) {}
export class RegisterDtoClass extends createZodDto(RegisterDto) {}
