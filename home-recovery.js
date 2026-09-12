/* Isolated homepage runtime: search, controls, consent and PWA install.
   It intentionally does not change cards, categories, colours or page content. */
(function(){
  const run=()=>{
    const $=s=>document.querySelector(s);

    // Currency fallback: guarantees the existing selector is populated and usable.
    const cur=$('#currency-select');
    if(cur){
      const currencies=[
['USD','
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.prepend(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Australian Dollar'],['CAD','C
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','¥','Chinese Yuan'],['HKD','HK
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Hong Kong Dollar'],['NZD','NZ
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Mexican Peso'],['INR','₹','Indian Rupee'],['RUB','₽','Russian Ruble'],['ZAR','R','South African Rand'],['TRY','₺','Turkish Lira'],['BRL','R
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();,'Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['PKR','₨','Pakistani Rupee']
      ];
      if(!cur.options.length) cur.innerHTML=currencies.map(c=>'<option value="'+c[0]+'">'+c[0]+' · '+c[1]+' · '+c[2]+'</option>').join('');
      cur.value=localStorage.getItem('waCurrency')||cur.value||'INR';
      document.documentElement.dataset.currency=cur.value;
      cur.addEventListener('change',()=>{localStorage.setItem('waCurrency',cur.value);document.documentElement.dataset.currency=cur.value;window.dispatchEvent(new Event('wa-currency'));});
    }

    // Theme fallback: one click must always toggle the root data-theme.
    const theme=$('#theme-toggle');
    if(theme){
      const apply=t=>{
        document.documentElement.dataset.theme=t;
        localStorage.setItem('waTheme',t);
        const label=theme.querySelector('[data-theme-label]');
        if(label) label.textContent=t==='dark'?'Light mode':'Dark mode';
      };
      apply(localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
      theme.onclick=()=>apply(document.documentElement.dataset.theme==='dark'?'light':'dark');
    }

    // Dedicated homepage search: independent from all other scripts.
    const q=$('#tool-search'), results=$('#tool-search-results');
    if(q&&results){
      const cards=Array.from(document.querySelectorAll('.home-tool-card'));
      const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const aliases={
        sip:'sip systematic investment plan mutual fund monthly investment',
        emi:'emi mortgage home loan monthly payment',
        fd:'fd fixed deposit',
        rd:'rd recurring deposit',
        roi:'roi return investment profit',
        cagr:'cagr compound annual growth',
        tax:'tax income tax',
        salary:'salary hourly overtime income',
        loan:'loan mortgage personal car debt'
      };
      const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=normalize(q.value);
        if(!raw){results.innerHTML='';results.hidden=true;results.style.cssText='display:none';return;}
        const query=(raw+' '+(aliases[raw]||'')).split(' ').filter(Boolean);
        const found=cards.map(card=>{
          const hay=normalize((card.dataset.search||'')+' '+card.textContent);
          let score=0;
          query.forEach(term=>{if(hay.includes(term))score+=term===raw?10:1;});
          return {card,score};
        }).filter(x=>x.score>0).sort((x,y)=>y.score-x.score).slice(0,8);
        results.innerHTML=found.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a class="wa-search-suggestion" href="'+esc(card.getAttribute('href'))+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b>→</b></a>';
        }).join('')||'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        results.hidden=false;
        results.style.setProperty('display','block','important');
        results.style.setProperty('visibility','visible','important');
        results.style.setProperty('opacity','1','important');
      };
      q.addEventListener('input',render);
      q.addEventListener('focus',render);
      q.addEventListener('keyup',render);
      document.addEventListener('click',e=>{if(!q.contains(e.target)&&!results.contains(e.target)){results.hidden=true;results.style.setProperty('display','none','important');}});
    }

    // Consent banner: use the same consent key as analytics, so incognito/new visitors see it.
    if(!localStorage.getItem('waAnalyticsConsent') && !$('#wa-consent')){
      const box=document.createElement('div');
      box.id='wa-consent';
      box.setAttribute('role','dialog');
      box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which tools are useful.</p></div><div class="wa-consent-actions"><button type="button" data-consent="denied">Reject</button><button type="button" data-consent="granted">Accept analytics</button></div>';
      box.querySelectorAll('[data-consent]').forEach(btn=>btn.onclick=()=>{
        const value=btn.dataset.consent;
        localStorage.setItem('waAnalyticsConsent',value);
        if(typeof window.gtag==='function') window.gtag('consent','update',{analytics_storage:value==='granted'?'granted':'denied'});
        box.remove();
      });
      document.body.appendChild(box);
    }

    // PWA install notification: visible on every fresh page open until the app is installed.
    if(!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone){
      let deferredPrompt=null;
      const toast=document.createElement('div');
      toast.id='wa-install-toast';
      toast.innerHTML='<img src="favicon-v2.svg" alt=""><div><strong>Install Wealth Arrays</strong><span>Keep it on your home screen and use it like an app.</span></div><button type="button" data-install>Install</button><button type="button" data-close aria-label="Close">×</button>';
      document.body.appendChild(toast);
      const install=toast.querySelector('[data-install]');
      window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
      install.onclick=async()=>{
        if(deferredPrompt){
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt=null;
        }else{
          alert('If the install window does not open yet, reload once after this page finishes installing, then tap Install again. In Chrome you can also use ⋮ → Install app.');
        }
      };
      toast.querySelector('[data-close]').onclick=()=>toast.remove();
      window.addEventListener('appinstalled',()=>toast.remove());
      if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
})();