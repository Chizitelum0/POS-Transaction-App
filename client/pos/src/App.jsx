
import React, { useState, useEffect } from 'react';

const API_BASE = '/api';

const money = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

  :root {
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #172033;
    background: #f5f7fb;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    --green: #079669;
    --green-dark: #067a56;
    --green-light: #e7f8f0;
    --navy: #152238;
    --muted: #778399;
    --border: #e8edf3;
    --surface: #ffffff;
  }

  * { box-sizing: border-box; }

  body { margin: 0; min-width: 320px; }

  button, input { font: inherit; }

  button { -webkit-tap-highlight-color: transparent; }

  button:focus-visible, input:focus-visible, [tabindex]:focus-visible {
    outline: 3px solid #6ee7b7;
    outline-offset: 3px;
  }

  .app-shell { min-height: 100vh; }

  .topbar {
    min-height: 78px;
    padding: 14px 4%;
    background: white;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .brand { display: flex; align-items: center; gap: 12px; min-width: 0; }

  .brand-mark {
    height: 44px; width: 44px; flex-shrink: 0;
    border-radius: 13px; display: grid; place-items: center;
    color: white; background: var(--green);
    font-weight: 800; font-size: 14px;
    box-shadow: 0 5px 12px #07966925;
  }

  .brand-name { font-size: 17px; font-weight: 800; letter-spacing: -.5px; }
  .brand-caption { font-size: 11px; color: var(--muted); margin-top: 3px; }

  .top-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .user-chip {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 12px; border: 1px solid var(--border);
    border-radius: 12px; margin-right: 4px;
  }

  .avatar {
    width: 33px; height: 33px; border-radius: 10px;
    display: grid; place-items: center; background: var(--green-light);
    color: var(--green-dark); font-weight: 800;
  }

  .muted { color: var(--muted); }
  .small { font-size: 12px; }

  .btn {
    border: 1px solid transparent; border-radius: 10px;
    padding: 10px 14px; min-height: 40px;
    display: inline-flex; align-items: center; justify-content: center;
    gap: 7px; cursor: pointer; font-weight: 700; font-size: 12px;
    transition: background .18s, transform .18s, border-color .18s;
  }

  .btn:active { transform: scale(.98); }
  .btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  .btn-primary { background: var(--green); color: white; }
  .btn-primary:hover:not(:disabled) { background: var(--green-dark); }
  .btn-light { background: white; border-color: var(--border); color: #39465c; }
  .btn-light:hover { background: #f6f8fb; }
  .btn-danger { background: #fff1f1; color: #c53f49; border-color: #ffe0e0; }
  .btn-block { width: 100%; }

  .workspace { max-width: 1600px; margin: auto; padding: 30px 4%; }

  .welcome-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    gap: 16px; margin-bottom: 24px;
  }

  .eyebrow {
    color: var(--green-dark); font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 1.5px;
  }

  .page-title { font-size: clamp(23px, 3vw, 30px); margin: 7px 0 5px; letter-spacing: -1px; }
  .page-subtitle { margin: 0; font-size: 13px; color: var(--muted); }

  .session-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 11px; border-radius: 9px;
    background: white; border: 1px solid var(--border);
    color: #526078; font-size: 11px; font-weight: 700;
  }

  .status-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; }

  .stat-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 15px; margin-bottom: 24px;
  }

  .stat-card {
    padding: 18px 20px; background: white;
    border: 1px solid var(--border); border-radius: 15px;
    display: flex; align-items: center; gap: 14px; min-width: 0;
  }

  .stat-icon {
    height: 43px; width: 43px; border-radius: 12px;
    display: grid; place-items: center; font-size: 19px; flex-shrink: 0;
  }

  .stat-label { font-size: 11px; color: var(--muted); font-weight: 600; }
  .stat-value { font-size: 20px; font-weight: 800; letter-spacing: -.6px; margin-top: 5px; }

  .pos-layout {
    display: grid; grid-template-columns: minmax(0, 1fr) 365px;
    align-items: start; gap: 22px;
  }

  .panel {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; min-width: 0;
    box-shadow: 0 3px 12px #16243b04;
  }

  .panel-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 20px 22px; border-bottom: 1px solid var(--border);
  }

  .panel-title { margin: 0; font-size: 15px; font-weight: 800; letter-spacing: -.3px; }
  .panel-subtitle { font-size: 11px; color: var(--muted); margin-top: 5px; }

  .search-wrap { position: relative; width: min(100%, 265px); }

  .search-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 16px; color: #8994a6; pointer-events: none;
  }

  .search-input {
    width: 100%; height: 42px; border: 1px solid #e1e7ef;
    border-radius: 10px; background: #fafbfd; padding: 0 12px 0 38px;
    font-size: 12px; color: var(--navy);
  }

  .search-input:focus { background: white; border-color: #36b88b; outline: none; }

  .product-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px; padding: 20px;
  }

  .product-card {
    text-align: left; border: 1px solid var(--border);
    border-radius: 13px; padding: 15px; background: white;
    min-width: 0; cursor: pointer; color: inherit;
    transition: border-color .18s, background .18s, transform .18s, box-shadow .18s;
  }

  .product-card:hover {
    border-color: #7dd8b7; background: #fbfffd;
    transform: translateY(-2px); box-shadow: 0 7px 16px #0796690b;
  }

  .product-card:active { transform: scale(.98); }

  .product-icon {
    width: 38px; height: 38px; border-radius: 11px;
    background: #eff8f4; display: grid; place-items: center;
    color: var(--green-dark); font-size: 17px; margin-bottom: 15px;
  }

  .product-name {
    font-size: 13px; font-weight: 700; line-height: 1.45;
    overflow-wrap: anywhere; min-height: 37px;
  }

  .product-price { font-size: 15px; font-weight: 800; margin-top: 8px; color: var(--navy); }
  .product-add { font-size: 10px; font-weight: 800; color: var(--green-dark); margin-top: 12px; }

  .empty-state {
    grid-column: 1 / -1; text-align: center; padding: 55px 15px;
    color: var(--muted); font-size: 13px;
  }

  .empty-icon { font-size: 28px; margin-bottom: 10px; }

  .cart-panel { position: sticky; top: 16px; overflow: hidden; }

  .cart-count {
    min-width: 25px; height: 25px; padding: 0 7px;
    border-radius: 8px; display: grid; place-items: center;
    background: var(--green-light); color: var(--green-dark);
    font-size: 11px; font-weight: 800;
  }

  .cart-body { padding: 5px 20px; min-height: 180px; max-height: 390px; overflow-y: auto; }

  .empty-cart {
    min-height: 205px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center; padding: 20px;
  }

  .empty-cart-icon {
    width: 56px; height: 56px; border-radius: 18px;
    display: grid; place-items: center; font-size: 25px;
    background: #f3f6fa; margin-bottom: 14px;
  }

  .empty-cart-title { font-size: 13px; font-weight: 800; }
  .empty-cart-copy { font-size: 11px; color: var(--muted); line-height: 1.7; max-width: 205px; margin-top: 7px; }

  .cart-row {
    display: flex; justify-content: space-between; align-items: center;
    gap: 10px; padding: 15px 0; border-bottom: 1px solid #f0f2f6;
  }

  .cart-item-name { font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
  .cart-item-price { font-size: 10px; color: var(--muted); margin-top: 5px; }

  .qty-controls {
    display: flex; align-items: center; gap: 9px;
    flex-shrink: 0; border: 1px solid var(--border);
    padding: 4px; border-radius: 9px;
  }

  .qty-btn {
    border: 0; width: 25px; height: 25px; border-radius: 6px;
    display: grid; place-items: center; background: #f3f6fa;
    cursor: pointer; color: #26364d; font-weight: 800;
  }

  .qty-btn:hover { background: var(--green-light); color: var(--green-dark); }
  .qty-number { font-size: 11px; font-weight: 800; min-width: 12px; text-align: center; }

  .cart-footer { padding: 20px; border-top: 1px solid var(--border); background: #fcfdfE; }

  .summary-line {
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; margin-bottom: 12px; font-size: 12px; color: #6b778b;
  }

  .summary-line strong { color: #29364a; font-weight: 700; }

  .total-box {
    border-top: 1px dashed #dce4eb; margin-top: 17px;
    padding-top: 17px; margin-bottom: 19px;
  }

  .total-label { font-size: 12px; font-weight: 700; color: #526078; }
  .total-value { font-size: 26px; font-weight: 800; letter-spacing: -1px; color: var(--navy); margin-top: 5px; }

  .checkout-note { text-align: center; color: var(--muted); font-size: 10px; margin-top: 11px; }

  .notice {
    padding: 12px 14px; border-radius: 10px; font-size: 12px;
    line-height: 1.6; margin-bottom: 15px;
  }

  .notice-error { color: #a52d3a; background: #fff1f2; border: 1px solid #fecdd3; }
  .notice-success { color: #08744f; background: #eafaf2; border: 1px solid #b7efd1; }
  .notice-info { color: #34445c; background: #f0f5fb; border: 1px solid #dce6f1; }

  .login-screen {
    min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr;
    background: white;
  }

  .login-aside {
    position: relative; overflow: hidden; padding: 48px;
    background: #122336; color: white; display: flex; flex-direction: column;
    justify-content: space-between; min-height: 650px;
  }

  .login-aside:before, .login-aside:after {
    content: ''; position: absolute; border-radius: 50%; pointer-events: none;
    border: 1px solid #ffffff10;
  }

  .login-aside:before { width: 450px; height: 450px; right: -180px; bottom: -100px; }
  .login-aside:after { width: 300px; height: 300px; right: -100px; bottom: -25px; }

  .login-aside-content { position: relative; z-index: 1; max-width: 460px; margin: auto 0; }
  .login-aside h1 { font-size: clamp(35px, 4vw, 52px); line-height: 1.13; letter-spacing: -2px; margin: 22px 0 16px; }
  .login-aside p { color: #b6c5d6; line-height: 1.9; font-size: 14px; max-width: 370px; }

  .login-feature { display: flex; align-items: center; gap: 11px; margin-top: 28px; color: #dce7f1; font-size: 12px; }
  .feature-check { background: #0b8c66; border-radius: 50%; width: 24px; height: 24px; display: grid; place-items: center; }

  .login-main { display: flex; justify-content: center; align-items: center; padding: 40px 25px; }
  .login-form-wrap { width: 100%; max-width: 390px; }
  .login-heading { font-size: 29px; font-weight: 800; letter-spacing: -1px; margin: 0 0 9px; }
  .login-description { font-size: 13px; line-height: 1.7; color: var(--muted); margin: 0 0 30px; }

  .field-group { margin-bottom: 19px; }
  .field-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 8px; color: #37445a; }

  .field-input {
    width: 100%; height: 47px; border: 1px solid #dce3ec;
    border-radius: 10px; padding: 0 14px; font-size: 13px;
    color: var(--navy); background: #fff; transition: border-color .18s;
  }

  .field-input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px #07966912; }
  .login-foot { text-align: center; font-size: 11px; color: #929bad; margin-top: 25px; }

  .modal-backdrop {
    position: fixed; inset: 0; z-index: 1000; padding: 18px;
    display: flex; align-items: center; justify-content: center;
    background: #101c30a8; backdrop-filter: blur(4px);
    overflow-y: auto;
  }

  .modal-card {
    width: 100%; max-width: 470px; max-height: calc(100vh - 36px);
    overflow-y: auto; background: white; border-radius: 18px;
    box-shadow: 0 24px 80px #07122530; padding: 25px;
  }

  .modal-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 17px; border-bottom: 1px solid var(--border); }
  .modal-title { font-size: 17px; font-weight: 800; margin: 0; }
  .modal-close { width: 34px; height: 34px; border: 0; border-radius: 9px; background: #f2f5f9; cursor: pointer; color: #5c687b; font-size: 17px; }

  .report-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 20px; }
  .report-card { background: #f8fafc; border: 1px solid var(--border); border-radius: 12px; padding: 17px; }
  .report-label { font-size: 11px; color: var(--muted); }
  .report-value { font-size: clamp(17px, 3vw, 23px); font-weight: 800; letter-spacing: -.5px; margin-top: 10px; overflow-wrap: anywhere; }
  .modal-section-title { font-size: 13px; font-weight: 800; margin: 20px 0 17px; }
  .page-bottom { text-align: center; font-size: 10px; color: #a0a9b8; padding: 25px 10px; }

  @media (min-width: 1450px) {
    .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }

  @media (max-width: 1100px) {
    .pos-layout { grid-template-columns: minmax(0, 1fr) 330px; gap: 15px; }
    .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); padding: 15px; }
    .workspace { padding: 24px 3%; }
    .topbar { padding-inline: 3%; }
    .panel-header { padding: 17px; }
    .cart-body { padding-inline: 15px; }
    .cart-footer { padding: 17px; }
  }

  @media (max-width: 760px) {
    .topbar { padding: 12px 16px; align-items: flex-start; }
    .brand-mark { width: 39px; height: 39px; }
    .brand-caption { display: none; }
    .brand-name { font-size: 15px; }
    .top-actions { justify-content: flex-end; gap: 6px; }
    .user-chip { display: none; }
    .top-actions .btn { min-height: 36px; padding: 8px 10px; font-size: 11px; }
    .workspace { padding: 22px 14px; }
    .welcome-row { align-items: flex-start; flex-direction: column; margin-bottom: 18px; }
    .stat-grid { gap: 9px; margin-bottom: 17px; }
    .stat-card { padding: 12px 10px; gap: 8px; align-items: flex-start; flex-direction: column; }
    .stat-icon { width: 32px; height: 32px; font-size: 15px; }
    .stat-label { font-size: 10px; }
    .stat-value { font-size: 15px; overflow-wrap: anywhere; }
    .pos-layout { grid-template-columns: minmax(0, 1fr); }
    .cart-panel { position: static; }
    .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 13px; }
    .product-card { padding: 12px; }
    .product-icon { margin-bottom: 10px; }
    .product-price { font-size: 14px; }
    .panel-header { padding: 15px 13px; }
    .panel-title { font-size: 14px; }
    .panel-subtitle { font-size: 10px; }
    .catalog-header { align-items: flex-start; flex-direction: column; }
    .search-wrap { width: 100%; }
    .cart-body { max-height: none; }
    .login-screen { grid-template-columns: 1fr; }
    .login-aside { display: none; }
    .login-main { min-height: 100vh; padding: 28px 22px; }
    .login-heading { font-size: 27px; }
  }

  @media (max-width: 390px) {
    .topbar { gap: 8px; }
    .brand { gap: 8px; }
    .brand-mark { width: 34px; height: 34px; font-size: 12px; }
    .brand-name { font-size: 13px; }
    .top-actions .btn { padding: 7px 8px; font-size: 10px; }
    .stat-value { font-size: 13px; }
    .report-grid { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *:before, *:after { transition: none !important; scroll-behavior: auto !important; }
  }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

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
  const [notice, setNotice] = useState('');

  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');
  const [cashierMessage, setCashierMessage] = useState('');

  // Restore saved session.
  useEffect(() => {
    if (!token) return;

    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setToken(null);
    }
  }, [token]);

  // Fetch inventory after login.
  useEffect(() => {
    if (user && token) fetchItems();
  }, [user, token]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load items');

      setItems(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load items from server.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid username or password');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setToken(data.token);
      setUsername('');
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setNotice('');

    setCart((current) => {
      const existing = current.find((i) => i.name === item.name);

      if (existing) {
        return current.map((i) =>
          i.name === item.name
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [...current, { ...item, quantity: 1, price: item.price }];
    });
  };

  const updateQuantity = (name, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.name !== name) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        })
        .filter(Boolean)
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;

    setLoading(true);
    setNotice('');

    const totalAmount = cart.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
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

      if (!res.ok) throw new Error(data.message || 'Transaction failed');

      if (data.success) {
        setCart([]);
        setNotice('Transaction completed successfully.');
        fetchItems();
      } else {
        throw new Error(data.message || 'Transaction could not be completed.');
      }
    } catch (err) {
      setNotice(err.message || 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/reports/daily`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load daily report');

      setReport(data);
      setShowReportModal(true);
    } catch (err) {
      setNotice(err.message || 'Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  const createCashier = async (e) => {
    e.preventDefault();
    setCashierMessage('');
    setLoading(true);

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
      if (!res.ok) throw new Error(data.message || 'Failed to create cashier');

      setCashierMessage('Cashier account created successfully!');
      setCashierUsername('');
      setCashierPassword('');
    } catch (err) {
      setCashierMessage(err.message || 'Failed to create cashier');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
    setToken(null);
    setCart([]);
    setReport(null);
    setItems([]);
    setSearchQuery('');
    setError('');
    setNotice('');
    setShowAdminModal(false);
    setShowReportModal(false);
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter((item) =>
    String(item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModals = () => {
    setShowAdminModal(false);
    setShowReportModal(false);
  };

  useEffect(() => {
    if (!showAdminModal && !showReportModal) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeModals();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showAdminModal, showReportModal]);

  const cartCount = cart.length;
  const isAdmin = user?.role === 'Admin';

  return (
    <>
      <style>{styles}</style>

      {!user ? (
        <div className="login-screen">
          <aside className="login-aside">
            <div className="brand">
              <div className="brand-mark">POS</div>
              <div>
                <div className="brand-name" style={{ color: 'white' }}>
                  Nexa POS
                </div>
                <div className="brand-caption" style={{ color: '#a7b8ca' }}>
                  RETAIL MANAGEMENT
                </div>
              </div>
            </div>

            <div className="login-aside-content">
              <div className="eyebrow" style={{ color: '#6ee7b7' }}>
                SMARTER CHECKOUTS
              </div>
              <h1>Every transaction. Under control.</h1>
              <p>
                A streamlined point-of-sale workspace to manage your products,
                process orders, and keep your business moving.
              </p>

              <div className="login-feature">
                <span className="feature-check">✓</span>
                Fast, straightforward checkout
              </div>
              <div className="login-feature">
                <span className="feature-check">✓</span>
                Inventory at your fingertips
              </div>
              <div className="login-feature">
                <span className="feature-check">✓</span>
                Daily sales reporting for administrators
              </div>
            </div>

            <div className="small" style={{ color: '#91a4b8' }}>
              © {new Date().getFullYear()} Nexa POS · Retail workspace
            </div>
          </aside>

          <main className="login-main">
            <div className="login-form-wrap">
              <div className="brand" style={{ marginBottom: 35 }}>
                <div className="brand-mark">POS</div>
                <div>
                  <div className="brand-name">Nexa POS</div>
                  <div className="brand-caption">YOUR BUSINESS TERMINAL</div>
                </div>
              </div>

              <div className="eyebrow">WELCOME BACK</div>
              <h2 className="login-heading" style={{ marginTop: 10 }}>
                Sign in to your account
              </h2>
              <p className="login-description">
                Enter your staff credentials to access the point-of-sale
                terminal.
              </p>

              {error && (
                <div className="notice notice-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="field-group">
                  <label className="field-label" htmlFor="login-username">
                    Username
                  </label>
                  <input
                    id="login-username"
                    className="field-input"
                    type="text"
                    placeholder="Enter your username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    id="login-password"
                    className="field-input"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  style={{ minHeight: 48, marginTop: 7, fontSize: 13 }}
                  disabled={loading}
                >
                  {loading ? 'Signing you in...' : 'Sign in securely →'}
                </button>
              </form>

              <div className="login-foot">
                Authorized staff only. Your credentials are required.
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="app-shell">
          <header className="topbar">
            <div className="brand">
              <div className="brand-mark">POS</div>
              <div>
                <div className="brand-name">Nexa POS</div>
                <div className="brand-caption">POINT OF SALE SYSTEM</div>
              </div>
            </div>

            <div className="top-actions">
              <div className="user-chip">
                <div className="avatar">
                  {String(user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>
                    {user.username}
                  </div>
                  <div className="small muted">{user.role}</div>
                </div>
              </div>

              {isAdmin && (
                <>
                  <button
                    className="btn btn-light"
                    onClick={fetchReport}
                    disabled={loading}
                  >
                    ▤ <span>Daily Report</span>
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setCashierMessage('');
                      setShowAdminModal(true);
                    }}
                  >
                    ⚙ <span>Admin</span>
                  </button>
                </>
              )}

              <button className="btn btn-danger" onClick={handleLogout}>
                ↗ <span>Logout</span>
              </button>
            </div>
          </header>

          <main className="workspace">
            <div className="welcome-row">
              <div>
                <div className="eyebrow">SALES WORKSPACE</div>
                <h1 className="page-title">New transaction</h1>
                <p className="page-subtitle">
                  Select products, build an order, and complete checkout.
                </p>
              </div>

              <div className="session-pill">
                <span className="status-dot" />
                Cashier session active
              </div>
            </div>

            <section className="stat-grid" aria-label="Session overview">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: '#e6f8ef', color: '#07885e' }}
                >
                  ▦
                </div>
                <div>
                  <div className="stat-label">Available products</div>
                  <div className="stat-value">{items.length}</div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: '#edf2ff', color: '#536fe0' }}
                >
                  🛒
                </div>
                <div>
                  <div className="stat-label">Items in current order</div>
                  <div className="stat-value">{totalQuantity}</div>
                </div>
              </div>

              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: '#fff5e7', color: '#c17b18' }}
                >
                  ₦
                </div>
                <div>
                  <div className="stat-label">Current order total</div>
                  <div className="stat-value" style={{ fontSize: 18 }}>
                    {money(total)}
                  </div>
                </div>
              </div>
            </section>

            {notice && (
              <div
                className={`notice ${
                  notice.toLowerCase().includes('success')
                    ? 'notice-success'
                    : 'notice-error'
                }`}
                role="status"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <span>{notice}</span>
                  <button
                    className="modal-close"
                    onClick={() => setNotice('')}
                    aria-label="Dismiss message"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="notice notice-error" role="alert">
                {error}
                <button
                  className="btn btn-light"
                  style={{ marginLeft: 10 }}
                  onClick={fetchItems}
                >
                  Retry loading
                </button>
              </div>
            )}

            <div className="pos-layout">
              <section className="panel">
                <div className="panel-header catalog-header">
                  <div>
                    <h2 className="panel-title">Product catalogue</h2>
                    <div className="panel-subtitle">
                      {filteredItems.length} product
                      {filteredItems.length === 1 ? '' : 's'} available
                    </div>
                  </div>

                  <div className="search-wrap">
                    <span className="search-icon">⌕</span>
                    <input
                      className="search-input"
                      type="search"
                      placeholder="Search products..."
                      aria-label="Search products"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="product-grid">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item._id || item.name}
                      type="button"
                      className="product-card"
                      onClick={() => addToCart(item)}
                      aria-label={`Add ${item.name} to cart for ${money(item.price)}`}
                    >
                      <div className="product-icon">
                        {['▦', '◇', '◈', '▤'][index % 4]}
                      </div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-price">{money(item.price)}</div>
                      <div className="product-add">＋ Add to order</div>
                    </button>
                  ))}

                  {filteredItems.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">⌕</div>
                      <div style={{ fontWeight: 800, color: '#536078' }}>
                        No products found
                      </div>
                      <p>
                        {items.length === 0
                          ? 'Products will appear here when inventory is available.'
                          : 'Try a different search term.'}
                      </p>
                      {searchQuery && (
                        <button
                          className="btn btn-light"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

              <aside className="panel cart-panel">
                <div className="panel-header">
                  <div>
                    <h2 className="panel-title">Current order</h2>
                    <div className="panel-subtitle">Review before checkout</div>
                  </div>
                  <div className="cart-count">{totalQuantity}</div>
                </div>

                <div className="cart-body">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <div className="empty-cart-icon">🛒</div>
                      <div className="empty-cart-title">Your cart is empty</div>
                      <div className="empty-cart-copy">
                        Choose a product from the catalogue to start a new
                        transaction.
                      </div>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div className="cart-row" key={item.name}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">
                            {money(item.price)} × {item.quantity}
                          </div>
                          <div
                            style={{
                              marginTop: 5,
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#334155',
                            }}
                          >
                            {money(Number(item.price || 0) * item.quantity)}
                          </div>
                        </div>

                        <div className="qty-controls">
                          <button
                            className="qty-btn"
                            type="button"
                            onClick={() => updateQuantity(item.name, -1)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            type="button"
                            onClick={() => updateQuantity(item.name, 1)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="cart-footer">
                  <div className="summary-line">
                    <span>Unique products</span>
                    <strong>{cartCount}</strong>
                  </div>
                  <div className="summary-line">
                    <span>Total quantity</span>
                    <strong>{totalQuantity}</strong>
                  </div>

                  <div className="total-box">
                    <div className="total-label">Total amount</div>
                    <div className="total-value">{money(total)}</div>
                  </div>

                  <button
                    className="btn btn-primary btn-block"
                    style={{ minHeight: 48, fontSize: 13 }}
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || loading}
                  >
                    {loading
                      ? 'Processing...'
                      : 'Complete transaction  →'}
                  </button>

                  {cart.length > 0 && (
                    <button
                      className="btn btn-light btn-block"
                      style={{ marginTop: 9 }}
                      onClick={() => {
                        setCart([]);
                        setNotice('');
                      }}
                      disabled={loading}
                    >
                      Clear order
                    </button>
                  )}

                  <div className="checkout-note">
                    Review quantities and total before confirming.
                  </div>
                </div>
              </aside>
            </div>

            <footer className="page-bottom">
              Nexa POS · Retail workspace · Signed in as {user.username}
            </footer>
          </main>

          {showAdminModal && isAdmin && (
            <div
              className="modal-backdrop"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowAdminModal(false);
              }}
            >
              <section
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-modal-title"
              >
                <div className="modal-head">
                  <div>
                    <h2 id="admin-modal-title" className="modal-title">
                      Admin controls
                    </h2>
                    <div className="panel-subtitle">
                      Manage cashier access
                    </div>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setShowAdminModal(false)}
                    aria-label="Close admin controls"
                  >
                    ×
                  </button>
                </div>

                <h3 className="modal-section-title">Create cashier account</h3>

                {cashierMessage && (
                  <div
                    className={`notice ${
                      cashierMessage.toLowerCase().includes('success')
                        ? 'notice-success'
                        : 'notice-error'
                    }`}
                    role="status"
                  >
                    {cashierMessage}
                  </div>
                )}

                <form onSubmit={createCashier}>
                  <div className="field-group">
                    <label className="field-label" htmlFor="cashier-username">
                      Cashier username
                    </label>
                    <input
                      id="cashier-username"
                      className="field-input"
                      type="text"
                      placeholder="Enter a username"
                      autoComplete="off"
                      value={cashierUsername}
                      onChange={(e) => setCashierUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label" htmlFor="cashier-password">
                      Temporary password
                    </label>
                    <input
                      id="cashier-password"
                      className="field-input"
                      type="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      value={cashierPassword}
                      onChange={(e) => setCashierPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="btn btn-primary btn-block"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create cashier account'}
                  </button>
                </form>

                <p className="small muted" style={{ lineHeight: 1.7, marginTop: 17 }}>
                  Cashier creation uses your existing user API. Make sure your
                  backend enforces administrator permissions.
                </p>
              </section>
            </div>
          )}

          {showReportModal && report && isAdmin && (
            <div
              className="modal-backdrop"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowReportModal(false);
              }}
            >
              <section
                className="modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-modal-title"
              >
                <div className="modal-head">
                  <div>
                    <h2 id="report-modal-title" className="modal-title">
                      Daily sales report
                    </h2>
                    <div className="panel-subtitle">
                      Today's reported sales performance
                    </div>
                  </div>
                  <button
                    className="modal-close"
                    onClick={() => setShowReportModal(false)}
                    aria-label="Close daily report"
                  >
                    ×
                  </button>
                </div>

                <div className="report-grid">
                  <div className="report-card">
                    <div className="report-label">Total revenue</div>
                    <div className="report-value">
                      {money(report.totalRevenue)}
                    </div>
                  </div>
                  <div className="report-card">
                    <div className="report-label">Total transactions</div>
                    <div className="report-value">
                      {Number(report.totalTransactions || 0).toLocaleString('en-NG')}
                    </div>
                  </div>
                </div>

                <div className="notice notice-info" style={{ marginTop: 18, marginBottom: 0 }}>
                  Figures are supplied by your existing daily reports endpoint.
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </>
  );
}
