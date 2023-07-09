let result
let roomMarkup = ``

fetch(`http://127.0.0.1:3001/rooms`)
.then(res => res.json())
.then(data => {
    if (data.length === 0) {
        result =  'Data ruangan tidak tersedia.'
    }

    else {
        result = data.result
    }
})
.catch(err => {
    console.log(err)
})

function home() {
    setTimeout(() => {
        for (let i = 0; i < result.length; i++) {
            roomMarkup += `<div class="${(i + 1) % 2 == 0 ? 'btn btnWhite' : 'btn btnGreen'}">
                <a href="/pages/room.html?id=${result[i].id}&name=${result[i].name}">${result[i].name}</a>
                <a class="info">0</a>
            </div>`
        }

        const body = document.querySelector('body')
        const markup = `
            <h1>Aplikasi Face Recognition</h1>
            <p class="info">Silahkan pilih ruangan yang dituju</p>

            <div class="room-container">
            ${result.length === 0 ? result : roomMarkup}
            </div>
        `

        body.innerHTML = markup
    }, 1000)
}

home()