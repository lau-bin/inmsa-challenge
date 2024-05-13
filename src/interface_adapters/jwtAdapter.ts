import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { JWS, JWK } from 'node-jose';
import type { EnvironmentVariables } from '../config/envVars';
import { readFileSync } from 'node:fs';


@Injectable()
export class JWTAdapter implements IJWTAdapter, OnModuleInit{
  key!: JWK.Key;
  constructor(
    private config: ConfigService<EnvironmentVariables, true>
  ){}
  async onModuleInit() {
    this.key = await JWK.asKey(readFileSync(this.config.get("JWT_KEY_PATH", {infer: true}), "utf-8"));
  }
 /**
  * Creates a JWT
  * @param expiration final expiration date
  * @returns JWT string
  */
  async createJWT(expiration: Date, userId: number, userName: string) {
    const result = await JWS.createSign(
      {format: 'compact', alg: "HS256"},
      this.key
    ).update(JSON.stringify({
      exp: expiration.getTime(),
      user_id: userId,
      user_name: userName
    })).final();
    return result as unknown as string;
  }
}

export interface IJWTAdapter{
  createJWT(expiration: Date, userId: number, userName: string): Promise<string>
}