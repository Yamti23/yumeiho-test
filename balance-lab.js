const canvas=document.getElementById('balanceCanvas');
const ctx=canvas.getContext('2d');
const form=document.getElementById('balanceForm');
const left=document.getElementById('leftLoad'),right=document.getElementById('rightLoad'),arm=document.getElementById('leverArm');
const number=value=>value.toLocaleString('tr-TR',{minimumFractionDigits:1,maximumFractionDigits:1});
function draw(){
 const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio,2);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
 const l=Number(left.value),r=Number(right.value),distance=Number(arm.value)/100;
 const lm=l*9.81*distance,rm=r*9.81*distance,net=rm-lm;
 document.getElementById('leftValue').value=l+' kg';document.getElementById('rightValue').value=r+' kg';document.getElementById('armValue').value=arm.value+' cm';
 document.getElementById('leftMoment').textContent=number(lm)+' N·m';document.getElementById('rightMoment').textContent=number(rm)+' N·m';document.getElementById('netMoment').textContent=number(Math.abs(net))+' N·m';
 const message=Math.abs(net)<.01?'Yükler eşit. Net moment sıfır.':(net>0?'Sağ':'Sol')+' yükün momenti daha büyük. Net moment '+number(Math.abs(net))+' N·m.';
 document.getElementById('balanceText').textContent=message;canvas.setAttribute('aria-label',message);
 const cx=w/2,cy=h*.48,span=Math.min(w*.35,w*.35*distance/.6),gold='#dfbb8d',muted='#998c7d';
 ctx.lineWidth=1;ctx.strokeStyle='#d4ae823b';ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(cx,25);ctx.lineTo(cx,h-35);ctx.stroke();ctx.setLineDash([]);
 ctx.lineWidth=5;ctx.strokeStyle=gold;ctx.beginPath();ctx.moveTo(w*.09,cy);ctx.lineTo(w*.91,cy);ctx.stroke();
 ctx.fillStyle=muted;ctx.beginPath();ctx.moveTo(cx,cy+8);ctx.lineTo(cx-18,cy+45);ctx.lineTo(cx+18,cy+45);ctx.closePath();ctx.fill();
 function force(x,mass,label){const len=28+mass/20*(h*.27);ctx.strokeStyle=gold;ctx.fillStyle=gold;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy-len);ctx.lineTo(x,cy-12);ctx.stroke();ctx.beginPath();ctx.moveTo(x,cy-7);ctx.lineTo(x-6,cy-18);ctx.lineTo(x+6,cy-18);ctx.fill();ctx.font='12px monospace';ctx.textAlign='center';ctx.fillText(label+' '+mass+' kg',label==='SOL'?w*.2:w*.8,cy-len-12)}
 force(cx-span,l,'SOL');force(cx+span,r,'SAĞ');
 ctx.textAlign='center';ctx.font='11px monospace';ctx.fillStyle=muted;ctx.fillText('SABİT DESTEK',cx,cy+68);
 ctx.fillText('DİK UZAKLIK: '+arm.value+' cm',cx,cy+91);
 ctx.font='15px monospace';ctx.fillStyle=gold;ctx.fillText(Math.abs(net)<.01?'DENGE':(net>0?'SAĞ MOMENT →':'← SOL MOMENT'),cx,h-25);
}
form.addEventListener('input',draw);form.addEventListener('reset',()=>requestAnimationFrame(draw));
const resize=new ResizeObserver(draw);resize.observe(canvas);draw();
window.addEventListener('pagehide',event=>{if(!event.persisted)resize.disconnect()});
