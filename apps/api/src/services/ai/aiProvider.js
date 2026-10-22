// MIKHLAFI LABS — Provider-Independent AI Architecture
// Pluggable AI engine supporting Groq LPU inference, local Ollama/vLLM, Google Gemini, and offline deterministic heuristics

export class BaseAIProvider {
  constructor(config = {}) {
    this.name = 'base';
    this.config = config;
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    throw new Error('Method generate must be implemented by provider.');
  }

  getUsageStats() {
    return { tokensUsed: 0, estimatedCostUSD: 0 };
  }
}

/**
 * 1. Local Deterministic Provider (Default fallback)
 * 100% offline, zero-cost, runs on any CPU, and guarantees factual mathematical accuracy without hallucination.
 */
export class LocalDeterministicProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'local-deterministic';
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    return {
      provider: this.name,
      model: 'mikhlafi-causal-v1-offline',
      isLocal: true,
      text: null // Handled directly by evidence synthesizer in assistantEngine.js
    };
  }
}

/**
 * 2. Local Ollama / vLLM HTTP Provider
 * Connects to a locally hosted LLM (e.g. Llama 3, Qwen 2.5, Mistral) via private network.
 */
export class LocalOllamaProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'ollama';
    this.endpoint = config.endpoint || process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434/api/generate';
    this.model = config.model || process.env.OLLAMA_MODEL || 'qwen2.5:7b';
    this.timeoutMs = parseInt(config.timeoutMs || process.env.AI_TIMEOUT_MS || '15000', 10);
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: systemPrompt,
          stream: false,
          options: { temperature: 0.1, top_p: 0.9 }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Ollama returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        provider: this.name,
        model: this.model,
        isLocal: true,
        text: data.response
      };
    } catch (err) {
      console.warn(`[Local Ollama Provider Fallback]: ${err.message}. Reverting to deterministic engine.`);
      return {
        provider: 'fallback-deterministic',
        model: 'mikhlafi-causal-v1-offline',
        isLocal: true,
        text: null,
        fallbackReason: err.message
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

/**
 * 3. Groq Ultra-Fast Cloud Inference Provider
 * Sub-second inference powered by Groq LPUs.
 * Defaults to 'allam-2-7b' (SDAIA Arabic Foundation Model) for Arabic executive reasoning,
 * and 'qwen/qwen3.8-27b' for English/multilingual.
 */
export class GroqApiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'groq';
    this.apiKey = config.apiKey || process.env.GROQ_API_KEY || '';
    this.modelArabic = config.modelArabic || process.env.GROQ_MODEL_AR || 'openai/gpt-oss-120b';
    this.modelEnglish = config.modelEnglish || process.env.GROQ_MODEL_EN || 'openai/gpt-oss-120b';
    this.defaultModel = config.model || process.env.GROQ_MODEL || null;
    this.endpoint = config.endpoint || 'https://api.groq.com/openai/v1/chat/completions';
    this.timeoutMs = parseInt(config.timeoutMs || process.env.AI_TIMEOUT_MS || '45000', 10);
  }

  async _callGroq(modelName, messages, timeoutMs = 30000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages,
          temperature: 0.25,
          max_completion_tokens: 1200
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new Error('Groq API returned an empty completion.');
      }

      return {
        provider: 'groq',
        model: modelName,
        isLocal: false,
        text: generatedText.trim(),
        usage: data.usage
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    if (!this.apiKey) {
      return {
        provider: 'fallback-deterministic',
        model: 'mikhlafi-causal-v1-offline',
        isLocal: true,
        text: null,
        fallbackReason: 'No GROQ_API_KEY configured'
      };
    }

    const isArabic = locale === 'ar' || /[\u0600-\u06FF]/.test(prompt);
    const selectedModel = this.defaultModel || (isArabic ? this.modelArabic : this.modelEnglish);

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      return await this._callGroq(selectedModel, messages, this.timeoutMs);
    } catch (err) {
      console.warn(`[Groq Primary Model (${selectedModel}) Error]: ${err.message}. Retrying with fast secondary model...`);
      try {
        return await this._callGroq('openai/gpt-oss-20b', messages, 25000);
      } catch (err2) {
        console.warn(`[Groq AI Provider Warning]: ${err2.message}. Falling back to deterministic engine.`);
        return {
          provider: 'fallback-deterministic',
          model: 'mikhlafi-causal-v1-offline',
          isLocal: true,
          text: null,
          fallbackReason: err2.message
        };
      }
    }
  }
}

/**
 * 4. External API Provider (Google Gemini API)
 * Directly integrates with Gemini models when GEMINI_API_KEY or AI_EXTERNAL_API_KEY is configured.
 */
export class ExternalApiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'external-gemini';
    this.apiKey = process.env.GEMINI_API_KEY || process.env.AI_EXTERNAL_API_KEY || '';
    this.model = process.env.AI_EXTERNAL_MODEL || 'gemini-1.5-flash';
    this.monthlyBudgetUSD = parseFloat(process.env.AI_MONTHLY_BUDGET_USD || '50.00');
    this.tokensUsed = 0;
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    if (!this.apiKey) {
      return {
        provider: 'fallback-deterministic',
        model: 'mikhlafi-causal-v1-offline',
        isLocal: true,
        text: null,
        fallbackReason: 'No GEMINI_API_KEY configured'
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser Question:\n${prompt}` : prompt;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: fullPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048
          }
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('Gemini API returned an empty response.');
      }

      return {
        provider: 'google-gemini',
        model: this.model,
        isLocal: false,
        text: generatedText
      };
    } catch (err) {
      console.warn(`[Gemini API Warning]: ${err.message}. Falling back to deterministic engine.`);
      return {
        provider: 'fallback-deterministic',
        model: 'mikhlafi-causal-v1-offline',
        isLocal: true,
        text: null,
        fallbackReason: err.message
      };
    }
  }
}

/**
 * Factory to instantiate the active AI Provider based on configuration.
 * Prioritizes Groq when GROQ_API_KEY is configured.
 */
export function getAIProvider() {
  const groqApiKey = process.env.GROQ_API_KEY || '';
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_EXTERNAL_API_KEY;
  const explicitProvider = (process.env.AI_PROVIDER || '').toLowerCase();

  if (explicitProvider === 'ollama') {
    return new LocalOllamaProvider();
  }
  if (explicitProvider === 'gemini' || (explicitProvider === 'external' && geminiApiKey && !groqApiKey)) {
    return new ExternalApiProvider();
  }
  if (explicitProvider === 'deterministic') {
    return new LocalDeterministicProvider();
  }
  // Default to Groq if key is present (user's explicit preference)
  if (groqApiKey) {
    return new GroqApiProvider({ apiKey: groqApiKey });
  }
  if (geminiApiKey) {
    return new ExternalApiProvider();
  }
  return new LocalDeterministicProvider();
}
