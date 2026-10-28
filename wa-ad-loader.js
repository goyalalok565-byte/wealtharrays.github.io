(function(){
  const loadAds=()=>{
    const script=document.createElement("script");
    script.async=true;
    script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450";
    script.crossOrigin="anonymous";
    document.head.appendChild(script);
  };
  try{
    const session=JSON.parse(localStorage.getItem("waSupabaseSession")||"null");
    if(!session||!session.access_token){loadAds();return;}
    fetch("/v1/billing/status",{headers:{Authorization:"Bearer "+session.access_token,Accept:"application/json"},cache:"no-store"})
      .then(async response=>{
        if(!response.ok)throw new Error("Subscription status unavailable");
        const data=await response.json();
        const subscription=data.subscription;
        const paid=subscription&&subscription.status==="active"&&subscription.current_period_end&&Date.parse(subscription.current_period_end)>Date.now();
        if(!paid)loadAds();
      })
      .catch(loadAds);
  }catch(_error){loadAds();}
})();
