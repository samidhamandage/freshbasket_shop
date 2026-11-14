# FreshBasket X – Python FastAPI Backend

FastAPI backend service powering FreshBasket X full-stack e-commerce grocery application.

## Architecture

- **Framework**: FastAPI (Python 3.11+)
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Database**: Neon PostgreSQL
- **Migrations**: Alembic
- **Validation**: Pydantic v2 + Pydantic Settings
- **Authentication**: JWT (python-jose) + bcrypt password hashing
- **Real-time WebSockets**: Python-SocketIO (`python-socketio`)
- **Payments**: Stripe Python SDK
- **Notifications**: Async Meta WhatsApp Cloud API client (`httpx`)
- **Cache**: Redis Python client (`redis`) with automatic in-memory TTL fallback

```
NEXT.JS FRONTEND (port 3000) ──> FASTAPI BACKEND (port 8000) ──> SQLALCHEMY ──> NEON POSTGRESQL
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                      Redis              Stripe            WhatsApp
```

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI application entrypoint & middleware configuration
│   ├── core/
│   │   ├── config.py            # Environment settings (Pydantic Settings)
│   │   ├── security.py          # Password hashing (bcrypt)
│   │   ├── jwt.py               # Access & refresh JWT management
│   │   ├── dependencies.py      # Auth & role dependencies (get_current_user, get_current_admin_user)
│   │   └── redis_client.py      # Redis cache manager with in-memory fallback
│   ├── database/
│   │   ├── base.py              # Declarative Base
│   │   ├── connection.py        # SQLAlchemy engine & SessionLocal
│   │   └── session.py           # Database session dependency
│   ├── models/                  # SQLAlchemy 2.0 database models
│   │   ├── user.py
│   │   ├── account.py
│   │   ├── session.py
│   │   ├── verification_token.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── order_item.py
│   │   ├── review.py
│   │   ├── coupon.py
│   │   ├── inventory_log.py
│   │   ├── tracking_history.py
│   │   └── user_interaction.py
│   ├── schemas/                 # Pydantic v2 validation & response schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── category.py
│   │   ├── order.py
│   │   ├── review.py
│   │   ├── coupon.py
│   │   ├── payment.py
│   │   └── analytics.py
│   ├── routes/                  # API route handlers
│   │   ├── auth.py
│   │   ├── products.py
│   │   ├── categories.py
│   │   ├── coupons.py
│   │   ├── orders.py
│   │   ├── reviews.py
│   │   ├── recommendations.py
│   │   ├── payments.py
│   │   ├── webhooks.py
│   │   └── admin/
│   │       ├── stats.py
│   │       ├── products.py
│   │       ├── users.py
│   │       └── inventory.py
│   ├── services/                # Encapsulated business logic
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── inventory_service.py
│   │   ├── recommendation_service.py
│   │   ├── whatsapp_service.py
│   │   ├── payment_service.py
│   │   └── analytics_service.py
│   ├── middleware/              # Global error & authentication middleware
│   │   ├── authentication.py
│   │   └── error_handler.py
│   ├── sockets/                 # Real-time Socket.IO manager
│   │   └── socket_manager.py
│   └── utils/                   # Helpers, validators, and response formatting
│       ├── helpers.py
│       ├── responses.py
│       └── validators.py
├── alembic/                     # Database migrations
├── tests/                       # Pytest test suite
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_products.py
│   ├── test_coupons.py
│   ├── test_orders.py
│   └── test_admin.py
├── requirements.txt
├── alembic.ini
├── .env.example
└── README.md
```

---

## Setup & Running

### 1. Create Virtual Environment & Install Dependencies

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create `.env` inside `backend/` with:

```env
DATABASE_URL=postgresql://<username>:<password>@<neon-host>/neondb?sslmode=require
SECRET_KEY=freshbasket-secret-key-32characterslongmin123456
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ACCESS_TOKEN=...
```

### 3. Run FastAPI Server

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. Run Pytest Suite

```bash
pytest -v
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register user with strict name (alphabetic + spaces only) and password rules (min 8 chars, 1 uppercase, 1 digit, 1 special char). Automatically logs in user upon successful registration.
- `POST /api/auth/login`: Authenticate credentials, issues JWT access and refresh tokens.
- `POST /api/auth/refresh`: Refresh expired access token.
- `POST /api/auth/logout`: Clears authentication cookie.
- `GET /api/auth/me`: Fetch authenticated user profile.
- `GET /api/auth/session`: NextAuth compatibility session endpoint.

### Products & Categories
- `GET /api/products`: Filter products by category, featured flag, search term, pagination.
- `GET /api/products/{slug}`: Product details with category and review list.
- `GET /api/categories`: Category list with dynamic product counts.

### Shopping & Checkout
- `POST /api/coupons/validate`: Validate promo code against cart subtotal.
- `POST /api/orders`: Place orders transactionally, decrement inventory, update coupons.
- `GET /api/orders`: Fetch user orders or all orders (if admin).
- `GET /api/orders/{id}`: Detailed order status & tracking history.
- `PATCH /api/orders/{id}`: Update order status (Admin only). Emits Socket.IO event and sends automated WhatsApp notification on `DELIVERED`.

### Reviews & Recommendations
- `POST /api/reviews`: Submit verified rating (1-5) and review, automatically recalculates product rating.
- `GET /api/recommendations`: AI-based recommendations by category similarity and user history.
- `GET /api/recommendations/trending`: Top trending products over 30 days.

### Admin Dashboard
- `GET /api/admin/stats`: KPI metrics, rolling 6-month revenue and refund trends, orders by status.
- `GET /api/admin/inventory/low-stock`: Products requiring replenishment.
- `GET /api/admin/inventory/best-sellers`: Top ordered products.
- `GET /api/admin/users`: Non-admin customers list with order count & total spend.
- `PATCH /api/admin/users/{id}`: Update customer role or block status (protects admin accounts from modification).

