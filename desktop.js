// Edit these lists to add shortcuts or Dock applications.
if(!document.head.querySelector('base')){const portfolioBase=document.createElement('base');portfolioBase.href=new URL('/',location.href).href;document.head.prepend(portfolioBase);}
const desktopShortcuts = [
 {name:'My work',href:'#work',icon:'folder',items:['Peluutin','KorisLab','Helsinki Sports Map','Brio']}, {name:'About me',href:'#about',icon:'folder',items:['About me','As a designer']},
 {name:'Side projects',href:'#sideprojects',icon:'folder',items:['Spire Coach Mod','OpenSlot']},
 {name:'Resume',href:'#resume',icon:'CV'},
 {name:'As a designer.md',href:'#how-i-work',icon:'MD'},
 {name:'Chess',href:'#chess',icon:'chess'},
];
// Icons named *-macos.* are macOS-style app icons that carry their own tile.
const desktopApps = [
 ['Spotify','spotify-macos.svg','#spotify'],
 ['Chrome','chrome-macos.png','#home'], ['Figma','figma-macos.png',null],
 ['Codex','chatgpt-macos.png',null], ['Claude','claude-macos.png',null], ['Paper Design','paper-macos.png',null],
 ['Obsidian','obsidian-macos.png',null], ['LM Lab','lmstudio-macos.svg',null],
 ['VS Code','vscode-macos.svg',null], ['Xcode','xcode-macos.png',null],
];
const portfolioWindow=document.querySelector('#portfolio-window');
const browserPage=document.querySelector('#browser-page');
const portfolioToc=document.querySelector('#portfolio-toc');
const portfolioTocItems=portfolioToc?.querySelector('[data-toc-items]');
let portfolioTocScrollHandler;
let portfolioTocExitTimer;
const portfolioMotionDuration=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:220;
if('scrollRestoration' in history)history.scrollRestoration='manual';
let windowLayer=200;
let activeWindow=portfolioWindow;
const windowLaunchers=new WeakMap();
function rememberLauncher(windowElement){
 const launcher=document.activeElement;
 if(launcher instanceof HTMLElement&&!windowElement.contains(launcher)&&launcher!==document.body)windowLaunchers.set(windowElement,launcher);
}
function restoreLauncher(windowElement,fallbackSelector){
 const launcher=windowLaunchers.get(windowElement);
 (launcher?.isConnected?launcher:document.querySelector(fallbackSelector))?.focus({preventScroll:true});
}
function bringToFront(windowElement){windowElement.style.zIndex=String(++windowLayer);activeWindow=windowElement;}
function getOpenWindows(){
 return [...document.querySelectorAll('.portfolio-window,.document-window,.chess-window,.spotify-window')]
  .filter(windowElement=>!windowElement.classList.contains('is-minimized')&&!windowElement.classList.contains('is-room-hidden')&&!windowElement.inert)
  .sort((a,b)=>(Number(a.style.zIndex)||0)-(Number(b.style.zIndex)||0));
}
function enableArrowNavigation(container,selector,columns=1){
 const updateTabStops=current=>{
  for(const item of container.querySelectorAll(selector))item.tabIndex=item===current?0:-1;
 };
 const first=container.querySelector(selector);if(first)updateTabStops(first);
 container.addEventListener('focusin',event=>{const current=event.target.closest(selector);if(current)updateTabStops(current);});
 container.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
  const items=[...container.querySelectorAll(selector)].filter(item=>!item.hidden&&!item.closest('[hidden]'));
  const current=event.target.closest(selector);const index=items.indexOf(current);if(index<0)return;
  const step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-columns,ArrowDown:columns}[event.key];
  const nextIndex=event.key==='Home'?0:event.key==='End'?items.length-1:Math.max(0,Math.min(items.length-1,index+step));
  if(nextIndex===index)return;
  event.preventDefault();items[nextIndex].focus({preventScroll:true});
 });
}
const pageTitles={home:'Portfolio',work:'Selected work',about:'About me','sports-map':'Helsinki Sports Map',korislab:'KorisLab','spire-coach-mod':'Spire Coach Mod',openslot:'OpenSlot',brio:'Brio',peluutin:'Peluutin',shavikki:'S-hävikki',tahti:'Tahti'};
const defaultPageDescription='Petteri Helttula is a Helsinki-based product designer and AI design engineer working across UX/UI, AI, code, data and interactive products.';
const pageDescriptions={openslot:'OpenSlot is an early smart-glasses concept for checking calendar availability during a conversation.',home:defaultPageDescription,work:'Selected product design work by Petteri Helttula, spanning UX/UI, code, data and interactive product experiments.',about:'About Petteri Helttula, a Helsinki-based product designer and AI design engineer interested in people, technology and how products work.',"sports-map":'Helsinki Sports Map is a work-in-progress product design project for discovering sports, venues and routes across Helsinki.',korislab:'KorisLab is a work-in-progress basketball analysis product for Finland’s men’s and women’s Korisliiga, with season data from 2024–25 onward.',"spire-coach-mod":'Spire Coach Mod is a work-in-progress game coaching experiment that turns gameplay mistakes into useful lessons.',brio:'Brio is a digital wellbeing concept using pose tracking to encourage short movement breaks while scrolling.',peluutin:'Peluutin is built with junior coaches to track playing time, manage football and futsal matches, and create shareable training exercises.',shavikki:'S-hävikki is a service design project exploring how retail teams can reduce food waste and simplify near-expiry checks.',tahti:'Tahti is an interaction design project that presents selected text one word at a time at a controlled pace.'};
const cleanRoutePaths={openslot:'/openslot/','sports-map':'/helsinki-sports-map/','korislab':'/korislab/','spire-coach-mod':'/spire-coach-mod/','brio':'/brio/','peluutin':'/peluutin/','shavikki':'/s-havikki/','tahti':'/tahti/'};
const cleanPathRoutes=Object.fromEntries(Object.entries(cleanRoutePaths).map(([route,path])=>[path,route]));
cleanPathRoutes['/korisiq/']='korislab';
const routeLocations={home:'/',work:'/#work',about:'/#about',...cleanRoutePaths};
const normalizePath=pathname=>{
 const path=pathname.replace(/\\/g,'/');
 return path==='/'?'/':`${path.replace(/\/$/,'')}/`;
};
const routeFromLocation=()=>{
 const hash=location.hash.slice(1);
 if(Object.hasOwn(pageTitles,hash))return hash;
 return cleanPathRoutes[normalizePath(location.pathname)]||'home';
};
const locationForRoute=route=>routeLocations[route]||`/#${route}`;
let navigation=['home'];let navigationIndex=0;
const mobileDesktop=window.matchMedia('(max-width:700px)');
function syncDesktopShortcuts(){
 document.querySelector('.desktop-side').inert=mobileDesktop.matches&&!portfolioWindow.classList.contains('is-minimized');
}
mobileDesktop.addEventListener('change',syncDesktopShortcuts);
syncDesktopShortcuts();
function showPortfolio(){
 rememberLauncher(portfolioWindow);
 portfolioWindow.classList.remove('is-minimized');portfolioWindow.inert=false;
 syncDesktopShortcuts();
 bringToFront(portfolioWindow);
 document.querySelector('[data-app="Chrome"]').classList.add('is-running');
}
function hidePortfolio(){
 portfolioWindow.classList.add('is-minimized');portfolioWindow.inert=true;
 syncDesktopShortcuts();
 document.querySelector('[data-app="Chrome"]').classList.remove('is-running');
 restoreLauncher(portfolioWindow,'[data-app="Chrome"]');
}
function openDocumentWindow(id){
 const windowElement=document.querySelector(`#${id}`);
 rememberLauncher(windowElement);
 windowElement.classList.remove('is-minimized');windowElement.inert=false;
 bringToFront(windowElement);
 windowElement.querySelector('[data-document-hide]').focus();
}
const chessWindow=document.querySelector('#chess-window');
const chessBoard=document.querySelector('#chess-board');
const chessStatus=document.querySelector('#chess-status');
const chessSolution=document.querySelector('#chess-solution');
const chessPosition={a8:'♖',f7:'♟',h6:'♚',g5:'♟',b4:'♙',e4:'♖',g4:'♔',f3:'♜',f2:'♜',h2:'♙'};
let chessSelected;
let chessFocusSquare='f2';
let chessDrag;
let suppressChessClick=false;
function renderChessBoard(){
 chessBoard.replaceChildren();
 const ranks=[1,2,3,4,5,6,7,8];
 const files='hgfedcba';
 for(const rank of ranks){
  for(const file of files){
   const square=document.createElement('button');square.type='button';square.className='chess-square';square.dataset.square=`${file}${rank}`;
   square.tabIndex=square.dataset.square===chessFocusSquare?0:-1;
   if((file.charCodeAt(0)+rank)%2===0)square.classList.add('is-light');
   square.innerHTML='';
   const piece=document.createElement('span');piece.className='chess-piece';piece.textContent=chessPosition[square.dataset.square]||'';square.append(piece);
   if(piece.textContent&&'♚♛♜♝♞♟'.includes(piece.textContent)){
    piece.classList.add('is-draggable');
    piece.addEventListener('pointerdown',event=>startChessDrag(event,square.dataset.square,piece));
   }
   if(rank===8){const label=document.createElement('span');label.className='square-coordinate square-file';label.textContent=file;square.append(label);}
   if(file==='h'){const label=document.createElement('span');label.className='square-coordinate square-rank';label.textContent=rank;square.append(label);}
   square.addEventListener('click',()=>{if(suppressChessClick)return;handleChessSquare(square.dataset.square);});
   chessBoard.append(square);
  }
 }
}
function startChessDrag(event,from,piece){
 if(chessSolution.hidden===false||(event.pointerType==='mouse'&&event.button!==0))return;
 const origin={x:event.clientX,y:event.clientY};
 chessDrag={from,piece,pointerId:event.pointerId,moved:false,ghost:null};
 piece.setPointerCapture(event.pointerId);
 const move=moveEvent=>{
  if(!chessDrag||moveEvent.pointerId!==chessDrag.pointerId)return;
  if(!chessDrag.moved&&Math.hypot(moveEvent.clientX-origin.x,moveEvent.clientY-origin.y)>4){
   chessDrag.moved=true;
   chessDrag.ghost=document.createElement('span');
   chessDrag.ghost.className='chess-drag-piece';chessDrag.ghost.textContent=piece.textContent;
   chessDrag.ghost.style.fontSize=getComputedStyle(piece.parentElement).fontSize;
   document.body.append(chessDrag.ghost);piece.classList.add('is-drag-source');
  }
  if(chessDrag.ghost){chessDrag.ghost.style.left=`${moveEvent.clientX}px`;chessDrag.ghost.style.top=`${moveEvent.clientY}px`;}
 };
 const finish=upEvent=>{
  if(!chessDrag||upEvent.pointerId!==chessDrag.pointerId)return;
  const moved=chessDrag.moved;
  const target=moved?document.elementFromPoint(upEvent.clientX,upEvent.clientY)?.closest('.chess-square'):null;
  chessDrag.ghost?.remove();piece.classList.remove('is-drag-source');
  piece.removeEventListener('pointermove',move);piece.removeEventListener('pointerup',finish);piece.removeEventListener('pointercancel',finish);
  chessDrag=null;
  if(!moved)return;
  suppressChessClick=true;setTimeout(()=>{suppressChessClick=false;},0);
  if(target&&target.dataset.square!==from)attemptChessMove(from,target.dataset.square);
 };
 piece.addEventListener('pointermove',move);piece.addEventListener('pointerup',finish);piece.addEventListener('pointercancel',finish);
}
function attemptChessMove(from,to){
 document.querySelector(`[data-square="${from}"]`)?.classList.remove('is-selected');
 if(from==='f7'&&to==='f5'){
  chessPosition.f7='';chessPosition.f5='♟';chessSelected=undefined;renderChessBoard();chessBoard.classList.add('is-solved');chessStatus.textContent='Solved — 47...f5# is checkmate.';chessSolution.hidden=false;return;
 }
 chessSelected=undefined;chessStatus.textContent='That move is not checkmate. Try again.';
}
function handleChessSquare(square){
 if(chessSolution.hidden===false)return;
 if(!chessSelected){
  if(chessPosition[square]&&'♚♛♜♝♞♟'.includes(chessPosition[square])){
   chessSelected=square;document.querySelector(`[data-square="${square}"]`).classList.add('is-selected');
   chessStatus.textContent='Piece selected. Choose its destination.';
  }
  return;
 }
 document.querySelector(`[data-square="${chessSelected}"]`)?.classList.remove('is-selected');
 attemptChessMove(chessSelected,square);
}
function resetChess(){
 chessPosition.f7='♟';chessPosition.f5=undefined;chessSelected=undefined;chessBoard.classList.remove('is-solved');chessSolution.hidden=true;chessStatus.textContent='Black to move. Find checkmate in one.';renderChessBoard();
}
function openChess(){rememberLauncher(chessWindow);chessWindow.classList.remove('is-minimized');chessWindow.inert=false;bringToFront(chessWindow);resetChess();chessWindow.querySelector('[data-chess-hide]').focus();}
renderChessBoard();
enableArrowNavigation(chessBoard,'.chess-square',8);
chessBoard.addEventListener('focusin',event=>{const square=event.target.closest('.chess-square');if(square)chessFocusSquare=square.dataset.square;});
const hideChess=()=>{chessWindow.classList.add('is-minimized');chessWindow.inert=true;restoreLauncher(chessWindow,'a[href="#chess"]');};
document.querySelector('[data-chess-hide]').addEventListener('click',hideChess);
document.querySelector('[data-chess-minimize]').addEventListener('click',hideChess);
document.querySelector('[data-chess-expand]').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',chessWindow.classList.toggle('is-expanded'));});
document.querySelector('[data-chess-reset]').addEventListener('click',resetChess);
document.querySelector('[data-chess-reveal]').addEventListener('click',()=>{chessSolution.hidden=false;chessStatus.textContent='Solution: 47...f5# — the pawn from f7 to f5 gives checkmate.';});
for(const windowElement of document.querySelectorAll('[data-document-window]')){
 const launcher={
  'resume-window':'a[href="#resume"]',
  'how-i-work-window':'a[href="#how-i-work"]',
  'notes-window':'a[href="#notes"]',
  'sideprojects-window':'a[href="#sideprojects"]'
 }[windowElement.id];
 const hide=()=>{windowElement.classList.add('is-minimized');windowElement.inert=true;restoreLauncher(windowElement,launcher);};
 windowElement.querySelector('[data-document-hide]').addEventListener('click',hide);
 windowElement.querySelector('[data-document-minimize]').addEventListener('click',hide);
 windowElement.querySelector('[data-document-expand]').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',windowElement.classList.toggle('is-expanded'));});
}
const notesEditor=document.querySelector('#notes-editor');
if(notesEditor){
 notesEditor.value=localStorage.getItem('portfolio-notes')||'';
 notesEditor.addEventListener('input',()=>localStorage.setItem('portfolio-notes',notesEditor.value));
}
const resetBrowserPageScroll=()=>{
 const previousScrollBehavior=browserPage.style.scrollBehavior;
 browserPage.style.scrollBehavior='auto';
 browserPage.scrollTo(0,0);
 browserPage.style.scrollBehavior=previousScrollBehavior;
};
const scrollPortfolioToWork=()=>{
 const target=browserPage.querySelector('.desktop-work-heading');if(!target)return;
 const previousScrollBehavior=browserPage.style.scrollBehavior;
 browserPage.style.scrollBehavior='auto';
 // Land with a little breathing room above the filters.
 browserPage.scrollTop=target.getBoundingClientRect().top-browserPage.getBoundingClientRect().top+browserPage.scrollTop-28;
 browserPage.style.scrollBehavior=previousScrollBehavior;
};
function getPortfolioTocSections(){
 if(browserPage.querySelector('.reading-page[data-case-mode="tldr"] .case-full-content:not([data-case-layered])'))return [];
 const explicit=[...browserPage.querySelectorAll('[data-toc-label]')].filter(section=>!section.closest('[hidden]'));
 if(explicit.length)return explicit;
 const casePages=[...browserPage.querySelectorAll('.reading-page .case-page')];
 if(casePages.length>1){
  return casePages.map((target,index)=>{
   const heading=target.querySelector('h1,h2,h3');
   const fallback=target.querySelector('.case-page-kicker,.case-page-caption');
   target.dataset.tocLabel=(heading?.textContent||fallback?.textContent||`Case section ${index+1}`).trim();
   return target;
  });
 }
 const seen=new Set();
 return [...browserPage.querySelectorAll('.reading-page h1,.reading-page h2')].filter(heading=>!heading.closest('[hidden]')).map(heading=>{
  const target=heading.closest('.case-page,.case-spread')||heading;
  if(seen.has(target))return null;
  seen.add(target);
  target.dataset.tocLabel=heading.textContent.trim();
  return target;
 }).filter(Boolean);
}
let caseModeFloat=null,caseModeFloatScrollHandler=null,caseModeFloatOutsideHandler=null;
// Keep the paragraph being read at the same place on screen when the case length changes.
function findCaseReadingAnchor(readingPage){
 const top=browserPage.getBoundingClientRect().top+80;
 return [...readingPage.querySelectorAll('.case-tldr-content article,.case-full-content :is(h2,p,li,figure,.case-callout)')]
  .find(element=>!element.closest('.case-extra')&&element.offsetParent&&element.getBoundingClientRect().bottom>top)||null;
}
function initializeCaseModes(){
 if(caseModeFloatScrollHandler)browserPage.removeEventListener('scroll',caseModeFloatScrollHandler);caseModeFloatScrollHandler=null;
 portfolioWindow.classList.remove('is-page-start','is-page-end');
 if(caseModeFloatOutsideHandler)document.removeEventListener('pointerdown',caseModeFloatOutsideHandler);caseModeFloatOutsideHandler=null;
 caseModeFloat?.remove();caseModeFloat=null;
 const readingPage=browserPage.querySelector('.reading-page');
 const inlineToggle=readingPage?.querySelector('.case-mode-toggle');
 if(!readingPage||!inlineToggle?.querySelector('button[data-case-mode]'))return;
 // A floating copy of the toggle follows the reader once the original scrolls out of view.
 caseModeFloat=document.createElement('div');
 caseModeFloat.className='case-mode-float is-hidden';
 caseModeFloat.inert=true;
 const floatModes=document.createElement('div');
 floatModes.className='case-mode-float-modes';floatModes.setAttribute('role','group');floatModes.setAttribute('aria-label','Case length');
 inlineToggle.querySelectorAll('button[data-case-mode]').forEach(button=>floatModes.append(button.cloneNode(true)));
 // Narrow screens hide the side contents, so the pill also opens a section list.
 const contentsButton=document.createElement('button');
 contentsButton.type='button';contentsButton.className='case-float-contents';
 contentsButton.setAttribute('aria-label','Contents');contentsButton.setAttribute('aria-expanded','false');contentsButton.setAttribute('aria-controls','case-float-menu');
 contentsButton.innerHTML='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M3 8h10M3 11.5h6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
 const contentsMenu=document.createElement('nav');
 contentsMenu.className='case-float-menu';contentsMenu.id='case-float-menu';contentsMenu.setAttribute('aria-label','Case contents');contentsMenu.hidden=true;
 caseModeFloat.append(contentsButton,floatModes,contentsMenu);
 (portfolioToc?.parentElement||browserPage.parentElement).append(caseModeFloat);
 const closeMenu=returnFocus=>{
  if(contentsMenu.hidden)return;
  contentsMenu.hidden=true;contentsButton.setAttribute('aria-expanded','false');
  if(returnFocus)contentsButton.focus();
 };
 const openMenu=()=>{
  contentsMenu.replaceChildren(...[...(portfolioTocItems?.querySelectorAll('.portfolio-toc-item')||[])].map(item=>{
   const link=document.createElement('a');
   link.href=item.getAttribute('href');link.dataset.tocTarget=item.dataset.tocTarget;link.textContent=item.textContent;
   if(item.classList.contains('is-active'))link.setAttribute('aria-current','location');
   return link;
  }));
  contentsMenu.hidden=false;contentsButton.setAttribute('aria-expanded','true');
  (contentsMenu.querySelector('[aria-current]')||contentsMenu.querySelector('a'))?.focus();
 };
 contentsButton.addEventListener('click',()=>contentsMenu.hidden?openMenu():closeMenu(false));
 contentsMenu.addEventListener('click',event=>{
  const link=event.target.closest('[data-toc-target]');if(!link)return;
  event.preventDefault();
  const target=document.getElementById(link.dataset.tocTarget);
  closeMenu(false);
  if(target)scrollToTocTarget(target);
 });
 caseModeFloat.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu(true);});
 caseModeFloatOutsideHandler=event=>{if(!caseModeFloat.contains(event.target))closeMenu(false);};
 document.addEventListener('pointerdown',caseModeFloatOutsideHandler);
 const setFloatVisible=visible=>{caseModeFloat.classList.toggle('is-hidden',!visible);caseModeFloat.inert=!visible;if(!visible)closeMenu(false);};
 caseModeFloatScrollHandler=()=>{
  setFloatVisible(inlineToggle.getBoundingClientRect().bottom<browserPage.getBoundingClientRect().top);
  // Dim the bottom only while reading: not over the hero at the top, and not at the end of the case.
  portfolioWindow.classList.toggle('is-page-start',browserPage.scrollTop<120);
  portfolioWindow.classList.toggle('is-page-end',browserPage.scrollTop>=browserPage.scrollHeight-browserPage.clientHeight-4);
 };
 caseModeFloatScrollHandler();
 browserPage.addEventListener('scroll',caseModeFloatScrollHandler,{passive:true});
 const controls=[...readingPage.querySelectorAll('button[data-case-mode]'),...floatModes.querySelectorAll('button')];
 // Layered cases keep one text: TL;DR hides the .case-extra parts instead of the whole full case.
 const layered=readingPage.querySelector('.case-full-content[data-case-layered]');
 const fullCase=layered?null:readingPage.querySelector('.case-full-content');
 let transitionToken=0;
 const setMode=mode=>{
  readingPage.dataset.caseMode=mode;
  readingPage.querySelector('.case-mode-toggle')?.setAttribute('data-active-mode',mode);
  controls.forEach(control=>{
   const active=control.dataset.caseMode===mode;
   control.classList.toggle('is-active',active);
   control.setAttribute('aria-pressed',String(active));
  });
  if(!fullCase)return;
  const showFull=mode==='full';
  const token=++transitionToken;
  clearTimeout(fullCase._caseHideTimer);
  fullCase.classList.remove('is-case-entering','is-case-exiting');
  if(!showFull&&fullCase.hidden)return;
  if(portfolioMotionDuration===0){fullCase.hidden=!showFull;fullCase.setAttribute('aria-hidden',String(!showFull));return;}
  if(showFull){
   fullCase.hidden=false;fullCase.setAttribute('aria-hidden','false');fullCase.classList.add('is-case-entering');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{if(token===transitionToken)fullCase.classList.remove('is-case-entering');}));
   return;
  }
  fullCase.setAttribute('aria-hidden','true');fullCase.classList.add('is-case-exiting');
  fullCase._caseHideTimer=window.setTimeout(()=>{if(token!==transitionToken)return;fullCase.hidden=true;fullCase.classList.remove('is-case-exiting');},portfolioMotionDuration);
 };
 controls.forEach(control=>control.addEventListener('click',()=>{
  const mode=control.dataset.caseMode;
  if(mode===readingPage.dataset.caseMode)return;
  const scrolledPast=inlineToggle.getBoundingClientRect().bottom<browserPage.getBoundingClientRect().top;
  const anchor=layered&&scrolledPast?findCaseReadingAnchor(readingPage):null;
  const anchorTop=anchor?.getBoundingClientRect().top;
  setMode(mode);
  const previousScrollBehavior=browserPage.style.scrollBehavior;
  browserPage.style.scrollBehavior='auto';
  if(anchor)browserPage.scrollTop+=anchor.getBoundingClientRect().top-anchorTop;
  // A separate full case disappears in TL;DR, so return to the summary instead of an empty gap.
  else if(!layered&&scrolledPast&&mode==='tldr'){
   const summary=readingPage.querySelector('.case-tldr-content')||inlineToggle;
   browserPage.scrollTop+=summary.getBoundingClientRect().top-browserPage.getBoundingClientRect().top-24;
  }
  browserPage.style.scrollBehavior=previousScrollBehavior;
  // Layered cases keep the same sections, so only the active item needs updating.
  if(layered)portfolioTocScrollHandler?.();else buildPortfolioToc();
 }));
 const initialMode=readingPage.dataset.caseMode||'full';
 readingPage.dataset.caseMode=initialMode;
 controls.forEach(control=>{const active=control.dataset.caseMode===initialMode;control.classList.toggle('is-active',active);control.setAttribute('aria-pressed',String(active));});
 if(fullCase){fullCase.hidden=initialMode!=='full';fullCase.setAttribute('aria-hidden',String(initialMode!=='full'));}
}
function initializeCaseImagePreviews(){
 const readingPage=browserPage.querySelector('.reading-page');
 if(!readingPage)return;
 readingPage.querySelectorAll('img').forEach(image=>{
  if(!image.alt.trim()||image.closest('.hsm-hero-banner,.build-core,.app-store-badge,[data-comparison],a,button'))return;
  const trigger=document.createElement('button');
  trigger.type='button';
  trigger.className='case-image-preview';
  trigger.dataset.caseImagePreview='';
  trigger.setAttribute('aria-haspopup','dialog');
  const caption=image.closest('figure')?.querySelector('figcaption')?.textContent.trim();
  trigger.setAttribute('aria-label',`Open image preview: ${caption||image.alt}`);
  image.before(trigger);
  trigger.append(image);
 });
}
const caseImageDialog=document.querySelector('#case-image-dialog');
const caseImageDialogImage=caseImageDialog?.querySelector('[data-preview-image]');
const caseImageDialogCaption=caseImageDialog?.querySelector('[data-preview-caption]');
browserPage.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-case-image-preview]');
 const image=trigger?.querySelector('img');
 if(!trigger||!image||!caseImageDialog||typeof caseImageDialog.showModal!=='function')return;
 const caption=trigger.closest('figure')?.querySelector('figcaption')?.textContent.trim()||'';
 caseImageDialogImage.src=image.currentSrc||image.src;
 caseImageDialogImage.alt=image.alt;
 caseImageDialogCaption.textContent=caption;
 caseImageDialogCaption.hidden=!caption;
 caseImageDialog.setAttribute('aria-label',`Image preview: ${image.alt}`);
 caseImageDialog.showModal();
});
caseImageDialog?.querySelector('[data-preview-close]')?.addEventListener('click',()=>caseImageDialog.close());
caseImageDialog?.addEventListener('click',event=>{
 if(event.target===caseImageDialog)caseImageDialog.close();
});
caseImageDialog?.addEventListener('close',()=>{
 caseImageDialogImage?.removeAttribute('src');
 if(caseImageDialogImage)caseImageDialogImage.alt='';
 if(caseImageDialogCaption){caseImageDialogCaption.textContent='';caseImageDialogCaption.hidden=true;}
});
function initializeShavikkiPrototype(){
 const root=browserPage.querySelector('[data-shavikki-prototype]');
 if(!root)return;
 const map=root.querySelector('[data-shavikki-map]');
 const products=root.querySelector('[data-shavikki-products]');
 const groups=root.querySelector('[data-shavikki-groups]');
 const overlays=[map,products,groups].filter(Boolean);
 const setOverlay=(overlay,open)=>{if(overlay)overlay.hidden=!open;};
 const closeOverlays=()=>overlays.forEach(overlay=>setOverlay(overlay,false));
 const title=root.querySelector('[data-shavikki-title]');
 const breadcrumb=root.querySelector('[data-shavikki-breadcrumb]');
 const statusPrimary=root.querySelector('[data-shavikki-status-primary]');
 const statusSecondary=root.querySelector('[data-shavikki-status-secondary]');
 const department=root.querySelector('[data-shavikki-department]');
 const cabinet=root.querySelector('[data-shavikki-cabinet]');
 const selectedCell={element:null,count:1};
 const updateContext=()=>{
  const departmentLabel=department?.selectedOptions[0]?.textContent||'Milk';
  const cabinetLabel=cabinet?.selectedOptions[0]?.textContent||'Unit 4';
  if(title)title.textContent=`${departmentLabel} shelf map - ${cabinetLabel}`;
  if(breadcrumb)breadcrumb.textContent=`${departmentLabel} department > ${cabinetLabel}`;
  if(statusSecondary)statusSecondary.textContent=`need checking · ${cabinetLabel}`;
 };
 root.querySelector('[data-shavikki-map-toggle]')?.addEventListener('click',event=>{
  const open=map?.hidden!==false;
  closeOverlays();setOverlay(map,open);
  event.currentTarget.setAttribute('aria-expanded',String(open));
 });
 root.querySelector('[data-shavikki-back]')?.addEventListener('click',closeOverlays);
 root.querySelector('[data-shavikki-group-manage]')?.addEventListener('click',()=>{closeOverlays();setOverlay(groups,true);});
 root.querySelector('[data-shavikki-overlay-close]')?.addEventListener('click',closeOverlays);
 root.querySelector('[data-shavikki-products-close]')?.addEventListener('click',closeOverlays);
 root.querySelector('[data-shavikki-groups-close]')?.addEventListener('click',closeOverlays);
 root.querySelectorAll('.shavikki-map-grid button').forEach(button=>button.addEventListener('click',()=>{
  root.querySelectorAll('.shavikki-map-grid button').forEach(item=>item.classList.toggle('is-active',item===button));
  if(statusSecondary)statusSecondary.textContent=`${button.textContent.trim()} department selected`;
  closeOverlays();
 }));
 root.querySelectorAll('.shavikki-cell').forEach(cell=>cell.addEventListener('click',()=>{
  selectedCell.element=cell;selectedCell.count=1;
  const label=cell.getAttribute('aria-label')||'Shelf section';
  const productTitle=root.querySelector('[data-shavikki-product-title]');
  const productList=root.querySelector('[data-shavikki-product-list]');
  const count=root.querySelector('[data-shavikki-count]');
  const productsFromCell=(cell.dataset.products||'').split('|').filter(Boolean);
  if(productTitle)productTitle.textContent=label.replace(/,\s*(ok|2-3 days left)$/i,'');
  if(productList)productList.innerHTML=productsFromCell.map(product=>`<li>${product}</li>`).join('');
  if(count)count.textContent='1';
  closeOverlays();setOverlay(products,true);
 }));
 root.querySelector('[data-shavikki-count-minus]')?.addEventListener('click',()=>{
  selectedCell.count=Math.max(1,selectedCell.count-1);
  const count=root.querySelector('[data-shavikki-count]');if(count)count.textContent=String(selectedCell.count);
 });
 root.querySelector('[data-shavikki-count-plus]')?.addEventListener('click',()=>{
  selectedCell.count=Math.min(99,selectedCell.count+1);
  const count=root.querySelector('[data-shavikki-count]');if(count)count.textContent=String(selectedCell.count);
 });
 root.querySelector('[data-shavikki-scan]')?.addEventListener('click',()=>{if(statusPrimary)statusPrimary.textContent='Scan ready';});
 root.querySelector('[data-shavikki-waste]')?.addEventListener('click',()=>{
  if(selectedCell.element){selectedCell.element.classList.remove('is-warning','is-critical');selectedCell.element.classList.add('is-ok');}
  if(statusPrimary)statusPrimary.textContent='Section updated';
  closeOverlays();
 });
 department?.addEventListener('change',updateContext);
 cabinet?.addEventListener('change',updateContext);
 updateContext();
}
// Open the contents only as wide as the gutter beside the reading column, so labels don't cover the text.
function fitPortfolioToc(){
 if(!portfolioToc||portfolioToc.hidden)return;
 const column=browserPage.querySelector('.reading-page h1,.about-page h1');
 if(!column)return;
 portfolioToc.classList.remove('is-cramped');
 // Divide by the window's current scale so opening and closing animations don't skew the measurement.
 const frame=portfolioToc.offsetParent||browserPage;
 const scale=frame.getBoundingClientRect().width/(frame.offsetWidth||1)||1;
 const room=Math.floor((column.getBoundingClientRect().left-portfolioToc.getBoundingClientRect().left)/scale-16);
 // With enough room the labels sit on the empty gutter; otherwise a card keeps them readable over the text.
 const roomy=room>=136;
 portfolioToc.classList.toggle('is-roomy',roomy);
 // No room for the rail beside the text: the floating pill's contents menu takes over.
 portfolioToc.classList.toggle('is-cramped',room<24);
 portfolioToc.style.setProperty('--toc-open',`${roomy?Math.min(200,room):178}px`);
}
if('ResizeObserver' in window)new ResizeObserver(()=>fitPortfolioToc()).observe(browserPage);
const scrollToTocTarget=target=>target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
function buildPortfolioToc(){
 if(portfolioTocScrollHandler)browserPage.removeEventListener('scroll',portfolioTocScrollHandler);
 portfolioTocItems?.replaceChildren();
 const sections=getPortfolioTocSections();
 const enabled=sections.length>1;
 browserPage.classList.toggle('has-portfolio-toc',enabled);
 const wasEnabled=portfolioToc.classList.contains('is-toc-ready');
 clearTimeout(portfolioTocExitTimer);
 if(enabled){
  portfolioToc.hidden=false;
  portfolioToc.classList.remove('is-toc-exiting');
  if(!wasEnabled&&portfolioMotionDuration>0){
   portfolioToc.classList.add('is-toc-entering');
   requestAnimationFrame(()=>requestAnimationFrame(()=>portfolioToc.classList.remove('is-toc-entering')));
  }
  portfolioToc.classList.add('is-toc-ready');
 }else{
  portfolioToc.classList.remove('is-toc-entering','is-toc-ready');
  if(!wasEnabled||portfolioMotionDuration===0){portfolioToc.hidden=true;portfolioToc.classList.remove('is-toc-exiting');}
  else{portfolioToc.classList.add('is-toc-exiting');portfolioTocExitTimer=window.setTimeout(()=>{portfolioToc.hidden=true;portfolioToc.classList.remove('is-toc-exiting');},portfolioMotionDuration);}
  return;
 }
 const links=[];
 sections.forEach((section,index)=>{
  const label=section.dataset.tocLabel;
  let id=section.id||`portfolio-toc-${index+1}`;
  section.id=id;
  const link=document.createElement('a');link.className='portfolio-toc-item';link.href=`#${id}`;link.dataset.tocTarget=id;
  const text=document.createElement('span');text.textContent=label;link.append(text);portfolioTocItems.append(link);links.push(link);
 });
 const setActive=section=>links.forEach(link=>{
  const active=link.dataset.tocTarget===section.id;link.classList.toggle('is-active',active);
  if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
 });
 const updateActive=()=>{
  const atBottom=browserPage.scrollTop>=browserPage.scrollHeight-browserPage.clientHeight-2;
  const marker=atBottom?browserPage.scrollHeight:browserPage.scrollTop+browserPage.clientHeight*.32;
  const pageTop=browserPage.getBoundingClientRect().top;
  const positions=sections.map(section=>({section,top:section.getBoundingClientRect().top-pageTop+browserPage.scrollTop}));
  const groups=[];
  positions.forEach(position=>{
   const group=groups.at(-1);
   if(group&&Math.abs(group[0].top-position.top)<1)group.push(position);else groups.push([position]);
  });
  let active=sections[0];
  groups.forEach(group=>{
   if(group[0].top>marker)return;
   if(group.length===1){active=group[0].section;return;}
   const groupHeight=Math.min(...group.map(({section})=>section.getBoundingClientRect().height));
   const groupIndex=Math.min(group.length-1,Math.floor(Math.max(0,marker-group[0].top)/(groupHeight/group.length)));
   active=group[groupIndex].section;
  });
  setActive(active);
 };
 portfolioTocScrollHandler=updateActive;
 browserPage.addEventListener('scroll',portfolioTocScrollHandler,{passive:true});
 updateActive();
 fitPortfolioToc();
}
portfolioToc?.addEventListener('click',event=>{
 const link=event.target.closest('[data-toc-target]');if(!link)return;
 const target=document.getElementById(link.dataset.tocTarget);if(!target)return;
 event.preventDefault();scrollToTocTarget(target);
});
// Remember revealed projects for this page load, including internal navigation.
const revealedProjects=new Set();
let projectRevealObserver;
function initializeProjectReveals(){
 projectRevealObserver?.disconnect();
 const cards=[...browserPage.querySelectorAll('.desktop-projects>a')];
 if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 projectRevealObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   const card=entry.target;
   revealedProjects.add(card.getAttribute('href'));
   card.classList.remove('is-reveal-pending');
   projectRevealObserver.unobserve(card);
  }
 },{root:browserPage,threshold:.08});
 for(const card of cards){
  if(revealedProjects.has(card.getAttribute('href')))continue;
  card.classList.add('project-reveal','is-reveal-pending');
  projectRevealObserver.observe(card);
 }
}
// Reading time from the case text itself, about 220 words a minute.
const readingMinutes=nodes=>{
 const words=nodes.filter(Boolean).map(node=>node.textContent).join(' ').trim().split(/\s+/).filter(Boolean).length;
 return Math.max(1,Math.round(words/220));
};
const withoutExtras=node=>{
 if(!node)return null;
 const copy=node.cloneNode(true);
 copy.querySelectorAll('.case-extra').forEach(extra=>extra.remove());
 return copy;
};
const caseReadingTimes=root=>{
 const full=root.querySelector('.case-full-content');
 const layered=full?.hasAttribute('data-case-layered');
 return {
  tldr:readingMinutes([root.querySelector('.case-hero'),root.querySelector('.case-tldr-content'),layered?withoutExtras(full):null]),
  full:readingMinutes([root.querySelector('.case-hero'),layered?root.querySelector('.case-tldr-content'):null,full])
 };
};
// Hero conductor: conducts twice when the homepage renders, and once more on hover.
function initializeConductor(){
 const conductor=browserPage.querySelector('.conductor');
 const heading=conductor?.closest('h1');
 if(!conductor||!heading)return;
 const conduct=bars=>{
  conductor.classList.remove('is-conducting');
  conductor.style.setProperty('--bars',bars);
  void conductor.offsetWidth;
  conductor.classList.add('is-conducting');
 };
 // Sequence: the hero decode settles, the conductor starts, and on its first downbeat
 // "AI agents" flickers on like a sign. Each step starts after the previous one.
 const agents=heading.querySelector('.gallery-hero-dither');
 const lightAgents=()=>{
  if(!agents?.classList.contains('is-unlit'))return;
  agents.classList.replace('is-unlit','is-lighting');
  agents.addEventListener('animationend',()=>agents.classList.remove('is-lighting'),{once:true});
 };
 const start=()=>{conduct(2);setTimeout(lightAgents,650);};
 if(heading.hasAttribute('data-decoding'))heading.addEventListener('hero-decoded',()=>setTimeout(start,250),{once:true});
 else setTimeout(start,600);
 heading.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'&&!conductor.getAnimations({subtree:true}).some(a=>a.playState==='running'))conduct(1);});
}
// About card ASCII lens: the photo stays visible; under the pointer a soft round area turns into
// ASCII on white with colours from the photo, so it seems to resolve into text where you look.
const asciiRamp=' .:-=+*%#@';
function initializeAsciiPortrait(){
 const card=browserPage.querySelector('.gallery-card-me');
 const thumb=card?.querySelector('.gallery-thumb');
 const photo=thumb?.querySelector('img');
 if(!thumb||!photo||!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
 const canvas=document.createElement('canvas');
 canvas.className='ascii-portrait';canvas.setAttribute('aria-hidden','true');
 photo.after(canvas);
 const source=new Image();
 source.src=photo.currentSrc||photo.src;
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let cells=[],colors=[],dissolve=[],cols=0,rows=0,cellW=0,cellH=0,ready=false;
 let pointer=null,radius=0,target=0,frame=0;
 const layout=()=>{
  const width=thumb.clientWidth,height=thumb.clientHeight;
  if(!width||!height||!source.naturalWidth)return false;
  const ratio=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  cols=Math.max(48,Math.round(width/4.4));cellW=width/cols;cellH=cellW/.6;rows=Math.ceil(height/cellH);
  // Sample the photo on the character grid, framed like the card's object-fit: cover at 50% 18%.
  const grid=document.createElement('canvas');grid.width=cols;grid.height=rows;
  const g=grid.getContext('2d',{willReadFrequently:true});
  g.fillStyle='#fff';g.fillRect(0,0,cols,rows);
  const scale=Math.max(width/source.naturalWidth,height/source.naturalHeight);
  const drawWidth=source.naturalWidth*scale,drawHeight=source.naturalHeight*scale;
  g.drawImage(source,(width-drawWidth)*.5/cellW,(height-drawHeight)*.18/cellH,drawWidth/cellW,drawHeight/cellH);
  const pixels=g.getImageData(0,0,cols,rows).data;
  const lights=[];
  for(let i=0;i<cols*rows;i++)lights.push((pixels[i*4]*.299+pixels[i*4+1]*.587+pixels[i*4+2]*.114)/255);
  // The white backdrop stays empty; the figure's own tones are stretched over the whole ramp,
  // so folds in the dark clothes and the face keep detail instead of one solid block.
  const figure=lights.filter(light=>light<.9).sort((a,b)=>a-b);
  const low=figure[Math.floor(figure.length*.03)]??0,high=figure[Math.floor(figure.length*.97)]??.9;
  cells=lights.map(light=>{
   if(light>=.9)return ' ';
   const density=1-Math.min(1,Math.max(0,(light-low)/((high-low)||1)));
   return asciiRamp[1+Math.min(asciiRamp.length-2,Math.floor(density*(asciiRamp.length-1)))];
  });
  // Colour from the photo: near-black tones become electric blue, lighter ones (hair, skin) keep
  // their own hue, more saturated and darkened enough to read on white.
  colors=lights.map((light,i)=>{
   if(light<.3)return '#2b39d8';
   const [r,g,b]=[pixels[i*4],pixels[i*4+1],pixels[i*4+2]].map(v=>v/255);
   const max=Math.max(r,g,b),min=Math.min(r,g,b),l=(max+min)/2,d=max-min;
   let h=0;
   if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}
   const s=d?d/(1-Math.abs(2*l-1)):0;
   return `hsl(${Math.round(h)} ${Math.round(Math.min(1,s*1.8+.25)*100)}% ${Math.round(Math.min(.46,l*.62)*100)}%)`;
  });
  // A fixed threshold per cell lets the lens edge dissolve character by character without flicker.
  dissolve=cells.map(()=>Math.random());
  return ready=true;
 };
 const draw=()=>{
  const context=canvas.getContext('2d');
  const ratio=canvas.width/thumb.clientWidth;
  context.setTransform(ratio,0,0,ratio,0,0);
  context.clearRect(0,0,thumb.clientWidth,thumb.clientHeight);
  if(!pointer||radius<1)return;
  // White disc with a wide feathered edge hides the photo inside the lens.
  const fill=context.createRadialGradient(pointer.x,pointer.y,radius*.3,pointer.x,pointer.y,radius);
  fill.addColorStop(0,'#fff');fill.addColorStop(.45,'#ffffffd9');fill.addColorStop(.75,'#ffffff66');fill.addColorStop(1,'#ffffff00');
  context.fillStyle=fill;context.beginPath();context.arc(pointer.x,pointer.y,radius,0,Math.PI*2);context.fill();
  context.font=`600 ${cellH*.92}px ui-monospace,SFMono-Regular,Menlo,monospace`;
  context.textBaseline='top';
  const c0=Math.max(0,Math.floor((pointer.x-radius)/cellW)),c1=Math.min(cols-1,Math.ceil((pointer.x+radius)/cellW));
  const r0=Math.max(0,Math.floor((pointer.y-radius)/cellH)),r1=Math.min(rows-1,Math.ceil((pointer.y+radius)/cellH));
  for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
   const char=cells[r*cols+c];
   if(char===' ')continue;
   const x=c*cellW,y=r*cellH,distance=Math.hypot(x+cellW/2-pointer.x,y+cellH/2-pointer.y);
   // Toward the edge fewer characters remain, so the lens dissolves into the photo.
   const reach=1-Math.max(0,(distance/radius-.35)/.6);
   if(reach<=0||dissolve[r*cols+c]>reach)continue;
   context.globalAlpha=Math.min(1,reach*1.6);
   context.fillStyle=colors[r*cols+c];
   context.fillText(char,x,y);
  }
  context.globalAlpha=1;
 };
 const animate=()=>{
  frame=0;
  radius+=(target-radius)*(reduceMotion?1:.22);
  draw();
  if(Math.abs(target-radius)>.5)frame=requestAnimationFrame(animate);
  else{radius=target;draw();}
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(animate);};
 const lensSize=()=>Math.min(thumb.clientWidth,thumb.clientHeight)*.42;
 card.addEventListener('pointerenter',event=>{
  if(!ready&&!layout())return;
  const box=thumb.getBoundingClientRect();
  pointer={x:event.clientX-box.left,y:event.clientY-box.top};
  target=lensSize();schedule();
 });
 card.addEventListener('pointermove',event=>{
  if(!ready)return;
  const box=thumb.getBoundingClientRect();
  pointer={x:event.clientX-box.left,y:event.clientY-box.top};
  schedule();
 });
 card.addEventListener('pointerleave',()=>{target=0;schedule();});
 source.decode().then(()=>{if('ResizeObserver' in window)new ResizeObserver(()=>{if(ready)layout();}).observe(thumb);}).catch(()=>canvas.remove());
}
// Hero decode: "Product Designer" cycles random glyphs, each boxed with its measured width
// difference (Δx) to the final letter, then settles left to right. Plays on load; a click replays it.
const scrambleGlyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*()[]{}<>/\\|!?^~_+=;:';
const scrambleColors=['#e4eca7','#b8b4ff','#ff9a5c','#f5a7e6','#f7d14a','#8fd16a','#8fb3ff'];
let scrambleFrame=0;
function initializeHeroScramble(){
 const heading=browserPage.querySelector('.gallery-hero-copy h1');
 const source=heading&&[...heading.childNodes].find(node=>node.nodeType===Node.TEXT_NODE&&node.textContent.trim());
 if(!source)return;
 const text=source.textContent.trim();
 const word=document.createElement('span');
 word.className='scramble';word.setAttribute('role','text');word.setAttribute('aria-label',text);
 const letters=[...text].map(char=>{
  const letter=document.createElement('span');
  letter.className='scramble-char';letter.setAttribute('aria-hidden','true');letter.textContent=char;
  letter.dataset.char=char;
  return letter;
 });
 word.append(...letters);
 source.replaceWith(word,document.createTextNode(' '));
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const measure=document.createElement('canvas').getContext('2d');
 const play=()=>{
  cancelAnimationFrame(scrambleFrame);
  const style=getComputedStyle(word);
  measure.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  // Lock each letter to its final width so the heading never shifts while glyphs change.
  // Start every run from clean letters, also when a replay interrupts a running decode.
  letters.forEach(letter=>{
   letter.style.width='';letter.textContent=letter.dataset.char;
   letter.classList.remove('is-scrambling','is-settled');letter.style.removeProperty('--scramble-color');delete letter.dataset.dx;
  });
  const widths=letters.map(letter=>letter.getBoundingClientRect().width);
  const start=performance.now();
  // Every letter scrambles; about a third get the measuring box, and Δx labels sit on boxed
  // letters at least two letters apart, so neighbouring labels never collide.
  let lastLabel=-3;
  const plan=letters.map((letter,index)=>{
   const space=letter.dataset.char===' ';
   const boxed=!space&&Math.random()<.35;
   const labelled=boxed&&index-lastLabel>2&&Math.random()<.7;
   if(labelled)lastLabel=index;
   letter.classList.toggle('is-boxed',boxed);
   return {letter,width:widths[index],space,settle:380+index*60+Math.random()*120,labelled,next:0};
  });
  plan.forEach(item=>{item.letter.style.width=`${item.width}px`;});
  const tick=now=>{
   const elapsed=now-start;
   let running=false;
   plan.forEach(item=>{
    const {letter}=item;
    if(item.space)return;
    if(elapsed>=item.settle){
     if(!letter.classList.contains('is-settled')){
      letter.textContent=letter.dataset.char;
      letter.classList.remove('is-scrambling');letter.classList.add('is-settled');
      letter.style.removeProperty('--scramble-color');delete letter.dataset.dx;
     }
     return;
    }
    running=true;
    // Swap glyphs about 16 times a second, which reads as computation rather than flicker.
    if(elapsed<item.next)return;
    item.next=elapsed+55+Math.random()*30;
    const glyph=scrambleGlyphs[Math.floor(Math.random()*scrambleGlyphs.length)];
    letter.textContent=glyph;
    letter.classList.add('is-scrambling');letter.classList.remove('is-settled');
    letter.style.setProperty('--scramble-color',scrambleColors[Math.floor(Math.random()*scrambleColors.length)]);
    if(item.labelled)letter.dataset.dx=`Δx=${Math.round(Math.abs(measure.measureText(glyph).width-item.width))}px`;
   });
   if(running)scrambleFrame=requestAnimationFrame(tick);
   else{
    letters.forEach(letter=>letter.style.width='');
    heading.dispatchEvent(new CustomEvent('hero-decoded'));
   }
  };
  scrambleFrame=requestAnimationFrame(tick);
 };
 // Wait for the gallery entrance to finish so the decode is seen. "AI agents" stays unlit
 // until the conductor switches it on.
 heading.dataset.decoding='';
 heading.querySelector('.gallery-hero-dither')?.classList.add('is-unlit');
 setTimeout(play,350);
 word.addEventListener('click',play);
}
// End each case with the next one, in the homepage order, so reading can continue.
function addNextCase(route){
 const page=browserPage.querySelector('.reading-page.portfolio-case');
 if(!page||page.querySelector('.case-next'))return;
 const home=document.querySelector('#page-home').content;
 const entries=[...home.querySelectorAll('.gallery-card[href^="/"],.gallery-row[href^="/"]')];
 const index=entries.findIndex(entry=>cleanPathRoutes[entry.getAttribute('href')]===route);
 if(index<0)return;
 const next=entries[(index+1)%entries.length];
 const nextRoute=cleanPathRoutes[next.getAttribute('href')];
 const template=document.querySelector(`#page-${nextRoute}`);
 const image=next.querySelector('img');
 const title=next.querySelector('h3,strong').textContent.trim();
 const description=next.querySelector('p,strong+span')?.textContent.trim()||'';
 const minutes=template?caseReadingTimes(template.content).full:0;
 const nav=document.createElement('nav');nav.className='case-next';nav.setAttribute('aria-label','Next case');
 nav.innerHTML=`<span class="case-next-label">Next case</span><a class="case-next-card" href="${next.getAttribute('href')}"><span class="case-next-thumb" style="--thumb:${next.style.getPropertyValue('--thumb')||'#ececea'}"><img src="${image.getAttribute('src')}" alt="" decoding="async" loading="lazy"></span><span class="case-next-copy"><strong></strong><span class="case-next-description"></span>${minutes?`<span class="case-next-time">${minutes} min read</span>`:''}</span><span class="case-next-arrow" aria-hidden="true">→</span></a>`;
 nav.querySelector('strong').textContent=title;
 nav.querySelector('.case-next-description').textContent=description;
 page.append(nav);
}
function addReadingTimes(route){
 for(const card of browserPage.querySelectorAll('.gallery-card[href^="/"],.gallery-row[href^="/"]')){
  const template=document.querySelector(`#page-${cleanPathRoutes[new URL(card.href).pathname]}`);
  if(!template||card.querySelector('.reading-time'))continue;
  const {full}=caseReadingTimes(template.content);
  const clock='<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const label=`<span class="reading-time">${clock}${full} min read</span>`;
  // Cards: own line under the description. List rows: under the type and year.
  if(card.classList.contains('gallery-row'))card.querySelector('.gallery-row-meta')?.insertAdjacentHTML('beforeend',label);
  else card.insertAdjacentHTML('beforeend',label);
 }
 const page=browserPage.querySelector('.portfolio-case');
 if(!page||route==='home'||route==='work')return;
 const times=caseReadingTimes(page);
 for(const button of page.querySelectorAll('[data-case-mode]')){
  const minutes=times[button.dataset.caseMode];
  if(!minutes)continue;
  button.insertAdjacentHTML('beforeend',`<span class="case-mode-time">${minutes} min</span>`);
 }
}
function addCaseBackLink(route){
 const page=browserPage.querySelector('.reading-page');
 if(!page||route==='home'||route==='work'||route==='about')return;
 const back=document.createElement('a');back.className='case-back';back.href='#work';
 back.innerHTML='<span aria-hidden="true">←</span> All work';
 page.prepend(back);
}
function initializeGalleryFilters(){
 const buttons=[...browserPage.querySelectorAll('[data-gallery-filter]')];
 const cards=[...browserPage.querySelectorAll('.gallery-card')];
 const projects=cards.filter(card=>!(card.dataset.tags||'').split(' ').includes('all'));
 const countFor=filter=>filter==='all'?projects.length:projects.filter(card=>(card.dataset.tags||'').split(' ').includes(filter)).length;
 const summary=browserPage.querySelector('.gallery-count');
 const summaryAll=summary?.textContent;
 const row=browserPage.querySelector('.gallery-filters');
 if(row&&'ResizeObserver' in window)new ResizeObserver(()=>row.classList.toggle('is-scrollable',row.scrollWidth>row.clientWidth+1)).observe(row);
 // Each filter shows how many cases it holds; the summary follows the selection.
 for(const button of buttons){const count=button.querySelector('.filter-count');if(count)count.textContent=countFor(button.dataset.galleryFilter);}
 // Filtering hides the cards that don't match; the rest slide to their new places (FLIP),
 // and cards coming back fade in. The About card is not a project, so it shows only under All work.
 const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ease='cubic-bezier(.22,1,.36,1)';
 let filterToken=0;
 const matches=(card,filter)=>{
  const tags=(card.dataset.tags||'').split(' ');
  return filter==='all'||(!tags.includes('all')&&tags.includes(filter));
 };
 const applyFilter=filter=>{
  const token=++filterToken;
  const shown=card=>!card.classList.contains('is-filtered-out');
  // The page entrance is over: stop it from replaying when a hidden card is shown again.
  cards.forEach(card=>{card.style.animation='none';card.getAnimations().forEach(animation=>animation.cancel());});
  const before=new Map(cards.filter(shown).map(card=>[card,card.getBoundingClientRect()]));
  const leaving=cards.filter(card=>shown(card)&&!matches(card,filter));
  const settle=()=>{
   if(token!==filterToken)return;
   cards.forEach(card=>card.classList.toggle('is-filtered-out',!matches(card,filter)));
   if(reduceMotion)return;
   cards.filter(shown).forEach(card=>{
    const first=before.get(card),last=card.getBoundingClientRect();
    if(!first){card.animate([{opacity:0,transform:'translateY(8px) scale(.97)'},{opacity:1,transform:'none'}],{duration:340,delay:60,easing:ease,fill:'backwards'});return;}
    const dx=first.left-last.left,dy=first.top-last.top;
    // Only real moves animate; sub-pixel rounding would read as a twitch on cards that stay put.
    if(Math.abs(dx)>1||Math.abs(dy)>1)card.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'none'}],{duration:440,easing:ease});
   });
  };
  if(reduceMotion||!leaving.length){settle();return;}
  // Cards that leave fade out quickly first, so the rest move into a clean gap.
  // A timeout backs up the fade, so the filter still applies if animations are paused (hidden tab).
  const faded=Promise.all(leaving.map(card=>card.animate([{opacity:1,transform:'none'},{opacity:0,transform:'scale(.97)'}],{duration:140,easing:'ease-in',fill:'forwards'}).finished.catch(()=>{})));
  Promise.race([faded,new Promise(resolve=>setTimeout(resolve,220))]).then(()=>{
   if(token!==filterToken)return;
   leaving.forEach(card=>card.getAnimations().forEach(animation=>animation.cancel()));
   settle();
  });
 };
 for(const button of buttons)button.addEventListener('click',()=>{
  const filter=button.dataset.galleryFilter;
  for(const other of buttons){const active=other===button;other.classList.toggle('is-active',active);other.setAttribute('aria-pressed',String(active));}
  applyFilter(filter);
  if(summary){const count=countFor(filter);summary.textContent=filter==='all'?summaryAll:`${count} ${count===1?'case':'cases'}`;}
 });
}
function renderPage(route,record=true,focus=true){
 projectRevealObserver?.disconnect();
 if(!Object.hasOwn(pageTitles,route)) route='home';
 if(record && navigation[navigationIndex]!==route){navigation=navigation.slice(0,navigationIndex+1);navigation.push(route);navigationIndex++;}
 const template=document.querySelector(`#page-${route==='work'?'home':route}`);
 browserPage.replaceChildren(template.content.cloneNode(true));
 if(route==='home'||route==='work') browserPage.firstElementChild?.parentElement.classList.add('is-home');else browserPage.classList.remove('is-home');
 // Home markup gets its own content wrapper; case templates already have one.
 if(route==='home'||route==='work'){
  const wrapper=document.createElement('div');wrapper.className='portfolio-content';wrapper.append(...browserPage.childNodes);browserPage.append(wrapper);
 }
 addCaseBackLink(route);
 initializeGalleryFilters();
 initializeAsciiPortrait();
 addReadingTimes(route);
 addNextCase(route);
 initializeHeroScramble();
 initializeConductor();
 initializeCaseVideos(browserPage);
 initializeCaseComparisons(browserPage);
 initializeCaseImagePreviews();
 initializeCaseModes();
 initializeShavikkiPrototype();
 buildPortfolioToc();
 resetBrowserPageScroll();
 requestAnimationFrame(()=>requestAnimationFrame(()=>{resetBrowserPageScroll();if(route==='work')scrollPortfolioToWork();initializeProjectReveals();}));
 showPortfolio();
 document.querySelector('#browser-location').textContent=`${location.host || 'Portfolio'} / ${pageTitles[route]}`;
 document.title=`${pageTitles[route]} — Petteri Helttula`;
 const description=pageDescriptions[route]||defaultPageDescription;
 const canonicalPath=cleanRoutePaths[route]||'/';
 const canonicalUrl=new URL(canonicalPath,location.origin).href;
 document.querySelector('meta[name="description"]')?.setAttribute('content',description);
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',canonicalUrl);
 document.querySelector('meta[property="og:url"]')?.setAttribute('content',canonicalUrl);
 document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
 document.querySelector('meta[property="og:description"]')?.setAttribute('content',description);
 document.querySelector('meta[name="twitter:title"]')?.setAttribute('content',document.title);
 document.querySelector('meta[name="twitter:description"]')?.setAttribute('content',description);
 document.querySelector('#browser-back').disabled=navigationIndex===0;
 document.querySelector('#browser-forward').disabled=navigationIndex===navigation.length-1;
 document.querySelectorAll('.portfolio-nav a').forEach(link=>{if(link.hash===`#${route}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 if(focus) browserPage.focus({preventScroll:true});
 }
 function createFolderIcon(items){
  const icon=document.createElement('span');icon.className=`folder-icon${items.length===1?' folder-icon-single':''}`;icon.setAttribute('aria-hidden','true');
  const back=document.createElement('span');back.className='folder-back';
  items.slice(0,3).forEach((name,index)=>{
   const paper=document.createElement('span');paper.className='folder-paper';paper.dataset.paperIndex=String(index+1);paper.textContent=name;back.append(paper);
  });
  const frontLeft=document.createElement('span');frontLeft.className='folder-front folder-front-left';
  const frontRight=document.createElement('span');frontRight.className='folder-front folder-front-right';
  back.append(frontLeft,frontRight);icon.append(back);return icon;
 }
 for(const shortcut of desktopShortcuts){
 const isFolder=shortcut.icon==='folder';
 const element=document.createElement('a');element.className=`desktop-shortcut${shortcut.icon==='spire'?' desktop-shortcut-spire':''}${isFolder?' desktop-shortcut-folder':''}`;element.href=shortcut.href;
 if(!shortcut.href.startsWith('#')){element.target='_blank';element.rel='noopener noreferrer';}
  let icon;
  if(isFolder)icon=createFolderIcon(shortcut.items||[]);
  else{
   icon=document.createElement(shortcut.icon==='chess'||shortcut.icon==='spire'?'img':'span');icon.className=shortcut.icon==='chess'?'chess-shortcut-icon':shortcut.icon==='spire'?'spire-shortcut-icon':'file-icon';icon.setAttribute('aria-hidden','true');
   if(shortcut.icon==='chess'){icon.src='assets/dock/chess.svg';icon.alt='';}else if(shortcut.icon==='spire'){icon.src='assets/spire-coach-mod.png';icon.alt='';}else icon.textContent=shortcut.icon;
  }
  const label=document.createElement('span');label.className='desktop-shortcut-label';label.textContent=shortcut.name;element.append(icon,label);
 document.querySelector('#desktop-shortcuts').append(element);
}
enableArrowNavigation(document.querySelector('#desktop-shortcuts'),'.desktop-shortcut',2);
for(const[name,file,destination]of desktopApps){
 const element=document.createElement(destination?'a':'div');element.className=`dock-app${destination?'':' dock-app-static'}${/-macos\.(png|svg)$/.test(file)?' is-native':''}`;element.dataset.app=name;
 if(destination)element.href=destination;
 element.setAttribute('aria-label',name==='Spotify'?'Spotify — open player':name==='Chrome'?'Chrome — open portfolio':destination?`${name} — opens in a new tab`:name);
 if(destination&&!destination.startsWith('#')){element.target='_blank';element.rel='noopener noreferrer';}
 const icon=document.createElement('img');icon.src=`assets/dock/${file}?v=3`;icon.alt='';
 const label=document.createElement('span');label.textContent=name;element.append(icon,label);document.querySelector('#desktop-dock').append(element);
}
enableArrowNavigation(document.querySelector('#desktop-dock'),'.dock-app:not(.dock-app-static)');
const desktopMenu=document.querySelector('.desktop-menubar');
const desktopFiles=document.querySelector('#desktop-shortcuts');
const desktopDock=document.querySelector('#desktop-dock');
const roomButton=document.querySelector('.room-button');
for(const windowElement of document.querySelectorAll('.portfolio-window,.document-window,.chess-window,.spotify-window'))windowElement.tabIndex=-1;
function moveBetweenDesktopRegions(direction){
 const focused=document.activeElement;
 const openWindows=getOpenWindows();
 const regions=[
  {contains:element=>desktopMenu.contains(element),target:()=>desktopMenu.querySelector('a,button')},
  {contains:element=>openWindows.some(windowElement=>windowElement===element||windowElement.contains(element)),target:()=>openWindows.at(-1)},
  {contains:element=>desktopFiles.contains(element),target:()=>desktopFiles.querySelector('[tabindex="0"]')},
  {contains:element=>desktopDock.contains(element),target:()=>desktopDock.querySelector('[tabindex="0"]')},
  {contains:element=>roomButton===element,target:()=>roomButton}
 ];
 let index=regions.findIndex(region=>region.contains(focused));
 for(let attempts=0;attempts<regions.length;attempts++){
  index=(index+direction+regions.length)%regions.length;
  const target=regions[index].target();
  if(target){target.focus({preventScroll:true});return;}
 }
}
document.addEventListener('keydown',event=>{
 if(event.key!=='F6'||document.body.classList.contains('is-workspace-open'))return;
 event.preventDefault();moveBetweenDesktopRegions(event.shiftKey?-1:1);
});
document.addEventListener('click',event=>{
 const clickedLink=event.target.closest('a');
 if(!clickedLink||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const clickedUrl=new URL(clickedLink.href,location.href);
 const cleanPath=normalizePath(clickedUrl.pathname);
 const cleanRoute=clickedUrl.origin===location.origin&&!clickedUrl.hash&&!clickedUrl.search?cleanPathRoutes[cleanPath]:undefined;
 if(cleanRoute){
  event.preventDefault();
  history.pushState(null,'',cleanRoutePaths[cleanRoute]);
  renderPage(cleanRoute);
  return;
 }
 const link=clickedLink.matches('a[href^="#"]')?clickedLink:null;if(!link)return;
 const route=link.hash.slice(1);
 if(route==='spotify'){event.preventDefault();openSpotify();return;}
 if(route==='resume'){event.preventDefault();openDocumentWindow('resume-window');return;}
 if(route==='how-i-work'){event.preventDefault();openDocumentWindow('how-i-work-window');return;}
 if(route==='sideprojects'){event.preventDefault();openDocumentWindow('sideprojects-window');return;}
 if(route==='notes'){event.preventDefault();openDocumentWindow('notes-window');return;}
 if(route==='chess'){event.preventDefault();openChess();return;}
 if(Object.hasOwn(pageTitles,route)){event.preventDefault();if(route===routeFromLocation())renderPage(route);else{history.pushState(null,'',locationForRoute(route));renderPage(route);}}
});
window.addEventListener('hashchange',()=>{const route=routeFromLocation();if(Object.hasOwn(pageTitles,route))renderPage(route);});
window.addEventListener('popstate',()=>{
 const route=routeFromLocation();
 const knownIndex=navigation.lastIndexOf(route);
 if(knownIndex>=0)navigationIndex=knownIndex;
 renderPage(route,false);
});
for(const button of document.querySelectorAll('[data-window-hide],[data-show-desktop]'))button.addEventListener('click',hidePortfolio);
for(const button of document.querySelectorAll('[data-show-portfolio]'))button.addEventListener('click',()=>{history.replaceState(null,'','#home');renderPage('home');});
document.querySelector('[data-window-expand]').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',portfolioWindow.classList.toggle('is-expanded'));});
for(const[selector,step]of [['#browser-back',-1],['#browser-forward',1]])document.querySelector(selector).addEventListener('click',()=>{const next=navigationIndex+step;if(next<0||next>=navigation.length)return;navigationIndex=next;history.replaceState(null,'',locationForRoute(navigation[next]));renderPage(navigation[next],false);});
// Pointer capture keeps dragging stable; bounds keep the titlebar reachable.
const titlebar=document.querySelector('.browser-titlebar');let drag;
titlebar.addEventListener('pointerdown',event=>{
 if(event.target.closest('button')||event.button!==0||innerWidth<=700||portfolioWindow.classList.contains('is-expanded'))return;
 const bounds=portfolioWindow.getBoundingClientRect();
 drag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:bounds.left,top:bounds.top,width:bounds.width,baseX:parseFloat(portfolioWindow.style.getPropertyValue('--window-x'))||0,baseY:parseFloat(portfolioWindow.style.getPropertyValue('--window-y'))||0};
 titlebar.setPointerCapture(event.pointerId);portfolioWindow.classList.add('is-dragging');
});
titlebar.addEventListener('pointermove',event=>{if(!drag)return;const dx=Math.min(innerWidth-drag.left-120,Math.max(120-drag.left-drag.width,event.clientX-drag.x));const dy=Math.min(innerHeight-160-drag.top,Math.max(32-drag.top,event.clientY-drag.y));portfolioWindow.style.setProperty('--window-x',`${drag.baseX+dx}px`);portfolioWindow.style.setProperty('--window-y',`${drag.baseY+dy}px`);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])titlebar.addEventListener(event,()=>{drag=null;portfolioWindow.classList.remove('is-dragging');});
window.addEventListener('resize',()=>{portfolioWindow.style.removeProperty('--window-x');portfolioWindow.style.removeProperty('--window-y');});
for(const windowElement of document.querySelectorAll('[data-document-window]')){
 const bar=windowElement.querySelector('header');let windowDrag;
 bar.addEventListener('pointerdown',event=>{
  if(event.target.closest('button')||event.button!==0)return;
  const bounds=windowElement.getBoundingClientRect();
  windowDrag={pointer:event.pointerId,x:event.clientX,y:event.clientY,left:bounds.left,top:bounds.top,width:bounds.width,height:bounds.height,baseX:parseFloat(windowElement.style.getPropertyValue('--document-x'))||0,baseY:parseFloat(windowElement.style.getPropertyValue('--document-y'))||0};
  bar.setPointerCapture(event.pointerId);windowElement.classList.add('is-dragging');
 });
 bar.addEventListener('pointermove',event=>{
  if(!windowDrag)return;
  const dx=Math.min(innerWidth-windowDrag.left-120,Math.max(120-windowDrag.left,event.clientX-windowDrag.x));
  const dy=Math.min(innerHeight-windowDrag.top-100,Math.max(32-windowDrag.top,event.clientY-windowDrag.y));
  windowElement.style.setProperty('--document-x',`${windowDrag.baseX+dx}px`);windowElement.style.setProperty('--document-y',`${windowDrag.baseY+dy}px`);
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])bar.addEventListener(event,()=>{windowDrag=null;windowElement.classList.remove('is-dragging');});
}
{
 const bar=chessWindow.querySelector('header');let windowDrag;
 bar.addEventListener('pointerdown',event=>{
  if(event.target.closest('button')||event.button!==0)return;
  const bounds=chessWindow.getBoundingClientRect();windowDrag={x:event.clientX,y:event.clientY,left:bounds.left,top:bounds.top,baseX:parseFloat(chessWindow.style.getPropertyValue('--chess-x'))||0,baseY:parseFloat(chessWindow.style.getPropertyValue('--chess-y'))||0};bar.setPointerCapture(event.pointerId);chessWindow.classList.add('is-dragging');
 });
 bar.addEventListener('pointermove',event=>{if(!windowDrag)return;const dx=Math.min(innerWidth-windowDrag.left-120,Math.max(120-windowDrag.left,event.clientX-windowDrag.x));const dy=Math.min(innerHeight-windowDrag.top-100,Math.max(32-windowDrag.top,event.clientY-windowDrag.y));chessWindow.style.setProperty('--chess-x',`${windowDrag.baseX+dx}px`);chessWindow.style.setProperty('--chess-y',`${windowDrag.baseY+dy}px`);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])bar.addEventListener(event,()=>{windowDrag=null;chessWindow.classList.remove('is-dragging');});
}
const mixer=document.querySelector('#sound-mixer');const mixerToggle=document.querySelector('[data-mixer-toggle]');
mixerToggle.addEventListener('click',()=>{mixer.hidden=!mixer.hidden;mixerToggle.setAttribute('aria-expanded',!mixer.hidden);});
document.addEventListener('pointerdown',event=>{if(!mixer.hidden&&!mixer.contains(event.target)&&!mixerToggle.contains(event.target)){mixer.hidden=true;mixerToggle.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(caseImageDialog?.open)return;
 if(!mixer.hidden){mixer.hidden=true;mixerToggle.setAttribute('aria-expanded','false');mixerToggle.focus();return;}
 if(document.body.classList.contains('is-workspace-open'))return;
 const openWindows=getOpenWindows();
 const closeButton=openWindows.at(-1)?.querySelector('[data-window-hide],[data-document-hide],[data-chess-hide],#spotify-hide');
 if(closeButton){event.preventDefault();closeButton.click();}
});
function updateClock(){const date=new Date();const options={timeZone:'Europe/Helsinki'};document.querySelector('#desktop-clock').textContent=date.toLocaleString('en-GB',{...options,weekday:'short',hour:'2-digit',minute:'2-digit'});document.querySelector('#widget-weekday').textContent=date.toLocaleDateString('en-GB',{...options,weekday:'long'});document.querySelector('#widget-day').textContent=date.toLocaleDateString('en-GB',{...options,day:'numeric'});document.querySelector('#widget-month').textContent=date.toLocaleDateString('en-GB',{...options,month:'long'});document.querySelector('#widget-clock').textContent=date.toLocaleTimeString('en-GB',{...options,hour:'2-digit',minute:'2-digit'});}
updateClock();setInterval(updateClock,60000);
renderPage(routeFromLocation(),true,false);
window.addEventListener('load',()=>{
 if((location.hash.slice(1)||'home')==='home')resetBrowserPageScroll();
},{once:true});
// These channels belong to this page only. No operating-system sound is changed.
let soundContext;
let musicGraph;
let inAudioRoom=false;
let spotifyController;
let spotifyScript;
let spotifyLoading=false;
let soundEnabled = false;
let musicUrl;
const music = new Audio();
music.loop = true; music.volume = .4;
const clickSample = new Audio('assets/audio/universfield-mouse-click-351398.mp3');
clickSample.preload = 'auto';
const soundButton = document.querySelector('#sound-enable');
const soundStatus = document.querySelector('#sound-status');
const musicButton = document.querySelector('#music-play');
const setSound = enabled => {
  soundEnabled = enabled;
  music.muted = !enabled;
  if(!enabled) spotifyController?.pause();
  soundButton.setAttribute('aria-pressed', enabled);
  soundButton.textContent = enabled ? 'Mute all' : 'Enable sound';
  soundStatus.textContent = enabled ? 'Sound on. Applies to this page only.' : 'Sound is off. Always your choice.';
};
soundButton.addEventListener('click', () => setSound(!soundEnabled));
for (const channel of ['click', 'music']) {
  document.querySelector(`#${channel}-volume`).addEventListener('input', event => {
    document.querySelector(`#${channel}-value`).value = `${event.target.value}%`;
    if (channel === 'music') music.volume = Number(event.target.value) / 100;
  });
}
function deskSound(channel) {
  if (!soundEnabled) return;
  const volume = Number(document.querySelector(`#${channel}-volume`).value) / 100;
  if (!volume) return;
  try {
    soundContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (soundContext.state === 'suspended') void soundContext.resume();
    if(channel === 'click'){
      const sampleAudio = clickSample.cloneNode();
      sampleAudio.volume = Math.min(1, volume * .72);
      sampleAudio.play().catch(()=>{});
      return;
    }
    const oscillator = soundContext.createOscillator();
    const gain = soundContext.createGain();
    const now = soundContext.currentTime;
    oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(channel === 'click' ? 600 : 340, now);
    oscillator.frequency.exponentialRampToValueAtTime(110, now + .025);
    gain.gain.setValueAtTime(volume * .12, now); gain.gain.exponentialRampToValueAtTime(.001, now + .035);
    oscillator.connect(gain); gain.connect(soundContext.destination);
    oscillator.start(now); oscillator.stop(now + .04);
  } catch { setSound(false); soundStatus.textContent = 'Audio is unavailable in this browser.'; }
}
document.addEventListener('click', event => { if (event.target.closest('a,button,input') && event.target !== soundButton) deskSound('click'); });
document.querySelector('#music-file').addEventListener('change', event => {
  const file = event.target.files[0]; if (!file) return;
  music.pause();
  if (musicUrl) URL.revokeObjectURL(musicUrl);
  musicUrl = URL.createObjectURL(file); music.src = musicUrl;
  document.querySelector('#music-name').textContent = file.name;
  musicButton.disabled = false;
  soundStatus.textContent = 'Track ready. Press play to listen.';
});
musicButton.addEventListener('click', async () => {
  if (!music.paused) { music.pause(); return; }
  setSound(true);
  try {
    await ensureMusicGraph();
    spotifyController?.pause();
    await music.play();
  } catch { soundStatus.textContent = 'This audio file could not be played. Try another file.'; }
});
for (const eventName of ['play', 'pause', 'ended']) music.addEventListener(eventName, () => {
  musicButton.textContent = music.paused ? '▶' : 'Ⅱ';
  musicButton.setAttribute('aria-label', music.paused ? 'Play music' : 'Pause music');
});
music.addEventListener('error', () => { soundStatus.textContent = 'This audio file could not be played. Try another file.'; });
setSound(false);


// A single persistent Spotify Embed: never recreated by portfolio navigation or room changes.
const spotifyWindow=document.querySelector('#spotify-window');
const spotifyDock=document.querySelector('[data-app="Spotify"]');
const spotifyLoadingText=document.querySelector('#spotify-loading');
for(const windowElement of [portfolioWindow,...document.querySelectorAll('[data-document-window]'),chessWindow,spotifyWindow]){
 windowElement.addEventListener('pointerdown',()=>bringToFront(windowElement));
 windowElement.addEventListener('focusin',()=>bringToFront(windowElement));
}
let spotifyTimeout;
function spotifyFailure(){
 clearTimeout(spotifyTimeout);
 spotifyLoading=false;
 spotifyLoadingText.hidden=false;
 spotifyLoadingText.textContent='Spotify could not load. Check your connection or content blocker, then retry.';
 document.querySelector('#spotify-retry').hidden=false;
}
function createSpotify(iframeApi){
 iframeApi.createController(document.querySelector('#spotify-embed'),{
  uri:'spotify:playlist:6IuMsRmYaJu1eAThxQkDyU',width:'100%',height:352,
 },controller=>{
  spotifyController=controller;
  controller.addListener('ready',()=>{
   clearTimeout(spotifyTimeout);spotifyLoading=false;spotifyLoadingText.hidden=true;
   document.querySelector('#spotify-retry').hidden=true;
   document.querySelector('#spotify-pause').disabled=false;
   const iframe=spotifyWindow.querySelector('iframe');if(iframe)iframe.title='Petteri’s Spotify playlist';
  });
  controller.addListener('playback_started',()=>{music.pause();setSound(true);});
  controller.addListener('playback_update',({data})=>{
   const state={isPlaying:!data.isPaused,playingURI:data.playingURI,title:'Petteri’s rotation',position:data.position||0,duration:data.duration||0};
   window.portfolioPlaybackState=state;
   window.dispatchEvent(new CustomEvent('portfolio:playback',{detail:state}));
   spotifyDock.classList.toggle('is-running',state.isPlaying);
  });
 });
}
window.onSpotifyIframeApiReady=api=>{window.portfolioSpotifyApi=api;createSpotify(api);};
function loadSpotify(){
 if(spotifyController||spotifyLoading)return;
 spotifyLoading=true;spotifyLoadingText.hidden=false;spotifyLoadingText.textContent='Loading Spotify…';
 document.querySelector('#spotify-retry').hidden=true;
 clearTimeout(spotifyTimeout);spotifyTimeout=setTimeout(spotifyFailure,15000);
 if(window.portfolioSpotifyApi){createSpotify(window.portfolioSpotifyApi);return;}
 spotifyScript?.remove();spotifyScript=document.createElement('script');
 spotifyScript.src='https://open.spotify.com/embed/iframe-api/v1';spotifyScript.onerror=spotifyFailure;
 document.head.append(spotifyScript);
}
function openSpotify(){
 rememberLauncher(spotifyWindow);
 spotifyWindow.classList.remove('is-minimized');spotifyWindow.inert=false;bringToFront(spotifyWindow);
 document.querySelector('#spotify-hide').focus();loadSpotify();
}
document.querySelector('#spotify-hide').addEventListener('click',()=>{
 spotifyWindow.classList.add('is-minimized');spotifyWindow.inert=true;
 if(inAudioRoom)document.querySelector('.workspace-exit').focus();else restoreLauncher(spotifyWindow,'[data-app="Spotify"]');
});
document.querySelector('#spotify-pause').addEventListener('click',()=>spotifyController?.pause());
document.querySelector('#spotify-retry').addEventListener('click',()=>{
 clearTimeout(spotifyTimeout);spotifyController?.destroy();spotifyController=undefined;
 if(!document.querySelector('#spotify-embed')){const host=document.createElement('div');host.id='spotify-embed';document.querySelector('#spotify-host').append(host);}
 spotifyLoading=false;loadSpotify();
});
window.addEventListener('portfolio:toggle-playback',()=>spotifyController?.togglePlay());

// Only page-owned audio can enter Web Audio. Spotify's iframe remains untouched.
async function ensureMusicGraph(){
 soundContext ||= new (window.AudioContext||window.webkitAudioContext)();
 await soundContext.resume();
 if(musicGraph)return;
 const source=soundContext.createMediaElementSource(music);
 const dry=soundContext.createGain(),wet=soundContext.createGain();
 const filter=soundContext.createBiquadFilter();filter.type='lowpass';filter.Q.value=.5;
 const panner=soundContext.createPanner();panner.panningModel='HRTF';panner.distanceModel='inverse';
 panner.refDistance=1.8;panner.maxDistance=15;panner.rolloffFactor=1;
 source.connect(dry).connect(soundContext.destination);
 source.connect(filter).connect(panner).connect(wet).connect(soundContext.destination);
 musicGraph={source,dry,wet,filter,panner};
 dry.gain.value=inAudioRoom?0:1;wet.gain.value=inAudioRoom?.32:0;
 filter.frequency.value=2600;
}
const smoothAudio=(parameter,value)=>parameter.setTargetAtTime(value,soundContext.currentTime,.12);
window.portfolioAudio={
 setRoom(active){
  inAudioRoom=active;
  if(musicGraph){smoothAudio(musicGraph.dry.gain,active?0:1);smoothAudio(musicGraph.wet.gain,active?.32:0);}
 },
 updateRoom(position,forward,up,headphones){
  if(!musicGraph||!inAudioRoom)return;
  const listener=soundContext.listener;
  if(listener.positionX){
   for(const[axis,key]of [['X','x'],['Y','y'],['Z','z']]){
    smoothAudio(listener['position'+axis],position[key]);
    smoothAudio(listener['forward'+axis],forward[key]);
    smoothAudio(listener['up'+axis],up[key]);
    smoothAudio(musicGraph.panner['position'+axis],headphones[key]);
   }
  }else{
   listener.setPosition(position.x,position.y,position.z);
   listener.setOrientation(forward.x,forward.y,forward.z,up.x,up.y,up.z);
   musicGraph.panner.setPosition(headphones.x,headphones.y,headphones.z);
  }
  const dx=headphones.x-position.x,dy=headphones.y-position.y,dz=headphones.z-position.z;
  const facing=(dx*forward.x+dy*forward.y+dz*forward.z)/Math.max(.001,Math.hypot(dx,dy,dz));
  smoothAudio(musicGraph.filter.frequency,1500+1800*Math.max(0,facing));
 },
};
