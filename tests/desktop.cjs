const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/petsk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const output=process.env.QA_OUTPUT||path.join(os.tmpdir(),'petteri-desktop-qa');fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1896,height:940}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1'))errors.push(`${r.status()} ${r.url()}`);});
 const url=process.env.DESKTOP_URL||'http://127.0.0.1:8091/';
 await page.goto(url);await page.waitForTimeout(600);
 assert.match(await page.title(),/Petteri Helttula/);
 assert.equal(await page.locator('.folder-section,.desk-scene').count(),0);
 assert.equal(await page.locator('.desktop-projects>a').count(),4);
 assert.equal(await page.locator('.desktop-dock [data-app]').count(),8);
 assert.equal(await page.locator('#sound-mixer').isVisible(),false);
 async function bounds(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth&&document.documentElement.scrollHeight===innerHeight),true);assert.equal(await page.locator('.desktop-dock').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth}),true);}
 await bounds();await page.screenshot({path:path.join(output,'desktop-v2.png')});
 await page.locator('.desktop-projects a[href="#brio"]').click();await page.getByText('Core product stack',{exact:true}).waitFor();
 await page.locator('#browser-back').click();await page.locator('.desktop-projects').waitFor();
 await page.locator('#browser-forward').click();await page.getByText('Core product stack',{exact:true}).waitFor();
 for(const [route,text]of [['peluutin','A real sideline problem'],['shavikki','Reflection'],['tahti','Risks'],['about','More than one title.']]){await page.goto(url+'#'+route);await page.getByText(text,{exact:true}).first().waitFor();}
 await page.goto(url+'#home');await page.waitForTimeout(400);
 await page.getByRole('button',{name:'Minimize portfolio',exact:true}).click();assert.equal(await page.locator('#portfolio-window').evaluate(el=>el.inert),true);
 await page.waitForTimeout(450);await page.screenshot({path:path.join(output,'desktop-clear-v2.png')});
 await page.getByRole('link',{name:'Chrome — open portfolio',exact:true}).click();assert.equal(await page.locator('#portfolio-window').evaluate(el=>el.inert),false);
 await page.getByRole('button',{name:'Maximize portfolio',exact:true}).click();assert.equal(await page.locator('#portfolio-window').evaluate(el=>el.classList.contains('is-expanded')),true);
 await page.getByRole('button',{name:'Maximize portfolio',exact:true}).click();
 const title=await page.locator('.browser-titlebar').boundingBox();await page.mouse.move(title.x+title.width-50,title.y+15);await page.mouse.down();await page.mouse.move(title.x+title.width-20,title.y+35);await page.mouse.up();assert.match(await page.locator('#portfolio-window').getAttribute('style'),/--window-x/);
 await page.getByRole('button',{name:'Sound mixer',exact:true}).click();await page.getByRole('button',{name:'Enable sound',exact:true}).click();await page.locator('#click-volume').fill('62');assert.equal(await page.locator('#click-value').textContent(),'62%');
 const wav=Buffer.alloc(16044);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);wav.writeUInt32LE(16000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(16000,40);
 await page.locator('#music-file').setInputFiles({name:'test.wav',mimeType:'audio/wav',buffer:wav});await page.getByRole('button',{name:'Play music',exact:true}).click();await page.getByRole('button',{name:'Pause music',exact:true}).waitFor();await page.locator('#music-volume').fill('23');assert.equal(await page.evaluate(()=>music.volume),.23);await page.getByRole('button',{name:'Mute all',exact:true}).click();assert.equal(await page.evaluate(()=>music.muted),true);await page.keyboard.press('Escape');
 await page.locator('.room-button').click();await page.locator('.workspace-view.is-ready').waitFor({timeout:60000});await page.waitForTimeout(1500);await page.getByRole('button',{name:'Back to screen',exact:false}).click();await page.waitForTimeout(550);assert.equal(await page.locator('.desktop').evaluate(el=>el.inert),false);
 for(const [width,height]of [[1366,768],[390,844]]){await page.setViewportSize({width,height});await page.goto(url+'#home');await page.waitForTimeout(500);await bounds();await page.screenshot({path:path.join(output,width===390?'mobile-v2.png':'laptop-v2.png')});}
 await page.locator('.desktop-projects a[href="#brio"]').click();await page.getByText('Core product stack',{exact:true}).waitFor();await page.locator('#browser-back').click();
 await page.getByRole('button',{name:'Show desktop',exact:true}).last().click();await page.locator('.room-button').click();await page.locator('.workspace-view.is-ready').waitFor({timeout:60000});await page.keyboard.press('Escape');await page.waitForTimeout(550);assert.equal(await page.locator('.desktop').evaluate(el=>el.inert),false);
 // Exercise the real local-audio graph independently of Spotify's protected stream.
 await page.evaluate(async()=>{await ensureMusicGraph();window.portfolioAudio.setRoom(true);window.portfolioAudio.updateRoom({x:0,y:1,z:3},{x:0,y:0,z:-1},{x:0,y:1,z:0},{x:2,y:.2,z:1});});
 await page.waitForTimeout(700);
 const right=await page.evaluate(()=>({dry:musicGraph.dry.gain.value,wet:musicGraph.wet.gain.value,x:musicGraph.panner.positionX.value,forward: soundContext.listener.forwardZ.value,filter:musicGraph.filter.frequency.value,model:musicGraph.panner.panningModel}));
 assert.ok(right.dry<.01&&right.wet>.3);assert.ok(right.x>1.9);assert.equal(right.model,'HRTF');
 await page.evaluate(()=>window.portfolioAudio.updateRoom({x:0,y:1,z:3},{x:-1,y:0,z:0},{x:0,y:1,z:0},{x:2,y:.2,z:1}));await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>musicGraph.filter.frequency.value)<right.filter-300,'Sound behind the listener is muffled');
 assert.ok(await page.evaluate(()=>soundContext.listener.forwardX.value)<-.95,'Listener follows camera orientation');
 await page.evaluate(()=>window.portfolioAudio.setRoom(false));await page.waitForTimeout(700);
 assert.ok(await page.evaluate(()=>musicGraph.dry.gain.value)>.99);assert.ok(await page.evaluate(()=>musicGraph.wet.gain.value)<.01);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.desktop').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 await page.goto(url+'desk-experiment.html');await page.waitForURL(url+'*');assert.match(await page.title(),/Petteri Helttula/);
 assert.deepEqual(errors,[]);console.log('PASS: root + old URL, 4 cases + about, browser back/forward, minimize/restore/maximize/drag, all dock items within viewport, sound + music, room round trips, desktop/laptop/mobile, reduced motion, no JS or local HTTP errors.');console.log('Screenshots: '+output);await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
