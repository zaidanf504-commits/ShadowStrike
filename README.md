# 🕹️ OPERATION: SHADOW STRIKE

> **Tactical Top-Down Arcade Shooter** berbasis HTML5, CSS3, dan Vanilla JavaScript murni tanpa dependensi eksternal atau *build tools*.

![Status Build](https://img.shields.io/badge/build-passing-brightgreen)
![Tech](https://img.shields.io/badge/tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)
![Platform](https://img.shields.io/badge/platform-Desktop%20Browser-orange)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🚀 Gambaran Umum

**OPERATION: SHADOW STRIKE** adalah game penembak *top-down* taktis berkecepatan tinggi di mana pemain berperan sebagai operator khusus yang menyusup ke fasilitas riset militer futuristik Sektor Alpha-09. Misi Anda: bertahan hidup dari 5 gelombang pasukan musuh otonom yang agresif, mengelola amunisi secara taktis, dan mencapai skor tertinggi.

Game ini dirancang murni menggunakan **Vanilla JavaScript** dan **Canvas 2D API** dengan penekanan pada responsivitas kontrol yang presisi, perilaku AI musuh yang cerdas (*state machine*), efek visual partikel, serta sistem audio prosedural berbasis Web Audio API.

---

## ✨ Fitur Utama

- **🎮 Gameplay Responsif & Presisi**: Pergerakan 8 arah dengan normalisasi vektor diagonal, rotasi bahu/senjata yang mengikuti arah kursor secara akurat, serta *dynamic camera look-ahead*.
- **🤖 AI Musuh Cerdas (*State Machine*)**: Musuh memiliki status `IDLE`, `CHASE`, `ATTACK`, dan `REPOSITION`, lengkap dengan algoritma penghindar rintangan (*obstacle avoidance*) agar tidak tersangkut di balik dinding atau peti.
- **🔫 3 Pilihan Senjata Unik**:
  - **M4-Vortex Carbine (AR)**: Seimbang, cocok untuk pertempuran umum.
  - **K7-Spectre SMG**: *Fire rate* sangat tinggi, efektif menghadapi musuh cepat.
  - **SG-12 Breacher (Shotgun)**: Menembakkan 7 *pellet* sekaligus dengan *spread* lebar untuk jarak dekat.
- **🌊 Sistem Gelombang Berjenjang (*Wave Progression*)**: 5 gelombang pertempuran menantang dengan komposisi musuh yang semakin bervariasi (Assault, Runner, Heavy Juggernaut) serta bonus penyelesaian gelombang dan *supply drop* amunisi/HP.
- **🔊 Audio Prosedural (Web Audio API)**: Seluruh efek suara (tembakan, ledakan, reload, hit) disintesis secara *real-time* tanpa memerlukan file audio eksternal.
- **⚡ Tanpa Dependensi**: Tidak memerlukan `npm install`, *bundler* (Webpack/Vite), ataupun server backend. Cukup buka file `index.html` di browser modern.

---

## 📂 Struktur Proyek

```text
operation-shadow-strike/
├── index.html       # Struktur halaman, Canvas, HUD, dan layar menu/overlay
├── style.css        # Desain antarmuka, tata letak responsif, dan animasi UI
└── game.js          # Seluruh logika inti (Game Loop, AI, Fisika, Senjata, Audio)
