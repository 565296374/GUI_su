import React, { useEffect, useRef } from 'react';
import { Packet, Protocol } from '../types';

interface PacketListProps {
  packets: Packet[];
  selectedId: number | null;
  onSelect: (packet: Packet) => void;
  autoScroll: boolean;
}

const getProtocolColor = (proto: Protocol) => {
  switch (proto) {
    case Protocol.TCP: return 'text-blue-400';
    case Protocol.UDP: return 'text-orange-400';
    case Protocol.HTTP: return 'text-green-400';
    case Protocol.TLS: return 'text-purple-400';
    case Protocol.ICMP: return 'text-pink-400';
    default: return 'text-gray-400';
  }
};

const PacketList: React.FC<PacketListProps> = ({ packets, selectedId, onSelect, autoScroll }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [packets, autoScroll]);

  return (
    <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">
      <div className="grid grid-cols-[60px_80px_1fr_60px_1fr_80px] gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase tracking-wider">
        <div>序号</div>
        <div>时间</div>
        <div>源地址</div>
        <div>端口</div>
        <div>目的地址</div>
        <div>协议</div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
            <tbody className="font-mono text-xs">
            {packets.map((packet) => (
                <tr 
                key={packet.id}
                onClick={() => onSelect(packet)}
                className={`
                    cursor-pointer border-b border-gray-800/50 hover:bg-gray-800 transition-colors
                    ${selectedId === packet.id ? 'bg-blue-900/30 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                `}
                >
                <td className="p-2 w-[60px] text-gray-500">{packet.id}</td>
                <td className="p-2 w-[80px] text-gray-400">{(packet.timestamp % 100000).toString().padStart(5, '0')}</td>
                <td className="p-2 w-[140px] truncate">{packet.sourceIp}</td>
                <td className="p-2 w-[60px] text-gray-400">{packet.sourcePort}</td>
                <td className="p-2 w-[140px] truncate">
                    {packet.destIp} <span className="text-gray-600">:{packet.destPort}</span>
                </td>
                <td className={`p-2 w-[80px] font-bold ${getProtocolColor(packet.protocol)}`}>
                    {packet.protocol}
                </td>
                </tr>
            ))}
            <div ref={bottomRef} />
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default PacketList;