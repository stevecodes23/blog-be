import { HttpException, HttpStatus } from '@nestjs/common';
import { config } from 'dotenv';
config();
function getEnvVariable(name) {
  const envVar = process.env[name];
  console.log(`env variable ${name}`, envVar);
  if (!envVar)
    throw new HttpException(
      `No Such Env:${name} variable`,
      HttpStatus.FAILED_DEPENDENCY,
    );
  return envVar;
}

export const ENV = {
  PORT: getEnvVariable('PORT'),
  PSQL: {
    DATABASE_URL: getEnvVariable('DATABASE_URL'),
  },
  JWT: {
    EXPIRY: getEnvVariable('JWT_EXPIRY'),
    SECRET: getEnvVariable('JWT_AUTHSECRET'),
  },
};
