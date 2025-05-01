import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { marked } from 'marked';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text || '';
  }

  async generateHtml(prompt: string) {
    const rules = `
You are a Markdown generator. Your task is to produce output that is fully formatted in GitHub-flavored Markdown.

Requirements:
- No extra text or explanation.
- The response must be valid Markdown.
- Start immediately with Markdown syntax.

Here is the content I want to format:
${prompt}
`;
    const markdown = await this.generateText(rules);
    const html = await marked.parse(markdown);
    return { html };
  }
}
