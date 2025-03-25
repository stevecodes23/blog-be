import { SetMetadata } from '@nestjs/common';
import { publicMetadataDecoratorKey } from 'src/constants/app.constant';

export const Public = () => SetMetadata(publicMetadataDecoratorKey, true);
