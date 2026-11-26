import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';

const fail = message => { throw new Error(message); };
const pngPath = path.resolve('og-image.png');
const png = fs.readFileSync(pngPath);
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
if (png.length < 100 || !png.subarray(0,8).equals(signature)) fail('og-image.png is missing or has an invalid PNG signature.');
const crcTable = new Uint32Array(256);
for (let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);crcTable[n]=c>>>0;}
const crc32 = data => {let c=0xffffffff;for(const byte of data)c=crcTable[(c^byte)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
let offset=8, width=0, height=0, bitDepth=0, colorType=0, sawEnd=false, sawPalette=false;
const idat=[];
while(offset+12<=png.length){
  const length=png.readUInt32BE(offset);
  if(length>png.length-offset-12)fail('PNG chunk exceeds file length (truncated image).');
  const type=png.toString('ascii',offset+4,offset+8);
  const data=png.subarray(offset+8,offset+8+length);
  const stored=png.readUInt32BE(offset+8+length);
  const actual=crc32(png.subarray(offset+4,offset+8+length));
  if(stored!==actual)fail('PNG chunk CRC mismatch: '+type);
  if(type==='IHDR'){if(length!==13)fail('Invalid PNG IHDR length.');width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];}
  if(type==='PLTE')sawPalette=true;
  if(type==='IDAT')idat.push(data);
  if(type==='IEND'){sawEnd=true;offset+=length+12;break;}
  offset+=length+12;
}
if(!sawEnd||offset!==png.length)fail('PNG is missing IEND or contains trailing/truncated bytes.');
if(width!==1200||height!==630)fail('Social image must be exactly 1200x630; got '+width+'x'+height+'.');
const channels=({0:1,2:3,3:1,4:2,6:4})[colorType];
if(!channels||![1,2,4,8,16].includes(bitDepth))fail('Unsupported PNG colour format.');
if(colorType===3&&!sawPalette)fail('Indexed PNG is missing PLTE palette.');
const decoded=inflateSync(Buffer.concat(idat));
const rowBytes=Math.ceil(width*channels*bitDepth/8);
if(decoded.length!==(rowBytes+1)*height)fail('PNG pixel stream is incomplete: decoded '+decoded.length+' bytes, expected '+((rowBytes+1)*height)+'.');
for(let y=0;y<height;y++){const filter=decoded[y*(rowBytes+1)];if(filter>4)fail('Invalid PNG row filter at row '+y+'.');}
const expectedSha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const htmlFiles=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(entry.isFile()&&entry.name.endsWith('.html'))htmlFiles.push(file);}}
const dist=path.resolve('dist');
if(!fs.existsSync(dist))fail('dist/ is missing; run the build before social metadata QA.');
walk(dist);
if(!htmlFiles.length)fail('No generated HTML files found in dist/.');
for(const file of htmlFiles){
  const html=fs.readFileSync(file,'utf8');
  const rel=path.relative(dist,file);
  const og=html.match(/<meta\s+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  const twitter=html.match(/<meta\s+name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  const type=html.match(/<meta\s+property=["']og:image:type["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  const card=html.match(/<meta\s+name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i)?.[1]||'';
  if(!og.endsWith('/og-image.png')||!twitter.endsWith('/og-image.png')||type!=='image/png'||card!=='summary_large_image')fail(rel+': missing supported PNG Open Graph/Twitter metadata.');
  const sha=html.match(/<meta\s+name=["']wa-build-sha["']\s+content=["']([0-9a-f]{40})["']/i)?.[1]||'';
  if(sha!==expectedSha)fail(rel+': build provenance mismatch (expected '+expectedSha+', got '+(sha||'missing')+').');
}
console.log('Social image QA passed: fully decoded '+width+'x'+height+' PNG ('+png.length+' bytes); '+htmlFiles.length+' HTML routes use PNG Open Graph/Twitter metadata and exact '+expectedSha+' build provenance.');
