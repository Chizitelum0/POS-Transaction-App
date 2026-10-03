import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [report, setReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');
  const [cashierMessage, setCashierMessage] = useState('');

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

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      return alert('Cart is empty');
    }

    setLoading(true);

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cashierName: user.username,
          items: cart,
          totalAmount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Transaction failed');
      }

      if (data.success) {
        alert('Transaction completed successfully!');
        setCart([]);
      }
    } catch (err) {
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
    setShowAdminModal(false);
    setShowReportModal(false);
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
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

      <div style={styles.mainLayout}>
        {/* Inventory / Items Catalog */}
        <div style={styles.productsSection}>
          <div style={styles.catalogHeader}>
            <h3 style={styles.sectionTitle}>Available Items</h3>
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

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
                <div style={styles.tapToAdd}>+ Add to cart</div>
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
