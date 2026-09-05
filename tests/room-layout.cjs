const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/petsk/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.DESKTOP_URL||'http://127.0.0.1:8091/');
await page.evaluate(async()=>{await loadThree();const Scene=THREE.Scene;THREE.Scene=class extends Scene{constructor(){super();window.testScene=this;}};});
await page.locator('.room-button').click();await page.locator('.workspace-view.is-ready').waitFor({timeout:60000});await page.waitForTimeout(1600);
const bounds=await page.evaluate(()=>{const scene=window.testScene;const box=name=>{const b=new THREE.Box3().setFromObject(scene.getObjectByName(name));return {min:b.min.toArray(),max:b.max.toArray()};};const dog=scene.getObjectByName('dalmatian-puppy');let volumes=0,photo=false;dog.traverse(o=>{if(o.geometry?.type==='SphereGeometry')volumes++;if(o.name==='puppy-reference-relief')photo=true;});return{sofa:box('room-sofa'),desk:box('room-desk-surface'),wall:box('room-front-wall'),volumes,photo,attached:dog.parent.name};});
assert.ok(bounds.sofa.min[2]>=bounds.desk.max[2],'Sofa is beside the viewer, not behind the desk');assert.ok(bounds.sofa.min[0]>bounds.desk.max[0],'Sofa clears desk edge');assert.ok(bounds.desk.min[2]-bounds.wall.max[2]<.25,'Desk stays near front wall');assert.ok(bounds.volumes>=15);assert.equal(bounds.photo,false);assert.equal(bounds.attached,'room-sofa');
const out=process.env.QA_OUTPUT||path.join(os.tmpdir(),'petteri-desktop-qa');fs.mkdirSync(out,{recursive:true});
await page.mouse.move(720,450);await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'room-front-v3.png')});
await page.mouse.move(1390,780);await page.waitForTimeout(1500);await page.screenshot({path:path.join(out,'room-sofa-v3.png')});
await page.getByRole('button',{name:'Back to screen',exact:false}).click();await page.waitForTimeout(550);assert.equal(await page.locator('.desktop').evaluate(el=>el.inert),false);
assert.deepEqual(errors,[]);console.log('PASS: sofa/viewer layout, desk/wall gap, 3D puppy volumes, sofa attachment, room return, no JS errors. '+JSON.stringify(bounds));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


