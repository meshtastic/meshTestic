import {
  LogRecord,
} from '@buf/meshtastic_protobufs.bufbuild_es/meshtastic/mesh_pb';
import {
  NodeSerialConnection,
  Protobuf,
  Types,
} from '@meshtastic/js';

import { PromiseTimeout } from './util';

export class ConnectedNode {
    connection: NodeSerialConnection;
    connectionParameters: Types.NodeSerialConnectionParameters;
    packets: Protobuf.Mesh.FromRadio[] = [];
    routingPackets: Protobuf.Mesh.Routing[] = [];
    logs: Protobuf.Mesh.LogRecord[] = [];

    metadata: Protobuf.Mesh.DeviceMetadata | undefined;
    myNodeInfo: Protobuf.Mesh.MyNodeInfo | undefined;
    nodes: Protobuf.Mesh.NodeInfo[] = [];
    channels: Protobuf.Channel.Channel[] = [];

    deviceConfig: Protobuf.Config.Config_DeviceConfig | undefined;
    loraConfig: Protobuf.Config.Config_LoRaConfig | undefined;
    bluetoothConfig: Protobuf.Config.Config_BluetoothConfig | undefined;
    displayConfig: Protobuf.Config.Config_DisplayConfig | undefined;
    networkConfig: Protobuf.Config.Config_NetworkConfig | undefined;
    positionConfig: Protobuf.Config.Config_PositionConfig | undefined;
    powerConfig: Protobuf.Config.Config_PowerConfig | undefined;
    securityConfig: Protobuf.Config.Config_SecurityConfig | undefined;

    audioConfig: Protobuf.ModuleConfig.ModuleConfig_AudioConfig | undefined;
    ambientLightingConfig: Protobuf.ModuleConfig.ModuleConfig_AmbientLightingConfig | undefined;
    cannedMessageConfig: Protobuf.ModuleConfig.ModuleConfig_CannedMessageConfig | undefined;
    detectionSensorConfig: Protobuf.ModuleConfig.ModuleConfig_DetectionSensorConfig | undefined;
    externalNotificationConfig: Protobuf.ModuleConfig.ModuleConfig_ExternalNotificationConfig | undefined;
    mqttConfig: Protobuf.ModuleConfig.ModuleConfig_MQTTConfig | undefined;
    neighborInfoConfig: Protobuf.ModuleConfig.ModuleConfig_NeighborInfoConfig | undefined;
    paxcounterConfig: Protobuf.ModuleConfig.ModuleConfig_PaxcounterConfig | undefined;
    rangetestConfig: Protobuf.ModuleConfig.ModuleConfig_RangeTestConfig | undefined;
    remoteHardwareConfig: Protobuf.ModuleConfig.ModuleConfig_RemoteHardwareConfig | undefined;
    serialConfig: Protobuf.ModuleConfig.ModuleConfig_SerialConfig | undefined;
    storeForwardConfig: Protobuf.ModuleConfig.ModuleConfig_StoreForwardConfig | undefined;
    telemetryConfig: Protobuf.ModuleConfig.ModuleConfig_TelemetryConfig | undefined;

    constructor(port: string, pio_env: string) {
        this.connection = new NodeSerialConnection()
        this.connectionParameters = {portPath: port, baudRate: 115200, concurrentLogOutput: false};
        this.initSubscriptions()
    }
    async configure() {
        await this.connection.connect(this.connectionParameters)
        await PromiseTimeout(500);
        await Promise.race([this.connection.configure(), PromiseTimeout(6000)]);
    }

    async sendText(text: string) {
        console.info('Sending text: ', text);
        await this.connection.sendText(text, undefined, true);
    }

    async sendWaypoint(icon: number, lat: number, lon: number) {
        console.info('Sending waypoint: ', icon, lat, lon);
        const waypoint = new Protobuf.Mesh.Waypoint();
        waypoint.latitudeI = lat;
        waypoint.longitudeI = lon;
        waypoint.icon = icon;
        await this.connection.sendWaypoint(waypoint, 0, 0);
    }

    async waitForPacket(predicate: (packet: Protobuf.Mesh.FromRadio) => boolean, timeout: number = 10000) : Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (this.packets.some(predicate)) {
                return true;
            }
            await PromiseTimeout(10);
        }
        return false;
    }
    
    async waitForRouting(predicate: (routingPacket: Protobuf.Mesh.Routing) => boolean, timeout: number = 10000) : Promise<boolean> {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (this.routingPackets.some(predicate)) {
                return true;
            }
            await PromiseTimeout(10);
        }
        return false;
    }
    private initSubscriptions() : void {
        this.connection.events.onChannelPacket.subscribe((channel: Protobuf.Channel.Channel) => {
            this.channels.push(channel);
        });
        this.connection.events.onFromRadio.subscribe((fromRadio: Protobuf.Mesh.FromRadio) => {
            if (fromRadio.payloadVariant.value instanceof LogRecord) {
                this.logs.push(fromRadio.payloadVariant.value);
            } else if (fromRadio.payloadVariant.value instanceof Protobuf.Mesh.DeviceMetadata) {
                this.metadata = fromRadio.payloadVariant.value;
            } else if (fromRadio.payloadVariant.value instanceof Protobuf.Mesh.NodeInfo) {
                this.nodes.push(fromRadio.payloadVariant.value);
            } else if (fromRadio.payloadVariant.value instanceof Protobuf.Mesh.MyNodeInfo) {
                this.myNodeInfo = fromRadio.payloadVariant.value;
            } 
            this.packets.push(fromRadio);
        });
        this.connection.events.onConfigPacket.subscribe((config: Protobuf.Config.Config) => {
            if (config.payloadVariant.value instanceof Protobuf.Config.Config_DeviceConfig) {
                this.deviceConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_LoRaConfig) {
                this.loraConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_BluetoothConfig) {
                this.bluetoothConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_DisplayConfig) {
                this.displayConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_NetworkConfig) {
                this.networkConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_PositionConfig) {
                this.positionConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_PowerConfig) {
                this.powerConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.Config.Config_SecurityConfig) {
                this.securityConfig = config.payloadVariant.value;
            } else {
                console.log('Unknown config packet', config.payloadVariant.value);
            }
        });
        this.connection.events.onModuleConfigPacket.subscribe((config: Protobuf.ModuleConfig.ModuleConfig) => {
            if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_AudioConfig) {
                this.audioConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_AmbientLightingConfig) {
                this.ambientLightingConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_CannedMessageConfig) {
                this.cannedMessageConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_DetectionSensorConfig) {
                this.detectionSensorConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_ExternalNotificationConfig) {
                this.externalNotificationConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_MQTTConfig) {
                this.mqttConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_NeighborInfoConfig) {
                this.neighborInfoConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_PaxcounterConfig) {
                this.paxcounterConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_RangeTestConfig) {
                this.rangetestConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_RemoteHardwareConfig) {
                this.remoteHardwareConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_SerialConfig) {
                this.serialConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_StoreForwardConfig) {
                this.storeForwardConfig = config.payloadVariant.value;
            } else if (config.payloadVariant.value instanceof Protobuf.ModuleConfig.ModuleConfig_TelemetryConfig) {
                this.telemetryConfig = config.payloadVariant.value;
            } else {
                console.log('Unknown module config packet', config.payloadVariant.value);
            }
        });
        this.connection.events.onMyNodeInfo.subscribe((myNodeInfo: Protobuf.Mesh.MyNodeInfo) => {
            this.myNodeInfo = myNodeInfo;
        });
        this.connection.events.onRoutingPacket.subscribe((routing) => {
            this.routingPackets.push(routing.data);
        });
    }


    async close() {
        await this.connection.disconnect();
    }
}

// this.connection.events.onMessagePacket.subscribe((packet) => {
// });
// this.connection.events.onDeviceMetadataPacket.subscribe((packet) => {
// });
// this.connection.events.onDeviceDebugLog.subscribe((packet) => {
// });
// this.connection.events.onDeviceStatus.subscribe((packet) => {
// });
// this.connection.events.onMyNodeInfo.subscribe((packet) => {
// });
// this.connection.events.onRoutingPacket.subscribe((packet) => {
// });