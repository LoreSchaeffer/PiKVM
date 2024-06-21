require('dotenv').config();
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline')

const debug = process.env.DEBUG === 'true';

class Serial {
    constructor() {
        this.ready = false;

        this.port = new SerialPort({
            path: '/dev/ttyS0',
            baudRate: 9600
        });

        this.port.on('open', () => {
            this.ready = true;
        });

        this.parser = this.port.pipe(new ReadlineParser({
            delimiter: '\n'
        }));

        this.parser.on('data', data => {
            if (debug) console.log(`Arduino: ${data}`);
        });

        this.port.on('error', err => {
            if (debug) console.error('Error: ', err.message);
        });
    }

    write(data) {
        if (this.ready) this.port.write(data + '\n');
    }
}

module.exports = {Serial};