# FreshBasket Shop 🛒🥦

FreshBasket is a modern, full-stack, AI-powered grocery e-commerce web application built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and NextAuth.

---

## 🚀 Features

- **Storefront & Catalog**:
  - Intuitive product browsing, category filtering, search, and sorting.
  - Interactive product details with customer reviews and ratings.
  - Responsive shopping cart with dynamic total calculations and discount coupon support.
  - Smooth checkout experience integrated with Stripe.

- **AI & Smart Services**:
  - **Smart Recommendations**: Personalized product recommendation service based on user behavior and interactions.
  - **WhatsApp Notifications**: Automated order status updates and notifications via WhatsApp Cloud API.
  - **Inventory Tracking**: Automated low-stock alerts and best-seller tracking.

- **Authentication & Security**:
  - Secure session handling using NextAuth.js (Credentials & Google OAuth).
  - Role-based access control (Customers and Administrators).
  - Input validation using Zod.

- **Admin Dashboard**:
  - Analytics and revenue statistics.
  - Comprehensive product, user, and order management.
  - Real-time inventory status and stock adjustment.

- **Real-Time & Performance**:
  - Real-time updates via Socket.IO.
  - Caching and queuing support with Redis.
  - Fast page loading and SSR with Next.js App Router.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/) (SQLite / PostgreSQL)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Real-time**: [Socket.IO](https://socket.io/)
- **Caching**: [Redis](https://redis.io/)
- **Deployment & Containerization**: Docker, Docker Compose

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm or yarn
- Docker & Docker Compose (optional, for Redis and PostgreSQL)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/shivammane2007/freshbasket_shop.git
   cd freshbasket_shop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to the database
   npm run db:push

   # (Optional) Seed initial data
   npm run db:seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Setup

To run using Docker Compose:
```bash
docker-compose up --build
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the development server |
| `npm run build` | Builds the application for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run db:push` | Pushes the Prisma schema to the database |
| `npm run db:seed` | Seeds the database with demo products and users |
| `npm run db:studio`| Opens Prisma Studio to view and edit database records |

---

## 📄 License

This project is licensed under the MIT License.
