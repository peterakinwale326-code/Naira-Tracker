"use client";
import React,{useEffect,useRef,useState} from "react";
import {useRouter} from "next/navigation";
import {AppLayout} from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
import {Bot,Send,ExternalLink,Loader2} from "lucide-react";
const API=API_BASE_URL;
type Source={title:string;url:string};
type Message={role:"assistant"|"user";text:string;sources?:Source[]};
export default function AssistantPage(){
 const {user,isLoading}=useAuth();const router=useRouter();
 const [input,setInput]=useState(""),[busy,setBusy]=useState(false),[provider,setProvider]=useState("");
 const [messages,setMessages]=useState<Message[]>([{role:"assistant",text:"Hello. I’m Naira Tracker, your AI research assistant for Nigerian inflation, purchasing power and household budgets. I use available official and independent statistical sources, and I’ll tell you when a figure cannot be verified."}]);
 const bottom=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!isLoading&&!user)router.replace("/login")},[isLoading,user,router]);
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"})},[messages,busy]);
 async function send(e:React.FormEvent){e.preventDefault();const q=input.trim();if(!q||busy)return;
  const next=[...messages,{role:"user" as const,text:q}];setMessages(next);setInput("");setBusy(true);
  try{
   const history=next.slice(-25,-1).map(m=>({role:m.role,content:m.text}));
   const response=await fetch(API+"/api/v1/assistant/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:q,history})});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(data.message||"The model service is unavailable. Configure a self-hosted Ollama service on the backend.");
   const sources:Source[]=Array.isArray(data.sources)?data.sources.filter((source:Source)=>typeof source.title==="string"&&typeof source.url==="string"&&/^https?:\/\//i.test(source.url)):[];
   setProvider(data.providerLabel||data.provider||"AI");setMessages(m=>[...m,{role:"assistant",text:data.answer||"The model returned an empty response.",sources}]);
  }catch(err:any){setMessages(m=>[...m,{role:"assistant",text:err?.message||"I couldn't reach the AI service. Please try again."}]);}
  finally{setBusy(false);}
 }
 if(isLoading||!user)return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Loading assistant…</div>;
 return <AppLayout><div className="nt-eyebrow">Research / Assistant</div><h1 className="nt-heading">Naira Tracker assistant</h1><p className="nt-subtitle mb-6">A self-hosted AI assistant that searches sources when it needs more context.</p><div className="nt-card max-w-4xl"><div className="flex items-center justify-between border-b border-[#e6e2d9] pb-4"><div className="flex items-center gap-3"><span className="w-10 h-10 rounded-full bg-[#f3ead8] text-[#80602d] grid place-items-center"><Bot size={20}/></span><div><div className="text-sm font-semibold">Naira Tracker AI</div><div className="text-[10px] text-stone-500">{provider||"Self-hosted Ollama · local inference"}</div></div></div><span className="nt-pill">{provider?"MODEL ACTIVE":"OPEN-WEIGHT AI"}</span></div><div className="min-h-[330px] max-h-[55vh] overflow-y-auto py-5 space-y-4" aria-live="polite">{messages.map((m,i)=><div key={i} className={m.role==="user"?"flex justify-end":"flex flex-col items-start"}><div className={m.role==="user"?"max-w-[85%] rounded-2xl rounded-br-sm bg-[#171713] text-white px-4 py-3 text-sm":"max-w-[85%] rounded-2xl rounded-bl-sm bg-[#f2f0e9] text-[#292820] px-4 py-3 text-sm leading-6 whitespace-pre-wrap"}>{m.text}</div>{m.sources?.length?<div className="mt-2 flex max-w-[85%] flex-wrap gap-2 text-xs"><span className="w-full font-semibold text-stone-500">Web sources</span>{m.sources.map((source,index)=><a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noopener noreferrer" className="underline text-stone-600 hover:text-black">{source.title}</a>)}</div>:null}</div>)}{busy&&<div className="flex items-center gap-2 text-xs text-stone-400"><Loader2 size={14} className="animate-spin"/>Thinking, checking statistics and searching when needed…</div>}<div ref={bottom}/></div><form onSubmit={send} className="flex gap-2 border-t border-[#e6e2d9] pt-4"><input className="flex-1 min-w-0 rounded-full border border-[#dcd8ce] bg-transparent px-4 py-3 text-sm outline-none focus:border-[#b38a45]" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question about Nigeria or anything else…" aria-label="Ask a question"/><button className="nt-button !rounded-full" disabled={!input.trim()||busy} aria-label="Send question"><Send size={15}/></button></form><div className="mt-4 flex flex-wrap gap-2">{["Explain Nigeria’s latest inflation trend","How does inflation affect ₦100,000?","Compare NBS and World Bank inflation","Help me plan a monthly budget"].map(q=><button key={q} onClick={()=>setInput(q)} className="rounded-full border border-[#e6e2d9] px-3 py-2 text-[10px] text-stone-600 hover:bg-[#f5f3ed]">{q}</button>)}</div><p className="mt-5 text-[10px] leading-5 text-stone-500">Current statistics are only presented when a verified source observation is available. General answers come from the model’s learned knowledge and may be outdated. Answers based on web results include links to their sources. <a className="underline inline-flex items-center gap-1" href="https://microdata.nigerianstat.gov.ng/index.php/catalog/154/related-materials" target="_blank" rel="noreferrer">NBS releases <ExternalLink size={10}/></a></p></div></AppLayout>;
}
