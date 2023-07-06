'use strict'
// let LabeledFaceDescriptors = []
const threshold = 0.6
let results = []
let ls = []
let ds = []
// let currentDs

// Load face-api.js
const MODEL_URL = '../models'
async function loadModel() {
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    console.log('Model loaded!')
}

async function init() {
    await loadModel()
    startCam()
    getDescriptors()
    // console.log(faceapi.nets)

    //deteksi sekali di sini, supaya nanti nggak lama (tapi kalau bisa di halaman aval sih)
    //selama proses init beri pop up loading
}

init()

// Define variables
const video = document.getElementById('cam')
const canvas = document.getElementById('detectionCanvas')
const ctx = canvas.getContext('2d')
const v_width = video.width
const v_height = video.height

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
    console.log(distance)

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

    if (min > threshold) {
        console.log('User tidak dikenal.')
    }

    else {
        console.log(ls[index])
    }
}

async function startCam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {width: v_width, height: v_height}
        })
        handleSuccess(stream)
    } catch(err) { console.log(err) }
}

function handleSuccess(stream) {
    window.stream = stream
    cam.srcObject = stream
}

video.addEventListener('play', () => {
    // console.log('Play')
    
    // setInterval(async () => {
    //     const detections = await faceapi.detectAllFaces(video)

    //     ctx.clearRect(0, 0, canvas.width, canvas.height)
    //     if (detections[0] !== undefined) {
    //         ctx.strokeStyle = 'green'
    //         ctx.strokeRect(detections[0]._box._x, detections[0]._box._y, detections[0]._box._width, detections[0]._box._height)
    //     }
    // }, 100)
})

async function getDescriptors() {
        try {
            fetch(`http://127.0.0.1:3001/model/descriptor`)
                .then(res => res.json())
                .then(data => {
                    data.result.map(res => {
                        ls.push(res.l)
                        ds.push(res.d)
                    })
                    // results = data.result
                    console.log(ls)
                    console.log(ds)

                    // results.forEach(desc => {
                        // LabeledFaceDescriptors.push(desc.descriptor)
                        // LabeledFaceDescriptors.push({
                            // _label: desc.descriptor.label,
                            // descriptor: new Float32Array(desc.descriptor.descriptors[0])
                            // _descriptors: [new Float32Array(desc.descriptor.descriptors[0]), new Float32Array(desc.descriptor.descriptors[1])]
                        // })
                        // console.log('DESC', desc)
                        // console.log(Array.isArray(desc.descriptor.descriptors[0]))
                        // console.log(Array.isArray(new Float32Array(desc.descriptor.descriptors[0])))
                        // console.log(LabeledFaceDescriptors)
                    // })

                    // let faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6)
                    // console.log('FACEMATCHER', faceMatcher)
                })
        } catch(err) {console.log(err)}
}

async function enterRoom() {
    console.log('Masuk')
    
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/png')
    ctx.clearRect(0, 0, v_width, v_height)

    const image = document.createElement('img')
    image.src = dataUrl

    // const displaySize = { width: v_width, height: v_height }

    const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    // const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
    // const resizedDetection = faceapi.resizeResults(detection, displaySize)

    // console.log(detection)
    if (!detection[0]) {
        console.log('Tidak ada wajah terdeteksi.')
    }

    else {
        // ctx.strokeStyle = 'green'
        // ctx.strokeRect(detections[0].alignedRect._box._x, detections[0].alignedRect._box._y, detections[0].alignedRect._box._width, detections[0].alignedRect._box._height)
        
        // console.log('CURRENT DETECTION: ', detection[0].descriptor)
        faceMatcher(detection[0].descriptor)
    }


    // console.log(LabeledFaceDescriptors)
    // console.log(LabeledFaceDescriptors[0].__defineGetter__().toString())
    // let faceMatcher = new faceapi.FaceMatcher(LabeledFaceDescriptors, 0.6)
    // console.log(faceMatcher)
}

function exitRoom() {
    console.log('Keluar')
}