import { exec } from 'child_process';

import { DiscoverDevices } from './discover';

const devices = await DiscoverDevices();
console.log(devices);

devices.forEach(async device => {
    exec(`python ./src/python/setup.py ${device.port} ${device.pio_env} ${device.arch}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing the Python script: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        console.log('Output:', stdout);
    });
});