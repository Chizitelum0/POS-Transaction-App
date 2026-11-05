import { useEffect, useState } from 'react';
import { api } from './services/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import './index.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const [page, setPage] = useState('pos');
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [report, setReport] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!token || !user) return;
    api.getItems(token).then(setItems).catch((err) => setError(err.message));
  }, [token, user]);

  const login = async (username, password) => {
    try {
      setLoading(true); setError('');
      const data = await api.login(username, password);
      setToken(data.token); setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) { setError(err.message || 'Unable to connect to backend server.'); }
    finally { setLoading(false); }
  };

  const logout = () => {
    setToken(null); setUser(null); setCart([]); setItems([]); setTransactions([]);
    localStorage.removeItem('token'); localStorage.removeItem('user');
    setPage('pos');
  };

  const loadTransactions = async () => {
    try { setLoading(true); setTransactions(await api.getTransactions(token)); setPage('transactions'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const loadReport = async () => {
    try { setLoading(true); setReport(await api.getDailyReport(token)); setPage('reports'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  if (!user || !token) return <Login onLogin={login} loading={loading} error={error} />;

  let content;
  if (page === 'transactions') {
    content = <Transactions transactions={transactions} token={token} api={api} onLoad={loadTransactions} onError={setError} />;
  } else if (page === 'reports') {
    content = <Reports report={report} onRefresh={loadReport} />;
  } else if (page === 'admin') {
    content = <Admin token={token} api={api} onError={setError} onNotice={setNotice} />;
  } else {
    content = <Dashboard user={user} items={items} setItems={setItems} token={token} search={search} setSearch={setSearch} cart={cart} setCart={setCart} loading={loading} setLoading={setLoading} error={error} notice={notice} onError={setError} onNotice={setNotice} api={api} setPage={setPage} />;
  }

  const navigate = (next) => {
    setError(''); setNotice(''); setPage(next);
    if (next === 'transactions') loadTransactions();
    if (next === 'reports') loadReport();
  };

  return <Layout user={user} page={page} setPage={navigate} onLogout={logout}>{content}</Layout>;
}
