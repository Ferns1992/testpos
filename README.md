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
- Admin panel for managers (add/edit/delete products, categories)
- Windows desktop application (.exe)

## Tech Stack

- **Frontend**: React 18 + Vite + Electron
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Containerization**: Docker + Docker Compose

## Two Ways to Run

### Option 1: Windows Desktop App (.exe)

**Requirements:**
- Node.js 18+
- npm

**Steps:**

1. Start the backend server:
```bash
# From project root
cd backend
npm install
npm start
```

2. Build and run the Windows app:
```bash
# From frontend folder
cd frontend
npm install
npm run dist:win
```

3. The installer will be in `frontend/release/` - run the .exe to install

### Option 2: Docker (Web Browser)

**Requirements:**
- Docker
- Docker Compose

**Steps:**
```bash
docker-compose up --build -d
```

Access the application at: **http://localhost:4070**

## Default Login Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Manager |
| cashier | cashier123 | Cashier |

**Note:** Ask your administrator for the login credentials.

## Admin Panel

The admin panel is available for managers only. After logging in as `admin`:
- Click the settings gear icon in the header to access
- **Products** - Add, edit, delete store products
- **Categories** - Add new product categories
- **Transactions** - View transaction history

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
│   ├── database.js    # SQLite setup & seed data
│   ├── Dockerfile      # Backend container
│   └── package.json
├── frontend/
│   ├── electron/       # Electron main process
│   ├── src/
│   │   ├── App.jsx    # Main React component
│   │   └── index.css  # Styles
│   ├── Dockerfile     # Frontend container (nginx)
│   ├── nginx.conf     # Nginx proxy config
│   └── package.json
├── docker-compose.yml  # Docker orchestration
└── SPEC.md           # Detailed specification
```

## License

MIT
