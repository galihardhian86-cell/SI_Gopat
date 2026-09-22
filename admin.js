const adminState={admin:JSON.parse(localStorage.getItem("sigopat_admin")||"null"),questions:[],users:[],tab:"questions"};
function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function api(action,payload={}){
 if(!API_URL||API_URL.includes("TEMPEL_URL")) return demoApi(action,payload);
 const r=await fetch(API_URL,{method:"POST",body:JSON.stringify({action,...payload})});return r.json();
}
function demoAdmins(){
 return JSON.parse(localStorage.getItem("sigopat_demo_admins")||"[]");
}
function demoApi(action,p){
 if(action==="adminLogin"){
   if(p.username==="admin"&&p.password==="admin123") return {ok:true,admin:{username:"admin"}};
   const found=demoAdmins().find(x=>x.username.toLowerCase()===String(p.username).toLowerCase()&&x.password===p.password);
   if(found) return {ok:true,admin:{username:found.username}};
   return {ok:false,error:"Username/password admin salah."};
 }
 if(action==="adminRegister"){
   const username=(p.username||"").trim(), password=p.password||"";
   if(!username||!password) return {ok:false,error:"Username dan password wajib diisi."};
   if(password.length<4) return {ok:false,error:"Password minimal 4 karakter."};
   if(username.toLowerCase()==="admin"||demoAdmins().find(x=>x.username.toLowerCase()===username.toLowerCase()))
     return {ok:false,error:"Username admin sudah dipakai. Pilih username lain."};
   const list=demoAdmins();list.push({username,password});localStorage.setItem("sigopat_demo_admins",JSON.stringify(list));
   return {ok:true,admin:{username}};
 }
 if(action==="adminData") return {ok:true,questions:JSON.parse(localStorage.getItem("sigopat_demo_questions")||"[]"),users:[]};
 if(action==="saveQuestion"){let q=JSON.parse(localStorage.getItem("sigopat_demo_questions")||"[]");if(p.question.id){q=q.map(x=>x.id===p.question.id?p.question:x)}else{p.question.id="q"+Date.now();q.push(p.question)}localStorage.setItem("sigopat_demo_questions",JSON.stringify(q));return {ok:true}}
 if(action==="deleteQuestion"){let q=JSON.parse(localStorage.getItem("sigopat_demo_questions")||"[]").filter(x=>x.id!==p.id);localStorage.setItem("sigopat_demo_questions",JSON.stringify(q));return {ok:true}}
 return {ok:true};
}
function login(){
 document.querySelector("#app").innerHTML=`<main class="login"><section class="login-card">
 <img class="logo" src="../assets/logo.png"><h1>Admin Si Go Pat</h1><p class="subtitle">Kelola pengguna dan bank soal.</p>
 <form id="af"><div class="field"><label>Username</label><input id="au" required value="admin"></div>
 <div class="field"><label>Password</label><input id="ap" required type="password" placeholder="Password admin"></div>
 <button class="btn btn-primary full">Sign In Admin</button><div class="error" id="ae"></div></form>
 <p class="switch-link">Butuh akun admin baru? <a href="#" id="toAdminRegister">Daftar admin</a></p>
 </section></main>`;
 document.querySelector("#af").onsubmit=async e=>{e.preventDefault();let r=await api("adminLogin",{username:au.value,password:ap.value});if(!r.ok){ae.textContent=r.error;ae.style.display="block"}else{adminState.admin=r.admin;localStorage.setItem("sigopat_admin",JSON.stringify(r.admin));render()}}
 document.querySelector("#toAdminRegister").onclick=e=>{e.preventDefault();adminRegisterPage()};
}
function adminRegisterPage(){
 document.querySelector("#app").innerHTML=`<main class="login"><section class="login-card">
 <img class="logo" src="../assets/logo.png"><h1>Daftar Admin Baru</h1><p class="subtitle">Buat akun admin untuk mengelola Si Go Pat.</p>
 <form id="arf"><div class="field"><label>Username</label><input id="aru" required placeholder="Username admin"></div>
 <div class="field"><label>Password</label><input id="arp" required type="password" placeholder="Minimal 4 karakter"></div>
 <div class="field"><label>Ulangi Password</label><input id="arp2" required type="password" placeholder="Ketik ulang password"></div>
 <button class="btn btn-primary full">Daftar Admin</button><div class="error" id="are"></div></form>
 <p class="switch-link">Sudah punya akun admin? <a href="#" id="toAdminLogin">Sign in</a></p>
 </section></main>`;
 document.querySelector("#arf").onsubmit=async e=>{
  e.preventDefault(); are.style.display="none";
  if(arp.value!==arp2.value){are.textContent="Password dan ulangi password tidak sama.";are.style.display="block";return}
  let r=await api("adminRegister",{username:aru.value.trim(),password:arp.value});
  if(!r.ok){are.textContent=r.error||"Gagal mendaftar.";are.style.display="block";return}
  adminState.admin=r.admin;localStorage.setItem("sigopat_admin",JSON.stringify(r.admin));render();
 };
 document.querySelector("#toAdminLogin").onclick=e=>{e.preventDefault();login()};
}
async function load(){let r=await api("adminData");adminState.questions=r.questions||[];adminState.users=r.users||[]}
async function render(){await load();document.querySelector("#app").innerHTML=`<div class="app-shell">
<header class="topbar"><a href="../student/"><img src="../assets/logo.png" class="logo small"></a><div class="top-actions"><span class="pill">ADMIN</span><button class="btn btn-light" onclick="adminLogout()">Keluar</button></div></header>
<main class="container"><div class="admin-grid"><aside class="sidebar"><h2 style="margin:5px 10px 18px">Si Go Pat</h2>
<button class="side-btn ${adminState.tab==="questions"?"active":""}" onclick="adminState.tab='questions';render()">📝 Bank Soal</button>
<button class="side-btn ${adminState.tab==="users"?"active":""}" onclick="adminState.tab='users';render()">👥 Pengguna</button>
<button class="side-btn ${adminState.tab==="settings"?"active":""}" onclick="adminState.tab='settings';render()">⚙️ Pengaturan</button></aside>
<section>${adminState.tab==="questions"?questionsPanel():adminState.tab==="users"?usersPanel():settingsPanel()}</section></div></main></div>`}
function questionsPanel(){return `<div class="panel"><div class="section-title" style="margin:0 0 18px"><h2>📝 Bank Soal</h2><button class="btn btn-yellow" onclick="openQuestion()">+ Tambah Soal</button></div>
<div class="notice">Soal dibagi menjadi 4 sub bab: Variabel & Tipe Data, Looping, Percabangan, dan Persiapan UTS. Perubahan di sini akan menjadi soal yang dipakai user.</div>
<div class="table-wrap"><table class="table"><thead><tr><th>Sub Bab</th><th>Pertanyaan</th><th>Jawaban</th><th>Aksi</th></tr></thead><tbody>
${adminState.questions.map(q=>`<tr><td><b>${esc(label(q.lesson))}</b></td><td>${esc(q.question)}</td><td>${esc(q.options?.[q.answer]||"")}</td><td><div class="actions"><button class="btn btn-light" onclick='openQuestion(${JSON.stringify(q).replace(/'/g,"&#39;")})'>Edit</button><button class="btn btn-danger" onclick="removeQuestion('${q.id}')">Hapus</button></div></td></tr>`).join("")||`<tr><td colspan="4"><div class="empty">Belum ada soal. Tambahkan soal pertama.</div></td></tr>`}
</tbody></table></div></div>`}
function label(id){return ({variables:"Variabel & Tipe Data",looping:"Looping",branching:"Percabangan",uts:"Persiapan UTS"})[id]||id}
function usersPanel(){return `<div class="panel"><div class="section-title" style="margin:0 0 18px"><h2>👥 Pengguna</h2></div>
<div class="table-wrap"><table class="table"><thead><tr><th>Nama</th><th>XP</th><th>Streak</th><th>Progress</th></tr></thead><tbody>
${adminState.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${u.xp||0}</td><td>${u.streak||0}</td><td>${Object.values(u.progress||{}).reduce((a,b)=>a+Number(b||0),0)} soal</td></tr>`).join("")||`<tr><td colspan="4"><div class="empty">Belum ada pengguna pada database. Setelah Apps Script terhubung, data user akan muncul di sini.</div></td></tr>`}
</tbody></table></div></div>`}
function settingsPanel(){return `<div class="panel"><h2>⚙️ Pengaturan</h2><p>Gunakan Google Sheets sebagai database agar admin dapat memperbarui soal kapan saja tanpa mengubah kode halaman.</p><h3>Sub bab</h3><div class="actions"><span class="pill" style="color:var(--teal)">Variabel & Tipe Data</span><span class="pill" style="color:var(--teal)">Looping</span><span class="pill" style="color:var(--teal)">Percabangan</span><span class="pill" style="color:var(--teal)">Persiapan UTS</span></div></div>`}
function openQuestion(q=null){
 const isEdit=!!q;
 document.body.insertAdjacentHTML("beforeend",`<div class="modal show" id="qm"><div class="modal-card"><div class="section-title" style="margin:0 0 10px"><h2>${isEdit?"Edit":"Tambah"} Soal</h2><button class="btn btn-light" onclick="closeModal()">Tutup</button></div>
 <div class="field"><label>Sub Bab</label><select id="ql"><option value="variables">Variabel & Tipe Data</option><option value="looping">Looping</option><option value="branching">Percabangan</option><option value="uts">Persiapan UTS</option></select></div>
 <div class="field"><label>Pertanyaan</label><textarea id="qq" rows="3" placeholder="Tulis pertanyaan..."></textarea></div>
 ${[0,1,2,3].map(i=>`<div class="field"><label>Opsi ${String.fromCharCode(65+i)}</label><input id="qo${i}" placeholder="Jawaban pilihan"></div>`).join("")}
 <div class="field"><label>Jawaban benar</label><select id="qa"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></div>
 <div class="field"><label>Pembahasan singkat</label><textarea id="qe" rows="3" placeholder="Penjelasan setelah menjawab..."></textarea></div>
 <button class="btn btn-primary full" onclick="saveQuestion(${isEdit?JSON.stringify(q):"null"})">Simpan Soal</button></div></div>`);
 if(q){ql.value=q.lesson;qq.value=q.question;for(let i=0;i<4;i++)document.querySelector("#qo"+i).value=q.options?.[i]||"";qa.value=q.answer;qe.value=q.explanation||""}
}
async function saveQuestion(old){
 const q={id:old?.id||"",lesson:ql.value,question:qq.value.trim(),options:[0,1,2,3].map(i=>document.querySelector("#qo"+i).value.trim()),answer:Number(qa.value),explanation:qe.value.trim()};
 if(!q.question||q.options.some(x=>!x)){alert("Lengkapi semua bagian soal.");return}
 const r=await api("saveQuestion",{question:q});if(!r.ok){alert(r.error||"Gagal menyimpan");return}closeModal();render();
}
async function removeQuestion(id){if(!confirm("Hapus soal ini?"))return;let r=await api("deleteQuestion",{id});if(!r.ok){alert(r.error||"Gagal");return}render()}
function closeModal(){document.querySelector("#qm")?.remove()}
function adminLogout(){localStorage.removeItem("sigopat_admin");adminState.admin=null;login()}
if(adminState.admin)render();else login();
