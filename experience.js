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
    return `<figure class="selected-figure ${cls}"><button class="image-trigger" data-image-index="${i}" aria-label="放大：${esc(p.alt)}"><img src="${esc(p.src)}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="image-enlarge" aria-hidden="true">${icon('plus')}</span></button>${p.caption?`<figcaption>${esc(p.caption)}</figcaption>`:''}</figure>`;
  }

  const grid=document.querySelector('#project-grid');
  if(grid) {
    const entries=projects.map(p=>({id:p.id,title:p.title,category:p.category,number:p.number,href:`project.html?id=${p.id}`,image:`assets/${p.id}-cover.webp`,alt:p.images[0][0]}));
    entries.push({id:'other',title:'Other Explorations',category:'其他项目 / 更多设计探索',number:'06',href:'other.html',image:others[0]?.images[0]?.src || 'assets/ore-rebirth-cover.webp',alt:'其他项目：模块、场景与形态探索'});
    grid.innerHTML=entries.map((p,i)=>`<article class="motion-card" data-card="${i}"><a href="${p.href}" aria-label="查看 ${esc(p.title)} 精选作品"><div class="motion-card-heading"><span class="motion-number">${p.number}<span>·</span></span><h2>${esc(p.title)}</h2></div><div class="motion-media" ${i===0?'id="lumi-slot"':''}><img src="${esc(p.image)}" alt="${esc(p.alt)}" width="800" height="600" decoding="async" ${i<3?'fetchpriority="high"':'loading="lazy"'}><span class="entry-open" aria-hidden="true">${icon('ne')}</span></div><p>${esc(p.category)}</p></a></article>`).join('');
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
    const entryUrl=new URL(location.href);
    const navigation=performance.getEntriesByType('navigation')[0]?.type;
    const entryWork=entryUrl.searchParams.get('view')==='work' || (navigation==='back_forward'&&history.state?.portfolioView==='work');
    let userEnabled=entryUrl.searchParams.get('intro')==='1';
    try{if(userEnabled)sessionStorage.setItem('portfolio-motion','on');else userEnabled=sessionStorage.getItem('portfolio-motion')==='on';}catch{}
    entryUrl.searchParams.delete('view');entryUrl.searchParams.delete('intro');
    if(entryUrl.hash==='#work')entryUrl.hash='';
    history.replaceState({...history.state,portfolioView:entryWork?'work':'intro'},'',entryUrl);
    if(!entryWork)scrollTo({top:0,behavior:'instant'});
    const intro=document.querySelector('.motion-intro'), stage=intro.querySelector('.motion-stage');
    const directory=intro.querySelector('.motion-directory'), film=intro.querySelector('.hero-film');
    const video=intro.querySelector('#opening-video'), copy=intro.querySelector('.hero-copy');
    const toggle=intro.querySelector('#opening-toggle'), slot=intro.querySelector('#lumi-slot');
    film.insertAdjacentHTML('beforeend',`<span class="entry-open docked-open" aria-hidden="true">${icon('ne')}</span>`);
    const heading=intro.querySelector('.motion-heading p');
    heading.insertAdjacentHTML('beforeend','<button class="directory-video-toggle" aria-label="暂停动态封面">暂停动态封面</button>');
    const directoryToggle=heading.querySelector('button');
    const cards=[...intro.querySelectorAll('.motion-card')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const staticOpening=()=>reduced.matches&&!userEnabled;
    let size,queued=false,manualPause=false,progress=0,focusDirectory=false;
    const clamp=v=>Math.max(0,Math.min(1,v));
    const ease=v=>v*v*(3-2*v);
    const mix=(a,b,t)=>a+(b-a)*t;
    function update() {
      queued=false;
      if(!size) return;
      if(staticOpening()) {
        progress=clamp((scrollY-size.start)/size.h);
        film.style.transform='none';film.style.width=`${size.w}px`;film.style.height=`${size.h}px`;
        film.style.borderColor='transparent';film.classList.remove('is-docked');
        copy.style.opacity=1;copy.style.transform='none';copy.style.pointerEvents='auto';copy.inert=false;
        toggle.style.opacity=1;toggle.style.pointerEvents='auto';toggle.tabIndex=0;
        directory.style.setProperty('--reveal',1);directory.inert=false;directory.setAttribute('aria-hidden','false');
        cards.forEach(card=>{card.style.opacity=1;card.style.transform='none';});
        intro.dataset.progress=progress.toFixed(3);
        if(focusDirectory&&progress>.999){focusDirectory=false;cards[0].querySelector('a').focus({preventScroll:true});}
        return;
      }
      progress=clamp((scrollY-size.start)/size.travel);
      const t=ease(progress);
      film.style.transform=`translate3d(${mix(0,size.x,t)}px,${mix(0,size.y,t)}px,0)`;
      film.style.width=`${mix(size.w,size.tw,t)}px`;
      film.style.height=`${mix(size.h,size.th,t)}px`;
      film.style.borderColor=`rgba(162,139,127,${t})`;
      const fade=1-ease(clamp(progress/.4));
      copy.style.opacity=fade;copy.style.transform=`translateY(${-24*t}px)`;
      copy.style.pointerEvents=progress>.12?'none':'auto';
      copy.inert=progress>.12;
      toggle.style.opacity=fade;toggle.style.pointerEvents=progress>.12?'none':'auto';toggle.tabIndex=progress>.12?-1:0;
      directory.style.setProperty('--reveal',ease(clamp((progress-.13)/.5)));
      cards.forEach((card,i)=>{
        const reveal=ease(clamp((progress-.25-i*.045)/.38));
        card.style.opacity=reveal;
        card.style.transform=i?`translateY(${(1-reveal)*(i%2?-32:32)}px)`:'none';
      });
      directory.inert=progress<.93;
      directory.setAttribute('aria-hidden',String(progress<.93));
      intro.dataset.progress=progress.toFixed(3);
      film.classList.toggle('is-docked',progress>.995);
      if(focusDirectory&&progress>.999){focusDirectory=false;cards[0].querySelector('a').focus({preventScroll:true});}
    }
    function measure(preserve=false) {
      const previous=preserve===true&&size?{progress:progress>.98?1:progress,offset:Math.max(0,scrollY-size.directoryY)}:null;
      const header=document.querySelector('.header').getBoundingClientRect().height;
      const viewport=Math.max(320,innerHeight-header);
      const isStatic=staticOpening();
      intro.classList.toggle('motion-reduced',isStatic);
      stage.style.paddingTop=isStatic?`${viewport}px`:'0px';
      stage.style.minHeight=`${viewport}px`;
      // The final directory is measured in normal layout; its first media slot is the landing position.
      const rect=slot.getBoundingClientRect(), stageRect=stage.getBoundingClientRect();
      const stageH=isStatic?viewport+directory.offsetHeight:Math.max(viewport,directory.offsetHeight);
      const travel=isStatic?0:Math.max(540,Math.min(950,viewport*1.12));
      size={start:scrollY+intro.getBoundingClientRect().top-header,travel,w:stage.clientWidth,h:viewport,x:rect.left-stageRect.left,y:rect.top-stageRect.top,tw:rect.width,th:rect.height};
      size.directoryY=size.start+(isStatic?viewport:travel);
      intro.style.height=`${stageH+travel}px`;
      stage.style.height=`${stageH}px`;
      intro.classList.add('motion-ready');
      if(previous)scrollTo({top:size.start+previous.progress*(size.directoryY-size.start)+previous.offset,behavior:'instant'});
      update();
    }
    function queue() {if(!queued){queued=true;requestAnimationFrame(update);}}
    function goDirectory(event) {
      event?.preventDefault();
      if(!size) measure();
      history.replaceState({...history.state,portfolioView:'work'},'');
      focusDirectory=true;
      scrollTo({top:size.directoryY,behavior:staticOpening()?'instant':'smooth'});
      queue();
    }
    document.querySelectorAll('[data-directory-link]').forEach(a=>a.addEventListener('click',goDirectory));
    const togglePlayback=()=>{
      if(staticOpening()) {
        userEnabled=true;manualPause=false;
        try{sessionStorage.setItem('portfolio-motion','on');}catch{}
        measure();scrollTo({top:0,behavior:'instant'});update();
        video.play().catch(syncToggle);syncToggle();return;
      }
      if(video.paused) {manualPause=false;video.play().catch(()=>{});} else {manualPause=true;video.pause();}
    };
    toggle.addEventListener('click',togglePlayback);directoryToggle.addEventListener('click',togglePlayback);
    const syncToggle=()=>{toggle.textContent=staticOpening()?'播放开场动效':video.paused?'播放影片':'暂停影片';toggle.setAttribute('aria-label',toggle.textContent);directoryToggle.textContent=staticOpening()?'观看视频开场':video.paused?'播放动态封面':'暂停动态封面';directoryToggle.setAttribute('aria-label',directoryToggle.textContent);};
    video.addEventListener('play',syncToggle);video.addEventListener('pause',syncToggle);
    video.addEventListener('error',()=>{toggle.hidden=true;directoryToggle.hidden=true;});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(!manualPause&&!staticOpening())video.play().catch(()=>{});});
    addEventListener('scroll',queue,{passive:true});
    let resizeTimer;
    addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>measure(true),120);});
    reduced.addEventListener('change',()=>{if(staticOpening())video.pause();measure(true);syncToggle();});
    let interacted=false;
    ['wheel','touchstart','pointerdown','keydown'].forEach(type=>addEventListener(type,()=>{interacted=true;},{once:true,passive:true}));
    function initialize(){measure();if(!interacted)scrollTo({top:entryWork?size.directoryY:0,behavior:'instant'});update();}
    requestAnimationFrame(initialize);
    addEventListener('load',initialize,{once:true});
    addEventListener('pagehide',()=>history.replaceState({...history.state,portfolioView:progress>.93?'work':'intro'},''));
    addEventListener('pageshow',event=>{if(event.persisted){measure();update();}});
    if(staticOpening())video.pause();else video.play().catch(syncToggle);
    syncToggle();
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
