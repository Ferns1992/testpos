# QuickMart POS

A modern 7-Eleven style Point of Sale application with login authentication and persistent data storage.

## Features

- Modern dark UI with green accents
- Product browsing by category
- Shopping cart with quantity controls
- Tax calculation (10%)
- Multiple payment methods (Cash, Card, QR)
- Transaction history
- Daily sales statistics
- User authentication (login/logout)
- Persistent SQLite database

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Containerization**: Docker + Docker Compose

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation & Running

```bash
docker-compose up --build -d
```

Access the application at: **http://localhost:4070**

### Default Login Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Manager |
| cashier | cashier123 | Cashier |

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token
- `GET /api/products` - Get all products
- `GET /api/categories` - Get categories
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/today` - Today's transactions
- `GET /api/stats` - Daily statistics

## Project Structure

```
├── backend/
│   ├── server.js       # Express API
│   ├── database.js     # SQLite setup & seed data
│   ├── Dockerfile      # Backend container
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   └── index.css   # Styles
│   ├── Dockerfile      # Frontend container (nginx)
│   └── nginx.conf      # Nginx proxy config
├── docker-compose.yml  # Docker orchestration
└── SPEC.md            # Detailed specification
```

## License

MIT
