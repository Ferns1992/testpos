import { useState, useEffect, useCallback } from 'react'

const API_URL = '/api'

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastTransaction, setLastTransaction] = useState(null)
  const [stats, setStats] = useState({ transactionCount: 0, totalRevenue: 0 })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [loginData, setLoginData] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminTab, setAdminTab] = useState('products')
  const [transactions, setTransactions] = useState([])
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', stock: '' })
  const [editingProduct, setEditingProduct] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' })

  useEffect(() => {
    const savedToken = localStorage.getItem('pos_token')
    const savedUser = localStorage.getItem('pos_user')
    if (savedToken && savedUser) {
      verifyToken(savedToken, JSON.parse(savedUser))
    } else {
      setLoading(false)
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const verifyToken = async (token, userData) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const user = await res.json()
        setUser({ ...userData, token })
        fetchData(token)
      } else {
        localStorage.removeItem('pos_token')
        localStorage.removeItem('pos_user')
        setLoading(false)
      }
    } catch {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      setLoading(false)
    }
  }

  const fetchData = async (token = user?.token) => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
      const [productsRes, categoriesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/stats`, { headers })
      ])
      const [productsData, categoriesData, statsData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        statsRes.json()
      ])
      setProducts(productsData)
      setCategories([{ name: 'All', icon: '🏪' }, ...categoriesData])
      setStats(statsData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setLoading(false)
    }
  }

  const fetchFilteredProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      if (searchQuery) params.append('search', searchQuery)
      const res = await fetch(`${API_URL}/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    if (user) fetchFilteredProducts()
  }, [fetchFilteredProducts, user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError('')
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data)
        localStorage.setItem('pos_token', data.token)
        localStorage.setItem('pos_user', JSON.stringify(data))
        fetchData(data.token)
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch (error) {
      setLoginError('Connection error')
    }
    setIsLoggingIn(false)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: user.token })
      })
    } catch {}
    setUser(null)
    setShowAdmin(false)
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    setCart([])
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_URL}/transactions?limit=100`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      const data = await res.json()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newProduct)
      })
      setNewProduct({ name: '', price: '', category: '', image: '', stock: '' })
      fetchData(user.token)
    } catch (error) {
      console.error('Failed to add product:', error)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API_URL}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(editingProduct)
      })
      setEditingProduct(null)
      fetchData(user.token)
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      fetchData(user.token)
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    try {
      await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newCategory)
      })
      setNewCategory({ name: '', icon: '' })
      fetchData(user.token)
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  }

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      }).filter(item => item.quantity > 0)
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const completeTransaction = async () => {
    if (cart.length === 0) return
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal,
          tax,
          total,
          paymentMethod
        })
      })
      const transaction = await res.json()
      setLastTransaction(transaction)
      setShowSuccess(true)
      setCart([])
      fetchData()
    } catch (error) {
      console.error('Failed to complete transaction:', error)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-bg"></div>
        <div className="login-box">
          <div className="login-logo">
            <div className="logo">🏪</div>
          </div>
          <h1>QuickMart POS</h1>
          <p className="login-subtitle">Sign in to start your shift</p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="btn-login" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-section">
          <div className="logo">🏪</div>
          <div className="store-info">
            <h1>QuickMart POS</h1>
            <span>Convenience Store</span>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <div className="label">Transactions</div>
            <div className="value">{stats.transactionCount}</div>
          </div>
          <div className="stat-item">
            <div className="label">Revenue</div>
            <div className="value">{formatCurrency(stats.totalRevenue)}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="header-time">
            <div className="clock">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)}</div>
          </div>
          <div className="user-info">
            <div className="user-avatar">{user.name.charAt(0)}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
            {user.role === 'manager' && (
              <button className="btn-admin" onClick={() => { setShowAdmin(!showAdmin); if (!showAdmin) fetchTransactions(); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="products-section">
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              placeholder="Search products or scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat.name}
                className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card" onClick={() => addToCart(product)}>
                <div className="product-stock">{product.stock} in stock</div>
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-name">{product.name}</div>
                <div className="product-price">{formatCurrency(product.price)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="cart-section">
          <div className="cart-header">
            <h2>
              <span>🛒</span> Current Order
              <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </h2>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="cart-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>Cart is empty</p>
                <p style={{ fontSize: '12px' }}>Click products to add</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">{formatCurrency(item.price)}</div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row subtotal">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row tax">
              <span>Tax (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="payment-methods">
              <button
                className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Cash
              </button>
              <button
                className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                Card
              </button>
              <button
                className={`payment-btn ${paymentMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('qr')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="3" height="3" />
                  <rect x="18" y="14" width="3" height="3" />
                  <rect x="14" y="18" width="3" height="3" />
                  <rect x="18" y="18" width="3" height="3" />
                </svg>
                QR Pay
              </button>
            </div>

            <div className="cart-actions">
              <button className="btn-clear" onClick={clearCart} disabled={cart.length === 0}>
                Clear
              </button>
              <button
                className="btn-complete"
                onClick={completeTransaction}
                disabled={cart.length === 0}
              >
                Complete Sale
              </button>
            </div>
          </div>
        </section>
      </main>

      {showSuccess && (
        <div className="modal-overlay" onClick={() => setShowSuccess(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3>Payment Successful!</h3>
            <p>Transaction completed via {paymentMethod}</p>
            <div className="amount">{formatCurrency(lastTransaction?.total || 0)}</div>
            <button onClick={() => setShowSuccess(false)}>New Transaction</button>
          </div>
        </div>
      )}

      {showAdmin && (
        <div className="modal-overlay" onClick={() => setShowAdmin(false)}>
          <div className="admin-panel" onClick={e => e.stopPropagation()}>
            <div className="admin-header">
              <h2>Admin Panel</h2>
              <button className="admin-close" onClick={() => setShowAdmin(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="admin-tabs">
              <button className={adminTab === 'products' ? 'active' : ''} onClick={() => setAdminTab('products')}>Products</button>
              <button className={adminTab === 'categories' ? 'active' : ''} onClick={() => setAdminTab('categories')}>Categories</button>
              <button className={adminTab === 'transactions' ? 'active' : ''} onClick={() => setAdminTab('transactions')}>Transactions</button>
            </div>
            <div className="admin-content">
              {adminTab === 'products' && (
                <div className="admin-section">
                  <form className="admin-form" onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}>
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <input type="text" placeholder="Product Name" value={editingProduct ? editingProduct.name : newProduct.name} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, name: e.target.value}) : setNewProduct({...newProduct, name: e.target.value})} required />
                    <input type="number" step="0.01" placeholder="Price" value={editingProduct ? editingProduct.price : newProduct.price} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, price: e.target.value}) : setNewProduct({...newProduct, price: e.target.value})} required />
                    <select value={editingProduct ? editingProduct.category : newProduct.category} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, category: e.target.value}) : setNewProduct({...newProduct, category: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.filter(c => c.name !== 'All').map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input type="number" placeholder="Stock" value={editingProduct ? editingProduct.stock : newProduct.stock} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, stock: e.target.value}) : setNewProduct({...newProduct, stock: e.target.value})} required />
                    <input type="text" placeholder="Image URL" value={editingProduct ? editingProduct.image : newProduct.image} onChange={(e) => editingProduct ? setEditingProduct({...editingProduct, image: e.target.value}) : setNewProduct({...newProduct, image: e.target.value})} />
                    <div className="form-actions">
                      <button type="submit">{editingProduct ? 'Update' : 'Add'} Product</button>
                      {editingProduct && <button type="button" className="btn-cancel" onClick={() => setEditingProduct(null)}>Cancel</button>}
                    </div>
                  </form>
                  <div className="admin-list">
                    <h3>Product List</h3>
                    <div className="list-items">
                      {products.map(p => (
                        <div key={p.id} className="list-item">
                          <img src={p.image} alt={p.name} className="list-item-img" />
                          <div className="list-item-info">
                            <span className="list-item-name">{p.name}</span>
                            <span className="list-item-meta">{p.category} | Stock: {p.stock}</span>
                          </div>
                          <span className="list-item-price">{formatCurrency(p.price)}</span>
                          <div className="list-item-actions">
                            <button onClick={() => setEditingProduct(p)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDeleteProduct(p.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {adminTab === 'categories' && (
                <div className="admin-section">
                  <form className="admin-form" onSubmit={handleAddCategory}>
                    <h3>Add New Category</h3>
                    <input type="text" placeholder="Category Name" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} required />
                    <input type="text" placeholder="Icon (emoji)" value={newCategory.icon} onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})} />
                    <button type="submit">Add Category</button>
                  </form>
                  <div className="admin-list">
                    <h3>Categories</h3>
                    <div className="list-items">
                      {categories.filter(c => c.name !== 'All').map(c => (
                        <div key={c.id} className="list-item">
                          <span className="category-icon">{c.icon}</span>
                          <span className="list-item-name">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {adminTab === 'transactions' && (
                <div className="admin-section">
                  <h3>Transaction History</h3>
                  <div className="list-items">
                    {transactions.map(t => (
                      <div key={t.id} className="list-item">
                        <div className="list-item-info">
                          <span className="list-item-name">#{t.id.slice(0, 8)}</span>
                          <span className="list-item-meta">{new Date(t.createdAt).toLocaleString()} | {t.paymentMethod}</span>
                        </div>
                        <span className="list-item-price">{formatCurrency(t.total)}</span>
                        <span className="item-count">{t.items?.length} items</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
