import { HttpStatus } from "@/enums/httpStatus"

type ErrorMap = Record<string, { status: HttpStatus; name: string }>

export const errors: ErrorMap = {
  // Client Errors
  BadRequestError: {
    status: HttpStatus.BAD_REQUEST,
    name: "BadRequestError"
  },
  UnauthorizedError: {
    status: HttpStatus.UNAUTHORIZED,
    name: "UnauthorizedError"
  },
  ForbiddenError: {
    status: HttpStatus.FORBIDDEN,
    name: "ForbiddenError"
  },
  NotFoundError: {
    status: HttpStatus.NOT_FOUND,
    name: "NotFoundError"
  },
  MethodNotAllowedError: {
    status: HttpStatus.METHOD_NOT_ALLOWED,
    name: "MethodNotAllowedError"
  },
  NotAcceptableError: {
    status: HttpStatus.NOT_ACCEPTABLE,
    name: "NotAcceptableError"
  },
  ConflictError: {
    status: HttpStatus.CONFLICT,
    name: "ConflictError"
  },
  UnprocessableEntityError: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    name: "UnprocessableEntityError"
  },
  TooManyRequestsError: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    name: "TooManyRequestsError"
  },

  // Server Errors
  InternalServerError: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    name: "InternalServerError"
  },
  NotImplementedError: {
    status: HttpStatus.NOT_IMPLEMENTED,
    name: "NotImplementedError"
  },
  BadGatewayError: {
    status: HttpStatus.BAD_GATEWAY,
    name: "BadGatewayError"
  },
  ServiceUnavailableError: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    name: "ServiceUnavailableError"
  },
  GatewayTimeoutError: {
    status: HttpStatus.GATEWAY_TIMEOUT,
    name: "GatewayTimeoutError"
  }
}

export const createError = (errorType: { status: HttpStatus; name: string }, message: string) => {
  const error = new Error(message)
  error.name = errorType.name
  // @ts-ignore
  error.status = errorType.status
  return error
}
