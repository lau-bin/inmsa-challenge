import { Transform, plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, Max, Min, validateSync } from 'class-validator';

export enum Environment {
  Development = "development",
  Production = "production"
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  @IsNotEmpty()
  JWT_KEY_PATH!: string;

  @IsString()
  @IsNotEmpty()
  PROPERTY_BUCKET_NAME!: string
}

export default function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
