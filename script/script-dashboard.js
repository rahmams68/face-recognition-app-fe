function addNavbar() {
    const nav = document.createElement('nav')
    nav.innerHTML = `
        <a>ADMIN (Rahma Maulida)</a>
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

function logout() {
    localStorage.removeItem('t')
    window.location.replace('http://127.0.0.1:5500/pages/dashboard')
}

function getUsers() {
    fetch('http://127.0.0.1:3001/users')
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
                            <td>${user.training_data === true ? 'Lengkap' : 'Belum Lengkap'}</td>
                            <td>${(user.createdAt).slice(0, 10)}</td>
                            <td>
                                <img onclick="popup(${i})" src="./../../assets/icon-settings.svg" />
                                <div class='hide'>
                                    <p onclick="editUser(${i}, ${user.id})">Edit<p>
                                    <a href='/pages/dashboard/input-training-data.html?u=${user.name}&i=${user.id}'><p>Input Descriptor</p></a>
                                    <p onclick="deleteUser(${user.id})">Hapus</p>
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

function addUser() {
    const name = document.querySelector('input').value
    
    if (!name) {
        alert('Silahkan input nama user baru!')
    }

    else {
        fetch('http://127.0.0.1:3001/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, role_id: 0 })
        })
        .then(res => res.ok ? window.location.reload() : console.log('Error'))
        .catch(err => console.log(err))                
    }
}

function editUser(row_id, uid) {
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
            <td><input name="nameInput" type="text" placeholder="" class="tableInput"/></td>
            <td><button class="btn btnGreen tableInput" onclick="updateUser(${uid})">Simpan</button</td>
            <td><button class="btn btnRed tableInput" onclick="window.location.reload()">Batal</button</td>
            <td></td>
        </tr>
    `
}

function updateUser(uid) {
    const name = document.getElementsByName('nameInput')[0].value

    fetch(`http://127.0.0.1:3001/users/${uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    })
    .then(res => res.ok ? window.location.reload() : console.log('Error'))
    .catch(err => console.log(err))
}

function deleteUser(uid) {
     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/users/${uid}`, { method: 'DELETE' })
             .then(res => res.ok ? window.location.reload() : console.log('Error'))
             .catch(err => console.log(err))
     }
}

function getRooms() {
    fetch(`http://127.0.0.1:3001/rooms`)
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
                                    <p onclick="editRoom(${i}, ${room.id})">Edit</p>
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

function addRoom() {
    const name = document.querySelector('input').value

    if (!name) {
        alert('Silahkan input nama ruangan baru!')
    }

    else {
        fetch('http://127.0.0.1:3001/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        })
        .then(res => res.ok ? window.location.reload() : console.log('Error'))
        .catch(err => console.log(err))                
    }
}

function editRoom(row_id, rid) {
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
            <td><input name="nameInput" type="text" placeholder="" class="tableInput"/></td>
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
    .then(res => res.ok ? window.location.reload() : console.log('Error'))
    .catch(err => console.log(err))
}

function deleteRoom(rid) {
     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/rooms/${rid}`, { method: 'DELETE' })
             .then(res => res.ok ? window.location.reload() : console.log('Error'))
             .catch(err => console.log(err))
     }
}

function getReport() {
    fetch('http://127.0.0.1:3001/attendance')
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
        var url_string = (window.location.href)
        var url = new URL(url_string)
        var rname = url.searchParams.get('r')
        var rid = url.searchParams.get('i')
        
        document.querySelector('span').innerText = rname

        const btn = document.getElementById('tambah-akses')
        btn.setAttribute('onclick', `addPermission(${rid})`)
        getPermissions(rid)
    } catch(err) {
        console.log(err)
    }

    fetch('http://127.0.0.1:3001/users')
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
}

function getPermissions(rid) {
    fetch(`http://127.0.0.1:3001/permissions/${rid}`)
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

                result.forEach(user => {
                    const markup = `
                        <tr id="${i}">
                            <td>${i}</td>
                            <td>${user.user_name.name}</td>
                            <td>${(user.createdAt).slice(0, 10)}</td>
                            <td>
                                <img onclick="deletePermission(${user.id})" src="./../../assets/icon-settings.svg" />
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
    console.log(user_id)
    
    if (user_id != 0) {
        fetch('http://127.0.0.1:3001/permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id, room_id })
        })
        .then(res => res.ok ? window.location.reload() : console.log('Error'))
        .catch(err => console.log(err))                
    }

    else {
        alert('Silahkan pilih user penerima akses terlebih dahulu!')
    }
}

function deletePermission(pid) {
     if (confirm('Hapus data ini?')) {
         fetch(`http://127.0.0.1:3001/permissions/${pid}`, { method: 'DELETE' })
             .then(res => res.ok ? window.location.reload() : console.log('Error'))
             .catch(err => console.log(err))
     }
}

function getSummary() {
    console.log('Summary')
}

function init(p) {
    addNavbar()

    switch(p) {
        case 'h': getSummary()
            break;
        case 'u': getUsers()
            break;
        case 'r': getRooms()
            break;
        case 're': getReport()
            break;
        case 'a': getUserOptions()
            break;
        default:
            break;
    }
}