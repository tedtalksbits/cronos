export class CustomError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'CustomError';

    // Set the prototype explicitly to fix instanceof checks in TypeScript
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export function APIError(status: number, message: string) {
  return {
    status,
    message,
  };
}

export type APIError = ReturnType<typeof APIError>;
