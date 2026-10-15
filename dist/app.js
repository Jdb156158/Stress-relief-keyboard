import * as THREE from 'three';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const $ = (id) => document.getElementById(id);
const themes = [
  {id:'sakura',name:'樱花奶油',sub:'像云朵一样，柔软一点。',type:'奶油 · 柔润',base:'#d9b3c2',colors:['#f4e9e7','#f5dfe7','#eac8d5'],decal:'flower',sound:'soft',rough:.38},
  {id:'cherry',name:'樱桃热线',sub:'拨一通电话，给慢下来的自己。',type:'复古 · 清脆',base:'#733447',colors:['#eee8d1'],round:true,decal:'number',sound:'type',rough:.3},
  {id:'sky',name:'晴空航迹',sub:'今天的心情，是晴空蓝。',type:'透明 · 轻盈',base:'#9ccbdc',colors:['#cce7ed','#badce9','#9acbe3'],decal:'sky',sound:'glass',rough:.19,glass:true},
  {id:'lotus',name:'风荷举',sub:'一池青绿，把心事放轻。',type:'树脂 · 清脆',base:'#a1b69b',colors:['#175d40','#2b7752','#30704e','#7fa98a','#75a58b','#86b399','#c6d8bc','#d4e0c8','#e3e7d0'],decal:'lotus',sound:'wood',rough:.18,glass:true},
  {id:'diamond',name:'钻石切面',sub:'一点点光，就足够闪亮。',type:'水晶 · 通透',base:'#d1d9d7',colors:['#e7eeeb','#dce8e6','#edf1ed'],decal:'diamond',sound:'crystal',rough:.07,glass:true},
  {id:'rose',name:'玫瑰搪瓷',sub:'留一点复古，留一点浪漫。',type:'搪瓷 · 清亮',base:'#c5b4a4',colors:['#f1e5d7','#eadbd2','#eee7d9'],decal:'rose',sound:'ceramic',rough:.24},
  {id:'midnight',name:'星月夜',sub:'把喧闹，藏进安静的夜色。',type:'星空 · 空灵',base:'#3d284a',colors:['#352343','#4b2b61','#62427f'],decal:'stars',sound:'deep',rough:.16,glass:true},
  {id:'cloud',name:'乌云棉花糖',sub:'阴天也有，软软的好心情。',type:'软糖 · 轻柔',base:'#c8d1cf',colors:['#dce4e0','#e5e9e5','#cdd9d7'],decal:'cloud',sound:'soft',rough:.7},
  {id:'caramel',name:'焦糖脆壳',sub:'咔哒一下，给生活加点甜。',type:'焦糖 · 酥脆',base:'#e3d8b7',colors:['#d79d40','#e4ae51','#e9b65c'],round:true,decal:'caramel',sound:'crunch',rough:.54},
  {id:'rgb',name:'黑曜 RGB',sub:'夜色之下，自有一点光。',type:'机械 · 段落',base:'#202a31',colors:['#26333c','#293843','#27313c'],decal:'rgb',sound:'type',rough:.32},
  {id:'lavender',name:'千禧透明',sub:'把时间，调回梦幻的频率。',type:'透明 · 清亮',base:'#c6bdd9',colors:['#d4cfea','#bbd0db','#decbe6'],decal:'sparkle',sound:'glass',rough:.12,glass:true},
  {id:'retro',name:'复古圆键',sub:'一字一句，都有回响。',type:'打字机 · 复古',base:'#443a34',colors:['#f0ead7'],round:true,decal:'letter',sound:'type',rough:.37},
  {id:'soda',name:'夏日汽水',sub:'把烦恼，变成一颗气泡。',type:'汽水 · 轻快',base:'#c4d4c7',colors:['#d7e6dd','#e4e9d8','#bcdad5'],decal:'bubbles',sound:'pop',rough:.16,glass:true},
  {id:'computer',name:'米白老电脑',sub:'回到那个，不用着急的下午。',type:'塑料 · 温暖',base:'#cac5b4',colors:['#e4dfcd','#eae4d5','#d6d4c8','#e3ded0','#ece6d5','#e7e1d1','#e9e3d1','#eee7d5','#eab978'],decal:'computer',sound:'plastic',rough:.52},
  {id:'ice',name:'极地水晶',sub:'清清凉凉，让思绪透透气。',type:'冰晶 · 清冽',base:'#c4dbe0',colors:['#d5eaf0','#e4f1ee','#c6e5ed'],decal:'ice',sound:'crystal',rough:.06,glass:true},
  {id:'mahjong',name:'薄荷麻将',sub:'摸到一手，刚刚好的松弛。',type:'瓷玉 · 清脆',base:'#73ad98',colors:['#c5ddba','#d6e5c8','#afcdb2'],decal:'mahjong',sound:'ceramic',rough:.25}
];
let saved = {};
try { saved = JSON.parse(localStorage.getItem('quiet-keys') || '{}'); } catch {}
let current = Math.max(0, themes.findIndex(t => t.id === saved.theme));
if (!saved.theme) current = 3;
let favorites = new Set(Array.isArray(saved.favorites) ? saved.favorites : []);
let volume = Number.isFinite(saved.volume) ? Math.min(100, Math.max(0, saved.volume)) : 55;
let muted = false, locked = false, presses = 0, toastTimer;
const persist = () => { try { localStorage.setItem('quiet-keys', JSON.stringify({theme:themes[current].id, volume, favorites:[...favorites]})); } catch {} };
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 1800); }

// All textures are generated locally. No image or audio requests are needed.
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function texture(theme, index, top = false) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d'), r = rng(index * 313 + current * 31 + 7);
  if (!top) {
    c.fillStyle = theme.colors[index % theme.colors.length]; c.fillRect(0,0,256,256);
    for (let i=0;i<340;i++) { c.fillStyle = `rgba(${theme.id==='caramel'?'91,49,13':'255,255,255'},${r()*.045})`; c.beginPath(); c.arc(r()*256,r()*256,r()*30+2,0,Math.PI*2); c.fill(); }
  } else {
    c.textAlign='center'; c.textBaseline='middle'; c.fillStyle='#65716c';
    const flower = (x,y,size,color) => { c.fillStyle=color; for(let j=0;j<5;j++){const a=j*Math.PI*2/5;c.beginPath();c.ellipse(x+Math.cos(a)*size*.52,y+Math.sin(a)*size*.52,size*.5,size*.32,a,0,Math.PI*2);c.fill();} c.fillStyle='#e8c77b';c.beginPath();c.arc(x,y,size*.15,0,7);c.fill(); };
    switch(theme.decal) {
      case 'lotus':
        if(index%3!==1) { c.fillStyle=index<3?'#c5d57f':'#b6cc88';c.beginPath();c.ellipse(128,133,35,29,-.3,0,Math.PI*1.88);c.lineTo(128,133);c.fill();c.strokeStyle='#8baa6a';c.lineWidth=2;c.beginPath();c.moveTo(128,133);c.lineTo(117,154);c.stroke(); }
        if(index%3===1 || index===0){ c.save();c.translate(130,132);c.rotate(-.5);c.fillStyle='#f4ead7';c.beginPath();c.ellipse(0,0,35,12,0,0,7);c.fill();c.beginPath();c.moveTo(-27,0);c.lineTo(-48,-14);c.lineTo(-44,15);c.fill();c.fillStyle='#ce814b';c.beginPath();c.ellipse(5,0,13,9,0,0,7);c.fill();c.restore(); }
        break;
      case 'flower': flower(132,127,20,'#fff8f5'); flower(177,72,9,'#e9b3c8'); break;
      case 'number': c.fillStyle='#56463d';c.font='italic 90px Georgia';c.fillText(String(index+1),128,139);break;
      case 'letter': c.fillStyle='#625445';c.font='48px Georgia';c.fillText('QWEASDZXC'[index],128,133);c.strokeStyle='#b5a686';c.lineWidth=2;c.beginPath();c.arc(128,128,100,0,7);c.stroke();break;
      case 'sky': c.fillStyle='#659ab1';c.font='26px sans-serif';c.fillText(['☀','✧','✈','·','☁','·','⌁','·','✦'][index],128,128);break;
      case 'rose': c.strokeStyle='#ba8d83';c.lineWidth=3;c.strokeRect(33,33,190,190);c.strokeRect(42,42,172,172);flower(128,128,21,'#cf9c9f');c.strokeStyle='#95a588';c.beginPath();c.moveTo(128,148);c.lineTo(128,180);c.stroke();break;
      case 'stars': c.fillStyle='#ddc9ec';for(let i=0;i<22;i++){c.beginPath();c.arc(r()*220+18,r()*220+18,r()*2.3+.7,0,7);c.fill();}if(index===4){c.font='70px serif';c.fillText('☾',128,128);}break;
      case 'caramel':for(let i=0;i<110;i++){c.fillStyle=`rgba(112,61,16,${r()*.35})`;c.beginPath();c.arc(25+r()*205,25+r()*205,r()*3.5+1,0,7);c.fill();}break;
      case 'rgb':c.strokeStyle=['#66bfb1','#6682c5','#b48bbb'][index%3];c.lineWidth=2;c.strokeRect(31,31,194,194);break;
      case 'sparkle':c.fillStyle='#ffffffa0';c.font='45px serif';c.fillText('✧',128,128);break;
      case 'bubbles':c.strokeStyle='#ffffffc0';c.lineWidth=3;for(let i=0;i<12;i++){c.beginPath();c.arc(30+r()*196,30+r()*196,4+r()*10,0,7);c.stroke();}break;
      case 'computer':c.fillStyle='#8c8b7b';c.font='26px monospace';c.fillText(['esc','1','2','tab','Q','W','ctrl','A','↵'][index],128,128);break;
      case 'ice':c.strokeStyle='#ffffff85';c.lineWidth=2;for(let i=0;i<6;i++){c.beginPath();c.moveTo(128,128);c.lineTo(128+Math.cos(i*Math.PI/3)*95,128+Math.sin(i*Math.PI/3)*95);c.stroke();}break;
      case 'mahjong':c.fillStyle='#367a5b';if(index%3===0){c.font='70px serif';c.fillText(['發','中','發'][Math.floor(index/3)],128,133);}else for(let j=0;j<index+1;j++){c.beginPath();c.arc(73+(j%3)*54,75+Math.floor(j/3)*52,10,0,7);c.fill();}break;
    }
  }
  const t = new THREE.CanvasTexture(canvas); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t;
}

const canvas = $('keyboard');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, preserveDrawingBuffer:true}); }
catch { $('loading').textContent='当前浏览器未启用 WebGL，请开启硬件加速后重试。'; throw new Error('WebGL is unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0xf5f8f8,0); renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-4,4,3,-3,.1,80);camera.position.set(7.2,9.5,9.3);camera.lookAt(0,.2,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x809285,1.4));
const light = new THREE.DirectionalLight(0xfff9ed,2.7);light.position.set(-3,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;light.shadow.normalBias=.025;light.shadow.bias=-.0002;light.shadow.radius=4;scene.add(light);
const fill = new THREE.DirectionalLight(0xd6ecff,1.2);fill.position.set(4,4,-4);scene.add(fill);
const envCanvas=document.createElement('canvas');envCanvas.width=512;envCanvas.height=256;const ec=envCanvas.getContext('2d');ec.fillStyle='#a8b9af';ec.fillRect(0,0,512,256);for(const [x,y,w,h] of [[20,25,120,100],[270,15,180,100],[180,140,110,30]]){const g=ec.createRadialGradient(x+w/2,y+h/2,0,x+w/2,y+h/2,w*.7);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#a8b9af');ec.fillStyle=g;ec.fillRect(x-w*.3,y-h*.3,w*1.6,h*1.6);}const envTex=new THREE.CanvasTexture(envCanvas);envTex.mapping=THREE.EquirectangularReflectionMapping;envTex.colorSpace=THREE.SRGBColorSpace;const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(envTex).texture;envTex.dispose();pmrem.dispose();
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.2;floor.receiveShadow=true;scene.add(floor);
const roundBox=(x,y,z,r)=>new RoundedBoxGeometry(x,y,z,4,r);
const baseGeo=roundBox(4.12,.27,4.12,.12), insetGeo=roundBox(3.88,.08,3.88,.07);
const keyGeo=roundBox(1.08,.61,1.08,.14);
const pos=keyGeo.attributes.position;for(let i=0;i<pos.count;i++){const scale=1-(pos.getY(i)+.305)*.13;pos.setX(i,pos.getX(i)*scale);pos.setZ(i,pos.getZ(i)*scale);}keyGeo.computeVertexNormals();
const roundGeo=new THREE.CylinderGeometry(.49,.51,.46,48,1), collarGeo=new THREE.CylinderGeometry(.53,.54,.12,48);
const topGeo=roundBox(.78,.008,.78,.11),roundTopGeo=new THREE.CircleGeometry(.44,48);
const models = [];
function makeModel(theme) {
 const group=new THREE.Group();const owned=[];const keys=[];
 const mat=(options)=>{const m=new THREE.MeshPhysicalMaterial(options);owned.push(m);return m;};
 const base=new THREE.Mesh(baseGeo,mat({color:theme.base,roughness:.4,metalness:theme.id==='rgb'?.4:0,clearcoat:.45}));base.castShadow=base.receiveShadow=true;group.add(base);
 const inset=new THREE.Mesh(insetGeo,mat({color:new THREE.Color(theme.base).multiplyScalar(theme.id==='rgb'?.55:.82),roughness:.5}));inset.position.y=.175;inset.receiveShadow=true;group.add(inset);
 if(theme.id==='rgb'){
  const rim=new THREE.Mesh(roundBox(4.15,.035,4.15,.1),mat({color:'#aa8bb9',emissive:'#9267b3',emissiveIntensity:.6,roughness:.4}));rim.position.y=-.07;group.add(rim);owned.push(rim.geometry);
 }
 for(let i=0;i<9;i++){
  const key=new THREE.Group();key.position.set((i%3-1)*1.18,.6,(Math.floor(i/3)-1)*1.18);key.userData={index:i,rest:.6,velocity:0,offset:0,down:false};
  const map=texture(theme,i);owned.push(map);
  const material=mat({map,color:theme.id==='lotus'?theme.colors[i]:theme.id==='caramel'?'#e6bf85':'#ffffff',roughness:theme.rough,metalness:theme.id==='rgb'?.2:0,clearcoat:theme.glass?1:.45,clearcoatRoughness:.12,ior:1.46,transmission:theme.glass?.06:0,thickness:.7,envMapIntensity:theme.glass?.65:.35});
  const sideMaterial=theme.id==='caramel'?mat({color:'#b67b32',roughness:.6}):material;
  const cap=new THREE.Mesh(theme.round?roundGeo:keyGeo,theme.round?[sideMaterial,material,sideMaterial]:material);cap.castShadow=cap.receiveShadow=true;cap.userData.key=i;key.add(cap);
  if(theme.round){const collar=new THREE.Mesh(collarGeo,mat({color:theme.base,roughness:.45}));collar.position.y=-.235;collar.castShadow=true;key.add(collar);}
  const decalTex=texture(theme,i,true);owned.push(decalTex);
  const decal=new THREE.Mesh(theme.round?roundTopGeo:topGeo,new THREE.MeshBasicMaterial({map:decalTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));owned.push(decal.material);
  decal.position.y=theme.round?.234:.31;if(theme.round)decal.rotation.x=-Math.PI/2;decal.userData.key=i;key.add(decal);
  if(theme.decal==='diamond'){
   const facet=new THREE.Mesh(new THREE.OctahedronGeometry(.47,0),mat({color:'#eef8f5',roughness:.04,metalness:.12,transparent:true,opacity:.46,flatShading:true,clearcoat:1}));facet.scale.set(1,.38,1);facet.rotation.y=Math.PI/4;facet.position.y=.3;facet.userData.key=i;key.add(facet);owned.push(facet.geometry);
  }
  keys.push(key);group.add(key);
 }
 group.userData={keys,owned};return group;
}
for (let i=0;i<themes.length;i++){
 const old=current;current=i;const model=makeModel(themes[i]);current=old;models.push(model);
}
let board = models[current];scene.add(board);
const defaultYaw=-.08;let yaw=defaultYaw,tilt=0,targetYaw=defaultYaw,targetTilt=0;
const cards=[];
function createCollection(){
 const old=board;scene.remove(old);floor.visible=false;
 renderer.setPixelRatio(1);renderer.setSize(200,150,false);camera.left=-2.95*4/3;camera.right=2.95*4/3;camera.top=2.95;camera.bottom=-2.95;camera.updateProjectionMatrix();
 themes.forEach((theme,i)=>{
  const model=models[i];model.rotation.y=defaultYaw;scene.add(model);renderer.render(scene,camera);const src=renderer.domElement.toDataURL('image/png');scene.remove(model);
  const card=document.createElement('div');card.className='theme-card';
  const select=document.createElement('button');select.className='theme-select';select.setAttribute('aria-label',theme.name);select.innerHTML=`<img alt="${theme.name}键盘" src="${src}"><span class="theme-name">${theme.name}</span>`;select.addEventListener('click',()=>setTheme(i));
  const star=document.createElement('button');star.className='favorite';star.setAttribute('aria-label',`收藏${theme.name}`);star.setAttribute('aria-pressed',String(favorites.has(theme.id)));star.textContent=favorites.has(theme.id)?'★':'☆';star.addEventListener('click',()=>{favorites.has(theme.id)?favorites.delete(theme.id):favorites.add(theme.id);star.setAttribute('aria-pressed',String(favorites.has(theme.id)));star.textContent=favorites.has(theme.id)?'★':'☆';persist();toast(favorites.has(theme.id)?`已收藏 · ${theme.name}`:'已取消收藏');});
  card.append(select,star);$('themes').append(card);cards.push(card);
 });
 floor.visible=true;scene.add(old);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
}
createCollection();
function resize(){const w=$('stage').clientWidth,h=$('stage').clientHeight;renderer.setSize(w,h,false);const view=w<480?5.6:6.5;camera.left=-view*w/h/2;camera.right=view*w/h/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();renderer.render(scene,camera);}
new ResizeObserver(resize).observe($('stage'));resize();$('loading').remove();
function setTheme(i){releaseAll();scene.remove(board);current=i;board=models[i];scene.add(board);$('theme-title').textContent=themes[i].name;$('theme-subtitle').textContent=themes[i].sub;$('material-type').textContent=themes[i].type;cards.forEach((c,j)=>{c.classList.toggle('selected',i===j);c.querySelector('.theme-select').setAttribute('aria-pressed',String(i===j));});persist();}

let audio,noiseBuffer;
function sound(index,release=false){
 if(muted||volume===0)return;
 try{
  if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();noiseBuffer=audio.createBuffer(1,audio.sampleRate*.22,audio.sampleRate);const data=noiseBuffer.getChannelData(0),r=rng(77);for(let i=0;i<data.length;i++)data[i]=r()*2-1;}
  if(audio.state==='suspended')audio.resume();
  const type=themes[current].sound,t=audio.currentTime,v=(volume/100)**1.5*(release?.22:1);
  const profiles={soft:[360,.065,850,.09],type:[230,.055,2500,.2],glass:[1100,.15,3400,.065],wood:[410,.08,1500,.16],crystal:[1800,.2,4800,.055],ceramic:[870,.09,2200,.1],deep:[170,.14,1100,.12],crunch:[260,.065,3900,.22],pop:[540,.085,1300,.08],plastic:[330,.07,2100,.15]};
  const [freq,duration,cutoff,amount]=profiles[type],pitch=1+(index-4)*.025;
  const noise=audio.createBufferSource();noise.buffer=noiseBuffer;const filter=audio.createBiquadFilter();filter.type='bandpass';filter.frequency.value=cutoff;filter.Q.value=.8;
  const ng=audio.createGain();ng.gain.setValueAtTime(amount*v,t);ng.gain.exponentialRampToValueAtTime(.0001,t+duration);noise.connect(filter).connect(ng).connect(audio.destination);noise.start(t);noise.stop(t+duration+.01);
  const osc=audio.createOscillator(),gain=audio.createGain();osc.type=type==='type'?'triangle':'sine';osc.frequency.setValueAtTime(freq*pitch*(release?1.3:1),t);osc.frequency.exponentialRampToValueAtTime(freq*pitch*.45,t+duration);gain.gain.setValueAtTime(v*.16,t);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(gain).connect(audio.destination);osc.start(t);osc.stop(t+duration+.01);
  if(type==='crystal'||type==='glass'){const ring=audio.createOscillator(),rg=audio.createGain();ring.frequency.value=freq*pitch*2.71;rg.gain.setValueAtTime(v*.027,t);rg.gain.exponentialRampToValueAtTime(.0001,t+.22);ring.connect(rg).connect(audio.destination);ring.start(t);ring.stop(t+.23);}
 }catch{}
}
const held=new Map();
function press(index,source){if(index<0||index>8)return;const previous=held.get(source);if(previous===index)return;if(previous!==undefined)release(source);held.set(source,index);const key=board.userData.keys[index];key.userData.down=true;key.userData.velocity=-1.6;sound(index);presses++;$('press-count').textContent=String(presses);if(navigator.vibrate&&source.startsWith('p'))navigator.vibrate(8);}
function release(source){const index=held.get(source);if(index===undefined)return;held.delete(source);if(![...held.values()].includes(index)){board.userData.keys[index].userData.down=false;sound(index,true);}}
function releaseAll(){for(const source of [...held.keys()])release(source);}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function hit(event){const rect=canvas.getBoundingClientRect();pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);for(const h of raycaster.intersectObjects(board.children,true)){if(h.object.userData.key!==undefined)return h.object.userData.key;}return -1;}
const pointers=new Map();
canvas.addEventListener('pointerdown',event=>{event.preventDefault();canvas.setPointerCapture(event.pointerId);const index=hit(event);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,rotate:index<0||event.button===2||event.shiftKey});if(pointers.size>1){releaseAll();for(const p of pointers.values())p.rotate=true;}else if(index>=0&&!event.shiftKey&&event.button!==2)press(index,'p'+event.pointerId);});
canvas.addEventListener('pointermove',event=>{const p=pointers.get(event.pointerId);if(!p)return;if(p.rotate){if(!locked){targetYaw+=(event.clientX-p.x)*.011;targetTilt=Math.max(-.48,Math.min(.5,targetTilt+(event.clientY-p.y)*.007));}}else{const index=hit(event);if(index>=0)press(index,'p'+event.pointerId);else release('p'+event.pointerId);}p.x=event.clientX;p.y=event.clientY;});
function pointerUp(e){release('p'+e.pointerId);pointers.delete(e.pointerId);}
canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('lostpointercapture',pointerUp);canvas.addEventListener('contextmenu',e=>e.preventDefault());
const mapping={KeyQ:0,KeyW:1,KeyE:2,KeyA:3,KeyS:4,KeyD:5,KeyZ:6,KeyX:7,KeyC:8,Digit1:0,Digit2:1,Digit3:2,Digit4:3,Digit5:4,Digit6:5,Digit7:6,Digit8:7,Digit9:8,Numpad7:0,Numpad8:1,Numpad9:2,Numpad4:3,Numpad5:4,Numpad6:5,Numpad1:6,Numpad2:7,Numpad3:8};
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;const index=mapping[e.code];if(index!==undefined){e.preventDefault();if(!e.repeat)press(index,'k'+e.code);}});
window.addEventListener('keyup',e=>release('k'+e.code));window.addEventListener('blur',()=>{releaseAll();pointers.clear();});document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();pointers.clear();}});
function volumeUI(){const effective=muted?0:volume;$('volume').value=volume;$('volume-value').textContent=effective+'%';$('volume').style.background=`linear-gradient(to right,#8a9d90 ${volume}%,#dce3df ${volume}%)`;$('sound').style.opacity=muted?'.4':'1';for(const id of ['sound','volume-mute'])$(id).setAttribute('aria-label',muted?'开启声音':'静音');}
$('volume').addEventListener('input',()=>{volume=Number($('volume').value);muted=false;volumeUI();persist();});
for(const id of ['sound','volume-mute'])$(id).addEventListener('click',()=>{muted=!muted;volumeUI();toast(muted?'已静音':'声音已开启');});volumeUI();
$('lock').addEventListener('click',()=>{locked=!locked;$('lock').setAttribute('aria-pressed',String(locked));$('lock').querySelector('span').textContent=locked?'解锁视角':'锁定视角';toast(locked?'视角已锁定':'可以自由旋转了');});
$('reset').addEventListener('click',()=>{targetYaw=defaultYaw;targetTilt=0;toast('已回到初始视角');});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('浏览器暂不支持全屏');}catch{toast('浏览器暂不支持全屏');}});
let last=0;
function frame(time){requestAnimationFrame(frame);if(document.hidden){last=time;return;}const dt=Math.min((time-last)/1000||.016,.034);last=time;const smooth=1-Math.exp(-dt*12);yaw+=(targetYaw-yaw)*smooth;tilt+=(targetTilt-tilt)*smooth;board.rotation.set(tilt,yaw,0);
 for(const key of board.userData.keys){const d=key.userData,target=d.down?-.17:0;const steps=3,h=dt/steps;for(let i=0;i<steps;i++){d.velocity+=((target-d.offset)*430-d.velocity*22)*h;d.offset+=d.velocity*h;}key.position.y=d.rest+d.offset;}
 renderer.render(scene,camera);
}
setTheme(current);
requestAnimationFrame(frame);
