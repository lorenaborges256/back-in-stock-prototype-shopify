import { NotificationRequest } from '../models/NotificationRequest.js';
import { ProcessedInventoryEvent } from '../models/ProcessedInventoryEvent.js';

async function markEventStatus(eventId, processingStatus) {
  await ProcessedInventoryEvent.updateOne(
    { _id: eventId },
    { $set: { processingStatus } }
  );
}

async function transitionPendingRequests(pendingRequests) {
  const matchedRequests = [];

  for (const pendingRequest of pendingRequests) {
    const matchedRequest = await NotificationRequest.findOneAndUpdate(
      {
        _id: pendingRequest._id,
        status: 'pending'
      },
      {
        $set: {
          status: 'matched'
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (matchedRequest) {
      matchedRequests.push(matchedRequest);
    }
  }

  return matchedRequests;
}

/**
 * Processes an inventory event and matches waiting notification requests.
 *
 * Future implementation:
 * - Send email notifications
 * - Record sentAt timestamps
 * - Retry failed deliveries
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
        transitionedRequestCount: 0
      };
    }

    throw error;
  }

  try {
    if (inventoryEvent.available <= 0) {
      await markEventStatus(
        eventRecord._id,
        'ignored'
      );

      return {
        outcome: 'ignored',
        deliveryId: inventoryEvent.deliveryId,
        matchedRequestCount: 0,
        transitionedRequestCount: 0
      };
    }

    const pendingRequests =
      await NotificationRequest.find({
        shopDomain: inventoryEvent.shopDomain,
        inventoryItemId: inventoryEvent.inventoryItemId,
        status: 'pending'
      });

    const matchedRequests =
      await transitionPendingRequests(
        pendingRequests
      );

    await markEventStatus(
      eventRecord._id,
      'processed'
    );

    console.info({
      event: 'inventory_event_processed',
      deliveryId: inventoryEvent.deliveryId,
      inventoryItemId: inventoryEvent.inventoryItemId,
      matchedRequestCount:
        matchedRequests.length
    });

    return {
      outcome: 'processed',
      deliveryId: inventoryEvent.deliveryId,
      matchedRequestCount:
        pendingRequests.length,
      transitionedRequestCount:
        matchedRequests.length
    };
  } catch (error) {
    try {
      await markEventStatus(
        eventRecord._id,
        'failed'
      );
    } catch (statusUpdateError) {
      console.error({
        event:
          'inventory_event_status_update_failed',
        deliveryId: inventoryEvent.deliveryId,
        errorName:
          statusUpdateError?.name,
        errorMessage:
          statusUpdateError?.message
      });
    }

    throw error;
  }
}