const MODEL_URL = '../models'
const DAY = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const MONTH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

let VIDEO = null
let CANVAS = null
let CONTEXT = null

let THRESHOLD = 0.6
let results = []
let ls = []
let ds = []

async function loadModel() {
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    console.log('Model loaded!')
}

function startCam() {
    CANVAS = document.getElementById('detectionCanvas')
    CONTEXT = CANVAS.getContext('2d')

    let promise = navigator.mediaDevices.getUserMedia({ video: true })

    promise.then(function(signal) {
        VIDEO = document.createElement('video')
        VIDEO.srcObject = signal
        VIDEO.play()

        VIDEO.onloadeddata = function() {
            updateCanvas()
        }
    }).catch(function(err) {
        alert('Camera error: ' + err)
    })
}

function updateCanvas() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)
    CONTEXT.drawImage(VIDEO, 0, 0)

    window.requestAnimationFrame(updateCanvas)
}

async function getRooms() {
    fetch(`http://127.0.0.1:3001/rooms`)
        .then(res => res.json())
        .then(data => {
            const result = data.result

            if (result.length === 0) {
                document.querySelector('div.room-container').insertAdjacentHTML('beforebegin', `Data ruangan tidak tersedia.`)
            }

            else {
                let i = 1

                result.forEach(room => {
                    const markup = `
                    <div class="${i % 2 == 0 ? 'ro btn btnWhite' : 'ro btn btnGreen'}"' onclick='displayRoom(${room.id}, "${room.name}")'>
                        <a>${room.name}</a>
                        <a class="info">0</a>
                    </div>
                    `

                    document.querySelector('div.room-container').insertAdjacentHTML('beforeend', markup)
                    
                    i++
                })
            }
        })
        .catch(err => {
            console.log(err)
            document.querySelector('div.room-container').insertAdjacentHTML('beforebegin', `Data ruangan tidak tersedia.`)
        })
}

async function getRoomAttendances() {
    const list = document.getElementById('att-list')
    const rid = localStorage.getItem('currRid')

    fetch(`http://127.0.0.1:3001/attendance/${rid}`)
        .then(res => res.json())
        .then(data => {
            const result = data.result

            if (result.length !== 0) {
                result.forEach(data => {
                    const markup = `
                        <li>${data.username}</li>
                        <li>${(data.date).slice(0, 10)} ${data.status ? "<span class='green'>>></span>" : "<span class='red'><<</span>"}</li>
                    `
                    list.insertAdjacentHTML('beforeend', markup)
                })
            }
        })
}

async function getDescriptors() {
    try {
        fetch(`http://127.0.0.1:3001/model/descriptor`)
            .then(res => res.json())
            .then(data => {
                data.result.map(res => {
                    ls.push(res.l)
                    ds.push(res.d)
                })
            })
    } catch(err) {console.log(err)}
}

function recordAttendance(uid, v_name, status) {
    const rid = localStorage.getItem('currRid')

    fetch('http://127.0.0.1:3001/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, room_id: rid, status })
    })
    .then(res => res.ok ? res.json() : console.log('Error'))
    .then(data => {
        console.log(data)
        data.message === 'Akses diizinkan.' ? verificationPopup(v_name, true) : verificationPopup(v_name, false)
        
        const ul = document.querySelector('ul')
        ul.innerHTML = ''
        getRoomAttendances()
    })
    // .then(res => res.ok ? window.location.reload() : console.log('Error'))
    .catch(err => console.log(err))
}

function euclideanDistance(face1, face2) {
    let distance = 0

    if (face1.length != face2.length) {
        console.log('Error')
        return false
    }
    
    for (let i = 0; i < face1.length; i++) {
        distance += (face1[i] - face2[i]) ** 2
    }

    distance **= 0.5
    // console.log(distance)

    return distance
}

function faceMatcher(face) {
    let results = []

    ds.map(d => {
        let temp = 0
        for (let i = 0; i < d.length; i++) {
            temp += euclideanDistance(face, d[i])
        }
        results.push(temp / d.length)
    })

    // console.log(results)
    const min = Math.min(...results)
    const index = results.indexOf(min)

    if (min > THRESHOLD) {
        let message = 'Wajah tidak dikenal.'
        return message
    }

    else {
        console.log(ls[index].l)
        console.log(ls[index].i)
        return ls[index]
    }
}

function displayRoom(rid, rname) {
    localStorage.setItem('currRid', rid)

    const date = new Date()
    const currentDate = DAY[date.getDay()] + ', ' + date.getDate() + ' ' + MONTH[date.getMonth() - 1] + ' ' + date.getFullYear()

    const h2 = document.querySelector('h2#title')
    const p = document.querySelector('p#date')
    
    h2.innerText = rname
    p.innerText = currentDate

    getRoomAttendances()
    // startCam()

    const main = document.querySelector('section#main')
    main.setAttribute('class', 'hide')

    const container = document.querySelector('section#rooms')
    container.removeAttribute('class')
}

function verificationPopup(name='Wajah tidak dikenal.', status) {
    let div = document.createElement('div')
    div.setAttribute('id', 'verificationPopup')
    div.setAttribute('class', 'verificationPopup')

    let markup = `
        <div class="verificationBox appear">
            <p>${status ? 'Verifikasi berhasil!' : 'Akses tidak diizinkan!'}</p>
            <div class=${status ? 'checklist' : 'not'}></div>
            <p>${name}</p>
        </div>
    `

    // if (status) {
    //     markup = `
    //         <div class="verificationBox appear">
    //             <p>Verifikasi berhasil!</p>
    //             <div class="checklist"></div>
    //             <p>${name}</p>
    //         </div>
    //     `
    // }

    // else {
    //     markup = `
    //         <div class="verificationBox appear">
    //             <p>Akses tidak diizinkan!</p>
    //             <div class="not"></div>
    //             <p>Wajah tidak dikenal.</p>
    //         </div>
    //     `
    // }

    div.innerHTML = markup
    document.body.appendChild(div)
    
    setTimeout(() => {
        document.getElementById('verificationPopup').remove()
    }, 2000)
}

async function enterRoom() {
    console.log('Masuk')
    
    const dataUrl = CANVAS.toDataURL('image/png')

    const image = document.createElement('img')
    image.src = dataUrl

    const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()

    if (!detection[0]) {
        console.log('Tidak ada wajah terdeteksi.')
    }

    else {        
        let result = faceMatcher(detection[0].descriptor)
        
        if (typeof(result) === 'string') {
            verificationPopup(result.l, false)
            // console.log(result)
        }

        else {
            // verificationPopup(result.l, true)
            // console.log(result)
            recordAttendance(result.i, result.l, true)
        }
    }
}

async function exitRoom() {
    console.log('Keluar')

    const dataUrl = CANVAS.toDataURL('image/png')

    const image = document.createElement('img')
    image.src = dataUrl

    const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()

    if (!detection[0]) {
        console.log('Tidak ada wajah terdeteksi.')
    }

    else {
        let result = faceMatcher(detection[0].descriptor)
        
        if (typeof(result) === 'string') {
            verificationPopup(result.l, false)
            // console.log(result)
        }

        else {
            // verificationPopup(result.l, true)
            // console.log(result)
            recordAttendance(result.i, result.l, false)
        }
    }
}

function backToHome() {
    CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height)

    const ul = document.querySelector('ul')
    ul.innerHTML = ''
    
    const main = document.querySelector('section#main')
    const rooms = document.querySelector('section#rooms')

    // localStorage.removeItem('currRid')

    main.removeAttribute('class')
    rooms.setAttribute('class', 'hide')
}

window.onload = () => {
    setTimeout(() => {
        if (localStorage.getItem('currRid')) {
            localStorage.removeItem('currRid')
        }

        const loader = document.querySelector('.loader')
        loader.setAttribute('class', 'loader loader-hidden')
        loader.addEventListener('transitionend', () => {
            loader.remove()
        })
    }, 2000)
}

async function init() {
    await loadModel()
    await getRooms()
    getDescriptors()
    startCam()
    // console.log(faceapi)
    // console.log(faceapi.nets)
}

init()