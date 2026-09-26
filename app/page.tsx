'use client';
import {useEffect,useState} from 'react';

type Source={id:string,name:string,state:string,checkedAt:string,latencyMs?:number,message:string,officialUrl:string};
type Snapshot={generatedAt:string,risk:{state:string,confidence:string,reasons:string[]},sources:Source[],limitations:string[]};
const fallback:Snapshot={generatedAt:'',risk:{state:'UNKNOWN',confidence:'LOW',reasons:['ยังโหลด runtime snapshot ไม่สำเร็จ']},sources:[],limitations:[]};

export default function Home(){
 const[d,setD]=useState<Snapshot>(fallback);const[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const base=process.env.NEXT_PUBLIC_BASE_PATH??'/flood-intelligence';const r=await fetch(`${base}/data/latest.json?t=${Date.now()}`,{cache:'no-store'});if(r.ok)setD(await r.json());}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 return <main className="wrap"><header className="top"><div><div className="eyebrow">Flood Intelligence · Bangkok East</div><h1>ขุมทอง – ลาดกระบัง</h1><div className="muted">Evidence-first · official-source health · no fabricated observations</div></div><button onClick={load}>{loading?'กำลังโหลด…':'Refresh snapshot'}</button></header>
 <section className="card hero"><div className="eyebrow">CURRENT RISK STATE</div><div className="state watch">{d.risk.state}</div><div>Confidence: <b>{d.risk.confidence}</b></div>{d.risk.reasons.map(x=><p className="analysis" key={x}>{x}</p>)}<div className="muted">Snapshot: {d.generatedAt?new Date(d.generatedAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'}):'ยังไม่มีข้อมูล'}</div></section>
 <section className="grid"><div className="card"><h2>Runtime gate</h2><div className="row"><span>Freshness</span><b>ตามชนิดข้อมูล</b></div><div className="row"><span>Cross-source</span><b>ต้องมีหลักฐานจริง</b></div></div><div className="card"><h2>Risk model</h2><div className="row"><span>NORMAL / WATCH</span></div><div className="row"><span className="warn">WARNING → ACTION → EMERGENCY</span></div></div><div className="card"><h2>Privacy</h2><p className="analysis">Public repo เก็บเพียง anchor ระดับพื้นที่ลาดกระบัง ไม่เก็บพิกัดบ้านส่วนตัว</p></div></section>
 <section className="card" style={{marginTop:16}}><h2>Runtime Source Health</h2>{d.sources.length?d.sources.map(s=><div className="row" key={s.id}><div><div className="source">{s.name}</div><div className="muted">{s.message}</div><div className="muted">checked {new Date(s.checkedAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'})}{typeof s.latencyMs==='number'?` · ${s.latencyMs} ms`:''}</div></div><span className="tag">{s.state}</span></div>):<p className="analysis">ยังไม่มี runtime snapshot</p>}</section>
 <section className="card" style={{marginTop:16}}><h2>ข้อจำกัด</h2>{d.limitations.map(x=><p className="analysis" key={x}>{x}</p>)}</section><footer className="footer">Decision-support only — ไม่ใช่ประกาศเตือนภัยหรือคำสั่งอพยพอย่างเป็นทางการ</footer></main>}
