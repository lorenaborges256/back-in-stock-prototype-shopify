const allowedFields = new Set([
  'deliveryId',
  'shopDomain',
  'inventoryItemId',
  'locationId',
  'available'
]);

const identifierPattern = /^[A-Za-z0-9:./_-]+$/u;

function addError(errors, field, message) {
  errors.push({ field, message });
}

function requiredIdentifier(
  value,
  field,
  errors,
  maximumLength
) {
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
  } else if (!identifierPattern.test(cleaned)) {
    addError(
      errors,
      field,
      'contains unsupported characters.'
    );
  }

  return cleaned;
}

/**
 * Validates an invented inventory event used for
 * development testing and Bruno requests.
 */
export function validateInventoryFixtureEvent(
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

  const deliveryId = requiredIdentifier(
    body.deliveryId,
    'deliveryId',
    errors,
    255
  );

  const shopDomain = requiredIdentifier(
    body.shopDomain,
    'shopDomain',
    errors,
    253
  ).toLowerCase();

  const inventoryItemId = requiredIdentifier(
    body.inventoryItemId,
    'inventoryItemId',
    errors,
    128
  );

  const locationId = requiredIdentifier(
    body.locationId,
    'locationId',
    errors,
    128
  );

  if (
    typeof body.available !== 'number' ||
    !Number.isInteger(body.available)
  ) {
    addError(
      errors,
      'available',
      'must be an integer.'
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message:
        'Please correct the inventory fixture event details.',
      errors
    });
  }

  req.inventoryEventInput = Object.freeze({
    deliveryId,
    topic: 'inventory_levels/update',
    shopDomain,
    inventoryItemId,
    locationId,
    available: body.available,
    receivedAt: new Date()
  });

  return next();
}