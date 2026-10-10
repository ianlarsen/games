export const normalize = v => String(v ?? '').normalize('NFKC').toLowerCase().trim().replace(/[–—]/g,'-').replace(/\s+/g,' ');
function distance(a,b){ const d=Array.from({length:a.length+1},(_,i)=>[i]); for(let j=0;j<=b.length;j++)d[0][j]=j; for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1)); return d[a.length][b.length]; }
export function grade(q,response){
 if(q.format==='written')return null;
 if(q.format==='match')return !!response && Object.keys(q.correct).every(k=>response[k]===q.correct[k]);
 if(q.unordered){const a=normalize(response).split(/[,;]+/).map(s=>s.trim()).sort();return JSON.stringify(a)===JSON.stringify([...q.unordered].sort());}
 const a=normalize(response);
 if(q.format==='recall')return q.acceptedAnswers.some(b=>a===normalize(b)||(q.typoTolerance && a.length>=7 && distance(a,normalize(b))<=1));
 return response===q.correct;
}
export function answerText(q){return typeof q.correct==='object'?Object.entries(q.correct).map(([k,v])=>`${k}: ${v}`).join('\n'):q.correct;}
export function shuffle(items,random=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
