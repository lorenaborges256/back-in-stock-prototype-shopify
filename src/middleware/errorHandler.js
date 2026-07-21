/**
 * Handles requests to routes that do not exist.
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: 'The requested API route was not found.'
  });
}

/**
 * Centralised error handler.
 *
 * Internal details are logged on the server while clients receive
 * generic, non-sensitive messages.
 */
export function errorHandler(
  error,
  req,
  res,
  next
) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode =
    error?.statusCode ||
    (error?.type === 'entity.parse.failed'
      ? 400
      : 500);

  console.error({
    event: 'api_error',
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: error?.name || 'Error',
    errorMessage:
      error?.message || 'Unknown error'
  });

  switch (statusCode) {
    case 400:
      return res.status(400).json({
        message:
          'The request could not be processed because the JSON body is invalid.'
      });

    case 404:
      return res.status(404).json({
        message:
          'The requested resource was not found.'
      });

    case 403:
      return res.status(403).json({
        message:
          'Access to this resource is not allowed.'
      });

    default:
      return res.status(500).json({
        message:
          'An unexpected server error occurred.'
      });
  }
}