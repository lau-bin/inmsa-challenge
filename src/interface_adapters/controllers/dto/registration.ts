export interface RegistrationRequest{
  username: string,
  password: string
}

export class RegistrationResponse{
  constructor(public userId: number){}
}