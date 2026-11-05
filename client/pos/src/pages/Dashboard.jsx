import { useMemo, useState } from 'react';
import CartPanel from '../components/CartPanel';
import ProductGrid from '../components/ProductGrid';
import Modal from '../components/Modal';
import { formatNGN } from '../utils/currency';

export default function Dashboard({
  user, items, setItems, token, search, setSearch, cart, setCart,
  loading, setLoading, error, notice, onError, onNotice, api, setPage
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const filteredItems = useMemo(() =>
    items.filter((item) => String(item.name || '').toLowerCase().includes(search.toLowerCase())), [items, search]);

  const total = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const addToCart = (item) => {
    const existing = cart.find((x) => x.name === item.name);
    if (Number(item.stock) <= 0) return onError(`${item.name} is out of stock.`);
    if (existing && existing.quantity >= Number(item.stock)) return onError(`Only ${item.stock} unit(s) of ${item.name} are in stock.`);
    setCart(existing
      ? cart.map((x) => x.name === item.name ? { ...x, quantity: x.quantity + 1 } : x)
      : [...cart, { ...item, quantity: 1 }]);
    onError('');
  };

  const updateQuantity = (itemName, delta) => {
    setCart(cart.map((item) => item.name === itemName
      ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const productPrice = Number(price);
      const productStock = Number(stock);
      if (!name.trim()) throw new Error('Enter a product name.');
      if (!Number.isFinite(productPrice) || productPrice < 0) throw new Error('Enter a valid selling price.');
      if (!Number.isInteger(productStock) || productStock < 0) throw new Error('Stock must be a whole number of zero or more.');
      setLoading(true);
      const data = await api.addItem(token, { name: name.trim(), price: productPrice, stock: productStock });
      setItems((current) => [...current, data.item].sort((a,b) => a.name.localeCompare(b.name)));
      setName(''); setPrice(''); setStock(''); setShowAdd(false);
      onNotice('Product added successfully.');
    } catch (err) { onError(err.message); } finally { setLoading(false); }
  };

  const checkout = async () => {
    if (!cart.length) return;
    const receiptWindow = window.open('', '_blank', 'width=400,height=700');
    try {
      setLoading(true);
      const receiptItems = cart.map((item) => ({ itemId: item._id, name: item.name, price: Number(item.price), quantity: Number(item.quantity) }));
      const data = await api.createTransaction(token, {
        cashierName: user.username, items: receiptItems, totalAmount: total,
      });
      const transaction = data.transaction || {};
      const receipt = {
        receiptNumber: transaction._id || data.transactionId || `POS-${Date.now()}`,
        cashierName: user.username, items: receiptItems, totalAmount: total,
        timestamp: transaction.timestamp || new Date().toISOString(),
      };
      setCart([]);
      setItems(await api.getItems(token));
      onNotice('Transaction completed successfully.');
      if (receiptWindow) {
        const { printReceipt } = await import('../utils/receipt');
        printReceipt(receipt, receiptWindow);
      }
    } catch (err) {
      if (receiptWindow && !receiptWindow.closed) receiptWindow.close();
      onError(err.message || 'Checkout failed.');
    } finally { setLoading(false); }
  };

  return (
    <>
      {(error || notice) && <div className={`alert-bar ${error ? 'error' : 'success'}`}>{error || notice}<button onClick={() => error ? onError('') : onNotice('')}>×</button></div>}
      <div className="workspace">
        <div className="stats-row">
          <div className="stat"><span>Products</span><strong>{items.length}</strong><small>Inventory catalogue</small></div>
          <div className="stat"><span>Cart items</span><strong>{cart.reduce((n, x) => n + x.quantity, 0)}</strong><small>Current order</small></div>
          <div className="stat"><span>Order total</span><strong>{formatNGN(total)}</strong><small>Before checkout</small></div>
        </div>
        <div className="pos-layout">
          <ProductGrid items={filteredItems} search={search} setSearch={setSearch} onAdd={addToCart} onAddProduct={() => setShowAdd(true)} canAdd={user.role === 'Admin'} />
          <CartPanel cart={cart} total={total} loading={loading} onQuantity={updateQuantity} onClear={() => setCart([])} onCheckout={checkout} />
        </div>
      </div>

      {showAdd && (
        <Modal title="Add product" onClose={() => setShowAdd(false)}>
          <form className="form-grid" onSubmit={addProduct}>
            <label>Product name<input value={name} onChange={(e)=>setName(e.target.value)} required /></label>
            <label>Selling price<input type="number" min="0" step="0.01" value={price} onChange={(e)=>setPrice(e.target.value)} required /></label>
            <label>Opening stock<input type="number" min="0" step="1" value={stock} onChange={(e)=>setStock(e.target.value)} required /></label>
            <div className="form-actions"><button type="button" className="secondary" onClick={()=>setShowAdd(false)}>Cancel</button><button className="primary" disabled={loading}>{loading ? 'Saving…' : 'Save product'}</button></div>
          </form>
        </Modal>
      )}
    </>
  );
}
