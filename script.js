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
  const inputPass = document.getElementById("adminPassword").value.trim();

  if (!inputPass) {
    alert("من فضلك أدخل كلمة المرور");
    return;
  }

  db.ref("admin/password").once("value")
    .then(snapshot => {
      const realPassword = snapshot.val();

      if (inputPass === realPassword) {
        isAdmin = true;

        document.getElementById("loginBox").style.display = "none";
        document.getElementById("adminPanel").style.display = "block";
        document.getElementById("welcomeMsg").style.display = "block";

        alert("تم تسجيل الدخول بنجاح");
      } else {
        alert("كلمة المرور غير صحيحة");
      }
    })
    .catch(() => {
      alert("خطأ في الاتصال بقاعدة البيانات");
    });
}

/***********************
 * CHANGE PASSWORD (ADMIN)
 ***********************/
function changePassword() {
  if (!isAdmin) {
    alert("يجب تسجيل الدخول كمسؤول");
    return;
  }

  const newPass = prompt("أدخل كلمة المرور الجديدة:");

  if (!newPass || newPass.length < 4) {
    alert("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
    return;
  }

  db.ref("admin/password").set(newPass)
    .then(() => {
      alert("تم تغيير كلمة المرور بنجاح ✅");
    })
    .catch(() => {
      alert("فشل تغيير كلمة المرور");
    });
}

/***********************
 * ADD PROFILE (ADMIN)
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
    })
    .catch(() => {
      alert("خطأ أثناء الحفظ");
    });
}

/***********************
 * DELETE PROFILE (ADMIN)
 ***********************/
function deleteProfile(key, gender) {
  if (!isAdmin) return;

  if (!confirm("هل أنت متأكد من الحذف؟")) return;

  db.ref("profiles/" + gender + "/" + key).remove();
}

/***********************
 * LOAD PROFILES (ALL USERS)
 ***********************/
function loadProfiles() {
  db.ref("profiles/men").on("value", snap => {
    renderProfiles(snap.val(), "men");
  });

  db.ref("profiles/women").on("value", snap => {
    renderProfiles(snap.val(), "women");
  });
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
        <strong>${index}. ${p.name}</strong><br>
        العمر: ${p.age}<br>
        الطول: ${p.height || "-"}<br>
        لون الشعر: ${p.hair || "-"}<br>
        لون العيون: ${p.eyes || "-"}<br>
        الوظيفة: ${p.job || "-"}<br>
        <em>عن الشخص:</em> ${p.describeMe || "-"}<br>
        <em>المطلوب:</em> ${p.requirements || "-"}
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
