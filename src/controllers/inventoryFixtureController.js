import { processInventoryEvent } from '../services/inventoryEventService.js';

const outcomeMessages = {
  processed: 'The controlled inventory event was processed.',
  ignored: 'The controlled inventory event was recorded and ignored because available stock is not positive.',
  duplicate: 'The controlled inventory event was already recorded. No request state was changed.'
};

/**
 * Development-only adapter. It translates the shared service result into a
 * safe HTTP response and never returns notification email addresses, message
 * IDs or Ethereal preview URLs to a client.
 */
export async function createInventoryFixtureEvent(req, res, next) {
  try {
    const result = await processInventoryEvent(req.inventoryEventInput);

    console.info({
      event: 'inventory_fixture_processed',
      deliveryId: result.deliveryId,
      outcome: result.outcome,
      matchedRequestCount: result.matchedRequestCount,
      transitionedRequestCount: result.transitionedRequestCount,
      emailSentCount: result.emailSentCount,
      emailFailedCount: result.emailFailedCount
    });

    return res.status(200).json({
      message: outcomeMessages[result.outcome],
      outcome: result.outcome,
      matchedRequestCount: result.matchedRequestCount,
      transitionedRequestCount: result.transitionedRequestCount,
      emailSentCount: result.emailSentCount,
      emailFailedCount: result.emailFailedCount
    });
  } catch (error) {
    return next(error);
  }
}