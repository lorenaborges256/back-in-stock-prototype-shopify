const allowedFields = new Set([
  'firstName',
  'email',
  'notificationConsent',
  'shopDomain',
  'productId',
  'variantId',
  'productTitle',
  'variantTitle',
  'productUrl'
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const identifierPattern = /^[A-Za-z0-9:./_-]+$/u;

function addError(errors, field, message) {
  errors.push({ field, message });
}

function requiredText(value, field, errors, maximumLength) {
  if (typeof value !== 'string') {
    addError(errors, field, 'is required.');
    return '';
  }

  const cleaned = value.trim();

  if (!cleaned) {
    addError(errors, field, 'is required.');
  } else if (cleaned.length > maximumLength) {
    addError(
      errors,
      field,
      `must not exceed ${maximumLength} characters.`
    );
  }

  return cleaned;
}

function optionalText(value, field, errors, maximumLength) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return undefined;
  }

  if (typeof value !== 'string') {
    addError(
      errors,
      field,
      'must be text when supplied.'
    );

    return undefined;
  }

  const cleaned = value.trim();

  if (cleaned.length > maximumLength) {
    addError(
      errors,
      field,
      `must not exceed ${maximumLength} characters.`
    );
  }

  return cleaned || undefined;
}

function validIdentifier(
  value,
  field,
  errors
) {
  if (
    value &&
    !identifierPattern.test(value)
  ) {
    addError(
      errors,
      field,
      'contains unsupported characters.'
    );
  }
}

function validateProductUrl(
  value,
  errors
) {
  try {
    const parsedUrl = new URL(value);

    if (
      parsedUrl.protocol !== 'https:'
    ) {
      addError(
        errors,
        'productUrl',
        'must use HTTPS.'
      );
    }

    return parsedUrl.toString();
  } catch {
    addError(
      errors,
      'productUrl',
      'must be a valid URL.'
    );

    return '';
  }
}

/**
 * Validates and normalises notification requests before they
 * reach the controller. Only validated fields are attached
 * to req.notificationInput.
 */
export function validateNotificationRequest(
  req,
  res,
  next
) {
  const body = req.body;

  if (
    !body ||
    Array.isArray(body) ||
    typeof body !== 'object'
  ) {
    return res.status(400).json({
      message:
        'The request body must be a JSON object.'
    });
  }

  const errors = [];

  const unexpectedFields =
    Object.keys(body).filter(
      (field) => !allowedFields.has(field)
    );

  if (unexpectedFields.length > 0) {
    addError(
      errors,
      'request',
      'contains unsupported fields.'
    );
  }

  const firstName = optionalText(
    body.firstName,
    'firstName',
    errors,
    80
  );

  const emailDisplay = requiredText(
    body.email,
    'email',
    errors,
    254
  );

  const emailNormalized =
    emailDisplay.toLowerCase();

  const shopDomain = requiredText(
    body.shopDomain,
    'shopDomain',
    errors,
    253
  ).toLowerCase();

  const productId = requiredText(
    body.productId,
    'productId',
    errors,
    128
  );

  const variantId = requiredText(
    body.variantId,
    'variantId',
    errors,
    128
  );

  const productTitle = requiredText(
    body.productTitle,
    'productTitle',
    errors,
    255
  );

  const variantTitle = requiredText(
    body.variantTitle,
    'variantTitle',
    errors,
    255
  );

  const rawProductUrl = requiredText(
    body.productUrl,
    'productUrl',
    errors,
    2048
  );

  if (
    emailDisplay &&
    !emailPattern.test(emailNormalized)
  ) {
    addError(
      errors,
      'email',
      'must be a valid email address.'
    );
  }

  validIdentifier(
    productId,
    'productId',
    errors
  );

  validIdentifier(
    variantId,
    'variantId',
    errors
  );

  const productUrl =
    rawProductUrl
      ? validateProductUrl(
          rawProductUrl,
          errors
        )
      : '';

  if (
    body.notificationConsent !== true
  ) {
    addError(
      errors,
      'notificationConsent',
      'must be acknowledged.'
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message:
        'Please correct the highlighted request details.',
      errors
    });
  }

  req.notificationInput = Object.freeze({
    firstName,
    emailDisplay,
    emailNormalized,
    shopDomain,
    productId,
    variantId,
    productTitle,
    variantTitle,
    productUrl,
    notificationConsentAt: new Date()
  });

  return next();
}