import { NotificationRequest } from '../models/NotificationRequest.js';

const acceptedResponse = {
  message:
    'Your notification request has been received. If an active request already exists, another request will not be created.'
};

/**
 * Creates a new notification request.
 *
 * The same response is returned for both successful creations and duplicate
 * requests. This prevents the API from revealing whether a particular email
 * address already has an active notification request.
 */
export async function createNotificationRequest( req, res, next) {
  try {
    const notificationRequest =
      await NotificationRequest.create({
        ...req.notificationInput,
        status: 'pending'
      });

    console.info({
      event: 'notification_request_created',
      requestId:
        notificationRequest._id.toString(),
      variantId:
        notificationRequest.variantId,
      inventoryItemId:
        notificationRequest.inventoryItemId
    });

    return res.status(202).json(
      acceptedResponse
    );
  } catch (error) {
    if (error?.code === 11000) {
      console.info({
        event: 'notification_request_duplicate',
        variantId:
          req.notificationInput.variantId,
        inventoryItemId:
          req.notificationInput.inventoryItemId
      });

      return res.status(202).json(
        acceptedResponse
      );
    }

    return next(error);
  }
}