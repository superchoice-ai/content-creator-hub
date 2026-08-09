export type LiffSdk = { init(c:{liffId:string;withLoginOnExternalBrowser?:boolean}):Promise<void>; isInClient():boolean; isLoggedIn():boolean; login(c?:{redirectUri?:string}):void; getIDToken():string|null; getAccessToken():string|null };
declare global { interface Window { liff?: LiffSdk } }
let pending: Promise<LiffSdk> | undefined;
export function loadLiff(){
  if(window.liff) return Promise.resolve(window.liff);
  if(pending) return pending;
  pending=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://static.line-scdn.net/liff/edge/2/sdk.js";s.async=true;s.onload=()=>window.liff?resolve(window.liff):reject(new Error("LIFF unavailable"));s.onerror=()=>reject(new Error("LIFF load failed"));document.head.appendChild(s)});
  return pending;
}

import { LINE_LIFF_ID } from "@/config/line";

let initPending: Promise<LiffSdk> | undefined;

/**
 * Initialises LIFF exactly once per page load.
 * withLoginOnExternalBrowser stays false so a normal browser is never
 * auto-redirected to LINE (that caused the login/refresh loop).
 */
export function initLiff() {
  if (initPending) return initPending;
  initPending = loadLiff().then(async (liff) => {
    await liff.init({ liffId: LINE_LIFF_ID, withLoginOnExternalBrowser: false });
    return liff;
  });
  return initPending;
}
