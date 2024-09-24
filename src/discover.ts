import * as fs from 'fs';
import { SerialPort } from 'serialport';

export interface DiscoveredDevice extends Device {
    port: string;
}

interface Device {
    pio_env: string;
    arch: string;
    manufacturer: string | undefined;
    vendorId: string | undefined;
    productId: string | undefined;
}

const devicesData = fs.readFileSync('devices.json', 'utf8');
const devicesJson = JSON.parse(devicesData) as Array<Device>;

export async function DiscoverDevices() : Promise<Array<DiscoveredDevice>> {
    const ports = await SerialPort.list();
    const discoveredDevices = new Array<DiscoveredDevice>();
    ports.forEach(port => {
        const foundDevice = devicesJson.find(d => {
            const matchesManufacture = d.manufacturer ? d.manufacturer && port.manufacturer && d.manufacturer.toLowerCase() === port.manufacturer.toLowerCase() : true;
            const matchesVendorId = d.vendorId ? d.vendorId && port.vendorId && port.vendorId.toLowerCase().startsWith(d.vendorId.toLowerCase()) : true;
            const matchesProductId = d.productId ? d.productId && port.productId && port.productId.toLowerCase().startsWith(d.productId.toLowerCase()) : true;

            return matchesManufacture && matchesVendorId && matchesProductId;
        });
        if (foundDevice)
        {
            discoveredDevices.push({
                port: port.path,
                pio_env: foundDevice.pio_env,
                arch: foundDevice.arch,
                manufacturer: port.manufacturer,
                vendorId: port.vendorId,
                productId: port.productId
            });
        }
    });
    return discoveredDevices;
}
