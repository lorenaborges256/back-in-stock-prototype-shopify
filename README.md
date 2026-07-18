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

## 3. Installation & Setup

Because GAMS is a full-stack application, the backend and frontend live in separate repositories (or separate folders within a monorepo). You must install dependencies for **both** separately.

### Step 1: Clone the Repositories
Open your terminal and clone both the backend and frontend repositories into the same parent directory:

```bash

git clone <https://github.com/lorenaborges256/DEV1003_A3_FrontEnd_GAMS>
```

### Step 2: Install Backend Dependencies
Navigate into the backend folder and install the required npm packages:

```bash
cd <DEV1003_A2_BackEnd_GAMS>
npm install
```

### Step 3: Install Frontend Dependencies
Open a **new terminal window**, navigate to the frontend folder, and install the required npm packages:

```bash
cd <DEV1003_A3_FrontEnd_GAMS>
npm install
```

---

## 4. Environment Variables

Both the backend and frontend require environment variables to communicate securely. **Never commit `.env` files to GitHub.**

### Backend `.env`
Create a file named `.env` in the root of your **backend** folder. Add the following variables:

```env
# Database Connections
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/gams_db

# Security
JWT_SECRET=your_secret_key_here
TOKEN_HEADER_KEY=authorization
```
- *Replace `<username>`, `<password>`, and `<cluster-url>` with your actual MongoDB Atlas credentials.*  
- Generate JWT secret key in console with ```node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"```

### Frontend `.env`
Create a file named `.env` in the root of your **frontend** folder. Add the following variable so React knows where to find the Express API:

```env
VITE_API_URL=http://localhost:5000
```

---

## 5. Running the Application

To run the full MERN stack, you must run both the backend and frontend simultaneously using **two separate terminal windows**.

### Starting the Backend Server
In your first terminal, navigate to the backend directory and execute the seeding script to populate the database with initial data:

```bash
npm run seed
```
>Note on Administrative Access: By default, the seeding process designates one specific user with the Admin role. In a production environment, you can manually elevate a user's privileges by changing their role from 'user' to 'admin' directly within the MongoDB Atlas interface.
For future iterations, we recommend implementing a "User Management" feature within the Admin Dashboard. This would allow existing administrators to securely promote other users to admin status directly through the application UI.


Once the database is seeded, start the backend application in development mode:

```bash
npm run dev
```
You should see:
```
Connected to MongoDB!
Server is running at http://localhost:5000
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

