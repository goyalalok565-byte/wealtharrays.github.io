/* Wealth Arrays localization foundation. Language and jurisdiction are separate concepts. */
(function(root){'use strict';
const messages={en:{scenario:'Scenario Lab',goal:'Goal Planner',compare:'Compare scenarios',share:'Share scenario',methodology:'Methodology'},hi:{scenario:'Scenario Lab',goal:'Goal Planner',compare:'Scenarios compare karein',share:'Scenario share karein',methodology:'Methodology'}};
function t(key,lang){return (messages[lang]||messages.en)[key]||messages.en[key]||key}
const supportedLanguages=Object.freeze(Object.keys(messages));
root.WA_I18N=Object.freeze({messages,t,supportedLanguages});
if(typeof module!=='undefined'&&module.exports)module.exports={messages,t,supportedLanguages};
})(typeof window!=='undefined'?window:globalThis);