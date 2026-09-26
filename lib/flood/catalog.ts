export const sourceCatalog = [
  {id:'bma-radar',name:'BMA Radar / DDS',officialUrl:'https://data.go.th/dataset/69-05-disaster',mode:'PUBLIC_DISCOVERY',freshMinutes:30},
  {id:'bma-water',name:'BMA Water Level',officialUrl:'https://data.go.th/th/dataset/flood',mode:'PUBLIC_HISTORICAL',freshMinutes:15},
  {id:'thaiwater',name:'ThaiWater / HII',officialUrl:'https://www.thaiwater.net/',mode:'PUBLIC_DISCOVERY',freshMinutes:60},
  {id:'tmd',name:'Thai Meteorological Department',officialUrl:'https://www.tmd.go.th/',mode:'CREDENTIAL_OR_CONTRACT',freshMinutes:60},
  {id:'gistda',name:'GISTDA Flood',officialUrl:'https://disaster.gistda.or.th/services/open-api',mode:'API_KEY',freshMinutes:1440},
  {id:'road-flood',name:'Bangkok Road Flood',officialUrl:'https://data.go.th/',mode:'ENDPOINT_DISCOVERY',freshMinutes:30},
] as const;

export const targetLocation = {
  name: 'Khum Thong – Lam Toi Ting, Lat Krabang, Bangkok',
  // Area-level anchor only. Do not encode the user's private home coordinate in a public repository.
  latitude: 13.73,
  longitude: 100.83,
  radiusKm: 8,
};
