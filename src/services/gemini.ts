import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeWorkflow(yaml: string) {
  const prompt = `
    Analyze the following GitHub Actions workflow YAML for CI waste, inefficiencies, and cost leaks.
    Focus on:
    1. Caching opportunities.
    2. Runner optimization (e.g., using ARM if applicable, using smaller runners).
    3. Matrix combinations that might be excessive.
    4. Unnecessary steps or heavy dependencies.
    5. Flaky test patterns.

    Workflow YAML:
    ${yaml}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            potentialSavings: { type: Type.STRING },
            findings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["severity", "title", "description", "suggestion"]
              }
            },
            optimizedYaml: { type: Type.STRING }
          },
          required: ["score", "potentialSavings", "findings", "optimizedYaml"]
        }
      }
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
