import fs from 'node:fs/promises';

const now=new Date();
const checkedAt=now.toISOString();
const timeoutMs=12000;
const catalog=[
 {id:'bma-radar',name:'BMA Radar / DDS',url:'https://data.go.th/dataset/69-05-disaster',officialUrl:'https://data.go.th/dataset/69-05-disaster',kind:'catalog'},
 {id:'bma-water',name:'BMA Water Level',url:'https://data.go.th/th/dataset/flood',officialUrl:'https://data.go.th/th/dataset/flood',kind:'historical'},
 {id:'thaiwater',name:'ThaiWater / HII',url:'https://www.thaiwater.net/',officialUrl:'https://www.thaiwater.net/',kind:'catalog'},
 {id:'tmd',name:'Thai Meteorological Department',url:'https://www.tmd.go.th/',officialUrl:'https://www.tmd.go.th/',kind:'credential'},
 {id:'gistda',name:'GISTDA Flood',url:'https://disaster.gistda.or.th/services/open-api',officialUrl:'https://disaster.gistda.or.th/services/open-api',kind:'apikey'},
 {id:'road-flood',name:'Bangkok Road Flood',url:'https://data.go.th/',officialUrl:'https://data.go.th/',kind:'discovery'},
];

async function probe(s){
 const started=Date.now();
 try{
  const r=await fetch(s.url,{signal:AbortSignal.timeout(timeoutMs),headers:{'user-agent':'FloodIntelligence/0.2'}});
  const latencyMs=Date.now()-started;
  if(!r.ok)return {...s,state:'DEGRADED',checkedAt,latencyMs,message:`Official source HTTP ${r.status}; live observations not accepted.`};
  if(s.kind==='apikey')return {...s,state:'AUTH_REQUIRED',checkedAt,latencyMs,message:'Official API catalog reachable; API key is required before observations can be ingested.'};
  if(s.kind==='credential')return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official service reachable; production machine endpoint/credential contract still required.'};
  if(s.kind==='historical')return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official 5-minute historical dataset verified; not misrepresented as a live feed.'};
  return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official source reachable; machine-readable observation endpoint still requires verified adapter mapping.'};
 }catch(e){return {...s,state:'UNAVAILABLE',checkedAt,latencyMs:Date.now()-started,message:`Probe failed: ${e?.message??'unknown error'}`};}
}

const sources=await Promise.all(catalog.map(probe));
const snapshot={generatedAt:checkedAt,location:{name:'Khum Thong – Lam Toi Ting, Lat Krabang, Bangkok',latitude:13.73,longitude:100.83,radiusKm:8},risk:{state:'UNKNOWN',confidence:'LOW',reasons:['ยังไม่มี observation endpoint ที่ผ่าน freshness/data-quality gate; ไม่สรุป WATCH จากข้อมูล readiness']},sources,evidence:[],limitations:['Source reachability is not evidence of current flood conditions.','No API secret is stored in this public repository.','Private home coordinates are intentionally not stored.']};
await fs.mkdir('public/data',{recursive:true});
await fs.writeFile('public/data/latest.json',JSON.stringify(snapshot,null,2));
console.log(JSON.stringify(snapshot,null,2));
