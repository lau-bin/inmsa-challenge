import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './controller';
import { UserAuth } from '../../application/userAuth';


describe('AppController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserAuth],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  describe('root', () => {
    it('should return user id', () => {
      expect(userController.register()).toBe('1');
    });
  });
});
