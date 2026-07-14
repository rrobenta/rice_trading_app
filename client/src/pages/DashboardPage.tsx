import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState(0);
  const [grossIncome, setGrossIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubListings = onSnapshot(
      query(collection(db, 'listings'), where('uid', '==', uid)),
      (snap) => {
        const items = snap.docs.map(d => d.data());
        setListings(items);
        const totalQty = items.reduce((sum, l) => sum + parseInt(l.quantity || '0', 10), 0);
        setStocks(totalQty);
        const totalSales = items.reduce((sum, l) => sum + (parseFloat(l.sellPrice || '0') * parseInt(l.quantity || '0', 10)), 0);
        setGrossIncome(totalSales);
      }
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, 'expenses'), where('uid', '==', uid)),
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + parseFloat(d.data().amount || '0'), 0);
        setExpenses(total);
      }
    );

    return () => { unsubListings(); unsubExpenses(); };
  }, [user]);

  const netIncome = grossIncome - expenses;

  // Fast moving: sort by quantity descending, show top 3
  const fastMoving = [...listings]
    .sort((a, b) => parseInt(b.quantity || '0', 10) - parseInt(a.quantity || '0', 10))
    .slice(0, 3);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Available Stocks</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>{stocks}</p>
          <p className="text-xs text-muted">units</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Fast Moving</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>{fastMoving.length}</p>
          <p className="text-xs text-muted">items</p>
        </div>
      </div>

      {/* Income / Expenses */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Gross Income</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--buy)' }}>₱ {grossIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <span style={{ fontSize: 28 }}>📈</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Expenses</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--sell)' }}>₱ {expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <span style={{ fontSize: 28 }}>📉</span>
          </div>
        </div>

        <div className="card" style={{ background: netIncome >= 0 ? '#e8f5e9' : '#ffe8e8' }}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Net Income</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: netIncome >= 0 ? 'var(--primary-dark)' : 'var(--sell)' }}>₱ {netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <span style={{ fontSize: 28 }}>{netIncome >= 0 ? '💰' : '⚠️'}</span>
          </div>
        </div>
      </div>

      {/* Fast Moving Items */}
      <h2 className="text-sm font-bold mb-1">Fast Moving Items</h2>
      {fastMoving.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <p className="text-xs text-muted">No listings yet. Add items to see your top movers here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {fastMoving.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: i < fastMoving.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted">{item.quantity} units in stock</p>
              </div>
              <span className={`badge ${i === 0 ? 'badge-green' : 'badge-yellow'}`}>{i === 0 ? 'Top' : 'Moving'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
