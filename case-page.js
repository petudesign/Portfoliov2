const casePage=document.querySelector('[data-case-page]');
const caseButtons=[...(casePage?.querySelectorAll('[data-case-mode]')||[])];
const caseTldr=casePage?.querySelector('.case-tldr-content');
const caseFull=casePage?.querySelector('.case-full-content');
const caseMotionDuration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220;
let caseTransitionToken=0;
function animateCasePanel(element,show,token){
 if(!element)return;
 clearTimeout(element._caseHideTimer);
 element.classList.remove('is-case-entering','is-case-exiting');
 if(caseMotionDuration===0){element.hidden=!show;element.setAttribute('aria-hidden',String(!show));return;}
 if(show){
  element.hidden=false;element.setAttribute('aria-hidden','false');element.classList.add('is-case-entering');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===caseTransitionToken)element.classList.remove('is-case-entering');}));
  return;
 }
 if(element.hidden)return;
 element.setAttribute('aria-hidden','true');element.classList.add('is-case-exiting');
 element._caseHideTimer=window.setTimeout(()=>{if(token!==caseTransitionToken)return;element.hidden=true;element.classList.remove('is-case-exiting');},caseMotionDuration);
}
function setCaseMode(mode,animate=true){
 if(!casePage||!caseTldr||!caseFull)return;
 const showFull=mode==='full';
 const token=++caseTransitionToken;
 casePage.querySelector('.case-mode-toggle')?.setAttribute('data-active-mode',mode);
 caseButtons.forEach(button=>{
  const active=button.dataset.caseMode===mode;
  button.classList.toggle('is-active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 if(!animate){caseTldr.hidden=showFull;caseFull.hidden=!showFull;caseTldr.classList.remove('is-case-entering','is-case-exiting');caseFull.classList.remove('is-case-entering','is-case-exiting');caseTldr.setAttribute('aria-hidden',String(showFull));caseFull.setAttribute('aria-hidden',String(!showFull));return;}
 animateCasePanel(caseTldr,!showFull,token);
 animateCasePanel(caseFull,showFull,token);
}
caseButtons.forEach(button=>button.addEventListener('click',()=>setCaseMode(button.dataset.caseMode)));
setCaseMode('tldr',false);
