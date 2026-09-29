const SUBJECTS = {
  "Bahasa Jawa": {
    password: "jawa123",
    duration: 30,
    file: "soal/bahasa-jawa.js",
    data: () => window.SOAL_BAHASA_JAWA
  },

  "Bahasa Indonesia": {
    password: "indo123",
    duration: 30,
    file: "soal/bahasa-indonesia.js",
    data: () => window.SOAL_BAHASA_INDONESIA
  },

  "Bahasa Inggris": {
    password: "inggris123",
    duration: 30,
    file: "soal/bahasa-inggris.js",
    data: () => window.SOAL_BAHASA_INGGRIS
  },

  "IPAS": {
    password: "ipas123",
    duration: 30,
    file: "soal/ipas.js",
    data: () => window.SOAL_IPAS
  },

  "Matematika": {
    password: "mtk123",
    duration: 30,
    file: "soal/matematika.js",
    data: () => window.SOAL_MATEMATIKA
  },

  "Pendidikan Pancasila": {
    password: "pancasila123",
    duration: 30,
    file: "soal/pendidikan-pancasila.js",
    data: () => window.SOAL_PENDIDIKAN_PANCASILA
  },

  "Seni Rupa": {
    password: "seni123",
    duration: 30,
    file: "soal/seni-rupa.js",
    data: () => window.SOAL_SENI_RUPA
  }
};

let selectedSubject = null;
let timeLeft = 0;
let timerInterval = null;

const subjectButtons = document.getElementById("subjectButtons");
const modal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("passwordInput");
const passwordTitle = document.getElementById("passwordTitle");
const passwordError = document.getElementById("passwordError");

Object.keys(SUBJECTS).forEach(subject => {
  const btn = document.createElement("button");
  btn.className = "subject-btn";
  btn.textContent = subject;
  btn.onclick = () => openPassword(subject, btn);
  subjectButtons.appendChild(btn);
});

function openPassword(subject, btn) {
  selectedSubject = subject;
  document.querySelectorAll(".subject-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  passwordTitle.textContent = `Password ${subject}`;
  passwordInput.value = "";
  passwordError.textContent = "";
  modal.classList.remove("hidden");
  setTimeout(() => passwordInput.focus(), 100);
}

document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

document.getElementById("passwordBtn").onclick = verifyPassword;
passwordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") verifyPassword();
});

function verifyPassword() {
  const data = SUBJECTS[selectedSubject];
  if (passwordInput.value === data.password) {
    modal.classList.add("hidden");
    startExam(selectedSubject);
  } else {
    passwordError.textContent = "Password salah. Silakan coba lagi.";
    passwordInput.select();
  }
}

function startExam(subject) {
  const data = SUBJECTS[subject];
  document.getElementById("studentCard").classList.remove("hidden");
  document.getElementById("examCard").classList.remove("hidden");
  document.getElementById("examTitle").textContent = subject;
  document.getElementById("examInfo").textContent = `${data.questions.length} soal • Waktu ${data.duration} menit`;
  document.getElementById("result").classList.add("hidden");
  renderQuestions(data.questions);
  startTimer(data.duration);
  window.scrollTo({top: document.getElementById("examCard").offsetTop - 20, behavior:"smooth"});
}

function renderQuestions(questions) {
  const box = document.getElementById("questions");
  box.innerHTML = "";
  questions.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<div class="question-title">${i+1}. ${item.q}</div>`;
    item.a.forEach((opt, j) => {
      div.innerHTML += `
        <label class="option">
          <input type="radio" name="q${i}" value="${j}">
          ${String.fromCharCode(65+j)}. ${opt}
        </label>`;
    });
    box.appendChild(div);
  });
}

function startTimer(minutes) {
  clearInterval(timerInterval);
  timeLeft = minutes * 60;
  updateTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitExam(true);
    }
  }, 1000);
}

function updateTimer() {
  const m = Math.floor(timeLeft / 60).toString().padStart(2,"0");
  const s = (timeLeft % 60).toString().padStart(2,"0");
  document.getElementById("timer").textContent = `${m}:${s}`;
}

document.getElementById("submitBtn").onclick = () => {
  if (!document.getElementById("studentName").value.trim()) {
    alert("Silakan isi nama siswa terlebih dahulu.");
    document.getElementById("studentName").focus();
    return;
  }
  submitExam(false);
};

function submitExam(auto) {
  const data = SUBJECTS[selectedSubject];
  let score = 0;
  let answered = 0;

  data.questions.forEach((item, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected) {
      answered++;
      if (Number(selected.value) === item.correct) score++;
    }
  });

  clearInterval(timerInterval);
  const nilai = Math.round((score / data.questions.length) * 100);
  const result = document.getElementById("result");
  result.classList.remove("hidden");
  result.innerHTML = `
    <div>Ujian ${selectedSubject} selesai.</div>
    <div>Nama: ${escapeHtml(document.getElementById("studentName").value)}</div>
    <div>Jawaban benar: ${score} dari ${data.questions.length}</div>
    <div>Nilai: ${nilai}</div>
    <div>${auto ? "Waktu habis, jawaban dikumpulkan otomatis." : "Jawaban berhasil dikumpulkan."}</div>
  `;
  document.getElementById("submitBtn").disabled = true;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
