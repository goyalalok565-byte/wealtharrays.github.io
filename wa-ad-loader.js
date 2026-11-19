(function(){
  const loadAds=()=>{
    const script=document.createElement("script");
    script.async=true;
    script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450";
    script.crossOrigin="anonymous";
    document.head.appendChild(script);
  };
  const scheduleAds=()=>{
    const heavyRoute=document.documentElement.hasAttribute("data-wa-calculator")||!!document.getElementById("wa-tools-grid")||location.pathname==="/tools.html"||location.pathname==="/tools";
    const delay=heavyRoute?5000:1500;
    setTimeout(()=>{
      if(typeof window.requestIdleCallback==="function")window.requestIdleCallback(loadAds,{timeout:2000});
      else loadAds();
    },delay);
  };
  try{
    const session=JSON.parse(localStorage.getItem("waSupabaseSession")||"null");
    if(!session||!session.access_token){scheduleAds();return;}
    fetch("/v1/billing/status",{headers:{Authorization:"Bearer "+session.access_token,Accept:"application/json"},cache:"no-store"})
      .then(async response=>{
        if(!response.ok)throw new Error("Subscription status unavailable");
        const data=await response.json();
        const subscription=data.subscription;
        const paid=subscription&&subscription.status==="active"&&subscription.current_period_end&&Date.parse(subscription.current_period_end)>Date.now();
        if(!paid)scheduleAds();
      })
      .catch(scheduleAds);
  }catch(_error){scheduleAds();}
})();
