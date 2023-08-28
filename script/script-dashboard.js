let label, uid
let count = 0
let imgElement = []
let faceDescriptors

const video = document.getElementById('cam')
const v_width = video.width
const v_height = video.height
const btnStart = document.getElementById('btnStart')
const btnTakePict = document.getElementById('btnTakePict')
const btnProcessImg = document.getElementById('btnProcessImg')
const imgContainer = document.getElementById('img-container')

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')
canvas.width = v_width
canvas.height = v_height

const model_url = './../../models'

function setCurrentLabel() {
    try {
        var url_string = (window.location.href)
        var url = new URL(url_string)
        
        label = url.searchParams.get('u')
        uid = url.searchParams.get('i')

        document.querySelector('span').innerText = label
    } catch(err) {
        console.log(err)
    }
}

async function startCam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {width: v_width, height: v_height}
        })
        handleSuccess(stream)
        
        btnStart.setAttribute('class', 'hide')
        btnTakePict.setAttribute('class', 'btn btnGreen')
    } catch(err) { console.log(err) }
}

function handleSuccess(stream) {
    window.stream = stream
    video.srcObject = stream
}

function takePicture() {
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')

    const image = document.createElement('img')
    image.src = dataUrl
    image.setAttribute('onclick', 'remove(event)')
    
    imgElement.push(image)
    imgContainer.insertAdjacentElement('beforeend', image)

    ctx.clearRect(0, 0, v_width, v_height)
    
    count++

    if (count === 1) {
        btnProcessImg.setAttribute('class', 'btn btnGreen')
    }
}

function remove(e) {
    e.target.remove()
    count--

    if (count < 1) {
        btnProcessImg.setAttribute('class', 'btnDisable')
    }
}

async function counter() {
    console.log('Counter')
    const num = document.querySelector('.num')
    let counter = 0

    setInterval(() => {
        if (counter == 100) {
            clearInterval()
        }

        else {
            counter += 5
            num.textContent = `${counter}%`
        }
    }, 10)
}

async function processImg() {
    console.time('Time')
    document.querySelector('div.prev-container').insertAdjacentHTML('afterbegin', '<div class="mini-loader"><p class="num">0%</p></div>')

    const num = document.querySelector('.num')
    let counter = 0

    setInterval(() => {
        if (counter == 100) {
            const loader = document.querySelector('.mini-loader')
            loader.setAttribute('class', 'mini-loader mini-loader-hidden')
            loader.addEventListener('transitionend', () => {
                loader.remove()
            })
            btnProcessImg.setAttribute('class', 'btn btnGreen')

            clearInterval()
        }

        else {
            counter += 5
            num.textContent = `${counter}%`
        }
    }, 30)

    btnProcessImg.setAttribute('class', 'btnDisable')

    if (!faceapi.nets.ssdMobilenetv1._params) {
        await faceapi.nets.faceRecognitionNet.loadFromUri(model_url)
        await faceapi.nets.faceLandmark68Net.loadFromUri(model_url)
        await faceapi.nets.ssdMobilenetv1.loadFromUri(model_url)
        console.log('Model loaded!')
    }
    
    faceDescriptors = await loadLabeledImages()
    console.log(faceDescriptors)

    console.timeEnd('Time')

    fetch(`http://127.0.0.1:3001/users/descriptor?uid=${uid}&action=add`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descriptor: faceDescriptors })
    })
    .then(res => {
        if (res.ok) {
            popMessage('success', 'Descriptor berhasil ditambahkan.')

            setTimeout(() => {
                window.location.href('/pages/dashboard/users.html')
            }, 3500)
        }
    })
    // // .then(res => res.ok ? window.location.href('/pages/dashboard/users.html') : console.log('Error'))
    .catch(err => console.log(err))
}

async function loadLabeledImages() {
    const descriptors = []

    for (let i = 0; i < imgElement.length; i++) {
        const img = await faceapi.fetchImage(imgElement[i].src)
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptors.push(detection.descriptor)
    }

    return new faceapi.LabeledFaceDescriptors(label, descriptors)
}

function addNavbar() {
    const nav = document.createElement('nav')
    const uname = localStorage.getItem('n')
    nav.innerHTML = `
        <a>ADMIN (${uname})</a>
        <a href="/pages/dashboard">BERANDA</a>
        <a href="/pages/dashboard/users.html">DATA USER</a>
        <a href="/pages/dashboard/rooms.html">DATA RUANGAN</a>
        <a href="/pages/dashboard/report.html">LAPORAN AKSES</a>
        <a href="/pages/login.html" onclick='logout()'>LOGOUT</a>
    `
    document.body.insertAdjacentElement('afterbegin', nav)
}

function popup(row_id) {
    const element = document.getElementById(row_id).querySelector('div')
    element.classList[0] == 'hide' ? element.setAttribute('class', 'show') : element.setAttribute('class', 'hide')
}

function getUsers(endpoint='users') {
    fetch(`http://127.0.0.1:3001/${endpoint}`)
        .then(res => res.json())
        .then(data => {
            const result = data.result
            
            if (result.length === 0) {
                const markup = `
                    <tr>
                        <td class="notFound" colspan="5">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
            }

            else {
                let i = 1

                result.forEach(user => {
                    const markup = `
                        <tr id="${i}">
                            <td>${i}</td>
                            <td>${user.name}</td>
                            <td>${user.descriptor_count === 3 ? `Lengkap (${user.descriptor_count}/3)` : `Belum Lengkap (${user.descriptor_count}/3)`}</td>
                            <td>${(user.updatedAt).slice(0, 10)}</td>
                            <td>
                                <img onclick="popup(${i})" src="./../../assets/icon-settings.svg" />
                                <div class='hide'>
                                    <p class='i-edit' onclick="editUser(${i}, ${user.id}, '${user.name}')">Edit<p>
                                    <a class='i-add' href='/pages/dashboard/input-training-data.html?u=${user.name}&i=${user.id}'><p>Input Descriptor</p></a>
                                    <p class='i-del' onclick="deleteUser(event, ${user.id})">Hapus</p>
                                </div>
                            </td>
                        </tr>
                        `
                        document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
                        i++
                })
            }
        })
        .catch(err => {
            console.log(err)
            const markup = `
                    <tr>
                        <td class="notFound" colspan="5">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
        })
}

function findData(e, category) {
    const value = document.getElementById('search-input').value

    if (!value) {
        e.preventDefault()
    }

    else {
        document.querySelector('tbody').remove()
        document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

        switch (category) {
            case 'user': getUsers(`users?name=${value}`)
                break;
            case 'room': getRooms(`rooms?name=${value}`)
                break;
            default:
                break;
        }
    }
}

function popMessage(type, message) {
    const markup = `
    <div class="popMsg ${type}">
        <img src="./../../assets/icon-alert.svg" alt="( ! )" />
        <p class="message">${message}</p>
    </div>
    `
    
    document.body.insertAdjacentHTML('afterbegin', markup)
    
    setTimeout(() => {
        document.querySelector('div.popMsg').remove()
    }, 3500)

}

function addUser(e) {
    const name = document.querySelector('input').value
    
    if (!name) {
        popMessage('alert', 'Silahkan input nama user baru!')
    }

    else {
        e.preventDefault()
        fetch('http://127.0.0.1:3001/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(res => {
            if (res.ok) {
                document.querySelector('tbody').remove()
                document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                popMessage('success', 'User baru berhasil ditambahkan.')
                document.querySelector('input').value = ''
                getUsers()
                
            }

            else {
                console.log('Error')
            }
        })
        .catch(err => console.log(err))                
    }
}

function editUser(row_id, uid, uname) {
    const tr = document.querySelectorAll('tr')
    
    for (let i = 1; i < tr.length; i++) {
        if (i !== row_id) {
            tr[i].setAttribute('class', 'noEdit')
        }
    }
    
    const element = document.getElementById(row_id)

    element.innerHTML = `
        <tr>
            <td>${row_id}</td>
            <td><input name="nameInput" type="text" value='${uname}' class="tableInput"/></td>
            <td><button class="btn btnGreen tableInput" onclick="updateUser(${uid})">Simpan</button</td>
            <td><button class="btn btnRed tableInput" onclick="window.location.reload()">Batal</button</td>
            <td></td>
        </tr>
    `
}

function updateUser(uid) {
    const name = document.getElementsByName('nameInput')[0].value

    fetch(`http://127.0.0.1:3001/users?uid=${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(res => {
        if (res.ok) {
            document.querySelector('tbody').remove()
            document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

            popMessage('success', 'Data user berhasil diperbarui.')
            getUsers()
        }

        else {
            console.log('Error')
        }
    })
    .catch(err => console.log(err))
}

function deleteUser(e, uid) {
    e.preventDefault()

     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/users?uid=${uid}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    document.querySelector('tbody').remove()
                    document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                    popMessage('success', 'Data user berhasil dihapus.')
                    getUsers()
                }

                else {
                    console.log('Error')
                }
            })
            .catch(err => console.log(err))
     }
}

function getRooms(endpoint='rooms') {
    fetch(`http://127.0.0.1:3001/${endpoint}`)
        .then(res => res.json())
        .then(data => {
            const result = data.result

            if (result.length === 0) {
                const markup = `
                    <tr>
                        <td class="notFound" colspan="4">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
            }

            else {
                let i = 1

                result.forEach(room => {
                    const markup = `
                        <tr id="${i}">
                            <td>${i}</td>
                            <td>${room.name}</td>
                            <td>${(room.updatedAt).slice(0, 10)}</td>
                            <td>
                                <img onclick="popup(${i})" src="./../../assets/icon-settings.svg" />
                                <div class='hide'>
                                    <p onclick="editRoom(${i}, ${room.id}, '${room.name}')">Edit</p>
                                    <a href='/pages/dashboard/tambah-penerima-akses.html?r=${room.name}&i=${room.id}'><p>Tambah Penerima Akses</p></a>
                                    <p onclick="deleteRoom(${room.id})">Hapus</p>
                                </div>
                            </td>
                        </tr>
                    `
                    document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
                    i++
                })
            }
        })
        .catch(err => {
            console.log(err)
            const markup = `
                    <tr>
                        <td class="notFound" colspan="4">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
        })
}

function addRoom(e) {
    const name = document.querySelector('input').value

    if (!name) {
        popMessage('alert', 'Silahkan input nama ruangan baru!')
    }

    else {
        e.preventDefault()
        
        fetch('http://127.0.0.1:3001/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(res => {
            if (res.ok) {
                document.querySelector('tbody').remove()
                document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                popMessage('success', 'Data ruangan berhasil ditambahkan.')
                document.querySelector('input').value
                getRooms()
            }
        })
        .catch(err => console.log(err))                
    }
}

function editRoom(row_id, rid, rname) {
    const tr = document.querySelectorAll('tr')
    
    for (let i = 1; i < tr.length; i++) {
        if (i !== row_id) {
            tr[i].setAttribute('class', 'noEdit')
        }
    }
    
    const element = document.getElementById(row_id)

    element.innerHTML = `
        <tr>
            <td>${row_id}</td>
            <td><input name="nameInput" type="text" value='${rname}' class="tableInput"/></td>
            <td><button class="btn btnGreen tableInput" onclick="updateRoom(${rid})">Simpan</button</td>
            <td><button class="btn btnRed tableInput" onclick="window.location.reload()">Batal</button</td>
            <td></td>
        </tr>
    `
}

function updateRoom(rid) {
    const name = document.getElementsByName('nameInput')[0].value

    fetch(`http://127.0.0.1:3001/rooms/${rid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(res => {
        if (res.ok) {
            document.querySelector('tbody').remove()
            document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

            popMessage('success', 'Data ruangan berhasil diperbarui.')
            getRooms()
        }

        else {
            console.log('Error')
        }
    })
    .catch(err => console.log(err))
}

function deleteRoom(rid) {
     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/rooms/${rid}`, { method: 'DELETE' })
             .then(res => {
                if (res.ok) {
                    document.querySelector('tbody').remove()
                    document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                    popMessage('success', 'Data ruangan berhasil dihapus.')
                    getRooms()
                }

                else {
                    console.log('Error')
                }
             })
             .catch(err => console.log(err))
     }
}

function getRoomOptions() {
    try {
        fetch(`http://127.0.0.1:3001/rooms`)
            .then(res => res.json())
            .then(data => {
                const result = data.result

                if (result.length === 0) {
                    const markup = `<option></option>`
                    document.querySelector('select').insertAdjacentHTML('beforeend', markup)
                }

                else {
                    result.forEach(room => {
                        const markup = `<option id="${room.id}" value="${room.name}">${room.name}</option>`
                        document.querySelector('select').insertAdjacentHTML('beforeend', markup)
                    })
                }
            })
        
        getReport()
    } catch(err) {
        console.log(err)
    }
}

function filterReport(e) {
    e.preventDefault()
    const rid = document.querySelector('select').selectedOptions[0].id
    const date = document.getElementById('date-select').value == '' ? 0 : document.getElementById('date-select').value

    if (rid == 0 && date == 0) {
        popMessage('alert', 'Silahkan pilih ruangan dan/atau tanggal!')
    }

    else {
        document.querySelector('tbody').remove()
        document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

        getReport(rid, date)
    }
}

function getReport(rid=0, date=0) {
    fetch(`http://127.0.0.1:3001/attendance?rid=${rid}&date=${date}`)
        .then(res => res.json())
        .then(data => {
            const result = data.result

            if (result.length === 0) {
                const markup = `
                    <tr>
                        <td class="notFound" colspan="5">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
            }

            else {
                let i = 1

                result.forEach(data => {
                    const markup = `
                        <tr id="${i}">
                            <td>${i}</td>
                            <td>${(data.createdAt).slice(0, 10)}</td>
                            <td>${data.room_name.name}</td>
                            <td>${data.user_name.name}</td>
                            <td>${data.status ? 'Masuk' : 'Keluar'}</td>
                        </tr>
                        `
                        document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
                        i++
                })
            }
        })
}

function getUserOptions() {
    try {
        let url_string = (window.location.href)
        let url = new URL(url_string)
        let rname = url.searchParams.get('r')
        let rid = url.searchParams.get('i')
        
        document.querySelector('span').innerText = rname

        const btn = document.getElementById('tambah-akses')
        btn.setAttribute('onclick', `addPermission(${rid})`)

        fetch(`http://127.0.0.1:3001/permissions/ulist/${rid}`)
            .then(res => res.json())
            .then(data => {
                const result = data.result
                
                if (result.length === 0) {
                    const markup = `<option></option>`
                    document.querySelector('select').insertAdjacentHTML('beforeend', markup)
                }

                else {
                    result.forEach(user => {
                        const markup = `<option id="${user.id}"" value="${user.name}">${user.name}</option>`
                        document.querySelector('select').insertAdjacentHTML('beforeend', markup)
                    })
                }
            })
        
        getPermissions(rid)
    } catch(err) {
        console.log(err)
    }
}

function getPermissions(rid) {
    fetch(`http://127.0.0.1:3001/permissions/${rid}`)
        .then(res => res.json())
        .then(data => {
            const result = data.result
            console.log(result)

            if (result.length === 0) {
                const markup = `
                    <tr>
                        <td class="notFound" colspan="4">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
            }

            else {
                let i = 1

                result.forEach(user => {
                    const markup = `
                        <tr id="${i}">
                            <td>${i}</td>
                            <td>${user.user_name.name}</td>
                            <td>${(user.createdAt).slice(0, 10)}</td>
                            <td>
                                <img onclick="deletePermission(${user.id})" src="./../../assets/icon-trash.svg" />
                            </td>
                        </tr>
                    `
                    document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
                    i++
                })
            }
        })
        .catch(err => {
            console.log(err)
            const markup = `
                    <tr>
                        <td class="notFound" colspan="4">Data tidak ditemukan.</td>
                    </tr>
                `
                document.querySelector('tbody').insertAdjacentHTML('beforeend', markup)
        })
}

function addPermission(room_id) {
    const user_id = document.querySelector('select').selectedOptions[0].id
    
    if (user_id != 0) {
        fetch('http://127.0.0.1:3001/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, room_id })
        })
        .then(res => {
            if (res.ok) {
                popMessage('success', 'Izin akses berhasil ditambahkan.')

                document.querySelector('tbody').remove()
                document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                let options = document.querySelectorAll('option')
    
                for (let i = 1; i < options.length; i++) {
                    options[i].remove()
                }

                getUserOptions()
            }

            else {
                console.log('Error')
            }
        })
        .catch(err => console.log(err))                
    }

    else {
        popMessage('alert', 'Silahkan pilih user terlebih dahulu!')
    }
}

function deletePermission(pid) {
     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/permissions/${pid}`, { method: 'DELETE' })
             .then(res => {
                if (res.ok) {
                    popMessage('success', 'Izin akses berhasil dihapus.')

                    document.querySelector('tbody').remove()
                    document.querySelector('table').insertAdjacentHTML('beforeend', '<tbody></tbody>')

                    let options = document.querySelectorAll('option')
    
                    for (let i = 1; i < options.length; i++) {
                        options[i].remove()
                    }

                    getUserOptions()
                }

                else {
                    console.log('Error')
                }
             })
             .catch(err => console.log(err))
     }
}

function getSummary() {
    fetch('http://127.0.0.1:3001/summary')
        .then(res => res.json())
        .then(data => {
            document.querySelector('p#u').innerText = data.result.users
            document.querySelector('p#r').innerText = data.result.rooms
            document.querySelector('p#a').innerText = data.result.attendances
        })
}

function reset() {
    window.location.reload()
}

function checkBeforeLogin() {
    if (window.localStorage.getItem('t')) {
        window.location.replace('http://127.0.0.1:5500/pages/dashboard')
    }
}

function check() {
    if (!window.localStorage.getItem('t')) {
        return false
    }

    else {
        return true
    }
}

function login(e) {
    e.preventDefault()
    const user_id = document.getElementById('user_id').value
    const pass = document.getElementById('pass').value

    console.log(user_id, pass)

    if (!user_id || !pass) {
        alert('Silahkan masukkan user id dan password terlebih dahulu!')
    }

    else {
        fetch('http://127.0.0.1:3001/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, pass })
        })
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('n', data.uname)
            localStorage.setItem('t', data.token)
            window.location.replace('http://127.0.0.1:5500/pages/dashboard')
        })
        .catch(err => console.log(err))
    }
}

function logout() {
    localStorage.removeItem('t')
    window.location.replace('http://127.0.0.1:5500/pages/login.html')
}

function init(p) {
    if (!check()) {
        window.location.replace('http://127.0.0.1:5500/pages/login.html')
    }

    else {
        addNavbar()
    
        switch(p) {
            case 'h': getSummary()
                break;
            case 'u': getUsers()
                break;
            case 'r': getRooms()
                break;
            case 're': getRoomOptions() //get report
                break;
            case 'a': getUserOptions() //get permissions
                break;
            case 'i': setCurrentLabel()
                break;
            default:
                break;
        }
    }
}