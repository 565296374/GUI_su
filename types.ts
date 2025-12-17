export enum Protocol {
  TCP = 'TCP',
  UDP = 'UDP',
  HTTP = 'HTTP',
  ICMP = 'ICMP',
  TLS = 'TLS'
}

export interface Packet {
  id: number;
  timestamp: number;
  sourceIp: string;
  sourcePort: number;
  destIp: string;
  destPort: number;
  protocol: Protocol;
  length: number;
  payload: string; // 十六进制字符串表示 (Hex string representation)
}

export interface PacketFilter {
  text: string;
}