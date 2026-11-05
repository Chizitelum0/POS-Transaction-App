const API_BASE = '/api';
let unauthorizedHandler = null;

async function request(path, options = {}) {
  const { token, ...fetchOptions } = options;
  const headers = {
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  let data = {};
  try { data = await response.json(); } catch { /* empty response */ }

  if (!response.ok) {
    if (response.status === 401 && token) unauthorizedHandler?.();
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  setUnauthorizedHandler: (handler) => { unauthorizedHandler = handler; },
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getItems: (token) => request('/items', { token }),

  addItem: (token, item) =>
    request('/items', {
      method: 'POST',
      token,
      body: JSON.stringify(item),
    }),

  createTransaction: (token, transaction) =>
    request('/transactions', {
      method: 'POST',
      token,
      body: JSON.stringify(transaction),
    }),

  getTransactions: (token) => request('/transactions', { token }),

  getDailyReport: (token) => request('/reports/daily', { token }),

  createCashier: (token, cashier) =>
    request('/users', {
      method: 'POST',
      token,
      body: JSON.stringify(cashier),
    }),
};

export { API_BASE };
