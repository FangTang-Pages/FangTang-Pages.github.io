(() => {
  'use strict';
  const paths = {ne:'M6 18 18 6M6 6h12v12',left:'M20 12H4m7-7-7 7 7 7',right:'M4 12h16m-7-7 7 7-7 7',close:'m6 6 12 12M18 6 6 18',plus:'M12 5v14M5 12h14',minus:'M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M5 16v5h14v-5'};
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const projects = window.PORTFOLIO_PROJECTS || [];
  const grid = document.querySelector('#project-grid');
  if (grid) grid.insertAdjacentHTML('beforeend', projects.map((p, i) => `<article class="directory-card"><a href="project.html?id=${p.id}" aria-label="阅读 ${esc(p.title)} 完整作品集"><div class="directory-image"><img src="assets/${p.id}-thumb.webp" srcset="assets/${p.id}-thumb.webp 800w, assets/${p.id}-cover.webp 1920w" sizes="(max-width: 700px) 46vw, 31vw" alt="${esc(p.images[0][0])}" width="800" height="600" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="card-open" aria-hidden="true">${icon('ne')}</span></div><div class="directory-meta"><span class="card-index">${p.number}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.category)}</p></div></div></a></article>`).join(''));
  document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText('fangxingyue249@163.com'); status.textContent = '邮箱已复制'; }
    catch { status.textContent = '请长按或选中上方邮箱复制'; }
  });
  const target = document.querySelector('#project-content');
  if (!target) return;
  const id = new URLSearchParams(location.search).get('id') || 'lumi-city';
  const project = projects.find(p => p.id === id);
  const folio = window.PORTFOLIO_FOLIOS?.[id];
  if (!project || !folio) {target.innerHTML = `<section class="wrap empty"><h1>暂未找到这个项目</h1><p>请回到作品目录继续浏览。</p><a class="text-link" href="index.html#work">${icon('left')} 返回作品目录</a></section>`; return;}
  const pages = folio.pages;
  document.title = `${project.title} · 方星月作品集`;
  document.querySelector('meta[name="description"]').content = project.intro;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  target.innerHTML = `<section class="project-heading wrap"><a class="back-link" href="index.html#work">${icon('left')} 返回作品目录</a><p class="eyebrow">PROJECT ${project.number} / ${esc(project.category)}</p><h1>${esc(project.title)}</h1><div class="project-summary"><div><h2>${esc(project.name)}</h2><p>${esc(project.intro)}</p></div><div class="project-role"><p>${esc(project.role)}</p>${project.credits ? `<small>${esc(project.credits)}</small>` : ''}<a class="text-link pdf-download" href="${folio.pdf}" download>${icon('download')} 下载项目 PDF</a></div></div></section>
    <section class="reader" aria-label="完整项目作品集"><div class="reader-toolbar"><div class="wrap reader-tools"><label for="page-select">图页 <select id="page-select" aria-label="跳转到作品集页码">${pages.map((_,i)=>`<option value="${i+1}">${String(i+1).padStart(2,'0')} / ${pages.length}</option>`).join('')}</select></label><span class="reader-hint">点击图页，放大查看</span>${id === 'lumi-city' ? '<a href="#project-film">项目影片</a>' : ''}</div></div><div class="folio-pages wrap">${pages.map((p,i)=>`<figure class="folio-page" id="page-${i+1}"><button class="page-trigger" data-page-index="${i}" aria-label="放大${esc(p.alt)}"><img src="${p.file}" width="${p.width}" height="${p.height}" alt="${esc(p.alt)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"><span class="page-enlarge" aria-hidden="true">${icon('plus')}</span></button><figcaption><span>${String(i+1).padStart(2,'0')} / ${pages.length}</span><span>${esc(project.title)}</span></figcaption></figure>`).join('')}</div></section>
    ${id === 'lumi-city' ? '<section class="wrap detail-film" id="project-film"><div class="section-label"><span>FILM</span><h2>项目影片<small>LUMI CITY</small></h2></div><video controls playsinline preload="none" poster="assets/lumi-film-poster.webp" aria-label="LUMI CITY 项目影片"><source src="assets/lumi-film.mp4" type="video/mp4">请使用支持 MP4 的浏览器。</video></section>' : ''}
    <section class="next-project wrap"><span class="eyebrow">NEXT PROJECT / 下一个项目</span><a href="project.html?id=${next.id}"><h2>${esc(next.title)}</h2>${icon('ne')}</a><a class="back-link" href="index.html#work">${icon('left')} 返回作品目录</a></section>`;
  const select = document.querySelector('#page-select');
  select.addEventListener('change', () => {
    const figure = document.querySelector(`#page-${select.value}`);
    figure.querySelector('img').loading = 'eager';
    figure.scrollIntoView({behavior:'instant',block:'start'});
    history.replaceState(null,'',`#page-${select.value}`);
  });
  // Sync the page selector to the page crossing the reading line.
  let scrollQueued = false;
  const syncPage = () => {
    scrollQueued = false;
    const line = document.querySelector('.reader-toolbar').getBoundingClientRect().bottom + 24;
    let current = 1;
    document.querySelectorAll('.folio-page').forEach((figure,i) => {if(figure.getBoundingClientRect().top <= line) current = i+1;});
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) current = pages.length;
    select.value = String(current);
  };
  addEventListener('scroll', () => {if (!scrollQueued) {scrollQueued = true; requestAnimationFrame(syncPage);}}, {passive:true});
  if (/^#page-\d+$/.test(location.hash)) requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({behavior:'instant',block:'start'}));
  const dialog = document.querySelector('#lightbox');
  const stage = dialog.querySelector('.lightbox-stage');
  const canvas = dialog.querySelector('.lightbox-canvas');
  const img = canvas.querySelector('img');
  const prev = dialog.querySelector('.lightbox-prev');
  const nextButton = dialog.querySelector('.lightbox-next');
  const zoomOut = dialog.querySelector('.zoom-out');
  const zoomIn = dialog.querySelector('.zoom-in');
  const close = dialog.querySelector('.lightbox-close');
  [[prev,'left'],[nextButton,'right'],[zoomOut,'minus'],[zoomIn,'plus'],[close,'close']].forEach(([el,name]) => el.innerHTML=icon(name));
  let selected = 0, zoom = 1;
  const resizeImage = (keepCenter=false) => {
    if (!dialog.open || !img.naturalWidth) return;
    const w=stage.clientWidth,h=stage.clientHeight;
    const centerX=(stage.scrollLeft+w/2)/(canvas.offsetWidth || w);
    const centerY=(stage.scrollTop+h/2)/(canvas.offsetHeight || h);
    const fit=Math.min((w-24)/img.naturalWidth,(h-24)/img.naturalHeight,1);
    const iw=Math.round(img.naturalWidth*fit*zoom),ih=Math.round(img.naturalHeight*fit*zoom);
    img.style.width=`${iw}px`;img.style.height=`${ih}px`;
    canvas.style.width=`${Math.max(w,iw+24)}px`;canvas.style.height=`${Math.max(h,ih+24)}px`;
    stage.scrollLeft=keepCenter ? centerX*canvas.offsetWidth-w/2 : 0;
    stage.scrollTop=keepCenter ? centerY*canvas.offsetHeight-h/2 : 0;
    stage.classList.toggle('is-zoomed',zoom>1);
    document.querySelector('#zoom-value').textContent=`${zoom*100}%`;
    zoomOut.disabled=zoom===1;zoomIn.disabled=zoom===4;
  };
  const showPage = index => {
    selected=Math.max(0,Math.min(pages.length-1,index));zoom=1;
    const p=pages[selected];
    img.onload=()=>resizeImage();img.src=p.file;img.alt=p.alt;
    document.querySelector('#lightbox-caption').textContent=project.title;
    document.querySelector('#lightbox-page').textContent=`${selected+1} / ${pages.length}`;
    prev.disabled=selected===0;nextButton.disabled=selected===pages.length-1;
    if(img.complete) resizeImage();
  };
  document.querySelectorAll('[data-page-index]').forEach(button=>button.addEventListener('click',()=>{
    dialog.showModal();document.body.classList.add('modal-open');showPage(Number(button.dataset.pageIndex));close.focus();
  }));
  close.addEventListener('click',()=>dialog.close());
  prev.addEventListener('click',()=>showPage(selected-1));
  nextButton.addEventListener('click',()=>showPage(selected+1));
  zoomOut.addEventListener('click',()=>{zoom=Math.max(1,zoom-1);resizeImage(true);});
  zoomIn.addEventListener('click',()=>{zoom=Math.min(4,zoom+1);resizeImage(true);});
  dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
  dialog.addEventListener('keydown',event=>{
    if(zoom===1 && ['ArrowLeft','ArrowRight'].includes(event.key)) {event.preventDefault();showPage(selected+(event.key==='ArrowRight'?1:-1));}
  });
  let drag=null;
  stage.addEventListener('pointerdown',event=>{
    if(zoom>1 && event.pointerType==='mouse') {drag={x:event.clientX,y:event.clientY,left:stage.scrollLeft,top:stage.scrollTop};stage.setPointerCapture(event.pointerId);event.preventDefault();}
  });
  stage.addEventListener('pointermove',event=>{if(drag){stage.scrollLeft=drag.left+drag.x-event.clientX;stage.scrollTop=drag.top+drag.y-event.clientY;}});
  stage.addEventListener('pointerup',()=>drag=null);
  stage.addEventListener('pointercancel',()=>drag=null);
  new ResizeObserver(()=>resizeImage(true)).observe(stage);
})();
