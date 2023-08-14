// console.log(tf)
// console.log(tf.version)

const MODEL_URL = './../../models'

async function loadModel() {
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
    console.log('Model loaded!')
}

let dataset = ['000001.jpg', '000002.jpg', '000003.jpg', '000004.jpg', '000005.jpg', '000006.jpg', '000007.jpg', '000008.jpg', '000009.jpg', '000010.jpg', '000011.jpg', '000012.jpg', '000013.jpg', '000014.jpg', '000015.jpg', '000016.jpg', '000017.jpg', '000018.jpg', '000019.jpg', '000020.jpg', '000021.jpg', '000022.jpg', '000023.jpg', '000024.jpg', '000025.jpg', '000026.jpg', '000027.jpg', '000028.jpg', '000029.jpg', '000030.jpg', '000031.jpg', '000032.jpg', '000033.jpg', '000034.jpg', '000035.jpg', '000036.jpg', '000037.jpg', '000038.jpg', '000039.jpg', '000040.jpg', '000041.jpg', '000042.jpg', '000043.jpg', '000044.jpg', '000045.jpg', '000046.jpg', '000047.jpg', '000048.jpg', '000049.jpg', '000050.jpg', '000051.jpg', '000052.jpg', '000053.jpg', '000054.jpg', '000055.jpg', '000056.jpg', '000057.jpg', '000058.jpg', '000059.jpg', '000060.jpg', '000061.jpg', '000062.jpg', '000063.jpg', '000064.jpg', '000065.jpg', '000066.jpg', '000067.jpg', '000068.jpg', '000069.jpg', '000070.jpg', '000071.jpg', '000072.jpg', '000073.jpg', '000074.jpg', '000075.jpg', '000076.jpg', '000077.jpg', '000078.jpg', '000079.jpg', '000080.jpg', '000081.jpg', '000082.jpg', '000083.jpg', '000084.jpg', '000085.jpg', '000086.jpg', '000087.jpg', '000088.jpg', '000089.jpg', '000090.jpg', '000091.jpg', '000092.jpg', '000093.jpg', '000094.jpg', '000095.jpg', '000096.jpg', '000097.jpg', '000098.jpg', '000099.jpg', '000100.jpg', '000101.jpg', '000102.jpg', '000103.jpg', '000104.jpg', '000105.jpg', '000106.jpg', '000107.jpg', '000108.jpg', '000109.jpg', '000110.jpg', '000111.jpg', '000112.jpg', '000113.jpg', '000114.jpg', '000115.jpg', '000116.jpg', '000117.jpg', '000118.jpg', '000119.jpg', '000120.jpg', '000121.jpg', '000122.jpg', '000123.jpg', '000124.jpg', '000125.jpg', '000126.jpg', '000127.jpg', '000128.jpg', '000129.jpg', '000130.jpg', '000131.jpg', '000132.jpg', '000133.jpg', '000134.jpg', '000135.jpg', '000136.jpg', '000137.jpg', '000138.jpg', '000139.jpg', '000140.jpg', '000141.jpg', '000142.jpg', '000143.jpg', '000144.jpg', '000145.jpg', '000146.jpg', '000147.jpg', '000148.jpg', '000149.jpg', '000150.jpg', '000151.jpg', '000152.jpg', '000153.jpg', '000154.jpg', '000155.jpg', '000156.jpg', '000157.jpg', '000158.jpg', '000159.jpg', '000160.jpg', '000161.jpg', '000162.jpg', '000163.jpg', '000164.jpg', '000165.jpg', '000166.jpg', '000167.jpg', '000168.jpg', '000169.jpg', '000170.jpg', '000171.jpg', '000172.jpg', '000173.jpg', '000174.jpg', '000175.jpg', '000176.jpg', '000177.jpg', '000178.jpg', '000179.jpg', '000180.jpg', '000181.jpg', '000182.jpg', '000183.jpg', '000184.jpg', '000185.jpg', '000186.jpg', '000187.jpg', '000188.jpg', '000189.jpg', '000190.jpg', '000191.jpg', '000192.jpg', '000193.jpg', '000194.jpg', '000195.jpg', '000196.jpg', '000197.jpg', '000198.jpg', '000199.jpg', '000200.jpg', '000201.jpg', '000202.jpg', '000203.jpg', '000204.jpg', '000205.jpg', '000206.jpg', '000207.jpg', '000208.jpg', '000209.jpg', '000210.jpg', '000211.jpg', '000212.jpg', '000213.jpg', '000214.jpg', '000215.jpg', '000216.jpg', '000217.jpg', '000218.jpg', '000219.jpg', '000220.jpg', '000221.jpg', '000222.jpg', '000223.jpg', '000224.jpg', '000225.jpg', '000226.jpg', '000227.jpg', '000228.jpg', '000229.jpg', '000230.jpg', '000231.jpg', '000232.jpg', '000233.jpg', '000234.jpg', '000235.jpg', '000236.jpg', '000237.jpg', '000238.jpg', '000239.jpg', '000240.jpg', '000241.jpg', '000242.jpg', '000243.jpg', '000244.jpg', '000245.jpg', '000246.jpg', '000247.jpg', '000248.jpg', '000249.jpg', '000250.jpg', '000251.jpg', '000252.jpg', '000253.jpg', '000254.jpg', '000255.jpg', '000256.jpg', '000257.jpg', '000258.jpg', '000259.jpg', '000260.jpg', '000261.jpg', '000262.jpg', '000263.jpg', '000264.jpg', '000265.jpg', '000266.jpg', '000267.jpg', '000268.jpg', '000269.jpg', '000270.jpg', '000271.jpg', '000272.jpg', '000273.jpg', '000274.jpg', '000275.jpg', '000276.jpg', '000277.jpg', '000278.jpg', '000279.jpg', '000280.jpg', '000281.jpg', '000282.jpg', '000283.jpg', '000284.jpg', '000285.jpg', '000286.jpg', '000287.jpg', '000288.jpg', '000289.jpg', '000290.jpg', '000291.jpg', '000292.jpg', '000293.jpg', '000294.jpg', '000295.jpg', '000296.jpg', '000297.jpg', '000298.jpg', '000299.jpg', '000300.jpg']
let labels = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
let TP = 0
let TN = 0
let FP = 0
let FN = 0

async function evaluate() {
    // let dataUrl = []
    // console.log(dataset)
    // console.log(dataset.length)
    // console.log(labels)
    // console.log(labels.length)
    
    for (let i = 0;  i < labels.length; i++) {
        const img = document.getElementById(`${i}`)
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')

        ctx.drawImage(img, 0, 0)
        const url = canvas.toDataURL()
        
        const image = document.createElement('img')
        image.src = url

        console.log(image)

        const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        console.log(detection)

        if (!detection[0]) {
            console.log('No Face')
        }

        else {
            console.log('Face')
        }

        // ctx.clearRect(0, 0, )
    }   
}

async function init() {
    await loadModel()
    await evaluate()
}

init()

// MODEL
// const MODEL = tf.sequential()

// ConvLayer 1
// MODEL.add(tf.layers.conv2d({
//     inputShape: [128, 1, 1],
//     filters: 32,
//     kernelSize: 3,
//     strides: 1,
//     padding: 'same',
//     activation: 'relu'
// }))

// MODEL.add(tf.layers.conv2d({
//     filters: 32,
//     kernelSize: 3,
//     strides: 1,
//     padding: 'same',
//     activation: 'relu'
// }))

// MODEL.summary()
// console.log(MODEL.layers)
// console.log(MODEL.inputLayers)
// console.log(MODEL.outputLayers)


// const input = tf.input({shape: [748]})
// const dense1 = tf.layers.dense({units: 32, activation: 'relu'}).apply(input)
// const dense2 = tf.layers.dense({units: 10, activation: 'softmax'}).apply(dense1)
// const model = tf.model({inputs: input, outputs: dense2})

// console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa')
// model.summary()
// console.log(model.layers)
// console.log(model.inputLayers)
// console.log(model.outputLayers)
