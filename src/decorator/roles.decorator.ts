import { SetMetadata } from '@nestjs/common';
import { ROLE_KEY } from 'src/constants/app.constant';

export const ROLES_KEY = ROLE_KEY;
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
