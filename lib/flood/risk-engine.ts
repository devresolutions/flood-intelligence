import type {Evidence,FloodSnapshot,RiskState,SourceHealth} from './types';

export function evaluateRisk(sources:SourceHealth[], evidence:Evidence[]):FloodSnapshot['risk'] {
  const usable=sources.filter(x=>x.state==='LIVE');
  const reasons:string[]=[];
  if(!usable.length) return {state:'UNKNOWN',confidence:'LOW',reasons:['ไม่มีแหล่งข้อมูลสดที่ผ่าน freshness/data-quality gate']};

  const heavyRain=evidence.some(x=>x.kind==='RAIN'&&typeof x.value==='number'&&x.unit==='mm'&&x.value>=35);
  const risingWater=evidence.filter(x=>x.kind==='WATER_LEVEL'&&x.trend==='RISING').length;
  const floodExtent=evidence.some(x=>x.kind==='FLOOD_EXTENT');
  const roadFlood=evidence.some(x=>x.kind==='ROAD_FLOOD');
  if(heavyRain) reasons.push('พบหลักฐานฝนหนักจากข้อมูลที่ผ่าน validation');
  if(risingWater) reasons.push(`พบระดับน้ำมีแนวโน้มเพิ่ม ${risingWater} แหล่ง`);
  if(floodExtent) reasons.push('พบ flood extent ในพื้นที่วิเคราะห์');
  if(roadFlood) reasons.push('พบหลักฐานน้ำท่วมถนน');

  let state:RiskState='WATCH';
  if((heavyRain&&risingWater>=1)||floodExtent||roadFlood) state='WARNING';
  if((floodExtent||roadFlood)&&risingWater>=1&&heavyRain) state='ACTION';
  const independent=new Set(evidence.map(x=>x.sourceId)).size;
  const confidence=independent>=3?'HIGH':independent>=2?'MODERATE':'LOW';
  if(!reasons.length) reasons.push('มีข้อมูลสด แต่ยังไม่มีหลักฐานหลายแหล่งที่เข้าเกณฑ์ escalation');
  return {state,confidence,reasons};
}
