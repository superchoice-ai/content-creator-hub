const enc=new TextEncoder();
function b64(v:Uint8Array|string){const a=typeof v==="string"?enc.encode(v):v;let s="";a.forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_")}
function bytes(v:string){v=v.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-v.length%4)%4);return Uint8Array.from(atob(v),c=>c.charCodeAt(0))}
async function key(secret:string){return crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign","verify"])}
export type PortalSession={sub:string;role:"member"|"admin";exp:number};
export async function signSession(p:PortalSession){const s=process.env["APP_SESSION_SECRET"];if(!s||s.length<32)throw new Error("APP_SESSION_SECRET must be >=32 chars");const body=b64(JSON.stringify(p));return body+"."+b64(new Uint8Array(await crypto.subtle.sign("HMAC",await key(s),enc.encode(body))))}
export async function verifySession(t:string){const s=process.env["APP_SESSION_SECRET"];if(!s||!t.includes("."))return null;const [b,x]=t.split(".") as [string,string];if(!await crypto.subtle.verify("HMAC",await key(s),bytes(x),enc.encode(b)))return null;const p=JSON.parse(new TextDecoder().decode(bytes(b))) as PortalSession;return p.exp>Date.now()/1000?p:null}
export function readSession(r:Request){return(r.headers.get("cookie")??"").split(";").map(x=>x.trim()).find(x=>x.startsWith("sc_session="))?.slice(11)??""}
