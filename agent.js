import {RECIPES} from './fixtures.js';
export const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const safeClone=v=>structuredClone(v);
const day=at=>{const d=new Date(at);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
const fingerprint=x=>JSON.stringify(x);
const event=(tool,input,output)=>({tool,input,output});
export function parseRequest(text,profile,now=new Date(),previous=null){
 const unknown=()=>({question:'What would you like to plan? Try “Dinner tomorrow at 7 pm for 4, vegetarian, under $18.”'});
 if(typeof text!=='string'||!text.trim())return unknown();
 const s=text.toLowerCase().replace(/[’‘]/g,"'").trim();
 // Carry the pending conversation, not only the last confirmed profile.
 const base={...profile,...previous};
 const words={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
 const number='[+-]?\\d+(?:\\.\\d+)?|'+Object.keys(words).join('|');
 const servingMatches=[
  ...s.matchAll(new RegExp(`\\b(?:for|serves?|people|diners?|servings?)(?:\\s+(?:to|of|is))?\\s+(${number})(?![\\w.])`,'g')),
  ...s.matchAll(new RegExp(`(?:^|\\s)(${number})\\s+(?:people|diners?|servings?|of us)\\b`,'g')),
  ...(previous?s.matchAll(new RegExp(`\\bmake it\\s+(${number})[.!?]?$`,'g')):[])
 ];
 const servingValues=[...new Set(servingMatches.map(m=>words[m[1]]??Number(m[1])))];
 const servingsIntent=/\b(?:diners?|people|servings?|serves?)\b|\bfor\s*(?:$|[+-]?\d)/.test(s)||/\bfor\s+(?!today\b|tomorrow\b|tonight\b|dinner\b|supper\b|the meal\b)\S+/.test(s);
 const moneyToken='[+-]?(?:\\d+(?:,\\d+)*(?:\\.\\d+)?|\\.\\d+)';
 const budgetMatch=s.match(new RegExp(`\\$\\s*(${moneyToken})(?![\\w.])`))??s.match(new RegExp(`\\b(?:under|less than|up to|spend|budget(?:\\s+(?:of|to|is))?)\\s+(${moneyToken})(?![\\w.])`));
 const budgetIntent=/\b(?:budget|under|less than|up to|spend)\b|\$/.test(s);
 const timeValue='([+-]?\\d+(?::\\d+)?\\s*(?:am|pm)?)(?![\\w:.])';
 const timeMatch=s.match(new RegExp(`\\b(?:at|by)\\s+${timeValue}`))
  ??s.match(new RegExp(`\\b(?:move|reschedule|time)\\b[^,;]*?\\bto\\s+${timeValue}`))
  ??s.match(/(?:^|\s)(\d+(?::\d+)?\s*(?:am|pm))\b/);
 const timeIntent=/\b(?:at|by|time|reschedule)\b|\bmove\b[^,;]*?\bto\b/.test(s);
 const clearExclusions=/\b(?:no ingredient exclusions|clear exclusions)\b/.test(s);
 // A negated recipe/date/diet must never become a positive selection.
 const negationCheck=s.replace(/\b(?:don't|do not)\s+(?:use|include|add|eat)\s+(?:peanuts|milk|wheat)\b/g,'');
 if(/\b(?:not|never|don't|do not|no longer)\b|\bno\s+(?:vegan|vegetarian|curry|lentil|pasta|noodles|dinner|meal)\b/.test(negationCheck))return {question:'Please state the replacement directly, such as “Switch to curry”, “Make it vegetarian”, or “Move it to 8 pm”. Your previous constraints are unchanged.'};
 if(servingValues.length>1||servingsIntent&&!servingValues.length)return {question:'How many diners? Please give one whole number from 1 to 8.'};
 if(budgetIntent&&(!budgetMatch||/[-+]\s*\$/.test(s)||!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(budgetMatch[1])))return {question:'What is the shopping budget? Please give an amount from $0 to $1,000, with at most two decimal places.'};
 if(timeIntent&&!timeMatch)return {question:'What time should dinner be ready? Try “At 8:30 pm”.'};
 const recognized=/\b(dinner|supper|meal|plan|curry|lentil|pasta|noodles|tonight|today|tomorrow|vegan|vegetarian)\b/.test(s)||servingValues.length||budgetMatch||timeMatch||clearExclusions||/\b(?:no|avoid|without|don't use|do not use|don't include|do not include|don't add|do not add|don't eat|do not eat)\s+(?:peanuts|milk|wheat)\b/.test(s);
 if(!recognized)return unknown();
 const servings=servingValues[0]??base.servings;
 const budgetCents=budgetMatch?Math.round(Number(budgetMatch[1].replaceAll(',',''))*100):base.budgetCents;
 const diet=/\bvegan\b/.test(s)?'vegan':/\bvegetarian\b/.test(s)?'vegetarian':base.diet;
 let avoid=clearExclusions?[]:[...(base.avoid??[])];
 for(const key of ['peanuts','milk','wheat'])if(new RegExp(`\\b(?:no|avoid|without|(?:don't|do not) (?:use|include|add|eat))\\s+${key}\\b`).test(s))avoid.push(key);
 const priorTime=previous?new Date(previous.at):null;
 let targetDate=priorTime?new Date(priorTime):new Date(now);
 if(/\btomorrow\b/.test(s)){targetDate=new Date(now);targetDate.setDate(targetDate.getDate()+1);}
 else if(/\b(?:tonight|today)\b/.test(s))targetDate=new Date(now);
 let h=priorTime?priorTime.getHours():19,m=priorTime?priorTime.getMinutes():0;
 if(timeMatch){
  const t=timeMatch[1].trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if(!t)return {question:'Please use a valid time, such as 8:30 pm or 20:30.'};
  h=Number(t[1]);m=Number(t[2]??0);
  if(h>23||m>59||t[3]&&(h<1||h>12))return {question:'Please use a valid time, such as 8:30 pm or 20:30.'};
  if(t[3]==='pm'&&h<12)h+=12;if(t[3]==='am'&&h===12)h=0;
 }
 if(!Number.isInteger(servings)||servings<1||servings>8||!Number.isInteger(budgetCents)||budgetCents<0||budgetCents>100000||!Number.isFinite(targetDate.getTime()))return {question:'Please use 1–8 diners, a valid time, and a shopping budget between $0 and $1,000.'};
 targetDate.setHours(h,m,0,0);
 const recipe=RECIPES.find(r=>new RegExp(`\\b${r.id}\\b`).test(s)||s.includes(r.name.toLowerCase())||(r.id==='curry'&&/\bchickpea\b/.test(s)));
 return {request:{text,servings,budgetCents,diet,avoid:[...new Set(avoid)],at:targetDate.toISOString(),preferredRecipe:recipe?.id??previous?.preferredRecipe??null}};
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
