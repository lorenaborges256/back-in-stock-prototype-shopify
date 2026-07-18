import mongoose from 'mongoose';

const { Schema } = mongoose;

const requestStatuses = ['pending', 'processing', 'sent', 'failed', 'cancelled'];

const notificationRequestSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      maxlength: 80,
      default: undefined
    },
    emailDisplay: {
      type: String,
      required: true,
      trim: true,
      maxlength: 254
    },
    emailNormalized: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    shopDomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 253
    },
    productId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    variantId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    inventoryItemId: {
      type: String,
      trim: true,
      maxlength: 128,
      default: undefined
    },
    productTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    variantTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    productUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048
    },
    notificationConsentAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: requestStatuses,
      default: 'pending',
      required: true
    },
    sentAt: {
      type: Date,
      default: undefined
    },
    emailMessageId: {
      type: String,
      trim: true,
      maxlength: 255,
      default: undefined
    },
    lastErrorCode: {
      type: String,
      trim: true,
      maxlength: 100,
      default: undefined
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

/**
 * Only pending requests participate in duplicate prevention. After a request
 * is sent or cancelled, a future request for the same email and variant may be
 * created. The database index, rather than a pre-insert lookup alone, protects
 * against two concurrent requests passing the same check.
 */
notificationRequestSchema.index(
  {
    shopDomain: 1,
    emailNormalized: 1,
    variantId: 1
  },
  {
    name: 'unique_pending_request_by_store_email_variant',
    unique: true,
    partialFilterExpression: { status: 'pending' }
  }
);

export const NotificationRequest = mongoose.model(
  'NotificationRequest',
  notificationRequestSchema
);
