/* Wealth Arrays — Phase 9 Smart Calculator Intelligence
   Local-first, deterministic assistant. No financial inputs leave the browser.
*/
(function () {
  'use strict';

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const pageTitle = () =>
    document.querySelector('h1')?.textContent?.trim() ||
    document.title.replace(/\s*[|—-].*$/, '').trim();

  const slug = location.pathname.split('/').pop().replace(/\.html$/, '');

  const names = {
    'sip-calculator':'SIP Calculator','compound-interest-calculator':'Compound Interest','mortgage-emi-calculator':'Mortgage / EMI','personal-loan-calculator':'Personal Loan','car-loan-calculator':'Car Loan','roi-calculator':'ROI Calculator','cagr-calculator':'CAGR Calculator','inflation-calculator':'Inflation Calculator','lumpsum-calculator':'Lump Sum Calculator','retirement-calculator':'Retirement Calculator','fixed-deposit-calculator':'Fixed Deposit Calculator','recurring-deposit-calculator':'Recurring Deposit Calculator','debt-payoff-calculator':'Debt Payoff Calculator','net-worth-calculator':'Net Worth Calculator','salary-to-hourly-calculator':'Salary to Hourly','freelance-rate-calculator':'Freelance Rate','overtime-pay-calculator':'Overtime Pay','income-tax-planner':'Income Tax Planner','profit-margin-calculator':'Profit Margin','simple-interest-calculator':'Simple Interest'
  };

  const related = {
    'sip-calculator':['compound-interest-calculator.html','retirement-calculator.html','inflation-calculator.html'],
    'compound-interest-calculator':['sip-calculator.html','fixed-deposit-calculator.html','inflation-calculator.html'],
    'mortgage-emi-calculator':['personal-loan-calculator.html','debt-payoff-calculator.html','car-loan-calculator.html'],
    'personal-loan-calculator':['mortgage-emi-calculator.html','debt-payoff-calculator.html','roi-calculator.html'],
    'car-loan-calculator':['mortgage-emi-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html'],
    'roi-calculator':['cagr-calculator.html','sip-calculator.html','compound-interest-calculator.html'],
    'cagr-calculator':['roi-calculator.html','sip-calculator.html','compound-interest-calculator.html'],
    'inflation-calculator':['sip-calculator.html','compound-interest-calculator.html','retirement-calculator.html'],
    'lumpsum-calculator':['sip-calculator.html','compound-interest-calculator.html','roi-calculator.html'],
    'retirement-calculator':['sip-calculator.html','inflation-calculator.html','compound-interest-calculator.html'],
    'fixed-deposit-calculator':['recurring-deposit-calculator.html','compound-interest-calculator.html','inflation-calculator.html'],
    'recurring-deposit-calculator':['fixed-deposit-calculator.html','compound-interest-calculator.html','sip-calculator.html'],
    'debt-payoff-calculator':['personal-loan-calculator.html','mortgage-emi-calculator.html','roi-calculator.html'],
    'net-worth-calculator':['retirement-calculator.html','roi-calculator.html','debt-payoff-calculator.html'],
    'salary-to-hourly-calculator':['freelance-rate-calculator.html','overtime-pay-calculator.html','income-tax-planner.html'],
    'freelance-rate-calculator':['salary-to-hourly-calculator.html','overtime-pay-calculator.html','profit-margin-calculator.html'],
    'overtime-pay-calculator':['salary-to-hourly-calculator.html','freelance-rate-calculator.html','income-tax-planner.html'],
    'income-tax-planner':['salary-to-hourly-calculator.html','freelance-rate-calculator.html','net-worth-calculator.html'],
    'profit-margin-calculator':['roi-calculator.html','freelance-rate-calculator.html','net-worth-calculator.html'],
    'simple-interest-calculator':['compound-interest-calculator.html','fixed-deposit-calculator.html','inflation-calculator.html']
  };

  function style() {
    if (document.getElementById('wa-smart-style')) return;
    const s = document.createElement('style');
    s.id = 'wa-smart-style';
    s.textContent = `
      .wa-smart{margin-top:14px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,var(--surface),var(--surface2));overflow:hidden}
      .wa-smart-head{display:flex;align-items:center;gap:9px;padding:13px 15px;border-bottom:1px solid var(--line)}
      .wa-smart-head strong{font-size:12px}.wa-smart-badge{margin-left:auto;font-size:9px;font-weight:900;letter-spacing:.08em;padding:5px 8px;border-radius:999px;background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--accent)}
      .wa-smart-body{padding:13px 15px;display:grid;gap:9px}.wa-smart-card{padding:11px 12px;border-radius:14px;background:var(--surface2);border:1px solid var(--line)}
      .wa-smart-card b{font-size:11px}.wa-smart-card p{margin:5px 0 0;font-size:10.5px;line-height:1.55;color:var(--muted)}
      .wa-smart-card.warn{border-color:color-mix(in srgb,var(--danger) 38%,var(--line));background:color-mix(in srgb,var(--danger) 5%,var(--surface2))}
      .wa-smart-card.warn b{color:var(--danger)}.wa-smart-card.info b{color:var(--accent)}
      .wa-smart-ask{display:flex;gap:8px}.wa-smart-ask input{flex:1;min-width:0;height:40px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:0 11px;color:var(--text);font-size:11px}
      .wa-smart-ask button{height:40px;border:0;border-radius:12px;background:var(--accent);color:white;padding:0 13px;font-size:10px;font-weight:900;cursor:pointer}
      .wa-smart-mini{font-size:9px;color:var(--muted);line-height:1.45}.wa-smart-links{display:flex;flex-wrap:wrap;gap:7px}
      .wa-smart-links a{font-size:9.5px;font-weight:800;padding:7px 9px;border-radius:999px;background:var(--surface);border:1px solid var(--line);color:var(--text)}
      .wa-input-error{border-color:var(--danger)!important;box-shadow:0 0 0 3px color-mix(in srgb,var(--danger) 10%,transparent)!important}
      .wa-input-ok{border-color:color-mix(in srgb,var(--accent2) 50%,var(--line))!important}
      .wa-smart-goal{display:grid;gap:7px}.wa-smart-goal strong{font-size:12px}.wa-smart-goal .goal-number{font-size:20px;font-weight:900;letter-spacing:-.04em;color:var(--accent)}
      @media(max-width:760px){.wa-smart{border-radius:18px}.wa-smart-body{padding:11px}.wa-smart-ask button{padding:0 10px}.wa-smart-links{display:grid;grid-template-columns:1fr 1fr}.wa-smart-links a{text-align:center;min-height:36px;display:flex;align-items:center;justify-content:center}}
    `;
    document.head.appendChild(s);
  }

  function ensure() {
    const root = document.querySelector('.calc-widget') || document.querySelector('#calc-widget') || document.querySelector('.calc-page');
    if (!root) return null;
    let box = document.getElementById('wa-smart');
    if (!box) {
      box = document.createElement('section');
      box.id = 'wa-smart';
      box.className = 'wa-smart';
      box.setAttribute('aria-label','Smart calculator assistant');
      box.innerHTML = `
        <div class="wa-smart-head"><span aria-hidden="true">✦</span><strong>Smart Calculator Assistant</strong><span class="wa-smart-badge">PRIVATE • LOCAL</span></div>
        <div class="wa-smart-body">
          <div id="wa-smart-live"></div>
          <div class="wa-smart-ask">
            <input id="wa-smart-question" autocomplete="off" placeholder="Ask: what does this result mean?" aria-label="Ask the calculator assistant">
            <button id="wa-smart-ask" type="button">Explain</button>
          </div>
          <div class="wa-smart-mini">Uses your calculator values in this browser. Financial inputs are not sent to an AI service.</div>
          <div class="wa-smart-links" id="wa-smart-links"></div>
        </div>`;
      root.appendChild(box);
    }
    return box;
  }

  function fields() {
    return [...document.querySelectorAll('.field input,.field select')].map((el) => {
      const label = el.closest('.field')?.querySelector('label')?.textContent?.trim() || el.name || el.id || 'value';
      const raw = String(el.value ?? '').trim();
      const value = raw === '' ? NaN : Number(raw);
      return {el,label,raw,value,id:(el.id||'').toLowerCase(),type:el.type||el.tagName.toLowerCase()};
    });
  }

  function resultRows() {
    return [...document.querySelectorAll('.calc-result-row')].map((row) => ({
      label: row.querySelector('.calc-result-label')?.textContent?.trim() || '',
      value: row.querySelector('.calc-result-value')?.textContent?.trim() || ''
    }));
  }

  function numberFromText(text) {
    if (!text) return null;
    let s = String(text).toLowerCase().replace(/[,₹$€£]/g,'').trim();
    const m = s.match(/(-?\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|million|billion|k|m)?/i);
    if (!m) return null;
    let n = Number(m[1]);
    const unit = (m[2]||'').toLowerCase();
    if (unit === 'crore' || unit === 'cr') n *= 10000000;
    else if (unit === 'lakh' || unit === 'lac') n *= 100000;
    else if (unit === 'million') n *= 1000000;
    else if (unit === 'billion') n *= 1000000000;
    else if (unit === 'k') n *= 1000;
    else if (unit === 'm') n *= 1000000;
    return Number.isFinite(n) ? n : null;
  }

  function fieldBy(words) {
    const all = fields();
    return all.find((f) => words.some((w) => `${f.id} ${f.label}`.toLowerCase().includes(w)));
  }

  function validateInputs() {
    const fs = fields();
    const warnings = [];
    fs.forEach((f) => {
      f.el.classList.remove('wa-input-error','wa-input-ok');
      if (f.raw === '') { f.el.setAttribute('aria-invalid','false'); return; }
      const min = f.el.min !== '' ? Number(f.el.min) : -Infinity;
      const max = f.el.max !== '' ? Number(f.el.max) : Infinity;
      const bad = !Number.isFinite(f.value) || f.value < min || f.value > max;
      f.el.classList.toggle('wa-input-error', bad);
      f.el.classList.toggle('wa-input-ok', !bad);
      f.el.setAttribute('aria-invalid', String(bad));
      if (bad) warnings.push(`${f.label} must stay between the allowed limits.`);
    });

    const t = pageTitle().toLowerCase();
    const rate = fieldBy(['rate','return','interest']);
    const inflation = fieldBy(['inflation']);
    const years = fieldBy(['year','term','period','duration']);
    const monthly = fieldBy(['monthly']);
    const amount = fieldBy(['amount','principal','investment','balance','cost']);

    if (rate && Number.isFinite(rate.value)) {
      if (rate.value > 20) warnings.push('The rate assumption is unusually high. Treat the result as a stress case, not a forecast.');
      else if ((t.includes('sip') || t.includes('investment') || t.includes('return')) && rate.value > 12)
        warnings.push('This return assumption is above a common long-term planning baseline. Compare it with a lower-return case.');
    }
    if (inflation && Number.isFinite(inflation.value) && inflation.value > 8)
      warnings.push('This inflation assumption is high. Keep it if intentional, but compare a lower and higher case.');
    if (years && Number.isFinite(years.value)) {
      if ((t.includes('sip') || t.includes('lump') || t.includes('compound') || t.includes('retirement')) && years.value < 3)
        warnings.push('A short time horizon makes investment projections especially sensitive to return assumptions.');
      if ((t.includes('loan') || t.includes('mortgage') || t.includes('emi')) && years.value > 30)
        warnings.push('A very long loan term can make the monthly payment look cheaper while materially increasing total interest.');
    }
    if (monthly && Number.isFinite(monthly.value) && amount && Number.isFinite(amount.value) && amount.value > 0 && monthly.value > amount.value * 0.5 && t.includes('sip'))
      warnings.push('Your monthly contribution is large relative to the starting amount. Make sure this reflects a sustainable cash-flow plan.');
    if (rate && inflation && Number.isFinite(rate.value) && Number.isFinite(inflation.value) && t.includes('investment') && rate.value <= inflation.value)
      warnings.push('Your expected return is not above inflation, so the projection may not grow purchasing power in real terms.');

    return warnings;
  }

  function explain() {
    const t = pageTitle().toLowerCase();
    const rows = resultRows();
    const first = rows[rows.length - 1]?.value || rows[0]?.value || '';
    if (t.includes('inflation')) return 'Inflation changes purchasing power. A larger future number does not automatically mean more real wealth.';
    if (t.includes('loan') || t.includes('mortgage') || t.includes('emi'))
      return 'The monthly payment is the cash-flow burden. Total interest is the financing cost on top of what you borrowed. A longer term usually lowers the payment but raises total interest.';
    if (t.includes('roi') || t.includes('cagr'))
      return 'This measures performance from the numbers you supplied. It does not prove the same return will continue.';
    if (t.includes('retirement'))
      return 'This is a planning estimate. The important question is whether the goal still works when returns are lower and inflation is higher.';
    if (t.includes('salary') || t.includes('freelance') || t.includes('overtime'))
      return 'The result is a rate or pay comparison, not necessarily take-home pay. Taxes, benefits, unpaid time and work expenses can change the real figure.';
    if (t.includes('margin')) return 'Margin tells you how much revenue remains after the costs included in this calculation.';
    if (t.includes('sip') || t.includes('lump') || t.includes('compound') || t.includes('deposit') || t.includes('interest'))
      return `The projection combines your contributions or starting balance with the assumed growth rate. ${first ? `The displayed future value is an estimate under those assumptions.` : 'Enter your values to see the estimate.'}`;
    return 'This result is mathematical, not a guarantee. Change one assumption at a time and compare realistic scenarios before making a financial decision.';
  }

  function scenarioTip() {
    const t = pageTitle().toLowerCase();
    if (t.includes('sip')) return 'Try increasing the monthly amount by 10–20% while keeping the return assumption unchanged. This shows the effect of contribution rate without mixing two variables.';
    if (t.includes('loan') || t.includes('mortgage') || t.includes('emi')) return 'Try the same loan with a shorter term. Compare the higher monthly payment against the interest saved.';
    if (t.includes('inflation')) return 'Run a lower and higher inflation case. The gap shows how sensitive purchasing power is to the assumption.';
    if (t.includes('retirement')) return 'Test lower returns and higher inflation first. A plan that only works in an optimistic case is not robust.';
    if (t.includes('roi') || t.includes('cagr')) return 'Compare the return with the holding period and your costs. A large percentage alone does not tell you whether the underlying decision was good.';
    return 'Run a conservative case and a more optimistic case. If the decision changes dramatically, the result is sensitive to your assumptions.';
  }

  function goalAnswer(question) {
    const q = question.toLowerCase();
    const target = numberFromText(q);
    if (!target || target <= 0) return null;

    const t = pageTitle().toLowerCase();
    const rateF = fieldBy(['rate','return','interest']);
    const yearsF = fieldBy(['year','term','period','duration']);
    const inflationF = fieldBy(['inflation']);
    if (!(t.includes('sip') || t.includes('investment') || t.includes('lump'))) return null;
    if (!rateF || !yearsF || !Number.isFinite(rateF.value) || !Number.isFinite(yearsF.value) || yearsF.value <= 0) return null;

    const annual = rateF.value / 100;
    const n = Math.max(1, Math.round(yearsF.value * 12));
    const monthlyRate = annual / 12;
    let monthly;
    if (monthlyRate === 0) monthly = target / n;
    else monthly = target / (((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate));

    const inflation = inflationF && Number.isFinite(inflationF.value) ? inflationF.value : 0;
    const realTarget = target / Math.pow(1 + inflation / 100, yearsF.value);
    const rounded = Math.ceil(monthly / 100) * 100;

    return `<div class="wa-smart-card wa-smart-goal">
      <strong>Goal estimate</strong>
      <div class="goal-number">${esc(rounded.toLocaleString('en-IN'))} / month</div>
      <p>At ${esc(rateF.value)}% assumed annual return for ${esc(yearsF.value)} years, this is the approximate monthly contribution needed to target ${esc(target.toLocaleString('en-IN'))}. It is a mathematical estimate, not a guaranteed outcome.</p>
      ${inflation > 0 ? `<p>At ${esc(inflation)}% inflation, that target would have purchasing power of roughly ${esc(Math.round(realTarget).toLocaleString('en-IN'))} in today's money.</p>` : ''}
    </div>`;
  }

  function render() {
    const box = ensure();
    if (!box) return;
    const live = box.querySelector('#wa-smart-live');
    const warnings = validateInputs();
    const fs = fields();
    const hasInput = fs.some((f) => f.raw !== '');
    let html = '';

    if (warnings.length) {
      html += `<div class="wa-smart-card warn"><b>Check this assumption</b><p>${esc(warnings[0])}</p>${warnings.length > 1 ? `<p>${esc(warnings[1])}</p>` : ''}</div>`;
    } else if (!hasInput) {
      html += '<div class="wa-smart-card info"><b>Start with your numbers</b><p>Enter the values you want to test. The assistant will flag unusual assumptions and explain the result in plain language.</p></div>';
    } else {
      html += `<div class="wa-smart-card"><b>What this means</b><p>${esc(explain())}</p></div>`;
      html += `<div class="wa-smart-card"><b>Next scenario</b><p>${esc(scenarioTip())}</p></div>`;
    }

    const links = box.querySelector('#wa-smart-links');
    live.innerHTML = html;
    if (links) {
      links.innerHTML = (related[slug] || []).map((p) =>
        `<a href="${esc(p)}">${esc(names[p.replace(/\.html$/,'')] || p.replace(/\.html$/,'').replace(/-/g,' '))}</a>`
      ).join('');
    }
  }

  function ask() {
    const q = document.getElementById('wa-smart-question');
    const out = document.getElementById('wa-smart-live');
    if (!q || !out) return;
    const text = q.value.trim();
    if (!text) return;

    const goal = goalAnswer(text);
    if (goal) {
      out.innerHTML = goal;
      return;
    }

    const x = text.toLowerCase();
    let answer = explain();
    if (x.includes('inflation') || x.includes('today'))
      answer = 'Inflation-adjusted value estimates purchasing power, not the bank or investment account balance.';
    else if (x.includes('profit') || x.includes('gain'))
      answer = 'Profit or gain is the amount above the starting cost or contributions. A negative figure means the ending value is below the starting value.';
    else if (x.includes('interest'))
      answer = 'For a loan, interest is the financing cost. For a deposit or investment, interest is growth earned under the stated assumptions.';
    else if (x.includes('risk') || x.includes('safe'))
      answer = 'The calculator cannot make an investment safe. Use conservative assumptions and verify current rates, fees, taxes and product terms.';
    else if (x.includes('better') || x.includes('should'))
      answer = 'There is no universally best input. Compare realistic scenarios and focus on affordability, cost, growth, inflation-adjusted value and sensitivity.';
    else if (x.includes('why') || x.includes('meaning'))
      answer = explain();

    out.innerHTML = `<div class="wa-smart-card"><b>Assistant</b><p>${esc(answer)}</p></div>`;
  }

  function init() {
    style();
    ensure();
    render();

    const root = document.querySelector('.calc-widget') || document.querySelector('#calc-widget') || document.body;
    let timer;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(render, 120);
    };
    root.addEventListener('input', refresh, {passive:true});
    root.addEventListener('change', refresh, {passive:true});

    document.getElementById('wa-smart-ask')?.addEventListener('click', ask);
    document.getElementById('wa-smart-question')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ask();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();


/* Phase 9 Pass 6–8 enhancement: voice input + interactive scenarios + mobile resilience */
(function(){
  'use strict';
  function addEnhancements(){
    const box=document.getElementById('wa-smart');
    if(!box||box.dataset.phase9Enhanced)return;
    box.dataset.phase9Enhanced='1';
    const ask=box.querySelector('.wa-smart-ask');
    const input=box.querySelector('#wa-smart-question');
    const explainBtn=box.querySelector('#wa-smart-ask');
    if(!ask||!input||!explainBtn)return;

    const voice=document.createElement('button');
    voice.type='button'; voice.className='wa-smart-voice'; voice.setAttribute('aria-label','Speak your question'); voice.setAttribute('aria-pressed','false'); voice.textContent='🎙';
    const status=document.createElement('div'); status.className='wa-smart-status'; status.setAttribute('aria-live','polite');
    ask.insertBefore(voice,explainBtn); ask.insertAdjacentElement('afterend',status);

    const Speech=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!Speech){ voice.hidden=true; status.textContent='Voice input is unavailable in this browser. You can still type your question.'; }
    else {
      let recognition=null;
      voice.addEventListener('click',()=>{
        if(recognition){recognition.stop();return;}
        recognition=new Speech(); recognition.lang=document.documentElement.lang||'en-IN'; recognition.interimResults=false; recognition.maxAlternatives=1;
        recognition.onstart=()=>{voice.setAttribute('aria-pressed','true');voice.textContent='●';status.textContent='Listening… speak your question.';};
        recognition.onresult=e=>{const text=e.results[0][0].transcript||'';input.value=text;status.textContent='Voice captured. Explaining your question…';explainBtn.click();};
        recognition.onerror=e=>{status.textContent=e.error==='not-allowed'?'Microphone permission was not granted. Type your question instead.':'Voice input could not be completed. Try again or type your question.';};
        recognition.onend=()=>{recognition=null;voice.setAttribute('aria-pressed','false');voice.textContent='🎙';};
        try{recognition.start();}catch(e){recognition=null;}
      });
    }

    const scenarios=document.createElement('div'); scenarios.className='wa-smart-scenarios'; scenarios.setAttribute('aria-label','Quick scenario suggestions');
    const presets=['Explain result','Conservative case','What changes most?'];
    presets.forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{input.value=label==='Explain result'?'What does this result mean?':label==='Conservative case'?'Show me how to think about a conservative scenario': 'What assumption changes this result the most?';explainBtn.click();});scenarios.appendChild(b);});
    status.insertAdjacentElement('afterend',scenarios);

    // Keep focus visible and prevent assistant UI from being clipped on narrow screens.
    input.addEventListener('focus',()=>setTimeout(()=>input.scrollIntoView({block:'nearest',behavior:'smooth'}),50));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addEnhancements,{once:true});else setTimeout(addEnhancements,0);
})();


/* Production fix: Smart Assistant answer handler must survive calculator re-renders. */
(function(){
  function respond(){
    var q=document.getElementById('wa-smart-question');
    var out=document.getElementById('wa-smart-live');
    if(!q||!out)return;
    var question=q.value.trim();
    if(!question){out.innerHTML='<div class="wa-smart-card info"><b>Ask a question</b><p>For example: What does this result mean? Is this a good scenario? What changes if I invest more?</p></div>';return;}
    var x=question.toLowerCase(), answer='';
    try{
      if(x.includes('what')&&x.includes('mean')) answer=(typeof explain==='function'?explain():'This result is an estimate based on the numbers you entered.');
      else if(x.includes('result')||x.includes('explain')) answer=(typeof explain==='function'?explain():'This result is based on your current inputs.');
      else if(x.includes('scenario')||x.includes('more')||x.includes('change')) answer=(typeof scenarioTip==='function'?scenarioTip():'Try changing one number at a time and compare the result.');
      else if(x.includes('risk')||x.includes('safe')) answer='No calculator can guarantee a safe investment or outcome. Use realistic assumptions and compare a conservative case.';
      else if(x.includes('best')||x.includes('should')) answer='There is no single best answer without your goals and constraints. Compare affordability, cost and realistic scenarios.';
      else answer=(typeof explain==='function'?explain():'Based on the numbers you entered, this is a mathematical estimate, not a guarantee.');
      out.innerHTML='<div class="wa-smart-card"><b>Assistant answer</b><p>'+String(answer).replace(/[<>&]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;'}[c];})+'</p></div>';
    }catch(err){console.error('Smart assistant response failed',err);out.innerHTML='<div class="wa-smart-card warn"><b>Try again</b><p>The calculator is working, but the assistant could not interpret that question. Try: “What does this result mean?”</p></div>';}
  }
  document.addEventListener('click',function(e){if(e.target&&e.target.id==='wa-smart-ask'){e.preventDefault();respond();}});
  document.addEventListener('keydown',function(e){if(e.target&&e.target.id==='wa-smart-question'&&e.key==='Enter'){e.preventDefault();respond();}});
  window.waSmartRespond=respond;
})();
