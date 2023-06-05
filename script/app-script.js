'use strict'

// Load face-api.js
const MODEL_URL = '../models'
async function loadModel() {
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
    await faceapi.loadFaceRecognitionModel(MODEL_URL)
    console.log('Model loaded!')
}

async function init() {
    await loadModel()
    startCam()
    // console.log(faceapi.nets)
}

init()

async function startCam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {width: 320, height: 240}
        })
        handleSuccess(stream)
    } catch(err) { console.log(err) }
}

function handleSuccess(stream) {
    window.stream = stream
    cam.srcObject = stream
}

cam.addEventListener('play', () => {
    console.log('Play')
})