import {RECIPES} from './fixtures.js';
export const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const safeClone=v=>structuredClone(v);
const day=at=>{const d=new Date(at);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const fingerprint=x=>JSON.stringify(x);
const event=(tool,input,output)=>({tool,input,output});
export function parseRequest(text,profile,now=new Date(),previous=null){
 const s=text.toLowerCase().trim();
 if(!/\b(dinner|supper|meal|plan|curry|lentil|pasta|noodles|tonight|tomorrow|budget|under|vegan|vegetarian|avoid|peanuts|milk|wheat)\b/.test(s))return {question:'What would you like to plan? Try “Dinner tomorrow at 7 pm for 4, vegetarian, under $18.”'};
 const servingsMatch=s.match(/(?:for|serves?|people)\s*(\d+|one|two|three|four|five|six|seven|eight)\b/);const words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8};
 const servings=servingsMatch?(words[servingsMatch[1]]??Number(servingsMatch[1])):profile.servings;
 const budgetMatch=s.match(/(?:under|budget(?: of)?|less than|up to)\s*\$?\s*(\d+(?:\.\d{1,2})?)/);
 const budgetCents=budgetMatch?Math.round(Number(budgetMatch[1])*100):profile.budgetCents;
 const diet=/\bvegan\b/.test(s)?'vegan':/\bvegetarian\b/.test(s)?'vegetarian':profile.diet;
 let avoid=[...profile.avoid];for(const key of ['peanuts','milk','wheat'])if(new RegExp(`(?:no|avoid|without)\\s+${key}(?:s)?\\b`).test(s))avoid.push(key);
 if(/no ingredient exclusions|clear exclusions/.test(s))avoid=[];
 let targetDate=previous?new Date(previous.at):new Date(now);if(s.includes('tomorrow')){targetDate=new Date(now);targetDate.setDate(targetDate.getDate()+1);}else if(s.includes('tonight')||s.includes('today'))targetDate=new Date(now);
 const t=s.match(/(?:at|by)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);let h=t?Number(t[1]):previous?targetDate.getHours():19,m=t?Number(t[2]??0):previous?targetDate.getMinutes():0;if(t?.[3]==='pm'&&h<12)h+=12;if(t?.[3]==='am'&&h===12)h=0;
 if(h>23||m>59||servings<1||servings>8||budgetCents<0||budgetCents>100000)return {question:'Please use 1–8 diners, a valid time, and a shopping budget between $0 and $1,000.'};
 targetDate.setHours(h,m,0,0);
 const recipe=RECIPES.find(r=>s.includes(r.id)||s.includes(r.name.toLowerCase())||(r.id==='curry'&&s.includes('chickpea')));
 return {request:{text,servings,budgetCents,diet,avoid:[...new Set(avoid)],at:targetDate.toISOString(),preferredRecipe:recipe?.id??(!/\b(dinner|supper|meal|tonight|tomorrow)\b/.test(s)?previous?.preferredRecipe:null)??null}};
}
export function listPantry(state,at){return state.pantry.filter(l=>l.qty>0&&l.expires>=day(at)).map(safeClone);}
export function compareRecipes(state,request,now=Date.now()){
 const trace=[event('pantry.list',{on:day(request.at)},listPantry(state,request.at).map(l=>({id:l.id,ingredient:l.ingredient,qty:l.qty,expires:l.expires})))];
 const lots=listPantry(state,request.at), candidates=[];
 for(const recipe of RECIPES){
  const required=Object.entries(recipe.ingredients).map(([key,qty])=>({key,qty:Math.ceil(qty*request.servings/recipe.baseServings)}));
  const blocked=[...new Set(required.flatMap(x=>state.catalog[x.key].avoids).filter(x=>request.avoid.includes(x)))];
  const dietMatch=request.diet!=='vegan'||recipe.diet==='vegan';
  const consumption=[],basket=[];let covered=0,earlyUse=0;const needs=[];
  for(const need of required){let remaining=need.qty;const eligible=lots.filter(l=>l.ingredient===need.key).sort((a,b)=>a.expires.localeCompare(b.expires));for(const l of eligible){const take=Math.min(l.qty,remaining);if(take>0){consumption.push({lotId:l.id,key:need.key,qty:take});remaining-=take;covered+=take/need.qty;const days=(Date.parse(l.expires+'T23:59:59')-Date.parse(request.at))/86400000;if(days<=3)earlyUse++;}if(!remaining)break;}
   if(remaining){const item=state.catalog[need.key],packs=Math.ceil(remaining/item.pack);basket.push({key:need.key,name:item.name,packs,qty:packs*item.pack,needed:remaining,unit:item.unit,cents:packs*item.cents,price:item.cents,stock:item.stock});needs.push(need.key);}
  }
  const totalCents=basket.reduce((sum,x)=>sum+x.cents,0),startAt=new Date(Date.parse(request.at)-recipe.minutes*60000).toISOString();
  const calendarConflict=state.calendar.some(e=>e.status==='scheduled'&&Date.parse(e.startAt)<Date.parse(request.at)&&Date.parse(e.endAt)>Date.parse(startAt));
  const reasons=[];if(blocked.length)reasons.push(`Declared ingredients to avoid: ${blocked.join(', ')}.`);if(!dietMatch)reasons.push('This recipe does not match the vegan preference.');if(totalCents>request.budgetCents)reasons.push(`Shopping total ${money(totalCents)} exceeds ${money(request.budgetCents)}.`);if(basket.some(x=>x.packs>x.stock))reasons.push('A required grocery pack is out of stock.');if(Date.parse(startAt)<now+5*60000)reasons.push('There is not enough preparation time before the requested meal.');if(calendarConflict)reasons.push('Preparation overlaps a scheduled plan.');
  const coverage=Math.round(covered/required.length*100);const score=earlyUse*20+coverage*.5-totalCents/100*.8-recipe.minutes*.15+(request.preferredRecipe===recipe.id?100:0);
  candidates.push({recipe,required,consumption,basket,totalCents,startAt,endAt:request.at,coverage,earlyUse,blocked,feasible:reasons.length===0,reasons,score});
 }
 trace.push(event('recipes.compare',{servings:request.servings,diet:request.diet,avoid:request.avoid,budgetCents:request.budgetCents},candidates.map(c=>({recipe:c.recipe.id,feasible:c.feasible,coverage:c.coverage,totalCents:c.totalCents,reasons:c.reasons,score:Number(c.score.toFixed(2))}))));
 const options=candidates.filter(x=>x.feasible).sort((a,b)=>b.score-a.score);let selected=options[0];
 if(request.preferredRecipe&&!options.some(x=>x.recipe.id===request.preferredRecipe))selected=undefined;
 if(selected){trace.push(event('basket.quote',{items:selected.basket.map(x=>({key:x.key,packs:x.packs}))},{totalCents:selected.totalCents,prices:selected.basket.map(x=>({key:x.key,price:x.price,stock:x.stock}))}));trace.push(event('calendar.check',{startAt:selected.startAt,endAt:selected.endAt},{available:true}));}
 return {candidates,selected,trace};
}
export function buildPlan(state,request,now=Date.now(),id='PLAN-'+crypto.randomUUID().slice(0,8).toUpperCase()){
 const result=compareRecipes(state,request,now);if(!result.selected)return {...result,question:request.preferredRecipe?'That recipe cannot meet the current constraints. Choose another candidate or change the budget, time or ingredient exclusions.':'No current recipe meets every constraint. Change the budget, time, stock or ingredient exclusions.'};
 const c=result.selected;const snapshot={revision:state.revision,request,recipeId:c.recipe.id,consumption:c.consumption,basket:c.basket,totalCents:c.totalCents,startAt:c.startAt,endAt:c.endAt};
 return {...result,plan:{id,...snapshot,snapshot:fingerprint(snapshot),createdAt:new Date(now).toISOString(),status:'awaiting-confirmation'}};
}
export function verifyPlan(state,plan,now=Date.now()){
 if(!plan||plan.status!=='awaiting-confirmation')throw new Error('Build a plan before confirming.');
 if(state.completed[plan.id])return state.completed[plan.id];
 const submitted={revision:plan.revision,request:plan.request,recipeId:plan.recipeId,consumption:plan.consumption,basket:plan.basket,totalCents:plan.totalCents,startAt:plan.startAt,endAt:plan.endAt};
 if(fingerprint(submitted)!==plan.snapshot)throw new Error('The confirmation contents changed. Build a new plan.');
 if(plan.revision!==state.revision)throw new Error('The workspace changed after the quote. Replan before confirming.');
 const fresh=buildPlan(state,plan.request,now,plan.id);
 if(!fresh.plan||fresh.plan.snapshot!==plan.snapshot)throw new Error('A price, stock, pantry or time condition changed. Replan to see a fresh quote.');
 return null;
}
export function commitPlan(state,plan,now=Date.now()){
 const prior=verifyPlan(state,plan,now);if(prior)return {state,receipt:prior,idempotent:true};
 const next=safeClone(state),before={pantry:safeClone(state.pantry),catalog:safeClone(state.catalog)};const time=new Date(now).toISOString();
 for(const use of plan.consumption){const lot=next.pantry.find(l=>l.id===use.lotId);if(!lot||lot.qty<use.qty)throw new Error('Pantry availability changed. Replan.');lot.qty-=use.qty;}
 for(const item of plan.basket){next.catalog[item.key].stock-=item.packs;const left=item.qty-item.needed;if(left>0)next.pantry.push({id:`${plan.id}-${item.key}`,ingredient:item.key,qty:left,expires:new Date(Date.parse(plan.endAt)+14*86400000).toISOString().slice(0,10)});}
 const order={id:'ORDER-'+plan.id.slice(5),planId:plan.id,totalCents:plan.totalCents,items:safeClone(plan.basket),status:plan.basket.length?'simulated-confirmed':'no-purchase-needed',at:time};
 const appointment={id:'MEAL-'+plan.id.slice(5),planId:plan.id,title:RECIPES.find(r=>r.id===plan.recipeId).name,startAt:plan.startAt,endAt:plan.endAt,servings:plan.request.servings,status:'scheduled'};
 next.orders.push(order);next.calendar.push(appointment);next.revision++;
 const receipt={id:plan.id,recipeId:plan.recipeId,request:safeClone(plan.request),orderId:order.id,totalCents:plan.totalCents,at:time,status:'confirmed',commitRevision:next.revision,before,startAt:plan.startAt};next.completed[plan.id]=receipt;
 next.profile={servings:plan.request.servings,diet:plan.request.diet,avoid:[...plan.request.avoid],budgetCents:plan.request.budgetCents};
 next.memory.push({at:time,recipeId:plan.recipeId,servings:plan.request.servings,decision:'confirmed'});
 next.audit.push({at:time,action:'confirm',planId:plan.id,revision:next.revision,steps:['consent.snapshot-verified','pantry.reserve','grocery.simulated-confirm','calendar.schedule']});
 return {state:next,receipt,idempotent:false};
}
export function cancelPlan(state,id,now=Date.now()){
 const r=state.completed[id];if(!r||r.status!=='confirmed')throw new Error('This plan is not available to cancel.');
 if(Date.parse(r.startAt)<=now)throw new Error('Preparation has started; automatic cancellation is unavailable.');
 if(state.revision!==r.commitRevision)throw new Error('Later workspace changes exist. Automatic reversal is unavailable.');
 const next=safeClone(state);next.pantry=safeClone(r.before.pantry);next.catalog=safeClone(r.before.catalog);next.orders=next.orders.map(o=>o.planId===id?{...o,status:'simulated-cancelled'}:o);next.calendar=next.calendar.map(e=>e.planId===id?{...e,status:'cancelled'}:e);next.completed[id]={...r,status:'cancelled'};next.revision++;next.memory.push({at:new Date(now).toISOString(),recipeId:r.recipeId,decision:'cancelled'});next.audit.push({at:new Date(now).toISOString(),action:'cancel',planId:id,revision:next.revision,steps:['pantry.restore','grocery.simulated-cancel','calendar.cancel']});return next;
}
export function updateCatalog(state,key,price,stock){if(!state.catalog[key]||!Number.isInteger(price)||price<0||price>100000||!Number.isInteger(stock)||stock<0||stock>100)throw new Error('Use a valid pack price and stock count.');const next=safeClone(state);next.catalog[key]={...next.catalog[key],cents:price,stock};next.revision++;next.audit.push({at:new Date().toISOString(),action:'catalog-change',key,revision:next.revision});return next;}
export function validateWorkspace(state){if(state?.schemaVersion!==1||!Number.isInteger(state.revision)||state.revision<0||!Array.isArray(state.pantry)||!Array.isArray(state.calendar)||!Array.isArray(state.orders)||!Array.isArray(state.audit)||!Array.isArray(state.memory)||typeof state.completed!=='object'||!state.profile||!state.catalog)throw new Error('The saved workspace is invalid.');for(const l of state.pantry)if(typeof l.id!=='string'||!state.catalog[l.ingredient]||!Number.isFinite(l.qty)||l.qty<0||!/^\d{4}-\d{2}-\d{2}$/.test(l.expires))throw new Error('The saved pantry is invalid.');return state;}
