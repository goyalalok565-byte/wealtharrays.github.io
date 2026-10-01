import fs from 'node:fs';
const required=['research/data/sip-contribution-timing-study.json','research/data/inflation-purchasing-power-study.json','research/data/emi-term-cost-study.json','research/data/cagr-endpoint-study.json','research/data/real-return-rate-study.json'];
for(const f of required) if(!fs.existsSync(f)) throw new Error('Missing research dataset: '+f);
for(const f of required){const s=JSON.parse(fs.readFileSync(f,'utf8'));for(const k of ['schema_version','study_id','model_id','model_version','method','assumptions','rows','limitations']) if(s[k]===undefined) throw new Error('Research contract missing '+k+' in '+s.study_id);if(!Array.isArray(s.rows)||!s.rows.length) throw new Error('Research dataset has no rows: '+s.study_id);}
const g=fs.readFileSync('scripts/generate-research-datasets.mjs','utf8');
if(!g.includes("financial-engine.js")||!g.includes("decision-adapters.js")) throw new Error('Research generator is not tied to canonical deterministic engines');
console.log('Research data audit PASS.');