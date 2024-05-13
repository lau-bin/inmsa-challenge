export interface LoginRequest{
  username: string,
  password: string
}

export class LoginResponse{
  constructor(public userId: number){}
}