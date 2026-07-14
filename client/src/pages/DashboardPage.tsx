export default function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Available Stocks</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>128</p>
          <p className="text-xs text-muted">sacks</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Fast Moving</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>3</p>
          <p className="text-xs text-muted">items</p>
        </div>
      </div>

      {/* Income / Expenses */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Gross Income</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--buy)' }}>₱ 84,500.00</p>
            </div>
            <span style={{ fontSize: 28 }}>📈</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Expenses</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--sell)' }}>₱ 62,300.00</p>
            </div>
            <span style={{ fontSize: 28 }}>📉</span>
          </div>
        </div>

        <div className="card" style={{ background: '#e8f5e9' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Net Income</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary-dark)' }}>₱ 22,200.00</p>
            </div>
            <span style={{ fontSize: 28 }}>💰</span>
          </div>
        </div>
      </div>

      {/* Fast Moving Items */}
      <h2 className="text-sm font-bold mb-1">Fast Moving Items</h2>
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-sm font-bold">Jasmine Rice 25kg</p>
            <p className="text-xs text-muted">Sold 45 sacks this month</p>
          </div>
          <span className="badge badge-green">Hot</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-sm font-bold">Sinandomeng 50kg</p>
            <p className="text-xs text-muted">Sold 32 sacks this month</p>
          </div>
          <span className="badge badge-green">Hot</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
          <div>
            <p className="text-sm font-bold">Bien Rice 25kg</p>
            <p className="text-xs text-muted">Sold 28 sacks this month</p>
          </div>
          <span className="badge badge-yellow">Moving</span>
        </div>
      </div>
    </div>
  );
}
