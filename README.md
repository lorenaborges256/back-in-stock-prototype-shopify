# Shopify Back-in-Stock Notification Prototype - Usage & Installation Guide

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Structure](#2-project-structure)
3. [Prerequisites](#3-prerequisites)
4. [Installation & Setup](#4-installation--setup)
5. [API Endpoints](#5-api-endpoints)
6. [Testing with Bruno](#6-testing-with-bruno)
7. [Docker Development Environment](#7-docker-development-environment)
8. [Code Documentation](#8-code-documentation)
9. [Future Enhancements](#9-future-enhancements)

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
```bash
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
npm ci
```

> Before Docker's use those were the local dependency-installation commands:
> ```bash
>npm install express mongoose dotenv cors helmet
>npm install --save-dev nodemon
>```

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
  "inventoryItemId": "INV100",
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
POST http://localhost:3001/api/inventory-events
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
  "inventoryItemId": "INV100",
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

- Step 2 - Create an inventory event with the same `inventoryItemId`:
```
POST http://localhost:3001/api/inventory-events

```
Body `<JSON>`
```json
{
  "deliveryId": "EVT-001",
  "shopDomain": "sports-shop.local",
  "inventoryItemId": "INV100",
  "locationId": "LOC001",
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
In MongoDB Compass, connect to the `back_in_stock_prototype` database and open the `notificationrequests` collection. Locate the notification request created with the test email address, such as `john@example.com`. Confirm that the document contains `inventoryItemId: "INV100"` and that its `status` has changed from `"pending"` to `"matched"` after the inventory event is processed. Then open the `processedinventoryevents` collection and confirm that an event with `deliveryId: "EVT-001"` has been recorded with `processingStatus: "processed"`. This verifies that the application saved the notification request, received the inventory update, and successfully matched the two records.

## 7. Docker Development Environment

The application can be run in a repeatable Docker development environment. The `api` service runs the Node.js and Express application, while the `mongo` service provides MongoDB persistence. Docker Compose creates a private bridge network so the API can connect to MongoDB using the service hostname `mongo`. Only the API is exposed to the host machine on port `3001`; MongoDB remains private to the Docker network.

### 7.1 Container Files

| File | Purpose |
| --- | --- |
| `Dockerfile` | Builds a versioned Node.js API image and starts the application with `npm start`. |
| `compose.yaml` | Defines the API and MongoDB services, environment variables, port mapping, health checks, private network, and persistent volume. |
| `.dockerignore` | Excludes local dependencies, environment files, Git metadata, logs, documentation, and other unnecessary files from the Docker build context. |
| `.env` | Local-only runtime configuration for non-container execution. This file is ignored by Git and must not contain committed secrets. |

### 7.2 Image Naming and Tags

The API image uses the consistent local image name and semantic version tag shown below:

```bash
docker build --tag back-in-stock-api:1.0.0 .
```

The repository name, `back-in-stock-api`, identifies the application component. The version tag, `1.0.0`, identifies the build version. The Dockerfile also uses deliberate base-image versioning with `node:22.13.0-alpine`, rather than an unversioned `latest` tag. The Compose database service uses the versioned `mongo:8.0` image.

### 7.3 Environment Variables and Security

| Variable | API-only local value | Docker Compose value | Purpose |
| --- | --- | --- | --- |
| `NODE_ENV` | `development` | `development` | Enables the development-only inventory-event simulation route for testing. |
| `PORT` | `3001` | `3001` | Sets the Express API listening port. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/back_in_stock_prototype` | `mongodb://mongo:27017/back_in_stock_prototype` | Sets the database connection address. Docker Compose uses the internal service hostname `mongo`. |

The local `.env` file is excluded from Git and Docker build context. No production credentials are stored in this repository. The container runs as the non-root `node` user, Docker exposes only the API port, and the MongoDB port is not published to the host machine.

### 7.4 Build and Run Commands

Start the complete Docker Compose development environment:

```bash
docker compose up --build --detach --wait
```

Check service status:

```bash
docker compose ps
```

View API logs:

```bash
docker compose logs --tail=50 api
```

Test the containerised API health endpoint:

```text
GET http://localhost:3001/health
```

Stop the services while preserving the MongoDB named volume:

```bash
docker compose down
```

Remove the services and the named volume when a complete database reset is required:

```bash
docker compose down --volumes
```

### 7.5 Docker Architecture and Verification

![Docker Compose Application Architecture Diagram](Documentation\DEV1004_AAD.drawio.png)

The application architecture diagram in `Documentation/DEV1004_AAD.drawio` represents the Docker Compose environment. A Bruno client or browser sends HTTP requests to host port `3001`, which Docker forwards to the Node.js and Express API container. The API receives `NODE_ENV`, `PORT`, and `MONGODB_URI` at runtime. It connects to the MongoDB container through the private Docker network using `mongo:27017`. The MongoDB container stores persistent data in the named `mongodb_data` volume.

The solution was verified by building the `back-in-stock-api:1.0.0` image, running it as an individual container, and receiving `200 OK` from `/health`. The Compose environment was then started successfully with healthy API and MongoDB services. A notification request was accepted with `202 Accepted`, a matching inventory event returned `200 OK` with one matched and transitioned request, and the private MongoDB container confirmed the final `matched` notification status and `processed` inventory-event status.


## 8. Code Documentation

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

## 9. Future Enhancements
Potential future improvements include:

- Shopify webhook integration
- Email notification delivery
- Retry mechanisms for failed notifications
- Queue-based event processing

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductAvailable.png) Product Variant - ICE - Available

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductSoldOut_button.png) Product Variant - ICE - Unavailable, Sold Out Button

![Draft Future implementation on Shopify Store ](_img\backInStock_ProductSoldOut_NotifymeButton.png) Product Variant - ICE - Unavailable Notify-me Button

![Draft Future implementation on Shopify Store ](_img\backInStock_NotifymeForm.png) Product Variant - ICE - Notify-me Form