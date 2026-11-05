import { formatNGN } from '../utils/currency';

export default function CartPanel({ cart, total, loading, onQuantity, onClear, onCheckout }) {
  return (
    <section className="cart-panel">
      <div className="panel-header"><div><p className="eyebrow">Current sale</p><h2>Order</h2></div>{cart.length > 0 && <button className="text-button" onClick={onClear}>Clear</button>}</div>
      <div className="cart-list">
        {cart.length === 0 ? (
          <div className="empty-cart"><div className="empty-icon">+</div><strong>No items yet</strong><p>Select products to build the order.</p></div>
        ) : cart.map((item) => (
          <div className="cart-item" key={item.name}>
            <div><strong>{item.name}</strong><small>{formatNGN(item.price)} each</small></div>
            <div className="qty"><button onClick={() => onQuantity(item.name, -1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => onQuantity(item.name, 1)} aria-label={`Increase ${item.name}`}>+</button></div>
            <strong className="line-total">{formatNGN(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>
      <div className="checkout">
        <div className="total-row"><span>Total</span><strong>{formatNGN(total)}</strong></div>
        <button className="primary full" disabled={!cart.length || loading} onClick={onCheckout}>{loading ? 'Processing…' : 'Complete transaction'}</button>
      </div>
    </section>
  );
}
