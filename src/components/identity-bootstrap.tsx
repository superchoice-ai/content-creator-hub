import {useEffect} from "react";
import {supabase} from "@/integrations/supabase/client";
import {loadLiff} from "@/lib/liff-client";
function emit(detail:unknown){sessionStorage.setItem("sc_identity",JSON.stringify(detail));window.dispatchEvent(new CustomEvent("sc:identity",{detail}))}
export function IdentityBootstrap(){useEffect(()=>{let active=true;async function boot(){
  emit({role:"guest",inLineClient:false});
  const {data}=await supabase.auth.getSession();
  if(data.session){const r=await fetch("/api/auth/profile/sync",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`},credentials:"same-origin"});if(r.ok&&active)emit(await r.json());return}
  const liffId=import.meta.env["VITE_LINE_LIFF_ID"] as string|undefined;if(!liffId)return;
  sessionStorage.setItem("sc_return_url",location.href);const liff=await loadLiff();await liff.init({liffId,withLoginOnExternalBrowser:false});
  if(!liff.isInClient()||!liff.isLoggedIn()){if(active)emit({role:"guest",inLineClient:liff.isInClient()});return}
  const idToken=liff.getIDToken(),accessToken=liff.getAccessToken();if(!idToken||!accessToken)return;
  const r=await fetch("/api/auth/line/liff",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({idToken,accessToken})});if(r.ok&&active)emit(await r.json());
}void boot().catch(console.error);const {data:s}=supabase.auth.onAuthStateChange(()=>void boot());return()=>{active=false;s.subscription.unsubscribe()}},[]);return null}
