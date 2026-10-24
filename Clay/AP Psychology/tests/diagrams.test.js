import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {diagramLayouts,renderDiagram} from '../js/diagrams.js';
import {grade} from '../js/grading.js';
import {blankState,reconcile,beginEncounter,submit,assist,selectQuestions} from '../js/engine.js';
import {validateImport,exportProgress} from '../js/storage.js';
const c=JSON.parse(fs.readFileSync(new URL('../data/unit.json',import.meta.url)));
const diagrams=c.questions.filter(q=>q.diagram),now=Date.parse('2026-10-24T22:00:00Z');
test('the tree keeps the CNS separate from the PNS and autonomic branches',()=>{
 const q=diagrams.find(q=>q.diagram==='nervous-system'),p=diagramLayouts[q.diagram].parents;
 assert.deepEqual(p,{A:'root',B:'root',C:'B',D:'B',E:'C',F:'C'});
 assert.match(q.correct.A,/Central/);assert.match(q.correct.B,/Peripheral/);assert.match(q.correct.C,/Autonomic/);assert.match(q.correct.D,/Somatic/);assert.match(q.correct.E,/Sympathetic/);assert.match(q.correct.F,/Parasympathetic/);
});
test('the reflex orders detection, incoming signal, spinal integration, output, and muscle',()=>{
 const q=diagrams.find(q=>q.diagram==='reflex-arc');
 assert.deepEqual(diagramLayouts[q.diagram].order.map(k=>q.correct[k]),['Skin receptors','Sensory (afferent) neuron','Interneuron in the spinal cord','Motor (efferent) neuron','Effector muscle']);
});
test('each diagram starts with blank labels and checks every position',()=>{
 for(const q of diagrams){const s=reconcile(blankState(),c),e=beginEncounter(s,q,now,'diagrams'),html=renderDiagram(q,e),keys=Object.keys(q.correct);assert.equal((html.match(/data-match=/g)||[]).length,keys.length);assert.equal((html.match(/ selected/g)||[]).length,0);assert.equal(html.includes('diagram-answer'),false);assert.equal(grade(q,q.correct),true);const wrong={...q.correct,[keys[0]]:q.correct[keys[1]],[keys[1]]:q.correct[keys[0]]};assert.equal(grade(q,wrong),false);assert.equal(grade(q,{}),false);}
});
test('a partially completed diagram survives a validated backup and resumes as the same encounter',()=>{
 const q=diagrams[0],s=reconcile(blankState(),c),e=beginEncounter(s,q,now,'diagrams');e.draft={A:q.correct.A};s.session={queue:[q.id],index:0,encounter:e.id};const restored=validateImport(JSON.parse(exportProgress(s)),c);assert.deepEqual(restored.encounters[e.id].draft,e.draft);const html=renderDiagram(q,restored.encounters[e.id]);assert.equal((html.match(/ selected/g)||[]).length,1);assert.ok(html.includes('data-match="F"'));
});
test('diagram feedback shows the correct labels and assistance blocks mastery',()=>{
 const q=diagrams[1],s=reconcile(blankState(),c),e=beginEncounter(s,q,now,'diagrams');assist(s,e.id,now,'hint');const result=submit(s,q,e.id,q.correct,now,e.id+':0');assert.equal(result.correct,true);assert.equal(result.eligible,false);assert.equal(s.progress[q.id].streak,0);const html=renderDiagram(q,e);assert.equal((html.match(/class="diagram-answer"/g)||[]).length,5);assert.ok(html.includes('disabled'));
});
test('new content reconciles without resetting existing answers and diagram mode selects both diagrams',()=>{
 const old={...c,questions:c.questions.slice(0,60)},s=reconcile(blankState(),old),q=old.questions[0],e=beginEncounter(s,q,now);submit(s,q,e.id,q.correct,now,e.id+':0');reconcile(s,c);assert.equal(s.progress[q.id].streak,1);assert.equal(Object.keys(s.progress).length,84);assert.deepEqual(selectQuestions(s,c,now,'diagrams',2).map(q=>q.diagram),['nervous-system','reflex-arc']);
});
