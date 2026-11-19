import fs from 'node:fs';
import assert from 'node:assert/strict';
const registry=JSON.parse(fs.readFileSync('calculator-definitions/registry.json','utf8'));
const indiaOnly=new Set(['income-tax-planner','lumpsum-sip','ppf-growth','epf-growth','gst','hra-exemption','ssy','nps','gratuity','stamp-duty','gold-jewelry','silver-jewelry','home-loan-eligibility','advanced-home-loan-eligibility','loan-against-property','flat-cost','capital-gain','property-calculator','home-loan-emi']);
for(const calc of registry.calculators){
 const html=fs.readFileSync(calc.slug+'/index.html','utf8');
 const locale=html.match(/property=["']og:locale["'] content=["']([^"']+)/i)?.[1];
 const image=html.match(/property=["']og:image["'] content=["']([^"']+)/i)?.[1];
 const type=html.match(/property=["']og:image:type["'] content=["']([^"']+)/i)?.[1];
 assert.equal(locale,indiaOnly.has(calc.id)?'en_IN':'en_US',calc.id+': Open Graph locale mismatch');
 assert.equal(image,'https://wealtharrays.com/og-image.png',calc.id+': OG image must be PNG');
 assert.equal(type,'image/png',calc.id+': OG image MIME mismatch');
 assert.match(html,/og:image:width["'] content=["']1200/i,calc.id+': OG width missing');
 assert.match(html,/og:image:height["'] content=["']630/i,calc.id+': OG height missing');
 assert.match(html,/twitter:image["'] content=["']https:\/\/wealtharrays\.com\/og-image\.png/i,calc.id+': Twitter image missing');
 assert.match(html,/id=["']country-select["']/i,calc.id+': country selector missing');
 assert.match(html,/id=["']currency-select["']/i,calc.id+': currency selector missing');
}
for(const page of ['index.html','tools.html']){
 const html=fs.readFileSync(page,'utf8');
 assert.match(html,/id=["']country-select["']/i,page+' country selector missing');
 assert.match(html,/id=["']currency-select["']/i,page+' currency selector missing');
}
const core=fs.readFileSync('wa-core.js','utf8');
const home=fs.readFileSync('homepage-business.js','utf8');
const widget=fs.readFileSync('widget.js','utf8');
const runtime=fs.readFileSync('wa-calculator-runtime.js','utf8');
const rootBuild=fs.readFileSync('scripts/root-cause-build.mjs','utf8');
assert.match(core,/function detectedCountry\(\)/);
assert.match(core,/replace\(\/_\/g,'-'\)/);
assert.match(widget,/currency:safeStorage\.get\('waCurrency'\)\|\|'USD'/);
assert.match(runtime,/currency:safeStorage\.get\('waCurrency'\)\|\|'USD'/,'Generated calculator runtime must not default to INR');
assert.doesNotMatch(widget,/function waLocale\(\)\{var value=String\(waLocale\(\)\)/,'Locale helper must not recurse');
assert.match(core,/function applyCountry\(\)/);
assert.match(core,/function applyCurrency\(\)/);
assert.match(home,/getElementById\('country-select'\)/);
assert.match(home,/function browserCountry\(\)/);
assert.match(home,/split\('@'\)\[0\]/);
assert.match(home,/function safeHomepageLocale\(\)/);
assert.match(home,/Intl\.getCanonicalLocales/);
assert.match(widget,/function waLocale\(\)/);
assert.match(core,/split\('@'\)\[0\]/);
assert.doesNotMatch(home,/Intl\.NumberFormat\(['"]en-IN/);
assert.doesNotMatch(widget,/toLocaleString\(['"]en-IN/);
assert.match(rootBuild,/priceCurrency.*pageLocale/);
const seo=JSON.parse(fs.readFileSync('global-seo-config.json','utf8'));
assert.match(seo.hreflangRule,/self-referencing en and x-default/);
for(const calc of registry.calculators){const html=fs.readFileSync(calc.slug+'/index.html','utf8');assert.match(html,/hreflang=[\"']en[\"']/i,calc.id+': en hreflang missing');assert.match(html,/hreflang=[\"']x-default[\"']/i,calc.id+': x-default hreflang missing');assert.doesNotMatch(html,/hreflang=[\"']en-(?:IN|US|GB)[\"']/i,calc.id+': do not publish regional hreflang without distinct localized URLs');}
console.log('Globalization regression PASS: '+registry.count+' calculator pages have page-aware og:locale, 1200x630 PNG social images and country/currency selectors; browser-locale currency defaults are configured.');
console.log('Hreflang variants en-IN/en-US/en-GB remain gated until distinct localized URLs exist; generic en/x-default tags are not fabricated.');
