import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [items, setItems] = useState([]);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [report, setReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');
  const [cashierMessage, setCashierMessage] = useState('');

  const [lastReceipt, setLastReceipt] = useState(null);

  // Restore saved user
  useEffect(() => {
    if (token && !user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [token, user]);

  // Fetch items after login
  useEffect(() => {
    if (user && token) {
      fetchItems();
    }
  }, [user, token]);

  // Fetch inventory items
  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load items');
      }

      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load items from server.');
    }
  };


  // Fetch saved transaction history
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load transaction history');
      setTransactions(Array.isArray(data) ? data : []);
      setShowHistoryModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load transaction history.');
    }
  };

  const reprintTransaction = (transaction) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=700');
    if (!receiptWindow) {
      setError('Allow pop-ups in your browser to reprint receipts.');
      return;
    }
    const receipt = {
      receiptNumber: transaction._id || 'POS-RECEIPT',
      cashierName: transaction.cashierName || 'Cashier',
      items: Array.isArray(transaction.items) ? transaction.items : [],
      totalAmount: Number(transaction.totalAmount) || 0,
      timestamp: transaction.timestamp || transaction.createdAt || new Date().toISOString(),
    };
    printReceipt(receipt, receiptWindow);
  };


  // Add a new product to inventory
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const price = Number(newProductPrice);
    const stock = Number(newProductStock);

    if (!newProductName.trim()) {
      setError('Enter a product name.');
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid selling price.');
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a whole number of zero or more.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProductName.trim(),
          price,
          stock,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add product.');
      }

      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      setShowAddProduct(false);

      await fetchItems();

      setNotice('Product added successfully!');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };


  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setToken(data.token);

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setUsername('');
        setPassword('');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err) {
      setError('Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = (item) => {
    const existing = cart.find((i) => i.name === item.name);
    const availableStock = Number(item.stock);

    if (availableStock <= 0) {
      setError(`${item.name} is out of stock.`);
      return;
    }
    if (existing && existing.quantity >= availableStock) {
      setError(`Only ${availableStock} unit(s) of ${item.name} are in stock.`);
      return;
    }
    setError('');

    if (existing) {
      setCart(
        cart.map((i) =>
          i.name === item.name
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...item,
          quantity: 1,
          price: item.price,
        },
      ]);
    }
  };

  // Update cart quantity
  const updateQuantity = (name, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.name === name) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };


  // Business receipt settings
  const getBusinessProfile = () => {
    try {
      return JSON.parse(
        localStorage.getItem('posBusinessProfile') || '{}'
      );
    } catch {
      return {};
    }
  };

  // Escape text before inserting it into the receipt HTML
  const escapeReceiptText = (value) => {
    return String(value ?? '').replace(/[&<>"']/g, (char) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entities[char];
    });
  };

  // Format prices in Nigerian naira
  const formatReceiptMoney = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount) || 0);
  };

  // Print receipt
  const printReceipt = (receipt, receiptWindow) => {
    if (!receipt || !receiptWindow || receiptWindow.closed) {
      alert('Receipt is ready, but the print window is unavailable.');
      return;
    }

    const business = getBusinessProfile();

    const businessName = business.businessName || 'YOUR BUSINESS NAME';
    const businessAddress = business.address || '';
    const businessPhone = business.phone || '';

    const itemsHtml = receipt.items
      .map((item) => {
        const name = escapeReceiptText(item.name);
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        const lineTotal = price * quantity;

        return `
          <tr>
            <td class="item-name">${name}</td>
            <td class="number">${quantity}</td>
            <td class="number">${escapeReceiptText(
          formatReceiptMoney(price)
        )}</td>
            <td class="number">${escapeReceiptText(
          formatReceiptMoney(lineTotal)
        )}</td>
          </tr>
        `;
      })
      .join('');

    receiptWindow.document.open();

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Sales Receipt</title>

          <style>
            @page {
              size: 80mm auto;
              margin: 3mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              width: 74mm;
              margin: 0 auto;
              padding: 2mm 0;
              color: #000;
              background: #fff;
              font-family: Arial, sans-serif;
              font-size: 11px;
              line-height: 1.4;
            }

            .center {
              text-align: center;
            }

            .business-name {
              margin: 0 0 5px;
              font-size: 18px;
              font-weight: bold;
              overflow-wrap: anywhere;
            }

            .muted {
              font-size: 10px;
              overflow-wrap: anywhere;
            }

            .receipt-title {
              margin: 10px 0;
              font-size: 13px;
              font-weight: bold;
              letter-spacing: 1px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 9px 0;
            }

            .details p {
              margin: 3px 0;
              overflow-wrap: anywhere;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              font-size: 9px;
            }

            th {
              padding: 5px 1px;
              border-bottom: 1px solid #000;
              text-align: left;
            }

            td {
              padding: 6px 1px;
              vertical-align: top;
              overflow-wrap: anywhere;
            }

            th:first-child,
            td:first-child {
              width: 34%;
            }

            th:nth-child(2),
            td:nth-child(2) {
              width: 10%;
            }

            th:nth-child(3),
            td:nth-child(3) {
              width: 26%;
            }

            th:nth-child(4),
            td:nth-child(4) {
              width: 30%;
            }

            .number {
              text-align: right;
              word-break: break-word;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              font-size: 14px;
              font-weight: bold;
            }

            .footer {
              margin-top: 15px;
              text-align: center;
            }

            @media print {
              body {
                width: 74mm;
              }
            }
          </style>
        </head>

        <body>
          <header class="center">
            <h1 class="business-name">${escapeReceiptText(
      businessName
    )}</h1>

            ${businessAddress
        ? `<div class="muted">${escapeReceiptText(
          businessAddress
        )}</div>`
        : ''
      }

            ${businessPhone
        ? `<div class="muted">Tel: ${escapeReceiptText(
          businessPhone
        )}</div>`
        : ''
      }

            <div class="receipt-title">SALES RECEIPT</div>
          </header>

          <div class="divider"></div>

          <section class="details">
            <p>
              <strong>Receipt No:</strong>
              ${escapeReceiptText(receipt.receiptNumber)}
            </p>

            <p>
              <strong>Date:</strong>
              ${escapeReceiptText(
        new Date(receipt.timestamp).toLocaleString('en-NG')
      )}
            </p>

            <p>
              <strong>Cashier:</strong>
              ${escapeReceiptText(receipt.cashierName)}
            </p>
          </section>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="number">Qty</th>
                <th class="number">Price</th>
                <th class="number">Total</th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="total-row">
            <span>GRAND TOTAL</span>
            <span>${escapeReceiptText(
        formatReceiptMoney(receipt.totalAmount)
      )}</span>
          </div>

          <div class="divider"></div>

          <footer class="footer">
            <p><strong>Thank you for your patronage!</strong></p>
            <p>Please come again.</p>
          </footer>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
              }, 300);
            };
          <\/script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };



  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      return alert('Cart is empty');
    }

    // Open the window during the click so the browser is less
    // likely to block printing after the server responds.
    const receiptWindow = window.open(
      '',
      '_blank',
      'width=400,height=700'
    );

    setLoading(true);

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const receiptItems = cart.map((item) => ({
      itemId: item._id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cashierName: user.username,
          items: receiptItems,
          totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Transaction failed');
      }

      if (data.success) {
        const transaction =
          data.transaction || data.data || {};

        const receipt = {
          receiptNumber:
            transaction._id ||
            data.transactionId ||
            data._id ||
            `POS-${Date.now()}`,
          cashierName: user.username,
          items: receiptItems,
          totalAmount,
          timestamp: transaction.timestamp || new Date().toISOString(),
        };

        setLastReceipt(receipt);

        alert('Transaction completed successfully!');

        setCart([]);

        if (receiptWindow) {
          printReceipt(receipt, receiptWindow);
        } else {
          alert(
            'Sale saved successfully. Allow pop-ups in your browser to print the receipt.'
          );
        }
      } else {
        if (receiptWindow) receiptWindow.close();
        throw new Error('Transaction could not be completed');
      }
    } catch (err) {
      if (receiptWindow && !receiptWindow.closed) {
        receiptWindow.close();
      }

      alert(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  // Daily report
  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/daily`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to load daily report');
      }

      setReport(data);
      setShowReportModal(true);
    } catch (err) {
      alert(err.message || 'Failed to load daily report');
    }
  };

  // Create Cashier — Admin only
  const createCashier = async (e) => {
    e.preventDefault();
    setCashierMessage('');

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: cashierUsername,
          password: cashierPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create cashier');
      }

      setCashierMessage('Cashier account created successfully!');
      setCashierUsername('');
      setCashierPassword('');
    } catch (err) {
      setCashierMessage(err.message || 'Failed to create cashier');
    }
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setCart([]);
    setReport(null);
    setItems([]);
    setTransactions([]);
    setShowHistoryModal(false);
    setShowAddProduct(false);
    setError('');
    setNotice('');
    setShowAdminModal(false);
    setShowReportModal(false);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredItems = items.filter((item) =>
    String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // LOGIN VIEW
  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.brandHeader}>
            <div style={styles.brandLogo}>POS</div>
            <h2 style={styles.loginTitle}>Terminal Login</h2>
            <p style={styles.loginSub}>Enter credentials to access terminal</p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="e.g. cashier1"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.primaryBtn} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN POS DASHBOARD
  return (
    <div style={styles.dashboard}>
      <header style={styles.navbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoBadge}>POS</div>
          <div>
            <h1 style={styles.navTitle}>Point of Sale</h1>
            <div style={styles.navSub}>
              User: <strong>{user.username}</strong> | Role:{' '}
              <span style={styles.roleTag}>{user.role}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {user.role === 'Admin' && (
            <>
              <button onClick={fetchReport} style={styles.secondaryBtn}>
                📊 Daily Report
              </button>
              <button onClick={fetchTransactions} style={styles.secondaryBtn}>
                🧾 Transaction History
              </button>
              <button
                onClick={() => setShowAdminModal(true)}
                style={styles.adminBtn}
              >
                ⚙️ Admin Controls
              </button>
            </>
          )}

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {(error || notice) && (
        <div style={{ padding: '0 28px', maxWidth: '1400px', margin: '12px auto 0' }}>
          {error && <div style={styles.errorAlert}>{error}<button type="button" onClick={() => setError('')} style={{ float: 'right', border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>}
          {notice && <div style={styles.infoAlert}>{notice}<button type="button" onClick={() => setNotice('')} style={{ float: 'right', border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>}
        </div>
      )}

      <div style={styles.mainLayout}>
        {/* Inventory / Items Catalog */}
        <div style={styles.productsSection}>
          <div style={styles.catalogHeader}>
            <h3 style={styles.sectionTitle}>Available Items</h3>

            {user.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setShowAddProduct(!showAddProduct)}
                style={styles.adminBtn}
              >
                + Add Product
              </button>
            )}

            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {showAddProduct && user.role === 'Admin' && (
            <form
              onSubmit={handleAddProduct}
              style={{
                padding: '16px',
                marginBottom: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                display: 'grid',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0 }}>Add New Product</h3>

              <input
                type="text"
                placeholder="Product name"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                style={styles.searchInput}
                required
              />

              <input
                type="number"
                placeholder="Selling price (₦)"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                min="0"
                step="0.01"
                style={styles.searchInput}
                required
              />

              <input
                type="number"
                placeholder="Stock quantity"
                value={newProductStock}
                onChange={(e) => setNewProductStock(e.target.value)}
                min="0"
                step="1"
                style={styles.searchInput}
                required
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  style={styles.primaryBtn}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>

                <button
                  type="button"
                  style={styles.secondaryBtn}
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div style={styles.grid}>
            {filteredItems.map((item) => (
              <div
                key={item._id || item.name}
                onClick={() => addToCart(item)}
                style={styles.productCard}
              >
                <div style={styles.productName}>{item.name}</div>
                <div style={styles.productPrice}>
                  ₦{item.price ? item.price.toLocaleString() : '0'}
                </div>
                <div style={styles.tapToAdd}>{Number(item.stock) || 0} in stock · + Add to cart</div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div style={styles.emptyState}>No items found</div>
            )}
          </div>
        </div>

        {/* Current Checkout Cart */}
        <div style={styles.cartSection}>
          <div style={styles.cartHeader}>
            <h3 style={styles.sectionTitle}>Current Order</h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} style={styles.clearBtn}>
                Clear Cart
              </button>
            )}
          </div>

          <div style={styles.cartItemsContainer}>
            {cart.length === 0 ? (
              <div style={styles.emptyCartBox}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                  Cart is empty. Select items to construct an order.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.name} style={styles.cartRow}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      ₦{item.price.toLocaleString()} × {item.quantity}
                    </div>
                  </div>

                  <div style={styles.qtyControlGroup}>
                    <button
                      onClick={() => updateQuantity(item.name, -1)}
                      style={styles.qtyBtn}
                    >
                      -
                    </button>
                    <span style={styles.qtyValue}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.name, 1)}
                      style={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.cartFooter}>
            <div style={styles.totalRow}>
              <span style={{ color: '#475569', fontWeight: '500' }}>
                Total Amount
              </span>
              <span style={styles.totalAmount}>
                ₦{total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              style={{
                ...styles.primaryBtn,
                opacity: cart.length === 0 || loading ? 0.6 : 1,
                cursor: cart.length === 0 || loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Processing Transaction...' : 'Complete Transaction'}
            </button>
          </div>
        </div>
      </div>

      {/* ADMIN CONTROL MODAL */}
      {showAdminModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Admin Controls</h3>
              <button
                onClick={() => setShowAdminModal(false)}
                style={styles.closeModalBtn}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>
                Create Cashier Account
              </h4>

              <form onSubmit={createCashier}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Username</label>
                  <input
                    type="text"
                    placeholder="New cashier username"
                    value={cashierUsername}
                    onChange={(e) => setCashierUsername(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    placeholder="New cashier password"
                    value={cashierPassword}
                    onChange={(e) => setCashierPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>

                <button type="submit" style={styles.primaryBtn}>
                  Create Cashier
                </button>
              </form>

              {cashierMessage && (
                <div style={styles.infoAlert}>{cashierMessage}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY MODAL */}
      {showHistoryModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '900px', width: '95%' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Transaction History</h3>
              <button onClick={() => setShowHistoryModal(false)} style={styles.closeModalBtn}>✕</button>
            </div>
            <input
              type="search"
              placeholder="Search receipt number or cashier..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              style={{ ...styles.input, margin: '14px 0' }}
            />
            <div style={{ overflowX: 'auto', maxHeight: '55vh', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ textAlign: 'left', background: '#f8fafc' }}>
                  <th style={styles.tableCell}>Receipt</th><th style={styles.tableCell}>Date</th><th style={styles.tableCell}>Cashier</th><th style={styles.tableCell}>Items</th><th style={styles.tableCell}>Total</th><th style={styles.tableCell}>Action</th>
                </tr></thead>
                <tbody>
                  {transactions.filter((tx) => `${tx._id || ''} ${tx.cashierName || ''}`.toLowerCase().includes(historySearch.toLowerCase())).map((tx) => (
                    <tr key={tx._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={styles.tableCell}>{String(tx._id || '').slice(-8).toUpperCase()}</td>
                      <td style={styles.tableCell}>{new Date(tx.timestamp || tx.createdAt).toLocaleString('en-NG')}</td>
                      <td style={styles.tableCell}>{tx.cashierName || '—'}</td>
                      <td style={styles.tableCell}>{Array.isArray(tx.items) ? tx.items.reduce((n, item) => n + (Number(item.quantity) || 0), 0) : 0}</td>
                      <td style={styles.tableCell}>₦{(Number(tx.totalAmount) || 0).toLocaleString('en-NG')}</td>
                      <td style={styles.tableCell}><button type="button" onClick={() => reprintTransaction(tx)} style={styles.secondaryBtn}>Reprint</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length === 0 && <div style={styles.emptyState}>No transactions recorded yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* DAILY REPORT MODAL */}
      {showReportModal && report && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Today's Sales Report</h3>
              <button
                onClick={() => setShowReportModal(false)}
                style={styles.closeModalBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.reportSummaryGrid}>
              <div style={styles.reportMetricCard}>
                <div style={styles.metricLabel}>Total Revenue</div>
                <div style={styles.metricVal}>
                  ₦{report.totalRevenue ? report.totalRevenue.toLocaleString() : 0}
                </div>
              </div>

              <div style={styles.reportMetricCard}>
                <div style={styles.metricLabel}>Total Transactions</div>
                <div style={styles.metricVal}>
                  {report.totalTransactions || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES OBJECT
const styles = {
  loginContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  loginBox: {
    background: '#ffffff',
    padding: '36px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
    width: '100%',
    maxWidth: '380px',
    border: '1px solid #e2e8f0',
  },

  brandHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },

  brandLogo: {
    display: 'inline-block',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: '800',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '18px',
    marginBottom: '12px',
  },

  loginTitle: {
    margin: '0 0 4px 0',
    color: '#0f172a',
    fontSize: '20px',
    fontWeight: '700',
  },

  loginSub: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px',
  },

  fieldGroup: {
    marginBottom: '16px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px',
  },

  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },

  searchInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    width: '220px',
  },

  primaryBtn: {
    width: '100%',
    padding: '12px',
    background: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
  },

  secondaryBtn: {
    padding: '8px 14px',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },

  adminBtn: {
    padding: '8px 14px',
    background: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },

  logoutBtn: {
    padding: '8px 14px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },

  errorAlert: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  infoAlert: {
    background: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    marginTop: '12px',
  },

  dashboard: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  navbar: {
    background: '#ffffff',
    padding: '12px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },

  logoBadge: {
    background: '#2563eb',
    color: '#fff',
    fontWeight: '800',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },

  navTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },

  navSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },

  roleTag: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '2px 6px',
    borderRadius: '4px',
    fontWeight: '600',
  },

  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px',
    padding: '24px 28px',
    maxWidth: '1400px',
    margin: '0 auto',
  },

  productsSection: {
    flex: '1',
  },

  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  cartSection: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
    height: 'fit-content',
    minHeight: '500px',
  },

  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  sectionTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '14px',
  },

  productCard: {
    background: '#ffffff',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'transform 0.1s, border-color 0.1s',
    userSelect: 'none',
  },

  productName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1e293b',
    marginBottom: '6px',
  },

  productPrice: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '15px',
  },

  tapToAdd: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '8px',
  },

  cartItemsContainer: {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '380px',
  },

  emptyCartBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },

  cartRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },

  qtyControlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#f8fafc',
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
  },

  qtyBtn: {
    width: '24px',
    height: '24px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyValue: {
    fontWeight: '600',
    fontSize: '13px',
    minWidth: '16px',
    textAlign: 'center',
  },

  cartFooter: {
    marginTop: '20px',
    borderTop: '2px dashed #e2e8f0',
    paddingTop: '16px',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },

  totalAmount: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  modalCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },

  closeModalBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#64748b',
  },

  tableCell: { padding: '10px 8px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'top' },

  reportSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px',
  },

  reportMetricCard: {
    background: '#f8fafc',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },

  metricLabel: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '4px',
  },

  metricVal: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
  },

  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8',
  },
};

