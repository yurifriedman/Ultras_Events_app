
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { EventData } from "../types";

export const getGeminiQuery = async (
  userPrompt: string, 
  events: EventData[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const getEventStats: FunctionDeclaration = {
    name: 'getEventStats',
    parameters: {
      type: Type.OBJECT,
      description: 'Get total participants and basic info for a specific ultra hiking event.',
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The unique ID of the event (e.g., evt-1).',
        },
      },
      required: ['eventId'],
    },
  };

  const listParticipants: FunctionDeclaration = {
    name: 'listParticipants',
    parameters: {
      type: Type.OBJECT,
      description: 'Get a full list of names and contact phone numbers for participants in an ultra hiking event.',
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The unique ID of the event.',
        },
      },
      required: ['eventId'],
    },
  };

  const listAllEvents: FunctionDeclaration = {
    name: 'listAllEvents',
    parameters: {
      type: Type.OBJECT,
      description: 'Get a summary of all available ultra endurance hiking events.',
      properties: {},
    },
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: userPrompt,
    config: {
      systemInstruction: `You are an AI assistant for Ultras Events. 
      You have access to a database of ultra-hikes and their registrations.
      Use the provided tools to answer queries about hike attendance, participant contact info (phone numbers), and event statistics.
      Always be helpful and concise. Focus on endurance and trail hiking terminology.`,
      tools: [{ functionDeclarations: [getEventStats, listParticipants, listAllEvents] }],
    },
  });

  const functionCalls = response.functionCalls;
  if (functionCalls && functionCalls.length > 0) {
    const results = functionCalls.map(fc => {
      if (fc.name === 'getEventStats') {
        const event = events.find(e => e.id === fc.args.eventId);
        return event ? { 
          title: event.title, 
          count: event.registrations.length, 
          location: event.location 
        } : "Event not found";
      }
      if (fc.name === 'listParticipants') {
        const event = events.find(e => e.id === fc.args.eventId);
        return event ? { 
          event: event.title, 
          participants: event.registrations.map(r => `${r.name} (Phone: ${r.phone})`) 
        } : "Event not found";
      }
      if (fc.name === 'listAllEvents') {
        return events.map(e => ({ id: e.id, title: e.title }));
      }
      return "Unknown tool";
    });

    const followUp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: `User asked: ${userPrompt}` },
        { text: `The tool returned: ${JSON.stringify(results)}` },
        { text: "Synthesize this into a polite final response." }
      ]
    });
    return followUp.text || "I couldn't process that query.";
  }

  return response.text || "No response generated.";
};
