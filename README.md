# stegosaurus

## About

This is a basic steganography library inspired by [steganography](https://github.com/rodrigouroz/steganography), following the technique outlined [here](http://domnit.org/blog/2007/02/stepic-explanation.html).

That package depends on [lwip](https://github.com/EyalAr/lwip), which has a complicated installation process and appears to have fallen out of active development (it's not compatible with Node v7 for example). It's also designed to be used via the command line.

This package uses the more lightweight [pngjs](https://github.com/lukeapage/pngjs) for image parsing, nice ES6+ features, and a pure functional approach. It is designed for programmatic use.

## Usage

To conceal a message in an image:
```js
const fs = require('fs')
const { conceal, reveal } = require('./index')

const original = fs.readFileSync('./path/to/image.png') // buffer
const message = 'keep it secret, keep it safe' // string or buffer

// encoding should be supplied if message is provided as a string in non-default encoding
const concealed = conceal(original, message /*, encoding */)
fs.writeFileSync('./path/to/output.png', concealed)
```

To reveal a message hidden in an image:
```js
const image = fs.readFileSync('./path/to/image.png')
// Returns a string if encoding is provided, otherwise a buffer
const revealed = reveal(image /*, encoding */)
console.log(revealed.toString())
```
