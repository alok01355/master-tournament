import { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, where } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Shield, Trophy, Users, Clock3, LogOut, Plus, KeyRound, Gamepad2, CreditCard, Menu } from "lucide-react";

const fmt = v => v?.toDate ? v.toDate().toLocaleString() : "To be announced";
const msg = e => e?.message || "Something went wrong.";

function AuthPanel() {
  const [mode,setMode]=useState("login"), [name,setName]=useState(""), [email,setEmail]=useState(""), [password,setPassword]=useState(""), [busy,setBusy]=useState(false), [error,setError]=useState("");
  async function submit(e){
    e.preventDefault(); setBusy(true); setError("");
    try {
      if(mode==="signup"){
        const cred=await createUserWithEmailAndPassword(auth,email,password);
        await updateProfile(cred.user,{displayName:name});
        await setDoc(doc(db,"users",cred.user.uid),{displayName:name,email,role:"player",createdAt:serverTimestamp()});
      } else await signInWithEmailAndPassword(auth,email,password);
    } catch(err){setError(msg(err));} finally{setBusy(false);}
  }
  return <div className="auth-wrap"><form className="auth card" onSubmit={submit}>
    <div className="brand-mark">M</div><p className="eyebrow">MASTER ESPORTS</p><h1>{mode==="login"?"Welcome back":"Create player account"}</h1><p className="muted">Join community tournaments and follow your matches.</p>
    {mode==="signup"&&<label>Player name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Your in-game name"/></label>}
    <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label>Password<input required minLength="6" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></label>
    {error&&<p className="error">{error}</p>}<button className="primary full" disabled={busy}>{busy?"Please wait…":mode==="login"?"Log in":"Create account"}</button>
    <p className="muted center">{mode==="login"?"New player?":"Already registered?"} <button type="button" className="text-btn" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"Create account":"Log in"}</button></p>
  </form></div>;
}

function App(){
  const [user,setUser]=useState(undefined), [profile,setProfile]=useState(null), [tab,setTab]=useState("tournaments"), [tournaments,setTournaments]=useState([]), [myRegs,setMyRegs]=useState([]), [notice,setNotice]=useState(""), [isAdmin,setIsAdmin]=useState(false);
  const [uid,setUid]=useState(""), [gameName,setGameName]=useState("");
  const [newTitle,setNewTitle]=useState(""), [newMode,setNewMode]=useState("Squad"), [newDate,setNewDate]=useState(""), [newSlots,setNewSlots]=useState("48");
  const [roomId,setRoomId]=useState(""), [roomPass,setRoomPass]=useState(""), [selected,setSelected]=useState("");
  const [payMethod,setPayMethod]=useState("UPI"), [payNote,setPayNote]=useState("");
  useEffect(()=>onAuthStateChanged(auth,async u=>{
    setUser(u||null);
    if(u){const s=await getDoc(doc(db,"users",u.uid)); const p=s.exists()?s.data():{}; setProfile(p); setIsAdmin(p.role==="admin");}
    else {setProfile(null);setIsAdmin(false);}
  }),[]);
  useEffect(()=>{
    if(!user)return;
    return onSnapshot(query(collection(db,"tournaments"),orderBy("startAt","asc")),s=>setTournaments(s.docs.map(d=>({id:d.id,...d.data()}))),e=>setNotice(msg(e)));
  },[user]);
  useEffect(()=>{
    if(!user)return;
    return onSnapshot(query(collection(db,"registrations"),where("playerId","==",user.uid)),s=>setMyRegs(s.docs.map(d=>({id:d.id,...d.data()}))),e=>setNotice(msg(e)));
  },[user]);
  const registered=useMemo(()=>new Set(myRegs.map(r=>r.tournamentId)),[myRegs]);
  async function register(t){
    if(!uid.trim()||!gameName.trim()){setNotice("Add your Free Fire UID and in-game name in your profile first.");setTab("profile");return;}
    try{
      await addDoc(collection(db,"registrations"),{playerId:user.uid,playerName:user.displayName||profile?.displayName||"Player",tournamentId:t.id,tournamentTitle:t.title,freeFireUid:uid.trim(),gameName:gameName.trim(),status:"pending",createdAt:serverTimestamp()});
      setNotice("Registration request sent. Admin approval is required.");
    }catch(e){setNotice(msg(e));}
  }
  async function saveProfile(e){e.preventDefault();try{await setDoc(doc(db,"users",user.uid),{displayName:user.displayName||profile?.displayName||"Player",email:user.email,role:profile?.role||"player",freeFireUid:uid,gameName,updatedAt:serverTimestamp()},{merge:true});setNotice("Profile saved.");}catch(e){setNotice(msg(e));}}
  async function createTournament(e){e.preventDefault();try{await addDoc(collection(db,"tournaments"),{title:newTitle,mode:newMode,slots:Number(newSlots),startAt:Timestamp.fromDate(new Date(newDate)),status:"open",createdAt:serverTimestamp()});setNewTitle("");setNotice("Tournament created.");}catch(e){setNotice(msg(e));}}
  async function saveRoom(e){e.preventDefault();try{await setDoc(doc(db,"tournaments",selected),{roomId,roomPassword:roomPass,roomReleasedAt:serverTimestamp()},{merge:true});setNotice("Room details saved. They are only visible after the scheduled start time.");}catch(e){setNotice(msg(e));}}
  async function updateRegistration(id,status){try{await setDoc(doc(db,"registrations",id),{status,reviewedAt:serverTimestamp()},{merge:true});setNotice("Registration updated.");}catch(e){setNotice(msg(e));}}
  if(user===undefined)return <div className="loading">Loading MASTER…</div>;
  if(!user)return <AuthPanel/>;
  const active=tournaments.filter(t=>t.status!=="cancelled");
  return <div className="app-shell">
    <aside className="sidebar"><div className="logo"><span className="brand-mark small">M</span><b>MASTER</b></div><p className="eyebrow">PLAYER ARENA</p>
      {[["tournaments",Trophy,"Tournaments"],["my",Users,"My matches"],["profile",Gamepad2,"Player profile"],["payments",CreditCard,"Payments"],...(isAdmin?[["admin",Shield,"Admin panel"]]:[])].map(([id,Icon,label])=><button key={id} className={"nav "+(tab===id?"active":"")} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}
      <div className="sidebar-bottom"><span className="muted tiny">{user.email}</span><button className="nav" onClick={()=>signOut(auth)}><LogOut size={18}/>Log out</button></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">COMMUNITY ESPORTS PLATFORM</p><h2>{tab==="tournaments"?"Tournament hub":tab==="my"?"My matches":tab==="profile"?"Player profile":tab==="payments"?"Payment options":"Admin control room"}</h2></div><div className="user-pill"><span className="avatar">{(user.displayName||"P")[0].toUpperCase()}</span><span>{user.displayName||"Player"}</span></div></header>
      {notice&&<div className="notice" role="status">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      {tab==="tournaments"&&<><section className="hero"><div><p className="eyebrow gold">YOUR NEXT MATCH STARTS HERE</p><h1>Play smart.<br/><em>Compete together.</em></h1><p>Discover upcoming community matches and track your tournament journey.</p><button className="primary" onClick={()=>document.getElementById("tournament-list")?.scrollIntoView({behavior:"smooth"})}>Explore tournaments</button></div><div className="hero-art"><div className="ring">M</div><span className="floating">SEASON 01</span></div></section><div className="stats"><div className="stat card"><Trophy/><b>{active.length}</b><span>Open tournaments</span></div><div className="stat card"><Users/><b>{myRegs.length}</b><span>My registrations</span></div><div className="stat card"><Clock3/><b>Live schedule</b><span>Match time updates</span></div></div><section id="tournament-list"><div className="section-head"><div><p className="eyebrow">FIND YOUR MATCH</p><h3>Upcoming tournaments</h3></div></div>{active.length===0?<div className="card empty">No tournaments yet. Check back soon.</div>:<div className="tournament-grid">{active.map(t=><article className="card tournament" key={t.id}><div className="tournament-top"><span className="mode">{t.mode||"Squad"}</span><span className="status">{t.status||"open"}</span></div><h3>{t.title}</h3><div className="meta"><span><Clock3 size={15}/>{fmt(t.startAt)}</span><span><Users size={15}/>{t.slots||"—"} slots</span></div><button className="primary full" disabled={registered.has(t.id)} onClick={()=>register(t)}>{registered.has(t.id)?"Request submitted":"Request to join"}</button><p className="tiny muted">Free-entry community event • Subject to admin approval</p></article>)}</div>}</section></>}
      {tab==="my"&&<section><p className="eyebrow">YOUR ACTIVITY</p><h3>My tournament registrations</h3>{myRegs.length===0?<div className="card empty">You have not requested to join a tournament yet.</div>:<div className="card table-wrap"><table><thead><tr><th>Tournament</th><th>IGN / UID</th><th>Status</th><th>Room details</th></tr></thead><tbody>{myRegs.map(r=>{const t=tournaments.find(x=>x.id===r.tournamentId);const released=t?.startAt?.toDate&&Date.now()>=t.startAt.toDate().getTime();return <tr key={r.id}><td>{r.tournamentTitle}</td><td>{r.gameName}<br/><small>{r.freeFireUid}</small></td><td><span className="status">{r.status}</span></td><td>{r.status==="approved"&&released&&t?.roomId?<><b>ID:</b> {t.roomId}<br/><b>Password:</b> {t.roomPassword||"—"}</>:"Available to approved players at match time"}</td></tr>})}</tbody></table></div>}</section>}
      {tab==="profile"&&<section className="narrow"><p className="eyebrow">PLAYER IDENTITY</p><h3>Complete your player profile</h3><form className="card form-card" onSubmit={saveProfile}><label>Account email<input value={user.email||""} disabled/></label><label>Free Fire in-game name<input value={gameName} onChange={e=>setGameName(e.target.value)} placeholder="Your in-game name" required/></label><label>Free Fire UID<input value={uid} onChange={e=>setUid(e.target.value)} placeholder="Enter your player UID" required/></label><button className="primary">Save profile</button></form></section>}
      {tab==="payments"&&<section className="narrow"><p className="eyebrow">PAYMENT INFORMATION</p><h3>Payment options</h3><div className="card payment-card"><div className="payment-icon"><CreditCard/></div><h3>UPI and QR payments</h3><p className="muted">Payment support can be enabled for lawful, non-wagering services such as optional platform membership or merchandise. This V1 does not collect tournament entry stakes, betting deposits, prize pools, or withdrawals.</p><div className="payment-methods"><span>UPI</span><span>QR code</span><span>Card / Netbanking</span></div><label>Preferred method<select value={payMethod} onChange={e=>setPayMethod(e.target.value)}><option>UPI</option><option>QR code</option><option>Card / Netbanking</option></select></label><label>Reference / question (optional)<input value={payNote} onChange={e=>setPayNote(e.target.value)} placeholder="Do not enter bank PIN, OTP or password"/></label><div className="notice subtle">Real payment processing is not connected yet. Ask a parent/guardian or responsible adult to review legal requirements and configure a regulated payment provider before accepting any payments.</div><button className="secondary full" onClick={()=>setNotice("Payment gateway is not active in this demo build.")}>Check payment setup</button></div></section>}
      {tab==="admin"&&isAdmin&&<section><p className="eyebrow">ADMIN ONLY</p><h3>Manage tournaments</h3><div className="admin-grid"><form className="card form-card" onSubmit={createTournament}><h3><Plus size={18}/> Create tournament</h3><label>Tournament name<input required value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Weekend Squad Cup"/></label><label>Mode<select value={newMode} onChange={e=>setNewMode(e.target.value)}><option>Solo</option><option>Duo</option><option>Squad</option></select></label><label>Start date and time<input type="datetime-local" required value={newDate} onChange={e=>setNewDate(e.target.value)}/></label><label>Player slots<input type="number" min="1" value={newSlots} onChange={e=>setNewSlots(e.target.value)}/></label><button className="primary">Publish tournament</button></form><form className="card form-card" onSubmit={saveRoom}><h3><KeyRound size={18}/> Room credentials</h3><label>Select tournament<select required value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose tournament</option>{tournaments.map(t=><option value={t.id} key={t.id}>{t.title}</option>)}</select></label><label>Room ID<input required value={roomId} onChange={e=>setRoomId(e.target.value)}/></label><label>Room password<input required value={roomPass} onChange={e=>setRoomPass(e.target.value)}/></label><p className="tiny muted">Credentials are shown only to approved registrants after the scheduled match start time. Use secure server-side rules in production.</p><button className="primary">Save room details</button></form></div><h3 className="subheading">Registration requests</h3><div className="card table-wrap"><table><thead><tr><th>Player</th><th>Game ID</th><th>Tournament</th><th>Status / action</th></tr></thead><tbody>{myRegs.length===0?<tr><td colSpan="4">No registrations loaded for this admin account. For production, use a server-side admin query.</td></tr>:myRegs.map(r=><tr key={r.id}><td>{r.playerName}</td><td>{r.gameName} / {r.freeFireUid}</td><td>{r.tournamentTitle}</td><td>{r.status} <button className="text-btn" onClick={()=>updateRegistration(r.id,"approved")}>Approve</button></td></tr>)}</tbody></table></div></section>}
      <footer>MASTER © {new Date().getFullYear()} <span>Community tournaments • Play fair • Respect everyone</span></footer>
    </main>
  </div>;
}
export default App;