const menuToggle=document.getElementById('menuToggle');
const mobileMenu=document.getElementById('mobileMenu');
const compactMenu=matchMedia('(max-width: 1250px)');
function setMenu(open,returnFocus=false){
 mobileMenu.classList.toggle('open',open);
 menuToggle.setAttribute('aria-expanded',String(open));
 menuToggle.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');
 if(open)mobileMenu.querySelector('a').focus();
 else if(returnFocus)menuToggle.focus();
}
menuToggle.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileMenu.classList.contains('open'))setMenu(false,true)});
document.addEventListener('click',event=>{if(!mobileMenu.contains(event.target)&&!menuToggle.contains(event.target))setMenu(false)});
document.addEventListener('focusin',event=>{if(!mobileMenu.contains(event.target)&&!menuToggle.contains(event.target))setMenu(false)});
compactMenu.addEventListener('change',()=>setMenu(false));
const sectionIds=[...document.querySelectorAll('.side-index a')].map(link=>link.hash.slice(1));
const sectionLinks=[...document.querySelectorAll('.desktop-nav a,.mobile-menu a,.side-index a')];
function updateNavigation(){
 let index=0;
 sectionIds.forEach((id,i)=>{if(document.getElementById(id).getBoundingClientRect().top<=innerHeight*.35)index=i});
 const atEnd=scrollY+innerHeight>=document.documentElement.scrollHeight-4;
 if(atEnd)index=sectionIds.length-1;
 sectionLinks.forEach(link=>{const active=link.hash==='#'+sectionIds[index];link.classList.toggle('active',active);link.classList.toggle('selected',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
 document.getElementById('sectionCounter').textContent=String(index+1).padStart(2,'0')+' / '+String(sectionIds.length).padStart(2,'0');
 document.querySelector('.topbar').classList.toggle('is-scrolled',scrollY>40);
}
const parts={spine:{title:'Omurga',index:'02 / 03',description:'Omurga gövdeye destek olur; hareket, denge ve sinir sisteminin korunması açısından temel bir anatomik yapıdır.'},muscle:{title:'Kaslar',index:'03 / 03',description:'Kaslar eklemler boyunca hareket oluşturur ve postürün sürdürülmesine katkı sağlar. Kas grupları birlikte çalışır.'},pelvis:{title:'Pelvis',index:'01 / 03',description:'Pelvis gövde ile alt ekstremiteler arasında önemli bir anatomik bağlantıdır; ağırlık aktarımı ve hareketin koordinasyonunda rol oynar.'}};
const partButtons=document.querySelectorAll('[data-part]');
partButtons.forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.part;window.dispatchEvent(new CustomEvent('yumeiho:part',{detail:key}));document.getElementById('partTitle').textContent=parts[key].title;document.getElementById('partDescription').textContent=parts[key].description;document.getElementById('partCounter').textContent=parts[key].index;partButtons.forEach(b=>{const selected=b.dataset.part===key;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});}));
document.documentElement.classList.add('motion-ready');
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const progress=document.getElementById('progress');let ticking=false;function updateScroll(){let max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?scrollY/max:0)+')';updateNavigation();ticking=false;}window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true;}},{passive:true});window.addEventListener('resize',updateScroll);updateScroll();
document.getElementById('year').textContent=new Date().getFullYear();

// ScrollTrigger cinematic choreography; page remains functional if GSAP CDN is unavailable.
let motionMedia;
function setupMotion(){
 motionMedia?.revert();
 if(document.documentElement.dataset.motion==='reduced')return;
 if(!window.gsap||!window.ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 // matchMedia reverts inline transforms when reduced motion changes at runtime.
 const media=gsap.matchMedia();motionMedia=media;
 media.add('(prefers-reduced-motion: no-preference)',()=>{
  gsap.to('.hero-figure img',{yPercent:12,scale:1.08,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-copy',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  document.querySelectorAll('.session-heading h2,.anatomy-intro h2,.academy-head h2').forEach(title=>gsap.fromTo(title,{y:14},{y:0,ease:'none',scrollTrigger:{trigger:title,start:'top 90%',end:'top 35%',scrub:.6}}));
  document.querySelectorAll('.method-card img').forEach(img=>gsap.fromTo(img,{scale:1.08},{scale:1,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
 });
}
if(document.readyState==='complete')setupMotion();else window.addEventListener('load',setupMotion,{once:true});

// V5: scroll chapters drive both the cinematic panel and the real 3D explorer.
(function setupAnatomyStory(){
 const story=document.getElementById('anatomyStory');if(!story)return;
 const steps=[...story.querySelectorAll('.cinema-chapter')];
 const stage=story.querySelector('.cinema-stage');
 const counter=document.getElementById('cinemaCounter');
 const bar=document.getElementById('cinemaProgress');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let last=-1;
 function choose(i){if(i===last)return;last=i;stage.dataset.scene=String(i);
  counter.textContent=String(i+1).padStart(2,'0')+' / 04';
  steps.forEach((el,k)=>el.classList.toggle('is-active',k===i));
  window.dispatchEvent(new CustomEvent('yumeiho:scene',{detail:{index:i,reduced}}));
 }
 function sync(){let index=0;const marker=innerHeight*.52;
  steps.forEach((el,i)=>{if(el.getBoundingClientRect().top<marker)index=i});choose(index);
  const r=story.getBoundingClientRect(),range=Math.max(1,r.height-innerHeight);
  bar.style.width=(Math.max(0,Math.min(1,-r.top/range))*100).toFixed(1)+'%';
 }
 let pending=false;function onScroll(){if(pending)return;pending=true;requestAnimationFrame(()=>{sync();pending=false})}
 window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);sync();
})();

// Defer Three.js, its decoders and both GPU contexts until a 3D surface is near.
(function prepareAnatomy(){
 let started=false;
 function start(){
  if(started)return;started=true;
  import('./anatomy3d.js?v=10.3').catch(error=>{
   console.warn('3D bağımlılıkları yüklenemedi:',error);
   document.getElementById('modelStatus').textContent='3D yüklenemedi. Temsili görsel ve bölge düğmeleri kullanılabilir. Bağlantınızı kontrol edip sayfayı yenileyin.';
   document.querySelectorAll('#resetView,#toggleRotate,#loadReferenceModel,#glbFile').forEach(control=>control.disabled=true);
  });
 }
 const nearby=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){nearby.disconnect();start()}},{rootMargin:'600px'});
 [document.getElementById('anatomyCanvas'),document.getElementById('cinema3d')].filter(Boolean).forEach(host=>nearby.observe(host));
})();

// V9: anchored disclosures and contextual inquiry, without submitting data.
function revealAnchor(){const target=document.getElementById(location.hash.slice(1));if(!target)return;for(let el=target;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;}
window.addEventListener('hashchange',revealAnchor);revealAnchor();
const inquiryEmail=document.getElementById('inquiryEmail');
function chooseInquiry(value){
 const education=value==='academy';
 document.querySelectorAll('[name="inquiry"]').forEach(input=>input.checked=input.value===value);
 const subject=education?'Yumeiho Eğitim Bilgisi':'Yumeiho Seans Bilgisi';
 const body=education?'Merhaba, Yumeiho eğitimi hakkında bilgi almak istiyorum. Katılım koşulları, Dan seviyesi, takvim, yer ve ücret bilgilerini paylaşabilir misiniz?':'Merhaba, bireysel Yumeiho seansı hakkında bilgi almak istiyorum. Uygulama yeri, süre, ücret ve hazırlık bilgilerini paylaşabilir misiniz?';
 inquiryEmail.href='mailto:aligokmenduzgun@gmail.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 inquiryEmail.innerHTML=(education?'Eğitim Bilgisi İste':'Seans Bilgisi İste')+' <span aria-hidden="true">↗</span>';
 document.getElementById('inquiryHint').textContent=education?'Katılım koşulları, program, yer ve ücret bilgilerini sorabilirsiniz.':'Seans yeri, süre, ücret ve hazırlık bilgilerini sorabilirsiniz.';
}
document.querySelectorAll('[name="inquiry"]').forEach(input=>input.addEventListener('change',()=>chooseInquiry(input.value)));
document.querySelectorAll('[data-inquiry]').forEach(link=>link.addEventListener('click',()=>chooseInquiry(link.dataset.inquiry)));
document.querySelectorAll('.academy-item a').forEach(link=>link.addEventListener('click',()=>chooseInquiry('academy')));
try{const saved=sessionStorage.getItem('yumeiho-inquiry');chooseInquiry(saved==='academy'?'academy':'session');sessionStorage.removeItem('yumeiho-inquiry')}catch(e){chooseInquiry('session')}
const insights={pelvis:'Bağlantının merkezi. Pelvis, gövde ile bacaklar arasında yük aktarımına katılır.',spine:'Gövdenin desteği. Omurga, farklı yönlerde harekete katılır ve sinir yapılarını korur.',muscle:'Hareketin iş birliği. Kaslar, eklemler boyunca birlikte çalışarak hareket ve duruşa katkı verir.'};
document.querySelectorAll('[data-part]').forEach(button=>button.addEventListener('click',()=>document.getElementById('partInsight').textContent=insights[button.dataset.part]));
document.querySelector('.anatomy-deepdive')?.addEventListener('toggle',()=>{window.dispatchEvent(new Event('resize'));window.ScrollTrigger?.refresh();});

// Respect native scroll restoration; offer an exact return after a contextual inquiry.
let inquiryOrigin=null;
document.querySelectorAll('[data-inquiry],.academy-item a').forEach(link=>link.addEventListener('click',()=>{
 inquiryOrigin={url:location.pathname+location.search+'#'+(link.closest('section[id]')?.id||'top'),y:scrollY};
 const back=document.querySelector('.return-to-flow');back.hidden=false;
 back.textContent=link.closest('#academy')?'Eğitim akışına dön ↑':'Seans akışına dön ↑';
}));
document.querySelector('.return-to-flow').addEventListener('click',()=>{
 if(!inquiryOrigin)return;history.replaceState(history.state,'',inquiryOrigin.url);
 window.scrollTo({top:inquiryOrigin.y,behavior:document.documentElement.dataset.motion==='reduced'?'auto':'smooth'});
});
const motionControl=document.getElementById('reduceMotion');
const osMotion=matchMedia('(prefers-reduced-motion: reduce)');
function syncMotion(){
 const reduced=motionControl.checked||osMotion.matches;
 document.documentElement.dataset.motion=reduced?'reduced':'full';
 window.dispatchEvent(new CustomEvent('yumeiho:motion',{detail:reduced}));setupMotion();
}
motionControl.checked=document.documentElement.dataset.motion==='reduced'||osMotion.matches;
motionControl.addEventListener('change',()=>{try{sessionStorage.setItem('yumeiho-motion',motionControl.checked?'reduced':'full')}catch(e){}syncMotion()});
osMotion.addEventListener('change',()=>{if(osMotion.matches)motionControl.checked=true;syncMotion()});syncMotion();
// A short visual acknowledgement, with no audio or device vibration.
document.querySelectorAll('.button,.part-tabs button').forEach(button=>{
 const feedback=()=>{button.classList.remove('tap-feedback');void button.offsetWidth;button.classList.add('tap-feedback')};
 button.addEventListener('pointerdown',feedback);button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')feedback()});
 button.addEventListener('animationend',()=>button.classList.remove('tap-feedback'));
});
