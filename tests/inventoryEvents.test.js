import { describe, expect, it, vi } from 'vitest';
import { ProcessedInventoryEvent } from '../src/models/ProcessedInventoryEvent.js';
import { NotificationRequest } from '../src/models/NotificationRequest.js';
import { processInventoryEvent } from '../src/services/inventoryEventService.js';

// Mock database operations for inventory event processing
vi.spyOn(ProcessedInventoryEvent, 'create').mockImplementation(async (data) => {
  if (data.deliveryId === 'evt-duplicate') {
    const err = new Error('Duplicate event');
    err.code = 11000;
    throw err;
  }
  return {
    _id: '770000000000000000000001',
    ...data,
    processingStatus: 'received'
  };
});

vi.spyOn(ProcessedInventoryEvent, 'updateOne').mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

vi.spyOn(NotificationRequest, 'find').mockImplementation(async () => [
  { _id: '880000000000000000000001', emailDisplay: 'customer@example.com', status: 'pending' }
]);

vi.spyOn(NotificationRequest, 'findOneAndUpdate').mockResolvedValue({
  _id: '880000000000000000000001',
  status: 'matched'
});

const validEvent = {
  deliveryId: 'evt-unique-123',
  topic: 'inventory_levels/update',
  shopDomain: 'mystore.myshopify.com',
  inventoryItemId: 'gid://shopify/InventoryItem/55555',
  locationId: 'gid://shopify/Location/1',
  available: 5
};

describe('Inventory Event Service', () => {
  it('processes a new restock event and matches pending notifications', async () => {
    const result = await processInventoryEvent(validEvent);
    expect(result.outcome).toBe('processed');
    expect(result.deliveryId).toBe('evt-unique-123');
    expect(result.matchedRequestCount).toBe(1);
  });

  it('handles duplicate events idempotently without throwing', async () => {
    const result = await processInventoryEvent({ ...validEvent, deliveryId: 'evt-duplicate' });
    expect(result.outcome).toBe('duplicate');
    expect(result.matchedRequestCount).toBe(0);
  });

  it('ignores events with zero or negative availability', async () => {
    const result = await processInventoryEvent({ ...validEvent, deliveryId: 'evt-zero-stock', available: 0 });
    expect(result.outcome).toBe('ignored');
    expect(result.matchedRequestCount).toBe(0);
  });
});
