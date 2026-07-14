import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../lib/api';
import { RiceVariety, PricePoint, MarketSummaryItem } from '../types';

const COLORS = ['#2d6a4f', '#52b788', '#f4a261', '#e76f51', '#457b9d'];

export default function MarketPage() {
  const [varieties, setVarieties] = useState<RiceVariety[]>([]);
  const [summary, setSummary] = useState<MarketSummaryItem[]>([]);
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [selectedVariety, setSelectedVariety] = useState('');
  const [days, setDays] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/market/varieties'), api.get('/market/summary')])
      .then(([v, s]) => { setVarieties(v.data); setSummary(s.data); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ days });
    if (selectedVariety) params.set('variety', selectedVariety);
    api.get(`/market/prices?${params}`).then(r => setHistory(r.data));
  }, [selectedVariety, days]);

  const chartData = (() => {
    const byDate: Record<string, Record<string, number>> = {};
    history.forEach(p => {
      const d = new Date(p.recordedAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
      if (!byDate[d]) byDate[d] = {};
      byDate[d][p.varietyName] = parseFloat(p.pricePerKg);
    });
    return Object.entries(byDate).map(([date, prices]) => ({ date, ...prices }));
  })();

  const chartVarieties = selectedVariety ? [selectedVariety] : [...new Set(history.map(h => h.varietyName))];

  if (loading) return <p className="text-muted text-center mt-2">Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Market</h1>

      {/* Summary */}
      {summary.map((item, i) => {
        const pct = parseFloat(item.changePct ?? '0');
        const up = pct >= 0;
        return (
          <div key={item.variety.id} className="card mb-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700 }}>{item.variety.name}</p>
              <p className="text-xs text-muted">{item.variety.origin} · {item.openOrders} orders</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: COLORS[i % COLORS.length] }}>{item.currentPrice ? `$${parseFloat(item.currentPrice).toFixed(4)}` : '—'}</p>
              {item.changePct && <span className={`badge ${up ? 'badge-green' : 'badge-red'}`}>{up ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%</span>}
            </div>
          </div>
        );
      })}

      {/* Chart */}
      <div className="card mt-2">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-bold">Price History</h2>
          <div className="flex gap-1">
            <select value={selectedVariety} onChange={e => setSelectedVariety(e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
              <option value="">All</option>
              {varieties.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
            </select>
            <select value={days} onChange={e => setDays(e.target.value)} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12 }}>
              {['7', '14', '30', '90'].map(d => <option key={d} value={d}>{d}d</option>)}
            </select>
          </div>
        </div>
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${v.toFixed(2)}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(4)}/kg`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {chartVarieties.map((v, i) => (
                <Line key={v} type="monotone" dataKey={v} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted text-center" style={{ padding: 32 }}>No price data</p>
        )}
      </div>
    </div>
  );
}
