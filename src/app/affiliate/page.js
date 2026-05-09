'use client';

import { useState, useMemo } from 'react';
import { TOP_VIDEOS, MONTHLY_DATA, LAST_UPDATED } from '../data';

const MONTH_NAMES = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'};
const QUARTER_MAP = {'01':'Q1','02':'Q1','03':'Q1','04':'Q2','05':'Q2','06':'Q2','07':'Q3','08':'Q3','09':'Q3','10':'Q4','11':'Q4','12':'Q4'};

const fmt = (n) => n == null ? '—' : n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : Math.round(n).toString();
const money = (n) => n == null ? '—' : n >= 1000 ? '$'+(n/1000).toFixed(1)+'K' : '$'+n.toFixed(0);

// All unique creators from video data
const ALL_CREATORS = [...new Set(TOP_VIDEOS.map(v => v.creator))].sort();

// Build per-creator monthly data from videos
function getCreatorMonthly(creator) {
  const map = {};
  TOP_VIDEOS.filter(v => v.creator === creator).forEach(v => {
    const mo = v.date.slice(0, 7);
    if (!map[mo]) map[mo] = { month: mo, gmv: 0, sold: 0, views: 0, videos: [] };
    map[mo].gmv   += v.gmv;
    map[mo].sold  += v.sold;
    map[mo].views += v.views;
    map[mo].videos.push(v);
  });
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

function getMonthLabel(m) {
  const [y, mo] = m.split('-');
  return `${MONTH_NAMES[mo]} '${y.slice(2)}`;
}

function TikTokIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  );
}

function Av({ handle, size = 40 }) {
  const h = ((handle.charCodeAt(0)*37 + (handle.charCodeAt(1)||0)*13) % 360);
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:`hsl(${h},40%,15%)`, border:`2px solid hsl(${h},50%,30%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.28, fontFamily:"'DM Mono',monospace", fontWeight:500, color:`hsl(${h},60%,70%)` }}>
      {handle.replace(/[^a-zA-Z]/g,'').slice(0,2).toUpperCase()}
    </div>
  );
}

// ── Login screen ──────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit() {
    const clean = input.trim().replace(/^@/, '').toLowerCase();
    const match = ALL_CREATORS.find(c => c.toLowerCase() === clean);
    if (match) { onLogin(match); }
    else { setError(true); setTimeout(() => setError(false), 2000); }
  }

  return (
    <div style={{ background:'#0a0b0d', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(232,255,87,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.012) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400, textAlign:'center' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:40 }}>
          <div style={{ width:32, height:32, background:'#e8ff57', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, letterSpacing:'0.07em', textTransform:'uppercase', color:'#f0f2f8' }}>Ruff Liners</span>
        </div>

        <div style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:14, padding:'32px 28px' }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:18, color:'#f0f2f8', marginBottom:8 }}>Creator Portal</div>
          <div style={{ fontSize:13, color:'#5a6075', marginBottom:28, lineHeight:1.5 }}>Enter your TikTok handle to view your performance stats.</div>

          <div style={{ position:'relative', marginBottom:16 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#5a6075', fontFamily:"'DM Mono',monospace", fontSize:14 }}>@</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your_handle"
              style={{ width:'100%', background:'#0a0b0d', border:`1px solid ${error ? '#ff6b6b' : '#2a2e3a'}`, borderRadius:8, padding:'12px 14px 12px 30px', fontSize:14, fontFamily:"'DM Mono',monospace", color:'#f0f2f8', outline:'none', transition:'border-color 0.15s' }}
            />
          </div>

          {error && <div style={{ color:'#ff6b6b', fontSize:12, marginBottom:12, fontFamily:"'DM Mono',monospace" }}>Handle not found. Check spelling and try again.</div>}

          <button onClick={handleSubmit} style={{ width:'100%', background:'#e8ff57', color:'#0a0b0d', border:'none', borderRadius:8, padding:'12px', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'0.05em', cursor:'pointer', textTransform:'uppercase' }}>
            View My Stats
          </button>
        </div>

        <div style={{ marginTop:16, fontSize:11, fontFamily:"'DM Mono',monospace", color:'#2a2e3a' }}>
          Data as of {LAST_UPDATED}
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent, color='#e8ff57' }) {
  return (
    <div style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:10, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: accent ? color : 'transparent' }} />
      <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, color: accent ? color : '#f0f2f8' }}>{value}</div>
    </div>
  );
}

// ── Main affiliate dashboard ───────────────────────────────────────────────────
function AffiliateDashboard({ creator, onLogout }) {
  const [period, setPeriod] = useState('lifetime');

  const creatorVideos = useMemo(() => TOP_VIDEOS.filter(v => v.creator === creator), [creator]);
  const monthly = useMemo(() => getCreatorMonthly(creator), [creator]);

  // Available months
  const months = monthly.map(m => ({ key: m.month, label: getMonthLabel(m.month) }));

  // Filtered videos + stats
  const { videos, totalGmv, totalSold, totalViews } = useMemo(() => {
    let videos = creatorVideos;
    if (period !== 'lifetime') {
      videos = creatorVideos.filter(v => v.date.startsWith(period));
    }
    videos = [...videos].sort((a, b) => b.gmv - a.gmv);
    return {
      videos,
      totalGmv:   videos.reduce((s, v) => s + v.gmv, 0),
      totalSold:  videos.reduce((s, v) => s + v.sold, 0),
      totalViews: videos.reduce((s, v) => s + v.views, 0),
    };
  }, [creatorVideos, period]);

  const periodLabel = period === 'lifetime' ? 'All Time' : getMonthLabel(period);

  return (
    <div style={{ background:'#0a0b0d', minHeight:'100vh', color:'#f0f2f8', fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#0a0b0d;}::-webkit-scrollbar-thumb{background:#1e2129;border-radius:2px;}
        a{color:inherit;text-decoration:none;}
        .vid-row:hover{background:rgba(232,255,87,0.025);}
        .vid-link:hover{color:#e8ff57!important;}
        .period-btn{background:transparent;border:1px solid #2a2e3a;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;padding:5px 12px;border-radius:20px;color:#5a6075;transition:all 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.06em;}
        .period-btn:hover{color:#f0f2f8;border-color:#5a6075;}
        .period-btn.active{background:#e8ff57;color:#0a0b0d;border-color:#e8ff57;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.3s ease both;}
      `}</style>

      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(232,255,87,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.01) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }} />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* Header */}
        <header style={{ background:'rgba(10,11,13,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid #1e2129', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:26, height:26, background:'#e8ff57', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Av handle={creator} size={30} />
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, letterSpacing:'0.04em' }}>@{creator}</div>
                <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:'#5a6075', letterSpacing:'0.08em' }}>RUFF LINERS · CREATOR PORTAL</div>
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075', background:'transparent', border:'1px solid #2a2e3a', padding:'4px 12px', borderRadius:20, cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>← Switch</button>
        </header>

        <div style={{ padding:'20px 24px', maxWidth:900, margin:'0 auto' }}>

          {/* Period selector */}
          <div className="fade-up" style={{ display:'flex', gap:6, alignItems:'center', marginBottom:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:'#5a6075', marginRight:4 }}>Period:</span>
            <button className={`period-btn ${period==='lifetime'?'active':''}`} onClick={()=>setPeriod('lifetime')}>All Time</button>
            {months.map(m => (
              <button key={m.key} className={`period-btn ${period===m.key?'active':''}`} onClick={()=>setPeriod(m.key)}>{m.label}</button>
            ))}
          </div>

          {/* Stat cards */}
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
            <StatCard label="GMV" value={money(totalGmv)} accent color="#e8ff57"/>
            <StatCard label="Items Sold" value={fmt(totalSold)}/>
            <StatCard label="Total Views" value={fmt(totalViews)} accent color="#57c4ff"/>
          </div>

          {/* Videos table */}
          <div className="fade-up" style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #1e2129', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Videos <span style={{ color:'#5a6075', fontWeight:400, fontSize:11 }}>({videos.length})</span>
              </span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:'#5a6075' }}>{periodLabel} · sorted by GMV</span>
            </div>

            {videos.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'#5a6075', fontSize:13 }}>No videos for this period.</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#0f1117' }}>
                    {['#', 'Video', 'Date', 'GMV', 'Sold', 'Views'].map(h => (
                      <th key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'left', padding:'10px 16px', borderBottom:'1px solid #1e2129', fontWeight:400, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {videos.map((v, i) => (
                    <tr key={v.video_id} className="vid-row" style={{ borderBottom:'1px solid rgba(30,33,41,0.5)' }}>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:10, color:'#3a3e4a', width:32 }}>{i+1}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <a href={`https://www.tiktok.com/@${v.creator}/video/${v.video_id}`} target="_blank" rel="noopener noreferrer" className="vid-link"
                          style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#57c4ff', display:'flex', alignItems:'center', gap:5, transition:'color 0.15s' }}>
                          <TikTokIcon/>
                          tiktok.com/…{v.video_id.slice(-8)}
                        </a>
                      </td>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:10, color:'#5a6075', whiteSpace:'nowrap' }}>{v.date.slice(0,7)}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#e8ff57', fontWeight:500 }}>{money(v.gmv)}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#8a8fa0' }}>{v.sold}</td>
                      <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#57c4ff' }}>{fmt(v.views)}</td>
                    </tr>
                  ))}
                </tbody>
                {/* Totals row */}
                <tfoot>
                  <tr style={{ background:'#0f1117', borderTop:'1px solid #1e2129' }}>
                    <td colSpan={3} style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:10, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.08em' }}>Total</td>
                    <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#e8ff57', fontWeight:500 }}>{money(totalGmv)}</td>
                    <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#8a8fa0' }}>{totalSold}</td>
                    <td style={{ padding:'12px 16px', fontFamily:"'DM Mono',monospace", fontSize:11, color:'#57c4ff' }}>{fmt(totalViews)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          <div style={{ marginTop:20, textAlign:'center', fontSize:9, fontFamily:"'DM Mono',monospace", color:'#1e2129', letterSpacing:'0.08em' }}>
            RUFF LINERS · CREATOR PORTAL · DATA AS OF {LAST_UPDATED.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AffiliatePage() {
  const [creator, setCreator] = useState(null);
  if (!creator) return <Login onLogin={setCreator} />;
  return <AffiliateDashboard creator={creator} onLogout={() => setCreator(null)} />;
}
