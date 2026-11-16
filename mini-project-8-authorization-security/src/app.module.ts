import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import { ConfigModule, ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { UsersModule } from './users/users.module.js';

import { AuthModule } from './auth/auth.module.js';

import { AdminModule } from './admin/admin.module.js';

import { SecurityModule } from './security/security.module.js';

import { CsrfGuard } from './security/csrf.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),

    UsersModule,

    AuthModule,

    AdminModule,

    SecurityModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
