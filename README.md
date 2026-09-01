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

This repository contains an **API-focused prototype** for a Shopify-style back-in-stock notification workflow. The application is built with Node.js, Express, MongoDB, and Mongoose. It exposes HTTP endpoints for receiving notification requests, processing development inventory events, and checking service health. Security and request-handling middleware are provided by Helmet, CORS, and Express JSON parsing.

The implemented workflow allows a customer to register interest in an unavailable product variant. During development, an inventory-event endpoint can simulate a stock update. When an event reports positive availability for the same shop domain and inventory item, the application finds matching pending notification requests and changes their status to `matched`. MongoDB persists both notification requests and processed inventory events, including duplicate-event protection. 

The project can run directly with Node.js and MongoDB or in a containerised local environment. The Docker configuration builds a versioned API image and uses Docker Compose to run two services: the Express API and MongoDB. Compose publishes only the API on port `3001`, places both services on a private bridge network, waits for a healthy MongoDB service before starting the API, and stores database data in the named `mongodb_data` volume.

### Current Scope

| Implemented in this prototype | Intentionally not implemented |
| --- | --- |
| Notification-request registration and validation | Live Shopify API integration |
| Development-only inventory-event simulation | Shopify webhook reception |
| Matching pending requests to positive inventory updates | Email or other customer-notification delivery |
| Duplicate request and duplicate event prevention | Production queueing, retries, and notification delivery tracking |
| MongoDB persistence, API health check, and error handling | A storefront user interface or production deployment |
| Dockerfile, Docker Compose environment, private service network, and persistent MongoDB volume |  |

The repository uses invented test data and is intended for educational and prototype purposes. It must not be used with real customer information or production credentials.

---

## 2. Project Structure

### ERD

![ERD Back to Stock Prototype](_img\backinstockdatamodel.drawio.png)

BACK-TO-STOCK-PROTOTYPE-SHOPIFY

The repository separates application code, Docker configuration, documentation, and supporting visual assets. The `src/` directory contains the runtime API; the Docker files at the repository root define the containerised environment; and the documentation and image folders provide supporting material rather than application runtime dependencies. [1] [3] [4]

```text
back-in-stock-prototype-shopify/
├── src/                                      # Express API source code
│   ├── app.js                                # Express setup, middleware, health route, and route mounting
│   ├── server.js                             # MongoDB connection and HTTP server startup
│   ├── config/
│   │   ├── database.js                       # Database connection configuration
│   │   └── env.js                            # Environment-variable loading and validation
│   ├── controllers/
│   │   ├── inventoryFixtureController.js     # Development inventory-event endpoint controller
│   │   └── notificationRequestController.js  # Notification-request controller
│   ├── middleware/
│   │   ├── errorHandler.js                   # Not-found and application error handling
│   │   ├── validateInventoryFixtureEvent.js  # Inventory-event request validation
│   │   └── validateNotificationRequest.js    # Notification-request validation
│   ├── models/
│   │   ├── NotificationRequest.js            # Mongoose model for customer requests
│   │   └── ProcessedInventoryEvent.js        # Mongoose model for idempotent event processing
│   ├── routes/
│   │   ├── inventoryFixtureRoutes.js         # Development inventory-event routes
│   │   └── notificationRoutes.js             # Notification-request routes
│   └── services/
│       └── inventoryEventService.js           # Inventory-event matching logic
│
├── Dockerfile                                # Builds the Node.js API image and defines its health check
├── compose.yaml                              # Runs the `api` and `mongo` services, network, and data volume
├── .dockerignore                             # Removes non-runtime files from the Docker build context
├── .env.example                              # Example local environment-variable configuration
├── package.json                              # Project metadata, scripts, and dependencies
├── package-lock.json                         # Locked dependency versions for repeatable npm installs
├── Documentation/                            # Supporting report and editable architecture source diagram
│   ├── 16097_BorgesAmaral_Lorena_ISK1002_A2.md
│   └── DEV1004_AAD.drawio
├── _img/                                     # Rendered diagrams and prototype screenshots used by the README/docs
│   ├── DEV1004_AAD.drawio.png
│   ├── InventoryEventDataflow.drawio.png
│   ├── NotificationRequestDataflow.drawio.png
│   └── ...
├── README.md                                 # Installation, API, Docker, and project documentation
└── .gitignore                                # Git exclusions, including the local `.env` file
```

## 3. Prerequisites

### Software
The project can be run either in the recommended Docker Compose environment or directly with Node.js. Choose one of the two options below.

| Requirement| Required for Docker Compose | Required for direct Node.js run | Purpose |
|---|---|---|---|
| Git| Yes| Yes| Clone the repository.|
| Docker Desktop, or Docker Engine with the Docker Compose plugin | Yes| No | Build and run the API and MongoDB containers.|
| Node.js 22.x and npm| No| Yes| Install dependencies and run the Express API directly.|
| MongoDB Atlas account or local MongoDB instance| No| Yes| Provide database persistence when not using Docker Compose. |
| Bruno, Postman, curl, or another HTTP client| Optional| Optional| Test the health and API endpoints.|

Verify installation:

```bash
# Docker Compose route
docker --version
docker compose version

# Direct Node.js route
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