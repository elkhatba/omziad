/***********************
 * FIREBASE INIT
 ***********************/
var firebaseConfig = {
  apiKey: "AIzaSyArIFHNz03jyY5Iz1l8gHiDZqtEpmLkYnA",
  authDomain: "om-ziad-marriage-8eec8.firebaseapp.com",
  databaseURL: "https://om-ziad-marriage-8eec8-default-rtdb.firebaseio.com",
  projectId: "om-ziad-marriage-8eec8",
  storageBucket: "om-ziad-marriage-8eec8.appspot.com",
  messagingSenderId: "536983507448",
  appId: "1:536983507448:web:839331268a50850a30060d"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

/***********************
 * GLOBAL STATE
 ***********************/
let isAdmin = false;

/***********************
 * LOGIN
 ***********************/
function login() {
  const pass = document.getElementById("adminPassword").value.trim();
  if (!pass) return alert("من فضلك أدخل كلمة المرور");

  db.ref("admin/password").once("value")
    .then(snap => {
      if (snap.val() === pass) {
        isAdmin = true;

        document.getElementById("loginBox").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        document.getElementById("welcomeMsg").style.display = "block";

        // 🔥 IMPORTANT: re-render profiles so delete buttons appear
        loadProfiles();

        alert("تم تسجيل الدخول بنجاح");
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    })
    .catch(() => alert("خطأ في الاتصال بقاعدة البيانات"));
}

/***********************
 * CHANGE PASSWORD
 ***********************/
function changePassword() {
  if (!isAdmin) return;

  const newPass = prompt("أدخل كلمة المرور الجديدة:");
  if (!newPass || newPass.length < 4)
    return alert("كلمة المرور يجب أن تكون 4 أحرف على الأقل");

  db.ref("admin/password").set(newPass)
    .then(() => alert("تم تغيير كلمة المرور بنجاح ✅"))
    .catch(() => alert("فشل تغيير كلمة المرور"));
}

/***********************
 * ADD PROFILE  ✅ FIXED
 ***********************/
function addProfile() {
  if (!isAdmin) return;

  const gender = document.getElementById("gender").value;

  const profile = {
    name: document.getElementById("name").value.trim(),
    age: document.getElementById("age").value.trim(),
    height: document.getElementById("height").value.trim(),
    hair: document.getElementById("hair").value.trim(),
    eyes: document.getElementById("eyes").value.trim(),
    job: document.getElementById("job").value.trim(),
    describeMe: document.getElementById("describeMe").value.trim(),
    requirements: document.getElementById("requirements").value.trim(),
    createdAt: Date.now()
  };

  if (!profile.name || !profile.age) {
    alert("الاسم والعمر مطلوبان");
    return;
  }

  db.ref("profiles/" + gender).push(profile)
    .then(() => {
      clearForm();
      alert("تمت الإضافة بنجاح ✅");
    })
    .catch(() => alert("خطأ أثناء الحفظ"));
}

/***********************
 * DELETE PROFILE  ✅ WORKING
 ***********************/
function deleteProfile(key, gender) {
  if (!isAdmin) return;

  if (!confirm("هل أنت متأكد من الحذف؟")) return;

  db.ref(`profiles/${gender}/${key}`).remove();
}

/***********************
 * LOAD PROFILES
 ***********************/
function loadProfiles() {
  db.ref("profiles/men").off();
  db.ref("profiles/women").off();

  db.ref("profiles/men").on("value", snap =>
    renderProfiles(snap.val(), "men")
  );

  db.ref("profiles/women").on("value", snap =>
    renderProfiles(snap.val(), "women")
  );
}

/***********************
 * RENDER
 ***********************/
function renderProfiles(data, gender) {
  const container = document.getElementById(
    gender === "men" ? "menList" : "womenList"
  );

  let html = `<h2>${gender === "men" ? "👨 الرجال" : "👩 النساء"}</h2>`;
  let index = 1;

  if (data) {
    for (let key in data) {
      html += profileHTML(data[key], gender, index++, key);
    }
  }

  container.innerHTML = html;
}

function profileHTML(p, gender, index, key) {
  const avatar = gender === "men" ? "img/man.webp" : "img/woman.avif";

  const delBtn = isAdmin
    ? `<button class="profile-delete" onclick="deleteProfile('${key}','${gender}')">حذف</button>`
    : "";

  return `
    <div class="profile">
      <img src="${avatar}">
      <div class="profile-info">

        <strong>${index}. ${p.name}</strong>

        <span class="label">العمر:</span>
        <span class="value">${p.age}</span><br>

        <span class="label">الطول:</span>
        <span class="value">${p.height || "-"}</span><br>

        <span class="label">لون الشعر:</span>
        <span class="value">${p.hair || "-"}</span><br>

        <span class="label">لون العيون:</span>
        <span class="value">${p.eyes || "-"}</span><br>

        <span class="label">الوظيفة:</span>
        <span class="value">${p.job || "-"}</span><br>

        <span class="label">عن الشخص:</span>
        <span class="value">${p.describeMe || "-"}</span><br>

        <span class="label">المطلوب:</span>
        <span class="value">${p.requirements || "-"}</span>

      </div>
      ${delBtn}
    </div>
  `;
}

/***********************
 * UTIL
 ***********************/
function clearForm() {
  document.querySelectorAll("#adminPanel input, #adminPanel textarea")
    .forEach(el => el.value = "");
}

/***********************
 * INIT
 ***********************/
document.addEventListener("DOMContentLoaded", loadProfiles);
