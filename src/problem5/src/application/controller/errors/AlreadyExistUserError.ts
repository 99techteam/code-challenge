export class AlreadyExistUserError extends Error {
  public readonly name = 'AlreadyExistUserError';
  constructor(public readonly email: string, message?: string) {
    super(message);
    Object.setPrototypeOf(this, AlreadyExistUserError.prototype);
  }
}
