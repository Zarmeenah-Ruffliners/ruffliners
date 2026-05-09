'use client';

import { useState, useMemo } from 'react';
import { TOP_VIDEOS, LAST_UPDATED } from '../data';

const fmt = (n) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : Math.round(n).toString();
const money = (n) => n >= 1000 ? '$'+(n/1000).toFixed(1)+'K' : '$'+Math.round(n);

const allMonths = [...new Set(TOP_VIDEOS.map(v => v.date.slice(0,7)))].sort();
const LAST_MONTH = '2026-04';
const MONTH_NAMES = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'};
function monthLabel(m) { const [y,mo] = m.split('-'); return `${MONTH_NAMES[mo]} ${y}`; }

function topVideos(videos, n = 10) {
  return [...videos].sort((a,b) => b.gmv - a.gmv).slice(0, n);
}

function Av({ handle, size = 32 }) {
  const h = ((handle.charCodeAt(0)*37+(handle.charCodeAt(1)||0)*13)%360);
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, background:`hsl(${h},40%,14%)`, border:`1.5px solid hsl(${h},45%,28%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.28, fontFamily:"'DM Mono',monospace", fontWeight:500, color:`hsl(${h},55%,65%)` }}>
      {handle.replace(/[^a-zA-Z]/g,'').slice(0,2).toUpperCase()}
    </div>
  );
}

function VideoRow({ rank, video, showMonth }) {
  const [hov, setHov] = useState(false);
  const rankColor = rank === 1 ? '#FFD700' : rank === 2 ? '#C0C7D0' : rank === 3 ? '#CD7F32' : '#2a2e3a';
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:'1px solid rgba(30,33,41,0.5)', background: hov?'rgba(232,255,87,0.02)':'transparent', transition:'background 0.15s' }}>
      <div style={{ width:22, flexShrink:0, fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:rankColor, textAlign:'center' }}>{rank}</div>

      <a href={`/creator/${video.creator}`} style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', width:170, flexShrink:0 }}>
        <Av handle={video.creator}/>
        <span style={{ fontSize:11, fontWeight:500, color:hov?'#e8ff57':'#b0b4c0', transition:'color 0.15s', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:110 }}>@{video.creator}</span>
      </a>

      <a href={`https://www.tiktok.com/@${video.creator}/video/${video.video_id}`} target="_blank" rel="noopener noreferrer"
        style={{ flex:1, display:'flex', alignItems:'center', gap:5, fontFamily:"'DM Mono',monospace", fontSize:10, color:'#2a3a4a', textDecoration:'none' }}
        onMouseEnter={e=>e.currentTarget.style.color='#57c4ff'} onMouseLeave={e=>e.currentTarget.style.color='#2a3a4a'}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        …{video.video_id.slice(-8)}
      </a>

      {showMonth && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075', flexShrink:0, width:44 }}>{video.date.slice(0,7)}</div>}

      <div style={{ display:'flex', gap:20, flexShrink:0, alignItems:'center' }}>
        <div style={{ textAlign:'right', minWidth:52 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:500, color:'#e8ff57' }}>{money(video.gmv)}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.07em' }}>GMV</div>
        </div>
        <div style={{ textAlign:'right', minWidth:44 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'#57c4ff' }}>{fmt(video.views)}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.07em' }}>Views</div>
        </div>
        <div style={{ textAlign:'right', minWidth:28 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:'#8a8fa0' }}>{video.sold}</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#5a6075', textTransform:'uppercase', letterSpacing:'0.07em' }}>Sold</div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, badge, videos, showMonth }) {
  return (
    <div style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:12, overflow:'hidden', marginBottom:20 }}>
      <div style={{ padding:'14px 20px', borderBottom:'1px solid #1e2129', display:'flex', alignItems:'center', gap:10, background:'#0f1117' }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em' }}>{title}</span>
        {badge && <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#e8ff57', border:'1px solid rgba(232,255,87,0.25)', background:'rgba(232,255,87,0.06)', padding:'2px 8px', borderRadius:10 }}>{badge}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'7px 20px', borderBottom:'1px solid #1e2129' }}>
        <div style={{ width:22 }}/>
        <div style={{ width:170, flexShrink:0, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Creator</div>
        <div style={{ flex:1, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Video</div>
        {showMonth && <div style={{ width:44, fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em' }}>Date</div>}
        <div style={{ display:'flex', gap:20, flexShrink:0 }}>
          {[['GMV',52],['Views',44],['Sold',28]].map(([h,w]) => (
            <div key={h} style={{ fontFamily:"'DM Mono',monospace", fontSize:8, color:'#2a2e3a', textTransform:'uppercase', letterSpacing:'0.1em', minWidth:w, textAlign:'right' }}>{h}</div>
          ))}
        </div>
      </div>
      {videos.length === 0
        ? <div style={{ padding:'28px 20px', textAlign:'center', color:'#5a6075', fontSize:12 }}>No data yet for this period.</div>
        : videos.map((v,i) => <VideoRow key={v.video_id} rank={i+1} video={v} showMonth={showMonth}/>)
      }
    </div>
  );
}

export default function PublicLeaderboard() {
  const allTime   = useMemo(() => topVideos(TOP_VIDEOS, 10), []);
  const lastMonth = useMemo(() => topVideos(TOP_VIDEOS.filter(v => v.date.startsWith(LAST_MONTH)), 10), []);

  return (
    <div style={{ background:'#0a0b0d', minHeight:'100vh', color:'#f0f2f8', fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#0a0b0d;}::-webkit-scrollbar-thumb{background:#1e2129;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.35s ease both;}
      `}</style>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(232,255,87,0.01) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.01) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ position:'relative', zIndex:1 }}>
        <header style={{ background:'rgba(10,11,13,0.95)', backdropFilter:'blur(16px)', borderBottom:'1px solid #1e2129', padding:'13px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:28, height:28, background:'#e8ff57', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, letterSpacing:'0.07em', textTransform:'uppercase' }}>Ruff Liners</span>
            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#5a6075', background:'#1e2129', padding:'2px 8px', borderRadius:20, letterSpacing:'0.06em' }}>Top Content</span>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'#2a2e3a' }}>Updated {LAST_UPDATED}</div>
        </header>

        <div style={{ maxWidth:860, margin:'0 auto', padding:'28px 24px' }}>
          <div className="fade-up" style={{ marginBottom:24 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, marginBottom:5 }}>What's Working 🐾</div>
            <div style={{ fontSize:12, color:'#5a6075' }}>Top Ruff Liners videos by GMV. Click any creator name to see their full stats.</div>
          </div>
          <div className="fade-up">
            <Section title="All Time" badge="Top 10 by GMV" videos={allTime} showMonth={true}/>
            <Section title={monthLabel(LAST_MONTH)} badge="Last Month" videos={lastMonth} showMonth={false}/>
          </div>
          <div style={{ marginTop:20, textAlign:'center', fontSize:9, fontFamily:"'DM Mono',monospace", color:'#1e2129' }}>
            RUFF LINERS · TIKTOK SHOP · {LAST_UPDATED.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
