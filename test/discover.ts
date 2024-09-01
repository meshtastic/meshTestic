import { SerialPort } from 'serialport';

export interface DiscoveredDevice {
    port: string;
    pio_env: string;
    pnpId: string | undefined;
    manufacturer: string;
}

export async function DiscoverDevices() : Promise<Array<DiscoveredDevice>> {
    const ports = await SerialPort.list();
    const devices = new Array<DiscoveredDevice>();
    ports.forEach(port => {
        console.log(port);
        if (port.manufacturer === 'Microsoft' && port.vendorId === '239A' && port.productId === '8029') {
            devices.push({port: port.path, pio_env: 'rak4631', pnpId: port.pnpId, manufacturer: port.manufacturer});
        } else if (port.manufacturer === 'Silicon Labs' && port.vendorId === '10C4' && port.productId === 'EA60') {
            devices.push({port: port.path, pio_env: 'heltec_v3', pnpId: port.pnpId, manufacturer: port.manufacturer});
        }
    });
    return devices;
}
