import { useState } from 'react';
import Modal from '../components/Modal';
import { formatNGN } from '../utils/currency';
import { printReceipt } from '../utils/receipt';

export default function Transactions({ transactions, token, api, onLoad, onError }) {
  const [search, setSearch] = useState('');
  const filtered = transactions.filter((tx) => `${tx._id || ''} ${tx.cashierName || ''}`.toLowerCase().includes(search.toLowerCase()));

  const reprint = (tx) => {
    try {
      printReceipt({
        receiptNumber: tx._id || 'POS-RECEIPT',
        cashierName: tx.cashierName || 'Cashier',
        items: Array.isArray(tx.items) ? tx.items : [],
        totalAmount: Number(tx.totalAmount) || 0,
        timestamp: tx.timestamp || tx.createdAt || new Date().toISOString(),
      });
    } catch (err) { onError(err.message); }
  };

  return (
    <div className="workspace">
      <div className="section-intro"><div><p className="eyebrow">Sales records</p><h2>Transaction history</h2><p>Review completed sales and reprint receipts.</p></div><button className="secondary" onClick={onLoad}>Refresh</button></div>
      <div className="panel">
        <div className="table-toolbar"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search receipt or cashier…" /></div>
        <div className="table-wrap"><table><thead><tr><th>Receipt</th><th>Date</th><th>Cashier</th><th>Items</th><th>Total</th><th></th></tr></thead><tbody>
          {filtered.map((tx) => <tr key={tx._id}><td>{String(tx._id || '').slice(-8).toUpperCase()}</td><td>{new Date(tx.timestamp || tx.createdAt).toLocaleString('en-NG')}</td><td>{tx.cashierName || '—'}</td><td>{Array.isArray(tx.items) ? tx.items.reduce((n,i)=>n+(Number(i.quantity)||0),0) : 0}</td><td>{formatNGN(tx.totalAmount)}</td><td><button className="secondary small" onClick={()=>reprint(tx)}>Reprint</button></td></tr>)}
        </tbody></table>{!filtered.length && <div className="empty-state">No transactions found.</div>}</div>
      </div>
    </div>
  );
}
