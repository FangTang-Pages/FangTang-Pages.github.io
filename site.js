(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const grid = document.querySelector('#project-grid');
  if (grid) {
    grid.innerHTML = projects.map((p, i) => `<article class="project-card ${i === 0 ? 'featured' : ''}" data-categories="${p.filters.join(' ')}"><a href="project.html?id=${p.id}" aria-label="查看 ${esc(p.title)}：${esc(p.name)}"><div class="card-image"><img src="assets/${p.id}-cover.webp" srcset="assets/${p.id}-thumb.webp 800w, assets/${p.id}-cover.webp 1920w" sizes="(max-width: 680px) 100vw, ${i === 0 ? '94vw' : '46vw'}" alt="${esc(p.images[0][0])}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="card-open" aria-hidden="true">↗</span>${i === 0 ? '<span class="feature-label">FEATURED PROJECT / 团队研究项目</span>' : ''}</div><div class="card-meta"><span class="card-index">${p.number}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.name)}</p></div><span class="card-category">${esc(p.category)}</span></div></a></article>`).join('');
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => {item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false');});
      grid.querySelectorAll('.project-card').forEach(card => card.hidden = button.dataset.filter !== 'all' && !card.dataset.categories.split(' ').includes(button.dataset.filter));
    }));
  }
  document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText('fangxingyue249@163.com'); status.textContent = '邮箱已复制'; }
    catch { status.textContent = '请长按或选中上方邮箱复制'; }
  });
  const target = document.querySelector('#project-content');
  if (!target) return;
  const id = new URLSearchParams(location.search).get('id') || 'lumi-city';
  const project = projects.find(p => p.id === id);
  if (!project) {target.innerHTML = '<div class="wrap missing"><h1>暂未找到这个项目</h1><p>请回到作品目录继续浏览。</p><a class="button" href="index.html#work">返回全部作品 ↗</a></div>'; return;}
  document.title = `${project.title} · 方星月作品集`;
  document.querySelector('meta[name="description"]').content = project.intro;
  const next = projects[(projects.indexOf(project) + 1) % projects.length];
  target.innerHTML = `<section class="project-heading wrap"><a class="back-link" href="index.html#work">← 返回全部作品</a><div class="eyebrow">PROJECT ${project.number} / ${esc(project.category)}</div><h1>${esc(project.title)}</h1><div class="project-heading-bottom"><h2>${esc(project.name)}</h2><p>${esc(project.intro)}</p></div></section><div class="project-hero wrap"><button class="gallery-trigger" data-image="0" aria-label="放大：${esc(project.images[0][0])}"><img src="assets/${project.id}-cover.webp" alt="${esc(project.images[0][0])}" fetchpriority="high"><span>查看大图 ↗</span></button></div><section class="project-overview wrap"><div class="project-facts"><dl><dt>项目方向</dt><dd>${esc(project.category)}</dd><dt>我的角色</dt><dd>${esc(project.role)}</dd><dt>方法与工具</dt><dd>${esc(project.tools)}</dd></dl><a class="text-link" href="documents/${project.pdf}" target="_blank" rel="noopener">阅读项目作品集 <span>PDF ↗</span></a></div><div class="project-story"><h2>${esc(project.concept)}</h2>${project.sections.map(([title, body], i) => `<div class="story-row"><span>0${i + 1}</span><div><h3>${esc(title)}</h3><p>${esc(body)}</p></div></div>`).join('')}${project.credits ? `<p class="credits">${esc(project.credits)}</p>` : ''}</div></section><section class="gallery-section wrap" aria-labelledby="gallery-title"><div class="section-top"><h2 id="gallery-title">过程与呈现 <span>PROJECT GALLERY</span></h2><span class="index-count">点击图片放大</span></div><div class="gallery-grid">${project.images.map(([caption, source], i) => `<figure><button class="gallery-trigger" data-image="${i}" aria-label="放大：${esc(caption)}"><img src="assets/${project.id}-0${i + 1}.webp" alt="${esc(caption)}" loading="lazy"><span aria-hidden="true">↗</span></button><figcaption><span>0${i + 1} / ${esc(caption)}</span><small>${esc(source)}</small></figcaption></figure>`).join('')}</div></section>${project.id === 'lumi-city' ? '<section class="wrap detail-film"><div class="section-top"><h2>项目影片 <span>PROJECT FILM</span></h2></div><video controls playsinline preload="none" poster="assets/lumi-film-poster.webp" aria-label="LUMI CITY 项目影片"><source src="assets/lumi-film.mp4" type="video/mp4">请使用支持 MP4 的浏览器。</video></section>' : ''}<section class="next-project wrap"><span class="eyebrow">NEXT PROJECT / 下一个项目</span><a href="project.html?id=${next.id}"><h2>${esc(next.title)}</h2><span aria-hidden="true">↗</span></a><p>${esc(next.name)}</p></section>`;
  const dialog = document.querySelector('#lightbox');
  let selected = 0;
  const update = () => { const [caption, source] = project.images[selected]; dialog.querySelector('img').src = `assets/${project.id}-0${selected+1}.webp`; dialog.querySelector('img').alt = caption; dialog.querySelector('figcaption').textContent = `${selected+1} / ${project.images.length}　${caption} · ${source}`; };
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {selected = Number(button.dataset.image); update(); dialog.showModal(); document.body.classList.add('modal-open');}));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click', () => {selected = (selected - 1 + project.images.length) % project.images.length; update();});
  dialog.querySelector('.lightbox-next').addEventListener('click', () => {selected = (selected + 1) % project.images.length; update();});
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {if(event.target === dialog) dialog.close();});
  dialog.addEventListener('keydown', event => {if(event.key === 'ArrowRight') {event.preventDefault(); selected = (selected + 1) % project.images.length; update();} if(event.key === 'ArrowLeft') {event.preventDefault(); selected = (selected - 1 + project.images.length) % project.images.length; update();}});
})();
