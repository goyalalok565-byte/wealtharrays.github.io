/* Synchronous theme preference only; intentionally kept below 1 KB to avoid a flash of the wrong theme. */
(function(){
  try{
    var theme=localStorage.getItem('waTheme');
    if(theme==='dark'||theme==='light')document.documentElement.dataset.theme=theme;
  }catch(_error){}
})();
