'use client';

import { useMemo, useState } from 'react';
import { TOP_VIDEOS, LAST_UPDATED } from '../../data';

const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : Math.round(n).toString();
const money = (n) => n >= 1000 ? '$'+(n/1000).toFixed(1)+'K' : '$'+Math.round(n);
const MONTH_NAMES = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'};
function monthLabel(m) { const [y,mo] = m.split('-'); return `${MONTH_NAMES[mo]} '${y.slice(2)}`; }

function Av({ handle, size = 52 }) {
  const h = ((handle.charCodeAt(0)*37+(handle.charCodeAt(1)||0)*13)%360);
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:`hsl(${h},40%,14%)`, border:`2px solid hsl(${h},50%,30%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.28, fontFamily:"'DM Mono',monospace", fontWeight:500, color:`hsl(${h},60%,70%)` }}>
      {handle.replace(/[^a-zA-Z]/g,'').slice(0,2).toUpperCase()}
    </div>
  );
}

function StatCard({ label, value, accent, color='#e8ff57' }) {
  return (
    <div style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:10, padding:'16px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:accent?color:'transparent' }}/>
      <div style={{ fontSize:9, fontFamily:"'DM Mono',monospace", color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8 }}>{label}</div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:24, color:accent?color:'#f0f2f8' }}>{value}</div>
    </div>
  );
}

export default function CreatorPage({ params }) {
  const { handle } = params;
  const [period, setPeriod] = useState('lifetime');

  const creatorVideos = useMemo(() => TOP_VIDEOS.filter(v => v.creator === handle), [handle]);

  const months = useMemo(() => {
    const set = [...new Set(creatorVideos.map(v => v.date.slice(0,7)))].sort();
    return set.map(m => ({ key:m, label:monthLabel(m) }));
  }, [creatorVideos]);

  const { videos, totalGmv, totalSold, totalViews } = useMemo(() => {
    let v = period === 'lifetime' ? creatorVideos : creatorVideos.filter(v => v.date.startsWith(period));
    v = [...v].sort((a,b) => b.gmv - a.gmv);
    return { videos:v, totalGmv:v.reduce((s,x)=>s+x.gmv,0), totalSold:v.reduce((s,x)=>s+x.sold,0), totalViews:v.reduce((s,x)=>s+x.views,0) };
  }, [creatorVideos, period]);

  if (creatorVideos.length === 0) {
    return (
      <div style={{ background:'#0a0b0d', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans',sans-serif", color:'#5a6075', gap:16 }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:'#f0f2f8' }}>@{handle}</div>
        <div style={{ fontSize:13 }}>No videos found for this creator.</div>
        <a href="/" style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'#e8ff57', textDecoration:'none' }}>← Back to leaderboard</a>
      </div>
    );
  }

  return (
    <div style={{ background:'#0a0b0d', minHeight:'100vh', color:'#f0f2f8', fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#0a0b0d;}::-webkit-scrollbar-thumb{background:#1e2129;border-radius:2px;}
        a{text-decoration:none;}
        .vid-row:hover{background:rgba(232,255,87,0.025);}
        .vid-link:hover{color:#e8ff57!important;}
        .pill{background:transparent;border:1px solid #2a2e3a;cursor:pointer;font-family:'DM Mono',monospace;font-size:10px;padding:5px 12px;border-radius:20px;color:#5a6075;transition:all 0.15s;white-space:nowrap;text-transform:uppercase;letter-spacing:0.06em;}
        .pill:hover{color:#f0f2f8;border-color:#5a6075;}
        .pill.active{background:#e8ff57;color:#0a0b0d;border-color:#e8ff57;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.3s ease both;}
      `}</style>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(232,255,87,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.01) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ position:'relative', zIndex:1 }}>
        <header style={{ background:'rgba(10,11,13,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid #1e2129', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <a href="/" style={{ display:'flex', alignItems:'center', gap:8, color:'#5a6075', fontFamily:"'DM Mono',monospace", fontSize:10, textTransform:'uppercase', letterSpacing:'0.08em', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#e8ff57'} onMouseLeave={e=>e.currentTarget.style.color='#5a6075'}>
              ← Leaderboard
            </a>
            <span style={{ color:'#2a2e3a' }}>|</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Av handle={handle} size={28}/>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14 }}>@{handle}</span>
            </div>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#2a2e3a' }}>Updated {LAST_UPDATED}</div>
        </header>

        <div style={{ maxWidth:860, margin:'0 auto', padding:'24px' }}>
          {/* Creator hero */}
          <div className="fade-up" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
            <Av handle={handle} size={52}/>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, marginBottom:2 }}>@{handle}</div>
              <div style={{ fontSize:12, color:'#5a6075' }}>{creatorVideos.length} video{creatorVideos.length!==1?'s':''} · Ruff Liners affiliate</div>
            </div>
          </div>

          {/* Period pills */}
          <div className="fade-up" style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20, alignItems:'center' }}>
            <span style={{ fontSize:10, fontFamily:"'DM Mono',monospace", color:'#5a6075', marginRight:4 }}>Period:</span>
            <button className={`pill ${period==='lifetime'?'active':''}`} onClick={()=>setPeriod('lifetime')}>All Time</button>
            {months.map(m => <button key={m.key} className={`pill ${period===m.key?'active':''}`} onClick={()=>setPeriod(m.key)}>{m.label}</button>)}
          </div>

          {/* Stats */}
          <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
            <StatCard label="GMV" value={money(totalGmv)} accent color="#e8ff57"/>
            <StatCard label="Items Sold" value={fmt(totalSold)}/>
            <StatCard label="Total Views" value={fmt(totalViews)} accent color="#57c4ff"/>
          </div>

          {/* Videos */}
          <div className="fade-up" style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:10, overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e2129', background:'#0f1117', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                Videos <span style={{ color:'#5a6075', fontWeight:400, fontSize:11 }}>({videos.length})</span>
              </span>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075' }}>Sorted by GMV</span>
            </div>
            {/* Table header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'7px 20px', borderBottom:'1px solid #1e2129' }}>
              <div style={{ width:22 }}/>
              <div style={{ flex:1, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Video Link</div>
              <div style={{ width:50, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Date</div>
              <div style={{ display:'flex', gap:20 }}>
                {[['GMV',52],['Views',44],['Sold',28]].map(([h,w])=>(
                  <div key={h} style={{ minWidth:w, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'right' }}>{h}</div>
                ))}
              </div>
            </div>
            {videos.map((v, i) => (
              <div key={v.video_id} className="vid-row" style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:'1px solid rgba(30,33,41,0.5)', transition:'background 0.15s' }}>
                <div style={{ width:22, fontFamily:"'DM Mono',monospace", fontSize:10, color:'#2a2e3a' }}>{i+1}</div>
                <a href={`https://www.tiktok.com/@${v.creator}/video/${v.video_id}`} target="_blank" rel="noopener noreferrer" className="vid-link"
                  style={{ flex:1, display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Mono',monospace", fontSize:11, color:'#57c4ff', transition:'color 0.15s' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  tiktok.com/…{v.video_id.slice(-8)}
                </a>
                <div style={{ width:50, fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075' }}>{v.date.slice(0,7)}</div>
                <div style={{ display:'flex', gap:20 }}>
                  <div style={{ minWidth:52, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, color:'#e8ff57' }}>{money(v.gmv)}</div>
                  <div style={{ minWidth:44, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#57c4ff' }}>{fmt(v.views)}</div>
                  <div style={{ minWidth:28, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#8a8fa0' }}>{v.sold}</div>
                </div>
              </div>
            ))}
            {/* Totals */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', background:'#0f1117', borderTop:'1px solid #1e2129' }}>
              <div style={{ width:22 }}/>
              <div style={{ flex:1, fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.08em' }}>Total</div>
              <div style={{ width:50 }}/>
              <div style={{ display:'flex', gap:20 }}>
                <div style={{ minWidth:52, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, color:'#e8ff57' }}>{money(totalGmv)}</div>
                <div style={{ minWidth:44, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#57c4ff' }}>{fmt(totalViews)}</div>
                <div style={{ minWidth:28, textAlign:'right', fontFamily:"'DM Mono',monospace", fontSize:12, color:'#8a8fa0' }}>{totalSold}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop:20, textAlign:'center', fontSize:9, fontFamily:"'DM Mono',monospace", color:'#1e2129' }}>
            RUFF LINERS · CREATOR PORTAL · {LAST_UPDATED.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
