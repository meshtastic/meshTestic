import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import { NodeSerialConnection } from '@meshtastic/js';

const connection = new NodeSerialConnection()
connection.events.onMessagePacket.subscribe((packet) => {
});
connection.events.onLogEvent.subscribe((packet) => {
});
connection.events.onDeviceMetadataPacket.subscribe((packet) => {
});
connection.events.onDeviceDebugLog.subscribe((packet) => {
});
connection.events.onFromRadio.subscribe((packet) => {
});
connection.events.onDeviceStatus.subscribe((packet) => {
});
connection.events.onMyNodeInfo.subscribe((packet) => {
});
connection.events.onRoutingPacket.subscribe((packet) => {
});
connection.events.onConfigPacket.subscribe((packet) => {
});

describe('Config', async () => {
    await connection.connect({portPath: '/dev/tty.usbmodem1122101', baudRate: 115200, concurrentLogOutput: false})
    await connection.configure();
    describe('Device', () => {
        it('should return valid config section', () => {
            // ArrangeCounselor rubric
            // Act
            // Assert
            expect(true).to.be.true;
        });
    });
});