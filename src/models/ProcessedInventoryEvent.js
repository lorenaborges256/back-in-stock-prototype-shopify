import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventStatuses = ['received', 'processed', 'ignored', 'failed'];

const processedInventoryEventSchema = new Schema(
  {
    deliveryId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    shopDomain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 253
    },
    inventoryItemId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    locationId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 128
    },
    available: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'available must be an integer.'
      }
    },
    receivedAt: {
      type: Date,
      required: true
    },
    processingStatus: {
      type: String,
      enum: eventStatuses,
      default: 'received',
      required: true
    }
  },
  {
    versionKey: false,
    strict: 'throw'
  }
);

processedInventoryEventSchema.index(
  { deliveryId: 1 },
  {
    name: 'unique_inventory_event_delivery',
    unique: true
  }
);

export const ProcessedInventoryEvent = mongoose.model(
  'ProcessedInventoryEvent',
  processedInventoryEventSchema
);