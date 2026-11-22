(function(){
  "use strict";
  const SESSION_KEY="waSupabaseSession";
  let authConfigPromise=null;
  function readSession(){
    try{return JSON.parse(localStorage.getItem(SESSION_KEY)||"null");}
    catch{return null;}
  }
  async function getAuthConfig(){
    if(!authConfigPromise){
      authConfigPromise=fetch("/v1/auth-config",{cache:"no-store"}).then(async response=>{
        if(!response.ok)throw new Error("Account sync is not configured yet. The site operator must finish Cloudflare and Supabase setup.");
        return response.json();
      }).catch(error=>{authConfigPromise=null;throw error;});
    }
    return authConfigPromise;
  }
  async function accessToken(){
    let session=readSession();
    if(!session?.access_token)throw new Error("Sign in to your Wealth Arrays account before syncing.");
    if(session.expires_at&&Date.now()/1000>session.expires_at-60){
      if(!session.refresh_token)throw new Error("Your session expired. Sign in again.");
      const config=await getAuthConfig();
      const response=await fetch(config.url.replace(/\/$/,"")+"/auth/v1/token?grant_type=refresh_token",{
        method:"POST",
        headers:{apikey:config.anon_key,"Content-Type":"application/json",Accept:"application/json"},
        body:JSON.stringify({refresh_token:session.refresh_token})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.msg||data.message||"Your session expired. Sign in again.");
      session={...session,...data,expires_at:data.expires_at||Math.floor(Date.now()/1000)+(data.expires_in||3600)};
      localStorage.setItem(SESSION_KEY,JSON.stringify(session));
    }
    return session.access_token;
  }
  async function request(path,options={}){
    const token=await accessToken();
    const method=(options.method||"GET").toUpperCase();
    const turnstileToken=["POST","DELETE","PUT","PATCH"].includes(method)?await window.WATurnstile.getToken():null;
    const response=await fetch(path,{
      ...options,
      headers:{"Content-Type":"application/json",Authorization:"Bearer "+token,...(turnstileToken?{"cf-turnstile-response":turnstileToken}:{}),...options.headers}
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      if(response.status===404||response.status===503)throw new Error("Cloud account service is not deployed or configured yet.");
      throw new Error(data.error?.message||"Cloud sync failed ("+response.status+").");
    }
    return data;
  }
  async function save(calculatorId,name,inputs){
    if(!/^[a-z0-9-]{1,80}$/.test(calculatorId))throw new Error("Invalid plan type.");
    if(!inputs||typeof inputs!=="object"||Array.isArray(inputs))throw new Error("Plan inputs are invalid.");
    return request("/v1/scenarios",{
      method:"POST",
      body:JSON.stringify({calculator_id:calculatorId,name,model_version:"1.0.0",inputs,results:null})
    });
  }
  async function latest(calculatorId){
    const data=await request("/v1/scenarios",{method:"GET"});
    return (data.scenarios||[]).find(item=>item.calculator_id===calculatorId)||null;
  }
  window.WACloudScenarios={save,latest};
})();
