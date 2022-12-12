export enum RequestMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
  Options = 'OPTIONS',
}

export enum DefaultApiResponses {
  GetSuccess = 'Data retrieve successfully',
  GetFailure = 'Errors retrieving data',
  BadRequest = 'Wrong request',
  PostSuccess = 'Post request successful',
}