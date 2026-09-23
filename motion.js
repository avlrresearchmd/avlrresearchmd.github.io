'use strict';
(() => {
  const progress = document.getElementById('lip-progress');
  const animate = document.getElementById('animate-lips');
  const stateLabel = document.getElementById('lip-state');
  const outer = document.getElementById('lip-outer');
  const opening = document.getElementById('lip-opening');
  const highlight = document.getElementById('lip-highlight');
  const sound = document.getElementById('lip-sound');
  const soundExample = document.getElementById('lip-sound-example');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let artAnimation = null, lastTime = null, position = 0;
  let userPaused = reducedMotion.matches, inView = true;
  const keys = [
    {p:0,w:142,a:0.5,h:23,label:'Closed',sound:'/m/ /b/ /p/',example:'Lips together'},
    {p:20,w:154,a:17,h:32,label:'Spread',sound:'/i/',example:'“ee” · slightly open, spread lips'},
    {p:40,w:136,a:78,h:78,label:'Open',sound:'/a/',example:'“ah” · open, unrounded lips'},
    {p:60,w:91,a:69,h:76,label:'Rounded',sound:'/o/',example:'“oh” · rounded, open lips'},
    {p:80,w:67,a:36,h:50,label:'Rounded',sound:'/u/',example:'“oo” · a smaller rounded opening'},
    {p:100,w:142,a:0.5,h:23,label:'Closed',sound:'/m/ /b/ /p/',example:'Lips together'}
  ];
  function drawLips(value) {
    const index = keys.findIndex((k,i) => i < keys.length-1 && value < keys[i+1].p);
    const i = index < 0 ? 4 : index;
    const a = keys[i], b = keys[i+1], f=(value-a.p)/(b.p-a.p);
    const transition=Math.max(0,Math.min(1,(f-.55)/.45)),t=transition*transition*(3-2*transition);
    const w=a.w+(b.w-a.w)*t, gap=a.a+(b.a-a.a)*t, h=a.h+(b.h-a.h)*t;
    const l=300-w,r=300+w,y=225;
    outer.setAttribute('d',`M${l} ${y} C${l+w*.4} ${y-12} 264 ${y-h} 278 ${y-h*.82} Q300 ${y-h*.55} 322 ${y-h*.82} C336 ${y-h} ${r-w*.4} ${y-12} ${r} ${y} C${r-w*.38} ${y+15} 348 ${y+h*1.22} 300 ${y+h*1.25} C252 ${y+h*1.22} ${l+w*.38} ${y+15} ${l} ${y} Z`);
    opening.setAttribute('d',`M${l+10} ${y} Q300 ${y-gap} ${r-10} ${y} Q300 ${y+gap*1.15} ${l+10} ${y} Z`);
    highlight.setAttribute('d',`M${300-w*.42} ${y+h*.85} Q300 ${y+h*1.22} ${300+w*.42} ${y+h*.85}`);
    const pose=value===100?b:a, moving=value<100&&transition>0&&transition<1;
    stateLabel.textContent=moving?'Moving':pose.label;
    sound.textContent=moving?'Transition':pose.sound;
    soundExample.textContent=moving?`${a.label} to ${b.label.toLowerCase()}`:pose.example;
    progress.setAttribute('aria-valuetext',moving?'Transition between illustrative lip shapes':`${pose.label} lips, illustrative sounds ${pose.sound}`);
  }
  function stopArt() {
    if(artAnimation!==null) cancelAnimationFrame(artAnimation);
    artAnimation=null;lastTime=null;
    animate.textContent='Play';animate.setAttribute('aria-label','Play lip illustration');
  }
  function startArt() {
    if(artAnimation!==null || userPaused || document.hidden || !inView)return;
    animate.textContent='Pause';animate.setAttribute('aria-label','Pause lip illustration');
    function tick(now){
      if(lastTime!==null)position=(position+(now-lastTime)/150)%100;
      lastTime=now;progress.value=String(position);drawLips(position);
      artAnimation=requestAnimationFrame(tick);
    }
    artAnimation=requestAnimationFrame(tick);
  }
  progress.addEventListener('input',()=>{userPaused=true;stopArt();position=Number(progress.value);drawLips(position);});
  animate.addEventListener('click',()=>{
    if(artAnimation!==null){userPaused=true;stopArt();}
    else{userPaused=false;startArt();}
  });
  drawLips(0);startArt();
  if(reducedMotion.matches)stopArt();
  reducedMotion.addEventListener('change',e=>{if(e.matches){userPaused=true;stopArt();}});
  const visibilityObserver=new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;
    if(inView)startArt();else stopArt();
  },{threshold:0.1});
  visibilityObserver.observe(document.getElementById('lip-illustration'));
  const wordSlider=document.getElementById('word-progress'),wordButton=document.getElementById('play-word'),wordImage=document.getElementById('word-active'),wordOutput=document.getElementById('word-frame');
  const base=wordImage.getAttribute('src').replace(/s319-tinixo-\d+\.png$/,'');
  const frames=Array.from({length:23},(_,i)=>`${base}s319-tinixo-${String(i+59).padStart(4,'0')}.png`);
  let timer=null;
  function stopWord(){if(timer!==null)clearInterval(timer);timer=null;wordButton.textContent='Play sequence';}
  function showFrame(index){wordSlider.value=String(index);wordImage.src=frames[index];const number=String(index+59).padStart(4,'0');wordImage.alt=`Tinixo, original frame ${number}`;wordOutput.textContent=`Frame ${number} · ${index+1} of 23`;wordSlider.setAttribute('aria-valuetext',`Frame ${number}, ${index+1} of 23`);document.querySelectorAll('.keyframe').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.frame)===index)));}
  wordSlider.addEventListener('input',()=>{stopWord();showFrame(Number(wordSlider.value));});
  document.querySelectorAll('.keyframe').forEach(b=>b.addEventListener('click',()=>{stopWord();showFrame(Number(b.dataset.frame));}));
  let preloaded=false;
  wordButton.addEventListener('click',()=>{if(timer!==null){stopWord();return;}if(!preloaded){frames.forEach(src=>{const im=new Image();im.src=src;});preloaded=true;}showFrame(0);wordButton.textContent='Pause sequence';timer=setInterval(()=>{const i=Number(wordSlider.value)+1;if(i>=frames.length){stopWord();return;}showFrame(i);},145);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopArt();stopWord();}else{startArt();}});
  showFrame(Number(wordSlider.value));
})();
