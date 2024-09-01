import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import sinon from 'sinon';

import { DiscoverDevices } from '../src/discover';
import { ConnectedNode } from '../src/node';
import { PromiseTimeout } from '../src/util';

const TEN_SECONDS = 10000;
const devices = await DiscoverDevices()

sinon.stub(console, 'log')  // disable console.log
// sinon.stub(console, 'info')  // disable console.info
sinon.stub(console, 'warn')  // disable console.warn
// sinon.stub(console, 'error')  // disable console.error

describe(`Configure node`, async () => {
    devices.forEach(async device => {
        const node = new ConnectedNode(device.port, device.pio_env);
        before(async () => {
            await node.configure();
        },);

        describe(`${device.pio_env}`.toUpperCase(), async () => {
            it('should respond to config with valid want_config flow', async () => {
                expect(node.deviceConfig).to.not.be.undefined;
                expect(node.myNodeInfo).to.not.be.undefined;
                expect(node.metadata).to.not.be.undefined;
                expect(node.nodes).to.have.length.greaterThan(0);
                expect(node.channels).to.have.length.greaterThan(0);
            });

            it('should send text and receive ack', async () => {
                await node.sendText('Howdy test!');
                const found = await node.waitForRouting((packet) => {
                    console.info(packet);
                    if (packet.variant.case === 'errorReason' &&  packet.variant.value === 0) {
                        return true;
                    }
                    return false;
                });
                expect(found).to.be.true;
                await PromiseTimeout(2000);
            });

            it ('should send waypoint and receive response', async () => {
                node.routingPackets = [];
                // Unicode snowman
                await node.sendWaypoint(0x00002603, 32, 32, );
                const found = await node.waitForRouting((packet) => {
                    console.info(packet);
                    if (packet.variant.case === 'errorReason' && packet.variant.value === 0) {
                        return true;
                    }
                    return false;
                });
                expect(found).to.be.true;
            });

            after(async () => {
                await node.close();
            });
        });
    });
});