import { Module } from '@nestjs/common';
import { UserController } from '../interface_adapters/controllers/controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserAuth } from '../application/userAuth';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { JWTAdapter } from '../interface_adapters/jwtAdapter';
import { ConfigModule } from '@nestjs/config';
import validate from './envVars';
import { PropertyManager } from 'src/application/propertyManager';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      entities: ['./dist/domain/entities'],
      entitiesTs: ['./src/domain/entities'],
      metadataProvider: TsMorphMetadataProvider,
      driver: SqliteDriver,
      dbName: 'test.db'
    }),
    ConfigModule.forRoot({
      validate
    })
  ],
  controllers: [UserController],
  providers: [
    UserAuth,
    PropertyManager,
    {provide: "IJWTAdapter", useClass: JWTAdapter}
  ]
})
export class AppModule {}
