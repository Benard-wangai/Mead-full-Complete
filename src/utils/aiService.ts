// src/utils/aiService.ts
// Mead AI Service for Mead - The Global Luxury Super App
// Production-ready AI with exact personality, xAI integration, and elegant fallback

import { XAI_API_KEY } from './env';
import { meadLogger } from './logger';

class AiService {
  private static instance: AiService;

  private constructor() {}

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * Get AI Response with luxury personality
   */
  public async getResponse(userInput: string): Promise<string> {
    const input = userInput.toLowerCase().trim();

    // Exact Mead AI personality as requested
    if (input.includes('who are you') || input.includes('introduce yourself') || input.includes('what are you')) {
      return "I am Mead AI — the frontier intelligence powered by MEAD, Africa’s luxury app.\n\nI was built to be fast, truthful, witty, and unapologetically helpful.\n\nAsk me anything and I’ll give you the sharpest, most luxurious answer on Earth.\n\nWelcome to the future. Welcome to MEAD. 🖤✨";
    }

    // Try real xAI API first if configured
    try {
      if (XAI_API_KEY && !XAI_API_KEY.includes('my-xai') && XAI_API_KEY.length > 10) {
        const response = await this.callXAI(userInput);
        if (response) return response;
      }
    } catch (error) {
      meadLogger.warn('xAI API call failed, falling back to local personality', error);
    }

    // Luxury local fallback responses
    return this.getLocalResponse(userInput);
  }

  private async callXAI(prompt: string): Promise<string | null> {
    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${XAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "grok-beta",
          messages: [
            { 
              role: "system", 
              content: "You are Mead AI, a witty, truthful, and luxurious AI concierge for the Mead Super App. Always respond with elegance, helpfulness, and a touch of luxury." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.75,
          max_tokens: 600,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      meadLogger.error('xAI API call failed', error);
      return null;
    }
  }

  private getLocalResponse(input: string): string {
    const lower = input.toLowerCase();

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hello! It's a pleasure to see you. How can I make your day more luxurious today?";
    }

    if (lower.includes('weather')) {
      return "Currently in Nairobi: 24°C with clear skies. Perfect weather for a luxury drive or rooftop experience.";
    }

    if (lower.includes('recommend') || lower.includes('suggest')) {
      return "For a true luxury experience, I recommend the new Aman Nairobi or a private sunset flight over the Maasai Mara. Would you like me to arrange something?";
    }

    if (lower.includes('price') || lower.includes('cost')) {
      return "Our premium experiences range from $150 (exclusive Brew) to $15,000+ for private charters. What is your budget range?";
    }

    if (lower.includes('thank')) {
      return "You're most welcome. It's my pleasure to serve you.";
    }

    // Default elegant response
    return "That's a fascinating request. As your personal AI concierge, I'd be delighted to help you explore the finest experiences available. Could you tell me more about what you're looking for?";
  }
}

// Export singleton
export const aiService = AiService.getInstance();

export default aiService;