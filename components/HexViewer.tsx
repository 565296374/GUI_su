import React, { useMemo } from 'react';

interface HexViewerProps {
  data: string; // 十六进制字符串
}

const HexViewer: React.FC<HexViewerProps> = ({ data }) => {
  
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < data.length; i += 32) { // 16 字节 = 32 个十六进制字符
      const chunk = data.substring(i, i + 32);
      result.push({
        offset: (i / 2).toString(16).padStart(8, '0'),
        hex: chunk,
        ascii: chunk.match(/.{1,2}/g)?.map(byte => {
          const code = parseInt(byte, 16);
          return (code >= 32 && code <= 126) ? String.fromCharCode(code) : '.';
        }).join('') || '',
        binary: chunk.match(/.{1,2}/g)?.map(byte => {
            return parseInt(byte, 16).toString(2).padStart(8, '0');
        }).join(' ') || ''
      });
    }
    return result;
  }, [data]);

  return (
    <div className="font-mono text-xs overflow-auto h-full bg-black/30 p-4 rounded border border-gray-800">
      <div className="grid grid-cols-[80px_1fr_200px] gap-4 mb-2 border-b border-gray-700 pb-2 font-bold text-gray-500">
        <div>偏移量 (OFFSET)</div>
        <div>十六进制 & 二进制预览</div>
        <div>ASCII 字符</div>
      </div>
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-[80px_1fr_200px] gap-4 hover:bg-gray-800/50 cursor-default group">
          <div className="text-blue-400 opacity-70">{row.offset}</div>
          <div className="flex flex-col">
            <span className="text-yellow-100/80 tracking-widest">{row.hex.match(/.{1,2}/g)?.join(' ')}</span>
            {/* 鼠标悬停时显示二进制，或者仅显示很小 */}
            <span className="text-[10px] text-gray-600 hidden group-hover:block">{row.binary}</span>
          </div>
          <div className="text-green-400/80 tracking-widest">{row.ascii}</div>
        </div>
      ))}
      {data.length === 0 && (
        <div className="text-gray-600 italic">暂无载荷数据。</div>
      )}
    </div>
  );
};

export default HexViewer;