import { processInventoryEvent } from '../services/inventoryEventService.js';

const outcomeMessages = {
  processed:
    'The inventory event was processed successfully.',

  ignored:
    'The inventory event was recorded but ignored because available stock is not greater than zero.',

  duplicate:
    'The inventory event was already processed previously.'
};

/**
 * Development-only endpoint used to simulate Shopify inventory updates.
 *
 * This controller:
 * - records inventory events
 * - matches pending notification requests
 * - transitions matching requests to "matched"
 *
 * Email delivery is intentionally excluded from this prototype and will be
 * implemented in a future iteration.
 */
export async function createInventoryFixtureEvent( req, res, next) {
  try {
    const result = await processInventoryEvent(
      req.inventoryEventInput
    );

    console.info({
      event: 'inventory_fixture_processed',
      deliveryId: result.deliveryId,
      outcome: result.outcome,
      matchedRequestCount: result.matchedRequestCount,
      transitionedRequestCount: result.transitionedRequestCount
    });

    return res.status(200).json({
      message: outcomeMessages[result.outcome],
      outcome: result.outcome,
      matchedRequestCount: result.matchedRequestCount,
      transitionedRequestCount:
        result.transitionedRequestCount
    });
  } catch (error) {
    return next(error);
  }
}