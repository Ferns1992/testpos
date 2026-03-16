# 7-Eleven Style POS Application Specification

## 1. Project Overview
- **Project Name**: QuickMart POS
- **Type**: Full-stack Point of Sale Web Application
- **Core Functionality**: Modern convenience store POS system with product management, cart operations, transaction processing, and persistent data storage
- **Target Users**: Convenience store clerks and managers

## 2. UI/UX Specification

### Layout Structure
- **Header**: Logo, store name, current time, date
- **Main Area**: Split into two columns
  - Left (65%): Product grid with categories
  - Right (35%): Cart and transaction panel
- **Responsive**: Optimized for tablet/desktop (1024px+)

### Visual Design

#### Color Palette
- **Primary**: `#00D26A` (7-Eleven green)
- **Secondary**: `#1A1A2E` (Dark navy)
- **Accent**: `#FF6B35` (Orange-red for CTAs)
- **Background**: `#0F0F1A` (Dark background)
- **Surface**: `#1E1E32` (Card backgrounds)
- **Surface Light**: `#2A2A45` (Hover states)
- **Text Primary**: `#FFFFFF`
- **Text Secondary**: `#A0A0B8`
- **Success**: `#00D26A`
- **Warning**: `#FFB800`
- **Error**: `#FF4757`

#### Typography
- **Font Family**: 'Outfit' (headings), 'DM Sans' (body)
- **Heading Sizes**: 
  - H1: 32px, weight 700
  - H2: 24px, weight 600
  - H3: 18px, weight 600
- **Body**: 14px, weight 400
- **Price Text**: 20px, weight 700, monospace

#### Spacing System
- Base unit: 8px
- Card padding: 16px
- Grid gap: 12px
- Section margin: 24px

#### Visual Effects
- **Card Shadows**: `0 8px 32px rgba(0, 210, 106, 0.15)`
- **Glow Effect**: `0 0 20px rgba(0, 210, 106, 0.3)` on hover
- **Gradients**: Subtle green gradient overlays on buttons
- **Animations**: 
  - Scale transform on product hover (1.02)
  - Smooth transitions (0.2s ease)
  - Pulse animation on add-to-cart

### Components

#### Product Card
- 160x180px card with rounded corners (16px)
- Product image (80px height)
- Product name (truncated to 2 lines)
- Price display with currency symbol
- Stock indicator
- Hover: glow effect, slight scale

#### Category Tabs
- Horizontal scrollable tabs
- Active state: green background, white text
- Inactive: transparent with border

#### Cart Item
- Horizontal layout with image, name, quantity controls, price
- Quantity: +/- buttons with number display
- Delete button on hover

#### Transaction Panel
- Subtotal, tax, total display
- Payment method selector (Cash, Card, QR)
- Complete transaction button (prominent green)
- Clear cart button

#### Header
- Store logo with glow effect
- Digital clock display
- Today's date
- Quick stats (transactions today, revenue)

## 3. Functionality Specification

### Backend API Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/today` - Get today's transactions
- `GET /api/stats` - Get daily statistics

### Data Models

#### Product
```json
{
  "id": "uuid",
  "name": "string",
  "price": "decimal",
  "category": "string",
  "image": "string (url)",
  "stock": "integer",
  "barcode": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Transaction
```json
{
  "id": "uuid",
  "items": "array",
  "subtotal": "decimal",
  "tax": "decimal",
  "total": "decimal",
  "paymentMethod": "string",
  "createdAt": "datetime"
}
```

### Core Features
1. Product browsing by category
2. Search products by name/barcode
3. Add to cart with quantity adjustment
4. Remove items from cart
5. Calculate totals with tax (10%)
6. Complete transaction
7. View transaction history
8. Daily sales statistics
9. Product management (CRUD)
10. Category management

### Data Persistence
- SQLite database with better-sqlite3
- Database file stored in persistent volume
- Automatic table creation on startup

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme with green accents renders correctly
- [ ] Product cards display with proper shadows and hover effects
- [ ] Cart updates smoothly with animations
- [ ] Header shows real-time clock
- [ ] Responsive layout works on 1024px+ screens

### Functional Checkpoints
- [ ] Products load from backend on page load
- [ ] Adding product to cart works
- [ ] Quantity adjustment works
- [ ] Cart total calculates correctly with tax
- [ ] Transaction completion clears cart and saves to DB
- [ ] Transaction history is viewable
- [ ] Data persists after container restart

### Deployment Checkpoints
- [ ] Docker build succeeds
- [ ] Docker compose up works
- [ ] Frontend accessible on port 3000
- [ ] Backend accessible on port 3001
- [ ] Database persists between restarts

## 5. Tech Stack
- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Styling**: CSS3 with CSS Variables
- **Containerization**: Docker + Docker Compose
