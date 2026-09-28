const crypto=require('crypto');
const {createClient}=require('@supabase/supabase-js');
function env(name){const v=process.env[name];if(!v)throw new Error(`Thiếu Environment Variable: ${name}`);return v}
function supabase(){return createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}})}
function json(res,status,obj){res.status(status).setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.end(JSON.stringify(obj))}
function getBody(req){if(req.body&&typeof req.body==='object')return req.body;if(typeof req.body==='string'){try{return JSON.parse(req.body)}catch(e){return {}}}return {}}
function safeName(s){return String(s||'file').normalize('NFKD').replace(/[^A-Za-z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').slice(0,160)||'file'}
function cookies(req){const out={};String(req.headers.cookie||'').split(';').forEach(p=>{const i=p.indexOf('=');if(i>0)out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())});return out}
function b64url(v){return Buffer.from(v).toString('base64url')}
function signAdmin(){const p=b64url(JSON.stringify({role:'admin',exp:Date.now()+7*24*3600*1000}));const sig=crypto.createHmac('sha256',env('SESSION_SECRET')).update(p).digest('base64url');return `${p}.${sig}`}
function verifyAdminToken(token){try{const [p,s]=String(token||'').split('.');if(!p||!s)return false;const expected=crypto.createHmac('sha256',env('SESSION_SECRET')).update(p).digest();const got=Buffer.from(s,'base64url');if(got.length!==expected.length||!crypto.timingSafeEqual(got,expected))return false;const d=JSON.parse(Buffer.from(p,'base64url').toString('utf8'));return d.role==='admin'&&Number(d.exp)>Date.now()}catch(e){return false}}
function requireAdmin(req,res){if(!verifyAdminToken(cookies(req).vatly_admin)){json(res,401,{message:'Phiên Admin đã hết hạn. Hãy đăng nhập lại.'});return false}return true}
function safeEqual(a,b){const x=Buffer.from(String(a||'')),y=Buffer.from(String(b||''));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function requireProcessor(req,res){const auth=String(req.headers.authorization||'');const key=auth.startsWith('Bearer ')?auth.slice(7):String(req.headers['x-processor-key']||'');if(!safeEqual(key,env('PROCESSOR_KEY'))){json(res,401,{message:'Processor Key không đúng.'});return false}return true}
function publicObjectUrl(bucket,path){const root=env('SUPABASE_URL').replace(/\/$/,'');return `${root}/storage/v1/object/public/${encodeURIComponent(bucket)}/${String(path).split('/').map(encodeURIComponent).join('/')}`}
function siteUrl(path){const root=(process.env.PUBLIC_SITE_URL||'').replace(/\/$/,'');return root?root+path:path}
function allowMethod(req,res,methods){if(!methods.includes(req.method)){res.setHeader('Allow',methods.join(', '));json(res,405,{message:'Method not allowed'});return false}return true}
module.exports={env,supabase,json,getBody,safeName,cookies,signAdmin,requireAdmin,requireProcessor,safeEqual,publicObjectUrl,siteUrl,allowMethod};
