import { NotificationRequest } from '../models/NotificationRequest.js';
import { ProcessedInventoryEvent } from '../models/ProcessedInventoryEvent.js';

async function markEventStatus(eventId, processingStatus) {
  await ProcessedInventoryEvent.updateOne(
    { _id: eventId },
    { $set: { processingStatus } }
  );
}

/**
 * Processes a normalised inventory event independently of HTTP transport.
 * A development fixture and a future verified Shopify webhook can both call
 * this function after their own input validation and normalisation.
 */
export async function processInventoryEvent(inventoryEvent) {
  let eventRecord;

  try {
    eventRecord = await ProcessedInventoryEvent.create({
      ...inventoryEvent,
      processingStatus: 'received'
    });
  } catch (error) {
    if (error?.code === 11000) {
      return {
        outcome: 'duplicate',
        deliveryId: inventoryEvent.deliveryId,
        matchedRequestCount: 0,
        transitionedRequestCount: 0,
        notificationRequests: []
      };
    }

    throw error;
  }

  try {
    if (inventoryEvent.available <= 0) {
      await markEventStatus(eventRecord._id, 'ignored');

      return {
        outcome: 'ignored',
        deliveryId: inventoryEvent.deliveryId,
        matchedRequestCount: 0,
        transitionedRequestCount: 0,
        notificationRequests: []
      };
    }

    const pendingRequests = await NotificationRequest.find({
      shopDomain: inventoryEvent.shopDomain,
      inventoryItemId: inventoryEvent.inventoryItemId,
      status: 'pending'
    });

    const requestIds = pendingRequests.map((request) => request._id);

    const transitionResult = requestIds.length
      ? await NotificationRequest.updateMany(
          {
            _id: { $in: requestIds },
            status: 'pending'
          },
          {
            $set: { status: 'processing' }
          }
        )
      : { modifiedCount: 0 };

    await markEventStatus(eventRecord._id, 'processed');

    return {
      outcome: 'processed',
      deliveryId: inventoryEvent.deliveryId,
      matchedRequestCount: pendingRequests.length,
      transitionedRequestCount: transitionResult.modifiedCount,
      notificationRequests: pendingRequests
    };
  } catch (error) {
    try {
      await markEventStatus(eventRecord._id, 'failed');
    } catch (statusUpdateError) {
      console.error({
        event: 'inventory_event_status_update_failed',
        deliveryId: inventoryEvent.deliveryId,
        errorName: statusUpdateError?.name,
        errorMessage: statusUpdateError?.message
      });
    }

    throw error;
  }
}