'use strict';

const translations = {
  et: {
    planner:'Planeerija', info:'Lisainfo', heroTitle:'ABI IGAS RASKES HETKES',
    heroText:'Kriisiks saab igaüks iseseisvalt valmistuda. Selleks juhuks tegime selle lehe, et saaksid vajadusel varusid täiendada.',
    goPlanner:'Planeerijasse →', stateInfo:'Riigiinfo telefon', emergency:'Hädaabi', poison:'Mürgistusteabekeskus',
    plannerHeading:'PLANEERIJA', household:'Leibkond', crises:'Kriisid',
    power:'Elektrikatkestus', waterOutage:'Veevarustuse katkestus', storm:'Torm', evacuation:'Evakuatsioon', general:'Üldine kriis',
    yourPlan:'Sinu varude plaan', days:'Päevi', resultsHint:'Märgi ära varud, mis sul juba olemas on.',
    download:'Salvesta nimekiri', reset:'Alusta uuesti',
    safetyNote:'See on näidisnimekiri. Kohanda varusid oma vajadustele. Kütust kasutavaid seadmeid ei tohi kasutada siseruumides.',
    waterSummary:(liters,people,days)=>`${people} inimesele ${days} päevaks: vähemalt ${liters} liitrit joogivett (arvestusega 3 l inimese kohta päevas).`,
    progress:(done,total)=>`Olemas: ${done} / ${total} · Puudu: ${total-done}`,
    fileTitle:'KRIISIPLAAN – VARUDE NIMEKIRI', people:'Inimesi', crisisType:'Kriis', have:'OLEMAS', missing:'PUUDU',
    items:{water:'Vesi',food:'Toit',medicine:'Ravimid',firstAid:'Esmaabivahendid',hygiene:'Hügieenitarbed',cooking:'Toiduvalmistamise võimalus',matches:'Tikud',powerbank:'Akupank',cash:'Sularaha',radio:'Raadio',flashlight:'Taskulamp',heat:'Soojad riided / tekid',petFood:'Lemmikloomatoit',documents:'Olulised dokumendid'}
  },
  en: {
    planner:'Planner', info:'More info', heroTitle:'HELP IN DIFFICULT TIMES',
    heroText:'Everyone can prepare for an emergency. We made this page to help you review your supplies and prepare ahead of time.',
    goPlanner:'Go to planner →', stateInfo:'Government helpline', emergency:'Emergency', poison:'Poison information centre',
    plannerHeading:'PLANNER', household:'Household', crises:'Emergencies',
    power:'Power outage', waterOutage:'Water outage', storm:'Storm', evacuation:'Evacuation', general:'General emergency',
    yourPlan:'Your supply plan', days:'Days', resultsHint:'Tick the supplies you already have.',
    download:'Save list', reset:'Start again',
    safetyNote:'This is a sample checklist. Adapt it to your needs. Never use fuel-burning equipment indoors.',
    waterSummary:(liters,people,days)=>`For ${people} people over ${days} days: at least ${liters} litres of drinking water (3 L per person per day).`,
    progress:(done,total)=>`Have: ${done} / ${total} · Missing: ${total-done}`,
    fileTitle:'EMERGENCY PLAN – SUPPLY LIST',people:'People',crisisType:'Emergency',have:'HAVE',missing:'MISSING',
    items:{water:'Water',food:'Food',medicine:'Medicines',firstAid:'First aid supplies',hygiene:'Hygiene products',cooking:'Safe cooking option',matches:'Matches',powerbank:'Power bank',cash:'Cash',radio:'Radio',flashlight:'Flashlight',heat:'Warm clothing / blankets',petFood:'Pet food',documents:'Important documents'}
  }
};
const basicItems=['water','food','medicine','firstAid','hygiene','cooking','matches','powerbank','cash','radio','flashlight','heat','petFood'];
const extraByCrisis={power:[],water:[],storm:[],evacuation:['documents'],general:[]};
const key='kriisiplaan-state-v1';
let state={language:'et',household:'',crisis:'',days:7,checked:{}};
try { const saved=JSON.parse(localStorage.getItem(key)); if(saved && typeof saved==='object') state={...state,...saved,checked:saved.checked || {}}; } catch(e) { /* Storage may be unavailable */ }
const t=()=>translations[state.language] || translations.et;
function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch(e){ /* Private mode */ }}
function translatePage(){
  document.documentElement.lang=state.language;
  document.querySelectorAll('[data-i18n]').forEach(el=>{ const val=t()[el.dataset.i18n]; if(typeof val==='string') el.textContent=val; });
  document.querySelectorAll('[data-lang]').forEach(btn=>{const active=btn.dataset.lang===state.language;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
  document.title=(document.body.dataset.page==='planner'?t().planner:'Kriisiplaan')+' – Kriisiplaan';
}
document.querySelectorAll('[data-lang]').forEach(btn=>btn.addEventListener('click',()=>{state.language=btn.dataset.lang;persist();translatePage();renderPlanner();}));

const householdEl=document.getElementById('household');
const crisisEl=document.getElementById('crisis');
const daysEl=document.getElementById('days');
const resultsEl=document.getElementById('results');
const checklistEl=document.getElementById('checklist');
const waterEl=document.getElementById('water-summary');
const progressEl=document.getElementById('progress-line');
function getItems(){return [...basicItems,...(extraByCrisis[state.crisis]||[])];}
function updateProgress(){
  if(!progressEl) return;
  const list=getItems();
  const done=list.filter(id=>state.checked[id]===true).length;
  progressEl.textContent=t().progress(done,list.length);
}
function renderPlanner(){
  if(!householdEl || !crisisEl || !resultsEl) return;
  householdEl.value=state.household || '';
  crisisEl.value=state.crisis || '';
  daysEl.value=state.days || 7;
  const valid=Boolean(state.household && state.crisis);
  resultsEl.hidden=!valid;
  if(!valid) return;
  const days=Math.max(1,Math.min(30,Number(state.days)||7));
  const people=Number(state.household);
  waterEl.textContent=t().waterSummary(3*people*days,people,days);
  checklistEl.replaceChildren();
  for(const id of getItems()){
    const label=document.createElement('label');label.className='check-item';
    const box=document.createElement('input');box.type='checkbox';box.checked=state.checked[id]===true;
    box.name='supply-'+id;
    box.addEventListener('change',()=>{state.checked[id]=box.checked;persist();updateProgress();});
    const text=document.createElement('span');text.textContent=t().items[id];
    label.append(box,text);checklistEl.append(label);
  }
  updateProgress();
}
if(householdEl && crisisEl){
  householdEl.addEventListener('change',e=>{state.household=e.target.value;persist();renderPlanner();});
  crisisEl.addEventListener('change',e=>{state.crisis=e.target.value;persist();renderPlanner();});
  daysEl.addEventListener('change',e=>{state.days=Math.max(1,Math.min(30,Number(e.target.value)||7));persist();renderPlanner();});
  document.getElementById('reset-plan').addEventListener('click',()=>{
    state.household='';state.crisis='';state.days=7;state.checked={};persist();renderPlanner();householdEl.focus();
  });
  document.getElementById('download-plan').addEventListener('click',()=>{
    if(!state.household||!state.crisis)return;
    const dict=t();const crisisName=dict[state.crisis==='water'?'waterOutage':state.crisis]||dict.general;
    const lines=[dict.fileTitle,`${dict.people}: ${state.household}`,`${dict.days}: ${state.days}`,`${dict.crisisType}: ${crisisName}`,waterEl.textContent,''];
    for(const id of getItems()) lines.push(`[${state.checked[id]?'x':' '}] ${dict.items[id]}`);
    const blob=new Blob(['\uFEFF'+lines.join('\n')],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download='kriisiplaan-nimekiri.txt';anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
}
translatePage();
renderPlanner();
