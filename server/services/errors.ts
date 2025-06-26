/**
 * Base error class for application-specific errors
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Error for when a user is not authorized to access a resource
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super(message, 403);
  }
}

/**
 * Error for when a validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400);
  }
}

/**
 * Error for when a conflict occurs (e.g., duplicate entry)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Conflict occurred") {
    super(message, 409);
  }
}
