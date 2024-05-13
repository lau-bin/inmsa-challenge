export function isAppError(obj: any): obj is AppError{
  return obj instanceof AppError;
}

class AppError{
  constructor(readonly message: string, readonly code: number){}
}

export const nameTaken = new AppError("Name already registered", 1);
export const invalidPassword = new AppError("Invalid password to register user", 2);
export const userDoesNotExist = new AppError("User does not exist", 3);
export const incorrectPassword = new AppError("Incorrect password", 4);
export const propertyDoesNotExist = new AppError("Property does not exist", 5);

export class PasswordHashingException extends Error {
  constructor(readonly error: any){
    super("Error hashing password");
    this.name = PasswordHashingException.name;
  }
}
export class PropertyStorageException extends Error {
  constructor(readonly error: any){
    super("Error storing property");
    this.name = PropertyStorageException.name;
  }
}
export class DownloadPropertyException extends Error {
  constructor(readonly error: any){
    super("Error downloading property data");
    this.name = DownloadPropertyException.name;
  }
}