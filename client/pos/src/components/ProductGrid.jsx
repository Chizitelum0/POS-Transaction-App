import { formatNGN } from '../utils/currency';

export default function ProductGrid({ items, search, setSearch, onAdd, onAddProduct, canAdd }) {
  return (
    <section className="catalog-panel">
      <div className="panel-header catalog-toolbar">
        <div><p className="eyebrow">Products</p><h2>Available items</h2></div>
        {canAdd && <button className="secondary" onClick={onAddProduct}>+ Add product</button>}
      </div>
      <div className="search-wrap"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" /></div>
      <div className="product-grid">
        {items.map((item) => (
          <button className="product-card" key={item._id || item.name} onClick={() => onAdd(item)} disabled={Number(item.stock) <= 0}>
            <span className="stock">{Number(item.stock) > 0 ? `${item.stock} in stock` : 'Out of stock'}</span>
            <strong>{item.name}</strong><span>{formatNGN(item.price)}</span><small>Click to add</small>
          </button>
        ))}
        {!items.length && <div className="empty-state">No products match your search.</div>}
      </div>
    </section>
  );
}
