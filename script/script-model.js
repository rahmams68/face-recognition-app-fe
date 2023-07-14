// console.log(tf)
// console.log(tf.version)


// MODEL
const MODEL = tf.sequential()

// ConvLayer 1
MODEL.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    filters: 16,
    kernelSize: 3,
    strides: 1,
    padding: 'same',
    activation: 'relu'
}))

MODEL.summary()