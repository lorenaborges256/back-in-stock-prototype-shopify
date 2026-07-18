# Shopify Back-in-Stock Notification Prototype - Usage & Installation Guide

## Table of Contents
1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation & Setup](#3-installation--setup)
4. [Environment Variables](#4-environment-variables)
5. [Running the Application](#5-running-the-application)
6. [API Endpoints Reference](#6-api-endpoints-reference)

---

## 1. Overview

write abaout the app, how it will be used, technologies

---

## 2. Prerequisites

To run this application locally, you must have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)
- **Git**
- A **MongoDB Atlas** account (or local MongoDB installation)

---

### Step 1: Clone the Repositories
Open your terminal and clone both the backend and frontend repositories into the same parent directory:

```bash

git clone <https://github.com/lorenaborges256/back-in-stock-prototype-shopify>
```

### Step 2: install packages

```bash
npm init -y
npm install express mongoose dotenv cors helmet
npm install --save-dev nodemon
```

---

## 4. Environment Variables

Both the backend and frontend require environment variables to communicate securely. **Never commit `.env` files to GitHub.**


---

## 5. Running the Application


```bash
npm run dev
```
You should see:
```
MongoDB connection established.
Back-in-stock API listening on port 3001.
```

### Starting the Frontend Client
In your second terminal (inside the frontend folder), run:

```bash
npm run dev
```
You should see Vite start the server, typically at:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:  http://localhost:5173
```

### Accessing the App
Open your web browser and navigate to `http://localhost:5173`. The React frontend will load and automatically fetch data from your backend API running on port 5000.

---

## 6. API Endpoints Reference

Below is a reference of the core API endpoints provided by the GAMS backend. You can test these using tools like Bruno, Insomnia or Postman.

*Note: Most endpoints require a valid JWT token passed in the `Authorization` header (`Bearer <token>`).*

### Authentication
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new Guild Member |
| POST | `/auth/login` | No | Authenticate user and receive JWT |

### Items (Inventory-Based)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/items` | Yes | List all available artifacts |
| GET | `/items/:id` | Yes | Get specific artifact details |
| POST | `/items/:id/reserve` | Yes | Reserve an artifact (decrements stock) |
| POST | `/items` | Admin | Create a new artifact |
| PUT | `/items/:id` | Admin | Update artifact details or stock |

### Guild Contracts (Time-Based Quests)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/contracts` | Yes | List all active contracts |
| GET | `/contracts/:id` | Yes | Get specific contract details |
| POST | `/contracts/:id/accept` | Yes | Accept a contract (generates instructions) |
| POST | `/contracts` | Admin | Create a new contract |

### Watchlists
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/watchlist` | Yes | View user's watched items/contracts |
| POST | `/watchlist/:targetId` | Yes | Add an unavailable item/contract to watchlist |
| GET | `/notifications` | Yes | View user notifications |

### User Dashboard
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/dashboard` | Yes | View user active reservations, Items, and accepted contracts |

---

