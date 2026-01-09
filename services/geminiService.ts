
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeSpeech = async (text: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this user speech input: "${text}". 
    The user is practicing English. 
    1. Check if the text is primarily English.
    2. Check if the text contains any Bengali words/phrases.
    3. Check for English grammatical correctness.
    4. Provide a corrected version if there are errors.
    5. Provide a short, friendly encouraging feedback.
    6. Provide a natural spoken response as a female robot tutor named Nova.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isEnglish: { type: Type.BOOLEAN },
          hasBengali: { type: Type.BOOLEAN },
          isCorrect: { type: Type.BOOLEAN },
          correction: { type: Type.STRING },
          feedback: { type: Type.STRING },
          response: { type: Type.STRING },
        },
        required: ["isEnglish", "hasBengali", "isCorrect", "correction", "feedback", "response"]
      }
    }
  });

  return JSON.parse(response.text) as AnalysisResult;
};

export const generateSpeech = async (text: string): Promise<Uint8Array | null> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this naturally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is a clear female voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return decodeBase64(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("TTS generation failed", error);
    return null;
  }
};

function decodeBase64(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
