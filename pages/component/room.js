const day = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const date = new Date()
const currentDate = day[date.getDay()] + ', ' + date.getDate() + ' ' + month[date.getMonth() - 1] + ' ' + date.getFullYear()

function room(rid, rname) {
    const main = document.querySelector('section#main')
    main.setAttribute('class', 'hide')

    const container = document.querySelector('section#rooms')
    container.removeAttribute('class')
    const markup = `
        <a id='back' onclick='backToHome()'>< Kembali</a>

        <h2 id=${rid}>${rname}</h2>

        <div class="content">
            <div class="cam-container">
                <p id="date">${currentDate}</p>
                <div class="video-container">
                    <video id="cam" width="320" height="240" playsinline autoplay muted></video>
                    <canvas id="detectionCanvas" width="320" height="240"></canvas>
                </div>
                <button onclick="enterRoom()" class="btn btnGreen">Masuk</button>
            </div>

            <div class="att-container">
                <p>Daftar Kehadiran</p>
                <div>
                    <ul id="att-list"></ul>
                </div>
                <button onclick="exitRoom()" class="btn btnRed">Keluar</button>
            </div>
        </div>

        <button onclick='initCam()'>tes</button>
    `

    container.innerHTML = markup
    // container.insertAdjacentElement('beforeend', markup)
}

function backToHome() {
    const main = document.querySelector('section#main')
    const rooms = document.querySelector('section#rooms')

    main.removeAttribute('class')
    rooms.setAttribute('class', 'hide')
}