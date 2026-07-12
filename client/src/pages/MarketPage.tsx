import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';
import { RiceVariety, PricePoint, MarketSummaryItem } from '../types';

const COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#457b9d'];

export default function MarketPage() {
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/market/varieties'), api.get('/market/summary')])
      .then(([v, s]) => {
        setVarieties(v.data);
        setSummary(s.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ days });
    if (selectedVariety) params.set('variety', selectedVariety);
    api.get(`/market/prices?${params}`).then((r) => setHistory(r.data));
  }, [selectedVariety, days]);

  // Group history by date for chart
  const chartData = (() => {
    const byDate: Record<string, Record<string, number>> = {};
    history.forEach((p) => {
      const date = new Date(p.recordedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      if (!byDate[date]) byDate[date] = {};
      byDate[date][p.varietyName] = parseFloat(p.pricePerKg);
    });
    return Object.entries(byDate).map(([date, prices]) => ({ date, ...prices }));
  })();

  const chartVarieties = selectedVariety
    ? [selectedVariety]
    : [...new Set(history.map((h) => h.varietyName))];

  if (loading) return <p className="text-muted">Loading market data…</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Market Overview</h1>

      {/* Summary cards */}
      <div className="grid-3 mb-2">
        {summary.map((item, i) => {
          const change = parseFloat(item.changePct || '0');
          return (
            <div key={item.variety.id} className="card">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">{item.variety.name}</span>
                <span className="text-sm text-muted">{item.openOrders} orders</span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.4rem 0', color: COLORS[i % COLORS.length] }}>
                {item.currentPrice ? `$${parseFloat(item.currentPrice).toFixed(4)}` : '—'}
                <span className="text-sm text-muted" style={{ fontWeight: 400 }}>/kg</span>
              </p>
              {item.changePct && (
                <span className={`badge ${change >= 0 ? 'badge-green' : 'badge-red'}`}>
                  {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}% today
                </span>
              )}
              <p className="text-sm text-muted mt-1">{item.variety.origin}</p>
            </div>
          );
        })}
      </div>

      {/* Price chart */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Price History</h2>
          <div className="flex gap-1">
            <select value={selectedVariety} onChange={(e) => setSelectedVariety(e.target.value)} style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: '0.875rem' }}>
              <option value="">All varieties</option>
              {varieties.map((v) => <option key={v.id} value={v.name}>{v.name}</option>)}
            </select>
            <select value={days} onChange={(e) => setDays(e.target.value)} style={{ padding: '0.35rem 0.6rem', borderRadius: 6, border: '1.5px solid var(--color-border)', fontSize: '0.875rem' }}>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>No price data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(4)}/kg`]} />
              <Legend />
              {chartVarieties.map((v, i) => (
                <Line key={v} type="monotone" dataKey={v} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
