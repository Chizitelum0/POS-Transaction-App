import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

            return newQty > 0
              ? { ...item, quantity: newQty }
              : null;
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
        throw new Error(
          data.message || 'Transaction failed'
        );
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
        throw new Error(
          data.message || 'Failed to load daily report'
        );
      }

      setReport(data);
    } catch (err) {
      alert(err.message || 'Failed to load daily report');
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
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // LOGIN VIEW
  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h2
            style={{
              margin: '0 0 8px 0',
              color: '#1e293b',
            }}
          >
            POS Terminal
          </h2>

          <p
            style={{
              margin: '0 0 24px 0',
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            Enter cashier credentials to continue
          </p>

          {error && (
            <div style={styles.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Username
              </label>

              <input
                type="text"
                placeholder="cashier"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Password
              </label>

              <input
                type="password"
                placeholder="••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              style={styles.primaryBtn}
              disabled={loading}
            >
              {loading
                ? 'Authenticating...'
                : 'Sign In'}
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
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              color: '#0f172a',
            }}
          >
            Point of Sale
          </h1>

          <span
            style={{
              fontSize: '13px',
              color: '#64748b',
            }}
          >
            Cashier:{' '}
            <strong>{user.username}</strong>
          </span>
        </div>

        <div>
          {user.role === 'Admin' && (
          <button
            onClick={fetchReport}
            style={styles.secondaryBtn}
          >
            Daily Report
          </button>
          )}

          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Products */}
        <div style={styles.productsSection}>
          <h3 style={styles.sectionTitle}>
            Available Items
          </h3>

          {report && (
            <div style={styles.reportCard}>
              <h4>Today's Sales Summary</h4>

              <p>
                Total Revenue:{' '}
                <strong>
                  ₦{report.totalRevenue}
                </strong>
              </p>

              <p>
                Total Transactions:{' '}
                <strong>
                  {report.totalTransactions}
                </strong>
              </p>

              <button
                onClick={() => setReport(null)}
                style={{ fontSize: '12px' }}
              >
                Close
              </button>
            </div>
          )}

          <div style={styles.grid}>
            {items.map((item) => (
              <div
                key={item._id || item.name}
                onClick={() => addToCart(item)}
                style={styles.productCard}
              >
                <div
                  style={{
                    fontWeight: '600',
                    color: '#1e293b',
                  }}
                >
                  {item.name}
                </div>

                <div
                  style={{
                    color: '#2563eb',
                    fontWeight: 'bold',
                    marginTop: '4px',
                  }}
                >
                  ₦{item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div style={styles.cartSection}>
          <h3 style={styles.sectionTitle}>
            Current Order
          </h3>

          <div style={styles.cartItemsContainer}>
            {cart.length === 0 ? (
              <p
                style={{
                  color: '#94a3b8',
                  textAlign: 'center',
                  marginTop: '40px',
                }}
              >
                Cart is empty. Tap items to add.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.name}
                  style={styles.cartRow}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: '600',
                      }}
                    >
                      {item.name}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                      }}
                    >
                      ₦{item.price} each
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.name,
                          -1
                        )
                      }
                      style={styles.qtyBtn}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.name,
                          1
                        )
                      }
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
              <span>Total:</span>

              <span
                style={{
                  fontSize: '20px',
                  color: '#0f172a',
                }}
              >
                ₦{total}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                cart.length === 0 || loading
              }
              style={{
                ...styles.primaryBtn,
                opacity:
                  cart.length === 0 ? 0.5 : 1,
              }}
            >
              {loading
                ? 'Processing...'
                : 'Complete Transaction'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const styles = {
  loginContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    fontFamily: 'system-ui, sans-serif',
  },

  loginBox: {
    background: '#ffffff',
    padding: '32px',
    borderRadius: '12px',
    boxShadow:
      '0 4px 6px -1px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '360px',
  },

  fieldGroup: {
    marginBottom: '16px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    color: '#475569',
    marginBottom: '6px',
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    fontSize: '14px',
  },

  primaryBtn: {
    width: '100%',
    padding: '12px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  secondaryBtn: {
    padding: '8px 14px',
    background: '#e2e8f0',
    border: 'none',
    borderRadius: '6px',
    marginRight: '8px',
    cursor: 'pointer',
  },

  logoutBtn: {
    padding: '8px 14px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },

  errorAlert: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '8px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },

  dashboard: {
    minHeight: '100vh',
    background: '#f1f5f9',
    fontFamily: 'system-ui, sans-serif',
  },

  navbar: {
    background: '#ffffff',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #e2e8f0',
  },

  mainLayout: {
    display: 'flex',
    gap: '20px',
    padding: '24px',
    flexWrap: 'wrap',
  },

  productsSection: {
    flex: '2',
    minWidth: '300px',
  },

  cartSection: {
    flex: '1',
    minWidth: '280px',
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow:
      '0 1px 3px rgba(0,0,0,0.1)',
  },

  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#334155',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '12px',
  },

  productCard: {
    background: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },

  cartItemsContainer: {
    minHeight: '200px',
    flex: 1,
  },

  cartRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom:
      '1px solid #f1f5f9',
  },

  qtyBtn: {
    padding: '2px 8px',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    cursor: 'pointer',
  },

  cartFooter: {
    marginTop: '20px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  },

  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: 'bold',
    marginBottom: '16px',
  },

  reportCard: {
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '16px',
  },
};
