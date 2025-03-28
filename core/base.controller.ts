export class BaseController {
  standardResponse(
    data,
    message = 'Resource Created/Updated Successfully',
    httpStatus = 200,
  ) {
    return {
      data,
      httpStatus: httpStatus,
      message: message,
    };
  }

  errorResponse(message, httpStatus) {
    return {
      httpStatus: httpStatus,
      error: message,
    };
  }
}
