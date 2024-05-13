export class GetPropertiesResponse{
  constructor(public images: Array<string>, public description: string){}
}
export interface StorePropertyRequest{
  images: string[],
  description: string,
  name: string
}