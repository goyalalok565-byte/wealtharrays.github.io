import fs from 'node:fs';
const htmlFiles=fs.readdirSync('.').filter(x=>x.endsWith('.html'));
const requiredRoutes=['scenario-lab.html','goal-planner.html','financial-workspace.html'];
for(const f of requiredRoutes)if(!fs.existsSync(f))throw new Error('Missing route: '+f);
for(const f of htmlFiles){
 const s=fs.readFileSync(f,'utf8');
 if(/<img(?![^>]*\balt=)/i.test(s))throw new Error('Image without alt contract: '+f);
 if(/<button(?![^>]*(?:aria-label|>\s*[^<]+\s*<\/button>))/i.test(s))throw new Error('Potential unnamed button: '+f);
 if(/href=["']{2}/i.test(s))throw new Error('Empty href: '+f);
}
const sitemap=fs.readFileSync('sitemap.xml','utf8');for(const r of ['/scenario-lab','/goal-planner','/financial-workspace'])if(!sitemap.includes('https://wealtharrays.com'+r))throw new Error('Sitemap route missing: '+r);
const seo=JSON.parse(fs.readFileSync('global-seo-config.json','utf8'));if(!seo.supportedLanguages.length||!seo.countryCodes.length)throw new Error('Global SEO config incomplete');
const privacy=fs.readFileSync('privacy/README.md','utf8');for(const x of ['consent','export','deletion','advertising'])if(!privacy.toLowerCase().includes(x))throw new Error('Privacy contract missing: '+x);
console.log('Global quality gates PASS: route integrity, accessibility baseline, sitemap, localization config and privacy contract.');
