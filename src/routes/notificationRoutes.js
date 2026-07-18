import { Router } from 'express';
import { createNotificationRequest } from '../controllers/notificationRequestController.js';
import { validateNotificationRequest } from '../middleware/validateNotificationRequest.js';

const notificationRoutes = Router();

notificationRoutes.post('/', validateNotificationRequest, createNotificationRequest);

export default notificationRoutes;
