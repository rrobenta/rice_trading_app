import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { STORE_ID } from '../lib/store';
import { useAuth } from '../context/AuthContext';

interface StockItem {
  title: string;
  totalStock: number;
  totalSold: number;
  available: number;
  sellPrice: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stockSummary, setStockSummary] = useState<StockItem[]>([]);
  const [grossIncome, setGrossIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [capital, setCapital] = useState(0);
  const [costOfGoods, setCostOfGoods] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    if (!user) return;

    let listings: any[] = [];
    let sales: any[] = [];

    const computeSummary = () => {
      const stockMap: Record<string, StockItem> = {};

      listings.forEach(l => {
        const title = l.title || 'Unknown';
        if (!stockMap[title]) {
          stockMap[title] = { title, totalStock: 0, totalSold: 0, available: 0, sellPrice: l.sellPrice || '0' };
        }
        stockMap[title].totalStock += parseInt(l.quantity || '0', 10);
        stockMap[title].sellPrice = l.sellPrice || stockMap[title].sellPrice;
      });

      sales.forEach(s => {
        const title = s.listingTitle || 'Unknown';
        if (!stockMap[title]) {
          stockMap[title] = { title, totalStock: 0, totalSold: 0, available: 0, sellPrice: '0' };
        }
        stockMap[title].totalSold += parseInt(s.quantitySold || '0', 10);
      });

      Object.values(stockMap).forEach(item => {
        item.available = Math.max(0, item.totalStock - item.totalSold);
      });

      const items = Object.values(stockMap).sort((a, b) => b.available - a.available);
      setStockSummary(items);
      setTotalAvailable(items.reduce((sum, i) => sum + i.available, 0));

      const revenue = sales.reduce((sum: number, s: any) => sum + (parseFloat(s.totalAmount || '0')), 0);
      setGrossIncome(revenue);

      const cogs = listings.reduce((sum: number, l: any) => sum + (parseFloat(l.boughtFor || '0') * parseInt(l.quantity || '0', 10)), 0);
      setCostOfGoods(cogs);
    };

    const unsubListings = onSnapshot(
      query(collection(db, 'listings'), where('storeId', '==', STORE_ID)),
      (snap) => { listings = snap.docs.map(d => d.data()); computeSummary(); },
      () => {}
    );

    const unsubSales = onSnapshot(
      query(collection(db, 'sales'), where('storeId', '==', STORE_ID)),
      (snap) => { sales = snap.docs.map(d => d.data()); computeSummary(); },
      () => {}
    );

    const unsubExpenses = onSnapshot(
      query(collection(db, 'expenses'), where('storeId', '==', STORE_ID)),
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + parseFloat(d.data().amount || '0'), 0);
        setExpenses(total);
      },
      () => {}
    );

    const unsubCapitals = onSnapshot(
      query(collection(db, 'capitals'), where('storeId', '==', STORE_ID)),
      (snap) => {
        const total = snap.docs.reduce((sum, d) => sum + parseFloat(d.data().amount || '0'), 0);
        setCapital(total);
      },
      () => {}
    );

    return () => { unsubListings(); unsubSales(); unsubExpenses(); unsubCapitals(); };
  }, [user]);

  const netIncome = grossIncome - expenses - capital;
  const cashOnHand = capital + grossIncome - expenses - costOfGoods;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Available Stocks</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>{totalAvailable}</p>
          <p className="text-xs text-muted">units total</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="text-xs text-muted">Items Tracked</p>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>{stockSummary.length}</p>
          <p className="text-xs text-muted">products</p>
        </div>
      </div>

      {/* Cash on Hand */}
      <div className="card mb-2" style={{ background: cashOnHand >= 0 ? '#dbeafe' : '#ffe8e8', textAlign: 'center' }}>
        <p className="text-xs text-muted">Cash on Hand</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: cashOnHand >= 0 ? '#1e40af' : 'var(--sell)' }}>₱ {cashOnHand.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-xs text-muted" style={{ marginTop: 4 }}>Capital + Sales − Expenses − Purchase Cost</p>
      </div>

      {/* Income / Expenses */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Gross Income (Sales)</p>
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

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Capital</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1e40af' }}>₱ {capital.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <span style={{ fontSize: 28 }}>🏦</span>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted">Cost of Goods Purchased</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>₱ {costOfGoods.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <span style={{ fontSize: 28 }}>📦</span>
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

      {/* Per-item stock summary */}
      <h2 className="text-sm font-bold mb-1">Stock Summary (per item)</h2>
      {stockSummary.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <p className="text-xs text-muted">No items yet. Add listings to track your stock.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span className="text-xs font-bold text-muted">Item</span>
            <span className="text-xs font-bold text-muted" style={{ width: 50, textAlign: 'right' }}>Stock</span>
            <span className="text-xs font-bold text-muted" style={{ width: 50, textAlign: 'right' }}>Sold</span>
            <span className="text-xs font-bold text-muted" style={{ width: 60, textAlign: 'right' }}>Available</span>
          </div>
          {stockSummary.map((item, i) => (
            <div key={item.title} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '10px 14px', borderBottom: i < stockSummary.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div>
                <p className="text-sm font-bold">{item.title}</p>
                <p className="text-xs text-muted">₱{parseFloat(item.sellPrice).toFixed(2)}/unit</p>
              </div>
              <span className="text-sm" style={{ width: 50, textAlign: 'right' }}>{item.totalStock}</span>
              <span className="text-sm" style={{ width: 50, textAlign: 'right', color: 'var(--sell)' }}>{item.totalSold}</span>
              <span className="text-sm font-bold" style={{ width: 60, textAlign: 'right', color: item.available > 0 ? 'var(--primary)' : 'var(--sell)' }}>
                {item.available}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
