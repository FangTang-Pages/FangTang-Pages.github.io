(() => {
  'use strict';
  const page=window.PortfolioPage;
  if(!page)return;
  const templates=new Map();
  let home=document.body.classList.contains('motion-home')?document.querySelector('main'):null;
  let busy=false,serial=0,pendingHistory=null;
  const routeKey=url=>url.pathname+url.search;
  let mountedKey=routeKey(new URL(location.href));
  const currentKey=()=>location.pathname.split('/').pop()||'index.html';
  const isHome=url=>['','index.html'].includes(url.pathname.split('/').pop());
  const supports=url=>url.origin===location.origin&&['index.html','project.html','other.html',''].includes(url.pathname.split('/').pop());
  function template(url){
    const key=url.pathname;
    if(!templates.has(key)){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
      templates.set(key,fetch(key,{credentials:'same-origin',signal:controller.signal}).then(r=>{if(!r.ok)throw Error('Page unavailable');return r.text();}).then(text=>new DOMParser().parseFromString(text,'text/html')).catch(e=>{templates.delete(key);throw e;}).finally(()=>clearTimeout(timer)));
    }
    return templates.get(key);
  }
  function state(value){document.body.dataset.routeState=value;}
  function revealHeroTitle(){
    const hero=document.querySelector('.entry-hero');
    if(hero)requestAnimationFrame(()=>{if(hero.isConnected)hero.classList.add('is-title-visible');});
  }
  state('ready');
  function attachVideo(){
    const slot=document.querySelector('.entry-video-slot');
    if(!slot)return;
    let video=page.opening()?.video;
    if(!video){video=document.createElement('video');video.src='assets/lumi-opening-enhanced.mp4';video.poster='assets/lumi-opening-enhanced-poster.webp';video.preload='metadata';video.muted=true;video.playsInline=true;}
    video.pause();video.controls=false;video.className='entry-paused-video';video.removeAttribute('autoplay');
    slot.append(video);
  }
  function returnVideo(){
    const opening=page.opening();if(!opening)return;
    opening.video.className='';opening.film.prepend(opening.video);opening.video.pause();
  }
  function overlayFrom(link){
    if(!link?.closest('.motion-card'))return null;
    const media=link.querySelector('.motion-media'),rect=media.getBoundingClientRect();
    const layer=document.createElement('div');layer.className='project-transition';layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,borderRadius:getComputedStyle(media).borderRadius});
    let visual;
    if(media.id==='lumi-slot'&&page.opening()){
      page.opening().suspend();visual=page.opening().video;visual.style.transform=getComputedStyle(visual).transform;visual.pause();visual.className='';
    }else{const source=media.querySelector('img');visual=source.cloneNode(true);visual.style.transform=getComputedStyle(source).transform;visual.loading='eager';}
    layer.append(visual);document.body.append(layer);return layer;
  }
  async function navigate(url,{link=null,pop=false}={}){
    if(busy)return;busy=true;const token=++serial;state('loading');
    const oldUrl=location.href,oldMain=document.querySelector('main');
    let overlay=overlayFrom(link),mounted=false;
    try{
      const destinationHome=isHome(url);
      const doc=destinationHome&&home?null:await template(url);
      if(token!==serial)return;
      if(pendingHistory){returnVideo();overlay?.remove();overlay=null;return;}
      page.opening()?.suspend();
      // Persist the directory DOM and the exact video decoder/frame, rather than loading them again.
      if(oldMain.querySelector('.motion-intro'))home=oldMain;
      if(!pop)history.pushState({portfolioView:destinationHome?'work':'project'},'',url);
      document.documentElement.classList.remove('intro-sequence-locked');
      document.body.classList.remove('modal-open');
      document.querySelectorAll('dialog[open]').forEach(d=>d.close());
      let nextMain;
      if(destinationHome&&home){nextMain=home;returnVideo();}
      else{
        nextMain=doc.querySelector('main').cloneNode(true);
        document.querySelector('#lightbox')?.remove();
        const dialog=doc.querySelector('#lightbox');if(dialog)document.body.append(dialog.cloneNode(true));
      }
      document.body.className=destinationHome?'home-page motion-home':'selected-page';
      oldMain.replaceWith(nextMain);mounted=true;
      scrollTo({top:0,behavior:'instant'});
      if(destinationHome&&home===nextMain){page.opening().resume(url.searchParams.get('view')!=='intro');document.title='方星月 · 设计作品集';}
      else{
        if(destinationHome){home=nextMain;page.mount();}
        else{page.mount();if(currentKey()==='other.html')document.title='其他项目 · 方星月';}
      }
      mountedKey=routeKey(new URL(location.href));
      const target=document.querySelector('.entry-hero .image-trigger,.entry-video-button');
      if(!destinationHome&&target){
        state('expanding');
        // The video is moved into the transition before its destination, keeping currentTime unchanged.
        if(!overlay?.querySelector('video'))attachVideo();
        target.style.visibility='hidden';
        await new Promise(resolve=>requestAnimationFrame(resolve));
        if(overlay){
          const r=target.getBoundingClientRect();
          overlay.firstElementChild.animate([{transform:overlay.firstElementChild.style.transform},{transform:'none'}],{duration:620,fill:'forwards'});
          nextMain.animate([{opacity:0},{opacity:1}],{duration:380,delay:160,fill:'both'});
          await overlay.animate([{left:overlay.style.left,top:overlay.style.top,width:overlay.style.width,height:overlay.style.height,borderRadius:overlay.style.borderRadius},{left:`${r.left}px`,top:`${r.top}px`,width:`${r.width}px`,height:`${r.height}px`,borderRadius:'0px'}],{duration:620,easing:'cubic-bezier(.22,.7,.2,1)',fill:'forwards'}).finished;
          if(overlay.querySelector('video')){overlay.firstElementChild.getAnimations().forEach(a=>a.cancel());overlay.firstElementChild.style.transform='';attachVideo();}
        }
        target.style.visibility='';overlay?.remove();overlay=null;revealHeroTitle();
      }else{overlay?.remove();overlay=null;}
      if(url.hash){const anchor=document.getElementById(decodeURIComponent(url.hash.slice(1)));anchor?.scrollIntoView({block:'start',behavior:'instant'});}
      if(!destinationHome){const focus=document.querySelector('main h1');if(focus){focus.tabIndex=-1;focus.focus({preventScroll:true});}}
    }catch(error){
      overlay?.remove();returnVideo();
      if(pendingHistory)return;
      if(!mounted&&oldUrl===location.href)location.assign(url.href);
      else location.replace(url.href);
    }finally{busy=false;state('ready');if(pendingHistory){const pending=pendingHistory;pendingHistory=null;navigate(pending,{pop:true});}}
  }
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const videoButton=event.target.closest('.entry-video-button');
    if(videoButton){event.preventDefault();openVideo(videoButton);return;}
    const link=event.target.closest('a[href]');if(!link||link.download||link.target)return;
    const url=new URL(link.href,location.href);if(!supports(url))return;
    // Native chapter links and the opening's own home controls keep their existing behavior.
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
    if(isHome(url)&&document.querySelector('.motion-intro'))return;
    if(link.classList.contains('identity'))url.searchParams.set('view','intro');
    event.preventDefault();event.stopImmediatePropagation();navigate(url,{link});
  },true);
  document.addEventListener('pointerover',event=>{
    const link=event.target.closest('.motion-card a');if(!link)return;
    const url=new URL(link.href);if(supports(url))template(url).catch(()=>{});
  },{passive:true});
  document.addEventListener('focusin',event=>{const link=event.target.closest('.motion-card a');if(link)template(new URL(link.href)).catch(()=>{});});
  addEventListener('popstate',()=>{
    const url=new URL(location.href);if(!supports(url))return;
    // Finish a pending expansion before honoring history, without introducing a second history entry.
    if(busy){pendingHistory=url;document.querySelector('.project-transition')?.getAnimations().forEach(a=>a.finish());}
    else if(routeKey(url)!==mountedKey)navigate(url,{pop:true});
  });
  function openVideo(opener){
    let dialog=document.querySelector('#entry-video-dialog');
    if(!dialog){
      dialog=document.createElement('dialog');dialog.id='entry-video-dialog';dialog.setAttribute('aria-label','LUMI 视频');
      dialog.innerHTML='<button class="entry-video-close" aria-label="关闭视频">×</button><video controls playsinline preload="none" src="assets/lumi-opening-enhanced.mp4"></video>';
      document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());
      dialog.addEventListener('close',()=>{dialog.querySelector('video').pause();document.body.classList.remove('modal-open');dialog.returnFocus?.focus({preventScroll:true});});
    }
    dialog.returnFocus=opener;const video=dialog.querySelector('video');video.currentTime=0;dialog.showModal();document.body.classList.add('modal-open');video.play().catch(()=>{});
  }
  attachVideo();
  requestAnimationFrame(revealHeroTitle);
})();
