import { NotificationRequest } from '../models/NotificationRequest.js';

const neutralAcceptedResponse = {
  message: 'Your notification request has been received. If an active request already exists, another will not be created.'
};

/**
 * Persists a validated request. The same neutral response is intentionally
 * returned after a duplicate-key collision so the public endpoint does not
 * reveal whether a supplied email address already has an active request.
 */
export async function createNotificationRequest(req, res, next) {
  try {
    const notificationRequest = await NotificationRequest.create({
      ...req.notificationInput,
      status: 'pending'
    });

    console.info({
      event: 'notification_request_created',
      requestId: notificationRequest._id.toString(),
      variantId: notificationRequest.variantId
    });

    return res.status(202).json(neutralAcceptedResponse);
  } catch (error) {
    if (error?.code === 11000) {
      console.info({
        event: 'notification_request_duplicate',
        variantId: req.notificationInput.variantId
      });

      return res.status(202).json(neutralAcceptedResponse);
    }

    return next(error);
  }
}