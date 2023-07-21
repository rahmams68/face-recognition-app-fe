// console.log(tf)
// console.log(tf.version)


// MODEL
const MODEL = tf.sequential()

// ConvLayer 1
MODEL.add(tf.layers.conv2d({
    inputShape: [128, 1, 1],
    filters: 32,
    kernelSize: 3,
    strides: 1,
    padding: 'same',
    activation: 'relu'
}))

MODEL.add(tf.layers.conv2d({
    filters: 32,
    kernelSize: 3,
    strides: 1,
    padding: 'same',
    activation: 'relu'
}))

MODEL.summary()
console.log(MODEL.layers)
console.log(MODEL.inputLayers)
console.log(MODEL.outputLayers)


const input = tf.input({shape: [748]})
const dense1 = tf.layers.dense({units: 32, activation: 'relu'}).apply(input)
const dense2 = tf.layers.dense({units: 10, activation: 'softmax'}).apply(dense1)
const model = tf.model({inputs: input, outputs: dense2})

console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa')
model.summary()
console.log(model.layers)
console.log(model.inputLayers)
console.log(model.outputLayers)
