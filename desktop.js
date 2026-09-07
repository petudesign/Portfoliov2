// Edit these lists to add shortcuts or Dock applications.
const desktopShortcuts = [
 {name:'My work',href:'#work',icon:'folder'}, {name:'About me',href:'#about',icon:'folder'},
 {name:'Resume',href:'#resume',icon:'CV'},
 {name:'How I work.md',href:'#how-i-work',icon:'MD'},
 {name:'Notes.txt',href:'#notes',icon:'TXT'},
 {name:'Chess',href:'#chess',icon:'chess'},
];
const desktopApps = [
 ['Spotify','spotify.svg','#spotify'],
 ['Chrome','chrome.svg','#home'], ['Figma','figma.svg','https://www.figma.com/'],
 ['Codex','codex.svg','https://chatgpt.com/codex'], ['Paper','paper.svg','https://paper.design/'],
 ['Obsidian','obsidian.svg','https://obsidian.md/'], ['LM Lab','lmstudio.svg','https://lmstudio.ai/'],
 ['VS Code','vscode.svg','https://vscode.dev/'],
];
const portfolioWindow=document.querySelector('#portfolio-window');
const browserPage=document.querySelector('#browser-page');
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
const pageTitles={home:'Home',work:'Selected work',about:'About me',brio:'Brio',peluutin:'Peluutin',shavikki:'S-Hävikki',tahti:'Tahti'};
let navigation=['home'];let navigationIndex=0;
function showPortfolio(){
 rememberLauncher(portfolioWindow);
 portfolioWindow.classList.remove('is-minimized');portfolioWindow.inert=false;
 bringToFront(portfolioWindow);
 document.querySelector('[data-app="Chrome"]').classList.add('is-running');
}
function hidePortfolio(){
 portfolioWindow.classList.add('is-minimized');portfolioWindow.inert=true;
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
  'notes-window':'a[href="#notes"]'
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
const resetBrowserPageScroll=()=>browserPage.scrollTo({top:0,left:0,behavior:'instant'});
function renderPage(route,record=true,focus=true){
 if(!Object.hasOwn(pageTitles,route)) route='home';
 if(record && navigation[navigationIndex]!==route){navigation=navigation.slice(0,navigationIndex+1);navigation.push(route);navigationIndex++;}
 const template=document.querySelector(`#page-${route==='work'?'home':route}`);
 browserPage.replaceChildren(template.content.cloneNode(true));
 if(route==='home'||route==='work') browserPage.firstElementChild?.parentElement.classList.add('is-home');else browserPage.classList.remove('is-home');
 // Home markup gets its own content wrapper; case templates already have one.
 if(route==='home'||route==='work'){
  const wrapper=document.createElement('div');wrapper.className='portfolio-content';wrapper.append(...browserPage.childNodes);browserPage.append(wrapper);
 }
 resetBrowserPageScroll();
 if(route==='home')requestAnimationFrame(()=>requestAnimationFrame(resetBrowserPageScroll));
 showPortfolio();
 if(route==='work') browserPage.querySelector('.desktop-work-heading').scrollIntoView({block:'start',behavior:'instant'});
 document.querySelector('#browser-location').textContent=`${location.host || 'Portfolio'} / ${pageTitles[route]}`;
 document.title=`${pageTitles[route]} — Petteri Helttula`;
 document.querySelector('#browser-back').disabled=navigationIndex===0;
 document.querySelector('#browser-forward').disabled=navigationIndex===navigation.length-1;
 document.querySelectorAll('.portfolio-nav a').forEach(link=>{if(link.hash===`#${route}`)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
 if(focus) browserPage.focus({preventScroll:true});
}
for(const shortcut of desktopShortcuts){
 const element=document.createElement('a');element.className='desktop-shortcut';element.href=shortcut.href;
 if(!shortcut.href.startsWith('#')){element.target='_blank';element.rel='noopener noreferrer';}
 const icon=document.createElement(shortcut.icon==='chess'?'img':'span');icon.className=shortcut.icon==='folder'?'folder-icon':shortcut.icon==='chess'?'chess-shortcut-icon':'file-icon';icon.setAttribute('aria-hidden','true');if(shortcut.icon==='chess'){icon.src='assets/dock/chess.svg';icon.alt='';}else if(shortcut.icon!=='folder')icon.textContent=shortcut.icon;
 const label=document.createElement('span');label.textContent=shortcut.name;element.append(icon,label);document.querySelector('#desktop-shortcuts').append(element);
}
enableArrowNavigation(document.querySelector('#desktop-shortcuts'),'.desktop-shortcut',2);
for(const[name,file,destination]of desktopApps){
 const element=document.createElement('a');element.className='dock-app';element.dataset.app=name;element.href=destination;
 element.setAttribute('aria-label',name==='Spotify'?'Spotify — open player':name==='Chrome'?'Chrome — open portfolio':`${name} — opens in a new tab`);
 if(!destination.startsWith('#')){element.target='_blank';element.rel='noopener noreferrer';}
 const icon=document.createElement('img');icon.src=`assets/dock/${file}`;icon.alt='';
 const label=document.createElement('span');label.textContent=name;element.append(icon,label);document.querySelector('#desktop-dock').append(element);
}
const divider=document.createElement('span');divider.className='dock-divider';divider.setAttribute('aria-hidden','true');
const desktopButton=document.createElement('button');desktopButton.type='button';desktopButton.className='dock-app dock-desktop';desktopButton.setAttribute('aria-label','Show desktop');desktopButton.textContent='▱';desktopButton.addEventListener('click',()=>portfolioWindow.inert?showPortfolio():hidePortfolio());document.querySelector('#desktop-dock').append(divider,desktopButton);
enableArrowNavigation(document.querySelector('#desktop-dock'),'.dock-app');
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
 const link=event.target.closest('a[href^="#"]');if(!link)return;
 const route=link.hash.slice(1);
 if(route==='spotify'){event.preventDefault();openSpotify();return;}
 if(route==='resume'){event.preventDefault();openDocumentWindow('resume-window');return;}
 if(route==='how-i-work'){event.preventDefault();openDocumentWindow('how-i-work-window');return;}
 if(route==='notes'){event.preventDefault();openDocumentWindow('notes-window');return;}
 if(route==='chess'){event.preventDefault();openChess();return;}
 if(Object.hasOwn(pageTitles,route)){event.preventDefault();if(location.hash===link.hash)renderPage(route);else location.hash=route;}
});
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(Object.hasOwn(pageTitles,route))renderPage(route);});
for(const button of document.querySelectorAll('[data-window-hide],[data-show-desktop]'))button.addEventListener('click',hidePortfolio);
for(const button of document.querySelectorAll('[data-show-portfolio]'))button.addEventListener('click',()=>{history.replaceState(null,'','#home');renderPage('home');});
document.querySelector('[data-window-expand]').addEventListener('click',event=>{event.currentTarget.setAttribute('aria-pressed',portfolioWindow.classList.toggle('is-expanded'));});
for(const[selector,step]of [['#browser-back',-1],['#browser-forward',1]])document.querySelector(selector).addEventListener('click',()=>{const next=navigationIndex+step;if(next<0||next>=navigation.length)return;navigationIndex=next;history.replaceState(null,'',`#${navigation[next]}`);renderPage(navigation[next],false);});
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
 if(!mixer.hidden){mixer.hidden=true;mixerToggle.setAttribute('aria-expanded','false');mixerToggle.focus();return;}
 if(document.body.classList.contains('is-workspace-open'))return;
 const openWindows=getOpenWindows();
 const closeButton=openWindows.at(-1)?.querySelector('[data-window-hide],[data-document-hide],[data-chess-hide],#spotify-hide');
 if(closeButton){event.preventDefault();closeButton.click();}
});
function updateClock(){const date=new Date();const options={timeZone:'Europe/Helsinki'};document.querySelector('#desktop-clock').textContent=date.toLocaleString('en-GB',{...options,weekday:'short',hour:'2-digit',minute:'2-digit'});document.querySelector('#widget-weekday').textContent=date.toLocaleDateString('en-GB',{...options,weekday:'long'});document.querySelector('#widget-day').textContent=date.toLocaleDateString('en-GB',{...options,day:'numeric'});document.querySelector('#widget-month').textContent=date.toLocaleDateString('en-GB',{...options,month:'long'});document.querySelector('#widget-clock').textContent=date.toLocaleTimeString('en-GB',{...options,hour:'2-digit',minute:'2-digit'});}
updateClock();setInterval(updateClock,60000);
renderPage(location.hash.slice(1)||'home',true,false);
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
