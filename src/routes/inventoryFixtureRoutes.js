import { Router } from 'express';
import { createInventoryFixtureEvent } from '../controllers/inventoryFixtureController.js';
import { validateInventoryFixtureEvent } from '../middleware/validateInventoryFixtureEvent.js';

const inventoryFixtureRoutes = Router();

inventoryFixtureRoutes.post(
  '/',
  validateInventoryFixtureEvent,
  createInventoryFixtureEvent
);

export default inventoryFixtureRoutes;