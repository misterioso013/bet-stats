import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

interface GeminiAnalysis {
  recommendation: string;
  confidence: number;
  reasoning: string;
  suggestedBet: {
    color: 'red' | 'black' | 'white';
    amount: number;
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  
  initialize(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzePattern(results: Array<{color: string, number: number}>) {
    if (!this.genAI) {
      throw new Error('Gemini API não inicializada. Use initialize() primeiro.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recommendation: {
              type: SchemaType.STRING,
              description: "Recomendação geral sobre a próxima jogada"
            },
            confidence: {
              type: SchemaType.NUMBER,
              description: "Nível de confiança na análise (0-100)"
            },
            reasoning: {
              type: SchemaType.STRING,
              description: "Explicação detalhada do raciocínio"
            },
            suggestedBet: {
              type: SchemaType.OBJECT,
              properties: {
                color: {
                  type: SchemaType.STRING,
                  enum: ["red", "black", "white"],
                  description: "Cor sugerida para apostar"
                },
                amount: {
                  type: SchemaType.NUMBER,
                  description: "Valor sugerido para apostar em R$"
                }
              },
              required: ["color", "amount"]
            }
          },
          required: ["recommendation", "confidence", "reasoning", "suggestedBet"]
        }
      }
    });

    const prompt = `
    Analise os últimos resultados do Blaze Double e forneça uma análise detalhada:
    
    Últimos resultados: ${JSON.stringify(results)}
    
    Considere:
    1. Padrões de cores
    2. Frequência de números
    3. Sequências
    4. Probabilidades estatísticas
    
    Forneça uma análise completa com recomendação de aposta.
    `;

    try {
      const result = await model.generateContent(prompt);
      const analysis = JSON.parse(result.response.text()) as GeminiAnalysis;
      return analysis;
    } catch (error) {
      console.error('Erro na análise do Gemini:', error);
      throw error;
    }
  }

  async chat(message: string, results: Array<{color: string, number: number}>) {
    if (!this.genAI) {
      throw new Error('Gemini API não inicializada. Use initialize() primeiro.');
    }

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
    Como assistente especializado em análise de jogos, responda à seguinte pergunta 
    considerando os últimos resultados do Blaze Double:

    Últimos resultados: ${JSON.stringify(results)}

    Pergunta do usuário: ${message}

    Responda de forma clara e profissional, focando em análise estatística e padrões.
    Evite promessas de ganhos e mantenha um tom responsável.
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Erro no chat Gemini:', error);
      throw error;
    }
  }

  async generateStrategy(results: Array<{color: string, number: number}>) {
    if (!this.genAI) {
      throw new Error('Gemini API não inicializada. Use initialize() primeiro.');
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: "Nome da estratégia"
            },
            pattern: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
                enum: ["red", "black", "white"],
              },
              description: "Padrão de cores para identificar (máximo 10 cores)"
            },
            betConfig: {
              type: SchemaType.OBJECT,
              properties: {
                targetColor: {
                  type: SchemaType.STRING,
                  enum: ["red", "black", "white"],
                  description: "Cor para apostar quando encontrar o padrão"
                },
                initialAmount: {
                  type: SchemaType.NUMBER,
                  description: "Valor inicial da aposta em R$"
                },
                martingale: {
                  type: SchemaType.NUMBER,
                  description: "Número máximo de martingales"
                }
              },
              required: ["targetColor", "initialAmount", "martingale"]
            }
          },
          required: ["name", "pattern", "betConfig"]
        }
      }
    });

    const prompt = `
    Analise os últimos resultados do Blaze Double e crie uma estratégia otimizada:
    
    Últimos resultados: ${JSON.stringify(results)}
    
    Considere:
    1. Padrões recorrentes
    2. Probabilidades estatísticas
    3. Gerenciamento de risco
    4. Máximo de 10 cores no padrão
    5. Valor inicial realista (entre 2 e 10 reais)
    6. Máximo de 3 martingales
    
    Crie uma estratégia completa com nome descritivo e configurações.
    `;

    try {
      const result = await model.generateContent(prompt);
      return JSON.parse(result.response.text());
    } catch (error) {
      console.error('Erro ao gerar estratégia:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService(); 