/* =========================================================
   SCRIPT UTAMA UJIAN ONLINE KELAS V
   ========================================================= */

const SUBJECTS = {

  "Bahasa Jawa": {
    password: "jawa123",
    duration: 90,
    file: "soal/bahasa-jawa.js",
    globalName: "SOAL_BAHASA_JAWA"
  },

  "Bahasa Indonesia": {
    password: "indo123",
    duration: 90,
    file: "soal/bahasa-indonesia.js",
    globalName: "SOAL_BAHASA_INDONESIA"
  },

  "Bahasa Inggris": {
    password: "inggris123",
    duration: 90,
    file: "soal/bahasa-inggris.js",
    globalName: "SOAL_BAHASA_INGGRIS"
  },

  "IPAS": {
    password: "ipas123",
    duration: 90,
    file: "soal/ipas.js",
    globalName: "SOAL_IPAS"
  },

  "Matematika": {
    password: "mtk123",
    duration: 90,
    file: "soal/matematika.js",
    globalName: "SOAL_MATEMATIKA"
  },

  "Pendidikan Pancasila": {
    password: "pancasila123",
    duration: 90,
    file: "soal/pendidikan-pancasila.js",
    globalName: "SOAL_PENDIDIKAN_PANCASILA"
  },

  "Seni Rupa": {
    password: "seni123",
    duration: 90,
    file: "soal/seni-rupa.js",
    globalName: "SOAL_SENI_RUPA"
  }

};


/* =========================================================
   VARIABEL
   ========================================================= */

let selectedSubject = null;
let timeLeft = 0;
let timerInterval = null;
let loadedScripts = {};
let currentQuestions = [];


/* =========================================================
   ELEMENT HTML
   ========================================================= */

const subjectButtons =
  document.getElementById("subjectButtons");

const modal =
  document.getElementById("passwordModal");

const passwordInput =
  document.getElementById("passwordInput");

const passwordTitle =
  document.getElementById("passwordTitle");

const passwordError =
  document.getElementById("passwordError");


/* =========================================================
   MEMBUAT TOMBOL MAPEL
   ========================================================= */

Object.keys(SUBJECTS).forEach(subject => {

  const btn = document.createElement("button");

  btn.className = "subject-btn";

  btn.textContent = subject;

  btn.onclick = () => {
    openPassword(subject, btn);
  };

  subjectButtons.appendChild(btn);

});


/* =========================================================
   BUKA PASSWORD
   ========================================================= */

function openPassword(subject, btn) {

  selectedSubject = subject;

  document
    .querySelectorAll(".subject-btn")
    .forEach(button => {
      button.classList.remove("active");
    });

  btn.classList.add("active");

  passwordTitle.textContent =
    `Password ${subject}`;

  passwordInput.value = "";

  passwordError.textContent = "";

  modal.classList.remove("hidden");

  setTimeout(() => {
    passwordInput.focus();
  }, 100);

}


/* =========================================================
   TUTUP MODAL
   ========================================================= */

document.getElementById("closeModal").onclick = () => {

  modal.classList.add("hidden");

};


/* =========================================================
   TOMBOL PASSWORD
   ========================================================= */

document.getElementById("passwordBtn").onclick =
  verifyPassword;


passwordInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    verifyPassword();
  }

});


/* =========================================================
   VERIFIKASI PASSWORD
   ========================================================= */

async function verifyPassword() {

  if (!selectedSubject) {
    return;
  }

  const config =
    SUBJECTS[selectedSubject];


  if (
    passwordInput.value !==
    config.password
  ) {

    passwordError.textContent =
      "Password salah. Silakan coba lagi.";

    passwordInput.select();

    return;
  }


  passwordError.textContent = "";

  modal.classList.add("hidden");


  try {

    await startExam(selectedSubject);

  }

  catch (error) {

    console.error(error);

    alert(
      "File soal tidak dapat dibuka.\n\n" +
      "Pastikan folder soal dan nama file sudah benar."
    );

  }

}


/* =========================================================
   MEMUAT FILE SOAL
   ========================================================= */

async function loadSubjectData(subject) {

  const config =
    SUBJECTS[subject];


  /* Jika sudah tersedia */

  if (
    window[config.globalName]
  ) {

    return window[config.globalName];

  }


  /* Jika belum pernah dimuat */

  if (!loadedScripts[subject]) {

    await new Promise((resolve, reject) => {

      const script =
        document.createElement("script");

      script.src =
        config.file;

      script.onload = () => {

        loadedScripts[subject] = true;

        resolve();

      };


      script.onerror = () => {

        reject(
          new Error(
            `File tidak ditemukan: ${config.file}`
          )
        );

      };


      document.body.appendChild(script);

    });

  }


  const data =
    window[config.globalName];


  if (!data) {

    throw new Error(
      `Variabel ${config.globalName} tidak ditemukan.`
    );

  }


  return data;

}


/* =========================================================
   MENGUBAH DATA SOAL
   ========================================================= */

function convertQuestions(data) {


  /* -------------------------------------------------------
     FORMAT QUESTIONS
     ------------------------------------------------------- */

  if (
    Array.isArray(data.questions) &&
    data.questions.length > 0
  ) {

    return data.questions.map(item => {

      return {

        q: item.q,

        a: item.a,

        correct: Number(item.correct)

      };

    });

  }


  /* -------------------------------------------------------
     FORMAT PILIHAN GANDA
     Seperti file Bahasa Jawa Ibu
     ------------------------------------------------------- */

  if (
    Array.isArray(data.pilihanGanda) &&
    data.pilihanGanda.length > 0
  ) {

    return data.pilihanGanda.map(item => {

      const kunci =
        String(item.kunci)
          .trim()
          .toLowerCase();


      let correctIndex = -1;


      if (kunci === "a") {
        correctIndex = 0;
      }

      if (kunci === "b") {
        correctIndex = 1;
      }

      if (kunci === "c") {
        correctIndex = 2;
      }

      if (kunci === "d") {
        correctIndex = 3;
      }


      return {

        q: item.soal,

        a: item.pilihan,

        correct: correctIndex

      };

    });

  }


  return [];

}


/* =========================================================
   MEMULAI UJIAN
   ========================================================= */

async function startExam(subject) {

  const config =
    SUBJECTS[subject];


  const data =
    await loadSubjectData(subject);


  currentQuestions =
    convertQuestions(data);


  /* -------------------------------------------------------
     CEK SOAL
     ------------------------------------------------------- */

  if (
    !currentQuestions ||
    currentQuestions.length === 0
  ) {

    alert(
      `Soal ${subject} belum diisi.`
    );

    return;

  }


  /* -------------------------------------------------------
     TAMPILKAN FORM SISWA
     ------------------------------------------------------- */

  document
    .getElementById("studentCard")
    .classList.remove("hidden");


  document
    .getElementById("examCard")
    .classList.remove("hidden");


  document
    .getElementById("examTitle")
    .textContent =
      subject;


  document
    .getElementById("examInfo")
    .textContent =
      `${currentQuestions.length} soal • Waktu ${config.duration} menit`;


  document
    .getElementById("result")
    .classList.add("hidden");


  document
    .getElementById("submitBtn")
    .disabled = false;


  /* -------------------------------------------------------
     TAMPILKAN SOAL
     ------------------------------------------------------- */

  renderQuestions(currentQuestions);


  /* -------------------------------------------------------
     MULAI TIMER
     ------------------------------------------------------- */

  startTimer(config.duration);


  /* -------------------------------------------------------
     SCROLL KE SOAL
     ------------------------------------------------------- */

  window.scrollTo({

    top:
      document.getElementById("examCard")
        .offsetTop - 20,

    behavior: "smooth"

  });

}


/* =========================================================
   MENAMPILKAN SOAL
   ========================================================= */

function renderQuestions(questions) {

  const box =
    document.getElementById("questions");


  box.innerHTML = "";


  questions.forEach((item, i) => {

    const div =
      document.createElement("div");


    div.className =
      "question";


    div.innerHTML = `
      <div class="question-title">
        ${i + 1}. ${escapeHtml(item.q)}
      </div>
    `;


    item.a.forEach((option, j) => {

      div.innerHTML += `

        <label class="option">

          <input
            type="radio"
            name="q${i}"
            value="${j}"
          >

          ${String.fromCharCode(65 + j)}.
          ${escapeHtml(String(option))}

        </label>

      `;

    });


    box.appendChild(div);

  });

}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer(minutes) {

  clearInterval(timerInterval);


  timeLeft =
    minutes * 60;


  updateTimer();


  timerInterval =
    setInterval(() => {

      timeLeft--;


      updateTimer();


      if (timeLeft <= 0) {

        clearInterval(timerInterval);

        submitExam(true);

      }

    }, 1000);

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateTimer() {

  const minutes =
    Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");


  const seconds =
    (timeLeft % 60)
      .toString()
      .padStart(2, "0");


  document.getElementById("timer")
    .textContent =
      `${minutes}:${seconds}`;

}


/* =========================================================
   TOMBOL KUMPULKAN
   ========================================================= */

document.getElementById("submitBtn").onclick =
  () => {


    const nama =
      document
        .getElementById("studentName")
        .value
        .trim();


    if (!nama) {

      alert(
        "Silakan isi nama siswa terlebih dahulu."
      );

      document
        .getElementById("studentName")
        .focus();

      return;

    }


    submitExam(false);

  };


/* =========================================================
   KUMPULKAN JAWABAN
   ========================================================= */

async function submitExam(auto = false) {

  const data =
    await loadSubjectData(selectedSubject);


  const questions =
    convertQuestions(data);


  let score = 0;

  let answered = 0;


  questions.forEach((item, i) => {

    const selected =
      document.querySelector(
        `input[name="q${i}"]:checked`
      );


    if (selected) {

      answered++;


      if (
        Number(selected.value) ===
        Number(item.correct)
      ) {

        score++;

      }

    }

  });


  clearInterval(timerInterval);


  const nilai =
    Math.round(
      (score / questions.length) * 100
    );


  const result =
    document.getElementById("result");


  result.classList.remove("hidden");


  result.innerHTML = `

    <div>
      <strong>
        Ujian ${escapeHtml(selectedSubject)}
        selesai.
      </strong>
    </div>

    <div>
      Nama:
      ${escapeHtml(
        document.getElementById("studentName").value
      )}
    </div>

    <div>
      Kelas:
      ${escapeHtml(
        document.getElementById("studentClass").value
      )}
    </div>

    <div>
      Jawaban terisi:
      ${answered}
      dari
      ${questions.length}
    </div>

    <div>
      Jawaban benar:
      ${score}
      dari
      ${questions.length}
    </div>

    <div>
      Nilai:
      <strong>${nilai}</strong>
    </div>

    <div>
      ${
        auto
          ? "Waktu habis, jawaban dikumpulkan otomatis."
          : "Jawaban berhasil dikumpulkan."
      }
    </div>

  `;


  document
    .getElementById("submitBtn")
    .disabled = true;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {

  return String(text).replace(
    /[&<>"']/g,
    m => ({

      "&": "&amp;",

      "<": "&lt;",

      ">": "&gt;",

      '"': "&quot;",

      "'": "&#039;"

    }[m])
  );

}
