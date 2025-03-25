import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export async function generateHash(word: string) {
  try {
    const bcryptPass: string = await bcrypt.hash(word, 10);
    return bcryptPass;
  } catch (error) {
    throw new HttpException(
      `Hash generation failed ${error}`,
      HttpStatus.BAD_GATEWAY,
    );
  }
}
export async function compareHash(input: string, actual: string) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return await bcrypt.compare(input, actual);
}
