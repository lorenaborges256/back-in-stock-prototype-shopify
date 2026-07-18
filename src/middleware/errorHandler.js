/**
 * Keeps detailed diagnostics on the server while returning non-sensitive
 * messages to public clients. Never attach request bodies to these log entries.
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: 'The requested API route was not found.'
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error?.statusCode || (error?.type === 'entity.parse.failed' ? 400 : 500);

  console.error({
    event: 'api_error',
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: error?.name,
    errorMessage: error?.message
  });

  if (statusCode === 400) {
    return res.status(400).json({
      message: 'The request could not be read as valid JSON.'
    });
  }

  if (statusCode === 403) {
    return res.status(403).json({
      message: 'This browser origin is not allowed to call the API.'
    });
  }

  return res.status(500).json({
    message: 'The server could not process the request. Please try again later.'
  });
}