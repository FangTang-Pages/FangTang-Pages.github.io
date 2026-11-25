(() => {
  'use strict';
  const paths = {ne:'M6 18 18 6M6 6h12v12',left:'M20 12H4m7-7-7 7 7 7',right:'M4 12h16m-7-7 7 7-7 7',close:'m6 6 12 12M18 6 6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5'};
  const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${paths[n]}"/></svg>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projects = window.PORTFOLIO_PROJECTS || [];
  const others = window.OTHER_PROJECTS || [];
  const selected = {...window.SELECTED_CORE, 'lumi-city':window.SELECTED_LUMI};
  const gallery = [];
  function figure(p, context, eager=false, cls='') {
    const i=gallery.push({...p,context})-1;
    return `<figure class="selected-figure ${cls}"><button class="image-trigger" data-image-index="${i}" aria-label="放大：${esc(p.alt)}"><img class="${p.fit==='contain'?'fit-contain':''}" src="${esc(p.src)}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="image-enlarge" aria-hidden="true">${icon('plus')}</span></button>${p.caption?`<figcaption>${esc(p.caption)}</figcaption>`:''}</figure>`;
  }

  const grid=document.querySelector('#project-grid');
  if(grid) {
    const entries=projects.map(p=>({id:p.id,title:p.title,category:p.category,number:p.number,href:`project.html?id=${p.id}`,image:`assets/${p.id}-cover.webp`,alt:p.images[0][0]}));
    entries.push({id:'other',title:'Other Explorations',category:'其他项目 / 更多设计探索',number:'06',href:'other.html',image:others[0]?.images[0]?.src || 'assets/ore-rebirth-cover.webp',alt:'其他项目：模块、场景与形态探索'});
    grid.innerHTML=entries.map((p,i)=>`<article class="motion-card" data-card="${i}"><a href="${p.href}" aria-label="查看 ${esc(p.title)} 精选作品"><div class="motion-media" ${i===0?'id="lumi-slot"':''}><img src="${esc(p.image)}" alt="${esc(p.alt)}" width="800" height="600" decoding="async" fetchpriority="${i<3?'high':'auto'}" loading="eager"><div class="card-face"><span class="card-index" aria-hidden="true">${p.number}</span><h2>${esc(p.title)}</h2><span class="entry-open" aria-hidden="true">${icon('ne')}</span></div></div></a></article>`).join('');
    setupOpening();
  }

  const target=document.querySelector('#project-content');
  if(target) {
    const id=new URLSearchParams(location.search).get('id') || 'lumi-city';
    const p=projects.find(p=>p.id===id), s=selected[id];
    if(!p || !s) {
      target.innerHTML=`<section class="wrap empty"><h1>暂未找到这个项目</h1><p>请回到作品目录继续浏览。</p><a class="text-link" href="index.html?view=work">${icon('left')} 返回作品目录</a></section>`;
    } else {
      document.title=`${p.title} · 方星月作品集`;
      document.querySelector('meta[name="description"]').content=p.intro;
      const next=projects[projects.indexOf(p)+1];
      target.innerHTML=`<section class="selected-heading wrap"><a class="back-link" href="index.html?view=work">${icon('left')} 返回作品目录</a><div class="selected-title"><span class="project-number">${p.number}</span><div><p class="eyebrow">SELECTED PROJECT / 精选作品</p><h1>${esc(p.title)}</h1></div></div><div class="selected-summary"><div><h2>${esc(s.subtitle || p.name)}</h2><p>${esc(p.intro)}</p></div><div class="project-tags">${(s.tags || []).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div></section>
      <div class="wrap selected-hero">${figure(s.hero,p.title,true)}</div>
      <div class="selected-chapters wrap">${s.sections.map((section,i)=>`<section class="design-chapter" id="chapter-${i+1}"><div class="chapter-copy"><div><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${esc((section.label || 'DESIGN PROCESS').replace(/^\d+\s*\/\s*/,''))}</span><h2>${esc(section.title)}</h2></div><p>${esc(section.text)}</p></div><div class="chapter-images ${section.images.length===1?'single-image':''}">${section.images.map(im=>figure(im,p.title)).join('')}</div></section>`).join('')}</div>
      ${id==='lumi-city'?`<section class="wrap detail-film" id="project-film"><div class="chapter-copy"><div><span class="eyebrow">FILM / 项目影片</span><h2>设计如何成为体验</h2></div><p>从实验与结构探索，到场景中的光影表达。</p></div><video controls playsinline preload="none" poster="assets/lumi-film-poster.webp" aria-label="LUMI CITY 完整项目影片"><source src="assets/lumi-film.mp4" type="video/mp4">请使用支持 MP4 的浏览器。</video></section>`:''}
      <section class="download-section wrap"><div><p class="eyebrow">THE COMPLETE PROJECT</p><h2>继续了解完整设计过程</h2><p>研究背景、更多推演与完整图纸，收录于项目作品集。</p></div><a class="download-button" href="documents/${esc(p.pdf)}" download>${icon('download')} 下载完整作品集 PDF</a></section>
      <section class="next-project wrap"><span class="eyebrow">NEXT / 继续浏览</span><a href="${next?`project.html?id=${next.id}`:'other.html'}"><h2>${next?esc(next.title):'其他项目'}</h2>${icon('ne')}</a><a class="back-link" href="index.html?view=work">${icon('left')} 返回作品目录</a></section>`;
    }
  }
  const otherTarget=document.querySelector('#other-projects');
  if(otherTarget) {
    otherTarget.innerHTML=others.map((p,i)=>`<article class="other-entry"><div class="other-images">${p.images.map(im=>figure(im,p.title)).join('')}</div><div class="other-copy"><span class="eyebrow">${String(i+1).padStart(2,'0')} / EXPLORATION</span><h2>${esc(p.title)}</h2>${p.subtitle?`<p class="other-subtitle">${esc(p.subtitle)}</p>`:''}<p>${esc(p.text)}</p><div class="other-tags">${(p.tags || []).map(t=>`<span>${esc(t)}</span>`).join('')}</div></div></article>`).join('');
  }
  if(gallery.length) setupLightbox(gallery);

  function setupOpening() {
    history.scrollRestoration='manual';
    const entryUrl=new URL(location.href),navigation=performance.getEntriesByType('navigation')[0]?.type;
    const entryWork=entryUrl.searchParams.get('view')==='work'||(navigation==='back_forward'&&history.state?.portfolioView==='work');
    entryUrl.searchParams.delete('view');entryUrl.searchParams.delete('intro');
    if(entryUrl.hash==='#work')entryUrl.hash='';
    history.replaceState({...history.state,portfolioView:entryWork?'work':'intro'},'',entryUrl);
    const intro=document.querySelector('.motion-intro'),stage=intro.querySelector('.motion-stage');
    const directory=intro.querySelector('.motion-directory'),film=intro.querySelector('.hero-film');
    const video=intro.querySelector('#opening-video'),copy=intro.querySelector('.hero-copy');
    const slot=intro.querySelector('#lumi-slot'),mask=intro.querySelector('.opening-mask');
    const maskType=mask.querySelector('#opening-type'),maskText=mask.querySelector('text'),maskSolid=mask.querySelector('#opening-solid');
    const cards=[...intro.querySelectorAll('.motion-card')];
    const dockedFace=slot.querySelector('.card-face').cloneNode(true);dockedFace.classList.add('docked-face');film.append(dockedFace);
    const REVEAL=850,HOLD=300,DOCK=1450,TOTAL=REVEAL+HOLD+DOCK;
    let state=entryWork?'done':'idle',elapsed=entryWork?TOTAL:0,size,frame=0,lastTick=null,focusDirectory=false,touch=null,initialized=false;
    const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>v*v*(3-2*v),mix=(a,b,t)=>a+(b-a)*t;
    function lock(){document.documentElement.classList.add('intro-sequence-locked');}
    function unlock(){document.documentElement.classList.remove('intro-sequence-locked');}
    function paint(){
      if(!size)return;
      const revealing=ease(clamp(elapsed/REVEAL)),docking=clamp((elapsed-REVEAL-HOLD)/DOCK),t=ease(docking);
      mask.style.transform=elapsed>=REVEAL?`translate3d(0,${-size.maskH*1.06}px,0)`:`perspective(1600px) translate3d(0,${-size.maskH*1.06*revealing}px,0) rotateX(${revealing*55}deg)`;
      mask.style.visibility=elapsed>=REVEAL?'hidden':'visible';
      mask.style.opacity=1-ease(clamp((revealing-.92)/.08));
      film.style.transform=`translate3d(${mix(0,size.x,t)}px,${mix(0,size.y,t)}px,0)`;
      film.style.width=`${mix(size.w,size.tw,t)}px`;film.style.height=`${mix(size.h,size.th,t)}px`;
      film.style.borderColor=`rgba(162,139,127,${t})`;film.style.borderRadius=`${size.radius*t}px`;
      film.style.setProperty('--card-reveal',ease(clamp((docking-.72)/.28)));
      const fade=1-ease(clamp(elapsed/360));copy.style.opacity=fade;copy.inert=state!=='idle';copy.style.pointerEvents=state==='idle'?'auto':'none';
      directory.style.setProperty('--reveal',ease(clamp((docking-.06)/.50)));
      cards.forEach((card,i)=>{const reveal=ease(clamp((docking-.10-i*.05)/.48));card.style.opacity=reveal;card.style.transform=i?`translateY(${(1-reveal)*(i%2?-28:28)}px)`:'none';});
      directory.inert=state!=='done';directory.setAttribute('aria-hidden',String(state!=='done'));
      film.classList.toggle('is-docked',state==='done');
      intro.dataset.state=state;intro.dataset.phase=state==='idle'?'waiting':state==='done'?'directory':elapsed<REVEAL?'reveal':elapsed<REVEAL+HOLD?'full-video':'dock';
      intro.dataset.progress=(elapsed/TOTAL).toFixed(3);intro.dataset.docking=docking.toFixed(3);
    }
    function measure(){
      const header=document.querySelector('.header').getBoundingClientRect().height,w=stage.clientWidth,h=Math.max(320,innerHeight-header),maskH=h*.5;
      intro.classList.add('motion-ready');intro.classList.toggle('sequence-done',state==='done');
      mask.setAttribute('viewBox',`0 0 ${w} ${maskH}`);mask.style.height=`${maskH}px`;
      maskSolid.setAttribute('width',w);maskSolid.setAttribute('height',maskH);mask.querySelector('mask').setAttribute('width',w);mask.querySelector('mask').setAttribute('height',maskH);
      const stacked=w<=700;
      maskText.innerHTML=stacked?'<tspan x="0" y="-55">FANG XINGYUE / </tspan><tspan x="0" y="60">PORTFOLIO</tspan>':'<tspan x="0" y="0">FANG XINGYUE / PORTFOLIO</tspan>';
      const b=maskText.getBBox(),fit=Math.min(w*(stacked?.90:.94)/b.width,maskH*.62/b.height),textY=maskH-Math.max(20,maskH*.10)-b.height*fit/2;
      maskType.setAttribute('transform',`translate(${w/2} ${textY}) scale(${fit}) translate(${-b.x-b.width/2} ${-b.y-b.height/2})`);
      const stageH=state==='done'?Math.max(h,directory.offsetHeight):h;
      intro.style.height=`${stageH}px`;stage.style.height=`${stageH}px`;stage.style.minHeight=`${h}px`;
      const rect=slot.getBoundingClientRect(),stageRect=stage.getBoundingClientRect();
      size={w,h,maskH,x:rect.left-stageRect.left,y:rect.top-stageRect.top,tw:rect.width,th:rect.height,radius:parseFloat(getComputedStyle(slot).borderTopLeftRadius)||0};
      paint();
    }
    function finish(){
      state='done';elapsed=TOTAL;cancelAnimationFrame(frame);frame=0;lastTick=null;
      unlock();measure();history.replaceState({...history.state,portfolioView:'work'},'');
      if(focusDirectory)cards[0].querySelector('a').focus({preventScroll:true});
    }
    function advance(now){
      frame=0;if(state!=='running'||document.hidden)return;
      if(lastTick!==null)elapsed=Math.min(TOTAL,elapsed+Math.min(100,now-lastTick));
      lastTick=now;paint();if(elapsed>=TOTAL)finish();else frame=requestAnimationFrame(advance);
    }
    function start(fromKeyboard=false){
      if(state!=='idle')return;
      focusDirectory=fromKeyboard;state='running';elapsed=0;lastTick=null;
      scrollTo({top:0,behavior:'instant'});lock();measure();playFilm();frame=requestAnimationFrame(advance);
    }
    function goDirectory(event){
      event?.preventDefault();
      if(state==='idle')start(event?.detail===0);
      else if(state==='done'){scrollTo({top:0,behavior:'smooth'});cards[0].querySelector('a').focus({preventScroll:true});}
    }
    document.querySelectorAll('[data-directory-link]').forEach(a=>a.addEventListener('click',goDirectory));
    addEventListener('wheel',event=>{
      if(state==='done'||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||Math.abs(event.deltaY)<1)return;
      event.preventDefault();start();
    },{passive:false});
    addEventListener('keydown',event=>{
      if(state==='done'||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('a,button,input,textarea,select,[contenteditable]'))return;
      if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Enter'].includes(event.key)){event.preventDefault();start(true);}
    });
    addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    addEventListener('touchmove',event=>{
      if(state==='done'||!touch||event.touches.length!==1)return;
      const dx=event.touches[0].clientX-touch.x,dy=touch.y-event.touches[0].clientY;
      if(Math.abs(dy)>Math.abs(dx)){event.preventDefault();if(dy>12)start();}
    },{passive:false});
    addEventListener('touchend',()=>{touch=null;},{passive:true});
    intro.addEventListener('click',event=>{if(!event.target.closest('a,button'))start();});
    addEventListener('scroll',()=>{if(state!=='done'&&scrollY>0)scrollTo({top:0,behavior:'instant'});},{passive:true});
    video.muted=true;video.defaultMuted=true;video.controls=false;
    const playFilm=()=>{if(!document.hidden)video.play().catch(()=>{});};
    video.addEventListener('loadeddata',playFilm,{once:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){video.pause();cancelAnimationFrame(frame);frame=0;lastTick=null;}
      else{playFilm();if(state==='running'&&!frame){lastTick=null;frame=requestAnimationFrame(advance);}}
    });
    let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,80);});
    function initialize(){
      if(initialized){measure();return;}initialized=true;
      scrollTo({top:0,behavior:'instant'});if(state==='done')unlock();else lock();measure();playFilm();
    }
    requestAnimationFrame(initialize);addEventListener('load',initialize,{once:true});
    addEventListener('pagehide',()=>{history.replaceState({...history.state,portfolioView:state==='done'?'work':'intro'},'');cancelAnimationFrame(frame);frame=0;unlock();});
    addEventListener('pageshow',event=>{if(event.persisted){if(state!=='done'){state='idle';elapsed=0;lock();scrollTo({top:0,behavior:'instant'});}else unlock();measure();playFilm();}});
  }


  function setupLightbox(items) {
    const dialog=document.querySelector('#lightbox');
    if(!dialog)return;
    const stage=dialog.querySelector('.lightbox-stage'), canvas=dialog.querySelector('.lightbox-canvas'), img=canvas.querySelector('img');
    const prev=dialog.querySelector('.lightbox-prev'), next=dialog.querySelector('.lightbox-next'), close=dialog.querySelector('.lightbox-close');
    const zoomOut=dialog.querySelector('.zoom-out'), zoomIn=dialog.querySelector('.zoom-in');
    [[prev,'left'],[next,'right'],[close,'close'],[zoomOut,'minus'],[zoomIn,'plus']].forEach(([el,name])=>el.innerHTML=icon(name));
    let current=0,zoom=1,opener=null;
    function resize(keepCenter=false) {
      if(!dialog.open || !img.naturalWidth)return;
      const w=stage.clientWidth,h=stage.clientHeight;
      const cx=(stage.scrollLeft+w/2)/(canvas.offsetWidth||w),cy=(stage.scrollTop+h/2)/(canvas.offsetHeight||h);
      const fit=Math.min((w-24)/img.naturalWidth,(h-24)/img.naturalHeight,1);
      const iw=Math.round(img.naturalWidth*fit*zoom),ih=Math.round(img.naturalHeight*fit*zoom);
      img.style.width=`${iw}px`;img.style.height=`${ih}px`;canvas.style.width=`${Math.max(w,iw+24)}px`;canvas.style.height=`${Math.max(h,ih+24)}px`;
      stage.scrollLeft=keepCenter?cx*canvas.offsetWidth-w/2:0;stage.scrollTop=keepCenter?cy*canvas.offsetHeight-h/2:0;
      stage.classList.toggle('is-zoomed',zoom>1);document.querySelector('#zoom-value').textContent=`${zoom*100}%`;
      zoomOut.disabled=zoom===1;zoomIn.disabled=zoom===4;
    }
    function show(index) {
      current=Math.max(0,Math.min(items.length-1,index));zoom=1;
      const p=items[current];img.onload=()=>resize();img.src=p.src;img.alt=p.alt;
      document.querySelector('#lightbox-caption').textContent=p.caption||p.alt;
      document.querySelector('#lightbox-page').textContent=`${current+1} / ${items.length}`;
      prev.disabled=current===0;next.disabled=current===items.length-1;
      if(img.complete)resize();
    }
    document.querySelectorAll('[data-image-index]').forEach(button=>button.addEventListener('click',()=>{opener=button;dialog.showModal();document.body.classList.add('modal-open');show(Number(button.dataset.imageIndex));close.focus();}));
    close.addEventListener('click',()=>dialog.close());prev.addEventListener('click',()=>show(current-1));next.addEventListener('click',()=>show(current+1));
    zoomOut.addEventListener('click',()=>{zoom=Math.max(1,zoom-1);resize(true);});zoomIn.addEventListener('click',()=>{zoom=Math.min(4,zoom+1);resize(true);});
    dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
    dialog.addEventListener('keydown',event=>{if(zoom===1&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1));}});
    let drag=null;
    stage.addEventListener('pointerdown',e=>{if(zoom>1&&e.pointerType==='mouse'){drag={x:e.clientX,y:e.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(e.pointerId);e.preventDefault();}});
    stage.addEventListener('pointermove',e=>{if(drag){stage.scrollLeft=drag.left+drag.x-e.clientX;stage.scrollTop=drag.top+drag.y-e.clientY;}});
    stage.addEventListener('pointerup',()=>drag=null);stage.addEventListener('pointercancel',()=>drag=null);
    new ResizeObserver(()=>resize(true)).observe(stage);
  }
})();
