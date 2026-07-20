import { NotificationRequest } from '../models/NotificationRequest.js';
import { ProcessedInventoryEvent } from '../models/ProcessedInventoryEvent.js';
import { sendBackInStockNotification } from './notificationEmailService.js';



async function markEventStatus(eventId, processingStatus) {
  await ProcessedInventoryEvent.updateOne(
    { _id: eventId },
    { $set: { processingStatus } }
  );
}

function safeEmailFailureCode(error) {
  switch (error?.code) {
    case 'EMAIL_TRANSPORT_DISABLED':
      return 'email_transport_disabled';
    case 'EMAIL_TEMPLATE_INVALID':
      return 'email_template_invalid';
    case 'EAUTH':
      return 'email_auth_failed';
    case 'ETIMEDOUT':
    case 'ECONNECTION':
      return 'email_transport_unavailable';
    default:
      return 'email_send_failed';
  }
}

async function transitionPendingRequests(pendingRequests) {
  const transitionedRequests = [];

  for (const pendingRequest of pendingRequests) {
    const transitionedRequest = await NotificationRequest.findOneAndUpdate(
      {
        _id: pendingRequest._id,
        status: 'pending'
      },
      {
        $set: { status: 'processing' },
        $unset: {
          sentAt: 1,
          emailMessageId: 1,
          lastErrorCode: 1
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (transitionedRequest) {
      transitionedRequests.push(transitionedRequest);
    }
  }

  return transitionedRequests;
}

async function markRequestSent(requestId, messageId) {
  const setValues = {
    status: 'sent',
    sentAt: new Date()
  };
  const unsetValues = {
    lastErrorCode: 1
  };

  if (messageId) {
    setValues.emailMessageId = messageId;
  } else {
    unsetValues.emailMessageId = 1;
  }

  const result = await NotificationRequest.updateOne(
    {
      _id: requestId,
      status: 'processing'
    },
    {
      $set: setValues,
      $unset: unsetValues
    }
  );

  if (result.modifiedCount !== 1) {
    const error = new Error('The sent-notification status could not be recorded.');
    error.code = 'EMAIL_SENT_RECORD_UPDATE_FAILED';
    throw error;
  }
}

async function markRequestFailed(requestId, failureCode) {
  const result = await NotificationRequest.updateOne(
    {
      _id: requestId,
      status: 'processing'
    },
    {
      $set: {
        status: 'failed',
        lastErrorCode: failureCode
      },
      $unset: {
        sentAt: 1,
        emailMessageId: 1
      }
    }
  );

  if (result.modifiedCount !== 1) {
    const error = new Error('The failed-notification status could not be recorded.');
    error.code = 'EMAIL_FAILURE_RECORD_UPDATE_FAILED';
    throw error;
  }
}

async function deliverTransitionedRequest(notificationRequest) {
  let delivery;

  try {
    delivery = await sendBackInStockNotification(notificationRequest);
  } catch (error) {
    const failureCode = safeEmailFailureCode(error);

    await markRequestFailed(notificationRequest._id, failureCode);

    console.error({
    event: 'notification_email_failed',
    failureCode: 'email_send_failed',
    errorCode: error?.code ?? 'unknown'
    });


    return {
      emailSentCount: 0,
      emailFailedCount: 1
    };
  }

  try {
    await markRequestSent(notificationRequest._id, delivery.messageId);
  } catch (error) {
    // The test message may already exist. Do not resend automatically because
    // doing so could create a duplicate notification.
    console.error({
      event: 'notification_sent_record_update_failed',
      requestId: notificationRequest._id.toString(),
      errorCode: error?.code || 'unknown'
    });

    throw error;
  }

  console.info({
    event: 'notification_email_sent',
    requestId: notificationRequest._id.toString(),
    messageId: delivery.messageId || 'unavailable',
    previewUrl: delivery.previewUrl
  });

  return {
    emailSentCount: 1,
    emailFailedCount: 0
  };
}

async function deliverTransitionedRequests(notificationRequests) {
  const summary = {
    emailSentCount: 0,
    emailFailedCount: 0
  };

  for (const notificationRequest of notificationRequests) {
    const result = await deliverTransitionedRequest(notificationRequest);
    summary.emailSentCount += result.emailSentCount;
    summary.emailFailedCount += result.emailFailedCount;
  }

  return summary;
}

/**
 * Processes a normalised inventory event independently of HTTP transport.
 * The development fixture and any future verified Shopify webhook can call
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
        emailSentCount: 0,
        emailFailedCount: 0
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
        emailSentCount: 0,
        emailFailedCount: 0
      };
    }

    const pendingRequests = await NotificationRequest.find({
      shopDomain: inventoryEvent.shopDomain,
      inventoryItemId: inventoryEvent.inventoryItemId,
      status: 'pending'
    });

    const transitionedRequests = await transitionPendingRequests(pendingRequests);
    const emailSummary = await deliverTransitionedRequests(transitionedRequests);

    await markEventStatus(eventRecord._id, 'processed');

    return {
      outcome: 'processed',
      deliveryId: inventoryEvent.deliveryId,
      matchedRequestCount: pendingRequests.length,
      transitionedRequestCount: transitionedRequests.length,
      emailSentCount: emailSummary.emailSentCount,
      emailFailedCount: emailSummary.emailFailedCount
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