import { FastifyReply } from 'fastify';
import { CookieSerializeOptions } from '@fastify/cookie';

declare module 'fastify' {
  export interface FastifyReply {
    setCookie(name: string, value: string, options?: CookieSerializeOptions): FastifyReply;
    clearCookie(name: string, options?: CookieSerializeOptions): FastifyReply;
  }
}