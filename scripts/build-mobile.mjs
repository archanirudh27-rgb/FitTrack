import { promises as fs } from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root=process.cwd();
const out=path.join(root,'www');
await fs.rm(out,{recursive:true,force:true});
await fs.mkdir(out,{recursive:true});

const entries=await fs.readdir(root,{withFileTypes:true});
for(const entry of entries){
  const name=entry.name;
  if(['www','android','node_modules','.git','supabase','scripts','src','.github'].includes(name))continue;
  const src=path.join(root,name),dst=path.join(out,name);
  if(entry.isDirectory()){
    if(['assets','icons'].includes(name))await fs.cp(src,dst,{recursive:true});
    continue;
  }
  if(/\.(html|js|css|webmanifest|svg|png|jpg|jpeg|webp)$/i.test(name))await fs.copyFile(src,dst);
}

try{await fs.copyFile(path.join(root,'privacy-policy.html'),path.join(out,'privacypolicy.html'))}catch{}

await build({
  entryPoints:[path.join(root,'src/mobile-health-adapter.ts')],
  outfile:path.join(out,'mobile-health-adapter.js'),
  bundle:true,
  format:'iife',
  platform:'browser',
  target:['es2020'],
  minify:false,
  sourcemap:false
});

const indexPath=path.join(out,'index.html');
let html=await fs.readFile(indexPath,'utf8');
html=html.replace('<script src="health-connect-bridge.js?v=20260826-47"></script>','<script src="mobile-health-adapter.js"></script><script src="health-connect-bridge.js?v=20260826-47"></script>');
await fs.writeFile(indexPath,html);
console.log('FitTrack mobile web bundle ready in www/');
