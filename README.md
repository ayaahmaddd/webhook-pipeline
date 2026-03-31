# Webhook Pipeline System 

##  Overview

This project is a **Webhook Processing Pipeline System** built using **Node.js, Express, PostgreSQL, and pg-boss**.

It allows users to:

* Create pipelines
* Receive webhook events
* Process jobs asynchronously
* Deliver results to subscribers with retry logic
* Track delivery attempts and job history

---

##  Features

 CRUD API for pipelines
 Webhook ingestion
 Background job processing using pg-boss
 3 processing action types (e.g., enrich, transform, filter)
 Subscriber system
 Delivery with retry (up to 3 attempts)
 Delivery attempts logging
 Job status tracking

---

##  Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* Drizzle ORM
* pg-boss (job queue)

---

##  Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Create `.env` file:

```env
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/webhook_pipeline
```

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start the server

```bash
npm run dev
```

### 5. Start the worker

```bash
npm run dev:worker
```

---

## 📡 API Endpoints

### Pipelines

* POST `/api/pipelines`
* GET `/api/pipelines`
* GET `/api/pipelines/:id`
* PUT `/api/pipelines/:id`
* DELETE `/api/pipelines/:id`

### Subscribers

* POST `/api/pipelines/:id/subscribers`
* GET `/api/pipelines/:id/subscribers`

### Webhook

* POST `/api/webhooks/:sourcePath`

### Jobs

* GET `/api/jobs`
* GET `/api/jobs/:id`

---

##  Job Processing Flow

1. Webhook is received
2. Job is created in database
3. Job is queued using pg-boss
4. Worker processes the job
5. Results are sent to subscribers
6. Retry logic applied (max 3 attempts)
7. Delivery attempts are stored

---

##  Project Structure

```
src/
  controllers/
  routes/
  services/
  db/
  worker/
  lib/
```

---

##  Author

Aya Ahmad

---

##  Notes

* Make sure PostgreSQL is running before starting the project
* Ensure `.env` is configured correctly
* Worker must be running for job processing

---
