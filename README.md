# Sprinto Policy Management API

A comprehensive policy management system for SOC 2 compliance.

## Project Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (we'll set this up later)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (we'll add these later)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sprinto_db
# DB_USER=postgres
# DB_PASSWORD=password

# JWT Configuration (we'll add these later)
# JWT_SECRET=your-super-secret-jwt-key
# JWT_EXPIRES_IN=24h
```

3. Start the development server:
```bash
npm run dev
```

## Current Endpoints

- `GET /` - Welcome message and API info
- `GET /ping` - Health check ping
- `GET /health` - Detailed health status

## Project Structure

```
sprinto/
├── index.js              # Main server file
├── package.json          # Dependencies and scripts
├── README.md            # Project documentation
└── .env                 # Environment variables (create this)
```

## Next Steps

1. ✅ Basic Express server setup
2. 🔄 Database models and Sequelize setup
3. 🔄 API routes and controllers
4. 🔄 Request validation
5. 🔄 Authentication and authorization
6. 🔄 Business logic implementation 