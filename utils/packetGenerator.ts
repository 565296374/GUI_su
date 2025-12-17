import { Packet, Protocol } from '../types';

let packetCounter = 0;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateIp = () => {
  // 优先使用私有网段以增加模拟的真实感
  const prefix = Math.random() > 0.5 ? '192.168.1' : `10.${getRandomInt(0, 255)}.0`;
  return `${prefix}.${getRandomInt(1, 254)}`;
};

const generatePublicIp = () => {
  return `${getRandomInt(1, 200)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 254)}`;
};

const generatePayload = (length: number): string => {
  let result = '';
  const characters = '0123456789ABCDEF';
  for (let i = 0; i < length * 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generatePacket = (): Packet => {
  packetCounter++;
  const isIncoming = Math.random() > 0.4;
  
  const protoRoll = Math.random();
  let protocol = Protocol.TCP;
  let sPort = getRandomInt(1024, 65535);
  let dPort = 80;

  if (protoRoll < 0.3) {
    protocol = Protocol.HTTP;
    dPort = 80;
  } else if (protoRoll < 0.5) {
    protocol = Protocol.TLS;
    dPort = 443;
  } else if (protoRoll < 0.7) {
    protocol = Protocol.UDP;
    dPort = 53;
  } else if (protoRoll < 0.8) {
    protocol = Protocol.ICMP;
    dPort = 0;
  }

  // 偶尔交换端口以模拟真实情况
  if (isIncoming) {
    const temp = sPort;
    sPort = dPort;
    dPort = temp;
  }

  const length = getRandomInt(40, 1500);

  return {
    id: packetCounter,
    timestamp: Date.now(),
    sourceIp: isIncoming ? generatePublicIp() : generateIp(),
    sourcePort: sPort,
    destIp: isIncoming ? generateIp() : generatePublicIp(),
    destPort: dPort,
    protocol: protocol,
    length: length,
    payload: generatePayload(Math.min(length, 256)), // 限制载荷生成长度以优化性能
  };
};