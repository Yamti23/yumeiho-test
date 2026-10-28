import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import {mergeGeometries} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/utils/BufferGeometryUtils.js';
import {MeshoptDecoder} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/meshopt_decoder.module.js';
// Procedural anatomy-inspired sculpture. Not a medical-grade anatomical asset.
const host=document.getElementById('anatomyCanvas');
if(host){
 try {
  const scene=new THREE.Scene();
  const storyScene=new THREE.Scene();
  const storyHost=document.getElementById('cinema3d');
  let storyRenderer=null,storyCamera=null,storyResize=null;
  const compactDevice=matchMedia("(max-width: 760px)").matches;
  const pixelRatio=Math.min(devicePixelRatio,compactDevice?1.25:1.5);
  function openStory(){
   if(!storyHost||storyRenderer)return;
   try{
    storyRenderer=new THREE.WebGLRenderer({antialias:!compactDevice,alpha:true,powerPreference:'low-power'});
    storyRenderer.setPixelRatio(pixelRatio);storyRenderer.outputColorSpace=THREE.SRGBColorSpace;
    storyRenderer.toneMapping=THREE.ACESFilmicToneMapping;storyRenderer.toneMappingExposure=1.22;
    storyHost.appendChild(storyRenderer.domElement);storyCamera=new THREE.PerspectiveCamera(34,1,.1,80);
    storyCamera.position.set(4.4,1.2,8.8);storyCamera.lookAt(0,.12,0);
    storyResize=new ResizeObserver(()=>{const w=storyHost.clientWidth,h=storyHost.clientHeight;if(w&&h){storyCamera.aspect=w/h;storyCamera.updateProjectionMatrix();storyRenderer.setSize(w,h,false);updateStoryView();requestDraw()}});
    storyResize.observe(storyHost);visibilityObserver.observe(storyHost);rebuildStoryModel();
   }catch(err){console.warn('Story canvas unavailable:',err);closeStory()}
  }
  function closeStory(){
   storyVisible=false;storyResize?.disconnect();if(storyHost)visibilityObserver.unobserve(storyHost);
   clearStoryModel();storyRenderer?.dispose();storyRenderer?.forceContextLoss();storyRenderer?.domElement.remove();storyRenderer=null;storyCamera=null;
   storyHost?.closest('.cinema-stage').removeAttribute('data-webgl-ready');
  }
  const camera=new THREE.PerspectiveCamera(34,1,.1,80); camera.position.set(4.4,1.2,8.8);
  const renderer=new THREE.WebGLRenderer({antialias:!compactDevice,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(pixelRatio); renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.22;
  renderer.domElement.setAttribute('aria-label','Etkileşimli anatomi modeli');
  renderer.domElement.setAttribute('aria-describedby','canvasHelp');
  renderer.domElement.setAttribute('role','img');renderer.domElement.tabIndex=0;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xd9e4ec,0x473225,2.1));
  function light(color,power,x,y,z){const l=new THREE.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l)}
  light(0xffd6a0,4,4,5,5);light(0x7392a8,2,-5,2,-4);
  const rimLight=new THREE.DirectionalLight(0xd7a163,1.6);rimLight.position.set(-4,2,-3);scene.add(rimLight);
  const bone=new THREE.MeshPhysicalMaterial({color:0xe7c9a4,roughness:.52,metalness:.06});
  const boneDark=new THREE.MeshStandardMaterial({color:0xb79472,roughness:.72});
  const muscle=new THREE.MeshPhysicalMaterial({color:0x894b38,roughness:.55,transparent:true,opacity:.88,side:THREE.DoubleSide});
  const highlighted=new THREE.MeshStandardMaterial({color:0xf4cf9b,emissive:0xb77f41,emissiveIntensity:.3,roughness:.45});
  const groups={spine:new THREE.Group(),muscle:new THREE.Group(),pelvis:new THREE.Group()};
  const status=document.getElementById('modelStatus');
  // Optional local QA counters; disabled in the normal visitor experience.
  const diagnostics=new URLSearchParams(location.search).has('diagnostics');
  let renderCount=0,renderCpuMs=0;
  const setStatus=(message)=>{if(status)status.textContent=message};
  let importedRoot=null;let activePart='spine';let userInteracting=false;let rotating=false;let modelUrl=null;let cameraTween=0;
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion=motionPreference.matches||document.documentElement.dataset.motion==='reduced';
  const layerVisible={spine:true,muscle:true,pelvis:true};
  Object.values(groups).forEach(g=>scene.add(g));
  const sphere=new THREE.SphereGeometry(1,20,14);
  function ellipsoid(parent,x,y,z,sx,sy,sz,material,rot=0){const m=new THREE.Mesh(sphere,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=rot;parent.add(m);return m;}
  function tube(parent,points,r,material){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,26,r,7,false),material);parent.add(mesh);return mesh;}
  const discMaterial=new THREE.MeshStandardMaterial({color:0x847a70});
  // Vertebrae and curved spine in neutral upright pose
  for(let i=0;i<24;i++){const t=i/23;const y=-1.05+3.55*t;const z=.10+.22*Math.sin(t*Math.PI*2.4);const w=.23-.105*t;ellipsoid(groups.spine,0,y,z,w,.105,w*.8,bone);ellipsoid(groups.spine,0,y-.022,z-.18,w*.65,.055,.14,boneDark);if(i<22)ellipsoid(groups.spine,0,y+.087,z,w*.88,.023,w*.72,discMaterial);}
  // ribs, connected to the thoracic spine
  for(let side of [-1,1])for(let j=0;j<9;j++){const y=.15+j*.225;const spread=Math.sin((j+1)/10*Math.PI)*.94+.23;tube(groups.spine,[[0,y,.12],[side*.38,y+.07,-.03],[side*spread,y-.10,-.08],[side*(spread+.11),y-.22,.17],[side*.46,y-.30,.39]],.038,bone);}
  // pelvic bowl: iliac crests, sacrum and pubic arc
  ellipsoid(groups.pelvis,0,-1.35,.15,.23,.46,.27,boneDark);
  for(let s of [-1,1]){ellipsoid(groups.pelvis,s*.57,-1.40,.04,.53,.55,.25,bone,s*-.42);
    tube(groups.pelvis,[[s*.1,-1.12,.13],[s*.4,-1.02,.17],[s*.85,-1.04,.09],[s*1.04,-1.40,.04],[s*.64,-1.83,.24],[s*.24,-1.95,.35]],.10,bone);
    ellipsoid(groups.pelvis,s*.73,-1.87,.12,.22,.26,.19,bone);
    tube(groups.pelvis,[[s*.65,-1.82,.25],[s*.42,-2.13,.26],[0,-2.21,.34]],.07,boneDark);
  }
  // layered paraspinal, latissimus and shoulder muscle forms
  for(let side of [-1,1]){ellipsoid(groups.muscle,side*.32,.50,-.18,.20,1.28,.25,muscle,side*.11);
    ellipsoid(groups.muscle,side*.77,.96,-.10,.43,.94,.20,muscle,side*.24);
    ellipsoid(groups.muscle,side*.69,-.39,-.12,.38,.83,.15,muscle,side*-.26);
    ellipsoid(groups.muscle,side*.96,1.72,-.06,.32,.40,.32,muscle,side*-.3);
    ellipsoid(groups.muscle,side*.45,-1.65,-.32,.44,.34,.20,muscle,side*.17);
  }
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=5.5;controls.maxDistance=13;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI-.3;controls.target.set(0,.12,0);controls.update();
  renderer.domElement.style.touchAction='pan-y pinch-zoom';
  renderer.domElement.addEventListener('keydown',event=>{
   const key=event.key;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(key))return;
   event.preventDefault();cameraTween++;
   if(key==='Home'){controls.reset();scene.rotation.y=0;requestDraw();return}
   const offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
   if(key==='ArrowLeft')spherical.theta-=.12;if(key==='ArrowRight')spherical.theta+=.12;
   if(key==='ArrowUp')spherical.phi-=.12;if(key==='ArrowDown')spherical.phi+=.12;
   if(key==='+'||key==='=')spherical.radius*=.9;if(key==='-')spherical.radius*=1.1;
   spherical.phi=THREE.MathUtils.clamp(spherical.phi,controls.minPolarAngle,controls.maxPolarAngle);
   spherical.radius=THREE.MathUtils.clamp(spherical.radius,controls.minDistance,controls.maxDistance);
   camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();requestDraw();
  });

  const normalMaterials={spine:[],muscle:[],pelvis:[]};
  for(let [key,g] of Object.entries(groups))g.traverse(obj=>{if(obj.isMesh)normalMaterials[key].push([obj,obj.material])});
  function category(name){const n=name.toLowerCase();if(/pelvis|ilium|iliac|sacrum|hip|coxal|pubis|ischium|ischial|os coxae/.test(n))return 'pelvis';if(/muscle|latissimus|trapezius|deltoid|tendon|fascia|muscular|pectoral|glute|psoas|oblique|rectus|serratus|quadriceps|hamstring|biceps|triceps/.test(n))return 'muscle';if(/spine|vertebra|cervical|thoracic|lumbar|rib|bone|skeleton|skeletal|cartilage|sternum|femur|tibia|humerus/.test(n))return 'spine';return 'other'}
  const importedMeshes=[];
  const MODEL_URL='https://cdn.jsdelivr.net/gh/Charleeh/ecorche@320805e06aee51e2e6f6b22533eb2a59d43f2d4d/model/ecorche.meshopt.glb';
  const MODEL_LOCAL='./models/ecorche.meshopt.glb';
  const MODEL_LOCAL_STANDARD='./models/ecorche.glb';
  const modelButton=document.getElementById('loadReferenceModel');
  let loadInProgress=false;
  let importedLabel='';
  function updateParts(){
   for(const [part,entries] of Object.entries(normalMaterials))for(const [obj,mat] of entries){obj.material=part===activePart?highlighted:mat;obj.visible=!importedRoot&&layerVisible[part]}
   for(const item of importedMeshes){item.mesh.visible=item.part==='other'||layerVisible[item.part];if(item.part==='other')continue;
    item.mesh.material=item.part===activePart?item.emphasis:item.original;
   }
  }
  function selectPart(key){if(!normalMaterials[key])return;activePart=key;updateParts();requestDraw()}
  updateParts();window.addEventListener('yumeiho:part',e=>selectPart(e.detail));
  document.querySelectorAll('[data-layer]').forEach(el=>el.addEventListener('change',()=>{layerVisible[el.dataset.layer]=el.checked;updateParts();requestDraw()}));
  function frameModel(root){const box=new THREE.Box3().setFromObject(root);if(box.isEmpty())throw new Error('Modelin görünür geometrisi bulunamadı');const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());root.position.sub(center);const height=Math.max(size.y,.01),max=Math.max(size.x,size.y,size.z,.01);const wrapper=new THREE.Group();wrapper.add(root);wrapper.scale.setScalar(4.9/Math.max(height,max*.8));return wrapper;}
  function releaseImported(){
    if(!importedRoot)return;
    clearStoryModel();
    scene.remove(importedRoot);
    const geometries=new Set(),materials=new Set(),textures=new Set();
    importedRoot.traverse(obj=>{if(obj.isMesh){geometries.add(obj.geometry);for(const mat of (Array.isArray(obj.material)?obj.material:[obj.material]))materials.add(mat)}});
    for(const item of importedMeshes){for(const mat of (Array.isArray(item.original)?item.original:[item.original]))materials.add(mat);for(const mat of (Array.isArray(item.emphasis)?item.emphasis:[item.emphasis]))materials.add(mat)}
    materials.forEach(mat=>{for(const value of Object.values(mat||{}))if(value?.isTexture)textures.add(value);mat?.dispose()});
    textures.forEach(texture=>texture.dispose());geometries.forEach(geometry=>geometry?.dispose());
    importedRoot=null;importedMeshes.length=0;
  }
  function batchStaticModel(source){
   // Bake each static transform once; retain vertex colours, materials and semantic layers.
   source.updateMatrixWorld(true);
   source.traverse(obj=>{if(obj.isMesh&&(obj.isSkinnedMesh||Array.isArray(obj.material)))throw new Error('Özgün modelin geometri yapısı korunacak');});
   const buckets=new Map(),originalGeometries=new Set();let sourceCount=0;
   source.traverse(obj=>{
    if(!obj.isMesh)return;sourceCount++;
    if(obj.isSkinnedMesh||Array.isArray(obj.material))throw new Error('Bu model statik birleştirmeye uygun değil');
    const layer=String(obj.userData?.layer||'').toLowerCase();
    const inferred=category([obj.name,obj.parent?.name||'',obj.material?.name||''].join(' '));
    const part=inferred==='pelvis'?'pelvis':layer==='skeleton'?'spine':(layer.includes('muscle')||layer==='superficial'||layer==='deep')?'muscle':inferred;
    const geometry=new THREE.BufferGeometry();
    // Convert normalized/quantized GLTF attributes before applying world transforms.
    for(const [name,attribute] of Object.entries(obj.geometry.attributes)){
     const values=new Float32Array(attribute.count*attribute.itemSize);
     const readers=['getX','getY','getZ','getW'];
     for(let i=0;i<attribute.count;i++)for(let j=0;j<attribute.itemSize;j++)values[i*attribute.itemSize+j]=attribute[readers[j]](i);
     geometry.setAttribute(name,new THREE.BufferAttribute(values,attribute.itemSize));
    }
    if(obj.geometry.index)geometry.setIndex(obj.geometry.index.clone());
    geometry.applyMatrix4(obj.matrixWorld);
    const signature=Object.keys(geometry.attributes).sort().join(',');
    const key=part+':'+obj.material.uuid+':'+signature+':'+Boolean(geometry.index);
    if(!buckets.has(key))buckets.set(key,{part,material:obj.material,geometries:[]});
    buckets.get(key).geometries.push(geometry);originalGeometries.add(obj.geometry);
   });
   const group=new THREE.Group();const temporary=[];
   try{
    for(const bucket of buckets.values()){
     const merged=mergeGeometries(bucket.geometries,false);
     if(!merged)throw new Error('Geometri birleştirilemedi');temporary.push(merged);
     merged.computeBoundingSphere();const mesh=new THREE.Mesh(merged,bucket.material);
     mesh.name=bucket.part;mesh.userData.part=bucket.part;group.add(mesh);
    }
   }catch(error){temporary.forEach(g=>g.dispose());throw error}
   finally{for(const bucket of buckets.values())bucket.geometries.forEach(g=>g.dispose())}
   originalGeometries.forEach(g=>g.dispose());
   host.dataset.sourceMeshCount=String(sourceCount);host.dataset.batchedMeshCount=String(group.children.length);
   return group;
  }
  async function loadModel(url,label){
   if(loadInProgress)return;
   loadInProgress=true;modelButton?.setAttribute('disabled','');
   setStatus('Anatomi hazırlanıyor…');
   const progress=document.getElementById('modelProgress');if(progress){progress.hidden=false;progress.removeAttribute('value')}
   try{
    const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
    const gltf=await loader.loadAsync(url,event=>{
     if(event.lengthComputable&&event.total>0){const percent=Math.min(99,Math.round(event.loaded/event.total*100));if(progress)progress.value=percent;setStatus('Anatomi indiriliyor · %'+percent)}
     else setStatus('Anatomi indiriliyor…');
    });
    let optimized=gltf.scene;
    try{optimized=batchStaticModel(gltf.scene)}catch(error){console.warn('Özgün geometri korunuyor:',error)}
    const nextMeshes=[];
    optimized.traverse(obj=>{
      if(!obj.isMesh)return;
      const layer=String(obj.userData?.layer||'').toLowerCase();
      const inferred=category([obj.name,obj.parent?.name||'',obj.material?.name||''].join(' '));
      const part=obj.userData.part||(inferred==='pelvis'?'pelvis':layer==='skeleton'?'spine':(layer.includes('muscle')||layer==='superficial'||layer==='deep')?'muscle':inferred);
      const original=obj.material;
      const emphasis=(Array.isArray(original)?original:[original]).map(mat=>{
        const m=mat.clone(); if(m.emissive){m.emissive.set(0x9b652f);m.emissiveIntensity=.34;} return m;
      });
      nextMeshes.push({mesh:obj,part,original,emphasis:Array.isArray(original)?emphasis:emphasis[0]});
    });
    const wrapper=frameModel(optimized);
    releaseImported();
    importedRoot=wrapper;
    importedMeshes.length=0;importedMeshes.push(...nextMeshes);
    scene.add(importedRoot);updateParts();rebuildStoryModel();
    importedLabel=label;
    host.dataset.meshCount=String(importedMeshes.length);
    setStatus('Anatomi modeli hazır. Sürükleyerek döndürün veya bir bölge seçin.');
    cameraTween++;controls.reset();requestDraw();
   }catch(error){
     console.warn('Anatomi modeli yüklenemedi:',error);
     setStatus(`${label} yüklenemedi. İnternet bağlantısını kontrol edin veya .glb dosyası seçin. ${importedRoot?'Önceki model korunuyor.':'Temsili model gösteriliyor.'}`);
   }finally{loadInProgress=false;if(progress){progress.value=100;progress.hidden=true}modelButton?.removeAttribute('disabled');}
  }
  modelButton?.addEventListener('click',()=>loadModel(MODEL_URL,'Écorché anatomik model'));
  // Yerel lisanslı GLB dosyası /models/ecorche.glb içine konulursa onu tercih et.
  async function loadDefault(){
    try{const response=await fetch(MODEL_LOCAL,{method:'HEAD'});if(response.ok)return loadModel(MODEL_LOCAL,'Yerel Écorché (sıkıştırılmış)');
      const standard=await fetch(MODEL_LOCAL_STANDARD,{method:'HEAD'});if(standard.ok)return loadModel(MODEL_LOCAL_STANDARD,'Yerel Écorché modeli');}catch(_e){}
    return loadModel(MODEL_URL,'Écorché anatomik model');
  }
  const chooser=document.getElementById('glbFile');chooser?.addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    if(!file.name.toLowerCase().endsWith('.glb')){setStatus('Tek dosya olarak .glb seçin; harici doku kullanan .gltf desteklenmiyor.');return;}
    if(file.size>120*1024*1024){setStatus('Model 120 MB sınırını aşıyor. Daha küçük bir GLB seçin.');return;}
    const nextUrl=URL.createObjectURL(file);
    try{await loadModel(nextUrl,file.name)}finally{URL.revokeObjectURL(nextUrl);e.target.value=''}
  });
  controls.addEventListener('start',()=>{userInteracting=true;cameraTween++});controls.addEventListener('end',()=>{userInteracting=false});
  document.getElementById('resetView')?.addEventListener('click',()=>{cameraTween++;controls.reset();scene.rotation.y=0;requestDraw()});
  document.getElementById('toggleRotate')?.addEventListener('click',e=>{rotating=!rotating;e.currentTarget.setAttribute('aria-pressed',String(rotating));requestDraw()});
  // Story camera and layer state remain independent of the interactive lab.
  let currentScene=0;let storyTarget=new THREE.Vector3(0,.12,0);
  const storyLookAt=new THREE.Vector3(0,.12,0);
  const storyCameraGoal=new THREE.Vector3(4.4,1.2,8.8);
  const sceneTargets=[
   {camera:[4.4,1.2,8.8],target:[0,.12,0],part:'muscle',layers:[true,true,true]},
   {camera:[2.8,1.3,5.7],target:[0,.62,0],part:'spine',layers:[true,false,false]},
   {camera:[3.2,-.3,5.6],target:[0,-1.15,0],part:'pelvis',layers:[false,false,true]},
   {camera:[4.4,1.2,8.8],target:[0,.12,0],part:'muscle',layers:[true,true,true]}
  ];

  // Independent scene objects share immutable geometry/material resources, not UI state.
  let storyObjects=[],storyEntries=[];
  scene.children.filter(obj=>obj.isLight).forEach(obj=>storyScene.add(obj.clone()));
  function clearStoryModel(){storyObjects.forEach(obj=>storyScene.remove(obj));storyObjects=[];storyEntries=[]}
  function rebuildStoryModel(){
   if(!storyRenderer)return;
   clearStoryModel();
   const sourceEntries=importedRoot?importedMeshes:Object.entries(normalMaterials).flatMap(([part,entries])=>entries.map(([mesh,original])=>({mesh,part,original,emphasis:highlighted})));
   const entries=new Map(sourceEntries.map(item=>[item.mesh.uuid,item]));
   for(const source of (importedRoot?[importedRoot]:Object.values(groups))){
    const clone=source.clone(true),originals=[],copies=[];source.traverse(obj=>originals.push(obj));clone.traverse(obj=>copies.push(obj));
    originals.forEach((obj,i)=>{const item=entries.get(obj.uuid);if(item)storyEntries.push({...item,mesh:copies[i]})});
    storyObjects.push(clone);storyScene.add(clone);
   }
   updateStoryParts();updateStoryView();requestDraw();
  }
  function updateStoryParts(){
   const st=sceneTargets[currentScene];
   for(const item of storyEntries){const index=['spine','muscle','pelvis'].indexOf(item.part);item.mesh.visible=index<0||st.layers[index];item.mesh.material=item.part===st.part?item.emphasis:item.original}
  }
  function updateStoryView(){
   const st=sceneTargets[currentScene];
   storyTarget.set(...st.target);storyCameraGoal.set(...st.camera);
   if(importedRoot&&storyCamera){
    // Imported full-body models have different proportions from the fallback torso.
    // Frame the actual selected geometry instead of using procedural coordinates.
    scene.updateMatrixWorld(true);
    const box=new THREE.Box3();
    importedMeshes.filter(item=>currentScene===0||currentScene===3||item.part===st.part).forEach(item=>box.union(new THREE.Box3().setFromObject(item.mesh)));
    if(!box.isEmpty()){
     const size=box.getSize(new THREE.Vector3());box.getCenter(storyTarget);
     const distance=Math.max(size.y,size.x/Math.max(storyCamera.aspect,.1)) / (2*Math.tan(THREE.MathUtils.degToRad(storyCamera.fov/2)))*1.25;
     storyCameraGoal.copy(storyTarget).add(new THREE.Vector3(.38,.12,1).normalize().multiplyScalar(Math.max(distance,1.2)));
    }
   }
   if(reducedMotion&&storyCamera){storyCamera.position.copy(storyCameraGoal);storyLookAt.copy(storyTarget);storyCamera.lookAt(storyLookAt)}
  }
  window.addEventListener('yumeiho:scene',event=>{
   const index=event.detail?.index??0,st=sceneTargets[index];if(!st)return;
   currentScene=index;updateStoryView();
   updateStoryParts();requestDraw();
  });
  const loadObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){loadObserver.disconnect();loadDefault()}},{rootMargin:'600px'});
  loadObserver.observe(host);if(storyHost)loadObserver.observe(storyHost);
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);requestDraw()});resize.observe(host);


  let visible=false,storyVisible=false,frame=null,lastTime=0,disposed=false;
  const visibilityObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===host)visible=entry.isIntersecting;else storyVisible=entry.isIntersecting}requestDraw()},{threshold:.01});
  visibilityObserver.observe(host);if(storyHost&&storyRenderer)visibilityObserver.observe(storyHost);
  function requestDraw(){if(!disposed&&frame===null&&!document.hidden&&(visible||storyVisible))frame=requestAnimationFrame(draw)}
  function draw(now){
   frame=null;if(document.hidden||(!visible&&!storyVisible)||disposed)return;
   const dt=Math.min((now-lastTime)/1000||.016,.05);lastTime=now;
   const auto=rotating&&!reducedMotion&&!userInteracting&&visible;
   if(auto){scene.rotation.y+=dt*.28;rimLight.intensity=1.6+Math.sin(now*.0006)*.18;}else rimLight.intensity=1.6;
   const damping=visible?controls.update():false;
   if(visible){
    const started=diagnostics?performance.now():0;
    renderer.render(scene,camera);
    if(diagnostics){renderCount++;renderCpuMs+=performance.now()-started;host.dataset.renderCount=String(renderCount);host.dataset.renderCpuMs=renderCpuMs.toFixed(3);host.dataset.lastRender=now.toFixed(3);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.gpuGeometries=String(renderer.info.memory.geometries);host.dataset.gpuTextures=String(renderer.info.memory.textures);host.dataset.gpuPrograms=String(renderer.info.programs?.length||0);}
   }
   let moving=false;
   if(storyVisible&&storyRenderer&&storyCamera){
    moving=!reducedMotion&&(storyCamera.position.distanceToSquared(storyCameraGoal)>.00001||storyLookAt.distanceToSquared(storyTarget)>.00001);
    if(moving){storyCamera.position.lerp(storyCameraGoal,Math.min(1,dt*4));storyLookAt.lerp(storyTarget,Math.min(1,dt*4));storyCamera.lookAt(storyLookAt)}
    storyRenderer.render(storyScene,storyCamera);storyHost.closest('.cinema-stage').setAttribute('data-webgl-ready','true');
   }
   if(auto||damping||moving)requestDraw();
  }
  controls.addEventListener('change',requestDraw);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null}else requestDraw()});
  motionPreference.addEventListener('change',event=>{reducedMotion=event.matches||document.documentElement.dataset.motion==='reduced';controls.enableDamping=!reducedMotion;if(reducedMotion&&storyCamera){storyCamera.position.copy(storyCameraGoal);storyLookAt.copy(storyTarget);storyCamera.lookAt(storyLookAt)}requestDraw()});
  window.addEventListener('yumeiho:motion',event=>{
   reducedMotion=event.detail;controls.enableDamping=!reducedMotion;
   document.getElementById('toggleRotate').disabled=reducedMotion;
   if(reducedMotion){rotating=false;document.getElementById('toggleRotate').setAttribute('aria-pressed','false');if(storyCamera){storyCamera.position.copy(storyCameraGoal);storyLookAt.copy(storyTarget);storyCamera.lookAt(storyLookAt)}}
   requestDraw();
  });
  controls.enableDamping=!reducedMotion;
  document.getElementById('toggleRotate').disabled=reducedMotion;
  renderer.domElement.addEventListener('webglcontextlost' ,event=>{event.preventDefault();host.classList.remove('ready');setStatus('3D bağlamı kesildi; temsili görsel gösteriliyor.')});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{host.classList.add('ready');setStatus('3D görünüm yeniden hazır.');requestDraw()});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;if(frame!==null)cancelAnimationFrame(frame);visibilityObserver.disconnect();loadObserver.disconnect();resize.disconnect();storyResize?.disconnect();controls.dispose();releaseImported();renderer.dispose();storyRenderer?.dispose()});
  const deepdive=document.querySelector('.anatomy-deepdive');
  deepdive?.addEventListener('toggle',()=>{if(deepdive.open)openStory();else closeStory()});
  if(deepdive?.open)openStory();
  host.classList.add('ready');
  setStatus('Temsili 3D model hazır; anatomi bölümüne geldiğinizde ayrıntılı model yüklenir.');
 }catch(err){console.warn('3D sahne yüklenemedi:',err);document.getElementById('modelStatus').textContent='3D desteklenmiyor; görsel gösteriliyor.';}
}
