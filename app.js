const state = {
  user: JSON.parse(localStorage.getItem("sigopat_user") || "null"),
  questions: [],
  lessons: [],
  leaderboard: [],
  currentLesson: null,
  quiz: [],
  qIndex: 0,
  xp: 0,
  hearts: 5,
  answered: false
};

const fallbackQuestions = [
  {id:"demo1",lesson:"variables",question:"Manakah deklarasi variabel Go yang benar?",options:["var nama string = \"Budi\"","let nama = \"Budi\"","string nama := \"Budi\"","const var nama = \"Budi\""],answer:0,explanation:"Go menggunakan var atau short declaration :=. Bentuk var nama string = \"Budi\" valid."},
  {id:"demo2",lesson:"variables",question:"Tipe data yang cocok untuk menyimpan bilangan bulat adalah ...",options:["string","int","bool","float"],answer:1,explanation:"int digunakan untuk bilangan bulat."},
  {id:"demo3",lesson:"looping",question:"Keyword utama untuk membuat perulangan di Go adalah ...",options:["loop","for","while","repeat"],answer:1,explanation:"Go menggunakan for sebagai konstruksi perulangan."},
  {id:"demo4",lesson:"branching",question:"Keyword untuk percabangan kondisi di Go adalah ...",options:["if","when","check","caseif"],answer:0,explanation:"Go menggunakan if, else if, dan else."},
  {id:"demo5",lesson:"uts",question:"Sebelum UTS, konsep yang sebaiknya dikuasai adalah ...",options:["Variabel, tipe data, looping, dan percabangan","CSS saja","Database saja","Desain logo saja"],answer:0,explanation:"Materi UTS perlu mengikuti silabus, tetapi empat topik ini menjadi fokus awal Si Go Pat."}
];

const lessonDefs = [
  {id:"variables",title:"Variabel & Tipe Data",desc:"Kenalan dengan variabel, konstanta, tipe data, dan operator.",icon:"📦"},
  {id:"looping",title:"Looping",desc:"Latihan for, perulangan bersyarat, dan pola pengulangan.",icon:"🔁"},
  {id:"branching",title:"Percabangan",desc:"Latihan if, else, else if, dan switch.",icon:"🔀"},
  {id:"uts",title:"Persiapan UTS",desc:"Campuran latihan untuk menguji pemahaman materi dasar.",icon:"🏆"}
];

function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function save(){localStorage.setItem("sigopat_user",JSON.stringify(state.user))}
async function api(action,payload={}){
  if(!API_URL || API_URL.includes("TEMPEL_URL")){
    return demoApi(action,payload);
  }
  const r=await fetch(API_URL,{method:"POST",body:JSON.stringify({action,...payload})});
  return r.json();
}
function demoUsers(){
  let u=JSON.parse(localStorage.getItem("sigopat_demo_users")||"null");
  if(!u){u=[{id:"demo-budi",name:"Budi",password:"123456",xp:0,streak:0,progress:{}}];localStorage.setItem("sigopat_demo_users",JSON.stringify(u));}
  return u;
}
function demoApi(action,p){
  if(action==="login"){
    const u=demoUsers();
    const found=u.find(x=>x.name.toLowerCase()===p.name.toLowerCase()&&x.password===p.password);
    if(!found) return {ok:false,error:"Nama atau password salah. Belum punya akun? Daftar dulu, atau coba data demo: Budi / 123456."};
    return {ok:true,user:found};
  }
  if(action==="register"){
    const name=(p.name||"").trim(), password=p.password||"";
    if(!name||!password) return {ok:false,error:"Nama dan password wajib diisi."};
    if(password.length<4) return {ok:false,error:"Password minimal 4 karakter."};
    const u=demoUsers();
    if(u.find(x=>x.name.toLowerCase()===name.toLowerCase())) return {ok:false,error:"Nama sudah dipakai. Pilih nama lain atau masuk."};
    const user={id:"u"+Date.now(),name,password,xp:0,streak:0,progress:{}};
    u.push(user);localStorage.setItem("sigopat_demo_users",JSON.stringify(u));
    return {ok:true,user};
  }
  if(action==="getQuestions") return {ok:true,questions:fallbackQuestions};
  if(action==="getLeaderboard") return {ok:true,leaderboard:[{name:"Alya",xp:420},{name:"Budi",xp:360},{name:"Citra",xp:290},{name:state.user?.name||"Kamu",xp:state.user?.xp||0}]};
  if(action==="saveProgress") return {ok:true};
  return {ok:true};
}

function loginPage(msg=""){
 document.querySelector("#app").innerHTML=`
 <main class="login">
  <section class="login-card">
   <img class="logo" src="../assets/logo.png" alt="Si Go Pat">
   <h1>Masuk ke Si Go Pat</h1>
   <p class="subtitle">Belajar Go dasar dengan cara yang lebih seru.</p>
   <form id="loginForm">
    <div class="field"><label>Nama</label><input id="name" required placeholder="Masukkan nama"></div>
    <div class="field"><label>Password</label><input id="password" type="password" required placeholder="Masukkan password"></div>
    <button class="btn btn-primary full">Sign In</button>
    <div class="error" id="err">${esc(msg)}</div>
   </form>
   <p class="switch-link">Belum punya akun? <a href="#" id="toRegister">Daftar di sini</a></p>
  </section>
 </main>`;
 document.querySelector("#loginForm").onsubmit=async e=>{
  e.preventDefault(); const err=document.querySelector("#err");
  const res=await api("login",{name:name.value.trim(),password:password.value});
  if(!res.ok){err.textContent=res.error||"Login gagal.";err.style.display="block";return}
  state.user=res.user; state.xp=Number(res.user.xp||0); save(); renderHome();
 };
 document.querySelector("#toRegister").onclick=e=>{e.preventDefault();registerPage()};
}

function registerPage(msg=""){
 document.querySelector("#app").innerHTML=`
 <main class="login">
  <section class="login-card">
   <img class="logo" src="../assets/logo.png" alt="Si Go Pat">
   <h1>Daftar Akun Baru</h1>
   <p class="subtitle">Buat akun untuk mulai belajar Go dasar.</p>
   <form id="registerForm">
    <div class="field"><label>Nama</label><input id="rname" required placeholder="Masukkan nama"></div>
    <div class="field"><label>Password</label><input id="rpassword" type="password" required placeholder="Minimal 4 karakter"></div>
    <div class="field"><label>Ulangi Password</label><input id="rpassword2" type="password" required placeholder="Ketik ulang password"></div>
    <button class="btn btn-primary full">Daftar</button>
    <div class="error" id="rerr">${esc(msg)}</div>
   </form>
   <p class="switch-link">Sudah punya akun? <a href="#" id="toLogin">Sign in</a></p>
  </section>
 </main>`;
 document.querySelector("#registerForm").onsubmit=async e=>{
  e.preventDefault(); const err=document.querySelector("#rerr");
  err.style.display="none";
  if(rpassword.value!==rpassword2.value){err.textContent="Password dan ulangi password tidak sama.";err.style.display="block";return}
  const res=await api("register",{name:rname.value.trim(),password:rpassword.value});
  if(!res.ok){err.textContent=res.error||"Gagal mendaftar.";err.style.display="block";return}
  state.user=res.user; state.xp=Number(res.user.xp||0); save(); renderHome();
 };
 document.querySelector("#toLogin").onclick=e=>{e.preventDefault();loginPage()};
}

async function renderHome(){
 const qres=await api("getQuestions");
 state.questions=qres.questions||fallbackQuestions;
 const lres=await api("getLeaderboard");
 state.leaderboard=lres.leaderboard||[];
 document.querySelector("#app").innerHTML=`
 <div class="app-shell">
  <header class="topbar">
   <a href="#" onclick="renderHome();return false"><img src="../assets/logo.png" class="logo small" alt="Si Go Pat"></a>
   <div class="top-actions">
    <span class="pill">⚡ ${state.xp} XP</span><span class="pill">❤️ ${state.hearts}</span>
    <button class="btn btn-light" onclick="logout()">Keluar</button>
   </div>
  </header>
  <main class="container">
   <section class="hero">
    <div><div class="pill" style="display:inline-block;margin-bottom:10px">GO LANG DASAR</div>
    <h1>Halo, ${esc(state.user.name)} 👋</h1>
    <p>Ikuti jalur belajar, jawab latihan, kumpulkan XP, dan naik di leaderboard.</p></div>
    <img src="../assets/logo.png" alt="">
   </section>
   <section class="stats">
    <div class="stat"><b>${state.xp}</b><span>Total XP</span></div>
    <div class="stat"><b>🔥 ${state.user.streak||0}</b><span>Streak</span></div>
    <div class="stat"><b>❤️ ${state.hearts}</b><span>Hearts</span></div>
    <div class="stat"><b>#${getRank()}</b><span>Peringkat</span></div>
   </section>
   <div class="section-title"><h2>Jalur Belajar</h2><span class="pill" style="color:var(--teal);background:#fff">4 Sub Bab</span></div>
   <section class="path">${lessonDefs.map(lessonCard).join("")}</section>
   <div class="section-title"><h2>🏆 Leaderboard</h2></div>
   <section class="leaderboard">${renderLeaderboard()}</section>
  </main>
 </div>`;
}
function lessonCard(l){
 const total=state.questions.filter(q=>q.lesson===l.id).length;
 return `<article class="lesson">
  <div class="lesson-icon">${l.icon}</div><h3>${l.title}</h3><p>${l.desc}</p>
  <div class="progress"><i style="width:${total?Math.min(100,((state.user.progress||{})[l.id]||0)/total*100):0}%"></i></div>
  <button class="btn btn-yellow" onclick="startLesson('${l.id}')">${total?"Mulai latihan":"Belum ada soal"}</button>
 </article>`;
}
function renderLeaderboard(){
 const rows=[...state.leaderboard].sort((a,b)=>b.xp-a.xp);
 return rows.map((u,i)=>`<div class="rank ${u.name===state.user.name?"me":""}">
  <strong>${["🥇","🥈","🥉"][i]||("#"+(i+1))}</strong><div>${esc(u.name)}</div><div class="xpcol">${u.xp} XP</div>
 </div>`).join("")||`<div class="empty">Belum ada data leaderboard.</div>`;
}
function getRank(){
 const rows=[...state.leaderboard].sort((a,b)=>b.xp-a.xp);
 const i=rows.findIndex(x=>x.name===state.user.name); return i<0?"-":i+1;
}
async function startLesson(id){
 const qs=state.questions.filter(q=>q.lesson===id);
 if(!qs.length){alert("Soal untuk sub bab ini belum tersedia. Admin bisa menambahkannya.");return}
 state.currentLesson=id; state.quiz=[...qs].sort(()=>Math.random()-.5).slice(0,10);state.qIndex=0;state.hearts=5;state.answered=false;
 renderQuiz();
}
function renderQuiz(){
 const q=state.quiz[state.qIndex];
 document.querySelector("#app").innerHTML=`
 <div class="app-shell"><header class="topbar">
 <button class="btn btn-light" onclick="renderHome()">← Kembali</button>
 <div class="top-actions"><span class="pill">❤️ ${state.hearts}</span><span class="pill">⚡ ${state.xp} XP</span></div></header>
 <main class="container"><section class="quiz-card">
 <div class="quiz-top"><b>${esc(lessonDefs.find(x=>x.id===state.currentLesson)?.title||"Latihan")}</b>
 <span>${state.qIndex+1}/${state.quiz.length}</span></div>
 <div class="progress" style="margin-top:12px"><i style="width:${((state.qIndex)/state.quiz.length)*100}%"></i></div>
 <div class="question">${esc(q.question)}</div>
 <div class="options">${q.options.map((o,i)=>`<button class="option" id="opt${i}" onclick="answer(${i})">${esc(o)}</button>`).join("")}</div>
 <div class="feedback" id="feedback"></div>
 <div class="quiz-actions"><button class="btn btn-light" onclick="renderHome()">Berhenti</button><button class="btn btn-primary" id="next" style="display:none" onclick="nextQuestion()">Lanjut →</button></div>
 </section></main></div>`;
}
function answer(i){
 if(state.answered)return;state.answered=true;const q=state.quiz[state.qIndex];
 const buttons=document.querySelectorAll(".option");
 buttons.forEach((b,n)=>{if(n===q.answer)b.classList.add("correct");if(n===i&&i!==q.answer)b.classList.add("wrong")});
 const card=document.querySelector(".quiz-card");
 if(card){card.classList.remove("answer-pop");void card.offsetWidth;card.classList.add("answer-pop");}
 const fb=document.querySelector("#feedback");
 if(i===q.answer){
   state.xp+=10;fb.className="feedback good";fb.textContent="Benar! +10 XP 🎉";
   showAnswerEffect(true, i);
 } else {
   state.hearts--;fb.className="feedback bad";fb.textContent=`Belum tepat. ${q.explanation||""}`;
   showAnswerEffect(false, i);
 }
 fb.style.display="block";document.querySelector("#next").style.display="block";
}
function showAnswerEffect(correct,index){
 const b=document.querySelectorAll(".option")[index];
 if(!b)return;
 const rect=b.getBoundingClientRect();
 const burst=document.createElement("div");
 burst.className="answer-burst";burst.textContent=correct?"✨":"💭";
 burst.style.left=(rect.right-20)+"px";burst.style.top=(rect.top-8)+"px";
 document.body.appendChild(burst);setTimeout(()=>burst.remove(),700);
 if(correct){
   const xp=document.createElement("div");xp.className="xp-float";xp.textContent="+10 XP";
   xp.style.left=(rect.left+18)+"px";xp.style.top=(rect.top+5)+"px";
   document.body.appendChild(xp);setTimeout(()=>xp.remove(),950);
 }
}
async function nextQuestion(){
 if(state.qIndex<state.quiz.length-1){state.qIndex++;state.answered=false;renderQuiz();return}
 const p=state.user.progress||{};p[state.currentLesson]=(p[state.currentLesson]||0)+1;
 state.user.progress=p;state.user.xp=state.xp;save();
 await api("saveProgress",{user:state.user});
 alert("Latihan selesai! XP kamu bertambah. 🏆");
 renderHome();
}
function logout(){localStorage.removeItem("sigopat_user");state.user=null;loginPage()}
if(state.user) renderHome(); else loginPage();
