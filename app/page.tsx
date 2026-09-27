'use client';
import {useEffect,useState} from 'react';

type Evidence={source:string,type:string,forecastAt?:string,precipitation?:number|null,convectivePrecipitation?:number|null,model?:string};
type Source={id:string,name:string,state:string,checkedAt:string,latencyMs?:number,message:string,officialUrl:string};
type Snapshot={generatedAt:string,risk:{state:string,confidence:string,reasons:string[]},sources:Source[],evidence?:Evidence[],limitations:string[]};
const fallback:Snapshot={generatedAt:'',risk:{state:'UNKNOWN',confidence:'LOW',reasons:['ยังโหลด runtime snapshot ไม่สำเร็จ']},sources:[],evidence:[],limitations:[]};
const LIVE_SNAPSHOT='https://raw.githubusercontent.com/devresolutions/flood-intelligence/data/live-snapshots/public/data/latest.json';

export default function Home(){
 const[d,setD]=useState<Snapshot>(fallback);const[loading,setLoading]=useState(true);const[error,setError]=useState('');
 async function load(){setLoading(true);setError('');try{const r=await fetch(`${LIVE_SNAPSHOT}?t=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);setD(await r.json())}catch(e){setError(`โหลด live snapshot ไม่สำเร็จ: ${e instanceof Error?e.message:'unknown error'}`)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const windy=(d.evidence??[]).filter(x=>x.source==='windy').slice(0,8);
 return <main className="wrap"><header className="top"><div><div className="eyebrow">Flood Intelligence · Bangkok East</div><h1>ขุมทอง – ลาดกระบัง</h1><div className="muted">Evidence-first · official-source health · runtime snapshot</div></div><button onClick={load}>{loading?'กำลังโหลด…':'Refresh live data'}</button></header>
 {error&&<section className="card"><p className="analysis warn">{error}</p></section>}
 <section className="card hero"><div className="eyebrow">CURRENT RISK STATE</div><div className="state watch">{d.risk.state}</div><div>Confidence: <b>{d.risk.confidence}</b></div>{d.risk.reasons.map(x=><p className="analysis" key={x}>{x}</p>)}<div className="muted">Snapshot: {d.generatedAt?new Date(d.generatedAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'}):'ยังไม่มีข้อมูล'}</div></section>
 <section className="grid"><div className="card"><h2>Runtime gate</h2><div className="row"><span>Freshness</span><b>ตามชนิดข้อมูล</b></div><div className="row"><span>Cross-source</span><b>ต้องมีหลักฐานจริง</b></div></div><div className="card"><h2>Risk model</h2><div className="row"><span>NORMAL / WATCH</span></div><div className="row"><span className="warn">WARNING → ACTION → EMERGENCY</span></div></div><div className="card"><h2>Privacy</h2><p className="analysis">Public repo ใช้เพียง area anchor ระดับขุมทอง–ลาดกระบัง ไม่เก็บพิกัดบ้านส่วนตัว</p></div></section>
 <section className="card" style={{marginTop:16}}><h2>Runtime Source Health</h2>{d.sources.length?d.sources.map(s=><div className="row" key={s.id}><div><div className="source">{s.name}</div><div className="muted">{s.message}</div><div className="muted">checked {new Date(s.checkedAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'})}{typeof s.latencyMs==='number'?` · ${s.latencyMs} ms`:''}</div></div><span className="tag">{s.state}</span></div>):<p className="analysis">ยังไม่มี runtime snapshot</p>}</section>
 <section className="card" style={{marginTop:16}}><h2>Windy forecast evidence</h2>{windy.length?windy.map((x,i)=><div className="row" key={`${x.forecastAt}-${i}`}><span>{x.forecastAt?new Date(x.forecastAt).toLocaleString('th-TH',{timeZone:'Asia/Bangkok'}):'-'}</span><b>{typeof x.precipitation==='number'?`${x.precipitation.toFixed(3)} (3h precip)`:'ไม่มีค่า'}</b></div>):<p className="analysis">ยังไม่มี Windy forecast ใน snapshot</p>}<p className="muted">Forecast ใช้เป็นหลักฐานประกอบเท่านั้น ไม่ถือเป็นการตรวจพบน้ำท่วม ณ จุดจริง</p></section>
 <section className="card" style={{marginTop:16}}><h2>ข้อจำกัด</h2>{d.limitations.map(x=><p className="analysis" key={x}>{x}</p>)}</section><footer className="footer">Decision-support only — ไม่ใช่ประกาศเตือนภัยหรือคำสั่งอพยพอย่างเป็นทางการ</footer></main>}
