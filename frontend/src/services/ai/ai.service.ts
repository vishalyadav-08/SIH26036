import { PageContext } from '@/hooks/useMapanSetuContext';

export interface ChatSource {
  documentId: string;
  title: string;
  source: string;
  authority: string;
  category?: string;
  jurisdiction?: string;
  section?: string;
  page?: string;
  relevanceScore?: number;
  sourceUrl?: string;
}

export interface ChatAction {
  label: string;
  route: string;
  actionId?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: PageContext;
}

export interface ChatResponse {
  conversationId: string;
  answer: string;
  sources: ChatSource[];
  suggestedActions: ChatAction[];
}

export class AIService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`AI service error: ${res.statusText}`);
    }

    return res.json();
  }
}

export const aiService = new AIService();
