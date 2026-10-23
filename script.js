/* MockChat — Offline chat simulator. No network calls. */
const STORE="mockchat_ultra_1";
const seed={
settings:{theme:"light",name:"أنا",avatar:"🙂",pin:""},
chats:[
{id:1,type:"person",name:"أحمد",avatar:"👨",status:"متصل الآن",about:"صديق وهمي",personality:"friendly",pinned:true,muted:false,unread:1,
msgs:[{id:101,from:"them",text:"أهلاً يا معاذ 👋",time:"07:10 م",day:"اليوم"},{id:102,from:"me",text:"أهلاً يا أحمد، عامل إيه؟",time:"07:11 م",day:"اليوم",read:true},{id:103,from:"them",text:"تمام الحمد لله 😄 إنت أخبارك إيه؟",time:"07:11 م",day:"اليوم"}]},
{id:2,type:"person",name:"سارة",avatar:"👩",status:"آخر ظهور اليوم",about:"شخصية هادئة",personality:"calm",msgs:[{id:201,from:"them",text:"فاكر الخطة اللي اتكلمنا عنها؟",time:"05:40 م",day:"اليوم"}]},
{id:3,type:"group",name:"أصحابي 😂",avatar:"👥",status:"4 أعضاء",about:"مجموعة أصدقاء",members:["أحمد","سارة","كريم","أنا"],msgs:[{id:301,from:"them",author:"أحمد",text:"يا جماعة، مين فاضي النهارده؟",time:"04:20 م",day:"اليوم"},{id:302,from:"me",text:"أنا موجود 😄",time:"04:21 م",day:"اليوم",read:true}]},
{id:4,type:"person",name:"كريم",avatar:"🧑",status:"متصل الآن",about:"شخصية مرحة",personality:"funny",msgs:[]}
]};
let db=readDB(), active=null, currentPage="chats", reply=null;

const el=id=>document.getElementById(id);
function readDB(){try{let x=JSON.parse(localStorage.getItem(STORE));if(x&&x.chats)return x}catch(e){}return structuredClone(seed)}
function save(){localStorage.setItem(STORE,JSON.stringify(db))}
function chat(){return db.chats.find(c=>c.id===active)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function clock(){return new Date().toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}
function avatar(c){return c.avatar?.startsWith("data:")?`<img src="${c.avatar}">`:esc(c.avatar||"👤")}
function toast(t){el("toast").textContent=t;el("toast").classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el("toast").classList.remove("show"),1900)}
function setPage(p){currentPage=p;document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.page===p));renderHome()}
document.querySelectorAll(".tab").forEach(x=>x.onclick=()=>setPage(x.dataset.page));

function renderHome(){
 if(currentPage==="chats") chatsPage();
 if(currentPage==="updates") updatesPage();
 if(currentPage==="communities") communitiesPage();
 if(currentPage==="calls") callsPage();
 updateUnread();
}
function updateUnread(){let n=db.chats.reduce((a,c)=>a+(c.unread||0),0);el("allUnread").textContent=n?`(${n})`:""}
function chatsPage(){
 let sorted=[...db.chats].sort((a,b)=>Number(b.pinned)-Number(a.pinned));
 el("homeContent").innerHTML=`<div class="search-row"><input id="chatSearch" placeholder="🔎  بحث أو بدء محادثة"></div><div id="chatList"></div>`;
 let list=el("chatList");
 sorted.forEach(c=>{
  let m=c.msgs.at(-1),preview=m?(m.from==="me"?"أنت: ":"")+(m.author?m.author+": ":"")+m.text:"لا توجد رسائل";
  let row=document.createElement("div");row.className="chat-row";row.dataset.id=c.id;
  row.innerHTML=`<div class="avatar">${avatar(c)}</div><div class="chat-info"><strong>${esc(c.name)}</strong><div class="preview">${esc(preview)}</div></div><div class="row-meta">${esc(m?.time||"")}${c.unread?`<br><span class="badge">${c.unread}</span>`:""}</div>`;
  row.onclick=()=>openChat(c.id);list.appendChild(row);
 });
 el("chatSearch").oninput=e=>{let q=e.target.value.toLowerCase();list.querySelectorAll(".chat-row").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?"flex":"none")};
 el("homeFab").onclick=homeCreate;
}
function updatesPage(){
 el("homeContent").innerHTML=`<div class="card"><h2>حالتي</h2><div class="status"><div class="avatar">${esc(db.settings.avatar)}</div><div><b>إضافة حالة</b><div class="preview">شارك تحديثًا وهميًا مع جهات الاتصال</div></div></div><br><button class="action" onclick="newStatus()">＋ إضافة حالة</button></div>
 <div class="section-title">آخر التحديثات</div>
 <div class="status"><div class="status-ring"><div class="avatar">👨</div></div><div><b>أحمد</b><div class="preview">منذ 20 دقيقة · حالة محاكاة</div></div></div>
 <div class="status"><div class="status-ring"><div class="avatar">👩</div></div><div><b>سارة</b><div class="preview">اليوم · حالة محاكاة</div></div></div>`;
 el("homeFab").onclick=newStatus;
}
function communitiesPage(){
 el("homeContent").innerHTML=`<div class="card"><h2>المجتمعات</h2><p>نظّم مجموعاتك الوهمية داخل مساحات مستقلة.</p><button class="action" onclick="newCommunity()">إنشاء مجتمع</button></div>
 <div class="card"><h2>مجتمع الأصدقاء</h2><p>4 أعضاء · مجموعتان</p><button class="action secondary" onclick="newGroup()">＋ مجموعة جديدة</button></div>`;
 el("homeFab").onclick=newCommunity;
}
function callsPage(){
 el("homeContent").innerHTML=`<div class="card"><h2>المكالمات</h2><p>هذه مكالمات محاكاة فقط ولا تنشئ اتصالًا حقيقيًا.</p></div>
 <div class="status"><div class="avatar">👨</div><div style="flex:1"><b>أحمد</b><div class="preview">مكالمة صوتية · اليوم</div></div><button class="action" onclick="callFromList(1,'صوتية')">☎</button></div>
 <div class="status"><div class="avatar">👩</div><div style="flex:1"><b>سارة</b><div class="preview">مكالمة مرئية · أمس</div></div><button class="action" onclick="callFromList(2,'مرئية')">▣</button></div>`;
 el("homeFab").onclick=homeCreate;
}
function callFromList(id,k){openChat(id);setTimeout(()=>fakeCall(k),50)}

function openChat(id){
 active=id;reply=null;let c=chat();if(!c)return;c.unread=0;save();
 el("home").classList.add("hidden");el("conversation").classList.remove("hidden");
 el("conversationName").textContent=c.name;el("conversationStatus").textContent=c.status;
 el("chat-photo")?.remove();el("profileOpen").innerHTML=avatar(c);renderMessages()
}
function closeChat(){active=null;reply=null;el("conversation").classList.add("hidden");el("home").classList.remove("hidden");renderHome()}
el("backHome").onclick=closeChat;

function renderMessages(){
 let c=chat();if(!c)return;let area=el("messageArea");area.innerHTML="";let lastDay="";
 c.msgs.forEach(m=>{
  if(m.day!==lastDay){lastDay=m.day;let d=document.createElement("div");d.className="day";d.textContent=m.day||"اليوم";area.appendChild(d)}
  let b=document.createElement("div");b.className=`msg ${m.from==="me"?"me":"them"}`;
  let q=m.reply?`<div class="quote">${esc(m.reply)}</div>`:"";
  let author=c.type==="group"&&m.from==="them"?`<b style="color:#128c7e">${esc(m.author||"عضو")}</b><br>`:"";
  let tick=m.from==="me"?` <span class="ticks">${m.read?"✓✓":"✓"}</span>`:"";
  b.innerHTML=author+q+esc(m.text)+` <span class="msg-time">${esc(m.time||"")} ${tick}</span>`;
  b.onclick=()=>messageMenu(m.id);area.appendChild(b)
 });
 area.scrollTop=area.scrollHeight
}
el("sendBtn").onclick=send;
el("messageInput").onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}
function send(){
 let input=el("messageInput"),text=input.value.trim();if(!text)return;
 let c=chat(),m={id:Date.now(),from:"me",text,time:clock(),day:"اليوم",read:false};
 if(reply){m.reply=reply.text;reply=null;el("replyBar").classList.add("hidden")}
 c.msgs.push(m);save();input.value="";renderMessages();autoReply(c)
}
function autoReply(c){
 el("typingBar").classList.remove("hidden");
 setTimeout(()=>{el("typingBar").classList.add("hidden");let r=smartReply(c);let m={id:Date.now(),from:"them",author:c.type==="group"?pick(c.members||["أحمد","سارة"]):"",text:r,time:clock(),day:"اليوم"};c.msgs.push(m);save();
 if(active===c.id)renderMessages();else{c.unread=(c.unread||0)+1;save();toast(c.name+" أرسل رسالة")}},700+Math.random()*1600)
}
function smartReply(c){
 let text=el("messageInput").value; // kept intentionally simple; all inference is local.
 let bank={
 friendly:["تمام يا صاحبي 😄","حاضر، ولا يهمك.","ههههه 😂 فهمتك.","أنا معاك، كمل.","ماشي جدًا 👍","حلو الكلام ده!","أيوه تمام، اتفقنا."],
 calm:["تمام، خلينا نفكر فيها بهدوء.","فهمتك. خذ وقتك.","ممكن، أنا متابع معاك.","تمام، وصلت الفكرة.","أكيد، مفيش مشكلة."],
 funny:["😂😂 إيه الكلام الجامد ده؟","استنى بس، أنا بحاول أفهم!","ههههه أنت عايز تودينا فين؟ 😂","يا عم اهدى علينا شوية 😄","دي محتاجة قعدة طويلة 😂"],
 helpful:["ممكن نرتب الموضوع خطوة خطوة.","فهمتك، خلينا نبدأ بالأهم.","تمام، أقدر أساعدك في ترتيب الفكرة.","خلينا نشوف أفضل حل."]
 };
 if(/سلام|اهلا|أهلا|هاي|hello/i.test(text||""))return "أهلاً بيك 👋";
 if(/شكرا|شكرًا/.test(text||""))return "العفو ❤️";
 if(/فين|أين/.test(text||""))return "أنا هنا 😄";
 let arr=bank[c.personality]||bank.friendly;return arr[Math.floor(Math.random()*arr.length)]
}
function pick(a){return a[Math.floor(Math.random()*a.length)]||"عضو"}

function messageMenu(id){
 let c=chat(),m=c.msgs.find(x=>x.id===id);if(!m)return;
 modal("إجراءات الرسالة",`<button class="list-button" onclick="replyMessage(${id})">↩ الرد</button>
 <button class="list-button" onclick="copyMessage(${id})">📋 نسخ</button>
 <button class="list-button" onclick="editMessage(${id})">✏️ تعديل</button>
 <button class="list-button" onclick="starMessage(${id})">⭐ ${m.starred?"إلغاء التمييز":"تمييز"}</button>
 <button class="list-button" onclick="deleteMessage(${id})">🗑️ حذف</button>`)
}
function replyMessage(id){let m=chat().msgs.find(x=>x.id===id);reply=m;el("replyBar").textContent="↩ "+m.text;el("replyBar").classList.remove("hidden");closeModal();el("messageInput").focus()}
function copyMessage(id){let m=chat().msgs.find(x=>x.id===id);navigator.clipboard?.writeText(m.text);closeModal();toast("تم نسخ الرسالة")}
function editMessage(id){let m=chat().msgs.find(x=>x.id===id);let x=prompt("تعديل الرسالة",m.text);if(x&&x.trim()){m.text=x.trim();save();closeModal();renderMessages()}}
function starMessage(id){let m=chat().msgs.find(x=>x.id===id);m.starred=!m.starred;save();closeModal();toast(m.starred?"تم تمييز الرسالة":"تم إلغاء التمييز")}
function deleteMessage(id){let c=chat();c.msgs=c.msgs.filter(x=>x.id!==id);save();closeModal();renderMessages()}

el("plusBtn").onclick=attachmentMenu;
el("emojiBtn").onclick=()=>insert(" 😊");
el("stickerBtn").onclick=()=>insert(" 😂");
el("micBtn").onclick=()=>toast("تسجيل صوتي محاكاة Offline");
function insert(s){let i=el("messageInput");i.value+=s;i.focus()}
function attachmentMenu(){modal("إرسال",`<button class="list-button" onclick="fakeMedia('📷 صورة')">📷 صورة</button><button class="list-button" onclick="fakeMedia('🎥 فيديو')">🎥 فيديو</button><button class="list-button" onclick="fakeMedia('📄 مستند')">📄 مستند</button><button class="list-button" onclick="fakeMedia('🎵 رسالة صوتية')">🎵 صوت</button><button class="list-button" onclick="fakeMedia('📍 موقع')">📍 موقع</button><button class="list-button" onclick="fakeMedia('👤 جهة اتصال')">👤 جهة اتصال</button>`)}
function fakeMedia(x){closeModal();let c=chat();c.msgs.push({id:Date.now(),from:"me",text:"["+x+" — محاكاة]",time:clock(),day:"اليوم",read:true});save();renderMessages();autoReply(c)}

el("conversationMenu").onclick=conversationMenu;
function conversationMenu(){modal("خيارات المحادثة",`<button class="list-button" onclick="togglePin()">📌 تثبيت / إلغاء تثبيت</button><button class="list-button" onclick="toggleMute()">🔕 كتم / إلغاء كتم</button><button class="list-button" onclick="insideSearch()">🔎 بحث</button><button class="list-button" onclick="starred()">⭐ الرسائل المميزة</button><button class="list-button" onclick="clearConversation()">🗑️ مسح المحادثة</button><button class="list-button" onclick="profile()">👤 معلومات</button>`)}
function togglePin(){let c=chat();c.pinned=!c.pinned;save();closeModal();renderHome();toast(c.pinned?"تم التثبيت":"تم إلغاء التثبيت")}
function toggleMute(){let c=chat();c.muted=!c.muted;save();closeModal();toast(c.muted?"تم الكتم":"تم إلغاء الكتم")}
function clearConversation(){if(confirm("مسح كل الرسائل؟")){chat().msgs=[];save();closeModal();renderMessages()}}
function starred(){let a=chat().msgs.filter(m=>m.starred);closeModal();modal("الرسائل المميزة",a.length?a.map(m=>`<div class="card">${esc(m.text)}<div class="preview">${esc(m.time)}</div></div>`).join(""):`<div class="empty">لا توجد رسائل مميزة</div>`)}
function insideSearch(){closeModal();el("insideSearch").classList.remove("hidden");el("insideSearchInput").focus();el("insideSearchInput").oninput=e=>{let q=e.target.value.trim().toLowerCase();document.querySelectorAll(".msg").forEach((b,i)=>{let m=chat().msgs[i];b.style.display=!q||m?.text.toLowerCase().includes(q)?"block":"none"})}}

el("videoCall").onclick=()=>fakeCall("مرئية");
el("voiceCall").onclick=()=>fakeCall("صوتية");
function fakeCall(kind){let c=chat();modal("مكالمة محاكاة",`<div class="empty"><div class="empty-icon">${kind==="مرئية"?"▣":"☎"}</div><h2>${esc(c.name)}</h2><p>مكالمة ${kind} محاكاة. لا يوجد اتصال حقيقي بالإنترنت.</p><button class="action danger" onclick="closeModal()">إنهاء المكالمة</button></div>`)}

el("profileOpen").onclick=profile;
function profile(){
 let c=chat();modal("معلومات جهة الاتصال",`<div class="profile-head"><div class="avatar">${avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.about||"لا يوجد وصف")}</p></div>
 <div class="card"><b>الحالة:</b> ${esc(c.status)}<br><br><b>الرسائل:</b> ${c.msgs.length}</div>
 ${c.type==="group"?`<div class="card"><h3>الأعضاء</h3>${(c.members||[]).map(x=>`<div class="status"><div class="avatar">👤</div><b>${esc(x)}</b></div>`).join("")}</div>`:""}`)
}

el("homeFab").onclick=homeCreate;
function homeCreate(){modal("بدء",`<button class="list-button" onclick="newPerson()">👤 إنشاء صديق وهمي</button><button class="list-button" onclick="newGroup()">👥 إنشاء مجموعة</button>`)}
function form(title,fields,done){
 let body=fields.map(f=>`<div class="field"><label>${f[1]}</label><input id="f_${f[0]}" placeholder="${f[2]||""}"></div>`).join("");
 body+=`<div class="modal-actions"><button class="action" id="formSave">حفظ</button><button class="action secondary" onclick="closeModal()">إلغاء</button></div>`;
 modal(title,body);el("formSave").onclick=()=>{let v={};fields.forEach(f=>v[f[0]]=el("f_"+f[0]).value.trim());if(!v[fields[0][0]]){toast("اكتب الاسم أولاً");return}done(v)}
}
function newPerson(){closeModal();form("إنشاء صديق وهمي",[["name","الاسم","محمد"],["avatar","الصورة/الإيموجي","👤"],["about","النبذة","صديق جديد"]],v=>{let c={id:Date.now(),type:"person",name:v.name,avatar:v.avatar||"👤",status:"متصل الآن",about:v.about,personality:"friendly",msgs:[]};db.chats.unshift(c);save();renderHome();openChat(c.id)})}
function newGroup(){closeModal();form("إنشاء مجموعة",[["name","اسم المجموعة","أصحابي"],["avatar","صورة/إيموجي","👥"],["members","الأعضاء","أحمد، سارة، كريم"]],v=>{let c={id:Date.now(),type:"group",name:v.name,avatar:v.avatar||"👥",status:"4 أعضاء",about:"مجموعة وهمية",members:v.members.split("،").map(x=>x.trim()).filter(Boolean),personality:"friendly",msgs:[]};db.chats.unshift(c);save();renderHome();openChat(c.id)})}
function newStatus(){form("حالة جديدة",[["text","نص الحالة","اكتب شيئًا..."]],v=>{closeModal();toast("تم نشر الحالة الوهمية")})}
function newCommunity(){form("مجتمع جديد",[["name","اسم المجتمع","مجتمعي"],["desc","الوصف","وصف قصير"]],v=>{closeModal();toast("تم إنشاء المجتمع")})}

el("mainMenu").onclick=mainMenu;
function mainMenu(){modal("القائمة",`<button class="list-button" onclick="newPerson()">👤 صديق جديد</button><button class="list-button" onclick="newGroup()">👥 مجموعة جديدة</button><button class="list-button" onclick="settings()">⚙️ الإعدادات</button><button class="list-button" onclick="stats()">📊 الإحصائيات</button><button class="list-button" onclick="exportDB()">💾 تصدير نسخة</button><button class="list-button" onclick="importDB()">📥 استيراد نسخة</button><button class="list-button" onclick="about()">ℹ️ عن التطبيق</button><button class="list-button" onclick="resetDB()">♻️ إعادة البيانات الافتراضية</button>`)}
el("searchOpen").onclick=globalSearch;
function globalSearch(){modal("بحث شامل",`<div class="field"><input id="globalQ" placeholder="اسم أو كلمة داخل رسالة"></div><div id="globalOut" class="preview">اكتب للبحث...</div>`);el("globalQ").oninput=e=>{let q=e.target.value.toLowerCase(),out=[];if(q)db.chats.forEach(c=>c.msgs.forEach(m=>{if(c.name.toLowerCase().includes(q)||m.text.toLowerCase().includes(q))out.push(`<div class="card"><b>${esc(c.name)}</b><br>${esc(m.text)}<div class="preview">${esc(m.time)}</div></div>`)}));el("globalOut").innerHTML=out.slice(0,40).join("")||"لا توجد نتائج"}}
function settings(){modal("الإعدادات",`<div class="field"><label>اسمك</label><input id="setName" value="${esc(db.settings.name)}"></div><div class="field"><label>المظهر</label><select id="setTheme"><option value="light">فاتح</option><option value="dark">داكن</option></select></div><div class="modal-actions"><button class="action" onclick="saveSettings()">حفظ</button></div>`);el("setTheme").value=db.settings.theme}
function saveSettings(){db.settings.name=el("setName").value.trim()||"أنا";db.settings.theme=el("setTheme").value;document.body.classList.toggle("dark",db.settings.theme==="dark");save();closeModal();toast("تم حفظ الإعدادات")}
function stats(){let msgs=db.chats.reduce((a,c)=>a+c.msgs.length,0),groups=db.chats.filter(c=>c.type==="group").length,stars=db.chats.reduce((a,c)=>a+c.msgs.filter(m=>m.starred).length,0);modal("الإحصائيات",`<div class="stats"><div class="stat"><b>${db.chats.length}</b>محادثة</div><div class="stat"><b>${groups}</b>مجموعة</div><div class="stat"><b>${msgs}</b>رسالة</div><div class="stat"><b>${stars}</b>مميزة</div></div>`)}
function about(){modal("عن التطبيق",`<div class="empty"><div class="empty-icon">💬</div><h2>MockChat</h2><p>محاكي دردشة مستقل يعمل محليًا بدون خادم. الوظائف الصوتية والمرئية والوسائط هنا محاكاة.</p><p><b>تم التطوير بواسطة المبرمج معاذ محمد عبد النبي</b></p></div>`)}
function exportDB(){let b=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="mockchat-backup.json";a.click();closeModal();toast("تم تجهيز النسخة")}
function importDB(){closeModal();let i=document.createElement("input");i.type="file";i.accept=".json";i.onchange=()=>{let f=i.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.chats)throw 0;db=x;save();renderHome();toast("تم استيراد البيانات")}catch(e){toast("النسخة غير صالحة")}};r.readAsText(f)};i.click()}
function resetDB(){if(confirm("إعادة كل البيانات الافتراضية؟")){db=structuredClone(seed);save();closeModal();renderHome();toast("تمت إعادة البيانات")}}
function modal(title,body){el("modalLayer").innerHTML=`<div class="modal-back" id="modalBack"><div class="modal"><h3>${title}</h3>${body}</div></div>`;el("modalBack").onclick=e=>{if(e.target.id==="modalBack")closeModal()}}
function closeModal(){el("modalLayer").innerHTML=""}

document.body.classList.toggle("dark",db.settings.theme==="dark");
renderHome();
