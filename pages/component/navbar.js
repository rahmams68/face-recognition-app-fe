function addNavbar() {
    const nav = document.createElement('nav')
    nav.innerHTML = `
        <a>ADMIN (Rahma Maulida)</a>
        <a href="/pages/dashboard">BERANDA</a>
        <a href="/pages/dashboard/users.html">DATA USER</a>
        <a href="/pages/dashboard/rooms.html">DATA RUANGAN</a>
        <a href="/pages/dashboard/report.html">LAPORAN AKSES</a>
        <a href="/pages/login.html">LOGOUT</a>
    `
    document.body.insertAdjacentElement('afterbegin', nav)
}

{/* <a href="/pages/dashboard/model.html">RE-TRAINING MODEL</a> */}

addNavbar()