'use strict';
(() => {
  const progress = document.getElementById('lip-progress');
  const animate = document.getElementById('animate-lips');
  const stateLabel = document.getElementById('lip-state');
  const outer = document.getElementById('lip-outer');
  const opening = document.getElementById('lip-opening');
  const highlight = document.getElementById('lip-highlight');
  let artAnimation = null;
  const keys = [{p:0,w:142,a:3,h:23},{p:28,w:145,a:42,h:46},{p:62,w:83,a:54,h:64},{p:100,w:142,a:2,h:24}];
  function drawLips(value) {
    const index = keys.findIndex((k,i) => i < keys.length-1 && value <= keys[i+1].p);
    const i = index < 0 ? 2 : index;
    const a = keys[i], b = keys[i+1], f=(value-a.p)/(b.p-a.p), t=f*f*(3-2*f);
    const w=a.w+(b.w-a.w)*t, gap=a.a+(b.a-a.a)*t, h=a.h+(b.h-a.h)*t;
    const l=300-w,r=300+w,y=225;
    outer.setAttribute('d',`M${l} ${y} C${l+w*.4} ${y-12} 264 ${y-h} 278 ${y-h*.82} Q300 ${y-h*.55} 322 ${y-h*.82} C336 ${y-h} ${r-w*.4} ${y-12} ${r} ${y} C${r-w*.38} ${y+15} 348 ${y+h*1.22} 300 ${y+h*1.25} C252 ${y+h*1.22} ${l+w*.38} ${y+15} ${l} ${y} Z`);
    opening.setAttribute('d',`M${l+10} ${y} Q300 ${y-gap} ${r-10} ${y} Q300 ${y+gap*1.15} ${l+10} ${y} Z`);
    highlight.setAttribute('d',`M${300-w*.42} ${y+h*.85} Q300 ${y+h*1.22} ${300+w*.42} ${y+h*.85}`);
    const label=value<12||value>91?'Closed':value<45?'Open':value<78?'Rounded':'Closing';
    stateLabel.textContent=label;
    progress.setAttribute('aria-valuetext',`${label} lip shape`);
  }
  function stopArt() { if(artAnimation!==null) cancelAnimationFrame(artAnimation); artAnimation=null;animate.textContent='Animate';animate.setAttribute('aria-label','Animate lip illustration'); }
  progress.addEventListener('input',()=>{stopArt();drawLips(Number(progress.value));});
  animate.addEventListener('click',()=>{
    if(artAnimation!==null){stopArt();return;}
    const start=performance.now();animate.textContent='Pause';animate.setAttribute('aria-label','Pause lip illustration');
    function tick(now){const v=Math.min(100,(now-start)/60);progress.value=String(v);drawLips(v);if(v<100){artAnimation=requestAnimationFrame(tick);}else{stopArt();}}
    artAnimation=requestAnimationFrame(tick);
  });
  drawLips(Number(progress.value));
  const wordSlider=document.getElementById('word-progress'),wordButton=document.getElementById('play-word'),wordImage=document.getElementById('word-active'),wordOutput=document.getElementById('word-frame');
  const base=wordImage.getAttribute('src').replace(/nobboi-\d+\.png$/,'');
  const frames=Array.from({length:18},(_,i)=>`${base}nobboi-${String(i+54).padStart(4,'0')}.png`);
  let timer=null;
  function stopWord(){if(timer!==null)clearInterval(timer);timer=null;wordButton.textContent='Play sequence';}
  function showFrame(index){wordSlider.value=String(index);wordImage.src=frames[index];const number=String(index+54).padStart(4,'0');wordImage.alt=`Nobboi, original frame ${number}`;wordOutput.textContent=`Frame ${number} · ${index+1} of 18`;wordSlider.setAttribute('aria-valuetext',`Frame ${number}, ${index+1} of 18`);document.querySelectorAll('.keyframe').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===index)));}
  wordSlider.addEventListener('input',()=>{stopWord();showFrame(Number(wordSlider.value));});
  document.querySelectorAll('.keyframe').forEach(b=>b.addEventListener('click',()=>{stopWord();showFrame(Number(b.dataset.frame));}));
  let preloaded=false;
  wordButton.addEventListener('click',()=>{if(timer!==null){stopWord();return;}if(!preloaded){frames.forEach(src=>{const im=new Image();im.src=src;});preloaded=true;}showFrame(0);wordButton.textContent='Pause sequence';timer=setInterval(()=>{const i=Number(wordSlider.value)+1;if(i>=frames.length){stopWord();return;}showFrame(i);},145);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopArt();stopWord();}});
  showFrame(Number(wordSlider.value));
})();
