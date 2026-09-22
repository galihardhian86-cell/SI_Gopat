/*
 SI GO PAT — Google Apps Script Backend
 --------------------------------------
 1. Buat Google Sheet kosong.
 2. Extensions > Apps Script.
 3. Tempel seluruh kode ini.
 4. Jalankan setup() sekali dan izinkan akses.
 5. Deploy > New deployment > Web app.
    Execute as: Me
    Who has access: Anyone
 6. Salin URL /exec ke config.js pada student dan admin.

 SHEETS:
 Users     = id | name | password | xp | streak | progress
 Questions = id | lesson | question | optionsJSON | answer | explanation | active
 Admins    = username | password
*/

const SHEET_ID = ""; // Kosongkan jika script dibuat dari Extensions > Apps Script pada Sheet tersebut.

function ss_(){
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}
function setup(){
  const ss=ss_();
  const defs={
    Users:["id","name","password","xp","streak","progress"],
    Questions:["id","lesson","question","optionsJSON","answer","explanation","active"],
    Admins:["username","password"]
  };
  Object.entries(defs).forEach(([name,headers])=>{
    let sh=ss.getSheetByName(name)||ss.insertSheet(name);
    sh.clear();
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  });
  ss.getSheetByName("Admins").appendRow(["admin","admin123"]);
  const demo=[
    ["q1","variables","Manakah deklarasi variabel Go yang benar?",JSON.stringify(["var nama string = \"Budi\"","let nama = \"Budi\"","string nama := \"Budi\"","const var nama = \"Budi\""]),0,"Go menggunakan var atau short declaration :=.","TRUE"],
    ["q2","variables","Tipe data untuk bilangan bulat adalah ...",JSON.stringify(["string","int","bool","float"]),1,"int digunakan untuk bilangan bulat.","TRUE"],
    ["q3","looping","Keyword utama untuk perulangan di Go adalah ...",JSON.stringify(["loop","for","while","repeat"]),1,"Go menggunakan for.","TRUE"],
    ["q4","branching","Keyword untuk percabangan kondisi adalah ...",JSON.stringify(["if","when","check","caseif"]),0,"Go menggunakan if, else if, dan else.","TRUE"],
    ["q5","uts","Materi dasar yang perlu disiapkan untuk UTS adalah ...",JSON.stringify(["Variabel, tipe data, looping, dan percabangan","CSS","Database","Desain"]),0,"Sesuaikan dengan silabus kelas.","TRUE"]
  ];
  ss.getSheetByName("Questions").getRange(2,1,demo.length,7).setValues(demo);
}

function doGet(e){return json_({ok:true,service:"Si Go Pat API",message:"API aktif"});}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||"{}");
    switch(body.action){
      case "login": return json_(login_(body));
      case "register": return json_(register_(body));
      case "adminLogin": return json_(adminLogin_(body));
      case "adminRegister": return json_(adminRegister_(body));
      case "getQuestions": return json_(getQuestions_());
      case "getLeaderboard": return json_(getLeaderboard_());
      case "adminData": return json_(adminData_());
      case "saveProgress": return json_(saveProgress_(body));
      case "saveQuestion": return json_(saveQuestion_(body.question));
      case "deleteQuestion": return json_(deleteQuestion_(body.id));
      default:return json_({ok:false,error:"Action tidak dikenal"});
    }
  }catch(err){return json_({ok:false,error:String(err)});}
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}
function rows_(name){
  const sh=ss_().getSheetByName(name), vals=sh.getDataRange().getValues();
  if(vals.length<2)return [];
  const h=vals[0]; return vals.slice(1).filter(r=>r.join("")!=="").map(r=>Object.fromEntries(h.map((x,i)=>[x,r[i]])));
}
function login_(b){
  const u=rows_("Users").find(x=>String(x.name).toLowerCase()===String(b.name).toLowerCase() && String(x.password)===String(b.password));
  if(!u)return {ok:false,error:"Nama atau password salah."};
  u.xp=Number(u.xp||0);u.streak=Number(u.streak||0);
  try{u.progress=JSON.parse(u.progress||"{}")}catch(_){u.progress={}}
  return {ok:true,user:u};
}
function register_(b){
  const name=String(b.name||"").trim(), password=String(b.password||"");
  if(!name||!password) return {ok:false,error:"Nama dan password wajib diisi."};
  if(password.length<4) return {ok:false,error:"Password minimal 4 karakter."};
  const exists=rows_("Users").find(x=>String(x.name).toLowerCase()===name.toLowerCase());
  if(exists) return {ok:false,error:"Nama sudah dipakai. Pilih nama lain atau masuk."};
  const sh=ss_().getSheetByName("Users");
  const user={id:"u"+Date.now(),name:name,password:password,xp:0,streak:0,progress:{}};
  sh.appendRow([user.id,user.name,user.password,user.xp,user.streak,JSON.stringify(user.progress)]);
  return {ok:true,user:user};
}
function adminLogin_(b){
  const a=rows_("Admins").find(x=>String(x.username)===String(b.username)&&String(x.password)===String(b.password));
  return a?{ok:true,admin:{username:a.username}}:{ok:false,error:"Username atau password admin salah."};
}
function adminRegister_(b){
  const username=String(b.username||"").trim(), password=String(b.password||"");
  if(!username||!password) return {ok:false,error:"Username dan password wajib diisi."};
  if(password.length<4) return {ok:false,error:"Password minimal 4 karakter."};
  const exists=rows_("Admins").find(x=>String(x.username).toLowerCase()===username.toLowerCase());
  if(exists) return {ok:false,error:"Username admin sudah dipakai. Pilih username lain."};
  ss_().getSheetByName("Admins").appendRow([username,password]);
  return {ok:true,admin:{username:username}};
}
function getQuestions_(){
  const questions=rows_("Questions").filter(q=>String(q.active).toUpperCase()!=="FALSE").map(q=>({
    id:q.id,lesson:q.lesson,question:q.question,options:JSON.parse(q.optionsJSON||"[]"),answer:Number(q.answer),explanation:q.explanation||""
  }));
  return {ok:true,questions};
}
function getLeaderboard_(){
  const leaderboard=rows_("Users").map(u=>({name:u.name,xp:Number(u.xp||0)})).sort((a,b)=>b.xp-a.xp);
  return {ok:true,leaderboard};
}
function adminData_(){return {ok:true,questions:getQuestions_().questions,users:rows_("Users").map(u=>{try{u.progress=JSON.parse(u.progress||"{}")}catch(_){u.progress={}}return u;})};}
function saveProgress_(b){
  const user=b.user, sh=ss_().getSheetByName("Users"), vals=sh.getDataRange().getValues();
  for(let r=1;r<vals.length;r++){
    if(String(vals[r][0])===String(user.id)){
      sh.getRange(r+1,4,1,3).setValues([[Number(user.xp||0),Number(user.streak||0),JSON.stringify(user.progress||{})]]);
      return {ok:true};
    }
  }
  return {ok:false,error:"User tidak ditemukan."};
}
function saveQuestion_(q){
  const sh=ss_().getSheetByName("Questions"), vals=sh.getDataRange().getValues();
  const row=[q.id||("q"+Date.now()),q.lesson,q.question,JSON.stringify(q.options||[]),Number(q.answer||0),q.explanation||"TRUE", "TRUE"];
  for(let r=1;r<vals.length;r++){
    if(String(vals[r][0])===String(q.id)){sh.getRange(r+1,1,1,row.length).setValues([row]);return {ok:true};}
  }
  sh.appendRow(row);return {ok:true};
}
function deleteQuestion_(id){
  const sh=ss_().getSheetByName("Questions"), vals=sh.getDataRange().getValues();
  for(let r=1;r<vals.length;r++)if(String(vals[r][0])===String(id)){sh.deleteRow(r+1);return {ok:true};}
  return {ok:false,error:"Soal tidak ditemukan."};
}

// Opsional: membuat user awal lewat Apps Script editor (selain lewat halaman Daftar
// di student/index.html dan admin/index.html yang sudah tersedia).
function addUser(name,password){
  const sh=ss_().getSheetByName("Users");
  sh.appendRow(["u"+Date.now(),name,password,0,0,"{}"]);
}
