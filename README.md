# steggy

![steggy](https://upload.wikimedia.org/wikipedia/commons/c/c6/Stego-marsh-1896-US_geological_survey.png)

## About

This is a basic steganography library inspired by [steganography](https://github.com/rodrigouroz/steganography), following the technique outlined [here](http://domnit.org/blog/2007/02/stepic-explanation.html).

That package depends on [lwip](https://github.com/EyalAr/lwip), which has a complicated installation process and appears to have fallen out of active development (it's not compatible with Node v7 for example). It's also designed to be used via the command line.

This package uses the more lightweight [pngjs](https://github.com/lukeapage/pngjs) for image parsing, nice ES6+ features, and a pure functional approach. It is designed for programmatic use.

There is currently only support for `.png` files.

## Installation

```sh
npm install steggy
```

## Usage

To conceal a message in an image:
```js
const fs = require('fs')
const steggy = require('steggy')

const original = fs.readFileSync('./path/to/image.png') // buffer
const message = 'keep it secret, keep it safe' // string or buffer

// encoding should be supplied if message is provided as a string in non-default encoding
const concealed = steggy.conceal(/* optional password */)(original, message /*, encoding */)
fs.writeFileSync('./path/to/output.png', concealed)
```

To reveal a message hidden in an image:
```js
const fs = require('fs')
const steggy = require('steggy')

const image = fs.readFileSync('./path/to/image.png')
// Returns a string if encoding is provided, otherwise a buffer
const revealed = steggy.reveal(/* optional password */)(image /*, encoding */)
console.log(revealed.toString())
```

## Caveats

This is currently not intended for production use, and should not be used when security is important. Security flaws include:
1. ~~No encryption of the message before embedding (so anyone familiar with the technique can decrypt the message).~~ (solved)
1. ~~Use of the alpha channel to encode the end of the message: alpha channels typically vary less than RGB channels, so manipulation may be easier to detect. For example, an original image which is entirely opaque will end up with alpha channel values uniformly set to 254 for the part with the embedded message, followed by uniform values of 255.~~ (solved)
1. Other things I'm less familiar with...
