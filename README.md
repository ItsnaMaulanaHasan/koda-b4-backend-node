# Daily Greens Backend API (Express.js)

A RESTful API backend service for Daily Greens application built with Express.js and Prisma ORM. This service provides comprehensive endpoints for managing products, users, authentication, and file uploads with integrated Swagger documentation.

## ERD Daily Greens

```mermaid
erDiagram
    users {
        serial id PK
        varchar(255) email UK
        varchar(20) role
        text password
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    profiles {
        serial id PK
        int user_id FK
        varchar(255) full_name
        text profile_photo
        varchar(255) address
        varchar(20) phone_number
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    categories {
        serial id PK
        varchar(100) name UK
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    sizes {
        serial id PK
        varchar(10) name UK
        numeric size_cost
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    variants {
        serial id PK
        varchar(10) name UK
        numeric variant_cost
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    order_methods {
        serial id PK
        varchar(30) name UK
        numeric delivery_fee
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    payment_methods {
        serial id PK
        varchar(30) name UK
        numeric admin_fee
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    status {
        serial id PK
        varchar(30) name UK
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    products {
        serial id PK
        varchar(255) name UK
        text description
        numeric price
        numeric discount_percent
        numeric rating
        bool is_flash_sale
        int stock
        bool is_active
        bool is_favourite
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    product_images {
        serial id PK
        int product_id FK
        text product_image
        bool is_primary
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    products_sizes {
        serial id PK
        int product_id FK
        int size_id FK
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    product_categories {
        serial id PK
        int product_id FK
        int category_id FK
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    product_variants {
        serial id PK
        int product_id FK
        int variant_id FK
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    password_resets {
        serial id PK
        int user_id FK
        char(6) token_reset UK
        timestamp expired_at
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    testimonies {
        serial id PK
        int user_id FK
        varchar(100) position
        numeric rating
        text testimonial
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    carts {
        serial id PK
        int user_id FK
        int product_id FK
        int size_id FK
        int variant_id FK
        int amount
        numeric subtotal
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    transactions {
        serial id PK
        int user_id FK
        varchar(255) no_invoice UK
        timestamp date_transaction
        varchar(255) full_name
        varchar(255) email
        varchar(255) address
        varchar(20) phone
        int payment_method_id FK
        int order_method_id FK
        int status_id FK
        numeric delivery_fee
        numeric admin_fee
        numeric tax
        numeric total_transaction
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    transaction_items {
        serial id PK
        int transaction_id FK
        int product_id FK
        varchar(255) product_name
        numeric product_price
        numeric discount_percent
        numeric discount_price
        varchar(10) size
        numeric size_cost
        varchar(50) variant
        numeric variant_cost
        int amount
        numeric subtotal
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    coupons {
        serial id PK
        varchar(100) title UK
        text description
        numeric discount_percent
        numeric min_purchase
        text coupon_image
        varchar(20) bg_color
        timestamp valid_until
        bool is_active
        timestamp created_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    coupon_usage {
        serial id PK
        int user_id FK
        int coupon_id FK
        int transaction_id FK
        numeric discount_amount
        timestamp used_at
        timestamp updated_at
        int created_by FK
        int updated_by FK
    }

    users ||--o| profiles : has
    users ||--o{ password_resets : requests
    users ||--o{ testimonies : writes
    users ||--o{ carts : creates
    users ||--o{ transactions : places
    users ||--o{ coupon_usage : uses

    users ||--o{ users : manages

    products ||--o{ product_images : has
    products ||--o{ products_sizes : has
    products ||--o{ product_categories : belongs_to
    products ||--o{ product_variants : has
    products ||--o{ carts : added_to
    products ||--o{ transaction_items : ordered_in

    categories ||--o{ product_categories : includes

    sizes ||--o{ products_sizes : used_in
    sizes ||--o{ carts : selected_in

    variants ||--o{ product_variants : used_in
    variants ||--o{ carts : selected_in

    payment_methods ||--o{ transactions : used_in
    order_methods ||--o{ transactions : used_in
    status ||--o{ transactions : assigned_to

    transactions ||--o{ transaction_items : contains
    transactions ||--o{ coupon_usage : applied_to

    coupons ||--o{ coupon_usage : applied_in

    users ||--o{ categories : manages
    users ||--o{ sizes : manages
    users ||--o{ variants : manages
    users ||--o{ order_methods : manages
    users ||--o{ payment_methods : manages
    users ||--o{ status : manages
    users ||--o{ products : manages
    users ||--o{ product_images : manages
    users ||--o{ products_sizes : manages
    users ||--o{ product_categories : manages
    users ||--o{ product_variants : manages
    users ||--o{ profiles : manages
    users ||--o{ coupons : manages
    users ||--o{ transaction_items : manages
```

## Tech Stack

- **Node.js** v20+ - JavaScript runtime
- **Express.js** v5.1.0 - HTTP web framework
- **Prisma** v7.0.1 - Modern ORM for Node.js
- **PostgreSQL** (via pg & Prisma) - Primary database
- **Redis** v5.10.0 - Caching and session management
- **JWT** v9.0.2 - Authentication tokens
- **Argon2** v0.44.0 - Password hashing
- **Multer** v2.0.2 - File upload middleware
- **Swagger** - API documentation (swagger-jsdoc & swagger-ui-express)
- **Nodemailer** v7.0.11 - Email service

## Key Features

- **RESTful API** - Clean and intuitive API design
- **JWT Authentication** - Secure token-based authentication
- **Password Security** - Argon2 password hashing
- **File Upload** - Multi-part form data handling with Multer
- **Redis Caching** - Fast data retrieval and session management
- **Prisma ORM** - Type-safe database queries
- **API Documentation** - Auto-generated Swagger/OpenAPI docs
- **Environment Config** - dotenv configuration management
- **Input Validation** - Express-validator for request validation
- **Email Service** - Nodemailer for sending emails
- **CORS Support** - Cross-origin resource sharing enabled

## Prerequisites

Before running this application, make sure you have:

- **Node.js v20 or higher** installed on your system
- **PostgreSQL** database server
- **Redis** server
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
APP_URL=http://localhost:5173

ORIGIN_URL=http://165.22.110.38:9032
ORIGIN_URL_VERCEL=https://www.dailygreensfresh.store
ORIGIN_URL_VERCEL2=https://dailygreensfresh.store

APP_SECRET=<your_app_secret_key>

BASE_UPLOAD_URL="http://localhost:8080/uploads"
DATABASE_URL=<your_database_url>
REDIS_URL=<your_redis_url>

# environment docker compose
DATABASE_URL_DOCKER=postgres://postgres:123@postgres:5432/db_daily_greens?sslmode=disable
REDIS_URL_DOCKER=redis://redis:6379/0
POSTGRES_PASSWORD_DOCKER=123
POSTGRES_DB_DOCKER=db_daily_greens
POSTGRES_USER_DOCKER=postgres

# smtp configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<your_username_smtp>
SMTP_PASSWORD=<your_smtp_password>
FROM_EMAIL=<your_email>
```

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ItsnaMaulanaHasan/koda-b4-backend-node
cd backend-js-daily-greens
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Database Setup

Create PostgreSQL database:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE daily_greens;"
```

Run Prisma migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or run both with postinstall (automatically runs after npm install)
```

### 4. Run the Application

**Development mode with auto-reload:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will start on `http://localhost:8080` (or your configured PORT).

## API Documentation

Once the application is running, access the Swagger documentation at:

```
http://localhost:8080/api-docs
```

## Key Dependencies

| Package            | Version | Purpose                   |
| ------------------ | ------- | ------------------------- |
| express            | v5.1.0  | Web framework             |
| @prisma/client     | v7.0.1  | Prisma ORM client         |
| pg                 | v8.16.3 | PostgreSQL driver         |
| redis              | v5.10.0 | Redis client              |
| jsonwebtoken       | v9.0.2  | JWT authentication        |
| argon2             | v0.44.0 | Password hashing          |
| multer             | v2.0.2  | File upload handling      |
| express-validator  | v7.3.1  | Input validation          |
| nodemailer         | v7.0.11 | Email service             |
| swagger-jsdoc      | v6.2.8  | Swagger documentation     |
| swagger-ui-express | v5.0.1  | Swagger UI                |
| dotenv             | v17.2.3 | Environment configuration |
| cors               | v2.8.5  | Cross-origin support      |

## Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint:fix

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npx prisma studio
```

## How to Contribute

### 1. Fork the Repository

Click the **Fork** button at the top right of this page.

### 2. Clone Your Fork

```bash
git clone https://github.com/ItsnaMaulanaHasan/koda-b4-backend-node
cd backend-js-daily-greens
```

### 3. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Follow JavaScript/Node.js best practices
- Write clean and readable code
- Add JSDoc comments for functions
- Update API documentation if adding new endpoints
- Run linter before committing: `npm run lint:fix`

### 5. Run Tests and Linter

```bash
npm run lint
npm test
```

### 6. Commit Your Changes

```bash
git add .
git commit -m "Add: description of your changes"
```

**Commit Message Convention:**

- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for improvements
- `Refactor:` for code refactoring
- `Docs:` for documentation changes
- `Test:` for adding tests
- `Style:` for formatting changes

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

1. Go to the original repository
2. Click **New Pull Request**
3. Select your feature branch
4. Describe your changes clearly
5. Submit the PR

## Security Best Practices

- All passwords are hashed using Argon2
- JWT tokens for stateless authentication
- Input validation on all endpoints
- SQL injection prevention via Prisma ORM
- XSS protection with proper sanitization
- CORS configuration for allowed origins
- Rate limiting (recommended to implement)
- Helmet.js for security headers (recommended to implement)

## License

This project is licensed under the ISC License.

## Contact

For questions or support, please contact:

- Email: hasanmaulana453@gmail.com
- GitHub: [ItsnaMaulanaHasan](https://github.com/ItsnaMaulanaHasan)
