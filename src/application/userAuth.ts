import { Inject, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/sqlite';
import { User } from '../domain/entities/userEntity';
import { incorrectPassword, invalidPassword, nameTaken, userDoesNotExist, PasswordHashingException } from './errors';
import { hash, compare } from 'bcrypt';
import { IJWTAdapter } from '../interface_adapters/jwtAdapter';
import { JWT_EXPIRATION_SECONDS } from 'src/config/constants';

@Injectable()
export class UserAuth {
  private readonly log = new Logger(UserAuth.name);
  constructor(
    private readonly em: EntityManager,
    @Inject('IJWTAdapter')
    private readonly jwtAdapter: IJWTAdapter,
  ){}

/**
 * Registers an user in the database
 * @returns The user id
 * @returns An error code in case of errors
 * @throws PasswordHashingException
 */
  async register(username: string, password: string) {
    let user = await this.em.findOne(User, {name: username});

    if (user === null){
      user = new User();
    }else{
      return nameTaken;
    }
    // password checks
    if (password.length < 8 || password.length > 22){
      return invalidPassword;
    }
    const passwdHash = await this.hashPassword(password);
    user.name = username;
    user.pass = passwdHash;
    await this.em.persist(user).flush();
    return user.id;
  }

/**
 * Login user with password
 * @returns The refreshed JWT
 * @returns An error code in case of errors
 * @throws PasswordHashingException
 */
  async loginWPassword(username: string, password: string){
    const user = await this.em.findOne(User, {name: username});

    if (user == null){
      return userDoesNotExist;
    }
    if (await compare(password, user.pass)){
      let date = new Date();
      date.setSeconds(date.getSeconds() + JWT_EXPIRATION_SECONDS)
      return this.jwtAdapter.createJWT(date, user.id, user.name);
    }else{
      return incorrectPassword;
    }
  }
/**
  * Login via validated JWT, handles refresh
  * @param jwtDate The date of the validated JWT
  * @returns The refreshed JWT
  * @returns null if the JWT is expired
  */
  loginWJWT(userId: number, userName: string, jwtDate: Date){
    let date = new Date();
    date.setSeconds(date.getSeconds() - JWT_EXPIRATION_SECONDS);
    if (date.getTime() > jwtDate.getTime()){
      return null;
    }
    date = new Date();
    date.setSeconds(date.getSeconds() + JWT_EXPIRATION_SECONDS)
    return this.jwtAdapter.createJWT(date, userId, userName);
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    try {
      const hashedPassword = await hash(password, saltRounds);
      return hashedPassword;
    } catch (error) {
      this.log.error("Error hashing password", error);
      throw new PasswordHashingException(error);
    }
  }
}
