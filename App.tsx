import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Packet } from './types';
import { generatePacket } from './utils/packetGenerator';
import { analyzePacket } from './services/geminiService';
import PacketList from './components/PacketList';
import HexViewer from './components/HexViewer';
import { 
  PlayIcon, 
  PauseIcon, 
  TrashIcon, 
  CpuChipIcon, 
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/solid';

const MAX_PACKETS = 1000;

const App: React.FC = () => {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // 监听 PWA 安装事件
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 抓包循环 (Capture loop)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isCapturing) {
      intervalId = setInterval(() => {
        const newPacket = generatePacket();
        setPackets(prev => {
          const updated = [...prev, newPacket];
          if (updated.length > MAX_PACKETS) {
            return updated.slice(updated.length - MAX_PACKETS);
          }
          return updated;
        });
      }, 300); // 每 300ms 生成一个新数据包
    }

    return () => clearInterval(intervalId);
  }, [isCapturing]);

  // 处理 AI 分析 (Handle AI Analysis)
  const handleAnalyze = useCallback(async () => {
    if (!selectedPacket) return;
    setIsAnalyzing(true);
    setAiAnalysis("正在分析数据包结构及载荷熵值...");
    
    const result = await analyzePacket(selectedPacket);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  }, [selectedPacket]);

  // 当选择改变时清除分析结果 (Clear analysis when selection changes)
  useEffect(() => {
    setAiAnalysis("");
  }, [selectedPacket]);

  const toggleCapture = () => setIsCapturing(!isCapturing);
  const clearPackets = () => {
    setPackets([]);
    setSelectedPacket(null);
  };

  // 导出数据功能
  const exportData = () => {
    const dataStr = JSON.stringify(packets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netsentry_capture_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 安装应用功能
  const installApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-gray-200 overflow-hidden font-sans">
      {/* 头部 / 工具栏 (Header / Toolbar) */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
             <CpuChipIcon className="w-5 h-5 text-white" />
           </div>
           <h1 className="text-lg font-bold tracking-tight text-white">NetSentry <span className="text-blue-500 text-xs font-mono border border-blue-900 bg-blue-900/20 px-1 rounded">网络哨兵</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1 space-x-1">
            <button 
              onClick={toggleCapture}
              className={`px-3 py-1.5 rounded flex items-center space-x-2 text-sm font-medium transition-colors ${isCapturing ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-600 text-white hover:bg-green-500'}`}
            >
              {isCapturing ? <><PauseIcon className="w-4 h-4" /> <span>暂停抓取</span></> : <><PlayIcon className="w-4 h-4" /> <span>开始抓取</span></>}
            </button>
            <button 
              onClick={exportData}
              title="导出数据 (JSON)"
              className="px-3 py-1.5 rounded flex items-center space-x-2 text-sm font-medium text-blue-400 hover:bg-gray-700 hover:text-blue-300 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>导出</span>
            </button>
            <button 
              onClick={clearPackets}
              title="清空数据包"
              className="px-3 py-1.5 rounded flex items-center space-x-2 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          
          {installPrompt && (
            <button
              onClick={installApp}
              className="hidden md:flex items-center space-x-1 text-xs text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 rounded hover:bg-yellow-500/20 transition-colors"
            >
              <ComputerDesktopIcon className="w-3 h-3" />
              <span>安装到桌面</span>
            </button>
          )}
          
          <div className="flex flex-col items-end text-xs text-gray-500 font-mono">
             <span>数据包数: {packets.length}</span>
             <span>缓冲区: {Math.round((packets.length / MAX_PACKETS) * 100)}%</span>
          </div>
        </div>
      </header>

      {/* 主要内容区域 (Main Content Area) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧面板: 数据包列表 (Left Pane: Packet List) */}
        <div className="w-1/2 flex flex-col border-r border-gray-800 min-w-[400px]">
           <PacketList 
             packets={packets} 
             selectedId={selectedPacket?.id || null} 
             onSelect={(p) => {
               setSelectedPacket(p);
               setAutoScroll(false); 
             }}
             autoScroll={autoScroll && isCapturing}
           />
           {!autoScroll && isCapturing && (
             <button 
               onClick={() => setAutoScroll(true)}
               className="absolute bottom-4 left-[20%] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold animate-bounce z-10"
             >
               恢复自动滚动
             </button>
           )}
        </div>

        {/* 右侧面板: 数据包详情 (Right Pane: Packet Details) */}
        <div className="w-1/2 flex flex-col bg-gray-900/50">
          {selectedPacket ? (
            <div className="flex flex-col h-full">
              {/* 数据包信息头 (Packet Info Header) */}
              <div className="p-4 border-b border-gray-800 bg-gray-900">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-mono text-white mb-1">数据包 #{selectedPacket.id}</h2>
                    <div className="text-sm text-gray-400 space-y-1 font-mono">
                      <div className="flex space-x-4">
                        <span className="text-gray-500">协议:</span> 
                        <span className="text-blue-400 font-bold">{selectedPacket.protocol}</span>
                      </div>
                      <div className="flex space-x-4">
                         <span className="text-gray-500">源地址:</span>
                         <span>{selectedPacket.sourceIp}:{selectedPacket.sourcePort}</span>
                      </div>
                      <div className="flex space-x-4">
                         <span className="text-gray-500">目的地址:</span>
                         <span>{selectedPacket.destIp}:{selectedPacket.destPort}</span>
                      </div>
                      <div className="flex space-x-4">
                         <span className="text-gray-500">长度:</span>
                         <span>{selectedPacket.length} 字节</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI 分析按钮 (AI Analyze Button) */}
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded shadow-lg transition-all text-xs font-bold border border-purple-400/30"
                  >
                    {isAnalyzing ? <ArrowPathIcon className="w-4 h-4 animate-spin"/> : <CpuChipIcon className="w-4 h-4"/>}
                    <span>AI 智能分析</span>
                  </button>
                </div>
                
                {/* AI 结果区域 (AI Result Area) */}
                {(aiAnalysis || isAnalyzing) && (
                   <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-sm text-indigo-200 animate-in fade-in slide-in-from-top-2 duration-300">
                     <strong className="block text-indigo-400 text-xs uppercase tracking-wider mb-1">Gemini 深度洞察:</strong>
                     {aiAnalysis}
                   </div>
                )}
              </div>

              {/* 载荷查看器 (Payload Viewer) */}
              <div className="flex-1 p-4 overflow-hidden flex flex-col">
                <div className="mb-2 flex justify-between items-end">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">载荷透视 (Payload Inspector)</h3>
                  <div className="flex space-x-2 text-[10px] text-gray-500">
                    <span className="bg-gray-800 px-2 py-1 rounded">HEX</span>
                    <span className="bg-gray-800 px-2 py-1 rounded">ASCII</span>
                    <span className="bg-gray-800 px-2 py-1 rounded">BIN</span>
                  </div>
                </div>
                <HexViewer data={selectedPacket.payload} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
              <CpuChipIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">未选择数据包</p>
              <p className="text-sm">请从左侧列表中选择一个数据包以查看其 十六进制/二进制/ASCII 详情。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;