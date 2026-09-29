/* =========================================================
   SCRIPT UJIAN ONLINE KELAS V
   =========================================================
   Fitur:
   1. Password setiap mata pelajaran
   2. Timer 90 menit
   3. Bacaan
   4. Pilihan ganda
   5. Isian
   6. Uraian
   7. Penilaian pilihan ganda otomatis
   8. Pengiriman jawaban ke Google Sheet
   9. Nama siswa
   10. Kelas
   11. Mapel
   12. Waktu pengumpulan
   ========================================================= */


/* =========================================================
   URL GOOGLE APPS SCRIPT
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
   VARIABEL GLOBAL
   ========================================================= */

let selectedSubject = null;

let timeLeft = 0;

let timerInterval = null;

let loadedScripts = {};

let currentData = null;


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

  const button =
    document.createElement("button");

  button.className =
    "subject-btn";

  button.textContent =
    subject;

  button.onclick = () => {

    openPassword(
      subject,
      button
    );

  };

  subjectButtons.appendChild(
    button
  );

});


/* =========================================================
   BUKA PASSWORD
   ========================================================= */

function openPassword(
  subject,
  button
) {

  selectedSubject =
    subject;


  document
    .querySelectorAll(
      ".subject-btn"
    )
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  button.classList.add(
    "active"
  );


  passwordTitle.textContent =
    `Password ${subject}`;


  passwordInput.value = "";


  passwordError.textContent = "";


  modal.classList.remove(
    "hidden"
  );


  setTimeout(() => {

    passwordInput.focus();

  }, 100);

}


/* =========================================================
   TUTUP MODAL PASSWORD
   ========================================================= */

document
  .getElementById("closeModal")
  .onclick = () => {

    modal.classList.add(
      "hidden"
    );

  };


/* =========================================================
   TOMBOL PASSWORD
   ========================================================= */

document
  .getElementById("passwordBtn")
  .onclick =
  verifyPassword;


passwordInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      verifyPassword();

    }

  }
);


/* =========================================================
   VERIFIKASI PASSWORD
   ========================================================= */

async function verifyPassword() {

  if (
    !selectedSubject
  ) {

    return;

  }


  const config =
    SUBJECTS[
      selectedSubject
    ];


  if (
    passwordInput.value !==
    config.password
  ) {

    passwordError.textContent =
      "Password salah. Silakan coba lagi.";


    passwordInput.select();


    return;

  }


  passwordError.textContent =
    "";


  modal.classList.add(
    "hidden"
  );


  try {

    await startExam(
      selectedSubject
    );

  }

  catch (error) {

    console.error(
      error
    );


    alert(
      "Soal tidak dapat dimuat.\n\n" +
      error.message
    );

  }

}


/* =========================================================
   MEMUAT FILE SOAL
   ========================================================= */

async function loadSubjectData(
  subject
) {

  const config =
    SUBJECTS[subject];


  /* -------------------------------------------------------
     Jika data sudah tersedia
     ------------------------------------------------------- */

  if (
    window[
      config.globalName
    ]
  ) {

    return window[
      config.globalName
    ];

  }


  /* -------------------------------------------------------
     Load file JS
     ------------------------------------------------------- */

  if (
    !loadedScripts[subject]
  ) {

    await new Promise(
      (resolve, reject) => {

        const script =
          document.createElement(
            "script"
          );


        script.src =
          config.file;


        script.onload = () => {

          loadedScripts[
            subject
          ] = true;


          resolve();

        };


        script.onerror = () => {

          reject(
            new Error(
              `File tidak ditemukan: ${config.file}`
            )
          );

        };


        document.body.appendChild(
          script
        );

      }
    );

  }


  const data =
    window[
      config.globalName
    ];


  if (!data) {

    throw new Error(
      `Variabel ${config.globalName} tidak ditemukan di ${config.file}`
    );

  }


  return data;

}


/* =========================================================
   MULAI UJIAN
   ========================================================= */

async function startExam(
  subject
) {

  const config =
    SUBJECTS[subject];


  currentData =
    await loadSubjectData(
      subject
    );


  /* -------------------------------------------------------
     Tampilkan kartu siswa
     ------------------------------------------------------- */

  document
    .getElementById(
      "studentCard"
    )
    .classList.remove(
      "hidden"
    );


  /* -------------------------------------------------------
     Tampilkan kartu ujian
     ------------------------------------------------------- */

  document
    .getElementById(
      "examCard"
    )
    .classList.remove(
      "hidden"
    );


  /* -------------------------------------------------------
     Judul
     ------------------------------------------------------- */

  document
    .getElementById(
      "examTitle"
    )
    .textContent =
      currentData.nama ||
      subject;


  /* -------------------------------------------------------
     Hitung jumlah soal
     ------------------------------------------------------- */

  const jumlahPG =
    Array.isArray(
      currentData.pilihanGanda
    )
      ? currentData.pilihanGanda.length
      : 0;


  const jumlahIsian =
    Array.isArray(
      currentData.isian
    )
      ? currentData.isian.length
      : 0;


  const jumlahUraian =
    Array.isArray(
      currentData.uraian
    )
      ? currentData.uraian.length
      : 0;


  /* -------------------------------------------------------
     Informasi ujian
     ------------------------------------------------------- */

  document
    .getElementById(
      "examInfo"
    )
    .textContent =

      `${jumlahPG} Pilihan Ganda • ` +
      `${jumlahIsian} Isian • ` +
      `${jumlahUraian} Uraian • ` +
      `Waktu ${config.duration} menit`;


  /* -------------------------------------------------------
     Reset hasil
     ------------------------------------------------------- */

  document
    .getElementById(
      "result"
    )
    .classList.add(
      "hidden"
    );


  /* -------------------------------------------------------
     Aktifkan tombol
     ------------------------------------------------------- */

  document
    .getElementById(
      "submitBtn"
    )
    .disabled = false;


  /* -------------------------------------------------------
     Tampilkan soal
     ------------------------------------------------------- */

  renderAllQuestions(
    currentData
  );


  /* -------------------------------------------------------
     Timer
     ------------------------------------------------------- */

  startTimer(
    config.duration
  );


  /* -------------------------------------------------------
     Scroll
     ------------------------------------------------------- */

  window.scrollTo({

    top:
      document
        .getElementById(
          "examCard"
        )
        .offsetTop - 20,

    behavior: "smooth"

  });

}


/* =========================================================
   RENDER SEMUA SOAL
   ========================================================= */

function renderAllQuestions(
  data
) {

  const box =
    document.getElementById(
      "questions"
    );


  box.innerHTML = "";


  /* =======================================================
     PILIHAN GANDA
     ======================================================= */

  if (
    Array.isArray(
      data.pilihanGanda
    ) &&
    data.pilihanGanda.length > 0
  ) {

    const title =
      document.createElement(
        "div"
      );


    title.className =
      "section-title";


    title.innerHTML =
      "<h2>A. Pilihan Ganda</h2>";


    box.appendChild(
      title
    );


    renderPilihanGanda(
      box,
      data.pilihanGanda
    );

  }


  /* =======================================================
     ISIAN
     ======================================================= */

  if (
    Array.isArray(
      data.isian
    ) &&
    data.isian.length > 0
  ) {

    const title =
      document.createElement(
        "div"
      );


    title.className =
      "section-title";


    title.innerHTML =
      "<h2>B. Isian</h2>";


    box.appendChild(
      title
    );


    renderIsian(
      box,
      data.isian
    );

  }


  /* =======================================================
     URAIAN
     ======================================================= */

  if (
    Array.isArray(
      data.uraian
    ) &&
    data.uraian.length > 0
  ) {

    const title =
      document.createElement(
        "div"
      );


    title.className =
      "section-title";


    title.innerHTML =
      "<h2>C. Uraian</h2>";


    box.appendChild(
      title
    );


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


      /* ---------------------------------------------------
         BACAAN
         --------------------------------------------------- */

      if (
        currentData.bacaan
      ) {


        if (
          index === 0 &&
          currentData
            .bacaan
            .soal1_5
        ) {

          addBacaan(
            box,
            "Bacaan untuk soal 1–5",
            currentData
              .bacaan
              .soal1_5
          );

        }


        if (
          index === 5 &&
          currentData
            .bacaan
            .soal6_10
        ) {

          addBacaan(
            box,
            "Bacaan untuk soal 6–10",
            currentData
              .bacaan
              .soal6_10
          );

        }


        if (
          index === 10 &&
          currentData
            .bacaan
            .soal11_15
        ) {

          addBacaan(
            box,
            "Bacaan untuk soal 11–15",
            currentData
              .bacaan
              .soal11_15
          );

        }


        if (
          index === 15 &&
          currentData
            .bacaan
            .soal16_20
        ) {

          addBacaan(
            box,
            "Bacaan untuk soal 16–20",
            currentData
              .bacaan
              .soal16_20
          );

        }

      }


      /* ---------------------------------------------------
         KARTU SOAL
         --------------------------------------------------- */

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question";


      const nomor =
        item.no ||
        index + 1;


      let html = `

        <div class="question-title">

          ${nomor}.
          ${escapeHtml(
            item.soal
          )}

        </div>

      `;


      /* ---------------------------------------------------
         PILIHAN JAWABAN
         --------------------------------------------------- */

      if (
        Array.isArray(
          item.pilihan
        )
      ) {

        item.pilihan.forEach(
          (
            option,
            optionIndex
          ) => {

            html += `

              <label class="option">

                <input
                  type="radio"
                  name="pg_${nomor}"
                  value="${optionIndex}"
                >

                <span>
                  ${String.fromCharCode(
                    65 +
                    optionIndex
                  )}.
                </span>

                ${escapeHtml(
                  option
                )}

              </label>

            `;

          }
        );

      }


      card.innerHTML =
        html;


      box.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   BACAAN
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
    document.createElement(
      "div"
    );


  bacaan.className =
    "bacaan";


  bacaan.innerHTML = `

    <div class="bacaan-title">

      ${escapeHtml(
        judul
      )}

    </div>


    <div class="bacaan-text">

      ${formatText(
        isi
      )}

    </div>

  `;


  box.appendChild(
    bacaan
  );

}


/* =========================================================
   ISIAN
   ========================================================= */

function renderIsian(
  box,
  questions
) {

  questions.forEach(
    (soal, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question isian";


      card.innerHTML = `

        <div class="question-title">

          ${index + 1}.
          ${escapeHtml(
            soal
          )}

        </div>


        <input
          type="text"
          class="answer-input"
          name="isian_${index + 1}"
          placeholder="Tuliskan jawaban..."
          autocomplete="off"
        >

      `;


      box.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   URAIAN
   ========================================================= */

function renderUraian(
  box,
  questions
) {

  questions.forEach(
    (soal, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question uraian";


      card.innerHTML = `

        <div class="question-title">

          ${index + 1}.
          ${escapeHtml(
            soal
          )}

        </div>


        <textarea
          class="essay-input"
          name="uraian_${index + 1}"
          rows="5"
          placeholder="Tuliskan jawaban..."
        ></textarea>

      `;


      box.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer(
  minutes
) {

  clearInterval(
    timerInterval
  );


  timeLeft =
    minutes * 60;


  updateTimer();


  timerInterval =
    setInterval(
      () => {

        timeLeft--;


        updateTimer();


        if (
          timeLeft <= 0
        ) {

          clearInterval(
            timerInterval
          );


          alert(
            "Waktu ujian telah habis. Jawaban akan dikumpulkan otomatis."
          );


          submitExam(
            true
          );

        }

      },
      1000
    );

}


/* =========================================================
   UPDATE TIMER
   ========================================================= */

function updateTimer() {

  const timer =
    document.getElementById(
      "timer"
    );


  if (!timer) {
    return;
  }


  const minutes =
    Math.floor(
      timeLeft / 60
    )
      .toString()
      .padStart(
        2,
        "0"
      );


  const seconds =
    (
      timeLeft % 60
    )
      .toString()
      .padStart(
        2,
        "0"
      );


  timer.textContent =
    `${minutes}:${seconds}`;


  if (
    timeLeft <= 300
  ) {

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
  .getElementById(
    "submitBtn"
  )
  .onclick = () => {


    const nama =
      document
        .getElementById(
          "studentName"
        )
        .value
        .trim();


    if (!nama) {

      alert(
        "Silakan isi nama siswa terlebih dahulu."
      );


      document
        .getElementById(
          "studentName"
        )
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


    submitExam(
      false
    );

  };


/* =========================================================
   SUBMIT UJIAN
   ========================================================= */

async function submitExam(
  autoSubmit = false
) {

  clearInterval(
    timerInterval
  );


  const pg =
    currentData.pilihanGanda ||
    [];


  const isian =
    currentData.isian ||
    [];


  const uraian =
    currentData.uraian ||
    [];


  /* =======================================================
     NILAI PILIHAN GANDA
     ======================================================= */

  let benarPG = 0;

  let dijawabPG = 0;


  pg.forEach(
    (item, index) => {

      const nomor =
        item.no ||
        index + 1;


      const selected =
        document.querySelector(
          `input[name="pg_${nomor}"]:checked`
        );


      if (selected) {

        dijawabPG++;


        const pilihan =
          [
            "a",
            "b",
            "c",
            "d"
          ][
            Number(
              selected.value
            )
          ];


        const kunci =
          String(
            item.kunci || ""
          )
            .toLowerCase()
            .trim();


        if (
          pilihan ===
          kunci
        ) {

          benarPG++;

        }

      }

    }
  );


  /* =======================================================
     HITUNG ISIAN TERJAWAB
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
     HITUNG URAIAN TERJAWAB
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
     HITUNG NILAI PG
     ======================================================= */

  let nilaiPG = 0;


  if (
    pg.length > 0
  ) {

    nilaiPG =
      Math.round(
        (
          benarPG /
          pg.length
        ) *
        100
      );

  }


  /* =======================================================
     AMBIL JAWABAN PILIHAN GANDA
     ======================================================= */

  const jawabanPG = [];


  pg.forEach(
    (item, index) => {

      const nomor =
        item.no ||
        index + 1;


      const selected =
        document.querySelector(
          `input[name="pg_${nomor}"]:checked`
        );


      if (selected) {

        const pilihan =
          [
            "A",
            "B",
            "C",
            "D"
          ][
            Number(
              selected.value
            )
          ];


        jawabanPG.push(
          `${nomor}:${pilihan}`
        );

      } else {

        jawabanPG.push(
          `${nomor}:-`
        );

      }

    }
  );


  /* =======================================================
     AMBIL JAWABAN ISIAN
     ======================================================= */

  const jawabanIsian = [];


  isian.forEach(
    (soal, index) => {

      const input =
        document.querySelector(
          `input[name="isian_${index + 1}"]`
        );


      const jawaban =
        input
          ? input.value.trim()
          : "";


      jawabanIsian.push(
        `${index + 1}:${jawaban}`
      );

    }
  );


  /* =======================================================
     AMBIL JAWABAN URAIAN
     ======================================================= */

  const jawabanUraian = [];


  uraian.forEach(
    (soal, index) => {

      const input =
        document.querySelector(
          `textarea[name="uraian_${index + 1}"]`
        );


      const jawaban =
        input
          ? input.value.trim()
          : "";


      jawabanUraian.push(
        `${index + 1}:${jawaban}`
      );

    }
  );


  /* =======================================================
     DATA SISWA
     ======================================================= */

  const nama =
    document
      .getElementById(
        "studentName"
      )
      .value
      .trim();


  const kelas =
    document
      .getElementById(
        "studentClass"
      )
      .value
      .trim();


  /* =======================================================
     DATA YANG DIKIRIM KE GOOGLE SHEET
     ======================================================= */

  const dataKirim = {

    waktu:
      new Date().toLocaleString(
        "id-ID"
      ),

    nama:
      nama,

    kelas:
      kelas,

    mapel:
      selectedSubject,

    nilaiPG:
      nilaiPG,

    benarPG:
      benarPG,

    terjawabPG:
      dijawabPG,

    terjawabIsian:
      dijawabIsian,

    terjawabUraian:
      dijawabUraian,

    jawabanPG:
      jawabanPG.join(
        " | "
      ),

    jawabanIsian:
      jawabanIsian.join(
        " | "
      ),

    jawabanUraian:
      jawabanUraian.join(
        " | "
      )

  };


  /* =======================================================
     KIRIM KE GOOGLE SHEET
     ======================================================= */

  let berhasilKirim =
    false;


  try {

    await fetch(
      GOOGLE_SHEET_URL,
      {

        method: "POST",

        mode: "no-cors",

        headers: {

          "Content-Type":
            "text/plain;charset=utf-8"

        },

        body:
          JSON.stringify(
            dataKirim
          )

      }
    );


    berhasilKirim =
      true;


    console.log(
      "Data berhasil dikirim ke Google Sheet."
    );

  }

  catch (error) {

    console.error(
      "Gagal mengirim ke Google Sheet:",
      error
    );

  }


  /* =======================================================
     TAMPILKAN HASIL
     ======================================================= */

  const result =
    document.getElementById(
      "result"
    );


  result.classList.remove(
    "hidden"
  );


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
      ${escapeHtml(
        selectedSubject
      )}
    </p>

    <hr>

    <h3>Pilihan Ganda</h3>

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
      Nilai:
      <strong>
        ${nilaiPG}
      </strong>
    </p>

    <hr>

    <h3>Isian</h3>

    <p>
      Terjawab:
      ${dijawabIsian}
      dari
      ${isian.length}
    </p>

    <hr>

    <h3>Uraian</h3>

    <p>
      Terjawab:
      ${dijawabUraian}
      dari
      ${uraian.length}
    </p>

    <hr>

    <p>
      ${
        berhasilKirim
          ? "✅ Jawaban telah dikirim ke Google Sheet."
          : "⚠️ Ujian selesai, tetapi pengiriman ke Google Sheet perlu diperiksa."
      }
    </p>

    <p>
      ${
        autoSubmit
          ? "⏰ Waktu habis dan jawaban dikumpulkan otomatis."
          : "✅ Jawaban berhasil dikumpulkan."
      }
    </p>

  `;


  /* =======================================================
     NONAKTIFKAN TOMBOL
     ======================================================= */

  document
    .getElementById(
      "submitBtn"
    )
    .disabled = true;


  /* =======================================================
     KUNCI JAWABAN
     ======================================================= */

  document
    .querySelectorAll(
      "#questions input, #questions textarea"
    )
    .forEach(
      element => {

        element.disabled =
          true;

      }
    );


  /* =======================================================
     SCROLL KE HASIL
     ======================================================= */

  result.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}


/* =========================================================
   FORMAT TEKS BACAAN
   ========================================================= */

function formatText(
  text
) {

  return escapeHtml(
    text
  )
    .replace(
      /\n\n/g,
      "<br><br>"
    )
    .replace(
      /\n/g,
      "<br>"
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  text
) {

  return String(
    text
  ).replace(
    /[&<>"']/g,
    function(char) {

      const entities = {

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

      };


      return entities[
        char
      ];

    }
  );

}
