# FreshBasket X 🛒🥦
### AI-Powered Smart Grocery Commerce Platform (FastAPI + Next.js 14)

FreshBasket is a modern, production-ready, full-stack grocery e-commerce web application featuring a **Next.js 14 (App Router)** frontend, a **Python FastAPI** backend with **SQLAlchemy 2.0**, and **Neon PostgreSQL**.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Features](#-features)
3. [Tech Stack & Dependencies](#-tech-stack--dependencies)
4. [Project Folder Structure](#-project-folder-structure)
5. [Application Routes & Endpoints](#-application-routes--endpoints)
6. [Backend Logic & Services](#-backend-logic--services)
7. [Database & Models (SQLAlchemy + Prisma)](#-database--models)
8. [Environment Variables](#-environment-variables)
9. [Getting Started & Installation](#-getting-started--installation)
10. [Testing](#-testing)
11. [License](#-license)

---

## 🏗️ Architecture Overview

The system follows a clean, decoupled micro-architecture:

```
NEXT.JS FRONTEND (port 3000) ──> FASTAPI BACKEND (port 8000) ──> SQLALCHEMY ──> NEON POSTGRESQL
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                      Redis              Stripe            WhatsApp
```

- **Frontend (port 3000)**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide icons, Recharts.
- **Backend (port 8000)**: Python 3.11+, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Alembic.
- **Database**: Serverless Neon PostgreSQL (shared schema preserving all existing tables & data).
- **Integrations**: Redis cache, Stripe payments, Socket.IO real-time order tracking, Meta WhatsApp Cloud API.

---

## 🚀 Features

- **Storefront & Catalog**:
  - Full product browsing with category filters, instant search, price ranges, and sorting.
  - Interactive product detail pages with real customer reviews, ratings, and stock status.
  - Responsive shopping cart with dynamic subtotal, delivery fee calculation, and coupon discount validation.
  - Prices standardized in Indian Rupees (**₹ INR**).
- **Authentication & Security**:
  - Secure credential authentication & Google OAuth via NextAuth.js.
  - Session-scoped cookie management ensuring users authenticate intentionally without accidental credential reuse.
  - Strict input validation on registration (alphabetic names only; passwords requiring uppercase, numbers, and special characters).
  - Role-based route protection (`USER` and `ADMIN`) enforced via Next.js Middleware.
- **Smart Services & AI**:
  - **Recommendation Service**: Content-based and collaborative filtering based on user interaction history and category affinity.
  - **WhatsApp Cloud API Integration**: Automated customer notifications for order confirmation, shipping, and delivery status updates.
  - **Inventory Service**: Stock adjustment tracking, low-stock threshold monitoring, and best-seller aggregations.
- **Admin Dashboard**:
  - **Live Store Metrics**: Total revenue, total orders, customer count, and catalog volume.
  - **Monthly Revenue & Refund Trends**: Interactive Recharts visualization tracking 6-month revenue and refunded amounts.
  - **Catalog & Order Management**: Real-time product creation, order status workflow transitions, and inventory logs.
  - **Customer Management**: User listing with block/unblock capabilities (admin accounts protected).
- **Real-Time Order Tracking**:
  - Real-time order delivery step tracker powered by **Socket.IO**.

---

## 🛠️ Tech Stack & Dependencies

### Core Framework & Runtime
- **[Next.js 14.2](https://nextjs.org/)**: React framework using App Router, Server Components, and API Route Handlers.
- **[React 18](https://react.dev/)**: Client UI components, hooks, and context providers.
- **[TypeScript 5](https://www.typescriptlang.org/)**: End-to-end type safety across client, backend, and database schema.

### Database & ORM
- **[Prisma ORM 5.22](https://www.prisma.io/)**: Type-safe database client and schema migrations.
- **[Neon PostgreSQL](https://neon.tech/)**: Serverless cloud PostgreSQL database with pooled connections.

### Authentication & Validation
- **[NextAuth.js 4.24](https://next-auth.js.org/)**: JWT session handling, credentials provider, and OAuth integration.
- **[@next-auth/prisma-adapter](https://next-auth.js.org/adapters/prisma)**: Database adapter mapping NextAuth sessions to Prisma models.
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)**: Secure password hashing (12 salt rounds).
- **[Zod 4.3](https://zod.dev/)**: Strict schema declaration and data validation for API requests and user inputs.

### UI & Styling
- **[Tailwind CSS 3.4](https://tailwindcss.com/)**: Utility-first responsive styling and typography.
- **[Lucide React](https://lucide.dev/)**: Clean and consistent icons.
- **[React Hot Toast](https://react-hot-toast.com/)**: Lightweight toast notification system.
- **[Recharts 3.7](https://recharts.org/)**: Composable charting library for dashboard revenue, refund trends, and order distribution.

### Real-Time, Payments & Cache
- **[Socket.IO 4.8](https://socket.io/)**: Bi-directional event communication for live tracking.
- **[Stripe 20.4](https://stripe.com/)**: Payment processing and webhook handling.
- **[ioredis 5.10](https://github.com/redis/ioredis)**: Redis caching and pub/sub message brokering.

---

## 📁 Project Folder Structure

```
freshbasket_shop/
├── .env                              # Environment configuration (secrets, DB URL, keys)
├── docker-compose.yml                # Optional container setup (PostgreSQL, Redis)
├── package.json                      # Project dependencies and script declarations
├── postcss.config.js                 # PostCSS configuration for Tailwind
├── tailwind.config.ts                # Tailwind theme customization & color tokens
├── tsconfig.json                     # TypeScript compiler configuration
├── prisma/
│   ├── dev.db                        # Local development SQLite file (optional backup)
│   ├── schema.prisma                 # Primary Prisma database schema
│   └── seed.ts                       # Database seeder (Categories, Products, Users, Coupons)
└── src/
    ├── middleware.ts                 # Route protection & role-based access control
    ├── app/                          # Next.js App Router root
    │   ├── globals.css               # Global CSS styles and Tailwind directives
    │   ├── layout.tsx                # Root layout with Toast and Providers wrappers
    │   ├── (public)/                 # Public customer-facing storefront
    │   │   ├── page.tsx              # Home landing page with hero, categories & recommendations
    │   │   ├── cart/                 # Shopping cart page with coupon and summary calculations
    │   │   ├── checkout/             # Order checkout & Stripe payment workflow
    │   │   ├── orders/               # Customer order history list
    │   │   │   └── [id]/             # Order detail & live timeline tracking
    │   │   ├── product/              # Product detail route
    │   │   │   └── [id]/             # Dynamic product page with reviews and related items
    │   │   └── shop/                 # Product catalog with category, price & sorting filters
    │   ├── admin/                    # Administrator portal (Role-protected)
    │   │   ├── layout.tsx            # Admin dashboard layout with sidebar navigation
    │   │   ├── page.tsx              # Admin overview dashboard with metrics and Recharts graphs
    │   │   ├── inventory/            # Stock monitoring, logs, and stock replenishment
    │   │   ├── orders/               # Order status workflow management
    │   │   ├── products/             # Product creation, editing, and deletion
    │   │   └── users/                # Customer account management & block/unblock controls
    │   ├── api/                      # Backend REST API route handlers
    │   │   ├── admin/                # Admin-restricted endpoints
    │   │   │   ├── inventory/        # Low stock and bestseller queries
    │   │   │   ├── products/         # Product CRUD endpoints
    │   │   │   ├── stats/            # Dashboard metrics & 6-month revenue/refund analytics
    │   │   │   └── users/            # Customer listing and status modification
    │   │   ├── auth/                 # Authentication endpoints
    │   │   │   ├── [...nextauth]/    # NextAuth.js API handler
    │   │   │   └── register/         # User registration with strict Zod validation
    │   │   ├── coupons/validate/     # Coupon code validation & discount computation
    │   │   ├── orders/               # Order creation & retrieval endpoints
    │   │   ├── products/             # Public catalog search, filter, and detail APIs
    │   │   ├── recommendations/      # AI recommendation API
    │   │   ├── reviews/              # Product review submissions
    │   │   └── webhook/stripe/       # Stripe payment event webhook listener
    │   └── auth/                     # Authentication pages
    │       ├── login/page.tsx        # User and Admin sign-in page
    │       └── register/page.tsx     # New user sign-up page
    ├── components/                   # Reusable React components
    │   ├── Providers.tsx             # SessionProvider, CartProvider & SessionAuthWatcher
    │   ├── layout/                   # Navbar, Footer, AdminSidebar
    │   ├── product/                  # Product reviews, gallery, card views
    │   ├── shop/                     # Filter sidebar, category chips, sort controls
    │   └── ui/                       # Base UI elements (buttons, badges, inputs, modals)
    ├── context/
    │   └── CartContext.tsx           # Global cart state (add, remove, quantity update, storage)
    ├── lib/                          # Shared backend libraries & singletons
    │   ├── auth.ts                   # NextAuth options, JWT callbacks & credentials provider
    │   ├── prisma.ts                 # Prisma Client singleton
    │   ├── redis.ts                  # Redis connection and caching helpers
    │   ├── socket.ts                 # Socket.IO client helper
    │   ├── stripe.ts                 # Stripe SDK instance
    │   └── validations.ts            # Zod validation schemas for forms and API requests
    ├── pages/api/
    │   └── socket.ts                 # Next.js Pages API handler initializing Socket.IO server
    ├── services/                     # Business logic & domain services
    │   ├── InventoryService.ts       # Stock auditing, low stock alerts, revenue & refund stats
    │   ├── RecommendationService.ts  # Smart product recommendation engine
    │   └── WhatsAppService.ts        # Automated WhatsApp order status alerts
    ├── types/
    │   └── index.ts                  # Shared TypeScript types and interfaces
    └── utils/
        └── index.ts                  # Currency formatters (₹ INR), date helpers, status badges
```

---

## 🚦 Application Routes

### Frontend Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Storefront homepage showcasing featured categories, hero banner, and recommendations. |
| `/shop` | Public | Full grocery catalog with instant search, category filtering, and price sorting. |
| `/product/[id]` | Public | Product details page with image gallery, nutrition info, stock status, and reviews. |
| `/cart` | Public / User | Shopping cart displaying items, quantity controls, coupon input, and cost breakdown. |
| `/checkout` | Authenticated | Multi-step checkout with address details and Stripe payment integration. |
| `/orders` | Authenticated | Order history page displaying past and active customer orders. |
| `/orders/[id]` | Authenticated | Live tracking page visualizing delivery progress and timeline events. |
| `/auth/login` | Public | Account login page with credentials and Google OAuth. |
| `/auth/register` | Public | Account registration page with strict validation and immediate auto-login. |
| `/admin` | Admin Only | Administrative performance dashboard with 6-month revenue & refund trends. |
| `/admin/products`| Admin Only | Product catalog management (add, edit, delete products). |
| `/admin/orders` | Admin Only | Order fulfillment console to update statuses (`PLACED` → `DELIVERED` / `REFUNDED`). |
| `/admin/inventory`| Admin Only | Inventory management displaying stock levels, low-stock warnings, and restock logs. |
| `/admin/users` | Admin Only | Customer list displaying registered users and block/unblock actions. |

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Validates name and password requirements, creates new user, returns 201. |
| `GET/POST`| `/api/auth/[...nextauth]`| NextAuth handler for sign-in, session resolution, and sign-out. |
| `GET` | `/api/products` | Retrieves filtered, paginated products matching search, category, or sorting query. |
| `GET` | `/api/products/[slug]` | Retrieves a single product by slug including category and reviews. |
| `POST` | `/api/coupons/validate` | Validates promo codes (`FRESH10`, `SAVE5`, `WELCOME20`) and computes discount. |
| `GET` | `/api/orders` | Retrieves order history for the logged-in customer. |
| `POST` | `/api/orders` | Creates a new order, decrements inventory stock, and logs tracking history. |
| `GET` | `/api/orders/[id]` | Retrieves detailed status, delivery address, items, and timeline for an order. |
| `POST` | `/api/reviews` | Submits a customer product rating (1-5) and review comment. |
| `GET` | `/api/recommendations` | Computes personalized product recommendations based on user interactions. |
| `GET` | `/api/admin/stats` | Computes total revenue, orders, catalog counts, and monthly refund trends. |
| `GET/POST`| `/api/admin/products` | Lists all products or creates a new product in the catalog. |
| `PATCH/DELETE`| `/api/admin/products/[id]`| Updates product details or deletes a product from the database. |
| `GET` | `/api/admin/users` | Fetches registered regular customers (excluding admin accounts). |
| `PATCH` | `/api/admin/users/[id]` | Updates customer status (blocking/unblocking). Prevents modifying admins. |
| `GET` | `/api/admin/inventory/low-stock` | Retrieves products with stock under the low-stock threshold. |
| `GET` | `/api/admin/inventory/best-sellers`| Aggregates top selling products by order volume. |
| `POST` | `/api/webhook/stripe` | Processes Stripe webhook events for successful payments. |

---

## ⚙️ Backend Logic & Services

### 1. Authentication & Session Strategy
- Implemented in [src/lib/auth.ts](file:///d:/freshbasket_shop/src/lib/auth.ts) using **NextAuth.js**.
- Passwords are securely hashed with `bcryptjs` (salt rounds: 12).
- Session cookies are scoped to browser sessions, ensuring that closing the browser or starting a fresh session does not automatically log in previous accounts without credentials.
- The `SessionAuthWatcher` in [src/components/Providers.tsx](file:///d:/freshbasket_shop/src/components/Providers.tsx) validates active session tokens on load.

### 2. Registration Validation Rules
Enforced both on client submit ([src/app/auth/register/page.tsx](file:///d:/freshbasket_shop/src/app/auth/register/page.tsx)) and server API ([src/lib/validations.ts](file:///d:/freshbasket_shop/src/lib/validations.ts)):
- **Full Name**: Allows strictly alphabetic letters (`A–Z, a–z`) and spaces. Rejects numbers and special characters.
- **Password**: Requires a minimum of 8 characters, containing at least:
  - 1 uppercase letter (`[A-Z]`)
  - 1 numeric digit (`[0-9]`)
  - 1 special character (`[^A-Za-z0-9]`)

### 3. Inventory Service (`InventoryService.ts`)
- Manages inventory updates, transaction logs, and low-stock detection.
- **`getMonthlyRevenue(months = 6)`**: Calculates dynamic rolling 6-month trends. Aggregates both completed revenue (`status: { notIn: ['CANCELLED', 'REFUNDED'] }`) and refunded orders (`status: 'REFUNDED'`), supplying data for the admin chart.

### 4. Smart Recommendations (`RecommendationService.ts`)
- Tracks customer interactions (`UserInteraction` table: view, cart add, purchase).
- Employs hybrid recommendation logic combining collaborative user filtering, category weighting, and high-rated popular fallbacks.

### 5. Automated WhatsApp Notifications (`WhatsAppService.ts`)
- Connects to the **WhatsApp Cloud API** to dispatch real-time transactional messages on order placement, dispatch, and final delivery.

---

## 🗄️ Database & Models

Configured in [prisma/schema.prisma](file:///d:/freshbasket_shop/prisma/schema.prisma) targeting **Neon PostgreSQL**:

- **`User`**: Account identity, hashed passwords, roles (`USER`, `ADMIN`), block status.
- **`Account` / `Session` / `VerificationToken`**: NextAuth authentication tables.
- **`Category`**: Grocery categories (Fruits & Vegetables, Bakery, Dairy & Eggs, etc.).
- **`Product`**: Item catalog, pricing, compare price, inventory stock, units, featured flag, images.
- **`Order`**: Orders with financial breakdown (subtotal, delivery fee, discount, total), status, shipping details.
- **`OrderItem`**: Line items linked to orders and catalog products.
- **`Review`**: User ratings (1-5 stars) and review text linked to products.
- **`Coupon`**: Promotional discount codes (fixed amount or percentage) with usage tracking.
- **`InventoryLog`**: Stock adjustment audit trail (reason, stock change, date).
- **`TrackingHistory`**: Timestamped milestone logs for order tracking progress.
- **`UserInteraction`**: Customer event telemetry for recommendation generation.

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
# Database (Neon PostgreSQL connection string)
DATABASE_URL="postgresql://username:password@ep-cool-shadow-az7dkoms-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-32-char-secret"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe Payments (Optional)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis Cache (Optional)
REDIS_URL="redis://localhost:6379"

# Public App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# WhatsApp Cloud API (Optional)
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_API_VERSION="v18.0"
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- **Node.js** (v18.17.0 or higher)
- **npm** (v9.0 or higher)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shivammane2007/freshbasket_shop.git
   cd freshbasket_shop
   ```

2. **Frontend Setup (Next.js):**
   ```bash
   npm install
   ```

3. **Backend Setup (Python FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate   # Windows (or source venv/bin/activate on Linux/Mac)
   pip install -r requirements.txt
   cd ..
   ```

4. **Configure Environment Variables:**
   - Root `.env` for Next.js frontend
   - `backend/.env` for FastAPI backend

5. **Run the Application:**

   **Terminal 1 — FastAPI Backend (port 8000):**
   ```bash
   cd backend
   .\venv\Scripts\activate
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   **Terminal 2 — Next.js Frontend (port 3000):**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🧪 Testing

Run the automated backend test suite:

```bash
cd backend
.\venv\Scripts\activate
pytest -v
```

   # Seed default categories, products, coupons, and demo accounts
   npm run db:seed
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Demo Credentials
- **Admin**: `admin@freshbasket.com` / `admin123`
- **Customer**: `user@freshbasket.com` / `user123`

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server on port 3000 |
| `npm run build` | Compiles and optimizes the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run db:push` | Syncs the Prisma schema directly to PostgreSQL without migration files |
| `npm run db:seed` | Runs `prisma/seed.ts` to populate initial demo data |
| `npm run db:studio`| Launches Prisma Studio visual database browser |

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
