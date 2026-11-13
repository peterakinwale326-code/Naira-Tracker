"use client";
import React,{useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {AppLayout} from "@/components/AppLayout";
import { API_BASE_URL } from "@/lib/api";
import {useAuth} from "@/context/AuthContext";
import {Save,UserRound,Mail,CalendarDays} from "lucide-react";
const API=API_BASE_URL;
export default function ProfilePage(){
 const {user,token,isLoading}=useAuth(); const router=useRouter();
 const [name,setName]=useState(""); const [createdAt,setCreatedAt]=useState(""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
 useEffect(()=>{if(!isLoading&&!user)router.replace("/login");if(user)setName(user.name)},[isLoading,user,router]);
 useEffect(()=>{if(!token)return;fetch(API+"/api/v1/auth/me",{headers:{Authorization:"Bearer "+token},cache:"no-store"}).then(r=>r.ok?r.json():null).then(p=>{if(p?.createdAt)setCreatedAt(p.createdAt)}).catch(()=>{})},[token]);
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");setError("");try{const r=await fetch(API+"/api/v1/auth/me",{method:"PATCH",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({name})});const data=await r.json();if(!r.ok)throw new Error(data.message||"Could not update profile");setMessage("Profile updated. Sign out and back in to refresh the name shown in all existing sessions.");}catch(e){setError(e instanceof Error?e.message:"Profile update failed")}finally{setBusy(false)}}
 if(isLoading||!user)return <div className="min-h-screen grid place-items-center text-sm text-stone-500">Loading profile…</div>;
 return <AppLayout><div className="nt-eyebrow">Account / Profile</div><h1 className="nt-heading">Your profile</h1><p className="nt-subtitle mb-7">Manage the personal details attached to your Naira Tracker account.</p><div className="nt-card max-w-2xl"><div className="flex items-center gap-4 pb-6 border-b border-[#e6e2d9]"><div className="w-14 h-14 rounded-full bg-[#f3ead8] text-[#80602d] grid place-items-center"><UserRound size={24}/></div><div><div className="font-semibold">{user.name}</div><div className="text-xs text-stone-500">{user.email}</div></div></div><form onSubmit={save} className="pt-6 space-y-5"><div className="nt-field"><label htmlFor="profile-name">Full name</label><input id="profile-name" value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={80} required/></div><div><div className="flex items-center gap-2 text-xs text-stone-500"><Mail size={14}/> Email address</div><p className="mt-1 text-sm font-medium">{user.email}</p><p className="mt-1 text-[10px] text-stone-400">Email changes are not enabled in this version.</p></div>{createdAt&&<div className="flex items-center gap-2 text-xs text-stone-500"><CalendarDays size={14}/> Member since {new Date(createdAt).toLocaleDateString("en-NG",{day:"numeric",month:"long",year:"numeric"})}</div>}{message&&<p className="text-xs text-green-700">{message}</p>}{error&&<p className="text-xs text-red-700">{error}</p>}<button className="nt-button" disabled={busy}><Save size={14}/>{busy?"Saving…":"Save changes"}</button></form></div></AppLayout>;
}
