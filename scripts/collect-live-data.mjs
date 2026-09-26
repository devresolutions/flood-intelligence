import fs from 'node:fs/promises';

const now=new Date();
const checkedAt=now.toISOString();
const timeoutMs=12000;
const target={name:'Khum Thong – Lam Toi Ting, Lat Krabang, Bangkok',latitude:13.73,longitude:100.83,radiusKm:8};
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
  const r=await fetch(s.url,{signal:AbortSignal.timeout(timeoutMs),headers:{'user-agent':'FloodIntelligence/0.3'}});
  const latencyMs=Date.now()-started;
  if(!r.ok)return {...s,state:'DEGRADED',checkedAt,latencyMs,message:`Official source HTTP ${r.status}; live observations not accepted.`};
  if(s.kind==='apikey')return {...s,state:'AUTH_REQUIRED',checkedAt,latencyMs,message:'Official API catalog reachable; API key is required before observations can be ingested.'};
  if(s.kind==='credential')return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official service reachable; production machine endpoint/credential contract still required.'};
  if(s.kind==='historical')return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official 5-minute historical dataset verified; not misrepresented as a live feed.'};
  return {...s,state:'ENDPOINT_REQUIRED',checkedAt,latencyMs,message:'Official source reachable; machine-readable observation endpoint still requires verified adapter mapping.'};
 }catch(e){return {...s,state:'UNAVAILABLE',checkedAt,latencyMs:Date.now()-started,message:`Probe failed: ${e?.message??'unknown error'}`};}
}

async function collectWindy(){
 const started=Date.now();
 const key=process.env.WINDY_POINT_FORECAST_API_KEY;
 const base={id:'windy',name:'Windy Point Forecast',officialUrl:'https://api.windy.com/point-forecast/docs',checkedAt};
 if(!key)return {...base,state:'AUTH_REQUIRED',latencyMs:0,message:'Production Point Forecast API key is not configured. Windy testing data is intentionally not used for flood decisions.',evidence:[]};
 try{
  const r=await fetch('https://api.windy.com/api/point-forecast/v2',{
   method:'POST',signal:AbortSignal.timeout(timeoutMs),headers:{'content-type':'application/json','user-agent':'FloodIntelligence/0.3'},
   body:JSON.stringify({lat:target.latitude,lon:target.longitude,model:'gfs',parameters:['precip','convPrecip','wind','windGust','rh','pressure'],levels:['surface'],key})
  });
  const latencyMs=Date.now()-started;
  if(!r.ok)return {...base,state:'DEGRADED',latencyMs,message:`Windy Point Forecast HTTP ${r.status}; forecast evidence rejected.`,evidence:[]};
  const data=await r.json();
  const ts=Array.isArray(data.ts)?data.ts:[];
  const rain=Array.isArray(data['past3hprecip-surface'])?data['past3hprecip-surface']:(Array.isArray(data['precip-surface'])?data['precip-surface']:[]);
  const conv=Array.isArray(data['convPrecip-surface'])?data['convPrecip-surface']:[];
  const evidence=ts.slice(0,16).map((t,i)=>({source:'windy',type:'FORECAST',forecastAt:new Date(t).toISOString(),precipitation:rain[i]??null,convectivePrecipitation:conv[i]??null,model:data.model??'gfs'}));
  return {...base,state:evidence.length?'LIVE':'DEGRADED',latencyMs,latestObservedAt:checkedAt,message:evidence.length?`Windy ${data.model??'GFS'} point forecast loaded for area anchor.`:'Windy responded but no recognized forecast series was returned.',evidence};
 }catch(e){return {...base,state:'UNAVAILABLE',latencyMs:Date.now()-started,message:`Windy request failed: ${e?.message??'unknown error'}`,evidence:[]};}
}

const [probed,windy]=await Promise.all([Promise.all(catalog.map(probe)),collectWindy()]);
const sources=[...probed,windy];
const evidence=[...(windy.evidence??[])];
const reasons=[];
if(windy.state==='LIVE')reasons.push('มี Windy point forecast เป็น forecast evidence; ยังไม่ใช้แทน observed rain/water sensors.');
if(!evidence.length)reasons.push('ยังไม่มี observation/forecast endpoint ที่ผ่าน freshness/data-quality gate เพียงพอ; ไม่สรุป WATCH จากข้อมูล readiness');
const snapshot={generatedAt:checkedAt,location:target,risk:{state:'UNKNOWN',confidence:'LOW',reasons},sources,evidence,limitations:['Forecast is not an observation of current flooding.','Windy is supplementary meteorological evidence and must be combined with BMA/ThaiWater/TMD/GISTDA/local water evidence.','No API secret is stored in this public repository.','Private home coordinates are intentionally not stored.']};
await fs.mkdir('public/data',{recursive:true});
await fs.writeFile('public/data/latest.json',JSON.stringify(snapshot,null,2));
console.log(JSON.stringify(snapshot,null,2));
