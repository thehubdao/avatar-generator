export const REQUEST_STATUS = {
  Successful: 200,
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404,
  ServerError: 500,
  NotImplemented: 501,
  ServiceUnavailable: 503,
} as const;

export const REQUEST_METHOD = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
  Options: 'OPTIONS',
} as const;