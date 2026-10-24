import {grade,shuffle} from './grading.js';
export const HOUR=3600000, DAY=24*HOUR, MIN_GAP=20*HOUR;
export const defaultSettings={exam:'2026-10-28',timezone:'America/New_York',theme:'system',sound:false,volume:0.12,firstGap:1,secondGap:3,maintenanceGap:7};
export function studyDay(t,tz){return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));}
export function daysBetween(a,b){return Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/DAY);}
export function blankState(){return {schema:1,app:'clay-psychology',contentVersion:'1.0.0',settings:{...defaultSettings},progress:{},attempts:[],encounters:{},session:null,achievements:{},issues:[],xp:0,rewards:{},maxClock:0,lockUntil:0,firstUsed:null,revision:0};}
export function questionState(q){return {version:q.version,streak:0,history:[],maintenance:{successes:0,due:0},lastDay:null,lastExposure:0,due:0,eligibleResults:[],covered:false,hintCount:0,misses:0,needsRefresh:false};}
export function reconcile(s,content){
 s.contentVersion=content.contentVersion;
 for(const q of content.questions){const p=s.progress[q.id];if(!p)s.progress[q.id]=questionState(q);else if(p.version!==q.version){s.progress[q.id]={...questionState(q),history:p.history,lastDay:p.lastDay,lastExposure:p.lastExposure,due:p.due,needsRefresh:p.history.length>0,reassessment:'Answer semantics changed; rebuild current readiness.'};}}
 return s;
}
export function status(p){return p.streak>=3?'Mastered':p.needsRefresh?'Needs refresh':`${p.streak}/3`;}
export function trouble(p){return p.needsRefresh || p.eligibleResults.slice(-3).filter(v=>!v).length>=2;}
export function excluded(s,id){return s.issues.some(i=>i.question===id&&i.excluded&&i.reason?.trim());}
function clock(s,now){const safe=now>=s.maxClock;s.maxClock=Math.max(s.maxClock,now);return safe;}
export function beginEncounter(s,q,now,mode='mixed',supported=false){
 if(!s.firstUsed)s.firstUsed=now;
 const day=studyDay(now,s.settings.timezone),p=s.progress[q.id];
 const safe=clock(s,now),first=p.lastDay===null || day>p.lastDay;
 const eligible=safe && first && now>=s.lockUntil && now-p.lastExposure>=MIN_GAP && !supported && q.format!=='written' && !excluded(s,q.id);
 // Reserve the day immediately, even if the learner pauses without submitting.
 p.lastDay=p.lastDay===null?day:(day>p.lastDay?day:p.lastDay);
 const id=`${q.id}:${now}:${s.revision++}`;
 const count=s.attempts.filter(a=>a.question===q.id && a.firstResponse).length;
 const prompts=[q.prompt,...q.variants];
 const e={id,question:q.id,questionVersion:q.version,contentVersion:s.contentVersion,openedAt:now,day,timezone:s.settings.timezone,mode,variant:count%prompts.length,prompt:prompts[count%prompts.length],choices:q.choices?shuffle(q.choices):null,matchChoices:q.format==='match'?shuffle([...new Set(Object.values(q.correct))]):null,eligible,assisted:supported,submitted:0,firstResponse:null,correct:null,draft:q.format==='match'?{}:'',complete:false};
 if(supported)p.lastExposure=Math.max(p.lastExposure,now);
 s.encounters[id]=e;return e;
}
export function assist(s,id,now,kind){const e=s.encounters[id];if(!e)return;clock(s,now);e.assisted=true;e.eligible=false;e.assistance=[...(e.assistance||[]),{kind,at:now}];const p=s.progress[e.question];p.lastExposure=Math.max(p.lastExposure,now);p.hintCount++;}
export function scheduleDue(s,p,now){
 let days=p.streak===1?s.settings.firstGap:p.streak===2?s.settings.secondGap:p.streak>=3?s.settings.maintenanceGap*Math.min(4,1+p.maintenance.successes):1;
 const left=daysBetween(studyDay(now,s.settings.timezone),s.settings.exam)-1;
 if(p.streak<3 && left<=days+(2-p.streak))days=1;
 return now+Math.max(MIN_GAP,days*DAY);
}
export function submit(s,q,id,response,now,token){
 const e=s.encounters[id];if(!e||e.complete)return {ignored:true};
 if(s.attempts.some(a=>a.token===token))return {ignored:true};
 const correct=grade(q,response),first=e.submitted===0,safe=clock(s,now),p=s.progress[q.id];
 const eligible=first&&e.eligible&&!e.assisted&&safe&&!excluded(s,q.id)&&e.questionVersion===q.version&&studyDay(now,s.settings.timezone)===e.day&&s.settings.timezone===e.timezone&&now>=s.lockUntil;
 if(first){e.firstResponse=response;e.correct=correct;}
 e.submitted++;e.draft=response;
 const attempt={token,encounter:id,question:q.id,questionVersion:q.version,contentVersion:s.contentVersion,response,firstResponse:first,correct,eligible,assisted:e.assisted,retry:e.submitted-1,timestamp:now,day:studyDay(now,s.settings.timezone),mode:e.mode,variant:e.variant,selfAssessed:q.format==='written'};
 s.attempts.push(attempt);p.covered=true;
 // Every exposure blocks a new qualifying encounter for at least 20 hours.
 p.lastExposure=Math.max(p.lastExposure,now);
 let mastered=false;
 if(eligible){p.eligibleResults.push(correct);p.eligibleResults=p.eligibleResults.slice(-30);if(correct){if(p.streak<3){p.streak++;if(p.streak===3){p.history.push(now);p.needsRefresh=false;mastered=true;}}else p.maintenance.successes++;}else{p.misses++;p.needsRefresh=p.history.length>0;p.streak=0;p.maintenance.successes=0;}p.due=scheduleDue(s,p,now);p.maintenance.due=p.streak>=3?p.due:0;}
 else if(!p.due)p.due=now+DAY;
 const rewardKey=`${q.id}:${attempt.day}`;
 if(!s.rewards[rewardKey]){s.xp+=correct===true?10:4;s.rewards[rewardKey]=true;}
 e.complete=true;
 return {correct,eligible,first,mastered,attempt};
}
export function retryEncounter(s,id,now){const e=s.encounters[id];assist(s,id,now,'supported retry');e.complete=false;return e;}
export function changeSettings(s,next,now){
 if(next.timezone!==s.settings.timezone)s.lockUntil=Math.max(s.lockUntil,Math.max(now,s.maxClock)+MIN_GAP);
 s.settings={...next};
 for(const p of Object.values(s.progress))if(p.due)p.due=Math.max(p.lastExposure+MIN_GAP,scheduleDue(s,p,now));
}
export function plan(s,content,now){
 const today=studyDay(now,s.settings.timezone),days=daysBetween(today,s.settings.exam),all=content.questions.filter(q=>!excluded(s,q.id));
 const automatic=all.filter(q=>q.format!=='written'),uncovered=all.filter(q=>!s.progress[q.id].covered);
 const due=automatic.filter(q=>s.progress[q.id].due && s.progress[q.id].due<=now);
 const master=automatic.filter(q=>s.progress[q.id].streak>=3);
 const firstDay=studyDay(s.firstUsed||now,s.settings.timezone);
 const elapsed=Math.max(0,daysBetween(firstDay,today));
 const coverageDays=Math.max(1,Math.min(3-elapsed,days-2));
 const newTarget=Math.ceil(uncovered.length/coverageDays);
 const reviews=automatic.filter(q=>s.progress[q.id].streak<3).reduce((n,q)=>n+3-s.progress[q.id].streak,0);
 const daily=Math.max(due.length+newTarget,Math.ceil(reviews/Math.max(1,days-1)));
 const impossible=automatic.filter(q=>{const p=s.progress[q.id];const remaining=3-p.streak;if(remaining<=0)return false;let earliest=Math.max(now,p.lastExposure+MIN_GAP,s.lockUntil);let firstDay=studyDay(earliest,s.settings.timezone);if(p.lastDay&&firstDay<=p.lastDay){earliest+=DAY;firstDay=studyDay(earliest,s.settings.timezone);}return daysBetween(today,firstDay)+remaining-1>days-1;});
 return {today,days,phase:days===1?'Comprehensive check':days===0?'Optional warm-up':days<0?'Keep exploring':uncovered.length?'Coverage and spaced review':'Spaced review',all,automatic,uncovered,due,master,impossible,daily,sessions:Math.max(1,Math.ceil(daily/10)),newTarget};
}
export function selectQuestions(s,content,now,mode,count,topic='all'){
 const all=content.questions.filter(q=>!excluded(s,q.id)&&(topic==='all'||q.topic===topic));
 if(mode==='trouble')return all.filter(q=>trouble(s.progress[q.id])||s.progress[q.id].hintCount>=2).sort((a,b)=>s.progress[b.id].misses-s.progress[a.id].misses).slice(0,count);
 if(mode==='diagrams')return all.filter(q=>q.diagram).slice(0,count);
 if(mode==='matching')return shuffle(all.filter(q=>q.format==='match')).slice(0,count);
 if(mode==='recall')return shuffle(all.filter(q=>q.format==='recall')).slice(0,count);
 if(mode==='written')return shuffle(all.filter(q=>q.format==='written')).slice(0,count);
 if(mode==='boss')return shuffle(all.filter(q=>q.tags.includes('boss'))).slice(0,count);
 if(mode==='comprehensive')return all.sort((a,b)=>Number(s.progress[a.id].lastDay===studyDay(now,s.settings.timezone))-Number(s.progress[b.id].lastDay===studyDay(now,s.settings.timezone))).slice(0,count);
 const day=studyDay(now,s.settings.timezone);
 return shuffle(all).sort((a,b)=>{
  function priority(q){const p=s.progress[q.id];if(p.lastDay===day)return 9;if(p.lastExposure && now-p.lastExposure<MIN_GAP)return 8;if(p.due && p.due<=now)return trouble(p)?0:1;if(!p.covered)return 2;if(trouble(p))return 3;if(p.streak<3)return 4;return 7;}
  return priority(a)-priority(b);
 }).slice(0,count);
}
export function statistics(s,questions){const ids=new Set(questions.map(q=>q.id)),a=s.attempts.filter(a=>ids.has(a.question)&&!a.selfAssessed),first=a.filter(a=>a.firstResponse),pct=arr=>arr.length?Math.round(100*arr.filter(a=>a.correct).length/arr.length):null;return {lifetime:pct(first),recent:pct(first.slice(-30)),eligible:pct(a.filter(a=>a.eligible)),retries:pct(a.filter(a=>!a.firstResponse)),count:first.length};}
