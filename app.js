(function(){
'use strict';

/* ================= constants ================= */
var DAYS=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
var DSH=['zo','ma','di','wo','do','vr','za'];
var MON=['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec'];
var KIND={competitie:'Competitie',oefen:'Oefenmatch',beker:'Beker',tornooi:'Tornooi'};
var STATUS={gepland:'Gepland',geannuleerd:'Geannuleerd',verplaatst:'Verplaatst'};
var DEFAULT_CONFIG={
  club:'K. Hechtel FC',
  teams:{A:{label:'Hechtel A',trainers:''},B:{label:'Hechtel B',trainers:''}},
  trainerNames:[],
  home:{venue:'Duinenstadion',address:'Hoefstraat 4, 3940 Hechtel',meetTime:'09:00',meetPlace:'Kleedkamer',before:60,lat:51.1087052,lon:5.3664466},
  away:{meetPlace:'Parking',arriveBefore:60},
  squad:{target:10,min:8},
  phases:[],
  legend:'GROEN = BROODJES + WAS',
  rbfa:{clubId:'1416',clubNr:'02662',teamNames:{A:'U11 A',B:'U11 B'}}
};
var ICONS={
  chevL:'<path d="M15 18l-6-6 6-6"/>',
  chevR:'<path d="M9 18l6-6-6-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  shirt:'<path d="M8.5 4L4 6.5l1.8 3.6 2.2-1V20h8V9.1l2.2 1L20 6.5 15.5 4c-.6 1.3-1.9 2.1-3.5 2.1S9.1 5.3 8.5 4z"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  alert:'<path d="M12 9v4.5M12 17h.01"/><path d="M10.3 4L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0z"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  download:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
  cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M9 3.5v4M15 3.5v4"/>',
  dots:'<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  edit:'<path d="M4 20h4.2L19 9.2a2.2 2.2 0 0 0-3.1-3.1L5 17v3z"/>',
  map:'<path d="M9 4.5L3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2zM9 4.5v13M15 6.5v13"/>',
  swap:'<path d="M7 7.5h12l-3.5-3.5M17 16.5H5l3.5 3.5"/>',
  undo:'<path d="M9 14.5L4 9.5l5-5"/><path d="M4 9.5h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  trash:'<path d="M4.5 7h15M10 11v6M14 11v6M6.5 7l.9 12.2A1.5 1.5 0 0 0 8.9 20.5h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7M9.5 7V4.5h5V7"/>',
  users:'<circle cx="9.5" cy="8" r="3.5"/><path d="M3.5 20v-1.2a4.3 4.3 0 0 1 4.3-4.3h3.4a4.3 4.3 0 0 1 4.3 4.3V20"/>',
  eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  spin:'<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/>',
  share:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  x:'<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  help:'<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.7M12 17h.01"/>'
};
function ic(n){return '<svg class="i i-'+n+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICONS[n]||'')+'</svg>';}

/* ================= utils ================= */
function $(s,el){return (el||document).querySelector(s);}
function pad(n){return String(n).padStart(2,'0');}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function parseD(s){var p=String(s).split('-').map(Number);return Date.UTC(p[0],(p[1]||1)-1,p[2]||1);}
function isoT(t){var d=new Date(t);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
function addDays(s,n){return isoT(parseD(s)+n*864e5);}
function dow(s){return new Date(parseD(s)).getUTCDay();}
function mondayOf(s){return addDays(s,-((dow(s)+6)%7));}
function ddmm(s){var p=String(s).split('-');return p[2]+'/'+p[1];}
function dShort(s){return s?DSH[dow(s)]+' '+ddmm(s):'';}
function dLong(s){var d=DAYS[dow(s)];return d.charAt(0).toUpperCase()+d.slice(1)+' '+ddmm(s);}
function dayMonth(s){var p=String(s).split('-');return Number(p[2])+' '+MON[Number(p[1])-1];}
function today(){var n=new Date();return n.getFullYear()+'-'+pad(n.getMonth()+1)+'-'+pad(n.getDate());}
function nowHM(){var n=new Date();return pad(n.getHours())+':'+pad(n.getMinutes());}
function toMin(hm){if(!hm)return null;var p=String(hm).split(':').map(Number);if(isNaN(p[0]))return null;return p[0]*60+(p[1]||0);}
function fromMin(x){x=((Math.round(x)%1440)+1440)%1440;return pad(Math.floor(x/60))+':'+pad(x%60);}
function isObj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function merge(a,b){var r=Object.assign({},a||{});for(var k in b){if(!Object.prototype.hasOwnProperty.call(b,k))continue;r[k]=(isObj(b[k])&&isObj(r[k]))?merge(r[k],b[k]):b[k];}return r;}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rid(p){return p+'-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function joinNames(a){a=a.filter(Boolean);if(a.length<2)return a.join('');return a.slice(0,-1).join(', ')+' & '+a[a.length-1];}
function splitNames(s){return String(s||'').split(/\s*(?:,|&|\+|\ben\b)\s*/i).map(function(x){return x.trim();}).filter(Boolean);}
function uniq(a){var s=new Set();return a.filter(function(x){if(s.has(x))return false;s.add(x);return true;});}
function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function stamp(){var n=new Date();return DSH[n.getDay()]+' '+pad(n.getDate())+'/'+pad(n.getMonth()+1)+' om '+pad(n.getHours())+':'+pad(n.getMinutes());}
function isoStamp(s){if(!s)return '';var d=new Date(s);if(isNaN(d))return '';return DSH[d.getDay()]+' '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+pad(d.getHours())+':'+pad(d.getMinutes());}

/* ================= state ================= */
var S={config:null,players:new Map(),opponents:new Map(),matches:new Map(),weeks:new Map(),members:new Map(),user:null,admin:false,owner:false,login:null,sync:{busy:false,err:null},loaded:{},db:'wait',canWrite:true,view:'week',week:null,showPast:false,calSel:new Set(),ptab:'A',sheet:null,sugg:new Map(),undo:null};
var DB=null,CFG=null;
try{var lv=localStorage.getItem('hu11.view');if(lv&&['week','cal','players','more'].indexOf(lv)>=0)S.view=lv;var lp=localStorage.getItem('hu11.past');if(lp==='1')S.showPast=true;}catch(e){}
function cfg(){return CFG||(CFG=merge(DEFAULT_CONFIG,S.config||{}));}

/* ================= model ================= */
function teamLabel(t){var c=cfg();return (c.teams[t]&&c.teams[t].label)||('Hechtel '+t);}
function teamTrainers(t){var c=cfg();return (c.teams[t]&&c.teams[t].trainers)||'';}
function cleanName(n){return String(n||'').replace(/\s+\d+(-\d+)?$/,'').replace(/\s+[A-D]$/,'').trim();}
function tidyTeam(n){n=cleanName(n).replace(/^[A-Z]\.\s+/,'');if(/[a-z\u00e0-\u00ff]/.test(n))return n;return n.split(' ').map(function(w){return w.length<=3?w:w.charAt(0)+w.slice(1).toLowerCase();}).join(' ');}
function getM(id){return S.matches.get(id)||null;}
function oppOf(m){return (m&&m.opponentId&&S.opponents.get(m.opponentId))||null;}
function oppName(m){var o=oppOf(m);return (o&&o.name)||cleanName(m.opponentName)||'Tegenstander';}
function eff(m){var mv=m.status==='verplaatst'&&!!m.newDate;return {date:mv?m.newDate:m.date,time:(mv&&m.newTime)?m.newTime:(m.time||''),moved:mv};}
function allMatches(){return Array.from(S.matches.values());}
function plist(){return Array.from(S.players.values());}
function cmpEff(a,b){var ea=eff(a),eb=eff(b);return (ea.date+' '+ea.time).localeCompare(eb.date+' '+eb.time)||String(a.team).localeCompare(String(b.team));}
function cmpTeam(a,b){return String(a.team).localeCompare(String(b.team))||cmpEff(a,b);}
function weekOf(m){return mondayOf(eff(m).date);}
function matchesInWeek(wk){var end=addDays(wk,6);return allMatches().filter(function(m){var d=eff(m).date;return d>=wk&&d<=end;}).sort(cmpTeam);}
function ghostsInWeek(wk){var end=addDays(wk,6);return allMatches().filter(function(m){return m.status==='verplaatst'&&m.newDate&&m.date>=wk&&m.date<=end&&!(m.newDate>=wk&&m.newDate<=end);});}
function phaseNo(wk){var ph=(cfg().phases||[]).filter(Boolean).map(mondayOf).sort();var p=null;ph.forEach(function(x){if(x<=wk)p=x;});if(!p)return null;return Math.round((parseD(wk)-parseD(p))/(7*864e5))+1;}
function defaultTitle(wk){var n=phaseNo(wk);if(n)return 'Speeldag '+n;var ms=matchesInWeek(wk);if(ms.length&&ms.every(function(m){return m.kind==='oefen';}))return 'Oefenmatch';return 'Week van '+dayMonth(wk);}
function weekTitle(wk){var w=S.weeks.get(wk);return (w&&w.title)||defaultTitle(wk);}
function weekRange(wk,ms){ms=ms||matchesInWeek(wk);var ds=uniq(ms.map(function(m){return eff(m).date;})).sort();
  if(!ds.length)return 'week van '+dayMonth(wk)+' tot '+dayMonth(addDays(wk,6));
  if(ds.length===1)return DAYS[dow(ds[0])]+' '+dayMonth(ds[0]);
  return DSH[dow(ds[0])]+' '+dayMonth(ds[0])+' tot '+DSH[dow(ds[ds.length-1])]+' '+dayMonth(ds[ds.length-1]);}
function byOrder(a,b){var oa=(a.order==null||a.order==='')?999:Number(a.order),ob=(b.order==null||b.order==='')?999:Number(b.order);return oa-ob||String(a.name).localeCompare(String(b.name),'nl');}
function template(team){return plist().filter(function(p){return p.team===team&&p.active!==false&&!p.review;}).sort(byOrder).map(function(p){return p.id;});}
function sortSel(m,ids){return ids.slice().sort(function(a,b){var A=S.players.get(a),B=S.players.get(b);var ga=A.team===m.team?0:1,gb=B.team===m.team?0:1;return ga-gb||byOrder(A,B);});}
function selection(m){var ids=Array.isArray(m.players)?m.players:template(m.team);return sortSel(m,uniq(ids).filter(function(id){return S.players.has(id);}));}
function pName(id){var p=S.players.get(id);return p?p.name:'?';}
function matchTitle(m){var e=eff(m),us=teamLabel(m.team),th=oppName(m);return (m.home?us+' – '+th:th+' – '+us)+' · '+dShort(e.date)+' '+e.time;}
function gmaps(dest){return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(cfg().home.address||'Hoefstraat 4, 3940 Hechtel')+'&destination='+encodeURIComponent(dest)+'&travelmode=driving';}
function venueText(v){if(!v)return '';return [v.address,[v.postalCode,v.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');}

function meet(m){
  var c=cfg(),e=eff(m),ko=toMin(e.time),place;
  if(m.home){
    place=m.meetPlace||c.home.meetPlace;
    if(m.meetTime)return {time:m.meetTime,place:place,src:'manual'};
    var fx=toMin(c.home.meetTime);
    if(ko==null||fx==null)return {time:c.home.meetTime||null,place:place,src:'std'};
    if(ko-fx>=30&&ko-fx<=150)return {time:c.home.meetTime,place:place,src:'std'};
    return {time:fromMin(ko-(Number(c.home.before)||60)),place:place,src:'auto'};
  }
  place=m.meetPlace||c.away.meetPlace;
  if(m.meetTime)return {time:m.meetTime,place:place,src:'manual'};
  var o=oppOf(m),tr=null;
  if(m.travelMin!=null&&m.travelMin!=='')tr=Number(m.travelMin);
  else if(o&&o.travelMin!=null&&o.travelMin!=='')tr=Number(o.travelMin);
  var arr=Number(c.away.arriveBefore)||0;
  if(tr==null||isNaN(tr)||ko==null)return {time:null,place:place,src:'missing',arrive:arr};
  return {time:fromMin(Math.floor((ko-arr-tr)/5)*5),place:place,src:'std',travel:tr,arrive:arr};
}

function addTo(map,k,v){var s=map.get(k);if(!s){s=new Set();map.set(k,s);}s.add(v);}
function computeSugg(){
  var t=today(),hm=nowHM(),list=allMatches().sort(cmpEff),cnt=new Map(),last=new Map(),busy=new Map(),out=new Map();
  var ss=seasonStart(t);
  list.forEach(function(m){if(!m.wasId||m.status==='geannuleerd')return;var d=eff(m).date;if(d<ss)return;cnt.set(m.wasId,(cnt.get(m.wasId)||0)+1);if(!last.has(m.wasId)||d>last.get(m.wasId))last.set(m.wasId,d);addTo(busy,d,m.wasId);});
  list.forEach(function(m){
    if(m.wasId||m.status==='geannuleerd')return;var e=eff(m),d=e.date;if(d<t||(d===t&&e.time&&e.time<hm))return;
    var bz=busy.get(d)||new Set();
    var cand=selection(m).filter(function(id){var p=S.players.get(id);return p&&p.team!=='X'&&!bz.has(id);});
    if(!cand.length)return;
    cand.sort(function(a,b){return (cnt.get(a)||0)-(cnt.get(b)||0)||String(last.get(a)||'').localeCompare(String(last.get(b)||''))||(hash(m.id+a)-hash(m.id+b));});
    var pick=cand[0];out.set(m.id,pick);cnt.set(pick,(cnt.get(pick)||0)+1);last.set(pick,d);addTo(busy,d,pick);
  });
  S.sugg=out;
}
function wasStats(){var st=new Map(),ss=seasonStart(today());allMatches().forEach(function(m){if(!m.wasId||m.status==='geannuleerd')return;var d=eff(m).date;if(d<ss)return;var s=st.get(m.wasId)||{n:0,last:''};s.n++;if(d>s.last)s.last=d;st.set(m.wasId,s);});return st;}
function wasOf(m){var sel=selection(m);return (m.wasId&&sel.indexOf(m.wasId)>=0)?m.wasId:null;}

function flags(m){
  var out=[];if(m.status==='geannuleerd')return out;
  var c=cfg(),e=eff(m),up=e.date>=today();
  if(m.rbfaPrev&&(m.rbfaPrev.date||m.rbfaPrev.time))out.push({lvl:'info',t:'RBFA wijzigde datum of uur (was '+dShort(m.rbfaPrev.date||m.date)+' '+(m.rbfaPrev.time||'')+')',a:'ackRbfa'});
  if(m.rbfaState&&['planned','played','finished','ended'].indexOf(String(m.rbfaState).toLowerCase())<0)out.push({lvl:'warn',t:'RBFA-status: '+m.rbfaState});
  if(m.rbfaRemoved)out.push({lvl:'warn',t:'Staat niet meer in de RBFA-kalender'});
  if(!up)return out;
  var sel=selection(m),n=sel.length,tg=Number(c.squad.target)||0,mn=Number(c.squad.min)||0;
  if(mn&&n<mn)out.push({lvl:'bad',t:n+' spelers, minimum '+mn});
  else if(tg&&n!==tg)out.push({lvl:'warn',t:n+' spelers, doel '+tg});
  var mt=meet(m);if(!mt.time)out.push({lvl:'bad',t:'Rijtijd ontbreekt',a:'editOpp'});
  if(!m.home&&m.venue&&m.venue.address){var o=oppOf(m);if(o&&o.venue&&o.venue.address&&norm(o.venue.address+o.venue.postalCode)!==norm(m.venue.address+m.venue.postalCode))out.push({lvl:'warn',t:'Ander terrein: '+venueText(m.venue)});}
  var others=allMatches().filter(function(x){return x.id!==m.id&&x.status!=='geannuleerd'&&eff(x).date===e.date;});
  if(others.length){var dup=sel.filter(function(id){return others.some(function(o){return selection(o).indexOf(id)>=0;});});if(dup.length)out.push({lvl:'warn',t:'Ook in andere match: '+dup.map(pName).join(', ')});}
  var ina=sel.filter(function(id){return S.players.get(id).active===false;});if(ina.length)out.push({lvl:'warn',t:'Inactief: '+ina.map(pName).join(', ')});
  return out;
}
/* ---------- RBFA: fetched straight from the browser when the app opens ---------- */
function tidyVenue(n){n=String(n||'').replace(/\s+/g,' ').trim();var mp={'T Leeuwke':"'t Leeuwke",'Fc Kaulille':'FC Kaulille'};return mp[n]||n.replace(/^Cmp:\s*/i,'');}
function tidyCity(c){return ({'St-Truiden':'Sint-Truiden','Linde Peer':'Peer'})[c]||c;}
function slug(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function vKey(v){return v?String(v.postalCode||'')+'|'+String(v.address||''):'';}
function seasonStart(d){var p=String(d||today()).split('-').map(Number);return (p[1]>=7?p[0]:p[0]-1)+'-07-01';}
function seasonOf(d){var p=String(d).split('-').map(Number),y=p[1]>=7?p[0]:p[0]-1;return y+'-'+(y+1);}
function travelFor(snap,v,club){var t=(snap&&snap.travel)||{};return t[vKey(v)]||(club?t[club]:null)||null;}
function teamsDiffer(snap){var r=cfg().rbfa||{};if(!snap||!snap.teams||!snap.teams.A||!snap.teams.B||!r.teamA)return false;return String(snap.teams.A.id)!==String(r.teamA)||String(snap.teams.B.id)!==String(r.teamB);}
function rbfaDiff(snap,season){
  if(!snap||!Array.isArray(snap.matches)||!snap.matches.length)return [];
  var c=cfg(),rb=c.rbfa||{},club=String(snap.clubId||rb.clubId||'1416'),t=today(),seen=new Set(),newOpp=new Map(),firstOf={};
  var ign=new Set(rb.ignored||[]),known=(rb.seriesKnown||[]).concat(Object.keys(rb.series||{}).map(function(k){return rb.series[k];}));
  var G={opp:[],A:[],B:[],player:[],other:[],gone:[],rem:[]};
  function add(list,it){if(!ign.has(it.key))list.push(it);}
  snap.matches.forEach(function(r){
    var team=r[0],id=String(r[1]),start=String(r[2]||''),hN=r[3]||'',hC=String(r[4]||''),aN=r[5]||'',aC=String(r[6]||''),series=r[7]||'',et=String(r[8]||''),state=String(r[9]||'');
    var venue={name:tidyVenue(r[10]),address:r[11]||'',postalCode:r[12]||'',city:tidyCity(r[13]||'')};
    if(start.length<16||(team!=='A'&&team!=='B'))return;
    var docId='rbfa-'+id;seen.add(docId);
    var home=hC===club,oc=home?aC:hC,on=home?aN:hN,date=start.slice(0,10),time=start.slice(11,16),oid=oc?'rbfa-'+oc:null;
    var kind=et==='friendly'?'oefen':et==='cup'?'beker':'competitie';
    if(kind==='competitie'&&series&&known.indexOf(series)<0){var f=firstOf[series];if(!f||date<f.date)firstOf[series]={team:team,date:date};}
    if(oid){var ex=S.opponents.get(oid);
      if(!ex){var n=newOpp.get(oid);if(!n){n={name:tidyTeam(on),venue:null,club:oc};newOpp.set(oid,n);}if(!home&&!n.venue&&venue.address)n.venue=venue;}
      else if(!home&&venue.address&&!ex.venue&&!G.other.some(function(x){return x.key==='oppVenue:'+oid;})){var tv=travelFor(snap,venue,oc)||{},d={venue:venue};if((ex.travelMin==null||ex.travelMin==='')&&tv.min!=null){d.travelMin=tv.min;d.routeMin=tv.routeMin==null?null:tv.routeMin;d.km=tv.km==null?null:tv.km;}
        add(G.other,{key:'oppVenue:'+oid,label:'Terrein van '+ex.name+': '+venueText(venue)+(d.travelMin!=null?' ('+d.travelMin+' min rijden)':''),writes:[['opponents',oid,'update',d]]});}
    }
    var oname=(oid&&S.opponents.get(oid)&&S.opponents.get(oid).name)||(oid&&newOpp.get(oid)&&newOpp.get(oid).name)||cleanName(on);
    var title=(home?teamLabel(team)+' – '+oname:oname+' – '+teamLabel(team));
    var m=S.matches.get(docId);
    if(!m){var nd={team:team,source:'rbfa',rbfaId:id,date:date,time:time,home:home,opponentId:oid,opponentName:on,kind:kind,series:kind==='competitie'?series:'',venue:venue,status:'gepland',players:null,wasId:null,trainers:null,onSchema:true,rbfaState:state||'planned',syncedAt:snap.fetchedAt||null};
      var exo=oid&&S.opponents.get(oid);if(!home&&exo&&exo.venue&&exo.venue.address&&vKey(exo.venue)!==vKey(venue)){var tv2=travelFor(snap,venue);if(tv2&&tv2.min!=null)nd.travelMin=tv2.min;}
      add(G[team],{key:'new:'+docId,date:date,label:'Nieuwe match: '+title+', '+dShort(date)+' '+time,short:dShort(date)+' '+time+' '+title,writes:[['matches',docId,'set',nd]]});return;}
    if(m.rbfaRemoved)add(G.other,{key:'back:'+docId,label:title+' staat weer in de RBFA-kalender',writes:[['matches',docId,'update',{rbfaRemoved:false}]]});
    if(m.date!==date||m.time!==time){var p={date:date,time:time,rbfaPrev:{date:m.date,time:m.time},meetTime:null};if(m.status==='verplaatst'&&m.newDate===date){p.status='gepland';p.newDate=null;p.newTime=null;}
      add(G.other,{key:'moved:'+docId+':'+date+' '+time,label:title+': verplaatst van '+dShort(m.date)+' '+m.time+' naar '+dShort(date)+' '+time,writes:[['matches',docId,'update',p]]});}
    if(venue.address&&m.venue&&m.venue.address&&norm(m.venue.address+m.venue.postalCode)!==norm(venue.address+venue.postalCode)){var vp={venue:venue};
      if(!home){var o3=oid&&S.opponents.get(oid),tv3=travelFor(snap,venue);if(o3&&o3.venue&&vKey(o3.venue)===vKey(venue))vp.travelMin=null;else if(tv3&&tv3.min!=null)vp.travelMin=tv3.min;}
      add(G.other,{key:'venue:'+docId+':'+norm(venue.address+venue.postalCode),label:title+': ander terrein, '+venueText(venue)+(vp.travelMin!=null?' ('+vp.travelMin+' min rijden)':''),writes:[['matches',docId,'update',vp]]});}
    if(state&&m.rbfaState&&state.toLowerCase()!==String(m.rbfaState).toLowerCase())add(G.other,{key:'state:'+docId+':'+state,label:title+': status in RBFA is nu "'+state+'"',writes:[['matches',docId,'update',{rbfaState:state}]]});
  });
  allMatches().forEach(function(m){if(m.source==='rbfa'&&!seen.has(m.id)&&!m.rbfaRemoved&&m.date>=t)add(G.rem,{key:'removed:'+m.id,date:m.date,label:matchTitle(m)+': staat niet meer in de RBFA-kalender',short:matchTitle(m),writes:[['matches',m.id,'update',{rbfaRemoved:true}]]});});
  newOpp.forEach(function(n,oid){var tv=(n.venue&&travelFor(snap,n.venue,n.club))||{},d={name:n.name,source:'rbfa',rbfaClubId:n.club,travelMin:tv.min!=null?tv.min:null};if(n.venue)d.venue=n.venue;if(tv.routeMin!=null){d.routeMin=tv.routeMin;d.km=tv.km==null?null:tv.km;}
    var info=n.venue?(n.venue.city+(tv.min!=null?', '+tv.min+' min rijden':', rijtijd nog invullen')):'thuismatch, geen terrein nodig';
    add(G.opp,{key:'opp:'+oid,label:'Nieuwe tegenstander: '+n.name+' ('+info+')',short:n.name+' ('+info+')',writes:[['opponents',oid,'set',d]]});});
  var inSnap=new Set(),byR=new Set();plist().forEach(function(p){if(p.rbfaId)byR.add(String(p.rbfaId));});
  var cand=new Map(),fresh=!plist().length;['A','B'].forEach(function(team){((snap.players||{})[team]||[]).forEach(function(r){var rid=String(r[0]),nm=String(r[1]||'').trim();if(!rid)return;inSnap.add(rid);if(!nm||byR.has(rid))return;var x=cand.get(rid)||{name:nm,cnt:{}};x.cnt[team]=Number(r[2])||0;cand.set(rid,x);});});
  cand.forEach(function(x,rid){var a=x.cnt.A,b=x.cnt.B,team=(a!=null&&(b==null||a>b))?'A':'B';
    var same=plist().filter(function(p){return !p.rbfaId&&norm(p.name)===norm(x.name);});
    if(same.length===1){add(G.other,{key:'link:'+rid,label:'Koppel '+same[0].name+' aan de RBFA-spelerslijst',writes:[['players',same[0].id,'update',{rbfaId:rid}]]});return;}
    add(G.player,{key:'player:'+rid,label:'Nieuwe speler in RBFA: '+x.name+' (speelde bij '+teamLabel(team)+')',short:x.name+' ('+team+')',writes:[['players','p-'+slug(x.name)+'-'+rid,'set',{name:x.name,team:team,active:true,order:99,rbfaId:rid,review:!fresh,suggestTeam:team}]]});});
  if(season&&inSnap.size){plist().forEach(function(p){if(p.rbfaId&&!inSnap.has(String(p.rbfaId))&&p.active!==false&&p.team!=='X')G.gone.push({key:'gone:'+p.id+':'+snap.teams.A.id,short:p.name,writes:[['players',p.id,'update',{active:false}]]});});}
  var head=[];Object.keys(firstOf).forEach(function(s){var f=firstOf[s];add(head,{key:'series:'+s,series:s,date:f.date,team:f.team,label:'Nieuwe reeks voor '+teamLabel(f.team)+': '+s+'. Speeldag 1 wordt de week van '+dayMonth(mondayOf(f.date)),writes:[]});});
  function group(list,max,label){if(list.length<=max)return list;var ds=list.map(function(i){return i.date;}).filter(Boolean).sort();
    return [{key:list[0].key,keys:list.map(function(i){return i.key;}),label:label(list,ds),sub:list.map(function(i){return i.short||i.label;}),writes:[].concat.apply([],list.map(function(i){return i.writes;}))}];}
  var out=head.concat(
    group(G.opp,3,function(l){return l.length+' nieuwe tegenstanders';}),
    group(G.A,3,function(l,ds){return teamLabel('A')+': '+l.length+' nieuwe matchen, '+dShort(ds[0])+' tot '+dShort(ds[ds.length-1]);}),
    group(G.B,3,function(l,ds){return teamLabel('B')+': '+l.length+' nieuwe matchen, '+dShort(ds[0])+' tot '+dShort(ds[ds.length-1]);}),
    G.other,
    group(G.rem,3,function(l){return l.length+' matchen staan niet meer in de RBFA-kalender en krijgen een waarschuwing';}),
    group(G.player,3,function(l){return l.length+' nieuwe spelers in RBFA'+(fresh?', ingedeeld bij de ploeg waar ze het meest speelden':' (kies daarna hun ploeg bij Spelers)');}));
  if(G.gone.length)out.push({key:G.gone[0].key,keys:G.gone.map(function(i){return i.key;}),label:'Niet meer bij '+snap.teams.A.name+' of '+snap.teams.B.name+' in RBFA, worden inactief (de historiek blijft):',sub:G.gone.map(function(i){return i.short;}),writes:[].concat.apply([],G.gone.map(function(i){return i.writes;}))});
  return out;
}
function applyRbfa(items,snap,season,gone){
  var c=cfg(),rb=c.rbfa||{},now=new Date().toISOString();
  var phases=(c.phases||[]).slice(),known=(rb.seriesKnown||Object.keys(rb.series||{}).map(function(k){return rb.series[k];})).slice(),series=Object.assign({},rb.series||{}),sc=false;
  items.forEach(function(it){
    it.writes.forEach(function(w){var d=Object.assign({},w[3]);d.updatedAt=now;if(w[2]==='set'&&!d.createdAt)d.createdAt=now;write(w[0],w[1],w[2],d);});
    if(it.series){sc=true;if(known.indexOf(it.series)<0)known.push(it.series);series[it.team]=it.series;var mon=mondayOf(it.date);if(!phases.some(function(p){return mondayOf(p)===mon;}))phases.push(it.date);}
  });
  var patch={rbfa:{lastSync:now,syncAt:0,clubId:String(snap.clubId),teamA:String(snap.teams.A.id),teamB:String(snap.teams.B.id),teamNames:{A:snap.teams.A.name,B:snap.teams.B.name}}};
  if(items.length){patch.rbfa.lastChanges=items.slice(0,40).map(function(i){return {l:i.label,s:(i.sub||[]).slice(0,30)};});patch.rbfa.lastChangesAt=now;}
  if(season&&gone&&gone.length)patch.rbfa.seasonNotice={at:now,teams:{A:snap.teams.A.name,B:snap.teams.B.name},gone:gone};
  if(sc){patch.rbfa.seriesKnown=known;patch.rbfa.series=series;patch.phases=phases.sort();}
  if(S.config)write('config','main','update',patch);else write('config','main','set',merge(DEFAULT_CONFIG,patch));
}
var GQ_URL='https://datalake-prod2018.rbfa.be/graphql';
var Q_TEAMS='query($clubId:ID!,$language:Language!){clubTeams(clubId:$clubId,language:$language){id name}}';
var Q_CAL='query($teamId:ID!,$language:Language!,$sortByDate:SortDirection){teamCalendar(teamId:$teamId,language:$language,sortByDate:$sortByDate){id startTime state homeTeam{name clubId}awayTeam{name clubId}series{name}}}';
var Q_DET='query($matchId:ID!,$language:Language!){matchDetail(matchId:$matchId,language:$language){eventType state location{name address postalCode city}}}';
var Q_MEM='query($teamId:ID!,$language:Language!){teamMembers(teamId:$teamId,language:$language){players{id firstName lastName statistics{numberOfMatches}}}}';
var CLUBTEAMS=null,SYNC_EVERY=20*60e3;
function gq(query,variables){return fetch(GQ_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:query,variables:variables})}).then(function(r){if(!r.ok)throw new Error('RBFA antwoordt niet ('+r.status+')');return r.json();}).then(function(j){if(j.errors&&j.errors.length)throw new Error(j.errors[0].message);return j.data;});}
function sleep(ms){return new Promise(function(r){setTimeout(r,ms);});}
function clubTeams(){var r=cfg().rbfa||{};return gq(Q_TEAMS,{clubId:String(r.clubId||'1416'),language:'nl'}).then(function(d){CLUBTEAMS=(d.clubTeams||[]).map(function(t){return {id:String(t.id),name:String(t.name)};});return CLUBTEAMS;});}
function findTeam(list,name){var n=String(name||'').trim().toLowerCase();for(var i=0;i<list.length;i++){if(list[i].name.trim().toLowerCase()===n)return list[i];}return null;}
async function rbfaFetch(){
  var c=cfg(),r=c.rbfa||{},tn=r.teamNames||{A:'U11 A',B:'U11 B'},club=String(r.clubId||'1416');
  var teams=await clubTeams();
  var tA=findTeam(teams,tn.A),tB=findTeam(teams,tn.B);
  if(!tA||!tB){var e=new Error('Ploeg '+(!tA?tn.A:tn.B)+' niet gevonden bij RBFA. Kies de juiste ploeg bij Meer, RBFA.');e.code='team';throw e;}
  var snap={app:'hechtel-u11',v:2,fetchedAt:new Date().toISOString(),clubId:club,teams:{A:{id:tA.id,name:tA.name},B:{id:tB.id,name:tB.name}},matches:[],players:{},travel:{}};
  var recent=addDays(today(),-7);
  for(const pair of [['A',tA],['B',tB]]){
    var k=pair[0],team=pair[1];
    var cal=(await gq(Q_CAL,{teamId:team.id,language:'nl',sortByDate:'asc'})).teamCalendar||[];
    for(const m of cal){
      var start=String(m.startTime||''),ex=S.matches.get('rbfa-'+m.id),v=(ex&&ex.venue)||{};
      var row=[k,String(m.id),start,(m.homeTeam&&m.homeTeam.name)||'',String((m.homeTeam&&m.homeTeam.clubId)||''),(m.awayTeam&&m.awayTeam.name)||'',String((m.awayTeam&&m.awayTeam.clubId)||''),(m.series&&m.series.name)||'',ex?(ex.kind==='oefen'?'friendly':ex.kind==='beker'?'cup':'championship'):'',m.state||'',v.name||'',v.address||'',v.postalCode||'',v.city||''];
      if(!ex||start.slice(0,10)>=recent){
        var d=(await gq(Q_DET,{matchId:String(m.id),language:'nl'})).matchDetail||{},l=d.location||{};
        row[8]=d.eventType||row[8];row[9]=d.state||row[9];row[10]=l.name||'';row[11]=l.address||'';row[12]=l.postalCode||'';row[13]=l.city||'';
      }
      snap.matches.push(row);
    }
    var mem=((await gq(Q_MEM,{teamId:team.id,language:'nl'})).teamMembers||{}).players||[];
    snap.players[k]=mem.map(function(p){return [String(p.id),(String(p.firstName||'').trim().split(/\s+/)[0]+' '+String(p.lastName||'').trim().charAt(0).toUpperCase()).trim(),(p.statistics&&p.statistics.numberOfMatches)||0];});
  }
  await addTravel(snap);
  return snap;
}
async function addTravel(snap){
  var c=cfg(),club=snap.clubId,t=today(),cache={},todo=[];
  try{cache=JSON.parse(localStorage.getItem('hu11.travel')||'{}')||{};}catch(e){}
  snap.matches.forEach(function(r){
    if(r[4]===club||!r[11]||String(r[2]).slice(0,10)<t)return;
    var key=r[12]+'|'+r[11],o=S.opponents.get('rbfa-'+r[4]);
    if(o&&o.venue&&vKey(o.venue)===key&&o.travelMin!=null&&o.travelMin!=='')return;
    if(cache[key]){snap.travel[key]=cache[key];return;}
    if(!todo.some(function(x){return x.key===key;}))todo.push({key:key,addr:r[11],pc:r[12],city:r[13],name:r[10]});
  });
  var home=[Number(c.home.lat)||51.1087052,Number(c.home.lon)||5.3664466];
  for(const v of todo){
    try{
      var street=String(v.addr).replace(/\s+z\/n$/i,'').trim(),g=null;
      var tries=['street='+encodeURIComponent(street)+'&postalcode='+encodeURIComponent(v.pc)+'&country=Belgium','q='+encodeURIComponent(street+', '+v.pc+' '+v.city+', Belgium'),'q='+encodeURIComponent(String(v.name).replace(/^Cmp:\s*/i,'')+', '+v.city+', Belgium')];
      for(const q of tries){
        var res=await (await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&addressdetails=1&'+q)).json();await sleep(1100);
        var hit=(res||[]).find(function(h){return String((h.address&&h.address.postcode)||'').slice(0,4)===String(v.pc).slice(0,4);});
        if(hit){g=hit;break;}
      }
      if(!g)continue;
      var o=await (await fetch('https://router.project-osrm.org/route/v1/driving/'+home[1]+','+home[0]+';'+g.lon+','+g.lat+'?overview=false')).json(),rt=o&&o.routes&&o.routes[0];
      if(!rt)continue;
      var tv={min:Math.ceil(rt.duration/60/5)*5,routeMin:Math.round(rt.duration/6)/10,km:Math.round(rt.distance/100)/10};
      snap.travel[v.key]=tv;cache[v.key]=tv;try{localStorage.setItem('hu11.travel',JSON.stringify(cache));}catch(e){}
    }catch(e){}
  }
}
async function syncRbfa(manual){
  if(S.sync.busy||!DB||S.db!=='ready'||!S.config)return;
  var r=cfg().rbfa||{},now=Date.now();
  if(!manual){
    if(r.lastSync&&now-new Date(r.lastSync).getTime()<SYNC_EVERY)return;
    if(r.syncAt&&now-Number(r.syncAt)<2*60e3)return;
  }
  S.sync={busy:true,err:null};render();
  saveCfg('rbfa.syncAt',now);
  try{
    var snap=await rbfaFetch();
    var season=teamsDiffer(snap),items=rbfaDiff(snap,season),gone=[],auto=[];
    items.forEach(function(it){if(String(it.key).indexOf('gone:')===0)gone=gone.concat(it.writes.map(function(w){return w[1];}));else auto.push(it);});
    applyRbfa(auto,snap,season,gone);
    S.sync={busy:false,err:null,n:auto.length};
    if(auto.length)toast('RBFA: '+auto.length+(auto.length>1?' wijzigingen':' wijziging')+' verwerkt.',function(){openSheet('changes');},'Bekijk');
    else if(manual)toast('RBFA nagekeken: alles klopt.');
  }catch(e){
    S.sync={busy:false,err:(e&&e.message)||String(e),code:e&&e.code};
    saveCfg('rbfa.syncAt',0);
    if(manual)toast('RBFA nakijken lukt niet: '+S.sync.err);
  }
  render();
}
function syncChip(){
  var r=cfg().rbfa||{};
  if(S.sync.busy)return '<span class="flag mute">'+ic('spin')+'RBFA-kalender nakijken…</span>';
  if(S.sync.err&&S.sync.code==='team')return '<button class="flag bad" data-a="nav" data-v="more">'+ic('alert')+esc(S.sync.err.split('. ')[0])+': <u>kies de ploeg bij Meer</u></button>';
  if(S.sync.err)return '<button class="flag bad" data-a="syncNow">'+ic('alert')+'RBFA niet bereikbaar: <u>opnieuw</u></button>';
  if(r.lastChangesAt&&Date.now()-new Date(r.lastChangesAt).getTime()<3*864e5&&(r.lastChanges||[]).length)return '<button class="flag info" data-a="changesOpen">'+ic('info')+'RBFA: '+r.lastChanges.length+(r.lastChanges.length>1?' wijzigingen':' wijziging')+' verwerkt '+esc(isoStamp(r.lastChangesAt))+'</button>';
  return '';
}
function weekChanged(wk){var w=S.weeks.get(wk);if(!w||!w.exportedAt)return null;var ms=matchesInWeek(wk);var ch=ms.some(function(m){return m.updatedAt&&m.updatedAt>w.exportedAt;});return ch?w.exportedAt:null;}
function defaultWeek(){var t=today(),hm=nowHM();var ups=allMatches().filter(function(m){var e=eff(m);return m.status!=='geannuleerd'&&(e.date>t||(e.date===t&&e.time>=hm));}).sort(cmpEff);return ups.length?mondayOf(eff(ups[0]).date):mondayOf(t);}

/* ================= db + writes ================= */
var queues=new Map();
function applyTo(col,id,op){
  if(col==='config'){S.config=op.mode==='set'?op.data:merge(S.config||{},op.data);CFG=null;return;}
  var map=S[col];if(!map)return;
  if(op.mode==='delete')map.delete(id);
  else if(op.mode==='set')map.set(id,Object.assign({id:id},op.data));
  else map.set(id,merge(map.get(id)||{id:id},op.data));
}
function write(col,id,mode,data){
  if(!S.canWrite){toast('Je kan deze planning enkel bekijken.');return false;}
  if(!DB){toast('De gedeelde gegevens zijn niet beschikbaar.');return false;}
  var op={mode:mode,data:data};applyTo(col,id,op);
  var key=col+'/'+id,q=queues.get(key);if(!q){q={ops:[],running:false,inflight:null};queues.set(key,q);}
  q.ops.push(op);render();pump(key);return true;
}
function upd(col,id,patch){if((col==='matches'||col==='players'||col==='opponents')&&!patch.updatedAt)patch.updatedAt=new Date().toISOString();return write(col,id,'update',patch);}
function pump(key){
  var q=queues.get(key);if(!q||q.running)return;q.running=true;
  (function next(){
    if(!q.ops.length){q.running=false;q.inflight=null;queues.delete(key);return;}
    var op=q.ops.shift();
    while(op.mode==='update'&&q.ops.length&&q.ops[0].mode==='update'){op={mode:'update',data:merge(op.data,q.ops.shift().data)};}
    if(op.mode==='set'&&q.ops.length&&q.ops[0].mode==='update'){var d=op.data;while(q.ops.length&&q.ops[0].mode==='update')d=merge(d,q.ops.shift().data);op={mode:'set',data:d};}
    q.inflight=op;var ref=DB.doc(key),tries=0;
    (function attempt(){
      var pr=op.mode==='set'?ref.set(op.data):op.mode==='update'?ref.update(op.data):ref.delete();
      pr.then(function(){q.inflight=null;next();},function(err){
        var code=err&&err.code;
        if(code==='unavailable'&&tries<1){tries++;setTimeout(attempt,600+Math.random()*900);return;}
        q.inflight=null;
        if(code==='permission-denied'){toast('Bewaren lukt niet: je hebt geen toegang.');}
        else if(code==='resource-exhausted'){toast('De dagelijkse limiet van de database is bereikt. Probeer later opnieuw.');}
        else toast('Bewaren mislukt ('+(code||'fout')+'). Probeer opnieuw.');
        next();
      });
    })();
  })();
}
function overlay(col,map){queues.forEach(function(q,key){var i=key.indexOf('/'),c=key.slice(0,i),id=key.slice(i+1);if(c!==col)return;[q.inflight].concat(q.ops).forEach(function(op){if(!op)return;if(op.mode==='delete')map.delete(id);else if(op.mode==='set')map.set(id,Object.assign({id:id},op.data));else map.set(id,merge(map.get(id)||{id:id},op.data));});});return map;}
var UNSUBS=[],SUBGEN=0;
function makeDB(fs){
  function wrap(s){return {id:s.id,exists:s.exists,fromCache:!!(s.metadata&&s.metadata.fromCache),data:function(){return s.data();}};}
  function em(e){return {code:(e&&e.code)||'unavailable',message:(e&&e.message)||''};}
  return {
    doc:function(path){var r=fs.doc(path);return {
      set:function(d){return r.set(d);},
      update:function(d){return r.set(d,{merge:true});},
      delete:function(){return r.delete();},
      onSnapshot:function(n,er){return r.onSnapshot(function(s){n(wrap(s));},function(e){if(er)er(em(e));});}};},
    collection:function(col){var r=fs.collection(col);return {
      onSnapshot:function(n,er){return r.onSnapshot(function(q){n({docs:q.docs.map(wrap),size:q.size});},function(e){if(er)er(em(e));});}};}
  };
}
function subscribe(){
  stopSubs();var gen=++SUBGEN,err=function(e){if(gen===SUBGEN)subErr(e);};
  UNSUBS.push(DB.doc('config/main').onSnapshot(function(s){if(gen!==SUBGEN)return;if(!s.exists&&s.fromCache&&!S.loaded.config)return;S.config=s.exists?s.data():null;var q=queues.get('config/main');if(q)[q.inflight].concat(q.ops).forEach(function(op){if(op)S.config=op.mode==='set'?op.data:merge(S.config||{},op.data);});CFG=null;S.loaded.config=true;onData();},err));
  ['players','opponents','matches','weeks','members'].forEach(function(col){
    UNSUBS.push(DB.collection(col).onSnapshot(function(snap){if(gen!==SUBGEN)return;var m=new Map();snap.docs.forEach(function(d){if(d.exists)m.set(d.id,Object.assign({id:d.id},d.data()));});S[col]=overlay(col,m);S.loaded[col]=true;onData();},err));
  });
}
function stopSubs(){SUBGEN++;UNSUBS.forEach(function(u){try{u();}catch(e){}});UNSUBS=[];S.loaded={};}
function subErr(e){if(e&&e.code==='permission-denied'){stopSubs();
    if(!S.retried&&S.user){S.retried=true;var u=AUTH&&AUTH.currentUser;setTimeout(function(){if(!S.user)return;(u?u.getIdToken(true):Promise.resolve()).then(subscribe,subscribe);},1500);return;}
    S.db='denied';render();return;}toast('Verbinding met de gegevens verbroken. Herlaad de pagina.');}
function onData(){
  if(S.db==='denied')return;
  if(['config','players','opponents','matches','weeks','members'].every(function(k){return S.loaded[k];})){
    var me=S.user&&S.members.get(S.user.email);S.owner=!!(S.user&&!me);S.admin=!!(S.user&&(S.owner||me.role==='admin'));
    S.retried=false;if(S.db!=='ready'){S.db='ready';setTimeout(function(){syncRbfa(false);},600);}
    if(!S.week&&S.matches.size)S.week=defaultWeek();
  }
  render();
}

/* ================= rendering ================= */
var rq=false,deferred=false;
function render(){if(rq)return;rq=true;requestAnimationFrame(function(){rq=false;if(isTyping()){deferred=true;return;}doRender();});}
function isTyping(){var a=document.activeElement;return !!(a&&a.closest&&a.closest('#view')&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='checkbox'&&a.type!=='radio');}
document.addEventListener('focusout',function(){if(deferred){deferred=false;setTimeout(render,30);}});

function doRender(){
  CFG=null;
  var app=$('#app');app.classList.toggle('locked',S.db!=='ready'||!S.config);
  document.querySelectorAll('.tab').forEach(function(t){if(t.dataset.v===S.view)t.setAttribute('aria-current','page');else t.removeAttribute('aria-current');});
  var si=$('#syncinfo'),c=cfg(),ls=c.rbfa&&c.rbfa.lastSync;si.textContent=(S.db!=='ready'||!S.config)?'':(S.sync.busy?'RBFA nakijken…':(ls?'RBFA nagekeken '+isoStamp(ls):''));
  var v=$('#view');
  if(S.db==='wait'){v.innerHTML='<div class="loading"><div class="skel"></div><p>Kalender en spelers laden…</p></div>';return;}
  if(S.db==='noconfig'){v.innerHTML=gate('Nog niet ingesteld','<p>Deze website is nog niet gekoppeld aan een database. Vul config.js in.</p>');return;}
  if(S.db==='login'){v.innerHTML=viewLogin();return;}
  if(S.db==='denied'){v.innerHTML=viewDenied();return;}
  if(!S.config){v.innerHTML=viewOnboard();return;}
  computeSugg();
  var html='';
  if(S.view==='week')html+=viewWeek();else if(S.view==='cal')html+=viewCal();else if(S.view==='players')html+=viewPlayers();else html+=viewMore();
  v.innerHTML=html;
  if(S.view==='more'&&!CLUBTEAMS&&!S.teamsLoading){S.teamsLoading=true;clubTeams().then(function(){S.teamsLoading=false;render();},function(){S.teamsLoading=false;});}
}
function gate(title,body){return '<div class="gate"><span class="crest big" aria-hidden="true">U11</span><h1>'+esc(title)+'</h1>'+body+'</div>';}
function viewLogin(){var st=S.login||{};
  if(st.step==='sent')return gate('Check je mailbox','<p>We stuurden een inloglink naar <b>'+esc(st.email)+'</b>. Open die link op dit toestel. Niets ontvangen? Kijk ook bij spam.</p>'+
    '<details class="gx"><summary>Opent de link in een andere browser of app?</summary><p class="hint">Kopieer de link uit de mail en plak hem hier.</p><form data-form="useLink" class="row"><input type="url" id="lg-link" placeholder="Plak de link uit de mail" autocomplete="off" aria-label="Link uit de mail"><button class="btn primary" type="submit">Inloggen</button></form></details>'+
    '<p style="margin-top:16px"><button class="btn ghost" data-a="loginAgain">Ander e-mailadres of nieuwe link</button></p>');
  if(st.step==='confirm')return gate('Bevestig je e-mailadres','<p>Vul het e-mailadres in waarmee je de inloglink aanvroeg.</p><form data-form="confirmLink" class="row"><input type="email" id="lg-mail" autocomplete="email" required placeholder="naam@voorbeeld.be" aria-label="E-mailadres"><button class="btn primary" type="submit">Inloggen</button></form>');
  return gate('Inloggen','<p>Log in met je e-mailadres. Je krijgt een link in je mailbox, een wachtwoord is niet nodig.</p><form data-form="login" class="row"><input type="email" id="lg-mail" autocomplete="email" required placeholder="naam@voorbeeld.be" aria-label="E-mailadres" value="'+esc(st.email||'')+'"><button class="btn primary" type="submit"'+(st.busy?' disabled':'')+'>Stuur link</button></form><p class="hint">Alleen e-mailadressen die de beheerder toevoegde, krijgen toegang.</p><p class="hint"><a href="handleiding.html">Eerste keer? Lees de korte handleiding.</a></p>');
}
function viewDenied(){return gate('Nog geen toegang','<p>Je bent aangemeld als <b>'+esc(S.user&&S.user.email)+'</b>, maar dat adres heeft nog geen toegang tot de planner. Vraag de beheerder om het toe te voegen.</p><p class="row" style="justify-content:center"><button class="btn" data-a="signOut">Afmelden</button><button class="btn ghost" data-a="retryAccess">Opnieuw proberen</button></p>');}
function viewOnboard(){
  if(!S.admin)return gate('Nog niet ingesteld','<p>De beheerder moet de planner nog instellen. Probeer het later opnieuw.</p><p><button class="btn" data-a="signOut">Afmelden</button></p>');
  return gate('Nieuwe planner','<p>Zet eerst de gegevens van de vorige planner terug, of begin leeg. Daarna haalt de planner de RBFA-kalender automatisch op.</p><p class="row" style="justify-content:center;flex-wrap:wrap"><label class="btn primary">'+ic('download')+'Bestand terugzetten<input type="file" accept=".json,application/json" data-ch="importFile" hidden></label><button class="btn" data-a="startEmpty">Leeg beginnen</button></p>');
}

function flagHTML(f,m){
  var icn=f.lvl==='info'?ic('info'):ic('alert');
  if(f.a==='ackRbfa')return '<span class="flag info">'+icn+esc(f.t)+' <button class="mini" style="background:var(--info);border-color:var(--info)" data-a="ackRbfa" data-id="'+esc(m.id)+'">OK</button></span>';
  if(f.a==='editOpp')return '<button class="flag '+f.lvl+'" data-a="editOpp" data-o="'+esc(m.opponentId||'')+'">'+icn+'<u>'+esc(f.t)+'</u></button>';
  return '<span class="flag '+f.lvl+'">'+icn+esc(f.t)+'</span>';
}

/* ---------- Speeldag ---------- */
function viewWeek(){
  var wk=S.week||defaultWeek(),ms=matchesInWeek(wk),gh=ghostsInWeek(wk),dw=defaultWeek();
  var h='<section class="weekbar">'+
    '<button class="icon-btn" data-a="wk" data-d="-1" aria-label="Vorige week">'+ic('chevL')+'</button>'+
    '<div class="wk-title"><button data-a="weekTitle" title="Titel aanpassen"><h1>'+esc(weekTitle(wk))+'</h1></button><p>'+esc(weekRange(wk,ms))+'</p></div>'+
    '<button class="icon-btn" data-a="wk" data-d="1" aria-label="Volgende week">'+ic('chevR')+'</button>'+
    '<div class="wk-actions">'+(wk!==dw?'<button class="btn ghost" data-a="wkNow">Eerstvolgende</button>':'')+
    '<button class="btn primary" data-a="export"'+(ms.length?'':' disabled')+'>'+ic('download')+'Exporteer</button></div></section>';
  var sum=[];var ch=weekChanged(wk);
  if(ch)sum.push('<span class="flag warn">'+ic('alert')+'Gewijzigd na de export van '+esc(isoStamp(ch))+': deel het schema opnieuw</span>');
  else if(S.weeks.get(wk)&&S.weeks.get(wk).exportedAt)sum.push('<span class="flag ok">'+ic('check')+'Geëxporteerd '+esc(isoStamp(S.weeks.get(wk).exportedAt))+'</span>');
  var scp=syncChip();if(scp)sum.push(scp);
  if(sum.length)h+='<div class="summary">'+sum.join('')+'</div>';
  if(!ms.length&&!gh.length){
    var any=S.matches.size>0;
    h+='<div class="empty"><b>Geen matchen deze week</b>'+(any?'Blader naar een andere week of voeg zelf een match toe.':'De kalender is nog leeg. De RBFA-matchen worden automatisch ingeladen; een match die niet in de kalender staat voeg je zelf toe.')+'</div>';
  }else{
    h+='<div class="cards">'+ms.map(cardHTML).join('')+'</div>';
    if(gh.length)h+='<div style="margin-top:12px;display:grid;gap:8px">'+gh.map(function(m){var e=eff(m);return '<div class="ghostline">'+ic('cal')+'<span><b>'+esc(teamLabel(m.team))+'</b> tegen '+esc(oppName(m))+' is verplaatst naar '+esc(dShort(e.date))+' '+esc(e.time)+'</span><button class="btn sm" data-a="goWeek" data-wk="'+mondayOf(e.date)+'">Ga naar die week</button></div>';}).join('')+'</div>';
  }
  h+='<div class="week-foot"><button class="btn ghost" data-a="newMatch" data-wk="'+wk+'">'+ic('plus')+'Match toevoegen</button></div>';
  return h;
}
function cardHTML(m){
  var e=eff(m),cancel=m.status==='geannuleerd',mt=meet(m),sel=selection(m),wid=wasOf(m),sug=m.wasId?null:S.sugg.get(m.id),past=e.date<today();
  var us='<span class="hc">'+esc(teamLabel(m.team))+'</span>',them='<span>'+esc(oppName(m))+'</span>';
  var tmpl=template(m.team),bench=tmpl.filter(function(id){return sel.indexOf(id)<0;});
  var sub;
  if(m.home)sub=mt.src==='manual'?'aangepast':mt.src==='auto'?'1 u voor de aftrap':'thuismatch';
  else sub=mt.src==='manual'?'aangepast':mt.src==='missing'?'rijtijd ontbreekt':(mt.travel+' min rijden'+(m.venue&&m.venue.city?' · '+m.venue.city:''));
  var kindTxt=(m.kind&&m.kind!=='competitie')?KIND[m.kind]:(m.series||'Competitie');
  var fl=flags(m);
  var h='<article class="mcard'+(cancel?' cancelled':'')+'">'+
    '<div class="mhead"><span class="tag '+(m.team==='A'?'A':'B')+'">'+esc(m.team)+'</span><span class="series">'+esc(kindTxt)+' · '+(m.home?'thuis':'uit')+'</span>'+
    (m.onSchema===false?'<span class="flag mute">niet op schema</span>':'')+
    '<button class="st st-'+esc(m.status||'gepland')+'" data-a="status" data-id="'+esc(m.id)+'">'+esc(STATUS[m.status||'gepland'])+'</button>'+
    '<button class="icon-btn sm" data-a="mmenu" data-id="'+esc(m.id)+'" aria-label="Meer opties">'+ic('dots')+'</button></div>'+
    '<div class="mbody"><div class="mdate">'+esc(dLong(e.date))+(e.moved?' <span class="movedtag">verplaatst</span>':'')+'</div>'+
    '<div class="mline">'+(m.home?us+' – '+them:them+' – '+us)+' <span class="ko">'+esc(e.time)+'</span></div>';
  if(cancel)h+='<div class="cancelnote">Geannuleerd</div>';
  else h+='<button class="mmeet" data-a="times" data-id="'+esc(m.id)+'"><span class="t'+(mt.time?'':' miss')+'">'+esc(mt.time||'--:--')+'</span><span class="pl">'+esc(mt.place)+'</span><small>'+esc(sub)+'</small></button>';
  if(fl.length)h+='<div class="flags">'+fl.map(function(f){return flagHTML(f,m);}).join('')+'</div>';
  if(m.note)h+='<p class="note">'+esc(m.note)+'</p>';
  if(!cancel){
    var mid=esc(m.id);
    h+='<div class="sellbl"><span>Selectie</span><span class="count">'+sel.length+' spelers</span></div>';
    h+='<ul class="plist">'+sel.map(function(id){var p=S.players.get(id),isW=id===wid,isS=!wid&&id===sug,guest=p.team!==m.team;
      return '<li class="pchip'+(isW?' was':'')+(isS?' sugg':'')+'"><span class="pname">'+((isW||isS)?ic('shirt'):'')+'<span class="pn-t">'+esc(p.name)+'</span>'+(guest?'<small>'+(p.team==='X'?'extern':esc(p.team))+'</small>':'')+'</span>'+
        '<button class="pout" data-a="pOut" data-id="'+mid+'" data-p="'+esc(id)+'" aria-label="'+esc(p.name)+' uit de selectie halen" title="Uit de selectie halen">'+ic('x')+'</button></li>';}).join('')+'</ul>';
    h+='<div class="bench">'+(bench.length?'<span class="lbl">Niet geselecteerd, tik om toe te voegen</span>':'')+bench.map(function(id){return '<button class="bchip" data-a="pIn" data-id="'+mid+'" data-p="'+esc(id)+'">'+ic('plus')+esc(pName(id))+'</button>';}).join('')+'<button class="bchip add" data-a="addP" data-id="'+mid+'">'+ic('plus')+'Andere speler</button></div>';
    var wb;
    if(wid)wb='<div class="wasbox set">'+ic('shirt')+'<span class="wt"><small>Was + broodjes</small><b>'+esc(pName(wid))+'</b></span><span class="wbtn"><button class="btn sm" data-a="wasPick" data-id="'+mid+'">Wijzig</button></span></div>';
    else if(sug)wb='<div class="wasbox sugg">'+ic('shirt')+'<span class="wt"><small>Was + broodjes: voorstel</small><b>'+esc(pName(sug))+'</b></span><span class="wbtn"><button class="btn sm ok" data-a="wasOk" data-id="'+mid+'" data-p="'+esc(sug)+'">'+ic('check')+'Bevestig</button><button class="btn sm" data-a="wasPick" data-id="'+mid+'">Ander</button></span></div>';
    else wb='<div class="wasbox none">'+ic('shirt')+'<span class="wt"><small>Was + broodjes</small><b>'+(past?'niet ingevuld':'nog niemand')+'</b></span><span class="wbtn"><button class="btn sm" data-a="wasPick" data-id="'+mid+'">Kies</button></span></div>';
    h+='<div class="mfoot">'+wb+'<button class="trainers" data-a="trainers" data-id="'+mid+'">Trainers: <b>'+esc(m.trainers||teamTrainers(m.team)||'niet ingevuld')+'</b>'+ic('edit')+'</button></div>';
  }
  return h+'</div></article>';
}

/* ---------- Kalender ---------- */
function viewCal(){
  var t=today(),tw=mondayOf(t),groups=new Map();
  allMatches().forEach(function(m){var wk=weekOf(m);if(!groups.has(wk))groups.set(wk,[]);groups.get(wk).push(m);});
  var wks=Array.from(groups.keys()).sort().filter(function(wk){return S.showPast||wk>=tw;});
  var selN=Array.from(S.calSel).filter(function(w){return groups.has(w);}).length;
  var h='<section class="calbar"><h1>Kalender</h1>'+
    '<label class="chk"><input type="checkbox" data-ch="showPast"'+(S.showPast?' checked':'')+'> Toon voorbije weken</label>'+
    '<button class="btn ghost" data-a="syncNow"'+(S.sync.busy?' disabled':'')+'>'+ic(S.sync.busy?'spin':'download')+(S.sync.busy?'RBFA nakijken…':'RBFA nakijken')+'</button>'+
    '<button class="btn ghost" data-a="newMatch">'+ic('plus')+'Match toevoegen</button>'+
    '<button class="btn primary" data-a="calExport"'+(selN?'':' disabled')+'>'+ic('download')+(selN?'Exporteer '+selN+(selN>1?' speeldagen':' speeldag'):'Exporteer selectie')+'</button></section>'+(selN?'':'<p class="hint" style="margin-top:-4px">Vink een of meer speeldagen aan om ze samen te exporteren.</p>');
  if(!wks.length)return h+'<div class="empty"><b>Nog geen matchen</b>Zodra de RBFA-kalender ingeladen is, verschijnen hier alle matchen van Hechtel A en B.</div>';
  h+='<div class="cal">'+wks.map(function(wk){
    var ms=groups.get(wk).sort(cmpEff),A=ms.filter(function(m){return m.team==='A';}),B=ms.filter(function(m){return m.team==='B';}),isPast=addDays(wk,6)<t;
    var ch=weekChanged(wk);
    return '<div class="calrow'+(wk===mondayOf(defaultWeek())?' now':'')+(isPast?' past':'')+'">'+
      '<input type="checkbox" aria-label="Selecteer '+esc(weekTitle(wk))+'" data-ch="calSel" data-wk="'+wk+'"'+(S.calSel.has(wk)?' checked':'')+' style="width:18px;height:18px;margin-top:3px;accent-color:var(--ink)">'+
      '<div class="calwk"><b>'+esc(weekTitle(wk))+'</b><span>'+esc(weekRange(wk,ms))+'</span>'+(ch?'<div class="flag warn" style="margin-top:6px">'+ic('alert')+'gewijzigd na export</div>':'')+'</div>'+
      '<div class="calcell">'+(A.length?A.map(calCell).join(''):'<div class="nomatch">'+esc(teamLabel('A'))+': geen match</div>')+'</div>'+
      '<div class="calcell">'+(B.length?B.map(calCell).join(''):'<div class="nomatch">'+esc(teamLabel('B'))+': geen match</div>')+'</div></div>';
  }).join('')+'</div>';
  return h;
}
function calCell(m){
  var e=eff(m),mt=meet(m),cancel=m.status==='geannuleerd',w=m.wasId||S.sugg.get(m.id),fl=flags(m);
  var lvl=fl.some(function(f){return f.lvl==='bad';})?'bad':fl.some(function(f){return f.lvl==='warn';})?'warn':fl.some(function(f){return f.lvl==='info';})?'info':'';
  return '<button class="cm'+(cancel?' cancelled':'')+'" data-a="goWeek" data-wk="'+weekOf(m)+'">'+
    '<span class="cm1"><span class="tg '+(m.team==='A'?'A':'')+'">'+esc(m.team)+'</span><span class="hu">'+(m.home?'thuis':'uit')+'</span><span class="on">'+esc(oppName(m))+'</span>'+((m.status&&m.status!=='gepland')?'<span class="st st-'+esc(m.status)+'">'+esc(STATUS[m.status])+'</span>':'')+(lvl?'<span class="dot '+lvl+'" title="'+esc(fl.map(function(f){return f.t;}).join(' · '))+'"></span>':'')+'</span>'+
    '<span class="cm2">'+esc(dShort(e.date))+' · aftrap '+esc(e.time)+(cancel?'':' · <b class="t">'+esc(mt.time||'--:--')+'</b> '+esc(mt.place))+'</span>'+
    (cancel?'':'<span class="cm3">'+(w?'<span class="g'+(m.wasId?'':' sg')+'">'+ic('shirt')+esc(pName(w))+(m.wasId?'':' (voorstel)')+'</span>':'')+'<span class="n">'+selection(m).length+' spelers</span></span>')+
  '</button>';
}

/* ---------- Spelers ---------- */
function viewPlayers(){
  var st=wasStats(),groups={A:[],B:[],X:[]},review=[];
  plist().forEach(function(p){if(p.review){review.push(p);return;}(groups[p.team]||groups.X).push(p);});
  Object.keys(groups).forEach(function(k){groups[k].sort(function(a,b){return ((a.active===false)-(b.active===false))||byOrder(a,b);});});
  function col(k,title){var act=groups[k].filter(function(p){return p.active!==false;}).length;
    return '<section class="panel pcol'+(S.ptab===k?' on':'')+'"><div class="ph"><h2>'+esc(title)+' <span class="cnt">'+act+'</span></h2></div>'+(groups[k].map(function(p){return prow(p,st);}).join('')||'<p class="hint">Nog geen spelers.</p>')+'</section>';}
  var h='<section class="ptop"><h1>Spelers</h1>'+
    '<form class="padd" data-form="addPlayer"><input type="text" id="np-name" placeholder="Nieuwe speler, bv. Tibo V" autocomplete="off" aria-label="Naam nieuwe speler"><select id="np-team" aria-label="Ploeg"><option value="A">'+esc(teamLabel('A'))+'</option><option value="B">'+esc(teamLabel('B'))+'</option><option value="X">Extern</option></select><button class="btn primary" type="submit">'+ic('plus')+'Toevoegen</button></form></section>';
  if(review.length)h+='<div class="review">'+review.map(function(p){return '<div class="rrow"><span>'+ic('alert')+'<span><b>'+esc(p.name)+'</b> staat nieuw in de RBFA-spelerslijst'+(p.suggestTeam?', speelde al bij '+esc(teamLabel(p.suggestTeam)):'')+'. Bij welke ploeg hoort hij of zij?</span></span><span class="ract"><button class="btn sm" data-a="pTeam" data-p="'+esc(p.id)+'" data-to="A">A</button><button class="btn sm" data-a="pTeam" data-p="'+esc(p.id)+'" data-to="B">B</button><button class="btn sm" data-a="pTeam" data-p="'+esc(p.id)+'" data-to="X">Extern</button></span></div>';}).join('')+'</div>';
  var sn=(cfg().rbfa||{}).seasonNotice,gone=(sn&&sn.gone)?sn.gone.filter(function(id){var p=S.players.get(id);return p&&p.active!==false;}):[];
  if(gone.length)h+='<div class="review"><div class="rrow"><span>'+ic('info')+'<span>Nieuw seizoen: <b>'+esc(gone.map(pName).join(', '))+'</b> '+(gone.length>1?'staan':'staat')+' niet bij '+esc(sn.teams.A)+' of '+esc(sn.teams.B)+' in RBFA. Inactief zetten? De historiek blijft bewaard.</span></span><span class="ract"><button class="btn sm" data-a="goneOff">Inactief zetten</button><button class="btn sm ghost" data-a="goneKeep">Laten staan</button></span></div></div>';
  h+='<div class="seg mob" style="margin-bottom:12px">'+['A','B','X'].map(function(k){return '<button data-a="ptab" data-k="'+k+'" aria-pressed="'+(S.ptab===k)+'">'+(k==='X'?'Extern':esc(teamLabel(k)))+' ('+groups[k].filter(function(p){return p.active!==false;}).length+')</button>';}).join('')+'</div>';
  h+='<div class="pcols">'+col('A',teamLabel('A'))+col('B',teamLabel('B'))+col('X','Extern / reserve')+'</div>';
  h+='<p class="hint">De ploeglijst is het sjabloon: elke nieuwe match start met deze spelers. Per match schrap je afwezigen of voeg je iemand van de andere ploeg toe. Het shirtje toont hoe vaak iemand dit seizoen de was en de broodjes deed.</p>';
  return h;
}
function prow(p,st){var s=st.get(p.id),other=p.team==='A'?'B':'A';
  return '<div class="prow'+(p.active===false?' inactive':'')+'"><button class="pn" data-a="pEdit" data-p="'+esc(p.id)+'">'+esc(p.name)+(p.active===false?' <small>inactief</small>':'')+'</button>'+
  '<span class="wc'+(s?'':' zero')+'" title="Was + broodjes'+(s?', laatst '+esc(dShort(s.last)):'')+'">'+ic('shirt')+(s?s.n:0)+'</span>'+
  (p.team!=='X'?'<button class="btn sm ghost" data-a="pMove" data-p="'+esc(p.id)+'" data-to="'+other+'" title="Verhuis naar '+esc(teamLabel(other))+'">'+ic('swap')+other+'</button>':'<button class="btn sm ghost" data-a="pEdit" data-p="'+esc(p.id)+'">'+ic('edit')+'</button>')+'</div>';}

/* ---------- Meer ---------- */
function viewMore(){
  var c=cfg(),opps=Array.from(S.opponents.values()).sort(function(a,b){return String(a.name).localeCompare(String(b.name),'nl');});
  var h='<div class="more">';
  h+='<section class="panel wide"><div class="ph"><h2>Tegenstanders</h2><button class="btn" data-a="newOpp">'+ic('plus')+'Tegenstander</button></div>'+
    '<p class="hint">Rijtijd vanaf de parking in Hechtel. Vertrek = aftrap − '+esc(c.away.arriveBefore)+' min − rijtijd, afgerond op 5 minuten. Tik op een tegenstander om adres of rijtijd aan te passen.</p>'+
    '<div class="otable">'+(opps.map(function(o){var miss=o.travelMin==null||o.travelMin==='';var v=o.venue||{};var away=allMatches().some(function(m){return m.opponentId===o.id&&!m.home&&m.status!=='geannuleerd'&&eff(m).date>=today();});
      var tt=!miss?esc(o.travelMin)+'′':(away?'<span class="ot miss">rijtijd?</span>':'<span class="ot mutedt" style="font:500 13px/1.2 var(--f-body)">geen uitmatch gepland</span>');
      return '<button class="orow" data-a="editOpp" data-o="'+esc(o.id)+'"><span class="on">'+esc(o.name)+'</span><span class="oa">'+esc([v.name,v.city].filter(Boolean).join(' · ')||'nog geen terrein')+'</span>'+(miss?tt:'<span class="ot">'+tt+'</span>')+'</button>';}).join('')||'<p class="hint">Nog geen tegenstanders.</p>')+'</div></section>';
  h+='<section class="panel"><h2 style="margin-bottom:10px">Verzamelen</h2><div class="form">'+
    fld('Thuismatch: uur','<input type="time" id="cf-ht" data-ch="cfg" data-k="home.meetTime" value="'+esc(c.home.meetTime)+'">')+
    fld('Thuismatch: plaats','<input type="text" id="cf-hp" data-ch="cfg" data-k="home.meetPlace" value="'+esc(c.home.meetPlace)+'">')+
    fld('Uitmatch: vertrek vanaf','<input type="text" id="cf-ap" data-ch="cfg" data-k="away.meetPlace" value="'+esc(c.away.meetPlace)+'">')+
    fld('Uitmatch: ter plaatse (min voor aftrap)','<input type="number" inputmode="numeric" id="cf-ab" data-ch="cfg" data-k="away.arriveBefore" data-num="1" value="'+esc(c.away.arriveBefore)+'">')+
    fld('Selectie: aantal spelers','<input type="number" inputmode="numeric" id="cf-st" data-ch="cfg" data-k="squad.target" data-num="1" value="'+esc(c.squad.target)+'">')+
    fld('Selectie: minimum','<input type="number" inputmode="numeric" id="cf-sm" data-ch="cfg" data-k="squad.min" data-num="1" value="'+esc(c.squad.min)+'">')+
    '</div><p class="hint">Een thuismatch die veel vroeger of later begint (bv. een avondmatch) krijgt automatisch 1 uur voor de aftrap. Per match kan je alles nog aanpassen.</p></section>';
  h+='<section class="panel"><h2 style="margin-bottom:10px">Ploegen en trainers</h2><div class="form">'+
    fld('Naam ploeg A','<input type="text" id="cf-la" data-ch="cfg" data-k="teams.A.label" value="'+esc(c.teams.A.label)+'">')+
    fld('Standaard trainers A','<input type="text" id="cf-ta" data-ch="cfg" data-k="teams.A.trainers" value="'+esc(c.teams.A.trainers)+'">')+
    fld('Naam ploeg B','<input type="text" id="cf-lb" data-ch="cfg" data-k="teams.B.label" value="'+esc(c.teams.B.label)+'">')+
    fld('Standaard trainers B','<input type="text" id="cf-tb" data-ch="cfg" data-k="teams.B.trainers" value="'+esc(c.teams.B.trainers)+'">')+
    '<div class="full">'+fld('Trainers om uit te kiezen (komma tussen de namen)','<input type="text" id="cf-tn" data-ch="cfg" data-k="trainerNames" data-list="1" value="'+esc((c.trainerNames||[]).join(', '))+'">')+'</div>'+
    '<div class="full">'+fld('Tekst bovenaan het schema','<input type="text" id="cf-lg" data-ch="cfg" data-k="legend" value="'+esc(c.legend)+'">')+'</div>'+
    '</div></section>';
  var ph=(c.phases||[]);
  h+='<section class="panel"><h2 style="margin-bottom:6px">Speeldagen</h2><p class="hint">De nummering start op de week van speeldag 1. Begint er een nieuwe reeks (bv. na de winterstop), voeg dan de datum van de nieuwe speeldag 1 toe.</p><div class="phases">'+
    ph.map(function(d,i){return '<div class="phase"><input type="date" id="ph-'+i+'" data-ch="phase" data-i="'+i+'" value="'+esc(d)+'"><span class="hint">speeldag 1'+(i?' (reeks '+(i+1)+')':'')+'</span><button class="btn sm ghost" data-a="phaseDel" data-i="'+i+'" aria-label="Verwijder">'+ic('trash')+'</button></div>';}).join('')+
    '<div class="phase"><input type="date" id="ph-new" data-ch="phaseAdd" aria-label="Nieuwe reeks"><span class="hint">nieuwe reeks toevoegen</span></div></div></section>';
  h+='<section class="panel"><h2 style="margin-bottom:6px">Was + broodjes per week</h2>'+histHTML()+'</section>';
  var r=c.rbfa||{},tn=r.teamNames||{};
  var picker=function(k){var cur=tn[k]||('U11 '+k);if(!CLUBTEAMS)return fld('RBFA-ploeg voor '+teamLabel(k),'<input type="text" id="rb-team-'+k+'" value="'+esc(cur)+'" disabled>');
    var opts=CLUBTEAMS.map(function(t){return '<option'+(t.name===cur?' selected':'')+'>'+esc(t.name)+'</option>';}).join('');if(!findTeam(CLUBTEAMS,cur))opts='<option selected>'+esc(cur)+' (niet gevonden)</option>'+opts;
    return fld('RBFA-ploeg voor '+teamLabel(k),'<select id="rb-team-'+k+'" data-ch="teamPick" data-k="'+k+'">'+opts+'</select>');};
  h+='<section class="panel wide"><div class="ph"><h2>RBFA</h2><button class="btn sm primary" data-a="syncNow"'+(S.sync.busy?' disabled':'')+'>'+ic(S.sync.busy?'spin':'download')+(S.sync.busy?'Bezig…':'Nu nakijken')+'</button></div>'+
    '<p class="hint" style="font-size:14px">Bij het openen kijkt de planner de RBFA-kalender en spelerslijsten van '+esc(c.club)+(r.clubNr?' (stamnummer '+esc(r.clubNr)+')':'')+' na, hoogstens om de 20 minuten. Nieuwe of verplaatste matchen, nieuwe tegenstanders met hun rijtijd en nieuwe spelers worden meteen verwerkt. Wat je zelf aanpaste, blijft behouden.'+(r.lastSync?' Laatst nagekeken: '+esc(isoStamp(r.lastSync))+'.':'')+'</p>'+
    (S.sync.err?'<p><span class="flag bad">'+ic('alert')+esc(S.sync.err)+'</span></p>':'')+
    '<div class="form" style="margin-top:8px">'+picker('A')+picker('B')+'</div>'+
    '<p class="hint">Nieuw seizoen of andere ploegen? Kies hier de RBFA-ploegen. RBFA geeft elk seizoen nieuwe ploegnummers; de planner zoekt de ploeg op naam.</p>'+
    ((r.lastChanges||[]).length?'<p><button class="btn sm" data-a="changesOpen">Laatste wijzigingen uit RBFA</button></p>':'')+
    (r.teamA?'<p class="hint"><a href="https://www.rbfa.be/nl/club/'+esc(r.clubId||'1416')+'/ploeg/'+esc(r.teamA)+'/kalender" target="_blank" rel="noopener">Kalender '+esc(tn.A||'A')+' op rbfa.be</a> · <a href="https://www.rbfa.be/nl/club/'+esc(r.clubId||'1416')+'/ploeg/'+esc(r.teamB)+'/kalender" target="_blank" rel="noopener">Kalender '+esc(tn.B||'B')+' op rbfa.be</a></p>':'')+'</section>';
  if(S.admin){var mem=Array.from(S.members.values()).sort(function(a,b){return String(a.id).localeCompare(String(b.id));});
    h+='<section class="panel"><h2 style="margin-bottom:6px">Toegang</h2><p class="hint">Wie hier staat, logt in met een e-maillink en kan alles aanpassen. Het gratis Firebase-plan verstuurt maximaal 5 inloglinks per dag.</p>'+
      (S.owner?'<div class="prow"><span class="pn">'+esc(S.user.email)+'</span><span class="mutedt">jij, eigenaar</span></div>':'')+
      mem.map(function(m){var self=S.user&&m.id===S.user.email;return '<div class="prow"><span class="pn">'+esc(m.id)+'</span><span class="mutedt">'+(self?'jij, ':'')+(m.role==='admin'?'beheerder':'trainer')+'</span><button class="btn sm ghost danger" data-a="delMember" data-e="'+esc(m.id)+'" data-confirm="Nogmaals tikken" aria-label="Toegang intrekken">'+ic('trash')+'</button></div>';}).join('')+
      '<form class="padd" data-form="addMember" style="margin-top:10px"><input type="email" id="mb-mail" placeholder="e-mailadres van de trainer" autocomplete="off" aria-label="E-mailadres"><button class="btn primary" type="submit">'+ic('plus')+'Toegang geven</button></form>'+
      '<p class="hint">Stuur de trainer daarna de link naar de planner. Hij logt in met dat e-mailadres.</p></section>';
    h+='<section class="panel"><h2 style="margin-bottom:6px">Back-up</h2><p class="hint">Download alle gegevens als bestand, of zet een bestand terug. Gegevens met dezelfde naam worden dan overschreven.</p><div class="row" style="flex-wrap:wrap"><button class="btn" data-a="backup">'+ic('download')+'Back-up downloaden</button><label class="btn">Bestand terugzetten<input type="file" accept=".json,application/json" data-ch="importFile" hidden></label></div></section>';}
  h+='<section class="panel"><h2 style="margin-bottom:6px">Account</h2><p class="hint" style="font-size:14px">Aangemeld als <b>'+esc(S.user&&S.user.email)+'</b>'+(S.admin?', beheerder':'')+'.</p><button class="btn" data-a="signOut">Afmelden</button></section>';
  return h+'</div>';
}
function fld(label,input){return '<label class="fld"><span>'+esc(label)+'</span>'+input+'</label>';}
function histHTML(){
  var t=today(),groups=new Map();
  allMatches().forEach(function(m){var wk=weekOf(m);if(!groups.has(wk))groups.set(wk,{A:[],B:[]});var g=groups.get(wk);(g[m.team]||(g[m.team]=[])).push(m);});
  var wks=Array.from(groups.keys()).sort().filter(function(wk){var g=groups.get(wk);return wk<=mondayOf(t)||g.A.concat(g.B).some(function(m){return m.wasId;});});
  if(!wks.length)return '<p class="hint">Nog niets ingevuld.</p>';
  function cell(arr){if(!arr.length)return '<td class="mutedt">geen match</td>';return '<td'+(arr.some(function(m){return wasOf(m);})?' class="g"':'')+'>'+arr.map(function(m){if(m.status==='geannuleerd')return '<span class="mutedt">geannuleerd</span>';var w=wasOf(m);return w?esc(pName(w)):'<span class="mutedt">niet ingevuld</span>';}).join(', ')+'</td>';}
  return '<div class="histwrap"><table class="hist"><thead><tr><th>Week</th><th>'+esc(teamLabel('A'))+'</th><th>'+esc(teamLabel('B'))+'</th></tr></thead><tbody>'+
    wks.reverse().map(function(wk){var g=groups.get(wk);return '<tr><td>'+esc(weekTitle(wk))+'<br><span class="mutedt" style="font-size:12px">'+esc(dayMonth(wk))+'</span></td>'+cell(g.A)+cell(g.B)+'</tr>';}).join('')+'</tbody></table></div>';
}

/* ================= sheets ================= */
function openSheet(kind,args){S.sheet=Object.assign({kind:kind},args||{});renderSheet();$('#sheet').hidden=false;document.body.classList.add('noscroll');var sh=$('.sheet');if(sh)sh.scrollTop=0;}
function closeSheet(){S.sheet=null;$('#sheet').hidden=true;$('#sheetBody').innerHTML='';document.body.classList.remove('noscroll');render();}
function renderSheet(){var sh=S.sheet;if(!sh)return;var fn=SHEETS[sh.kind];$('#sheetBody').innerHTML=fn?fn(sh):'';if(sh.kind==='export')prepareExport();}
function acts(left,right){return '<div class="sheet-actions">'+(left||'')+right+'</div>';}
var SHEETS={
  status:function(sh){var m=getM(sh.id);if(!m)return '';var e=eff(m),st=sh.st||m.status||'gepland';
    return '<h2>Status</h2><p class="sub">'+esc(matchTitle(m))+'</p>'+
      '<div class="seg" style="margin-bottom:14px">'+['gepland','geannuleerd','verplaatst'].map(function(k){return '<button data-a="sSt" data-v="'+k+'" aria-pressed="'+(st===k)+'">'+STATUS[k]+'</button>';}).join('')+'</div>'+
      (st==='verplaatst'?'<div class="row2"><label class="fld"><span>Nieuwe datum</span><input type="date" id="s-nd" value="'+esc(sh.nd||m.newDate||e.date)+'"></label><label class="fld"><span>Nieuw aftrapuur</span><input type="time" id="s-nt" value="'+esc(sh.nt||m.newTime||e.time)+'"></label></div><p class="hint">Het verzameluur wordt opnieuw berekend. Komt de match in een andere week terecht, dan verhuist ze mee.</p>':'')+
      (st==='geannuleerd'?'<p class="hint">Op het schema komt GEANNULEERD. Was + broodjes van deze match telt niet mee; die persoon komt bij de volgende match opnieuw in aanmerking.</p>':'')+
      acts('','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveStatus">Opslaan</button>');},
  times:function(sh){var m=getM(sh.id);if(!m)return '';var c=cfg(),e=eff(m),o=oppOf(m);
    var auto=meet(Object.assign({},m,{meetTime:null,meetPlace:null,travelMin:null}));
    var expl=m.home?(auto.src==='auto'?'1 uur voor de aftrap van '+e.time:'standaard bij een thuismatch'):(auto.time?'aftrap '+e.time+' − '+auto.arrive+' min ter plaatse − '+auto.travel+' min rijden':'de rijtijd naar deze tegenstander ontbreekt nog');
    var h='<h2>Verzamelen</h2><p class="sub">'+esc(matchTitle(m))+'</p>'+
      '<div class="calc">'+ic('clock')+'<span>Standaard: <b>'+esc(auto.time||'--:--')+'</b> '+esc(auto.place)+'<small>'+esc(expl)+'</small></span></div>'+
      '<div class="row2"><label class="fld"><span>Ander verzameluur</span><input type="time" id="t-meet" value="'+esc(m.meetTime||'')+'"></label><label class="fld"><span>Andere plaats</span><input type="text" id="t-place" value="'+esc(m.meetPlace||'')+'" placeholder="'+esc(auto.place)+'"></label></div>';
    if(!m.home){
      h+='<label class="fld"><span>Rijtijd voor deze match (min)</span><input type="number" inputmode="numeric" min="0" id="t-travel" value="'+esc(m.travelMin==null?'':m.travelMin)+'" placeholder="'+esc(o&&o.travelMin!=null?o.travelMin+' (standaard)':'')+'"></label>';
      var addr=venueText(m.venue)||(o&&venueText(o.venue));
      if(addr)h+='<p class="hint" style="margin-top:-4px">Terrein: '+esc([m.venue&&m.venue.name,addr].filter(Boolean).join(', '))+'</p><a class="maplink" href="'+esc(gmaps(addr))+'" target="_blank" rel="noopener">'+ic('map')+'Route vanaf Hechtel in Google Maps</a>';
    }
    h+='<label class="fld"><span>Notitie op het schema</span><textarea id="t-note" rows="2" placeholder="bv. Witte kousen meebrengen">'+esc(m.note||'')+'</textarea></label>'+
      acts('<button class="btn ghost spacer" data-a="resetTimes">Standaard herstellen</button>','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveTimes">Opslaan</button>');
    return h;},
  trainers:function(sh){var m=getM(sh.id);if(!m)return '';var c=cfg();if(!sh.cur)sh.cur=splitNames(m.trainers||teamTrainers(m.team));
    var names=uniq((c.trainerNames||[]).concat(splitNames(c.teams.A.trainers),splitNames(c.teams.B.trainers),sh.cur));
    return '<h2>Trainers</h2><p class="sub">'+esc(matchTitle(m))+'</p>'+
      '<div class="chips" style="margin-bottom:12px">'+names.map(function(n){return '<button class="tchip" data-a="tTog" data-n="'+esc(n)+'" aria-pressed="'+(sh.cur.indexOf(n)>=0)+'">'+esc(n)+'</button>';}).join('')+'</div>'+
      '<label class="fld"><span>Andere naam</span><span class="row"><input type="text" id="tr-new" placeholder="Naam" autocomplete="off"><button class="btn" data-a="tAdd">'+ic('plus')+'Voeg toe</button></span></label>'+
      '<p class="hint">Op het schema: <b>'+esc(joinNames(sh.cur)||'niemand')+'</b></p>'+
      acts('<button class="btn ghost spacer" data-a="tDefault">Standaard van '+esc(teamLabel(m.team))+'</button>','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveTrainers">Opslaan</button>');},
  addP:function(sh){var m=getM(sh.id);if(!m)return '';var sel=selection(m),ot=m.team==='A'?'B':'A';
    var others=plist().filter(function(p){return sel.indexOf(p.id)<0&&p.active!==false&&!p.review;});
    function grp(t,title){var arr=others.filter(function(p){return p.team===t;}).sort(byOrder);return arr.length?'<h3>'+esc(title)+'</h3><div class="chips">'+arr.map(function(p){return '<button class="bchip" data-a="pIn" data-id="'+esc(m.id)+'" data-p="'+esc(p.id)+'">'+ic('plus')+esc(p.name)+'</button>';}).join('')+'</div>':'';}
    var body=grp(m.team,'Eigen ploeg')+grp(ot,'Van '+teamLabel(ot))+grp('X','Extern / reserve');
    return '<h2>Speler toevoegen</h2><p class="sub">'+esc(matchTitle(m))+'</p>'+(body||'<p class="hint">Alle gekende spelers staan al in de selectie.</p>')+
      '<h3>Nieuwe speler</h3><div class="row"><input type="text" id="ap-name" placeholder="Voornaam + initiaal" autocomplete="off" aria-label="Naam"><select id="ap-team" aria-label="Soort speler" style="max-width:48%"><option value="X">Extern (gastspeler)</option><option value="'+m.team+'">Vaste speler '+esc(teamLabel(m.team))+'</option><option value="'+ot+'">Vaste speler '+esc(teamLabel(ot))+'</option></select></div>'+
      acts('','<button class="btn ghost" data-a="closeSheet">Klaar</button><button class="btn primary" data-a="apNew">'+ic('plus')+'Toevoegen aan match</button>');},
  wasPick:function(sh){var m=getM(sh.id);if(!m)return '';var sel=selection(m),st=wasStats(),cur=wasOf(m),sug=cur?null:S.sugg.get(m.id),mid=esc(m.id);
    return '<h2>Was + broodjes</h2><p class="sub">'+esc(matchTitle(m))+'</p><p class="hint">Tik op wie de was en de broodjes doet. Het getal is hoe vaak die speler het dit seizoen al deed.</p>'+
      '<div class="wpick">'+sel.map(function(id){var s=st.get(id);return '<button class="wp'+(id===cur?' on':'')+(id===sug?' sg':'')+'" data-a="wasSet" data-id="'+mid+'" data-p="'+esc(id)+'">'+ic('shirt')+'<span>'+esc(pName(id))+'</span><small>'+(s?s.n:0)+'×</small></button>';}).join('')+'</div>'+
      acts(cur?'<button class="btn ghost spacer" data-a="wasSet" data-id="'+mid+'" data-p="">Niemand</button>':'','<button class="btn ghost" data-a="closeSheet">Annuleer</button>');},
  mmenu:function(sh){var m=getM(sh.id);if(!m)return '';var id=esc(m.id);
    return '<h2>Match</h2><p class="sub">'+esc(matchTitle(m))+'</p><div class="menu">'+
      '<button data-a="times" data-id="'+id+'">'+ic('clock')+'Verzamelen en notitie</button>'+
      '<button data-a="status" data-id="'+id+'">'+ic('alert')+'Status: '+esc(STATUS[m.status||'gepland'])+'</button>'+
      '<button data-a="trainers" data-id="'+id+'">'+ic('users')+'Trainers</button>'+
      '<button data-a="toggleSchema" data-id="'+id+'">'+ic('eye')+(m.onSchema===false?'Terug op het schema zetten':'Niet op het schema zetten')+'</button>'+
      (Array.isArray(m.players)?'<button data-a="resetSel" data-id="'+id+'">'+ic('undo')+'Selectie terug naar de ploeglijst</button>':'')+
      (m.opponentId?'<button data-a="editOpp" data-o="'+esc(m.opponentId)+'">'+ic('map')+'Tegenstander, adres en rijtijd</button>':'')+
      (m.source==='manual'?'<button data-a="editMatch" data-id="'+id+'">'+ic('edit')+'Match bewerken of verwijderen</button>':'')+
      (m.rbfaId?'<a href="https://www.rbfa.be/nl/wedstrijd/'+esc(m.rbfaId)+'" target="_blank" rel="noopener">'+ic('cal')+'Bekijk op rbfa.be</a>':'')+
      '</div>'+acts('','<button class="btn ghost" data-a="closeSheet">Sluiten</button>');},
  match:function(sh){var m=sh.id?getM(sh.id):null;
    if(!sh.d)sh.d={team:m?m.team:'A',date:m?m.date:(sh.wk?addDays(sh.wk,5):today()),time:m?m.time:'10:00',home:m?!!m.home:true,opponentId:m?(m.opponentId||''):'',kind:m?(m.kind||'oefen'):'oefen',note:m?(m.note||''):''};
    var d=sh.d,opps=Array.from(S.opponents.values()).sort(function(a,b){return String(a.name).localeCompare(String(b.name),'nl');});
    return '<h2>'+(m?'Match bewerken':'Match toevoegen')+'</h2><p class="sub">Voor een match die niet in de RBFA-kalender staat: oefenmatch, tornooi, inhaalmatch.</p>'+
      '<div class="fld"><span>Ploeg</span><div class="seg">'+['A','B'].map(function(t){return '<button data-a="mdSet" data-k="team" data-v="'+t+'" aria-pressed="'+(d.team===t)+'">'+esc(teamLabel(t))+'</button>';}).join('')+'</div></div>'+
      '<div class="row2"><label class="fld"><span>Datum</span><input type="date" id="md-date" value="'+esc(d.date)+'"></label><label class="fld"><span>Aftrap</span><input type="time" id="md-time" value="'+esc(d.time)+'"></label></div>'+
      '<div class="fld"><span>Waar</span><div class="seg"><button data-a="mdSet" data-k="home" data-v="1" aria-pressed="'+(!!d.home)+'">Thuis</button><button data-a="mdSet" data-k="home" data-v="0" aria-pressed="'+(!d.home)+'">Uit</button></div></div>'+
      '<label class="fld"><span>Tegenstander</span><select id="md-opp" data-ch="mdOpp"><option value="">Kies een tegenstander</option>'+opps.map(function(o){return '<option value="'+esc(o.id)+'"'+(o.id===d.opponentId?' selected':'')+'>'+esc(o.name)+(o.venue&&o.venue.city?' ('+esc(o.venue.city)+')':'')+'</option>';}).join('')+'<option value="__new"'+(d.opponentId==='__new'?' selected':'')+'>+ Nieuwe tegenstander</option></select></label>'+
      '<div id="md-new"'+(d.opponentId==='__new'?'':' hidden')+' style="border:1px dashed var(--line);border-radius:9px;padding:12px;margin-bottom:12px">'+oppFields(sh.nd||{})+'</div>'+
      '<div class="fld"><span>Soort</span><div class="seg">'+Object.keys(KIND).map(function(k){return '<button data-a="mdSet" data-k="kind" data-v="'+k+'" aria-pressed="'+(d.kind===k)+'">'+KIND[k]+'</button>';}).join('')+'</div></div>'+
      '<label class="fld"><span>Notitie op het schema</span><input type="text" id="md-note" value="'+esc(d.note)+'"></label>'+
      acts(m?'<button class="btn ghost danger spacer" data-a="delMatch" data-confirm="Tik nogmaals om te verwijderen">'+ic('trash')+'Verwijderen</button>':'','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveMatch">Opslaan</button>');},
  opp:function(sh){var o=sh.id?(S.opponents.get(sh.id)||{}):{};var n=allMatches().filter(function(m){return sh.id&&m.opponentId===sh.id;}).length;
    return '<h2>'+(sh.id?esc(o.name||'Tegenstander'):'Nieuwe tegenstander')+'</h2><p class="sub">'+(o.source==='rbfa'?'Uit de RBFA-kalender':'Zelf toegevoegd')+(n?' · '+n+' match'+(n>1?'en':''):'')+'</p>'+oppFields(o)+
      acts((sh.id&&!n)?'<button class="btn ghost danger spacer" data-a="delOpp" data-confirm="Tik nogmaals om te verwijderen">'+ic('trash')+'Verwijderen</button>':'','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveOpp">Opslaan</button>');},
  player:function(sh){var p=S.players.get(sh.id);if(!p)return '';var st=wasStats().get(p.id),team=sh.team||p.team;
    return '<h2>'+esc(p.name)+'</h2><p class="sub">'+(st?'Was + broodjes dit seizoen: '+st.n+' keer, laatst '+esc(dShort(st.last)):'Dit seizoen nog geen was + broodjes gedaan')+'</p>'+
      '<label class="fld"><span>Naam op het schema</span><input type="text" id="pl-name" value="'+esc(p.name)+'" autocomplete="off"></label>'+
      '<div class="fld"><span>Vaste ploeg</span><div class="seg">'+['A','B','X'].map(function(t){return '<button data-a="plTeam" data-v="'+t+'" aria-pressed="'+(team===t)+'">'+(t==='X'?'Extern':esc(teamLabel(t)))+'</button>';}).join('')+'</div></div>'+
      '<div class="row2"><label class="fld"><span>Plaats in de lijst</span><input type="number" inputmode="numeric" id="pl-order" value="'+esc(p.order==null?'':p.order)+'"></label><label class="chk" style="align-self:center;margin-top:14px"><input type="checkbox" id="pl-active"'+(p.active!==false?' checked':'')+'> Actief</label></div>'+
      '<p class="hint">Een inactieve speler staat niet meer standaard in de selectie (bv. bij een blessure), maar blijft in de historiek.'+(p.rbfaId?' Gekoppeld aan de RBFA-spelerslijst.':'')+'</p>'+
      acts('<button class="btn ghost danger spacer" data-a="delPlayer" data-confirm="Tik nogmaals om te verwijderen">'+ic('trash')+'Verwijderen</button>','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="savePlayer">Opslaan</button>');},
  changes:function(){var r=cfg().rbfa||{},ch=r.lastChanges||[];
    return '<h2>Laatste RBFA-update</h2><p class="sub">'+(r.lastChangesAt?'Verwerkt '+esc(isoStamp(r.lastChangesAt))+'. ':'')+(r.lastSync?'Laatst nagekeken '+esc(isoStamp(r.lastSync))+'.':'')+'</p>'+
      (ch.length?'<div class="inc">'+ch.map(function(x){var sb=x.s||[];return '<div class="chg">'+esc(x.l)+(sb.length?'<ul>'+sb.slice(0,8).map(function(y){return '<li>'+esc(y)+'</li>';}).join('')+(sb.length>8?'<li>en nog '+(sb.length-8)+'</li>':'')+'</ul>':'')+'</div>';}).join('')+'</div>':'<p class="hint">Nog geen wijzigingen.</p>')+
      acts('<button class="btn ghost spacer" data-a="syncNow">'+ic('download')+'Nu opnieuw nakijken</button>','<button class="btn primary" data-a="closeSheet">Sluiten</button>');},
  week:function(){var w=S.weeks.get(S.week)||{},def=defaultTitle(S.week);
    return '<h2>Titel van het schema</h2><p class="sub">Week van '+esc(dayMonth(S.week))+'</p><label class="fld"><span>Titel</span><input type="text" id="wk-title" value="'+esc(w.title||'')+'" placeholder="'+esc(def)+'" autocomplete="off"></label><p class="hint">Leeg laten geeft: '+esc(def)+'. De nummering stel je in bij Meer, Speeldagen.</p>'+
      acts('','<button class="btn ghost" data-a="closeSheet">Annuleer</button><button class="btn primary" data-a="saveWeek">Opslaan</button>');},
  export:function(sh){
    if(!sh.inc){sh.inc={};sh.weeks.forEach(function(wk){sh.inc[wk]=matchesInWeek(wk).filter(function(m){return m.onSchema!==false;}).map(function(m){return m.id;});});}
    var single=sh.weeks.length===1,pending=[];
    sh.weeks.forEach(function(wk){sh.inc[wk].forEach(function(id){var m=getM(id);if(m&&!m.wasId&&m.status!=='geannuleerd'&&S.sugg.get(id))pending.push(m);});});
    var h='<h2>Exporteren</h2><p class="sub">'+(single?esc(weekTitle(sh.weeks[0]))+' · '+esc(weekRange(sh.weeks[0])):sh.weeks.length+' speeldagen: '+sh.weeks.map(function(w){return esc(weekTitle(w));}).join(', '))+'</p>';
    if(single)h+='<div class="inc">'+matchesInWeek(sh.weeks[0]).map(function(m){var e=eff(m);return '<label class="chk"><input type="checkbox" data-ch="expInc" data-id="'+esc(m.id)+'"'+(sh.inc[sh.weeks[0]].indexOf(m.id)>=0?' checked':'')+'> <span><b>'+esc(m.team)+'</b> · '+esc(m.home?teamLabel(m.team)+' – '+oppName(m):oppName(m)+' – '+teamLabel(m.team))+' · '+esc(dShort(e.date))+'</span></label>';}).join('')+'</div>';
    if(pending.length)h+='<p class="callout">'+ic('shirt')+'<span>Na het delen of downloaden worden deze voorstellen vastgelegd als was + broodjes: '+pending.map(function(m){return '<b>'+esc(m.team)+'</b> '+esc(pName(S.sugg.get(m.id)));}).join(', ')+'.</span></p>';
    h+='<div class="preview" id="exp-prev"><span class="hint">Voorbeeld wordt gemaakt…</span></div>';
    if(!single)h+='<p class="hint">De PDF krijgt één pagina per speeldag. Delen en JPEG geven één afbeelding per speeldag.</p>';
    var canShare=!!(navigator.share&&navigator.canShare);
    h+=acts('<button class="btn ghost spacer" data-a="closeSheet">Sluiten</button>','<button class="btn" data-a="expDl" data-f="pdf" id="exp-pdf" disabled>'+ic('download')+'PDF</button><button class="btn'+(canShare?'':' primary')+'" data-a="expDl" data-f="jpg" id="exp-jpg" disabled>'+ic('download')+'JPEG</button>'+(canShare?'<button class="btn primary" data-a="expShare" id="exp-share" disabled>'+ic('share')+'Delen</button>':''));
    return h;}
};
function oppFields(o){var v=o.venue||{},addr=venueText(v);
  return fld('Naam op het schema','<input type="text" id="of-name" value="'+esc(o.name||'')+'" placeholder="bv. KFC Hamont" autocomplete="off">')+
    fld('Terrein','<input type="text" id="of-vname" value="'+esc(v.name||'')+'" placeholder="bv. Sportpark De Siggert">')+
    fld('Straat en nummer','<input type="text" id="of-addr" data-in="ofmap" value="'+esc(v.address||'')+'">')+
    '<div class="row2">'+fld('Postcode','<input type="text" inputmode="numeric" id="of-pc" data-in="ofmap" value="'+esc(v.postalCode||'')+'">')+fld('Gemeente','<input type="text" id="of-city" data-in="ofmap" value="'+esc(v.city||'')+'">')+'</div>'+
    fld('Rijtijd vanaf de parking in Hechtel (min)','<input type="number" inputmode="numeric" min="0" id="of-travel" value="'+esc(o.travelMin==null?'':o.travelMin)+'">')+
    '<a class="maplink" id="of-map" href="'+esc(addr?gmaps(addr):'#')+'" target="_blank" rel="noopener"'+(addr?'':' hidden')+'>'+ic('map')+'Rijtijd controleren in Google Maps</a>'+
    (o.routeMin?'<p class="hint">Berekend via OpenStreetMap: '+esc(o.routeMin)+' min, '+esc(o.km)+' km. Afgerond naar boven op 5 minuten.</p>':'');}
function readOpp(){var g=function(id){var el=$('#'+id);return el?el.value.trim():'';};var tr=g('of-travel');
  return {name:g('of-name'),venue:{name:g('of-vname'),address:g('of-addr'),postalCode:g('of-pc'),city:g('of-city')},travelMin:tr===''?null:Math.max(0,Math.round(Number(tr)))};}

/* ================= export (canvas + pdf) ================= */
var XC={ink:'#111111',red:'#E0141B',green:'#3B9A2E',grey:'#777777',line:'#1C1C1C'};
function XF(w,s,it){return (it?'italic ':'')+w+' '+s+'px Barlow, "Helvetica Neue", Arial, sans-serif';}
var fontsP=null;
function fontsReady(){if(!fontsP){fontsP=(document.fonts&&document.fonts.load)?Promise.all([document.fonts.load(XF(700,34)),document.fonts.load(XF(500,34)),document.fonts.load(XF(500,28,true)),document.fonts.load(XF(600,30))]).catch(function(){}):Promise.resolve();}return fontsP;}
function flow(ctx,segs,maxW){
  var lines=[[]],x=0;
  segs.forEach(function(s){ctx.font=s.f;String(s.t).split(/([^\S\u00a0]+)/).forEach(function(p){if(!p)return;var w=ctx.measureText(p).width;
    if(/^\s+$/.test(p)){if(x>0){lines[lines.length-1].push({t:p,c:s.c,f:s.f,x:x,w:w});x+=w;}return;}
    if(x+w>maxW&&x>0){var L=lines[lines.length-1];while(L.length&&/^\s+$/.test(L[L.length-1].t)){L.pop();}lines.push([]);x=0;}
    lines[lines.length-1].push({t:p,c:s.c,f:s.f,x:x,w:w});x+=w;});});
  return lines;
}
function drawRuns(ctx,runs,x,y,strike){runs.forEach(function(r){ctx.font=r.f;ctx.fillStyle=r.c;ctx.fillText(r.t,x+r.x,y);if(strike&&!/^\s+$/.test(r.t)){ctx.fillRect(x+r.x,y-11,r.w,2.5);}});}
function cardModel(m){
  var e=eff(m),cancel=m.status==='geannuleerd',H=[],B=XF(700,34);
  var d=[{t:dLong(e.date),c:XC.ink,f:B}],alt=null;
  if(e.moved)d.push({t:' (verplaatst)',c:XC.red,f:B});
  else if(m.kind&&m.kind!=='competitie'){var kt=KIND[m.kind].toLowerCase();d.push({t:' · '+kt,c:XC.grey,f:XF(600,30)});alt=[{segs:[d[0]],lh:46},{segs:[{t:kt,c:XC.grey,f:XF(600,30)}],lh:40}];}
  H.push({segs:d,lh:46,alt:alt});
  var us={t:teamLabel(m.team),c:XC.red,f:B},th={t:oppName(m),c:XC.ink,f:B},dash={t:' – ',c:XC.ink,f:B};
  var ml=m.home?[us,dash,th]:[th,dash,us];ml.push({t:' '+e.time,c:XC.ink,f:B});
  H.push({segs:ml,lh:46,strike:cancel});
  if(cancel)H.push({segs:[{t:'GEANNULEERD',c:XC.red,f:B}],lh:46});
  else{var mt=meet(m);H.push({segs:[{t:mt.time||'--:--',c:XC.red,f:B},{t:' '+mt.place,c:XC.ink,f:B}],lh:46});}
  if(m.note)H.push({segs:[{t:m.note,c:XC.ink,f:XF(500,28,true)}],lh:38});
  var w=m.wasId||S.sugg.get(m.id);
  var players=cancel?[]:selection(m).map(function(id){return {t:pName(id),was:id===w};});
  var tr=cancel?'':(m.trainers||teamTrainers(m.team)||'');
  return {H:H,players:players,tr:tr};
}
function drawWeek(wk,ids,scale){
  var ms=ids.map(getM).filter(Boolean).sort(cmpTeam);
  var W=1440,M=64,TW=W-2*M,pad=26,per=ms.length>=3?3:2,colW=TW/per,inner=colW-2*pad;
  var meas=document.createElement('canvas').getContext('2d');
  var rows=[];for(var i=0;i<ms.length;i+=per)rows.push(ms.slice(i,i+per));
  var RL=rows.map(function(r){
    var cells=r.map(function(m){var cm=cardModel(m),hl=[],hh=0;
      cm.H.forEach(function(hd){var LL=flow(meas,hd.segs,inner);
        if(LL.length>1&&hd.alt){hd.alt.forEach(function(a){flow(meas,a.segs,inner).forEach(function(L){hl.push({L:L,lh:a.lh});hh+=a.lh;});});return;}
        LL.forEach(function(L){hl.push({L:L,lh:hd.lh,strike:hd.strike});hh+=hd.lh;});});
      var trL=cm.tr?flow(meas,[{t:'Trainers: ',c:XC.ink,f:XF(700,32)},{t:cm.tr,c:XC.ink,f:XF(500,32)}],inner):[];
      var bh=cm.players.length*48+(trL.length?(cm.players.length?26:0)+trL.length*44:0);
      return {cm:cm,hl:hl,hh:hh,bh:bh,trL:trL};});
    var mh=Math.max.apply(null,cells.map(function(c){return c.hh;})),mb=Math.max.apply(null,cells.map(function(c){return c.bh;}));
    return {cells:cells,headH:mh+2*pad-6,bodyH:mb?mb+2*pad-4:0};
  });
  var title=weekTitle(wk),legend=cfg().legend||'';
  var H=M+58+(legend?54:0)+40+RL.reduce(function(s,r){return s+r.headH+r.bodyH+30;},0)+30+M;
  var cv=document.createElement('canvas');cv.width=Math.round(W*scale);cv.height=Math.round(H*scale);
  var ctx=cv.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);ctx.textBaseline='alphabetic';
  var y=M;
  ctx.font=XF(700,46);ctx.fillStyle=XC.ink;ctx.fillText(title,M,y+42);ctx.fillRect(M,y+50,ctx.measureText(title).width,3);y+=58;
  if(legend){ctx.font=XF(700,34);ctx.fillStyle=XC.green;ctx.fillText(legend,M,y+38);ctx.fillRect(M,y+45,ctx.measureText(legend).width,2.5);y+=54;}
  y+=40;
  RL.forEach(function(r){
    var n=r.cells.length,rw=n*colW,tot=r.headH+r.bodyH;
    ctx.strokeStyle=XC.line;ctx.lineWidth=2;ctx.strokeRect(M,y,rw,tot);
    ctx.beginPath();if(r.bodyH){ctx.moveTo(M,y+r.headH);ctx.lineTo(M+rw,y+r.headH);}for(var k=1;k<n;k++){ctx.moveTo(M+k*colW,y);ctx.lineTo(M+k*colW,y+tot);}ctx.stroke();
    r.cells.forEach(function(c,i){
      var x=M+i*colW+pad,yy=y+pad-3;
      c.hl.forEach(function(h){yy+=h.lh;drawRuns(ctx,h.L,x,yy-13,h.strike);});
      yy=y+r.headH+pad-2;
      c.cm.players.forEach(function(p){yy+=48;ctx.font=XF(500,34);ctx.fillStyle=p.was?XC.green:XC.ink;ctx.fillText('–',x+22,yy-14);ctx.fillText(p.t,x+76,yy-14);});
      if(c.trL.length){if(c.cm.players.length)yy+=26;c.trL.forEach(function(L){yy+=44;drawRuns(ctx,L,x,yy-13,false);});}
    });
    y+=tot+30;
  });
  ctx.font=XF(500,22);ctx.fillStyle='#8A8A8A';ctx.fillText('Opgemaakt op '+stamp(),M,H-M+14);
  return cv;
}
var prevTok=0;
var pdfP=null;
function loadPdf(){if(window.jspdf)return Promise.resolve();if(pdfP)return pdfP;pdfP=new Promise(function(res,rej){var s=document.createElement('script');s.src='jspdf.umd.min.js';s.onload=function(){res();};s.onerror=function(){pdfP=null;rej(new Error('PDF-bibliotheek niet geladen'));};document.head.appendChild(s);});return pdfP;}
function fname(wk,ext){return 'Hechtel U11 '+weekTitle(wk).replace(/[\\/:*?"<>|]/g,'-')+'.'+ext;}
function expJobs(sh){return sh.weeks.map(function(wk){return {wk:wk,ids:(sh.inc[wk]||[]).slice()};}).filter(function(j){return j.ids.length;});}
function setExpButtons(on){var rd=S.sheet&&S.sheet.ready;['exp-pdf','exp-jpg','exp-share'].forEach(function(id){var b=$('#'+id);if(b)b.disabled=!on||(id==='exp-pdf'&&!(rd&&rd.pdf));});}
function prepareExport(){var sh=S.sheet;if(!sh||sh.kind!=='export')return;var tok=++prevTok;sh.ready=null;setExpButtons(false);
  Promise.all([fontsReady(),loadPdf().catch(function(){return null;})]).then(function(){
    if(tok!==prevTok||S.sheet!==sh)return;
    var jobs=expJobs(sh),box=$('#exp-prev');
    if(!jobs.length){if(box)box.innerHTML='<span class="hint">Kies minstens één match.</span>';return;}
    var sugg=new Map(S.sugg),pv=drawWeek(jobs[0].wk,jobs[0].ids,0.6);
    if(box){var img=new Image();img.alt='Voorbeeld van het schema';img.src=pv.toDataURL('image/png');box.innerHTML='';box.appendChild(img);}
    return Promise.all(jobs.map(function(j){var cv=drawWeek(j.wk,j.ids,1.25);return new Promise(function(res){cv.toBlob(function(b){res(new File([b],fname(j.wk,'jpg'),{type:'image/jpeg'}));},'image/jpeg',0.92);});})).then(function(jpgs){
      if(tok!==prevTok||S.sheet!==sh)return;
      var pdf=null;
      if(window.jspdf){var jsPDF=window.jspdf.jsPDF,doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait'});
        jobs.forEach(function(j,i){if(i)doc.addPage();var cv=drawWeek(j.wk,j.ids,1.6),ra=cv.height/cv.width,w=186,h=w*ra;if(h>273){h=273;w=h/ra;}doc.addImage(cv.toDataURL('image/jpeg',0.9),'JPEG',12,12,w,h);});
        var nm=jobs.length>1?'Hechtel U11 '+weekTitle(jobs[0].wk)+' tot '+weekTitle(jobs[jobs.length-1].wk)+'.pdf':fname(jobs[0].wk,'pdf');
        pdf=new File([doc.output('blob')],nm.replace(/[\\/:*?"<>|]/g,'-'),{type:'application/pdf'});}
      sh.ready={jobs:jobs,jpgs:jpgs,pdf:pdf,sugg:sugg};setExpButtons(true);
    });
  }).catch(function(e){var box=$('#exp-prev');if(box)box.innerHTML='<span class="hint">Voorbeeld lukt niet: '+esc(e&&e.message||e)+'</span>';});
}
function dlFile(f){var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},4000);}
function finishExport(sh){var rd=sh&&sh.ready;if(!rd)return;var fixed=[],now=new Date().toISOString();
  rd.jobs.forEach(function(j){j.ids.forEach(function(id){var m=getM(id),s=rd.sugg.get(id);if(m&&!m.wasId&&m.status!=='geannuleerd'&&s){upd('matches',id,{wasId:s,updatedAt:now});fixed.push(m.team+' '+pName(s));}});
    var w=S.weeks.get(j.wk);write('weeks',j.wk,w?'update':'set',{exportedAt:now});});
  toast(fixed.length?'Klaar. Was + broodjes vastgelegd: '+fixed.join(', ')+'.':'Klaar.');}
function importBackup(text){var d=null;try{d=JSON.parse(text);}catch(e){}
  if(!d||d.app!=='hechtel-u11-backup'||!d.collections){toast('Dit is geen back-up van de planner.');return;}
  var n=0,cols=d.collections;
  if(cols.config&&cols.config.main){write('config','main','set',cols.config.main);n++;}
  ['players','opponents','matches','weeks'].forEach(function(c){var o=cols[c]||{};Object.keys(o).forEach(function(id){write(c,id,'set',o[id]);n++;});});
  toast(n+' gegevens teruggezet.');setTimeout(function(){syncRbfa(true);},2500);}
var AUTH=null,FS=null;
function authMsg(e){var c=(e&&e.code)||'';
  if(c==='auth/quota-exceeded')return 'Vandaag zijn er al 5 inloglinks verstuurd (limiet van het gratis plan). Probeer morgen opnieuw.';
  if(c==='auth/invalid-email'||c==='auth/missing-email')return 'Dat e-mailadres klopt niet.';
  if(c==='auth/invalid-action-code'||c==='auth/expired-action-code')return 'Deze inloglink is verlopen of al gebruikt. Vraag een nieuwe aan.';
  if(c==='auth/unauthorized-continue-uri'||c==='auth/invalid-continue-uri'||c==='auth/unauthorized-domain')return 'Deze website staat nog niet bij de toegelaten domeinen in Firebase.';
  if(c==='auth/operation-not-allowed')return 'Inloggen met een e-maillink staat nog niet aan in Firebase.';
  if(c==='auth/network-request-failed')return 'Geen internetverbinding.';
  return 'Inloggen lukt niet: '+((e&&e.message)||c);}
function sendLink(email){S.login={step:'form',email:email,busy:true};render();
  AUTH.sendSignInLinkToEmail(email,{url:location.origin+location.pathname,handleCodeInApp:true}).then(function(){try{localStorage.setItem('hu11.email',email);}catch(e){}S.login={step:'sent',email:email};render();},function(e){S.login={step:'form',email:email};render();toast(authMsg(e));});}
function finishLink(email,link){if(!email){S.login={step:'confirm',link:link};render();return;}
  AUTH.signInWithEmailLink(email,link).then(function(){try{localStorage.removeItem('hu11.email');}catch(e){}S.login=null;if(location.search)history.replaceState(null,'',location.pathname);},function(e){S.login={step:'form',email:email};render();toast(authMsg(e));});}

/* ================= actions ================= */
var toastT=null;
function toast(msg,undo,label){var el=$('#toast');el.innerHTML='<span>'+esc(msg)+'</span>'+(undo?'<button data-a="undo">'+esc(label||'Ongedaan maken')+'</button>':'');S.undo=undo||null;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){el.hidden=true;S.undo=null;},undo?6500:4000);}
function setPlayers(id,arr){var m=getM(id);if(!m)return;var patch={players:arr};if(m.wasId&&arr.indexOf(m.wasId)<0)patch.wasId=null;upd('matches',id,patch);}
function saveCfg(path,val){
  var patch={},o=patch,ks=path.split('.');ks.forEach(function(k,i){if(i===ks.length-1)o[k]=val;else{o[k]={};o=o[k];}});
  if(S.config)write('config','main','update',patch);else write('config','main','set',merge(DEFAULT_CONFIG,patch));
}
function captureMatchDraft(){var sh=S.sheet;if(!sh||!sh.d)return;var g=function(id){var el=$('#'+id);return el?el.value:null;};
  var v;if((v=g('md-date'))!=null)sh.d.date=v;if((v=g('md-time'))!=null)sh.d.time=v;if((v=g('md-opp'))!=null)sh.d.opponentId=v;if((v=g('md-note'))!=null)sh.d.note=v;
  if($('#of-name'))sh.nd=Object.assign(readOpp(),{});}
var ACT={
  nav:function(d){S.view=d.v;try{localStorage.setItem('hu11.view',d.v);}catch(e){}render();window.scrollTo(0,0);},
  wk:function(d){S.week=addDays(S.week||defaultWeek(),7*Number(d.d));render();},
  wkNow:function(){S.week=defaultWeek();render();},
  goWeek:function(d){S.view='week';S.week=d.wk;try{localStorage.setItem('hu11.view','week');}catch(e){}if(S.sheet)closeSheet();render();window.scrollTo(0,0);},
  weekTitle:function(){openSheet('week');},
  saveWeek:function(){var t=$('#wk-title').value.trim(),w=S.weeks.get(S.week);write('weeks',S.week,w?'update':'set',{title:t||null});closeSheet();},
  pOut:function(d){var m=getM(d.id);if(!m)return;var sel=selection(m),prev=Array.isArray(m.players)?m.players.slice():null,prevW=m.wasId||null;
    setPlayers(d.id,sel.filter(function(x){return x!==d.p;}));toast(pName(d.p)+' staat niet meer in de selectie',function(){upd('matches',d.id,{players:prev,wasId:prevW});});},
  pIn:function(d){var m=getM(d.id);if(!m)return;var sel=selection(m);if(sel.indexOf(d.p)<0)setPlayers(d.id,sel.concat([d.p]));if(S.sheet&&S.sheet.kind==='addP')renderSheet();},
  pWas:function(d){var m=getM(d.id);if(!m)return;upd('matches',d.id,{wasId:m.wasId===d.p?null:d.p});},
  wasOk:function(d){upd('matches',d.id,{wasId:d.p});toast('Was + broodjes: '+pName(d.p)+'.');},
  wasPick:function(d){openSheet('wasPick',{id:d.id});},
  wasSet:function(d){if(!getM(d.id))return;upd('matches',d.id,{wasId:d.p||null});closeSheet();toast(d.p?'Was + broodjes: '+pName(d.p)+'.':'Niemand ingevuld voor de was.');},
  addP:function(d){openSheet('addP',{id:d.id});},
  apNew:function(){var sh=S.sheet,m=getM(sh.id),nm=$('#ap-name').value.trim(),tm=$('#ap-team').value;if(!nm){toast('Vul een naam in.');return;}
    var pid=rid('p'),ord=tm==='X'?null:(plist().filter(function(p){return p.team===tm;}).reduce(function(a,p){return Math.max(a,Number(p.order)||0);},0)+1);
    if(write('players',pid,'set',{name:nm,team:tm,active:true,order:ord,createdAt:new Date().toISOString()})){setPlayers(m.id,selection(m).concat([pid]));toast(nm+' toegevoegd');renderSheet();}},
  status:function(d){openSheet('status',{id:d.id});},
  sSt:function(d){var sh=S.sheet;var nd=$('#s-nd'),nt=$('#s-nt');if(nd)sh.nd=nd.value;if(nt)sh.nt=nt.value;sh.st=d.v;renderSheet();},
  saveStatus:function(){var sh=S.sheet,m=getM(sh.id);if(!m)return closeSheet();var st=sh.st||m.status||'gepland',patch={status:st};
    if(st==='verplaatst'){var nd=$('#s-nd').value,nt=$('#s-nt').value;if(!nd){toast('Kies een nieuwe datum.');return;}patch.newDate=nd;patch.newTime=nt||null;patch.meetTime=null;}
    else{patch.newDate=null;patch.newTime=null;}
    upd('matches',m.id,patch);closeSheet();
    if(st==='verplaatst'&&mondayOf(patch.newDate)!==S.week)toast('Verplaatst naar '+dShort(patch.newDate)+'. De match staat nu in die week.');},
  times:function(d){openSheet('times',{id:d.id});},
  saveTimes:function(){var sh=S.sheet,m=getM(sh.id);if(!m)return closeSheet();var tv=$('#t-travel');var tr=tv?tv.value.trim():'';
    upd('matches',m.id,{meetTime:$('#t-meet').value||null,meetPlace:$('#t-place').value.trim()||null,travelMin:tr===''?null:Math.max(0,Math.round(Number(tr))),note:$('#t-note').value.trim()});closeSheet();},
  resetTimes:function(){var sh=S.sheet;upd('matches',sh.id,{meetTime:null,meetPlace:null,travelMin:null});closeSheet();toast('Standaard verzameluur hersteld.');},
  trainers:function(d){openSheet('trainers',{id:d.id});},
  tTog:function(d){var c=S.sheet.cur,i=c.indexOf(d.n);if(i>=0)c.splice(i,1);else c.push(d.n);renderSheet();},
  tAdd:function(){var v=$('#tr-new').value.trim();if(!v)return;splitNames(v).forEach(function(n){if(S.sheet.cur.indexOf(n)<0)S.sheet.cur.push(n);});renderSheet();},
  tDefault:function(){var m=getM(S.sheet.id);S.sheet.cur=splitNames(teamTrainers(m.team));renderSheet();},
  saveTrainers:function(){var sh=S.sheet,m=getM(sh.id),v=joinNames(sh.cur);upd('matches',m.id,{trainers:(v===joinNames(splitNames(teamTrainers(m.team))))?null:(v||null)});closeSheet();},
  mmenu:function(d){openSheet('mmenu',{id:d.id});},
  toggleSchema:function(d){var m=getM(d.id);upd('matches',d.id,{onSchema:m.onSchema===false});closeSheet();},
  resetSel:function(d){upd('matches',d.id,{players:null});closeSheet();toast('Selectie volgt weer de ploeglijst.');},
  ackRbfa:function(d){upd('matches',d.id,{rbfaPrev:null});},
  newMatch:function(d){openSheet('match',{id:null,wk:d.wk||S.week});},
  editMatch:function(d){openSheet('match',{id:d.id});},
  mdSet:function(d){captureMatchDraft();var v=d.v;if(d.k==='home')v=d.v==='1';S.sheet.d[d.k]=v;renderSheet();},
  saveMatch:function(){captureMatchDraft();var sh=S.sheet,d=sh.d;if(!d.date||!d.time){toast('Vul datum en aftrapuur in.');return;}
    var oid=d.opponentId;
    if(oid==='__new'){var o=readOpp();if(!o.name){toast('Geef de tegenstander een naam.');return;}oid=rid('o');o.source='manual';o.createdAt=new Date().toISOString();if(!write('opponents',oid,'set',o))return;}
    if(!oid){toast('Kies een tegenstander.');return;}
    var data={team:d.team,date:d.date,time:d.time,home:!!d.home,opponentId:oid,kind:d.kind,note:d.note.trim()};
    if(sh.id){upd('matches',sh.id,data);}
    else{var id=rid('m');write('matches',id,'set',Object.assign(data,{source:'manual',status:'gepland',players:null,wasId:null,trainers:null,onSchema:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}));}
    closeSheet();S.view='week';S.week=mondayOf(d.date);render();},
  delMatch:function(){var sh=S.sheet;write('matches',sh.id,'delete',null);closeSheet();toast('Match verwijderd.');},
  editOpp:function(d){if(!d.o){toast('Deze match heeft nog geen tegenstander.');return;}openSheet('opp',{id:d.o});},
  newOpp:function(){openSheet('opp',{id:null});},
  saveOpp:function(){var sh=S.sheet,o=readOpp();if(!o.name){toast('Geef de tegenstander een naam.');return;}
    if(sh.id)upd('opponents',sh.id,o);else write('opponents',rid('o'),'set',Object.assign(o,{source:'manual',createdAt:new Date().toISOString()}));closeSheet();},
  delOpp:function(){write('opponents',S.sheet.id,'delete',null);closeSheet();},
  pEdit:function(d){openSheet('player',{id:d.p});},
  plTeam:function(d){var n=$('#pl-name'),o=$('#pl-order'),a=$('#pl-active');S.sheet.team=d.v;var keep={n:n&&n.value,o:o&&o.value,a:a&&a.checked};renderSheet();if(keep.n!=null)$('#pl-name').value=keep.n;if(keep.o!=null)$('#pl-order').value=keep.o;if(keep.a!=null)$('#pl-active').checked=keep.a;},
  savePlayer:function(){var sh=S.sheet,p=S.players.get(sh.id);if(!p)return closeSheet();var nm=$('#pl-name').value.trim();if(!nm){toast('Vul een naam in.');return;}var ov=$('#pl-order').value.trim();
    upd('players',p.id,{name:nm,team:sh.team||p.team,order:ov===''?null:Number(ov),active:$('#pl-active').checked,review:false});closeSheet();},
  delPlayer:function(){var id=S.sheet.id,nm=pName(id);write('players',id,'delete',null);closeSheet();toast(nm+' verwijderd.');},
  pMove:function(d){var p=S.players.get(d.p);if(!p)return;var from=p.team;upd('players',d.p,{team:d.to});toast(p.name+' staat nu bij '+teamLabel(d.to),function(){upd('players',d.p,{team:from});});},
  pTeam:function(d){upd('players',d.p,{team:d.to,review:false,active:true});},
  ptab:function(d){S.ptab=d.k;render();},
  export:function(){openSheet('export',{weeks:[S.week]});},
  calExport:function(){var wks=Array.from(S.calSel).sort();if(!wks.length)return;openSheet('export',{weeks:wks});},
  expShare:function(){var sh=S.sheet;if(!sh||!sh.ready)return;var files=sh.ready.jpgs,ok=false;
    try{ok=!!(navigator.canShare&&navigator.canShare({files:files}));}catch(e){}
    if(!ok){files.forEach(function(f,i){setTimeout(function(){dlFile(f);},i*400);});finishExport(sh);return;}
    navigator.share({files:files}).then(function(){finishExport(sh);},function(e){if(!e||e.name!=='AbortError'){files.forEach(function(f,i){setTimeout(function(){dlFile(f);},i*400);});finishExport(sh);}});},
  expDl:function(d){var sh=S.sheet;if(!sh||!sh.ready)return;if(d.f==='pdf'){if(!sh.ready.pdf)return;dlFile(sh.ready.pdf);}else sh.ready.jpgs.forEach(function(f,i){setTimeout(function(){dlFile(f);},i*400);});finishExport(sh);},
  syncNow:function(){syncRbfa(true);},
  changesOpen:function(){openSheet('changes');},
  signOut:function(){if(S.sheet)closeSheet();AUTH.signOut().then(function(){S.login=null;});},
  retryAccess:function(){S.db='wait';S.retried=false;render();var u=AUTH&&AUTH.currentUser;(u?u.getIdToken(true):Promise.resolve()).then(subscribe,subscribe);},
  loginAgain:function(){S.login={};render();},
  startEmpty:function(){write('config','main','set',merge(DEFAULT_CONFIG,{createdAt:new Date().toISOString()}));setTimeout(function(){syncRbfa(true);},800);},
  backup:function(){var out={app:'hechtel-u11-backup',v:1,exportedAt:new Date().toISOString(),collections:{config:{main:S.config||{}},players:{},opponents:{},matches:{},weeks:{}}};
    ['players','opponents','matches','weeks'].forEach(function(c){S[c].forEach(function(v,k){var d=Object.assign({},v);delete d.id;out.collections[c][k]=d;});});
    dlFile(new File([JSON.stringify(out,null,1)],'hechtel-u11-backup-'+today()+'.json',{type:'application/json'}));},
  delMember:function(d){write('members',d.e,'delete',null);toast('Toegang ingetrokken voor '+d.e+'.');},
  goneOff:function(){var sn=(cfg().rbfa||{}).seasonNotice||{};(sn.gone||[]).forEach(function(id){if(S.players.has(id))upd('players',id,{active:false});});saveCfg('rbfa.seasonNotice',null);toast('Spelers op inactief gezet.');},
  goneKeep:function(){saveCfg('rbfa.seasonNotice',null);},
  phaseDel:function(d){var ph=(cfg().phases||[]).slice();ph.splice(Number(d.i),1);saveCfg('phases',ph);},
  closeSheet:function(){closeSheet();},
  undo:function(){var u=S.undo;S.undo=null;$('#toast').hidden=true;if(u)u();}
};
var CH={
  showPast:function(el){S.showPast=el.checked;try{localStorage.setItem('hu11.past',el.checked?'1':'0');}catch(e){}render();},
  calSel:function(el){if(el.checked)S.calSel.add(el.dataset.wk);else S.calSel.delete(el.dataset.wk);render();},
  teamPick:function(el){saveCfg('rbfa.teamNames.'+el.dataset.k,el.value);setTimeout(function(){syncRbfa(true);},400);},
  importFile:function(el){var f=el.files&&el.files[0];el.value='';if(!f)return;f.text().then(importBackup);},
  expInc:function(el){var sh=S.sheet,wk=sh.weeks[0],arr=sh.inc[wk],id=el.dataset.id;if(el.checked){if(arr.indexOf(id)<0)arr.push(id);}else sh.inc[wk]=arr.filter(function(x){return x!==id;});renderSheet();},
  cfg:function(el){var v=el.value;if(el.dataset.num)v=v===''?0:Number(v);if(el.dataset.list)v=splitNames(v);saveCfg(el.dataset.k,v);},
  phase:function(el){var ph=(cfg().phases||[]).slice();ph[Number(el.dataset.i)]=el.value;saveCfg('phases',ph.filter(Boolean).sort());},
  phaseAdd:function(el){if(!el.value)return;var ph=(cfg().phases||[]).slice();ph.push(el.value);saveCfg('phases',uniq(ph).sort());el.value='';},
  mdOpp:function(el){var box=$('#md-new');if(box)box.hidden=el.value!=='__new';if(S.sheet&&S.sheet.d)S.sheet.d.opponentId=el.value;}
};
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-a]');if(!b||b.disabled)return;var fn=ACT[b.dataset.a];if(!fn)return;e.preventDefault();
  if(b.dataset.confirm&&!b.dataset.armed){b.dataset.armed='1';var lbl=b.innerHTML;b.textContent=b.dataset.confirm;setTimeout(function(){if(b.isConnected){delete b.dataset.armed;b.innerHTML=lbl;}},4000);return;}
  fn(b.dataset,b,e);
});
document.addEventListener('change',function(e){var el=e.target;if(el.dataset&&el.dataset.ch&&CH[el.dataset.ch])CH[el.dataset.ch](el);});
document.addEventListener('input',function(e){var el=e.target;if(el.dataset&&el.dataset.in==='ofmap'){var a=$('#of-map');if(!a)return;var addr=[$('#of-addr').value.trim(),[$('#of-pc').value.trim(),$('#of-city').value.trim()].filter(Boolean).join(' ')].filter(Boolean).join(', ');a.hidden=!addr;a.href=addr?gmaps(addr):'#';}});
document.addEventListener('submit',function(e){var f=e.target,k=f.dataset&&f.dataset.form;if(!k)return;e.preventDefault();
  if(k==='login'){var em=$('#lg-mail').value.trim().toLowerCase();if(em)sendLink(em);return;}
  if(k==='confirmLink'){var em2=$('#lg-mail').value.trim().toLowerCase();if(em2)finishLink(em2,(S.login&&S.login.link)||location.href);return;}
  if(k==='useLink'){var ln=$('#lg-link').value.trim();if(!ln)return;if(!AUTH.isSignInWithEmailLink(ln)){toast('Dat is geen geldige inloglink.');return;}finishLink((S.login&&S.login.email)||'',ln);return;}
  if(k==='addMember'){var mm=$('#mb-mail').value.trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mm)){toast('Vul een geldig e-mailadres in.');return;}if(S.user&&mm===S.user.email){toast('Dat ben jij: je hebt al toegang.');return;}if(S.members.has(mm)){toast(mm+' heeft al toegang.');return;}if(write('members',mm,'set',{role:'trainer',addedAt:new Date().toISOString(),addedBy:S.user?S.user.email:''})){$('#mb-mail').value='';toast(mm+' heeft nu toegang.');}return;}
  if(k!=='addPlayer')return;
  var nm=$('#np-name').value.trim(),tm=$('#np-team').value;if(!nm){toast('Vul een naam in.');return;}
  var ord=tm==='X'?null:(plist().filter(function(p){return p.team===tm;}).reduce(function(a,p){return Math.max(a,Number(p.order)||0);},0)+1);
  if(write('players',rid('p'),'set',{name:nm,team:tm,active:true,order:ord,createdAt:new Date().toISOString()})){$('#np-name').value='';toast(nm+' toegevoegd aan '+(tm==='X'?'extern':teamLabel(tm)));}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&S.sheet)closeSheet();});

/* ================= boot ================= */
function boot(){
  var C=window.HU11_CONFIG||{};
  if(!window.firebase||!C.firebase||!C.firebase.apiKey||/VUL_IN/.test(C.firebase.apiKey)){S.db='noconfig';render();return;}
  firebase.initializeApp(C.firebase);
  AUTH=firebase.auth();FS=firebase.firestore();
  try{AUTH.languageCode='nl';}catch(e){}
  try{FS.settings({ignoreUndefinedProperties:true,merge:true});}catch(e){}
  FS.enablePersistence().catch(function(){});
  DB=makeDB(FS);
  if(AUTH.isSignInWithEmailLink(location.href)){var em='';try{em=localStorage.getItem('hu11.email')||'';}catch(e){}finishLink(em,location.href);}
  AUTH.onAuthStateChanged(function(u){
    if(!u){S.user=null;S.admin=false;S.owner=false;S.week=null;stopSubs();S.config=null;CFG=null;['players','opponents','matches','weeks','members'].forEach(function(c){S[c]=new Map();});S.db='login';render();return;}
    S.user={uid:u.uid,email:String(u.email||'').toLowerCase()};S.admin=false;S.owner=false;S.retried=false;S.db='wait';render();
    u.getIdToken().then(subscribe,subscribe);
    if(/[?&](oobCode|apiKey)=/.test(location.search))history.replaceState(null,'',location.pathname);
  });
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')syncRbfa(false);});
  render();
}
boot();
})();
