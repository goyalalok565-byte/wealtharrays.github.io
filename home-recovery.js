/* Isolated homepage runtime: search, controls, consent and PWA install.
   It intentionally does not change cards, categories, colours or page content. */
(function(){
  const run=()=>{
    const $=s=>document.querySelector(s);

    // Currency fallback: guarantees the existing selector is populated and usable.
    const cur=$('#currency-select');
    if(cur){
      const currencies=[
        ['INR','₹','Indian Rupee'],['USD','$','US Dollar'],['EUR','€','Euro'],
        ['GBP','£','British Pound'],['AED','د.إ','UAE Dirham'],['CAD','C$','Canadian Dollar'],
        ['AUD','A$','Australian Dollar'],['SGD','S$','Singapore Dollar']
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

    // Dedicated search suggestions. Explicit display avoids hidden-state/CSS conflicts.
    const q=$('#tool-search'), box=$('#tool-search-results');
    if(q&&box){
      const cards=[...document.querySelectorAll('.home-tool-card[data-search]')];
      const aliases={
        sip:['sip','systematic investment','mutual fund','monthly investment'],
        emi:['emi','mortgage','home loan','monthly payment'],
        fd:['fd','fixed deposit'],rd:['rd','recurring deposit'],
        roi:['roi','return','investment return'],cagr:['cagr','annual growth'],
        tax:['tax','income tax'],salary:['salary','hourly','overtime'],
        loan:['loan','mortgage','personal loan','car loan']
      };
      const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const render=()=>{
        const raw=q.value.trim().toLowerCase();
        if(!raw){box.innerHTML='';box.hidden=true;box.style.display='none';return;}
        const terms=[raw,...(aliases[raw]||[])];
        const matches=cards.map(card=>{
          const hay=((card.dataset.search||'')+' '+card.textContent).toLowerCase();
          const score=Math.max(...terms.map(t=>hay.includes(t)?(hay.startsWith(t)?3:2):0),0);
          return {card,score};
        }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
        box.innerHTML=matches.length?matches.map(({card})=>{
          const title=card.querySelector('b')?.textContent||'Calculator';
          const desc=card.querySelector('p')?.textContent||'';
          return '<a href="'+esc(card.getAttribute('href')||'#')+'"><span>'+esc(title)+'</span><small>'+esc(desc)+'</small><b>→</b></a>';
        }).join(''):'<div class="tool-search-empty">No exact match. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
        box.hidden=false;box.style.display='block';
      };
      q.oninput=render;q.onfocus=render;
      q.onkeydown=e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none'}};
      document.addEventListener('pointerdown',e=>{if(!q.contains(e.target)&&!box.contains(e.target)){box.hidden=true;box.style.display='none';}});
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