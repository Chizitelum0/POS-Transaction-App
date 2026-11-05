import { formatNGN } from '../utils/currency';
export default function Reports({ report, onRefresh }) {
  return <div className="workspace"><div className="section-intro"><div><p className="eyebrow">Admin analytics</p><h2>Today's sales</h2><p>Daily performance from recorded transactions.</p></div><button className="secondary" onClick={onRefresh}>Refresh report</button></div><div className="report-grid"><div className="report-card"><span>Revenue</span><strong>{formatNGN(report?.totalRevenue || 0)}</strong></div><div className="report-card"><span>Transactions</span><strong>{report?.totalTransactions || 0}</strong></div></div></div>;
}
