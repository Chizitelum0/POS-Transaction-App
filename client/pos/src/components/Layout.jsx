export default function Layout({ user, page, setPage, onLogout, children }) {
  const links = [
    ['pos', 'Point of Sale'],
    ['inventory', 'Inventory'],
    ['transactions', 'Transactions'],
    ...(user.role === 'Admin' ? [['reports', 'Reports'], ['admin', 'Admin']] : []),
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span>POS</span><div><strong>Point of Sale</strong><small>Transaction workspace</small></div></div>
        <nav>
          {links.map(([id, label]) => (
            <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => setPage(id)}>
              <span className="nav-dot" />{label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card"><div className="avatar">{user.username.slice(0,1).toUpperCase()}</div><div><strong>{user.username}</strong><small>{user.role}</small></div></div>
          <button className="nav-item logout" onClick={onLogout}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div><p className="eyebrow">Business workspace</p><h1>{links.find(([id]) => id === page)?.[1] || 'Point of Sale'}</h1></div>
          <div className="topbar-user"><span className="status-dot" /> Online <span className="role-pill">{user.role}</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}
