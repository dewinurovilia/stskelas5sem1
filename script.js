const SUBJECTS = {
  "Bahasa Jawa": {
    password: "jawa123",
    duration: 30,
    file: "soal/bahasa-jawa.js",
    globalName: "SOAL_BAHASA_JAWA"
  },
  "Bahasa Indonesia": {
    password: "indo123",
    duration: 30,
    file: "soal/bahasa-indonesia.js",
    globalName: "SOAL_BAHASA_INDONESIA"
  },
  "Bahasa Inggris": {
    password: "inggris123",
    duration: 30,
    file: "soal/bahasa-inggris.js",
    globalName: "SOAL_BAHASA_INGGRIS"
  },
  "IPAS": {
    password: "ipas123",
    duration: 30,
    file: "soal/ipas.js",
    globalName: "SOAL_IPAS"
  },
  "Matematika": {
    password: "mtk123",
    duration: 30,
    file: "soal/matematika.js",
    globalName: "SOAL_MATEMATIKA"
  },
  "Pendidikan Pancasila": {
    password: "pancasila123",
    duration: 30,
    file: "soal/pendidikan-pancasila.js",
    globalName: "SOAL_PENDIDIKAN_PANCASILA"
  },
  "Seni Rupa": {
    password: "seni123",
    duration: 30,
    file: "soal/seni-rupa.js",
    globalName: "SOAL_SENI_RUPA"
  }
};

let selectedSubject = null;
let timeLeft = 0;
let timerInterval = null;
let loadedScripts = {};

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

async function verifyPassword() {
  const config = SUBJECTS[selectedSubject];

  if (passwordInput.value !== config.password) {
    passwordError.textContent = "Password salah. Silakan coba lagi.";
    passwordInput.select();
    return;
  }

  passwordError.textContent = "";
  modal.classList.add("hidden");

  try {
    await startExam(selectedSubject);
  } catch (error) {
    console.error(error);
    alert("File soal tidak dapat dibuka. Pastikan folder 'soal' dan nama file sudah benar.");
  }
}

async function loadSubjectQuestions(subject) {
  const config = SUBJECTS[subject];

  if (window[config.globalName]) {
    return window[config.globalName];
  }

  if (!loadedScripts[subject]) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = config.file;
      script.onload = () => {
        loadedScripts[subject] = true;
        resolve();
      };
      script.onerror = () => reject(new Error(`Gagal memuat ${config.file}`));
      document.body.appendChild(script);
    });
  }

  const data = window[config.globalName];

  if (!data) {
    throw new Error(`Variabel ${config.globalName} tidak ditemukan.`);
  }

  return data;
}

async function startExam(subject) {
  const config = SUBJECTS[subject];
  const data = await loadSubjectQuestions(subject);

  if (!data.questions || data.questions.length === 0) {
    alert(`Soal ${subject} belum diisi.`);
    return;
  }

  document.getElementById("studentCard").classList.remove("hidden");
  document.getElementById("examCard").classList.remove("hidden");
  document.getElementById("examTitle").textContent = subject;
  document.getElementById("examInfo").textContent =
    `${data.questions.length} soal • Waktu ${config.duration} menit`;
  document.getElementById("result").classList.add("hidden");
  document.getElementById("submitBtn").disabled = false;

  renderQuestions(data.questions);
  startTimer(config.duration);

  window.scrollTo({
    top: document.getElementById("examCard").offsetTop - 20,
    behavior: "smooth"
  });
}

function renderQuestions(questions) {
  const box = document.getElementById("questions");
  box.innerHTML = "";

  questions.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<div class="question-title">${i + 1}. ${item.q}</div>`;

    item.a.forEach((opt, j) => {
      div.innerHTML += `
        <label class="option">
          <input type="radio" name="q${i}" value="${j}">
          ${String.fromCharCode(65 + j)}. ${escapeHtml(String(opt))}
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
  const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
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

async function submitExam(auto) {
  const config = SUBJECTS[selectedSubject];
  const data = await loadSubjectQuestions(selectedSubject);

  let score = 0;
  let answered = 0;

  data.questions.forEach((item, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);

    if (selected) {
      answered++;

      if (Number(selected.value) === Number(item.correct)) {
        score++;
      }
    }
  });

  clearInterval(timerInterval);

  const nilai = Math.round((score / data.questions.length) * 100);
  const result = document.getElementById("result");

  result.classList.remove("hidden");
  result.innerHTML = `
    <div>Ujian ${escapeHtml(selectedSubject)} selesai.</div>
    <div>Nama: ${escapeHtml(document.getElementById("studentName").value)}</div>
    <div>Kelas: ${escapeHtml(document.getElementById("studentClass").value)}</div>
    <div>Jawaban terisi: ${answered} dari ${data.questions.length}</div>
    <div>Jawaban benar: ${score} dari ${data.questions.length}</div>
    <div>Nilai: ${nilai}</div>
    <div>${auto ? "Waktu habis, jawaban dikumpulkan otomatis." : "Jawaban berhasil dikumpulkan."}</div>
  `;

  document.getElementById("submitBtn").disabled = true;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}
