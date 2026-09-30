/* Privacy-first product analytics hook. No financial input values are collected. */
(function(root){'use strict';
const KEY='wa_analytics_consent';
function consent(){try{return localStorage.getItem(KEY)==='granted'}catch(e){return false}}
function event(name,meta){if(!consent())return;if(!root.dataLayer)return;root.dataLayer.push({event:'wa_'+String(name).replace(/[^a-z0-9_]/gi,'_'),wa_meta:Object.assign({},meta||{})})}
root.WA_ANALYTICS=Object.freeze({consent,event});
})(window);