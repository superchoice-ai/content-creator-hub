export type LiffSdk = { init(c:{liffId:string;withLoginOnExternalBrowser?:boolean}):Promise<void>; isInClient():boolean; isLoggedIn():boolean; login(c?:{redirectUri?:string}):void; getIDToken():string|null; getAccessToken():string|null };
declare global { interface Window { liff?: LiffSdk } }
let pending: Promise<LiffSdk> | undefined;
export function loadLiff(){
  if(window.liff) return Promise.resolve(window.liff);
  if(pending) return pending;
  pending=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://static.line-scdn.net/liff/edge/2/sdk.js";s.async=true;s.onload=()=>window.liff?resolve(window.liff):reject(new Error("LIFF unavailable"));s.onerror=()=>reject(new Error("LIFF load failed"));document.head.appendChild(s)});
  return pending;
}
