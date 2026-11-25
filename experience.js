(() => {
  'use strict';
  const paths = {ne:'M6 18 18 6M6 6h12v12',left:'M20 12H4m7-7-7 7 7 7',right:'M4 12h16m-7-7 7 7-7 7',close:'m6 6 12 12M18 6 6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5'};
  const icon = n => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${paths[n]}"/></svg>`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const projects = window.PORTFOLIO_PROJECTS || [];
  const others = window.OTHER_PROJECTS || [];
  const selected = {...window.SELECTED_CORE, 'lumi-city':window.SELECTED_LUMI};
  let gallery = [];
  let openingHandle=null, lightboxCleanup=null;
  const projectRoutes = [
    ['lumi-city','LUMI CITY'],['mutualism-tower','Mutualism Tower'],
    ['encounters','N Kinds of Encounters'],['ore-rebirth','Ore Rebirth'],
    ['old-station','Nourishing the Old Station'],['other','其他项目']
  ].map(([id,title])=>({id,title,href:id==='other'?'other.html':`project.html?id=${id}`}));
  function projectPagination(id) {
    const i=projectRoutes.findIndex(p=>p.id===id),n=projectRoutes.length;
    const prev=projectRoutes[(i+n-1)%n],next=projectRoutes[(i+1)%n];
    return `<nav class="project-pagination" aria-label="项目导航"><a class="project-prev" href="${prev.href}"><span class="pagination-label">${icon('left')} 上一个项目</span><span class="pagination-title">${esc(prev.title)}</span></a><a class="pagination-directory" href="index.html?view=work">返回目录</a><a class="project-next" href="${next.href}"><span class="pagination-label">下一个项目 ${icon('right')}</span><span class="pagination-title">${esc(next.title)}</span></a></nav>`;
  }
  function figure(p, context, eager=false, cls='') {
    const paper=cls.includes('chapter-figure')&&p.fit!=='cover'&&p.background!=='#000';
    const i=gallery.push({...p,context,paper})-1;
    const preview=p.thumbnail || p;
    return `<figure class="selected-figure ${cls}" style="--image-ratio:${preview.width/preview.height};--image-background:${esc(p.background || '#fff')}"><button class="image-trigger" data-image-index="${i}" aria-label="放大：${esc(p.alt)}"><img class="${p.fit==='cover'?'fit-cover':'fit-contain'}" src="${esc(preview.src)}" width="${preview.width}" height="${preview.height}" alt="${esc(p.alt)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"><span class="image-enlarge" aria-hidden="true">${icon('plus')}</span></button>${p.caption?`<figcaption>${esc(p.caption)}</figcaption>`:''}</figure>`;
  }


  function imageRows(images, context) {
    const rows=[];
    for(let i=0;i<images.length;i+=2){
      const pair=images.slice(i,i+2);
      const ratios=pair.map(im=>{const preview=im.thumbnail || im;return preview.width/preview.height;});
      const allVisual=pair.every(im=>im.fit==='cover');
      const ratio=allVisual?ratios.reduce((sum,r)=>sum+r,0)/ratios.length:Math.max(.85,Math.min(16/9,...ratios));
      rows.push(`<div class="chapter-image-row ${pair.length===1?'single-image':''} ${allVisual?'':'natural-row'}" style="--frame-ratio:${ratio.toFixed(4)};--columns:${ratios.map(r=>`${r.toFixed(5)}fr`).join(' ')}">${pair.map(im=>figure(im,context,false,'chapter-figure')).join('')}</div>`);
    }
    return rows.join('');
  }

  function mountContent(){
  gallery=[];lightboxCleanup?.();lightboxCleanup=null;
  const existingDialog=document.querySelector('#lightbox');
  if(existingDialog)existingDialog.replaceWith(existingDialog.cloneNode(true));
  const grid=document.querySelector('#project-grid');
  if(grid) {
    const entries=projects.map(p=>({id:p.id,title:p.title,category:p.category,number:p.number,href:`project.html?id=${p.id}`,image:selected[p.id]?.hero.src || `assets/${p.id}-cover.webp`,alt:p.images[0][0]}));
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
      target.innerHTML=`<div class="wrap entry-back"><a class="back-link" href="index.html?view=work">${icon('left')} 返回作品目录</a></div>${id==='lumi-city'?lumiEntry(p.title):`<div class="wrap selected-hero entry-hero">${figure(s.hero,p.title,true)}${heroTitle(p.title)}</div>`}<section class="selected-heading wrap" id="project-overview"><div class="selected-summary"><div><h2>${esc(s.subtitle || p.name)}</h2><p>${esc(p.intro)}</p></div><nav class="project-tags" aria-label="项目章节">${s.sections.map((section,i)=>`<a href="#chapter-${i+1}">${esc(section.title)}</a>`).join('')}</nav></div></section>
      ${id==='lumi-city'?`<div class="wrap selected-hero">${figure(s.hero,p.title,true)}</div>`:''}
      <div class="selected-chapters wrap">${s.sections.map((section,i)=>`<section class="design-chapter" id="chapter-${i+1}" tabindex="-1"><div class="chapter-copy"><div><span class="eyebrow">${String(i+1).padStart(2,'0')} / ${esc((section.label || 'DESIGN PROCESS').replace(/^\d+\s*\/\s*/,''))}</span><h2>${esc(section.title)}</h2></div><p>${esc(section.text)}</p></div><div class="chapter-images">${imageRows(section.images,p.title)}</div></section>`).join('')}</div>
      ${id==='lumi-city'?`<section class="wrap detail-film" id="project-film"><div class="chapter-copy"><div><span class="eyebrow">FILM / 项目影片</span><h2>光影演绎</h2></div><p>从实验与结构探索，到场景中的光影表达。</p></div><video controls playsinline preload="none" poster="assets/lumi-film-poster.webp" aria-label="LUMI CITY 完整项目影片"><source src="assets/lumi-film.mp4" type="video/mp4">请使用支持 MP4 的浏览器。</video></section>`:''}
      <section class="download-section wrap"><div><p class="eyebrow">THE COMPLETE PROJECT</p><h2>完整作品集</h2><p>研究背景、更多推演与完整图纸，收录于项目作品集。</p></div><a class="download-button" href="documents/${esc(p.pdf)}" download>${icon('download')} 下载完整作品集 PDF</a></section>
      <div class="wrap">${projectPagination(id)}</div>`;
    }
  }
  const otherTarget=document.querySelector('#other-projects');
  if(otherTarget) {
    if(!document.querySelector('.entry-hero')){const hero=document.createElement('div');hero.className='selected-hero entry-hero';hero.innerHTML=figure(others[0].images[0],'其他项目',true)+heroTitle('Other Explorations','#other-projects');document.querySelector('.other-heading').before(hero);}
    otherTarget.innerHTML=others.map((p,i)=>`<article class="other-entry"><div class="other-images">${p.images.map(im=>figure(im,p.title)).join('')}</div><div class="other-copy"><span class="eyebrow">${String(i+1).padStart(2,'0')} / EXPLORATION</span><h2>${esc(p.title)}</h2>${p.subtitle?`<p class="other-subtitle">${esc(p.subtitle)}</p>`:''}<p>${esc(p.text)}</p></div></article>`).join('');
    document.querySelector('#other-pagination').innerHTML=projectPagination('other');
  }
  if(gallery.length) lightboxCleanup=setupLightbox(gallery);
  }
  function heroTitle(title,anchor='#project-overview'){return `<div class="entry-hero-copy"><h1>${esc(title)}</h1><a class="entry-scroll-cue" href="${anchor}">向下滚动，探索项目 <span aria-hidden="true">↓</span></a></div>`;}
  function lumiEntry(title){return `<div class="wrap entry-hero lumi-entry"><button class="entry-video-button" aria-label="放大播放 LUMI 视频"><span class="entry-video-slot"></span><span class="image-enlarge" aria-hidden="true">${icon('plus')}</span></button>${heroTitle(title)}</div>`;}
  window.PortfolioPage={mount:mountContent,opening:()=>openingHandle};
  mountContent();

  function setupOpening() {
    let active=true;
    history.scrollRestoration='manual';
    const entryUrl=new URL(location.href);
    const isHistoryReturn=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
    const entryWork=entryUrl.searchParams.get('view')==='work'||entryUrl.hash==='#work'||(isHistoryReturn&&history.state?.portfolioView==='work');
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
    const REVEAL=450,HOLD=100,DOCK=950,TOTAL=REVEAL+HOLD+DOCK;
    let state=entryWork?'done':'idle',elapsed=entryWork?TOTAL:0,direction=1,size,frame=0,lastTick=null,focusDirectory=false,touch=null,initialized=false;
    const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>v*v*(3-2*v),mix=(a,b,t)=>a+(b-a)*t;
    function lock(){document.documentElement.classList.add('intro-sequence-locked');}
    function unlock(){document.documentElement.classList.remove('intro-sequence-locked');}
    function syncVideo(){
      if(!active||document.hidden||state==='done'){video.pause();return;}
      video.play().then(()=>{if(!active||document.hidden||state==='done')video.pause();}).catch(()=>{});
    }
    function paint(){
      if(!size)return;
      const revealing=ease(clamp(elapsed/REVEAL)),docking=clamp((elapsed-REVEAL-HOLD)/DOCK),t=ease(docking);
      mask.style.transform=`translate3d(0,${-size.maskH*1.01*revealing}px,0)`;
      mask.style.visibility=elapsed>=REVEAL?'hidden':'visible';
      film.style.transform=`translate3d(${mix(0,size.x,t)}px,${mix(0,size.y,t)}px,0)`;
      film.style.width=`${mix(size.w,size.tw,t)}px`;film.style.height=`${mix(size.h,size.th,t)}px`;
      film.style.borderColor=`rgba(162,139,127,${t})`;film.style.borderRadius=`${size.radius*t}px`;
      film.style.setProperty('--card-reveal',ease(clamp((docking-.72)/.28)));
      copy.style.opacity=1-ease(clamp(elapsed/220));copy.inert=state!=='idle';copy.style.pointerEvents='none';
      directory.style.setProperty('--reveal',ease(clamp((docking-.06)/.50)));
      cards.forEach((card,i)=>{const reveal=ease(clamp((docking-.10-i*.05)/.48));card.style.opacity=reveal;card.style.transform=i?`translateY(${(1-reveal)*(i%2?-28:28)}px)`:'none';});
      directory.inert=state!=='done';directory.setAttribute('aria-hidden',String(state!=='done'));
      film.classList.toggle('is-docked',state==='done');
      intro.dataset.state=state;intro.dataset.direction=direction<0?'reverse':'forward';
      intro.dataset.phase=state==='idle'?'waiting':state==='done'?'directory':elapsed<REVEAL?'reveal':elapsed<REVEAL+HOLD?'full-video':'dock';
      intro.dataset.progress=(elapsed/TOTAL).toFixed(3);intro.dataset.docking=docking.toFixed(3);
    }
    function measure(){
      if(!active||!intro.isConnected)return;
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
    function settle(atDirectory){
      state=atDirectory?'done':'idle';elapsed=atDirectory?TOTAL:0;
      cancelAnimationFrame(frame);frame=0;lastTick=null;
      if(atDirectory)unlock();else lock();
      syncVideo();measure();
      history.replaceState({...history.state,portfolioView:atDirectory?'work':'intro'},'');
      if(atDirectory&&focusDirectory)cards[0].querySelector('a').focus({preventScroll:true});
    }
    function advance(now){
      frame=0;if(state!=='running'||document.hidden)return;
      if(lastTick!==null)elapsed=Math.max(0,Math.min(TOTAL,elapsed+direction*Math.min(64,now-lastTick)));
      lastTick=now;paint();
      if(elapsed>=TOTAL&&direction>0)settle(true);
      else if(elapsed<=0&&direction<0)settle(false);
      else frame=requestAnimationFrame(advance);
    }
    function animateTo(nextDirection,fromKeyboard=false){
      if((state==='idle'&&nextDirection<0)||(state==='done'&&nextDirection>0))return;
      if(state==='running'&&direction===nextDirection)return;
      direction=nextDirection;focusDirectory=fromKeyboard&&direction>0;
      if(direction<0&&directory.contains(document.activeElement))document.activeElement.blur();
      const wasRunning=state==='running';state='running';
      scrollTo({top:0,behavior:'instant'});lock();measure();syncVideo();
      if(!wasRunning)lastTick=null;
      if(!frame&&!document.hidden)frame=requestAnimationFrame(advance);
    }
    function resetOpening(animate=false){
      scrollTo({top:0,behavior:'instant'});
      if(animate&&state!=='idle'){animateTo(-1);return;}
      if(directory.contains(document.activeElement))document.activeElement.blur();
      direction=-1;focusDirectory=false;settle(false);
    }
    function intent(sign,fromKeyboard=false){
      if(!active)return false;
      if(state==='done'&&(sign>0||scrollY>2))return false;
      animateTo(sign,fromKeyboard);return true;
    }
    document.querySelectorAll('[data-directory-link]').forEach(a=>a.addEventListener('click',event=>{
      if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      if(!active)return;event.preventDefault();focusDirectory=false;direction=1;
      scrollTo({top:0,behavior:'instant'});settle(true);
    }));
    document.querySelectorAll('.header .identity').forEach(a=>a.addEventListener('click',event=>{
      if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      if(!active)return;event.preventDefault();resetOpening(true);
    }));
    addEventListener('wheel',event=>{
      if(event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||Math.abs(event.deltaY)<1)return;
      if(intent(Math.sign(event.deltaY)))event.preventDefault();
    },{passive:false});
    addEventListener('keydown',event=>{
      if(event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select,[contenteditable]'))return;
      if(['Enter',' '].includes(event.key)&&event.target.closest('a,button'))return;
      const backwards=['ArrowUp','PageUp','Home','Escape'].includes(event.key)||(event.key===' '&&event.shiftKey);
      const forwards=['ArrowDown','PageDown','End','Enter'].includes(event.key)||(event.key===' '&&!event.shiftKey);
      if((backwards||forwards)&&intent(backwards?-1:1,true))event.preventDefault();
    });
    addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
    addEventListener('touchmove',event=>{
      if(!touch||event.touches.length!==1)return;
      const point=event.touches[0],dx=point.clientX-touch.x,dy=touch.y-point.clientY;
      if(Math.abs(dy)<6&&Math.abs(dx)<6)return;
      touch={x:point.clientX,y:point.clientY};
      if(Math.abs(dy)>Math.abs(dx)&&intent(Math.sign(dy)))event.preventDefault();
    },{passive:false});
    addEventListener('touchend',()=>{touch=null;},{passive:true});
    addEventListener('touchcancel',()=>{touch=null;},{passive:true});
    intro.addEventListener('click',event=>{if(state==='idle'&&!event.target.closest('a,button'))animateTo(1);});
    addEventListener('scroll',()=>{if(active&&state!=='done'&&scrollY>0)scrollTo({top:0,behavior:'instant'});},{passive:true});
    video.muted=true;video.defaultMuted=true;video.controls=false;
    video.addEventListener('loadeddata',syncVideo);
    document.addEventListener('visibilitychange',()=>{
      if(!active)return;
      if(document.hidden){video.pause();cancelAnimationFrame(frame);frame=0;lastTick=null;}
      else{syncVideo();if(state==='running'&&!frame){lastTick=null;frame=requestAnimationFrame(advance);}}
    });
    let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(measure,80);});
    function initialize(){
      if(initialized){measure();return;}initialized=true;
      scrollTo({top:0,behavior:'instant'});if(state==='done')unlock();else lock();measure();syncVideo();
    }
    openingHandle={video,film,suspend(){active=false;video.pause();cancelAnimationFrame(frame);frame=0;unlock();},resume(directory=true){active=true;scrollTo({top:0,behavior:'instant'});settle(directory);}};
    requestAnimationFrame(initialize);addEventListener('load',initialize,{once:true});
    addEventListener('pagehide',()=>{video.pause();cancelAnimationFrame(frame);frame=0;lastTick=null;unlock();});
    addEventListener('pageshow',event=>{
      if(!active||!event.persisted)return;
      scrollTo({top:0,behavior:'instant'});focusDirectory=false;
      settle(history.state?.portfolioView==='work');
    });
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
      const p=items[current];dialog.classList.toggle('paper-view',!!p.paper);img.onload=()=>resize();img.src=p.src;img.alt=p.alt;
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
    const observer=new ResizeObserver(()=>resize(true));observer.observe(stage);
    return ()=>observer.disconnect();
  }
})();
