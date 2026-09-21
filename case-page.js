const casePage=document.querySelector('[data-case-page]');
const caseButtons=[...(casePage?.querySelectorAll('[data-case-mode]')||[])];
const caseTldr=casePage?.querySelector('.case-tldr-content');
const caseFull=casePage?.querySelector('.case-full-content');
function setCaseMode(mode){
 if(!casePage||!caseTldr||!caseFull)return;
 const showFull=mode==='full';
 caseTldr.hidden=showFull;
 caseFull.hidden=!showFull;
 caseButtons.forEach(button=>{
  const active=button.dataset.caseMode===mode;
  button.classList.toggle('is-active',active);
  button.setAttribute('aria-pressed',String(active));
 });
}
caseButtons.forEach(button=>button.addEventListener('click',()=>setCaseMode(button.dataset.caseMode)));
setCaseMode('tldr');
