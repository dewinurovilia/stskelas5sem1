/* =========================================================
   SCRIPT UJIAN ONLINE KELAS V
   Mendukung:
   - Bacaan
   - Pilihan Ganda
   - Isian
   - Uraian
   - Password setiap mapel
   - Timer 90 menit
   ========================================================= */
const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycby6RCGkUVe9MleUXSrHZlS8r4tLBjLy0qHno5KM0ZqN34-XWSlZELz4wmBXbCRgAg3p/exec";

/* =========================================================
   DAFTAR MATA PELAJARAN
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
let currentData = null;


/* =========================================================
   ELEMENT
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

  const button =
    document.createElement("button");

  button.className = "subject-btn";

  button.textContent = subject;

  button.onclick = () => {

    openPassword(subject, button);

  };

  subjectButtons.appendChild(button);

});


/* =========================================================
   BUKA PASSWORD
   ========================================================= */

function openPassword(subject, button) {

  selectedSubject = subject;

  document
    .querySelectorAll(".subject-btn")
    .forEach(btn => {
      btn.classList.remove("active");
    });

  button.classList.add("active");

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
   TUTUP PASSWORD
   ========================================================= */

document
  .getElementById("closeModal")
  .onclick = () => {

    modal.classList.add("hidden");

  };


/* =========================================================
   ENTER PASSWORD
   ========================================================= */

document
  .getElementById("passwordBtn")
  .onclick = verifyPassword;


passwordInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {

      verifyPassword();

    }

  }
);


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

  } catch (error) {

    console.error(error);

    alert(
      "Soal tidak dapat dimuat.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   LOAD FILE SOAL
   ========================================================= */

async function loadSubjectData(subject) {

  const config =
    SUBJECTS[subject];


  /* Jika sudah dimuat */

  if (
    window[config.globalName]
  ) {

    return window[config.globalName];

  }


  /* Load file JS */

  if (!loadedScripts[subject]) {

    await new Promise(
      (resolve, reject) => {

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

      }
    );

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
   MULAI UJIAN
   ========================================================= */

async function startExam(subject) {

  const config =
    SUBJECTS[subject];


  currentData =
    await loadSubjectData(subject);


  /* Tampilkan kartu siswa */

  document
    .getElementById("studentCard")
    .classList.remove("hidden");


  /* Tampilkan kartu ujian */

  document
    .getElementById("examCard")
    .classList.remove("hidden");


  /* Judul */

  document
    .getElementById("examTitle")
    .textContent =
      currentData.nama ||
      subject;


  /* Info */

  let jumlahPG = 0;
  let jumlahIsian = 0;
  let jumlahUraian = 0;


  if (
    Array.isArray(
      currentData.pilihanGanda
    )
  ) {

    jumlahPG =
      currentData.pilihanGanda.length;

  }


  if (
    Array.isArray(
      currentData.isian
    )
  ) {

    jumlahIsian =
      currentData.isian.length;

  }


  if (
    Array.isArray(
      currentData.uraian
    )
  ) {

    jumlahUraian =
      currentData.uraian.length;

  }


  document
    .getElementById("examInfo")
    .textContent =
      `${jumlahPG} Pilihan Ganda • ` +
      `${jumlahIsian} Isian • ` +
      `${jumlahUraian} Uraian • ` +
      `Waktu ${config.duration} menit`;


  /* Reset hasil */

  document
    .getElementById("result")
    .classList.add("hidden");


  /* Aktifkan tombol */

  document
    .getElementById("submitBtn")
    .disabled = false;


  /* Tampilkan semua soal */

  renderAllQuestions(currentData);


  /* Timer */

  startTimer(config.duration);


  /* Scroll */

  window.scrollTo({

    top:
      document
        .getElementById("examCard")
        .offsetTop - 20,

    behavior: "smooth"

  });

}


/* =========================================================
   RENDER SEMUA SOAL
   ========================================================= */

function renderAllQuestions(data) {

  const box =
    document.getElementById("questions");


  box.innerHTML = "";


  /* =======================================================
     PILIHAN GANDA
     ======================================================= */

  if (
    Array.isArray(data.pilihanGanda) &&
    data.pilihanGanda.length > 0
  ) {

    const title =
      document.createElement("div");

    title.className =
      "section-title";

    title.innerHTML =
      "<h2>A. Pilihan Ganda</h2>";

    box.appendChild(title);


    renderPilihanGanda(
      box,
      data.pilihanGanda
    );

  }


  /* =======================================================
     ISIAN
     ======================================================= */

  if (
    Array.isArray(data.isian) &&
    data.isian.length > 0
  ) {

    const title =
      document.createElement("div");

    title.className =
      "section-title";

    title.innerHTML =
      "<h2>B. Isian</h2>";

    box.appendChild(title);


    renderIsian(
      box,
      data.isian
    );

  }


  /* =======================================================
     URAIAN
     ======================================================= */

  if (
    Array.isArray(data.uraian) &&
    data.uraian.length > 0
  ) {

    const title =
      document.createElement("div");

    title.className =
      "section-title";

    title.innerHTML =
      "<h2>C. Uraian</h2>";

    box.appendChild(title);


    renderUraian(
      box,
      data.uraian
    );

  }

}


/* =========================================================
   RENDER PILIHAN GANDA
   ========================================================= */

function renderPilihanGanda(
  box,
  questions
) {

  questions.forEach(
    (item, index) => {

      /*
       * Tentukan bacaan sebelum kelompok soal.
       */

      if (
        currentData.bacaan
      ) {

        if (index === 0) {

          addBacaan(
            box,
            "Bacaan untuk soal 1–5",
            currentData.bacaan.soal1_5
          );

        }

        if (index === 5) {

          addBacaan(
            box,
            "Bacaan untuk soal 6–10",
            currentData.bacaan.soal6_10
          );

        }

        if (index === 10) {

          addBacaan(
            box,
            "Bacaan untuk soal 11–15",
            currentData.bacaan.soal11_15
          );

        }

        if (index === 15) {

          addBacaan(
            box,
            "Bacaan untuk soal 16–20",
            currentData.bacaan.soal16_20
          );

        }

      }


      const card =
        document.createElement("div");

      card.className =
        "question";


      const nomor =
        item.no || index + 1;


      let html = `

        <div class="question-title">

          ${nomor}.
          ${escapeHtml(item.soal)}

        </div>

      `;


      if (
        Array.isArray(item.pilihan)
      ) {

        item.pilihan.forEach(
          (option, optionIndex) => {

            html += `

              <label class="option">

                <input
                  type="radio"
                  name="pg_${nomor}"
                  value="${optionIndex}"
                >

                <span>
                  ${String.fromCharCode(
                    65 + optionIndex
                  )}.
                </span>

                ${escapeHtml(option)}

              </label>

            `;

          }
        );

      }


      card.innerHTML = html;

      box.appendChild(card);

    }
  );

}


/* =========================================================
   MENAMPILKAN BACAAN
   ========================================================= */

function addBacaan(
  box,
  judul,
  isi
) {

  if (!isi) {
    return;
  }


  const bacaan =
    document.createElement("div");


  bacaan.className =
    "bacaan";


  bacaan.innerHTML = `

    <div class="bacaan-title">
      ${escapeHtml(judul)}
    </div>

    <div class="bacaan-text">
      ${formatText(isi)}
    </div>

  `;


  box.appendChild(bacaan);

}


/* =========================================================
   RENDER ISIAN
   ========================================================= */

function renderIsian(
  box,
  questions
) {

  questions.forEach(
    (soal, index) => {

      const card =
        document.createElement("div");


      card.className =
        "question isian";


      card.innerHTML = `

        <div class="question-title">

          ${index + 1}.
          ${escapeHtml(soal)}

        </div>


        <input
          type="text"
          class="answer-input"
          name="isian_${index + 1}"
          placeholder="Tuliskan jawaban..."
          autocomplete="off"
        >

      `;


      box.appendChild(card);

    }
  );

}


/* =========================================================
   RENDER URAIAN
   ========================================================= */

function renderUraian(
  box,
  questions
) {

  questions.forEach(
    (soal, index) => {

      const card =
        document.createElement("div");


      card.className =
        "question uraian";


      card.innerHTML = `

        <div class="question-title">

          ${index + 1}.
          ${escapeHtml(soal)}

        </div>


        <textarea
          class="essay-input"
          name="uraian_${index + 1}"
          rows="5"
          placeholder="Tuliskan jawaban..."
        ></textarea>

      `;


      box.appendChild(card);

    }
  );

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

        clearInterval(
          timerInterval
        );


        alert(
          "Waktu ujian telah habis. Jawaban akan dikumpulkan."
        );


        submitExam(true);

      }

    }, 1000);

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateTimer() {

  const timer =
    document.getElementById("timer");


  if (!timer) {
    return;
  }


  const minutes =
    Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");


  const seconds =
    (timeLeft % 60)
      .toString()
      .padStart(2, "0");


  timer.textContent =
    `${minutes}:${seconds}`;


  /* Peringatan waktu */

  if (timeLeft <= 300) {

    timer.classList.add(
      "warning"
    );

  } else {

    timer.classList.remove(
      "warning"
    );

  }

}


/* =========================================================
   TOMBOL KUMPULKAN
   ========================================================= */

document
  .getElementById("submitBtn")
  .onclick = () => {


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


    const yakin =
      confirm(
        "Apakah Anda yakin ingin mengumpulkan jawaban?"
      );


    if (!yakin) {
      return;
    }


    submitExam(false);

  };


/* =========================================================
   KUMPULKAN UJIAN
   ========================================================= */

function submitExam(autoSubmit = false) {

  clearInterval(
    timerInterval
  );


  const pg =
    currentData.pilihanGanda || [];


  const isian =
    currentData.isian || [];


  const uraian =
    currentData.uraian || [];


  /* =======================================================
     NILAI PILIHAN GANDA
     ======================================================= */

  let benarPG = 0;

  let dijawabPG = 0;


  pg.forEach(
    (item, index) => {

      const nomor =
        item.no || index + 1;


      const selected =
        document.querySelector(
          `input[name="pg_${nomor}"]:checked`
        );


      if (selected) {

        dijawabPG++;


        const pilihan =
          ["a", "b", "c", "d"][
            Number(selected.value)
          ];


        const kunci =
          String(item.kunci)
            .toLowerCase()
            .trim();


        if (
          pilihan === kunci
        ) {

          benarPG++;

        }

      }

    }
  );


  /* =======================================================
     HITUNG ISIAN
     ======================================================= */

  let dijawabIsian = 0;


  isian.forEach(
    (soal, index) => {

      const input =
        document.querySelector(
          `input[name="isian_${index + 1}"]`
        );


      if (
        input &&
        input.value.trim() !== ""
      ) {

        dijawabIsian++;

      }

    }
  );


  /* =======================================================
     HITUNG URAIAN
     ======================================================= */

  let dijawabUraian = 0;


  uraian.forEach(
    (soal, index) => {

      const input =
        document.querySelector(
          `textarea[name="uraian_${index + 1}"]`
        );


      if (
        input &&
        input.value.trim() !== ""
      ) {

        dijawabUraian++;

      }

    }
  );


/* =======================================================
   KUMPULKAN JAWABAN UNTUK GOOGLE SHEET
   ======================================================= */

const jawabanPG = [];

pg.forEach((item, index) => {

  const nomor = item.no || index + 1;

  const selected =
    document.querySelector(
      `input[name="pg_${nomor}"]:checked`
    );

  if (selected) {

    const pilihan =
      ["A", "B", "C", "D"][
        Number(selected.value)
      ];

    jawabanPG.push(
      `${nomor}:${pilihan}`
    );

  } else {

    jawabanPG.push(
      `${nomor}:-`
    );

  }

});


const jawabanIsian = [];

isian.forEach((soal, index) => {

  const input =
    document.querySelector(
      `input[name="isian_${index + 1}"]`
    );

  jawabanIsian.push(
    `${index + 1}:${input ? input.value : ""}`
  );

});


const jawabanUraian = [];

uraian.forEach((soal, index) => {

  const input =
    document.querySelector(
      `textarea[name="uraian_${index + 1}"]`
    );

  jawabanUraian.push(
    `${index + 1}:${input ? input.value : ""}`
  );

});


/* =======================================================
   DATA YANG DIKIRIM
   ======================================================= */

const dataKirim = {

  nama:
    document
      .getElementById("studentName")
      .value
      .trim(),

  kelas:
    document
      .getElementById("studentClass")
      .value
      .trim(),

  mapel:
    selectedSubject,

  nilaiPG:
    nilaiPG,

  benarPG:
    benarPG,

  terjawabPG:
    dijawabPG,

  jawabanPG:
    jawabanPG.join(" | "),

  jawabanIsian:
    jawabanIsian.join(" | "),

  jawabanUraian:
    jawabanUraian.join(" | ")

};


/* =======================================================
   KIRIM KE GOOGLE SHEETS
   ======================================================= */

fetch(GOOGLE_SHEET_URL, {

  method: "POST",

  mode: "no-cors",

  headers: {
    "Content-Type":
      "text/plain;charset=utf-8"
  },

  body:
    JSON.stringify(dataKirim)

})
.then(() => {

  console.log(
    "Jawaban berhasil dikirim ke Google Sheet."
  );

})
.catch(error => {

  console.error(
    "Gagal mengirim ke Google Sheet:",
    error
  );

});
  const nama =
    document
      .getElementById("studentName")
      .value;


  const kelas =
    document
      .getElementById("studentClass")
      .value;


  result.innerHTML = `

    <h2>Hasil Ujian</h2>


    <p>
      <strong>Nama:</strong>
      ${escapeHtml(nama)}
    </p>


    <p>
      <strong>Kelas:</strong>
      ${escapeHtml(kelas)}
    </p>


    <p>
      <strong>Mapel:</strong>
      ${escapeHtml(selectedSubject)}
    </p>


    <hr>


    <p>
      <strong>Pilihan Ganda</strong>
    </p>


    <p>
      Terjawab:
      ${dijawabPG}
      dari
      ${pg.length}
    </p>


    <p>
      Benar:
      ${benarPG}
      dari
      ${pg.length}
    </p>


    <p>
      Nilai PG:
      <strong>${nilaiPG}</strong>
    </p>


    <hr>


    <p>
      <strong>Isian</strong>
    </p>


    <p>
      Terjawab:
      ${dijawabIsian}
      dari
      ${isian.length}
    </p>


    <hr>


    <p>
      <strong>Uraian</strong>
    </p>


    <p>
      Terjawab:
      ${dijawabUraian}
      dari
      ${uraian.length}
    </p>


    <hr>


    <p>
      ${
        autoSubmit
          ? "⏰ Waktu habis. Jawaban dikumpulkan otomatis."
          : "✅ Jawaban berhasil dikumpulkan."
      }
    </p>

  `;


  /* Nonaktifkan tombol */

  document
    .getElementById("submitBtn")
    .disabled = true;


  /* Kunci semua input */

  document
    .querySelectorAll(
      "#questions input, #questions textarea"
    )
    .forEach(element => {

      element.disabled = true;

    });


  /* Scroll ke hasil */

  result.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================================================
   FORMAT TEKS BACAAN
   ========================================================= */

function formatText(text) {

  return escapeHtml(text)
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {

  return String(text).replace(
    /[&<>"']/g,
    function (char) {

      const entities = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      };


      return entities[char];

    }
  );

}
