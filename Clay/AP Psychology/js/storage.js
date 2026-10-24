import {blankState,reconcile,defaultSettings} from './engine.js';
const DB='clay-psychology-v1';let db,temporary=blankState();export let durable=false;
export async function openStore(){try{db=await new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Storage blocked'));});durable=true;}catch{durable=false;}return durable;}
// A single read-modify-write transaction serializes encounters across tabs and saves
// attempts, eligibility, rewards, and session position atomically.
export async function transact(fn){
 if(!durable){const next=structuredClone(temporary),result=fn(next);temporary=next;return {state:structuredClone(next),result};}
 return new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),os=tx.objectStore('state'),r=os.get('current');let state,result;
 r.onsuccess=()=>{try{state=r.result||blankState();result=fn(state);os.put(state,'current');}catch(e){tx.abort();reject(e);}};tx.oncomplete=()=>resolve({state,result});tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save canceled'));});
}
export async function read(){return (await transact(()=>null)).state;}
export function exportProgress(s){return JSON.stringify(s,null,2);}
function plain(v){return v&&typeof v==='object'&&!Array.isArray(v);}
function time(v){return Number.isFinite(v)&&v>=0;}
export function validateImport(v,content){
 if(!plain(v)||v.app!=='clay-psychology'||v.schema!==1)throw Error('Not a compatible Clay progress export.');
 const forbidden=['__proto__','constructor','prototype'];const scan=o=>{if(!o||typeof o!=='object')return;for(const k of Object.keys(o)){if(forbidden.includes(k))throw Error('Unsafe object key.');scan(o[k]);}};scan(v);
 if(!plain(v.settings)||!/^\d{4}-\d{2}-\d{2}$/.test(v.settings.exam)||Number.isNaN(Date.parse(v.settings.exam))||new Date(v.settings.exam+'T12:00:00Z').toISOString().slice(0,10)!==v.settings.exam)throw Error('Invalid exam date.');
 try{new Intl.DateTimeFormat('en',{timeZone:v.settings.timezone});}catch{throw Error('Invalid study timezone.');}
 if(!['system','dark','light'].includes(v.settings.theme)||typeof v.settings.sound!=='boolean'||!Number.isFinite(v.settings.volume)||v.settings.volume<0||v.settings.volume>0.5)throw Error('Invalid settings.');
 for(const k of ['firstGap','secondGap','maintenanceGap'])if(!Number.isFinite(v.settings[k])||v.settings[k]<1||v.settings[k]>30)throw Error('Invalid spacing interval.');
 if(!plain(v.progress)||!plain(v.encounters)||!plain(v.achievements)||!plain(v.rewards)||!Array.isArray(v.attempts)||!Array.isArray(v.issues)||!time(v.maxClock)||!time(v.lockUntil)||!time(v.xp)||!Number.isInteger(v.revision))throw Error('Incomplete progress data.');
 const ids=new Set(content.questions.map(q=>q.id));
 for(const [id,p]of Object.entries(v.progress)){if(!ids.has(id)||!plain(p)||!Number.isInteger(p.version)||!Number.isInteger(p.streak)||p.streak<0||p.streak>3||!Array.isArray(p.history)||!p.history.every(time)||!Array.isArray(p.eligibleResults)||!p.eligibleResults.every(x=>typeof x==='boolean')||!time(p.lastExposure)||!time(p.due)||!plain(p.maintenance)||!time(p.maintenance.due)||!Number.isInteger(p.maintenance.successes)||p.maintenance.successes<0||typeof p.covered!=='boolean'||typeof p.needsRefresh!=='boolean'||!time(p.hintCount)||!time(p.misses)||(p.lastDay!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(p.lastDay)))throw Error('Invalid question progress: '+id);}
 const tokens=new Set();for(const a of v.attempts){if(!plain(a)||!ids.has(a.question)||!time(a.timestamp)||typeof a.token!=='string'||tokens.has(a.token)||typeof a.firstResponse!=='boolean'||typeof a.eligible!=='boolean'||typeof a.assisted!=='boolean'||(a.correct!==null&&typeof a.correct!=='boolean')||!/^\d{4}-\d{2}-\d{2}$/.test(a.day))throw Error('Invalid or duplicate attempt.');tokens.add(a.token);}
 for(const [id,e]of Object.entries(v.encounters)){if(!plain(e)||e.id!==id||!ids.has(e.question)||!time(e.openedAt)||!Number.isInteger(e.submitted)||e.submitted<0||typeof e.assisted!=='boolean'||typeof e.eligible!=='boolean'||typeof e.complete!=='boolean'||typeof e.prompt!=='string'||!Number.isInteger(e.variant)||!Number.isInteger(e.questionVersion)||!/^\d{4}-\d{2}-\d{2}$/.test(e.day))throw Error('Invalid encounter.');const q=content.questions.find(q=>q.id===e.question);if(e.questionVersion===q.version&&((['choice','map'].includes(q.format)&&(!Array.isArray(e.choices)||e.choices.length!==q.choices.length||!e.choices.every(c=>q.choices.includes(c))))||(q.format==='match'&&(!Array.isArray(e.matchChoices)||!e.matchChoices.every(c=>Object.values(q.correct).includes(c))))))throw Error('Invalid encounter options.');}
 for(const [id,p]of Object.entries(v.progress)){const eligible=v.attempts.filter(a=>a.question===id&&a.questionVersion===p.version&&a.eligible);const successes=eligible.slice(-Math.min(3,p.streak));if(p.streak>0&&(successes.length<Math.min(3,p.streak)||successes.some(a=>a.correct!==true)||new Set(successes.map(a=>a.day)).size!==successes.length||successes.some((a,i)=>i>0&&a.timestamp-successes[i-1].timestamp<20*3600000)))throw Error('Inconsistent qualifying streak.');if(p.streak===3&&!p.history.length)throw Error('Mastery history is missing.');for(const at of p.history)if(!v.attempts.some(a=>a.question===id&&a.timestamp===at&&a.eligible&&a.correct===true))throw Error('Invalid mastery history.');}
 for(const i of v.issues)if(!plain(i)||!ids.has(i.question)||typeof i.note!=='string'||typeof i.excluded!=='boolean'||!time(i.at))throw Error('Invalid question issue.');
 if(!Object.values(v.achievements).every(time))throw Error('Invalid achievement date.');
 if(v.session!==null&&(!plain(v.session)||!Array.isArray(v.session.queue)||!v.session.queue.every(x=>ids.has(x))||!Number.isInteger(v.session.index)||v.session.index<0||v.session.index>v.session.queue.length||(v.session.encounter&&!v.encounters[v.session.encounter])))throw Error('Invalid pending session.');
 const next=structuredClone(v);next.settings={...defaultSettings,...next.settings};reconcile(next,content);
 if(next.session?.encounter){const e=next.encounters[next.session.encounter],q=content.questions.find(q=>q.id===e.question);if(e.questionVersion!==q.version)next.session=null;}
 return next;
}
export async function replaceState(next){return transact(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,next);});}
