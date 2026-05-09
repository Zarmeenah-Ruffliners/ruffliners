'use client';

import { useState } from 'react';
import Dashboard from '../components/Dashboard';

const PASSWORD = 'ruffliners2026';

export default function InternalPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit() {
    if (input === PASSWORD) {
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  }

  if (authed) return <Dashboard />;

  return (
    <div style={{ background:'#0a0b0d', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(232,255,87,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(232,255,87,0.012) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:380, textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:36 }}>
          <div style={{ width:30, height:30, background:'#e8ff57', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0a0b0d" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, letterSpacing:'0.07em', textTransform:'uppercase', color:'#f0f2f8' }}>Ruff Liners</span>
        </div>

        <div style={{ background:'#13161e', border:'1px solid #1e2129', borderRadius:14, padding:'30px 26px' }}>
          {/* Lock icon */}
          <div style={{ width:44, height:44, background:'rgba(232,255,87,0.08)', border:'1px solid rgba(232,255,87,0.2)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8ff57" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17, color:'#f0f2f8', marginBottom:6 }}>Internal Dashboard</div>
          <div style={{ fontSize:12, color:'#5a6075', marginBottom:24, lineHeight:1.5 }}>Ruff Liners team access only.</div>

          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Password"
            style={{ width:'100%', background:'#0a0b0d', border:`1px solid ${error?'#ff6b6b':'#2a2e3a'}`, borderRadius:8, padding:'11px 14px', fontSize:14, fontFamily:"'DM Mono',monospace", color:'#f0f2f8', outline:'none', marginBottom:12, transition:'border-color 0.15s', letterSpacing:'0.1em' }}
          />

          {error && <div style={{ color:'#ff6b6b', fontSize:11, fontFamily:"'DM Mono',monospace", marginBottom:10 }}>Incorrect password.</div>}

          <button onClick={handleSubmit} style={{ width:'100%', background:'#e8ff57', color:'#0a0b0d', border:'none', borderRadius:8, padding:'11px', fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'0.05em', cursor:'pointer', textTransform:'uppercase' }}>
            Enter
          </button>
        </div>

        <div style={{ marginTop:14, fontSize:11, fontFamily:"'DM Mono',monospace", color:'#2a2e3a' }}>
          <a href="/" style={{ color:'#3a3e4a', textDecoration:'none' }}>← Back to leaderboard</a>
        </div>
      </div>
    </div>
  );
}
