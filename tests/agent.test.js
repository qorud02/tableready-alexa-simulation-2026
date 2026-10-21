import test from 'node:test';import assert from 'node:assert/strict';
import {createWorkspace} from '../fixtures.js';
import {parseRequest,buildPlan,commitPlan,cancelPlan,updateCatalog,compareRecipes,validateWorkspace} from '../agent.js';
const now=new Date('2026-10-03T10:00:00Z');
const workspace=()=>createWorkspace(now);
const request=(overrides={})=>({text:'Demo dinner',servings:4,budgetCents:1800,diet:'vegetarian',avoid:['peanuts'],at:'2026-10-04T19:00:00Z',preferredRecipe:null,...overrides});
test('unknown requests ask a question rather than execute a default',()=>assert.ok(parseRequest('Tell me a joke',workspace().profile,now).question));
test('natural-language constraints and changes preserve the previous meal time',()=>{const a=parseRequest('Dinner tomorrow at 7 pm for four, vegan, under $12, no wheat',workspace().profile,now).request;assert.equal(a.servings,4);assert.equal(a.budgetCents,1200);assert.equal(a.diet,'vegan');assert.ok(a.avoid.includes('wheat'));const b=parseRequest('Switch to curry', {...workspace().profile,...a},now,a).request;assert.equal(b.at,a.at);assert.equal(b.preferredRecipe,'curry');});
test('real candidates differ by pantry coverage, price, time and exclusions',()=>{const r=compareRecipes(workspace(),request(),now.getTime());assert.equal(r.candidates.length,4);assert.equal(r.selected.recipe.id,'lentil');assert.equal(r.selected.totalCents,0);assert.equal(r.candidates.find(c=>c.recipe.id==='noodles').feasible,false);assert.equal(r.trace[0].tool,'pantry.list');});
test('vegan and declared ingredient exclusions are hard constraints',()=>{const r=compareRecipes(workspace(),request({diet:'vegan',avoid:['peanuts','milk']}),now.getTime());assert.equal(r.candidates.find(c=>c.recipe.id==='pasta').feasible,false);assert.equal(r.candidates.find(c=>c.recipe.id==='noodles').feasible,false);});
test('recipe requests replan the actual quote',()=>{const a=buildPlan(workspace(),request(),now.getTime(),'A');const b=buildPlan(workspace(),request({preferredRecipe:'curry'}),now.getTime(),'B');assert.notEqual(a.plan.recipeId,b.plan.recipeId);assert.ok(b.plan.basket.length);assert.ok(b.plan.totalCents>a.plan.totalCents);});
test('insufficient budget, stock or preparation time prevents a plan',()=>{assert.ok(buildPlan(workspace(),request({preferredRecipe:'curry',budgetCents:100}),now.getTime()).question);const s=workspace();s.catalog.coconut.stock=0;assert.ok(buildPlan(s,request({preferredRecipe:'curry'}),now.getTime()).question);assert.ok(buildPlan(workspace(),request({at:'2026-10-03T10:10:00Z'}),now.getTime()).question);});
test('calendar overlap excludes the conflicting recipe',()=>{const s=workspace();s.calendar.push({status:'scheduled',startAt:'2026-10-04T18:00:00Z',endAt:'2026-10-04T20:00:00Z'});assert.ok(buildPlan(s,request(),now.getTime()).question);});
test('confirmation executes pantry, grocery and calendar state atomically',()=>{const s=workspace(),p=buildPlan(s,request({preferredRecipe:'curry'}),now.getTime(),'DEMO').plan;const r=commitPlan(s,p,now.getTime());assert.equal(s.revision,0);assert.equal(r.state.revision,1);assert.equal(r.state.orders.length,1);assert.equal(r.state.calendar.length,1);assert.ok(r.state.pantry.find(x=>x.id==='LOT-R').qty<s.pantry.find(x=>x.id==='LOT-R').qty);assert.equal(r.state.catalog.coconut.stock,s.catalog.coconut.stock-1);});
test('repeated confirmation is idempotent and does not double-reserve',()=>{const s=workspace(),p=buildPlan(s,request({preferredRecipe:'curry'}),now.getTime(),'DEMO').plan;const a=commitPlan(s,p,now.getTime());const b=commitPlan(a.state,p,now.getTime());assert.equal(b.idempotent,true);assert.equal(b.state.orders.length,1);assert.equal(b.state.revision,1);});
test('a changed quote or manipulated confirmation snapshot is rejected',()=>{const s=workspace(),p=buildPlan(s,request({preferredRecipe:'curry'}),now.getTime()).plan;assert.throws(()=>commitPlan(updateCatalog(s,'coconut',999,3),p,now.getTime()));assert.throws(()=>commitPlan(s,{...p,snapshot:'altered'},now.getTime()));});
test('cancellation restores the exact pantry and catalog and retains receipts',()=>{const s=workspace(),p=buildPlan(s,request({preferredRecipe:'curry'}),now.getTime(),'DEMO').plan;const a=commitPlan(s,p,now.getTime());const b=cancelPlan(a.state,p.id,now.getTime());assert.deepEqual(b.pantry,s.pantry);assert.deepEqual(b.catalog,s.catalog);assert.equal(b.orders[0].status,'simulated-cancelled');assert.equal(b.calendar[0].status,'cancelled');assert.equal(b.audit.length,2);});
test('automatic reversal cannot overwrite later actions or a started preparation',()=>{const s=workspace(),p=buildPlan(s,request(),now.getTime(),'DEMO').plan;const a=commitPlan(s,p,now.getTime());assert.throws(()=>cancelPlan(updateCatalog(a.state,'milk',250,2),p.id,now.getTime()));assert.throws(()=>cancelPlan(a.state,p.id,Date.parse(p.startAt)+1));});
test('expired lots are excluded and servings change real quantities',()=>{const s=workspace();s.pantry.find(x=>x.ingredient==='rice').expires='2026-10-01';const a=compareRecipes(s,request({servings:8}),now.getTime()).candidates.find(c=>c.recipe.id==='lentil');assert.ok(a.basket.some(x=>x.key==='rice'&&x.needed===600));});
test('saved workspace and catalog edits reject malformed values',()=>{assert.equal(validateWorkspace(workspace()).revision,0);assert.throws(()=>validateWorkspace({...workspace(),pantry:[{qty:-1}]}));assert.throws(()=>updateCatalog(workspace(),'coconut',NaN,1));});
test('confirmation verifies every action field, not only a stored fingerprint',()=>{const s=workspace(),p=buildPlan(s,request({preferredRecipe:'curry'}),now.getTime()).plan;assert.throws(()=>commitPlan(s,{...p,totalCents:0},now.getTime()));const changed=structuredClone(p);changed.consumption[0].qty=99999;assert.throws(()=>commitPlan(s,changed,now.getTime()));});
test('incremental budget correction retains the explicit recipe; unrelated change asks',()=>{const prior=request({preferredRecipe:'curry'});const p=parseRequest('Under $6',workspace().profile,now,prior);assert.equal(p.request.preferredRecipe,'curry');assert.equal(Date.parse(p.request.at),Date.parse(prior.at));assert.ok(parseRequest('Change the weather',workspace().profile,now).question);});

test('a conversation changes one constraint at a time without reverting pending preferences',()=>{
 const profile=workspace().profile,originalProfile=structuredClone(profile);
 const first=parseRequest('Curry tomorrow at 7 pm for three, vegan, under $12, no wheat',profile,now).request;
 const originalFirst=structuredClone(first);
 const diners=parseRequest('Actually make it six people',profile,now,first).request;
 assert.deepEqual(diners,{...first,text:'Actually make it six people',servings:6});
 const budget=parseRequest('Raise the budget to $20',profile,now,diners).request;
 assert.deepEqual(budget,{...diners,text:'Raise the budget to $20',budgetCents:2000});
 const later=parseRequest('Move it to 8:30 pm',profile,now,budget).request;
 const expected=new Date(first.at);expected.setHours(20,30,0,0);
 assert.deepEqual(later,{...budget,text:'Move it to 8:30 pm',at:expected.toISOString()});
 assert.deepEqual(first,originalFirst);assert.deepEqual(profile,originalProfile);
});

test('changing the meal day preserves the chosen clock time, recipe and dietary constraints',()=>{
 const profile=workspace().profile;
 const first=parseRequest('Curry tomorrow at 8:30 pm for two, vegan, under $8, no wheat',profile,now).request;
 const changed=parseRequest('Dinner today instead',profile,now,first).request;
 const expected=new Date(now);expected.setHours(20,30,0,0);
 assert.deepEqual(changed,{...first,text:'Dinner today instead',at:expected.toISOString()});
});

test('common diner and budget corrections accept whole counts and exact currency amounts',()=>{
 const profile=workspace().profile,prior=request({servings:3});
 for(const text of ['Make it six','Six people','Change servings to six','Dinner for six'])assert.equal(parseRequest(text,profile,now,prior).request.servings,6,text);
 assert.equal(parseRequest('Set the budget to $12.50',profile,now,prior).request.budgetCents,1250);
 assert.equal(parseRequest('Budget of $1,000',profile,now,prior).request.budgetCents,100000);
 assert.equal(parseRequest('Under $0',profile,now,prior).request.budgetCents,0);
});

test('invalid explicit values ask instead of silently keeping or partially parsing a default',()=>{
 const profile=workspace().profile,prior=request();
 for(const text of ['Dinner for -2','Dinner for 2.5','Dinner for zero','Dinner for nine','Dinner for 4 and 6 people','Under $-5','Under $12.345','Budget $1,00','Budget $1001','At 13 pm','At 0 am','At 24:00','At 8:60','At 8:5','At -2 pm']){
  const parsed=parseRequest(text,profile,now,prior);assert.ok(parsed.question,text);assert.equal(parsed.request,undefined,text);
 }
});

test('missing correction values and empty input ask without changing the previous request',()=>{
 const profile=workspace().profile,prior=request({servings:6,budgetCents:1250}),copy=structuredClone(prior);
 for(const text of ['',null,undefined,'Change the budget to','Dinner for','Change servings to','Move it to','Dinner at','Make it']){
  const parsed=parseRequest(text,profile,now,prior);assert.ok(parsed.question,String(text));assert.equal(parsed.request,undefined,String(text));
 }
 assert.deepEqual(prior,copy);
});

test('negated selections ask for a replacement while explicit ingredient exclusions remain supported',()=>{
 const profile=workspace().profile,prior=request({diet:'vegan',preferredRecipe:'curry',avoid:['peanuts','wheat']});
 for(const text of ['Not vegan','Not curry','Not tomorrow','Do not change the budget to $10','No longer vegetarian','Dinner without meat, not pasta'])assert.ok(parseRequest(text,profile,now,prior).question,text);
 const excluded=parseRequest('Don’t use milk',profile,now,prior).request;
 assert.deepEqual(excluded.avoid,['peanuts','wheat','milk']);assert.equal(excluded.preferredRecipe,'curry');
 const cleared=parseRequest('Clear exclusions',profile,now,excluded).request;
 assert.deepEqual(cleared.avoid,[]);assert.equal(cleared.diet,'vegan');assert.deepEqual(prior.avoid,['peanuts','wheat']);
});

test('a conversational revision changes real quantities and still confirms once and cancels exactly',()=>{
 const state=workspace(),profile=state.profile;
 const first=parseRequest('Curry tomorrow at 7 pm for four, vegan, under $18',profile,now).request;
 const before=buildPlan(state,first,now.getTime(),'PLAN-BEFORE').plan;
 const revised=parseRequest('Make it six people',profile,now,first).request;
 const plan=buildPlan(state,revised,now.getTime(),'PLAN-AFTER').plan;
 assert.ok(before);assert.ok(plan);assert.equal(plan.request.servings,6);
 assert.ok(plan.consumption.find(x=>x.key==='rice').qty>before.consumption.find(x=>x.key==='rice').qty);
 const committed=commitPlan(state,plan,now.getTime());
 assert.equal(committed.state.calendar[0].servings,6);assert.equal(state.revision,0);
 const duplicate=commitPlan(committed.state,plan,now.getTime());
 assert.equal(duplicate.idempotent,true);assert.equal(duplicate.state.orders.length,1);
 const cancelled=cancelPlan(duplicate.state,plan.id,now.getTime());
 assert.deepEqual(cancelled.pantry,state.pantry);assert.deepEqual(cancelled.catalog,state.catalog);
 assert.equal(cancelled.orders[0].status,'simulated-cancelled');assert.equal(cancelled.calendar[0].status,'cancelled');
});
