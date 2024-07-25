const fs = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const EventEmitter = require('events');

const pipelineAsync = promisify(pipeline);
const fileEvents = new EventEmitter();

async function processFile(filePath) {
    const readStream = fs.createReadStream(filePath);
    const writeStream = fs.createWriteStream(`${filePath}.processed`);

    const transformStream = new (require('stream').Transform)({
        transform(chunk, encoding, callback) {
            this.push(chunk.toString().toUpperCase());
            callback();
        }
    });

    try {
        fileEvents.emit('processingStart', filePath);
        await pipelineAsync(
            readStream,
            transformStream,
            writeStream
        );
        fileEvents.emit('processingComplete', filePath);
        console.log(`Processing complete: ${filePath}`);
    } catch (err) {
        fileEvents.emit('processingError', filePath, err);
        console.error(`Error processing file: ${filePath}`, err);
    }
}

module.exports = {
    processFile,
    fileEvents
};
