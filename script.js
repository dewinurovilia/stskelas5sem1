/* =========================================================
   SCRIPT UJIAN ONLINE KELAS V
   =========================================================
   FITUR:
   1. Password setiap mata pelajaran
   2. Timer 90 menit
   3. Bacaan fleksibel setiap mapel
   4. Pilihan ganda
   5. Pilihan ganda lebih dari satu jawaban
   6. Isian
   7. Uraian
   8. Penilaian PG otomatis
   9. Penilaian isian otomatis
   10. Nama siswa
   11. Kelas
   12. Mapel
   13. Waktu pengumpulan
   14. Pengiriman ke Google Sheet
   ========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT
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
  },
"Literasi Digital": {
    password: "literasi123",
    duration: 90,
    file: "soal/literasi-digital.js",
    globalName: "SOAL_LITERASI_DIGITAL"
  }
};


/* =========================================================
   VARIABEL GLOBAL
   ========================================================= */

let selectedSubject = null;

let currentData = null;

let timeLeft = 0;

let timerInterval = null;

let loadedScripts = {};

let examSubmitted = false;


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
   CEK ELEMENT
   ========================================================= */

if (!subjectButtons) {
  console.error(
    "Element #subjectButtons tidak ditemukan."
  );
}


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

  button.type =
    "button";

  button.onclick = () => {

    openPassword(
      subject,
      button
    );

  };

  if (subjectButtons) {

    subjectButtons.appendChild(
      button
    );

  }

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
    .querySelectorAll(".subject-btn")
    .forEach(btn => {

      btn.classList.remove(
        "active"
      );

    });


  if (button) {

    button.classList.add(
      "active"
    );

  }


  if (passwordTitle) {

    passwordTitle.textContent =
      `Password ${subject}`;

  }


  if (passwordInput) {

    passwordInput.value = "";

  }


  if (passwordError) {

    passwordError.textContent =
      "";

  }


  if (modal) {

    modal.classList.remove(
      "hidden"
    );

  }


  setTimeout(() => {

    if (passwordInput) {

      passwordInput.focus();

    }

  }, 100);

}


/* =========================================================
   TUTUP MODAL
   ========================================================= */

const closeModal =
  document.getElementById(
    "closeModal"
  );


if (closeModal) {

  closeModal.onclick = () => {

    if (modal) {

      modal.classList.add(
        "hidden"
      );

    }

  };

}


/* =========================================================
   TOMBOL PASSWORD
   ========================================================= */

const passwordBtn =
  document.getElementById(
    "passwordBtn"
  );


if (passwordBtn) {

  passwordBtn.onclick =
    verifyPassword;

}


if (passwordInput) {

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

}


/* =========================================================
   VERIFIKASI PASSWORD
   ========================================================= */

async function verifyPassword() {

  if (!selectedSubject) {

    return;

  }


  const config =
    SUBJECTS[
      selectedSubject
    ];


  if (
    !passwordInput ||
    passwordInput.value !==
    config.password
  ) {

    if (passwordError) {

      passwordError.textContent =
        "Password salah. Silakan coba lagi.";

    }


    if (passwordInput) {

      passwordInput.select();

    }


    return;

  }


  if (passwordError) {

    passwordError.textContent =
      "";

  }


  if (modal) {

    modal.classList.add(
      "hidden"
    );

  }


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


  if (!config) {

    throw new Error(
      `Konfigurasi mapel "${subject}" tidak ditemukan.`
    );

  }


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


  examSubmitted =
    false;


  /* -------------------------------------------------------
     Tampilkan kartu siswa
     ------------------------------------------------------- */

  const studentCard =
    document.getElementById(
      "studentCard"
    );


  if (studentCard) {

    studentCard.classList.remove(
      "hidden"
    );

  }


  /* -------------------------------------------------------
     Tampilkan kartu ujian
     ------------------------------------------------------- */

  const examCard =
    document.getElementById(
      "examCard"
    );


  if (examCard) {

    examCard.classList.remove(
      "hidden"
    );

  }


  /* -------------------------------------------------------
     Judul
     ------------------------------------------------------- */

  const examTitle =
    document.getElementById(
      "examTitle"
    );


  if (examTitle) {

    examTitle.textContent =
      currentData.nama ||
      subject;

  }


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

  const examInfo =
    document.getElementById(
      "examInfo"
    );


  if (examInfo) {

    examInfo.textContent =
      `${jumlahPG} Pilihan Ganda • ` +
      `${jumlahIsian} Isian • ` +
      `${jumlahUraian} Uraian • ` +
      `Waktu ${config.duration} menit`;

  }


  /* -------------------------------------------------------
     Reset hasil
     ------------------------------------------------------- */

  const result =
    document.getElementById(
      "result"
    );


  if (result) {

    result.classList.add(
      "hidden"
    );

    result.innerHTML =
      "";

  }


  /* -------------------------------------------------------
     Aktifkan tombol
     ------------------------------------------------------- */

  const submitBtn =
    document.getElementById(
      "submitBtn"
    );


  if (submitBtn) {

    submitBtn.disabled =
      false;

  }


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

  if (examCard) {

    window.scrollTo({

      top:
        examCard.offsetTop - 20,

      behavior:
        "smooth"

    });

  }

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


  if (!box) {

    return;

  }


  box.innerHTML =
    "";


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
   MENDAPATKAN BACAAN BERDASARKAN NOMOR SOAL
   =========================================================

   Contoh:

   bacaan: {
      soal1_4: "...",
      soal8_9: "...",
      soal11_14: "..."
   }

   Maka otomatis:
   - soal 1 → bacaan soal1_4
   - soal 4 → bacaan soal1_4
   - soal 8 → bacaan soal8_9
   - soal 9 → bacaan soal8_9
   - soal 11 → bacaan soal11_14
   - soal 14 → bacaan soal11_14

   Jadi setiap mapel bebas menentukan posisi bacaan.
   ========================================================= */

function getBacaanUntukNomor(
  nomorSoal,
  tipe = "soal"
) {

  if (
    !currentData ||
    !currentData.bacaan
  ) {

    return [];

  }


  const hasil = [];


  Object.entries(
    currentData.bacaan
  ).forEach(
    ([key, isi]) => {

      const pola =
        new RegExp(
          `^${tipe}(\\d+)_(\\d+)$`
        );


      const match =
        key.match(
          pola
        );


      if (!match) {

        return;

      }


      const mulai =
        parseInt(
          match[1],
          10
        );


      const selesai =
        parseInt(
          match[2],
          10
        );


      if (
        nomorSoal >= mulai &&
        nomorSoal <= selesai
      ) {

        hasil.push({

          key:
            key,

          mulai:
            mulai,

          selesai:
            selesai,

          isi:
            isi

        });

      }

    }
  );


  return hasil;

}


/* =========================================================
   MEMBUAT JUDUL BACAAN OTOMATIS
   ========================================================= */

function judulBacaan(
  mulai,
  selesai
) {

  if (
    mulai === selesai
  ) {

    return `Bacaan untuk soal nomor ${mulai}`;

  }


  return `Bacaan untuk soal nomor ${mulai}–${selesai}`;

}

/* =========================================================
   RENDER GAMBAR SOAL
   ========================================================= */

function renderGambarSoal(gambar, alt = "Gambar soal") {

  if (!gambar) {
    return "";
  }

  const daftarGambar =
    Array.isArray(gambar)
      ? gambar
      : [gambar];

  return daftarGambar
    .filter(Boolean)
    .map(src => `

      <div class="question-image-wrap">

        <img
          src="${escapeHtml(String(src))}"
          alt="${escapeHtml(alt)}"
          class="question-image"
          loading="lazy"
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='block';
          "
        >

        <div
          class="image-error-text"
          style="
            display:none;
            color:#c00;
            font-size:13px;
            margin:8px;
          "
        >
          Gambar tidak dapat dimuat:
          ${escapeHtml(String(src))}
        </div>

      </div>

    `)
    .join("");
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

      const nomor =
        item.no ||
        index + 1;


      /* ---------------------------------------------------
         BACAAN SESUAI NOMOR SOAL
         --------------------------------------------------- */

      const bacaanList =
        getBacaanUntukNomor(
          nomor,
          "soal"
        );


      /*
       * Bacaan hanya ditampilkan sekali,
       * yaitu ketika nomor soal sama dengan
       * nomor awal bacaan.
       */

      bacaanList.forEach(
        bacaan => {

          if (
            nomor ===
            bacaan.mulai
          ) {

            addBacaan(
              box,
              judulBacaan(
                bacaan.mulai,
                bacaan.selesai
              ),
              bacaan.isi
            );

          }

        }
      );


      /* ---------------------------------------------------
         KARTU SOAL
         --------------------------------------------------- */

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question";


let html = `

  <div class="question-title">

    ${nomor}.
    ${escapeHtml(
      item.soal || ""
    )}

  </div>

  ${renderGambarSoal(
    item.gambar,
    `Gambar untuk soal nomor ${nomor}`
  )}

`;


      /* ---------------------------------------------------
         CEK TIPE SOAL
         ---------------------------------------------------

         Jika:
         tipe: "multiple"

         atau:
         kunci: ["a","c"]

         maka menggunakan CHECKBOX.

         Selain itu menggunakan RADIO.
         --------------------------------------------------- */

      const isMultiple =
        item.tipe ===
        "multiple" ||
        Array.isArray(
          item.kunci
        );


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

            const huruf =
              String.fromCharCode(
                97 +
                optionIndex
              );


            const inputType =
              isMultiple
                ? "checkbox"
                : "radio";


            html += `

              <label class="option">

                <input
                  type="${inputType}"
                  name="pg_${nomor}"
                  value="${huruf}"
                >

                <span>
                  ${huruf.toUpperCase()}.
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

  if (
    !isi
  ) {

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

      const nomor =
        typeof soal === "object"
          ? (
              soal.no ||
              index + 1
            )
          : index + 1;


      const teks =
        typeof soal === "object"
          ? soal.soal
          : soal;


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question isian";


      card.innerHTML = `

        <div class="question-title">

          ${nomor}.
          ${escapeHtml(
            teks || ""
          )}

        </div>


        <input
          type="text"
          class="answer-input"
          name="isian_${nomor}"
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

      const nomor =
        typeof soal === "object"
          ? (
              soal.no ||
              index + 1
            )
          : index + 1;


      const teks =
        typeof soal === "object"
          ? soal.soal
          : soal;


      /* ---------------------------------------------------
         BACaan khusus uraian
         Contoh:

         uraian1_2: `...`

         akan muncul sebelum uraian nomor 1.
         --------------------------------------------------- */

      const bacaanList =
        getBacaanUntukNomor(
          nomor,
          "uraian"
        );


      bacaanList.forEach(
        bacaan => {

          if (
            nomor ===
            bacaan.mulai
          ) {

            addBacaan(
              box,
              judulBacaan(
                bacaan.mulai,
                bacaan.selesai
              ),
              bacaan.isi
            );

          }

        }
      );


      const card =
        document.createElement(
          "div"
        );


      card.className =
        "question uraian";


      card.innerHTML = `

        <div class="question-title">

          ${nomor}.
          ${escapeHtml(
            teks || ""
          )}

        </div>


        <textarea
          class="essay-input"
          name="uraian_${nomor}"
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

const submitBtn =
  document.getElementById(
    "submitBtn"
  );


if (submitBtn) {

  submitBtn.onclick = () => {

    const nama =
      getStudentName();


    if (!nama) {

      alert(
        "Silakan isi nama siswa terlebih dahulu."
      );


      const input =
        getStudentNameElement();


      if (input) {

        input.focus();

      }


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

}


/* =========================================================
   SUBMIT UJIAN
   ========================================================= */

async function submitExam(
  autoSubmit = false
) {

  if (
    examSubmitted
  ) {

    return;

  }


  if (!currentData) {

    alert(
      "Data soal belum tersedia."
    );


    return;

  }


  /* =======================================================
     DATA SOAL
     ======================================================= */

  const pg =
    Array.isArray(
      currentData.pilihanGanda
    )
      ? currentData.pilihanGanda
      : [];


  const isian =
    Array.isArray(
      currentData.isian
    )
      ? currentData.isian
      : [];


  const uraian =
    Array.isArray(
      currentData.uraian
    )
      ? currentData.uraian
      : [];


  /* =======================================================
     PILIHAN GANDA
     ======================================================= */

  let benarPG =
    0;


  let terjawabPG =
    0;


  const jawabanPG =
    [];


  pg.forEach(
    (q, index) => {

      const nomor =
        q.no ||
        index + 1;


      const isMultiple =
        q.tipe ===
          "multiple" ||
        Array.isArray(
          q.kunci
        );


      /* ---------------------------------------------------
         MULTIPLE ANSWER
         --------------------------------------------------- */

      if (
        isMultiple
      ) {

        const checked =
          document.querySelectorAll(
            `input[name="pg_${nomor}"]:checked`
          );


        const jawabanSiswa =
          Array.from(
            checked
          )
            .map(
              input =>
                String(
                  input.value
                )
                  .trim()
                  .toLowerCase()
            )
            .sort();


        if (
          jawabanSiswa.length >
          0
        ) {

          terjawabPG++;

        }


        const kunci =
          getKunciPG(
            q,
            nomor
          );


        const kunciArray =
          Array.isArray(
            kunci
          )
            ? kunci
                .map(
                  x =>
                    String(x)
                      .trim()
                      .toLowerCase()
                )
                .sort()
            : String(kunci || "")
                .split(",")
                .map(
                  x =>
                    x
                      .trim()
                      .toLowerCase()
                )
                .filter(Boolean)
                .sort();


        if (
          JSON.stringify(
            jawabanSiswa
          ) ===
          JSON.stringify(
            kunciArray
          )
        ) {

          benarPG++;

        }


        jawabanPG.push(

          `${nomor}:` +
          (
            jawabanSiswa.length
              ? jawabanSiswa
                  .map(
                    x =>
                      x.toUpperCase()
                  )
                  .join(",")
              : "-"
          )

        );


        return;

      }


      /* ---------------------------------------------------
         SINGLE ANSWER
         --------------------------------------------------- */

      const selected =
        document.querySelector(
          `input[name="pg_${nomor}"]:checked`
        );


      const jawabanSiswa =
        selected
          ? String(
              selected.value
            )
              .trim()
              .toLowerCase()
          : "";


      const kunci =
        getKunciPG(
          q,
          nomor
        );


      const kunciNormal =
        Array.isArray(kunci)
          ? kunci[0]
          : kunci;


      const kunciJawaban =
        String(
          kunciNormal || ""
        )
          .trim()
          .toLowerCase();


      if (
        jawabanSiswa !== ""
      ) {

        terjawabPG++;

      }


      if (
        jawabanSiswa !== "" &&
        jawabanSiswa ===
          kunciJawaban
      ) {

        benarPG++;

      }


      jawabanPG.push(

        `${nomor}:` +
        (
          jawabanSiswa
            ? jawabanSiswa.toUpperCase()
            : "-"
        )

      );

    }
  );


  /* =======================================================
     NILAI PG
     ======================================================= */

  const nilaiPG =
    pg.length > 0
      ? Math.round(
          (
            benarPG /
            pg.length
          ) *
          100
        )
      : 0;


  /* =======================================================
     ISIAN
     ======================================================= */

  let benarIsian =
    0;


  let terjawabIsian =
    0;


  const jawabanIsian =
    [];


  isian.forEach(
    (q, index) => {

      const nomor =
        typeof q === "object"
          ? (
              q.no ||
              index + 1
            )
          : index + 1;


      const input =
        document.querySelector(
          `input[name="isian_${nomor}"]`
        );


      const jawabanSiswa =
        normalisasiJawaban(
          input
            ? input.value
            : ""
        );


      const kunciAsli =
        getKunciIsian(
          q,
          nomor
        );


      const kunci =
        normalisasiJawaban(
          kunciAsli
        );


      if (
        jawabanSiswa !== ""
      ) {

        terjawabIsian++;

      }


      if (
        jawabanSiswa !== "" &&
        jawabanSiswa === kunci
      ) {

        benarIsian++;

      }


      jawabanIsian.push(

        `${nomor}:` +
        (
          jawabanSiswa ||
          "-"
        )

      );

    }
  );


  /* =======================================================
     NILAI ISIAN
     ======================================================= */

  const nilaiIsian =
    isian.length > 0
      ? Math.round(
          (
            benarIsian /
            isian.length
          ) *
          100
        )
      : 0;


  /* =======================================================
     URAIAN
     ======================================================= */

  let terjawabUraian =
    0;


  const jawabanUraian =
    [];


  uraian.forEach(
    (q, index) => {

      const nomor =
        typeof q === "object"
          ? (
              q.no ||
              index + 1
            )
          : index + 1;


      const textarea =
        document.querySelector(
          `textarea[name="uraian_${nomor}"]`
        );


      const jawaban =
        textarea
          ? textarea.value.trim()
          : "";


      if (
        jawaban !== ""
      ) {

        terjawabUraian++;

      }


      jawabanUraian.push(

        `${nomor}:` +
        (
          jawaban ||
          "-"
        )

      );

    }
  );


  /* =======================================================
     DATA SISWA
     ======================================================= */

  const nama =
    getStudentName();


  const kelas =
    getStudentClass();


  /* =======================================================
     DATA UNTUK GOOGLE SHEET
     ======================================================= */

  const dataKirim = {

    waktu:
      new Date()
        .toLocaleString(
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
      terjawabPG,

    nilaiIsian:
      nilaiIsian,

    benarIsian:
      benarIsian,

    terjawabIsian:
      terjawabIsian,

    terjawabUraian:
      terjawabUraian,

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

        method:
          "POST",

        mode:
          "no-cors",

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
      "Permintaan pengiriman data telah dikirim."
    );

  }

  catch (error) {

    console.error(
      "Gagal mengirim ke Google Sheet:",
      error
    );

  }


  /* =======================================================
     TANDAI SUDAH SUBMIT
     ======================================================= */

  examSubmitted =
    true;


  clearInterval(
    timerInterval
  );


  /* =======================================================
     TAMPILKAN HASIL
     ======================================================= */

  const result =
    document.getElementById(
      "result"
    );


  if (result) {

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


      <h3>
        Pilihan Ganda
      </h3>


      <p>
        Terjawab:
        ${terjawabPG}
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
        <strong>
          ${nilaiPG}
        </strong>
      </p>


      <hr>


      <h3>
        Isian
      </h3>


      <p>
        Terjawab:
        ${terjawabIsian}
        dari
        ${isian.length}
      </p>


      <p>
        Benar:
        ${benarIsian}
        dari
        ${isian.length}
      </p>


      <p>
        Nilai Isian:
        <strong>
          ${nilaiIsian}
        </strong>
      </p>


      <hr>


      <h3>
        Uraian
      </h3>


      <p>
        Terjawab:
        ${terjawabUraian}
        dari
        ${uraian.length}
      </p>


      <hr>


      <p>

        ${
          berhasilKirim

            ? "✅ Jawaban telah dikirim ke rekap."

            : "⚠️ Ujian selesai, tetapi pengiriman perlu diperiksa."
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

  }


  /* =======================================================
     NONAKTIFKAN SOAL
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
     NONAKTIFKAN TOMBOL SUBMIT
     ======================================================= */

  if (submitBtn) {

    submitBtn.disabled =
      true;

  }


  /* =======================================================
     SCROLL HASIL
     ======================================================= */

  if (result) {

    result.scrollIntoView({

      behavior:
        "smooth",

      block:
        "center"

    });

  }

}


/* =========================================================
   MENGAMBIL KUNCI PG
   ========================================================= */

function getKunciPG(
  soal,
  nomor
) {

  /* -------------------------------------------------------
     Prioritas 1:
     kunci langsung pada soal
     ------------------------------------------------------- */

  if (
    soal &&
    soal.kunci !== undefined
  ) {

    return soal.kunci;

  }


  /* -------------------------------------------------------
     Prioritas 2:
     kunciJawaban.pilihanGanda
     ------------------------------------------------------- */

  if (
    currentData &&
    currentData.kunciJawaban &&
    currentData.kunciJawaban.pilihanGanda
  ) {

    return
      currentData
        .kunciJawaban
        .pilihanGanda[nomor];

  }


  return "";

}


/* =========================================================
   MENGAMBIL KUNCI ISIAN
   ========================================================= */

function getKunciIsian(
  soal,
  nomor
) {

  /* -------------------------------------------------------
     Jika soal berupa object dan punya kunci
     ------------------------------------------------------- */

  if (
    soal &&
    typeof soal === "object" &&
    soal.kunci !== undefined
  ) {

    return soal.kunci;

  }


  /* -------------------------------------------------------
     Ambil dari kunciJawaban.isian
     ------------------------------------------------------- */

  if (
    currentData &&
    currentData.kunciJawaban &&
    currentData.kunciJawaban.isian
  ) {

    return
      currentData
        .kunciJawaban
        .isian[nomor];

  }


  return "";

}


/* =========================================================
   NORMALISASI JAWABAN
   ========================================================= */

function normalisasiJawaban(
  teks
) {

  return String(
    teks || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /\s+/g,
      " "
    );

}


/* =========================================================
   NAMA SISWA
   ========================================================= */

function getStudentNameElement() {

  return (
    document.getElementById(
      "studentName"
    ) ||
    document.getElementById(
      "namaSiswa"
    )
  );

}


function getStudentName() {

  const element =
    getStudentNameElement();


  return element
    ? element.value.trim()
    : "";

}


/* =========================================================
   KELAS SISWA
   ========================================================= */

function getStudentClassElement() {

  return (
    document.getElementById(
      "studentClass"
    ) ||
    document.getElementById(
      "kelasSiswa"
    )
  );

}


function getStudentClass() {

  const element =
    getStudentClassElement();


  return element
    ? element.value.trim()
    : "";

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
    text || ""
  ).replace(
    /[&<>"']/g,
    function(char) {

      const entities = {

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      };


      return entities[
        char
      ];

    }
  );

}
