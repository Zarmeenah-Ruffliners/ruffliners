'use client';

import { useState, useMemo, useEffect } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, d = 1) =>
  n == null ? '—' : n >= 1000000 ? (n / 1000000).toFixed(d) + 'M' : n >= 1000 ? (n / 1000).toFixed(d) + 'K' : Math.round(n).toString();
const money = (n) =>
  n == null ? '—' : n >= 1000 ? '$' + (n / 1000).toFixed(1) + 'K' : '$' + n.toFixed(0);

const QUARTER_MAP = { '01': 'Q1', '02': 'Q1', '03': 'Q1', '04': 'Q2', '05': 'Q2', '06': 'Q2', '07': 'Q3', '08': 'Q3', '09': 'Q3', '10': 'Q4', '11': 'Q4', '12': 'Q4' };
const MONTH_NAMES = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' };

function getYearQuarter(m) {
  const [y, mo] = m.split('-');
  return `${y}-${QUARTER_MAP[mo]}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Spark({ values, color = '#e8ff57', width = 80, height = 32 }) {
  if (!values?.length || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  const lastPt = pts.split(' ').at(-1).split(',');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="2.5" fill={color} />
    </svg>
  );
}

function KpiCard({ label, value, sub, sparkValues, accent, color = '#e8ff57' }) {
  return (
    <div style={{ background: '#13161e', border: '1px solid #1e2129', borderRadius: 10, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent ? color : 'transparent' }} />
      <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#5a6075', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1, color: accent ? color : '#f0f2f8', marginBottom: 4 }}>{value}</div>
          {sub && <div style={{ fontSize: 10, color: '#5a6075' }}>{sub}</div>}
        </div>
        {sparkValues && <Spark values={sparkValues} color={accent ? color : '#2a2e3a'} />}
      </div>
    </div>
  );
}

function MiniBarChart({ data, labelKey, valueKey, color = '#e8ff57', height = 160 }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, paddingTop: 8 }}>
      {data.map((d, i) => {
        const h = Math.max(4, (d[valueKey] / max) * (height - 20));
        return (
          <div key={i} title={`${d[labelKey]}: ${d[valueKey].toLocaleString()}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: h, background: color, borderRadius: '3px 3px 0 0', opacity: 0.4 + 0.6 * (d[valueKey] / max) }} />
            <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: '#5a6075', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: 36 }}>{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function Av({ handle }) {
  const h = ((handle.charCodeAt(0) * 37 + (handle.charCodeAt(1) || 0) * 13) % 360);
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: `hsl(${h},35%,18%)`, border: `1px solid hsl(${h},40%,28%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: "'DM Mono',monospace", color: `hsl(${h},55%,65%)` }}>
      {handle.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen({ message }) {
  return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: "'DM Mono',monospace" }}>
      <style>{`@keyframes pulse{0%,100%{opacity:0.15;transform:scaleY(0.4)}50%{opacity:1;transform:scaleY(1)}}`}</style>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 4, height: 28, background: '#e8ff57', borderRadius: 2, animation: 'pulse 1.1s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <div style={{ color: '#5a6075', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{message}</div>
      <div style={{ color: '#2a2e3a', fontSize: 9, letterSpacing: '0.08em' }}>Ruff Liners · Euka · TikTok Shop</div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadMsg, setLoadMsg] = useState('Connecting to Euka…');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [videoSort, setVideoSort] = useState('gmv');
  const [videoSearch, setVideoSearch] = useState('');
  const [tabGroup, setTabGroup] = useState('quarters');

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    const msgs = ['Connecting to Euka…', 'Querying store data…', 'Crunching numbers…', 'Building dashboard…'];
    let i = 0;
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setLoadMsg(msgs[i]); }, 2200);

    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setRawData(d);
        setLastUpdated(new Date());
        setLoading(false);
        clearInterval(interval);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
        clearInterval(interval);
      });

    return () => clearInterval(interval);
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const { monthsWithData, quarters, quarterTabs, monthTabs, allTabs, chartMonths } = useMemo(() => {
    if (!rawData) return { monthsWithData: [], quarters: [], quarterTabs: [], monthTabs: [], allTabs: [], chartMonths: [] };

    const monthsWithData = (rawData.monthly || []).filter((m) => m.gmv > 0 || m.videos > 0);

    const qMap = {};
    monthsWithData.forEach((m) => {
      const q = getYearQuarter(m.month);
      if (!qMap[q]) qMap[q] = [];
      qMap[q].push(m);
    });

    const quarters = Object.entries(qMap).map(([key, months]) => ({
      key,
      label: key.replace('-', ' '),
      months,
      gmv: months.reduce((s, m) => s + m.gmv, 0),
      sold: months.reduce((s, m) => s + m.sold, 0),
      views: months.reduce((s, m) => s + m.views, 0),
      videos: months.reduce((s, m) => s + m.videos, 0),
      creators: Math.max(...months.map((m) => m.creators)),
      samples: months.reduce((s, m) => s + m.samples, 0),
      messages: months.reduce((s, m) => s + m.messages, 0),
    }));

    const quarterTabs = quarters.map((q) => ({ key: q.key, label: q.label, type: 'quarter', data: q }));
    const monthTabs = monthsWithData.map((m) => {
      const [y, mo] = m.month.split('-');
      return { key: m.month, label: `${MONTH_NAMES[mo]} '${y.slice(2)}`, type: 'month', data: m };
    });

    const allTabs = [{ key: 'all', label: 'All Time', type: 'all' }, ...quarterTabs, ...monthTabs];

    const chartMonths = monthsWithData
      .filter((m) => m.gmv > 100)
      .map((m) => { const [, mo] = m.month.split('-'); return { label: MONTH_NAMES[mo], gmv: m.gmv, views: m.views, videos: m.videos }; });

    return { monthsWithData, quarters, quarterTabs, monthTabs, allTabs, chartMonths };
  }, [rawData]);

  const tab = useMemo(() => allTabs.find((t) => t.key === activeTab) || allTabs[0], [allTabs, activeTab]);

  const agg = useMemo(() => {
    if (!tab) return null;
    if (tab.type === 'month' || tab.type === 'quarter') return tab.data;
    if (tab.type === 'all') return {
      gmv: monthsWithData.reduce((s, m) => s + m.gmv, 0),
      sold: monthsWithData.reduce((s, m) => s + m.sold, 0),
      views: monthsWithData.reduce((s, m) => s + m.views, 0),
      videos: monthsWithData.reduce((s, m) => s + m.videos, 0),
      creators: Math.max(...(monthsWithData.map((m) => m.creators).filter(Boolean)), 0),
      samples: monthsWithData.reduce((s, m) => s + m.samples, 0),
      messages: monthsWithData.reduce((s, m) => s + m.messages, 0),
    };
    return null;
  }, [tab, monthsWithData]);

  const videos = useMemo(() => {
    if (!rawData || !tab) return [];
    let v = rawData.topVideos || [];

    if (tab.type === 'month') {
      const [y, mo] = tab.key.split('-');
      v = v.filter((x) => x.date?.startsWith(`${y}-${mo}`));
    } else if (tab.type === 'quarter') {
      const [y, q] = tab.key.split('-');
      const qMonths = Object.entries(QUARTER_MAP).filter(([, val]) => val === q).map(([k]) => k);
      v = v.filter((x) => { const [vy, vm] = (x.date || '').split('-'); return vy === y && qMonths.includes(vm); });
    }

    if (videoSearch) v = v.filter((x) => x.creator?.toLowerCase().includes(videoSearch.toLowerCase()));
    return [...v].sort((a, b) => b[videoSort] - a[videoSort]);
  }, [rawData, tab, videoSort, videoSearch]);

  const topCreators = useMemo(() => {
    const map = {};
    videos.forEach((v) => {
      if (!map[v.creator]) map[v.creator] = { creator: v.creator, gmv: 0, sold: 0, views: 0, count: 0 };
      map[v.creator].gmv += v.gmv;
      map[v.creator].sold += v.sold;
      map[v.creator].views += v.views;
      map[v.creator].count += 1;
    });
    return Object.values(map).sort((a, b) => b.gmv - a.gmv);
  }, [videos]);

  const gmvSpark = monthsWithData.map((m) => m.gmv);
  const viewsSpark = monthsWithData.map((m) => m.views);
  const videosSpark = monthsWithData.map((m) => m.videos);
  const creatorsSpark = monthsWithData.map((m) => m.creators);

  // ── Render states ───────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen message={loadMsg} />;

  if (error) return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", color: '#ff6b6b', fontSize: 13, padding: 40, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 10, color: '#5a6075', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Error loading dashboard</div>
        <div>{error}</div>
        <div style={{ marginTop: 16, fontSize: 10, color: '#3a3e4a' }}>Check that ANTHROPIC_API_KEY is set in your environment variables.</div>
      </div>
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0a0b0d', minHeight: '100vh', color: '#f0f2f8', fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#0a0b0d;}
        ::-webkit-scrollbar-thumb{background:#1e2129;border-radius:2px;}
        a{color:inherit;text-decoration:none;}
        .tab-btn{background:transparent;border:none;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.06em;padding:5px 12px;border-radius:20px;text-transform:uppercase;transition:all 0.15s;white-space:nowrap;}
        .tab-btn:hover{color:#f0f2f8;}
        .tab-btn.active{background:#e8ff57;color:#0a0b0d;}
        .tab-btn.inactive{color:#5a6075;}
        .row-hover:hover td,.row-hover:hover{background:rgba(232,255,87,0.025);}
        .vid-link:hover{color:#e8ff57!important;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.35s ease both;}
      `}</style>

      {/* Grid texture */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(232,255,87,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.01) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <header style={{ background: 'rgba(10,11,13,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #1e2129', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: '#e8ff57', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
            </div>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Ruff Liners</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#5a6075', background: '#1e2129', padding: '2px 8px', borderRadius: 20, letterSpacing: '0.08em' }}>EUKA · TikTok Shop</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {lastUpdated && (
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#3a3e4a' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => { setLoading(true); setError(null); fetch('/api/dashboard').then(r => r.json()).then(d => { if (d.error) throw new Error(d.error); setRawData(d); setLastUpdated(new Date()); setLoading(false); }).catch(e => { setError(e.message); setLoading(false); }); }}
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#e8ff57', border: '1px solid rgba(232,255,87,0.3)', background: 'transparent', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
            >↻ Refresh</button>
          </div>
        </header>

        {/* Tab navigation */}
        <div style={{ borderBottom: '1px solid #1e2129', background: 'rgba(10,11,13,0.9)', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', position: 'sticky', top: 52, zIndex: 40 }}>
          <div style={{ display: 'flex', gap: 2, marginRight: 16, flexShrink: 0, borderRight: '1px solid #1e2129', paddingRight: 16 }}>
            {['all', 'quarters', 'months'].map((g) => (
              <button key={g} onClick={() => {
                setTabGroup(g);
                if (g === 'all') setActiveTab('all');
                else if (g === 'quarters' && quarterTabs[0]) setActiveTab(quarterTabs[0].key);
                else if (g === 'months' && monthTabs.length) setActiveTab(monthTabs[monthTabs.length - 1].key);
              }} style={{ background: tabGroup === g ? '#1e2129' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 9, color: tabGroup === g ? '#e8ff57' : '#5a6075', padding: '14px 10px', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: tabGroup === g ? '2px solid #e8ff57' : '2px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>{g}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {tabGroup === 'all' && <button className={`tab-btn ${activeTab === 'all' ? 'active' : 'inactive'}`} onClick={() => setActiveTab('all')}>All Time</button>}
            {tabGroup === 'quarters' && quarterTabs.map((t) => <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : 'inactive'}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
            {tabGroup === 'months' && monthTabs.map((t) => <button key={t.key} className={`tab-btn ${activeTab === t.key ? 'active' : 'inactive'}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>)}
          </div>
        </div>

        <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
          {/* KPI Cards */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 18 }}>
            <KpiCard label="GMV" value={money(agg?.gmv)} sub="total revenue" sparkValues={tab?.type === 'all' ? gmvSpark : null} accent color="#e8ff57" />
            <KpiCard label="Items Sold" value={fmt(agg?.sold)} sub="units" />
            <KpiCard label="Video Views" value={fmt(agg?.views)} sub="total" sparkValues={tab?.type === 'all' ? viewsSpark : null} accent color="#57c4ff" />
            <KpiCard label="Videos Posted" value={fmt(agg?.videos)} sub="creator videos" sparkValues={tab?.type === 'all' ? videosSpark : null} />
            <KpiCard label="Active Creators" value={fmt(agg?.creators)} sub="unique" sparkValues={tab?.type === 'all' ? creatorsSpark : null} accent color="#b4ff8e" />
            <KpiCard label="Sample Requests" value={fmt(agg?.samples)} sub="seeding" />
            <KpiCard label="GMV / Video" value={agg?.videos ? money(agg.gmv / agg.videos) : '—'} sub="avg per video" accent color="#ffb347" />
          </div>

          {/* Charts — All Time only */}
          {tab?.type === 'all' && (
            <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 18 }}>
              <div style={{ background: '#13161e', border: '1px solid #1e2129', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monthly GMV</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#5a6075' }}>All time</span>
                </div>
                <MiniBarChart data={chartMonths} labelKey="label" valueKey="gmv" color="#e8ff57" height={160} />
              </div>
              <div style={{ background: '#13161e', border: '1px solid #1e2129', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>By Quarter</span>
                </div>
                {quarters.map((q) => {
                  const maxQ = Math.max(...quarters.map((x) => x.gmv), 1);
                  const w = Math.max(4, (q.gmv / maxQ) * 100);
                  return (
                    <div key={q.key} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#5a6075', textTransform: 'uppercase' }}>{q.label}</span>
                        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#e8ff57' }}>{money(q.gmv)}</span>
                      </div>
                      <div style={{ height: 6, background: '#1e2129', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: w + '%', background: 'linear-gradient(90deg,rgba(232,255,87,0.5),rgba(232,255,87,0.9))', borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom: Creators + Videos */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            {/* Top Creators */}
            <div style={{ background: '#13161e', border: '1px solid #1e2129', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', height: 540 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Creators</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#5a6075' }}>{topCreators.length} · by GMV</span>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {topCreators.length === 0 && <div style={{ color: '#5a6075', fontSize: 12, padding: '20px 0', textAlign: 'center' }}>No data for this period.</div>}
                {topCreators.map((c, i) => {
                  const maxGmv = topCreators[0]?.gmv || 1;
                  const w = Math.max(4, (c.gmv / maxGmv) * 100);
                  return (
                    <div key={c.creator} style={{ padding: '8px 4px', borderBottom: '1px solid rgba(30,33,41,0.5)', cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: i === 0 ? '#FFD700' : '#3a3e4a', width: 14, flexShrink: 0 }}>#{i + 1}</span>
                        <Av handle={c.creator} />
                        <span style={{ fontSize: 11, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{c.creator}</span>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#e8ff57', flexShrink: 0 }}>{money(c.gmv)}</span>
                      </div>
                      <div style={{ paddingLeft: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 3, background: '#1e2129', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: w + '%', background: 'rgba(232,255,87,0.5)', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#5a6075', flexShrink: 0 }}>{c.count} vid{c.count !== 1 ? 's' : ''} · {fmt(c.views)} views</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Videos */}
            <div style={{ background: '#13161e', border: '1px solid #1e2129', borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', height: 540 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexShrink: 0 }}>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Top Videos <span style={{ color: '#5a6075', fontWeight: 400 }}>({videos.length})</span>
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input placeholder="creator..." value={videoSearch} onChange={(e) => setVideoSearch(e.target.value)} style={{ background: '#1e2129', border: '1px solid #2a2e3a', borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: "'DM Mono',monospace", color: '#f0f2f8', outline: 'none', width: 100 }} />
                  {['gmv', 'views', 'sold'].map((s) => (
                    <button key={s} onClick={() => setVideoSort(s)} style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid', background: videoSort === s ? '#e8ff57' : 'transparent', color: videoSort === s ? '#0a0b0d' : '#5a6075', borderColor: videoSort === s ? '#e8ff57' : '#2a2e3a' }}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#13161e', zIndex: 2 }}>
                    <tr>
                      {['#', 'Creator', 'Video', 'Date', 'GMV', 'Sold', 'Views'].map((h) => (
                        <th key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#5a6075', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'left', padding: '0 6px 10px', borderBottom: '1px solid #1e2129', fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {videos.length === 0 && <tr><td colSpan={7} style={{ padding: '24px 0', color: '#5a6075', fontSize: 12, textAlign: 'center' }}>No videos for this period.</td></tr>}
                    {videos.map((v, i) => (
                      <tr key={v.video_id} className="row-hover" style={{ borderBottom: '1px solid rgba(30,33,41,0.4)' }}>
                        <td style={{ padding: '8px 6px', fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#3a3e4a' }}>{i + 1}</td>
                        <td style={{ padding: '8px 6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Av handle={v.creator} />
                            <span style={{ fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 110 }}>@{v.creator}</span>
                          </div>
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <a href={`https://www.tiktok.com/@${v.creator}/video/${v.video_id}`} target="_blank" rel="noopener noreferrer" className="vid-link" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#57c4ff', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                            {v.video_id?.slice(-8)}
                          </a>
                        </td>
                        <td style={{ padding: '8px 6px', fontFamily: "'DM Mono',monospace", fontSize: 9, color: '#5a6075', whiteSpace: 'nowrap' }}>{v.date?.slice(0, 7)}</td>
                        <td style={{ padding: '8px 6px', fontFamily: "'DM Mono',monospace", fontSize: 11, color: '#e8ff57', fontWeight: 500 }}>{money(v.gmv)}</td>
                        <td style={{ padding: '8px 6px', fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#8a8fa0' }}>{v.sold}</td>
                        <td style={{ padding: '8px 6px', fontFamily: "'DM Mono',monospace", fontSize: 10, color: '#57c4ff' }}>{fmt(v.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 9, fontFamily: "'DM Mono',monospace", color: '#1e2129', letterSpacing: '0.08em' }}>
            RUFF LINERS · EUKA · TIKTOK SHOP AFFILIATE · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
