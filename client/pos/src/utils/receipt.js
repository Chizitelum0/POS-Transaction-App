import { formatNGN } from './currency';

export function printReceipt(receipt) {
  const receiptWindow = window.open('', '_blank', 'width=400,height=700');

  if (!receiptWindow) {
    throw new Error('Allow pop-ups in your browser to print receipts.');
  }

  const business = JSON.parse(
    localStorage.getItem('posBusinessProfile') || '{}'
  );

  const businessName = business.businessName || 'YOUR BUSINESS NAME';
  const businessAddress = business.address || '';
  const businessPhone = business.phone || '';

  const escape = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char]));

  const rows = (receipt.items || []).map((item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;

    return `<tr>
      <td>${escape(item.name)}</td>
      <td class="number">${quantity}</td>
      <td class="number">${escape(formatNGN(price))}</td>
      <td class="number">${escape(formatNGN(price * quantity))}</td>
    </tr>`;
  }).join('');

  receiptWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Sales Receipt</title>
        <style>
          @page { size: 80mm auto; margin: 3mm; }
          * { box-sizing: border-box; }
          body { width: 74mm; margin: 0 auto; padding: 2mm 0; font: 11px Arial,sans-serif; color:#000; }
          .center { text-align:center; }
          .business { font-size:18px; font-weight:800; margin:0 0 5px; overflow-wrap:anywhere; }
          .muted { font-size:10px; overflow-wrap:anywhere; }
          .title { margin:10px 0; font-size:13px; font-weight:800; letter-spacing:1px; }
          .divider { border-top:1px dashed #000; margin:9px 0; }
          p { margin:3px 0; overflow-wrap:anywhere; }
          table { width:100%; border-collapse:collapse; table-layout:fixed; font-size:9px; }
          th { border-bottom:1px solid #000; text-align:left; padding:5px 1px; }
          td { padding:6px 1px; vertical-align:top; overflow-wrap:anywhere; }
          th:first-child,td:first-child { width:34%; }
          th:nth-child(2),td:nth-child(2) { width:10%; }
          th:nth-child(3),td:nth-child(3) { width:26%; }
          th:nth-child(4),td:nth-child(4) { width:30%; }
          .number { text-align:right; }
          .total { display:flex; justify-content:space-between; gap:8px; font-size:14px; font-weight:800; }
          footer { margin-top:15px; text-align:center; }
        </style>
      </head>
      <body>
        <header class="center">
          <h1 class="business">${escape(businessName)}</h1>
          ${businessAddress ? `<div class="muted">${escape(businessAddress)}</div>` : ''}
          ${businessPhone ? `<div class="muted">Tel: ${escape(businessPhone)}</div>` : ''}
          <div class="title">SALES RECEIPT</div>
        </header>
        <div class="divider"></div>
        <p><strong>Receipt No:</strong> ${escape(receipt.receiptNumber)}</p>
        <p><strong>Date:</strong> ${escape(new Date(receipt.timestamp).toLocaleString('en-NG'))}</p>
        <p><strong>Cashier:</strong> ${escape(receipt.cashierName)}</p>
        <div class="divider"></div>
        <table>
          <thead><tr><th>Item</th><th class="number">Qty</th><th class="number">Price</th><th class="number">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="divider"></div>
        <div class="total"><span>GRAND TOTAL</span><span>${escape(formatNGN(receipt.totalAmount))}</span></div>
        <div class="divider"></div>
        <footer><p><strong>Thank you for your patronage!</strong></p><p>Please come again.</p></footer>
        <script>window.onload=()=>setTimeout(()=>{window.focus();window.print()},300)</script>
      </body>
    </html>
  `);

  receiptWindow.document.close();
}
