/* Lightweight accessibility checks for development/QA builds. */
(function(){'use strict';
function audit(root){root=root||document;return {missingLabels:[...root.querySelectorAll('input,select,textarea')].filter(x=>!x.labels?.length&&!x.getAttribute('aria-label')).length,imagesWithoutAlt:[...root.images].filter(x=>!x.hasAttribute('alt')).length,emptyLinks:[...root.querySelectorAll('a')].filter(x=>!x.getAttribute('href')).length,buttonsWithoutName:[...root.querySelectorAll('button')].filter(x=>!(x.textContent||'').trim()&&!x.getAttribute('aria-label')).length}}
window.WA_ACCESSIBILITY={audit:audit};
})();