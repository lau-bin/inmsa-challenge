import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
import { UserAuth } from '../../application/userAuth';
import { ApiTags } from '@nestjs/swagger';
import { RegistrationRequest, RegistrationResponse } from './dto/registration';
import { LoginRequest } from './dto/login';
import { GetPropertiesResponse, StorePropertyRequest } from './dto/properties';
import { isAppError } from 'src/application/errors';
import { ClientError } from '../clientErrors';
import { FastifyReply } from 'fastify';
import { PropertyManager } from 'src/application/propertyManager';


@ApiTags("user")
@Controller()
export class UserController {
  constructor(
    private readonly userReg: UserAuth,
    private readonly propertyManager: PropertyManager
  ) {}

  @Post("register")
  async register(
    @Body() body: RegistrationRequest
  ) {
    const regResult = await this.userReg.register(body.username, body.password);
    
    if (isAppError(regResult)){
      return new ClientError(regResult.message, regResult.code);
    }
    return new RegistrationResponse(regResult);
  }

  @Post("login")
  async login(
    @Body() body: LoginRequest,
    @Res({ passthrough: true }) response: FastifyReply
  ) {
    const loginResult = await this.userReg.loginWPassword(body.username, body.password);

    if (isAppError(loginResult)){
      return new ClientError(loginResult.message, loginResult.code);
    }
    response.setCookie('session', loginResult, {
      httpOnly: true,
      path: '/',
      secure: false,
      maxAge: 30,
    });
  }

  @Get("/properties/:id")
  async getProperties(
    @Param('id') id: number
  ){
    console.log("ASD")
    const getPropResult = await this.propertyManager.getProperties(id)
    if (isAppError(getPropResult)){
      return new ClientError(getPropResult.message, getPropResult.code);
    }
    return new GetPropertiesResponse(
      getPropResult.images,
      getPropResult.property.description ? getPropResult.property.description : ""
    );
  }

  @Post("/properties")
  async saveProperty(
    @Body() body: StorePropertyRequest
  ){
    const storeResult = await this.propertyManager.storeProperty(body.name, body.images, body.description);
    if (isAppError(storeResult)){
      return new ClientError(storeResult.message, storeResult.code);
    }
  }
}
