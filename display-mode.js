(() => {
  'use strict';
  // Run in <head>, before layout: a mobile browser's desktop UA requests
  // the same wide canvas as a computer, not the narrow responsive layout.
  const root=document.documentElement,meta=document.querySelector('meta[name="viewport"]');
  const ua=navigator.userAgent || '',query=new URLSearchParams(location.search);
  const requested=query.get('layout'),key='portfolio-display-mode';
  let override=null;
  try {
    if(requested==='auto')sessionStorage.removeItem(key);
    else if(requested==='desktop'||requested==='mobile')sessionStorage.setItem(key,JSON.stringify({mode:requested,ua}));
    const saved=JSON.parse(sessionStorage.getItem(key)||'null');
    if(saved?.ua===ua)override=saved.mode;
    else if(saved)sessionStorage.removeItem(key);
  } catch { if(requested==='desktop'||requested==='mobile')override=requested; }
  // Treat explicit links as a one-time choice. A later browser mode change
  // must not replay an old URL override when the same page is reloaded.
  if(['desktop','mobile','auto'].includes(requested)){
    const cleanUrl=new URL(location.href);cleanUrl.searchParams.delete('layout');
    history.replaceState(history.state,'',cleanUrl);
  }
  const touch=navigator.maxTouchPoints>0||matchMedia('(pointer:coarse)').matches;
  const smallScreen=screen.width<=1024&&screen.height<=1366;
  const mobileUA=/Android|iPhone|iPad|iPod|Mobile|Windows Phone/i.test(ua);
  const desktop=override==='desktop'||(override!=='mobile'&&touch&&smallScreen&&!mobileUA);
  root.classList.toggle('desktop-layout',desktop);
  root.dataset.displayMode=desktop?'desktop':'responsive';
  if(meta)meta.content=desktop?'width=1440':'width=device-width,initial-scale=1';
  // The width-only desktop viewport lets mobile browsers calculate their own
  // fit-to-screen scale and preserves pinch zoom. No maximum-scale is imposed.
})();
