import { Router } from 'express';

import { createInventoryFixtureEvent }
  from '../controllers/inventoryFixtureController.js';

import { validateInventoryFixtureEvent }
  from '../middleware/validateInventoryFixtureEvent.js';

const router = Router();

/**
 * Development-only route used to simulate inventory updates.
 *
 * Example:
 * POST /api/inventory-fixtures
 */
router.post(
  '/',
  validateInventoryFixtureEvent,
  createInventoryFixtureEvent
);

export default router;