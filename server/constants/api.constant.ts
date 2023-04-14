export const REQUEST_STATUS = {
  Successful: 200,
  BadRequest: 400,
  ServerError: 500,
} as const;

export const REQUEST_METHOD = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
  Options: 'OPTIONS',
} as const;