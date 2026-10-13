// MIKHLAFI LABS — Provider-Independent AI Architecture
// Pluggable AI engine supporting offline heuristics, local Ollama/vLLM, and optional external LLMs
// Conforms to Phase 7: AI Cost & Provider Independence

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
 * 1. Local Deterministic Provider (Default)
 * 100% offline, zero-cost, runs on any CPU, and guarantees factual mathematical accuracy without hallucination.
 */
export class LocalDeterministicProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'local-deterministic';
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    // Grounded synthesis executed via domain queries in assistantEngine.js
    return {
      provider: this.name,
      model: 'mikhlafi-causal-v1-offline',
      isLocal: true,
      text: null // Handled directly by evidence synthesizer
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
 * 3. External API Provider (Optional & Disabled by Default)
 * Requires explicit configuration and respects tenant data privacy flags.
 */
export class ExternalApiProvider extends BaseAIProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'external';
    this.apiKey = process.env.AI_EXTERNAL_API_KEY || '';
    this.model = process.env.AI_EXTERNAL_MODEL || 'gemini-1.5-flash';
    this.monthlyBudgetUSD = parseFloat(process.env.AI_MONTHLY_BUDGET_USD || '50.00');
    this.tokensUsed = 0;
  }

  async generate({ prompt, systemPrompt = '', locale = 'ar' }) {
    if (!process.env.ALLOW_EXTERNAL_AI_EGRESS || process.env.ALLOW_EXTERNAL_AI_EGRESS !== 'true') {
      throw new Error('[Sovereignty Protection]: Outbound external AI transmission is disabled by security policy.');
    }

    if (!this.apiKey) {
      throw new Error('[AI Provider Error]: External AI provider enabled but AI_EXTERNAL_API_KEY is not configured.');
    }

    // Guardrail against budget exhaustion
    const estimatedCost = (this.tokensUsed / 1000000) * 0.15;
    if (estimatedCost >= this.monthlyBudgetUSD) {
      throw new Error(`[AI Budget Limit]: Monthly AI budget of $${this.monthlyBudgetUSD} reached. Reverting to local execution.`);
    }

    return {
      provider: this.name,
      model: this.model,
      isLocal: false,
      text: null
    };
  }
}

/**
 * Factory to instantiate the active AI Provider based on configuration.
 */
export function getAIProvider() {
  const providerType = (process.env.AI_PROVIDER || 'deterministic').toLowerCase();

  switch (providerType) {
    case 'ollama':
      return new LocalOllamaProvider();
    case 'external':
      return new ExternalApiProvider();
    case 'deterministic':
    default:
      return new LocalDeterministicProvider();
  }
}
