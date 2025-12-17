import { GoogleGenAI } from "@google/genai";
import { Packet } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("未找到 API 密钥 (API Key not found)");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePacket = async (packet: Packet): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      你是一名网络安全专家，正在分析一个网络数据包。
      请分析以下数据包详情，并提供简短的技术解释，说明这种流量可能代表什么。
      如果载荷是随机垃圾数据（在本模拟中确实如此），请解释该端口/协议上的典型流量通常是什么样子的。
      
      数据包详情：
      协议：${packet.protocol}
      源地址：${packet.sourceIp}:${packet.sourcePort}
      目的地址：${packet.destIp}:${packet.destPort}
      载荷长度：${packet.length} 字节
      载荷十六进制预览：${packet.payload.substring(0, 50)}...
      
      请保持回答简洁（不超过3句话），并使用中文回答。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "暂无分析结果。";
  } catch (error) {
    console.error("Gemini 分析失败:", error);
    return "错误：无法使用 AI 分析数据包。请检查 API 配置。";
  }
};