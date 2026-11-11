import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { NotificationRequest } from '../src/models/NotificationRequest.js';
import app from '../src/app.js';

// Mock NotificationRequest.create so tests run without an active MongoDB connection
vi.spyOn(NotificationRequest, 'create').mockImplementation(async (data) => {
  if (data.emailNormalized === 'duplicate@example.com') {
    const err = new Error('Duplicate key');
    err.code = 11000;
    throw err;
  }
  return {
    _id: '660000000000000000000001',
    variantId: data.variantId,
    inventoryItemId: data.inventoryItemId,
    ...data
  };
});

const samplePayload = {
  firstName: 'Lorena',
  email: 'customer@example.com',
  notificationConsent: true,
  shopDomain: 'mystore.myshopify.com',
  productId: 'gid://shopify/Product/1234567890',
  variantId: 'gid://shopify/ProductVariant/9876543210',
  inventoryItemId: 'gid://shopify/InventoryItem/55555',
  productTitle: 'Classic Trench Coat',
  variantTitle: 'Navy / M',
  productUrl: 'https://mystore.myshopify.com/products/trench'
};

describe('POST /api/notifications', () => {
  it('successfully creates a notification request and returns 202 Accepted', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send(samplePayload);

    expect(res.status).toBe(202);
    expect(res.body.message).toMatch(/received/i);
  });

  it('handles duplicate requests gracefully and returns 202 without leaking info', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({ ...samplePayload, email: 'duplicate@example.com' });

    expect(res.status).toBe(202);
    expect(res.body.message).toMatch(/received/i);
  });

  it('rejects requests missing an email with 400 Bad Request', async () => {
    const { email, ...invalid } = samplePayload;
    const res = await request(app)
      .post('/api/notifications')
      .send(invalid);

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(Array.isArray(res.body.errors)).toBe(true);
  });

  it('rejects requests with an invalid email syntax with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/notifications')
      .send({ ...samplePayload, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('rejects requests missing notificationConsent with 400 Bad Request', async () => {
    const { notificationConsent, ...invalid } = samplePayload;
    const res = await request(app)
      .post('/api/notifications')
      .send(invalid);

    expect(res.status).toBe(400);
  });
});
