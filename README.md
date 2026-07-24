# Shopify Back-in-Stock Notification Prototype - Usage & Installation Guide

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Prerequisites](#3-prerequisites)
4. [Installation & Setup](#4-installation--setup)
5. [API Endpoints](#5-api-endpoints)
6. [Testing with Bruno](#6-testing-with-bruno)

---

## 1. Project Overview

This project is a Minimum Viable Product (MVP) prototype built with Node.js, Express, and MongoDB,implemented from an Entity Relationship Diagram (ERD).

The MVP prototype application allows:

1. Customers to register interest in an out-of-stock product variant.
2. Inventory events to be recorded.
3. Pending notification requests to be matched against inventory updates.
4. Matching requests to transition from a pending status to a matched status.

The project uses invented test data and is intended for educational purposes.

### Corrent Scope
Implemented:

- Notification request registration
- Request validation
- Inventory event processing
- Duplicate request prevention
- Duplicate event prevention
- MongoDB persistence
- Event-to-request matching

Not implemented:

- Shopify API integration
- Shopify webhooks
- Email delivery

Those features were intentionally been excluded from the prototype and are planned as a future enhancement.

---

## 2. Project Structure

### ERD

![ERD Back to Stock Prototype](_img\backinstockdatamodel.drawio.png)

BACK-TO-STOCK-PROTOTYPE-SHOPIFY
```
src
│
├── app.js
├── server.js
│
├── config
│   ├── database.js
│   └── env.js
│
├── controllers
│   ├── inventoryFixtureController.js
│   └── notificationRequestController.js
│
├── middleware
│   ├── errorHandler.js
│   ├── validateInventoryFixtureEvent.js
│   └── validateNotificationRequest.js
│
├── models
│   ├── NotificationRequest.js
│   └── ProcessedInventoryEvent.js
│
├── routes
│   ├── inventoryFixtureRoutes.js
│   └── notificationRoutes.js
│
└── services
    └── inventoryEventService.js

```

## 3. Prerequisites

### Software
To run this application locally, you must have the following installed on your machine:

| Requirement | Purpose |
| --- | --- | 
| Git | Clone the repository. |
| Node.js (v18 or higher recommended) | Run the Express server and install packages|
| npm  (Node Package Manager)| Install packages and run scripts | 
| MongoDB Atlas account (or local MongoDB installation) | Data persistence | 
| Bruno | API testing |

Verify installation:
```
node -v
npm -v
```

### Hardware and network
A standard desktop or laptop capable of running Node.js and accessing a MongoDB development database is sufficient. No performance benchmark or minimum hardware specification has been completed for this MVP.

### Required knowledge
You should be comfortable with basic command-line use, Node.js package installation, HTTP requests, and MongoDB connection strings. The project uses only invented test data. Do not use a real customer email address, real Shopify customer data, or production credentials.

## 4. Installation & Setup

### Step 1: Clone the Repositories

```bash

git clone https://github.com/lorenaborges256/back-in-stock-prototype-shopify.git

cd back-in-stock-prototype-shopify
```

### Step 2: install packages

```bash
npm install express mongoose dotenv cors helmet
npm install --save-dev nodemon
```

### Step 3: Create the local environment file .env

```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/back_in_stock_prototype
```

### Step 4: Start application

```bash
npm run dev
```
You should see:

```
MongoDB connection established.
Back-in-stock API listening on port 3001.
```

## 5. API Endpoints

### A. Health Check

Use Bruno or another HTTP client to send a request to the health endpoint:
```
GET http://localhost:3001/health
```

Response:

```json
{
  "status": "ok"
}
```

### B. Create Notification Request

Request
```
POST http://localhost:3001/api/notifications
``` 
Body `<JSON>`
```json
{
  "firstName": "John",
  "email": "john@example.com",
  "notificationConsent": true,
  "shopDomain": "sports-shop.local",
  "productId": "P100",
  "variantId": "V100",
  "productTitle": "Nike Air Runner",
  "variantTitle": "Size 10",
  "productUrl": "https://sports-shop.local/products/nike-air-runner"
}
```
Response:
```json
{
  "message": "Your notification request has been received. If an active request already exists, another request will not be created."
}
``
```

### C. Create Inventory Event

Development-only endpoint.

```
POST http://localhost:3001/api/test/inventory-event
```
Example body:
```json
{
  "deliveryId": "EVT-001",
  "shopDomain": "sports-shop.local",
  "inventoryItemId": "INV100",
  "locationId": "LOC001",
  "available": 5
}
```
Example response:

```json
{
  "message": "The inventory event was processed successfully.",
  "outcome": "processed",
  "matchedRequestCount": 1,
  "transitionedRequestCount": 1
}
```
## 6. Testing with Bruno

- Step 1 - Create a notification request:
```
POST http://localhost:3001/api/notifications
```
Use the sample JSON provided above.

- Step 2 - Create an inventory event with the same `inventoryItemId`:
```json
{
  "inventoryItemId": "INV100",
  "available": 5
}
```
- Step 3 - Observe the response on :

```json
{
  "outcome": "processed",
  "matchedRequestCount": 1,
  "transitionedRequestCount": 1
}
```
In MongoDB Compass observe

## 7. Code Documentation

The project includes comments throughout the codebase to explain:

- Route responsibilities
- Validation logic
- Inventory event processing
- Error handling
- Database initialization

Examples include:

```js
/**
* Creates a back-in-stock notification request.
*/
```
and

```js
/**
* Development-only endpoint used to simulate
* inventory updates.
*/
```

These comments assist future developers in understanding the purpose and behaviour of each component.

## 8. Future Enhancements
Potential future improvements include:

- Shopify webhook integration
- Email notification delivery
- Retry mechanisms for failed notifications
- Queue-based event processing

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductAvailable.png) Product Variant - ICE - Available

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductSoldOut_button.png) Product Variant - ICE - Unavailable, Sold Out Button

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductSoldOut_NotifymeButton.png) Product Variant - ICE - Unavailable Notify-me Button

![Draft Future implementation on Shopify Store ](_img\backInStock_NotifymeForm.png) Product Variant - ICE - Notify-me Form