import { Router } from 'express';

import {
  createNotificationRequest
} from '../controllers/notificationRequestController.js';

import {
  validateNotificationRequest
} from '../middleware/validateNotificationRequest.js';

const router = Router();

/**
 * Creates a back-in-stock notification request.
 *
 * Example:
 * POST /api/notifications
 */
router.post(
  '/',
  validateNotificationRequest,
  createNotificationRequest
);

export default router;