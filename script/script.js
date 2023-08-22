const MODEL_URL = '../models'
const DAY = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu']
const MONTH = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

let VIDEO = null
let CANVAS = null
let CONTEXT = null
const v_width = 320
const v_height = 240

let THRESHOLD = 0.5
let results = []
let ls = []
let ds = []

async function loadModel() {
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    console.log('Model loaded!')
}

async function firstInference() {
    const firstImg = document.getElementById('firstImg')
    const secondImg = document.getElementById('secondImg')
    const imgs = [firstImg, secondImg]
    const dataUrl = []

    for (let i = 0; i < imgs.length; i++) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = imgs[i].width
        tempCanvas.height = imgs[i].height
        const tempCtx = tempCanvas.getContext('2d')

        tempCtx.drawImage(imgs[i], 0, 0)
        const url = tempCanvas.toDataURL()
        dataUrl.push(url)
    }

    for (let i = 0; i < dataUrl.length; i++) {
        const image = document.createElement('img')
        image.src = dataUrl[i]
        await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    }

    console.log('First inference done.')

    firstImg.remove()
    secondImg.remove()
}

function startCam() {
    CANVAS = document.getElementById('detectionCanvas')
    CONTEXT = CANVAS.getContext('2d')

    // let promise = navigator.mediaDevices.getUserMedia({ video: true })
    let promise = navigator.mediaDevices.getUserMedia({ video: { width: v_width, height: v_height } })

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

function getTemp() {
    fetch(`http://127.0.0.1:3001/temp`)
        .then(res => res.json())   
        .then(data => {
            const a = document.querySelectorAll('a.info')

            for (let i = 0; i < a.length; i++) {
                a[i].innerText = data.result[i].count
            }
        })
        .catch(err => console.log(err))
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

    fetch(`http://127.0.0.1:3001/attendance?rid=${rid}&date=0`)
        .then(res => res.json())
        .then(data => {
            const result = data.result
            console.log(result)

            if (result.length !== 0) {
                result.forEach(data => {
                    const date = `${data.createdAt.slice(8, 10)}/${data.createdAt.slice(5, 7)}/${data.createdAt.slice(2, 4)}`
                    const markup = `
                        <li>${data.user_name.name}</li>
                        <li>${date} ${data.status ? "<span class='green'>>></span>" : "<span class='red'><<</span>"}</li>
                    `
                    list.insertAdjacentHTML('beforeend', markup)
                })
            }
        })
}

function getDescriptors() {
    ls.length = 0
    ds.length = 0

    try {
        fetch(`http://127.0.0.1:3001/users/descriptor`)
            .then(res => res.json())
            .then(data => {
                // console.log(data.result)
                data.result.map(res => {
                    ls.push(res.descriptor.l)
                    ds.push(res.descriptor.d)
                })

                // console.log(ls)
                // console.log(ds)
            })
    } catch(err) {console.log(err)}

    console.log('Descriptor Ready.')
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

    return distance
}

function manhattanDistance(face1, face2) {
    let distance = 0

    if (face1.length != face2.length) {
        console.log('Error')
        return false
    }

    for (let i = 0; i < face1.length; i++) {
        distance += Math.abs(face1[i] - face2[i])
    }

    return distance/10
}

function faceMatcher(face) {
    let results = []

    ds.map(d => {
        let temp = 0
        for (let i = 0; i < d.length; i++) {
            temp += manhattanDistance(face, d[i])
            // temp += euclideanDistance(face, d[i])
        }
        results.push(temp / d.length)
    })

    const min = Math.min(...results)
    const index = results.indexOf(min)
    console.log('Distance: ', min)

    if (min > THRESHOLD) {
        let message = 'Wajah tidak dikenal.'
        return message
    }

    else {
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

function verificationPopup(name='Wajah tidak dikenal', status) {
    let div = document.createElement('div')
    div.setAttribute('id', 'verificationPopup')
    div.setAttribute('class', 'verificationPopup')

    // let markup = `
    //     <div class="verificationBox appear">
    //         <p>${info[0]}</p>
    //         <div class=${info[2] ? 'checklist' : 'not'}></div>
    //         <p>${info[1]}</p>
    //     </div>
    // `

    let markup = `
        <div class="verificationBox appear">
            <p>${status ? 'Verifikasi berhasil!' : 'Akses tidak diizinkan!'}</p>
            <div class=${status ? 'checklist' : 'not'}></div>
            <p>${name}</p>
        </div>
    `

    div.innerHTML = markup
    document.body.appendChild(div)
    
    setTimeout(() => {
        document.getElementById('verificationPopup').remove()
    }, 2000)
}

function warningPopup(name, status) {
    let div = document.createElement('div')
    div.setAttribute('id', 'verificationPopup')
    div.setAttribute('class', 'verificationPopup')

    let message
    
    if (status === 'this') {
        message = 'User telah berada di ruangan ini.'
    }

    else {
        message = status ? 'User berada di ruangan lain.' : 'User tidak memasuki ruangan ini.'
    }

    let markup = `
        <div class="verificationBox appear">
            <p>Peringatan!</p>
            <p>${message}</p>
            <div class='not'></div>
            <p>${name}</p>
        </div>
    `

    div.innerHTML = markup
    document.body.appendChild(div)
    
    setTimeout(() => {
        document.getElementById('verificationPopup').remove()
    }, 2000)
}

async function accessRoom(type) {
    console.log(`Akses ${type}`)

    const dataUrl = CANVAS.toDataURL('image/png')
    const image = document.createElement('img')
    image.src = dataUrl

    const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()

    if (!detection[0]) {
        console.log('Tidak ada wajah terdeteksi')
    }

    else {
        fetch(`http://localhost:3001/users/descriptor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, descriptor: detection[0].descriptor, testDescriptor: detection })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
    }
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
        // await getDescriptors()
        console.log(ls, ds)

        if (ls.length === 0 && ds.length === 0) {
            verificationPopup('Wajah tidak dikenal.', false)
        }

        else {
            let result = faceMatcher(detection[0].descriptor)
            console.log(result)
            
            if (typeof(result) === 'string') {
                verificationPopup(result.l, false)
            }
    
            else {
                fetch(`http://127.0.0.1:3001/temp/${result.i}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.result.status === true) {
                            if (data.result.rid != window.localStorage.getItem('currRid')) {
                                warningPopup(result.l, true)
                            }
    
                            else {
                                warningPopup(result.l, 'this')
                            }
                            console.log('WARNING! This user already in another room!')
                        }
    
                        else {
                            console.log('Ok, you can enter.')
                            // verificationPopup(result.l, true)
                            recordAttendance(result.i, result.l, true)
                        }
                    })
            }
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
        }

        else {
            fetch(`http://127.0.0.1:3001/temp/${result.i}`)
                .then(res => res.json())
                .then(data => {
                    if (data.result.status === false) {
                        // if (data.result.rid !== window.localStorage.getItem('currRid')) {
                            warningPopup(result.l, false)
                        // }
                        console.log('WARNING! This user did not enter this a room!')
                    }

                    else {
                        if (data.result.rid != window.localStorage.getItem('currRid')) {
                            warningPopup(result.l, false)
                        }

                        else {
                            console.log('Ok, you can leave.')
                            // verificationPopup(result.l, true)
                            recordAttendance(result.i, result.l, false)
                        }
                    }
                })

            // verificationPopup(result.l, true)
            // recordAttendance(result.i, result.l, false)
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
    getTemp()

    main.removeAttribute('class')
    rooms.setAttribute('class', 'hide')
}

async function init() {
    console.time('Initialization')
    await loadModel()
    await firstInference()
    getRooms()
    getTemp()
    getDescriptors()
    startCam()

    if (localStorage.getItem('currRid')) {
        localStorage.removeItem('currRid')
    }

    const loader = document.querySelector('.loader')
    loader.setAttribute('class', 'loader loader-hidden')
    loader.addEventListener('transitionend', () => {
        loader.remove()
        console.log('Loader disappear')
    })

    console.timeEnd('Initialization')
    // console.log(faceapi)
    // console.log(faceapi.nets)
}

init()
//34632ms
//32877ms
//34223ms