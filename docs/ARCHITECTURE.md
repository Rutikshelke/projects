## System Design

Our platform architecture includes scalable microservices, CDN-accelerated frontend delivery, and queue-based background workers to ensure responsiveness and reliability.

### 🧭 Overview

![System Design Overview](../diagrams/system-design-1.png)

### 🏢 Core Components

- **API Gateway (10.5.8.2)**: Routes all requests to the correct microservices.

  - `/auth` → Auth Service
  - `/orders` → Orders Service

- **Auth Service**: Handles login, signup, and token management (JWT via Auth0).

- **Orders Service**: Manages order lifecycle using a dedicated message queue.

- **Payments Service**: Handles payment processing, connected to a worker and queue system.

- **API Layer**: Exposes microservices to clients; horizontally scalable with load balancer and rate limiting using token bucket algorithm.

- **CDN (Content Delivery Network)**: Used globally (US, CA, India) to deliver static assets and reduce latency.

- **Workers**:
  - **Bulk Worker**: Batch processes data.
  - **Email Worker**: Sends emails with rate limiting (`1s = max 10 emails`).
  - **WhatsApp/SMS Workers**: Consume messages from respective queues for outbound messaging.

### 🔁 Background Jobs & Queues

![Workers & Queues](../diagrams/system-design-2.png)

- Email, WhatsApp, and SMS queues.
- Email queue processed by rate-limited worker.
- MongoDB used as the primary data store, with read replicas for horizontal scaling.

### 🌍 Global Access

![Global CDN](../diagrams/system-design-3.png)

- Users from different regions access via nearest CDN edge node.
- Requests routed through Load Balancer to backend servers.

---

### 🛠️ Scalability Strategy

![Load Balancing & Horizontal Scaling](../diagrams/system-design-4.png)

- **Horizontal Scaling**: Services and databases can scale independently using replicas.
- **Vertical Scaling**: Used only in edge cases due to associated downtime.

---
