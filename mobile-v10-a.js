const DATA_URL='https://raw.githack.com/TourytellerAdmin/touryteller-sales-map/e5c0523b0a950468d123d70dfde86eadf473f2b3/crm-map-data.json';
const GEO_URL='https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';
let SUMMARY,TARGETS,MATRIX,NEXT_CITY,FEATURED;
const INTEL_URL='https://raw.githack.com/TourytellerAdmin/touryteller-sales-map/76af363f3286100d63855f2dba25f2b9c59c6d54/crm-map-intel-v10.json';
const COLORS={ALL:'#64748b',SENT:'#2f6fec',QUEUE:'#e8a020',INTERESTED:'#15956a',WON:'#8058e8',NEXT:'#0f766e',Q4:'#2563eb',Q1:'#0f9f8f',Q2:'#e8a020',Q3:'#ea795f'};
const PTYPE={CREADOR:'Creador',GUIA:'Guía',AGENCIA:'Agencia',PARTNER_LOCAL:'Partner'};
const PGOAL={CREADOR:3,GUIA:5,AGENCIA:3,PARTNER_LOCAL:2};
const ALIAS={'Spain':'España','Italy':'Italia','Hungary':'Hungría','United Kingdom':'Reino Unido','France':'Francia','Ireland':'Irlanda','Japan':'Japón','Germany':'Alemania','Türkiye':'Turquía','Turkey':'Turquía','Croatia':'Croacia','Czechia':'Chequia','Czech Republic':'Chequia','Poland':'Polonia','Portugal':'Portugal','Netherlands':'Países Bajos','Costa Rica':'Costa Rica','Colombia':'Colombia','Austria':'Austria','United States of America':'Estados Unidos','United States':'Estados Unidos','Mexico':'México','South Korea':'Corea del Sur','Republic of Korea':'Corea del Sur','Thailand':'Tailandia','Singapore':'Singapur','United Arab Emirates':'Emiratos Árabes Unidos','Morocco':'Marruecos','South Africa':'Sudáfrica','Australia':'Australia','Canada':'Canadá','Brazil':'Brasil','China':'China','Vietnam':'Vietnam','Peru':'Perú','Chile':'Chile','Argentina':'Argentina'};
const CITY_ALIAS={'Kraków':'Cracovia','Germany':'Alemania · ámbito nacional','España':'España · ámbito nacional'};
const PHOTOS={
'Barcelona':'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1000&q=80',
'Madrid':'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1000&q=80',
'Roma':'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
'París':'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
'Londres':'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80',
'Tokio':'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1000&q=80',
'Budapest':'https://images.unsplash.com/photo-1549877452-9c387954fbc2?auto=format&fit=crop&w=1000&q=80',
'Berlín':'https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=1000&q=80',
'Praga':'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1000&q=80',
'Cracovia':'https://images.unsplash.com/photo-1519197924294-4ba991a11128?auto=format&fit=crop&w=1000&q=80',
'Estambul':'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1000&q=80',
'Dublín':'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1000&q=80',
'Ámsterdam':'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1000&q=80',
'Oporto':'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80',
'Lisboa':'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80',
'Granada':'https://images.unsplash.com/photo-1590075865003-e48277faa558?auto=format&fit=crop&w=1000&q=80',
'Medellín':'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1000&q=80',
'Nueva York':'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1000&q=80',
'Bangkok':'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1000&q=80',
'Ciudad de México':'https://images.unsplash.com/photo-1518659526054-190340b32735?auto=format&fit=crop&w=1000&q=80',
'Kioto':'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
'Seúl':'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1000&q=80'
};
const FALLBACK='https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=78';
let D,geo,countryLayer,markers=[],view='ALL',profile='ALL',funnel='ALL',quarter='ALL',selected=null;
const map=L.map('map',{minZoom:1.5,maxZoom:8,zoomSnap:.5,zoomControl:true,attributionControl:false}).setView([22,10],2);
const grid=[];for(let lat=-60;lat<=60;lat+=30)grid.push(L.polyline([[lat,-180],[lat,180]],{color:'#d5dce4',weight:.45,opacity:.55,interactive:false}));for(let lng=-150;lng<=150;lng+=30)grid.push(L.polyline([[-85,lng],[85,lng]],{color:'#d5dce4',weight:.45,opacity:.55,interactive:false}));L.layerGroup(grid).addTo(map);
function normCity(c){return CITY_ALIAS[c]||c}
function pct(a,b){return Math.min(100,Math.round((a/Math.max(1,b))*100))}
function goalStat(label,n,target,cls='',goalText=null){const p=typeof target==='number'?pct(n,target):Math.min(100,n);return `<div class="stat ${cls}"><div class="statTop"><div class="n">${n}</div><span class="goal">${goalText||'Obj. '+target}</span></div><small>${label}</small><div class="bar"><i style="width:${p}%"></i></div></div>`}
function renderStats(){document.getElementById('stats').innerHTML=[goalStat('Oportunidades CRM',SUMMARY.total,TARGETS.total),goalStat('Con ciudad normalizada',SUMMARY.mapped,TARGETS.mapped,'','Obj. 100%'),goalStat('Outreach en vuelo',SUMMARY.sent,TARGETS.sent,'good'),goalStat('Preparados / cola',SUMMARY.queue,TARGETS.queueMax,'warn','Obj. ≤'+TARGETS.queueMax),goalStat('Interesados',SUMMARY.interested,TARGETS.interested,'good'),goalStat('Mercados conseguidos',SUMMARY.won,TARGETS.won,'purple'),goalStat('Con próximo paso',SUMMARY.next,SUMMARY.total,'good','Obj. 100%')].join('')}
function oldMetric(r){if(view==='ALL'){return funnel==='SUPPLY'?r.supply:funnel==='PARTNER'?r.partners:funnel==='INSTITUTION'?r.institutions:funnel==='CAPITAL'?r.capital:funnel==='CONTEST'?r.contests:r.total}if(view==='SENT')return r.sent||0;if(view==='QUEUE')return r.queue||0;if(view==='INTERESTED')return r.interested||0;if(view==='WON')return r.won||0;if(view==='NEXT')return NEXT_CITY[normCity(r.name)]||0;return 0}
function profileMetric(city){city=normCity(city);if(profile==='ALL')return null;return (MATRIX[view]?.[city]?.[profile])||0}
function metric(r){if(view==='ROADMAP')return 0;if(profile!=='ALL')return profileMetric(r.name);return oldMetric(r)}
function label(){return({ALL:'Todo CRM',SENT:'Enviados / outreach',QUEUE:'Preparados / cola',INTERESTED:'Interesados',WON:'Conseguido real',NEXT:'Próximos pasos',ROADMAP:'Roadmap 12M'})[view]}
function color(){return COLORS[view]||COLORS.ALL}
function rows(){return view==='ROADMAP'?[]:D.locations.filter(r=>metric(r)>0)}
function countryValues(){const out={};if(view==='ROADMAP'){D.roadmap.filter(r=>quarter==='ALL'||r.quarter===quarter).forEach(r=>out[r.country]=(out[r.country]||0)+1);return out}rows().forEach(r=>out[r.country]=(out[r.country]||0)+metric(r));return out}
function countryStyle(name){const vals=countryValues(),v=vals[name]||0;if(!v)return{color:'#d5dbe2',weight:.6,opacity:.7,fillColor:'#f5f7f9',fillOpacity:.78};if(view==='ROADMAP'){const q=D.roadmap.find(r=>r.country===name&&(quarter==='ALL'||r.quarter===quarter))?.quarter||'Q4';return{color:COLORS[q],weight:1.4,opacity:.8,fillColor:COLORS[q],fillOpacity:.13}}const max=Math.max(...Object.values(vals),1);return{color:color(),weight:1.2,opacity:.78,fillColor:color(),fillOpacity:.10+Math.min(.25,(v/max)*.25)}}
function redrawCountries(){if(countryLayer)map.removeLayer(countryLayer);countryLayer=L.geoJSON(geo,{style:f=>{const raw=f.properties.name||f.properties.ADMIN||'';return countryStyle(ALIAS[raw]||raw)},onEachFeature:(f,l)=>{const raw=f.properties.name||f.properties.ADMIN||'';const name=ALIAS[raw]||raw;l.on('click',()=>selectCountry(name));l.bindTooltip(()=>countryTip(name),{sticky:true})}}).addTo(map);if(countryLayer.bringToBack)countryLayer.bringToBack()}
function countryTip(name){if(view==='ROADMAP'){const rr=D.roadmap.filter(r=>r.country===name&&(quarter==='ALL'||r.quarter===quarter));return `<b>${name}</b><br>${rr.length} objetivos`}const v=D.locations.filter(r=>r.country===name).reduce((a,r)=>a+metric(r),0);return `<b>${name}</b><br>${v} · ${label()}`}
function redrawMarkers(){markers.forEach(m=>map.removeLayer(m));markers=[];if(view==='ROADMAP'){D.roadmap.filter(r=>quarter==='ALL'||r.quarter===quarter).forEach(r=>addMarker(r,r.score,COLORS[r.quarter],true));return}rows().forEach(r=>addMarker(r,metric(r),color(),false))}
function addMarker(r,val,c,road){const radius=Math.min(16,6+Math.sqrt(Math.max(1,val))*1.5);const m=L.circleMarker([r.lat,r.lng],{radius,color:'#fff',weight:2,fillColor:c,fillOpacity:.96}).addTo(map);m.bindTooltip(`<b>${r.name}</b><br>${road?'Score '+val:val+' · '+label()}${profile!=='ALL'?'<br>'+PTYPE[profile]:''}`,{direction:'top'});m.on('click',()=>selectCity(r.name,road?r:null));markers.push(m)}
function statCount(){if(view==='ROADMAP')return D.roadmap.filter(r=>quarter==='ALL'||r.quarter===quarter).length;return rows().reduce((a,r)=>a+metric(r),0)}