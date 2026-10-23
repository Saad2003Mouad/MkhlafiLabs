// MIKHLAFI LABS — Evidence-Grounded Executive Assistant
// Chat responses are produced exclusively by api.askAssistant against live tenant data.
// No answer is ever simulated, cached from fixtures, or fabricated.

import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconAssistant, IconArrowRight, IconRisk, IconShield } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { EmptyState } from '../common/EmptyState';
import { PageHeader } from '../common/PageHeader';

interface AssistantViewProps {
  locale: LocaleMode;
}

interface AssistantCitation {
  source: string;
  docId: string;
  confidence: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: AssistantCitation[];
  providerLabel?: string;
  timestamp: string;
  isError?: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant, openAuthModal } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Load sovereign persona & executive powers configuration
  const [personaConfig] = useState<{
    name: string;
    tone: 'witty_human' | 'strict_executive' | 'forensic_auditor';
    permissions: {
      canFreezeDisbursements: boolean;
      canGenerateReports: boolean;
      canDraftDecisions: boolean;
      canSimulateScenarios: boolean;
      canScanLedger: boolean;
    };
    customDirectives: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('mikhlafi_ai_assistant_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'فطين',
      tone: 'witty_human',
      permissions: {
        canFreezeDisbursements: true,
        canGenerateReports: true,
        canDraftDecisions: true,
        canSimulateScenarios: true,
        canScanLedger: true
      },
      customDirectives: ''
    };
  });

  const assistantName = personaConfig.name || (isAr ? 'فطين' : 'Fatin');

  const suggestedQueries = isAr
    ? [
        `من أنت وما هي صلاحياتك يا ${assistantName}؟`,
        'أعد لي تقريراً جنائياً شاملاً ومفصلاً عن التدقيق المالي للمؤسسة',
        'قم بمحاكاة سيناريو انخفاض الإيرادات بنسبة 15% وتأخر التحصيل 45 يوماً',
        'افحص قيود الصرف وجمد أي أمر دفع مشبوه أو مخالف للمطابقة',
        'أعطني ملخصاً تنفيذياً لمجلس الإدارة حول السيولة والمخاطر'
      ]
    : [
        `Who are you and what are your powers, ${assistantName}?`,
        'Generate a comprehensive forensic audit report on our organizational finances',
        'Simulate a what-if scenario: 15% revenue drop and 45-day collection delay',
        'Audit disbursement orders and freeze any suspicious high-risk payments',
        'Provide an executive summary for the board regarding cashflow and solvency'
      ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q || isThinking) return;

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsThinking(true);

    try {
      const res = await api.askAssistant(q, locale, personaConfig);
      const providerLabel = res.aiProvider
        ? `${res.aiProvider.name}${res.aiProvider.isLocal ? ` — ${res.aiProvider.sovereignty}` : ''}`
        : undefined;
      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.response,
        citations: Array.isArray(res.citations) ? res.citations : [],
        providerLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      // Never fabricate an answer on failure — surface the real error.
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: isAr
          ? `تعذّر الوصول إلى محرك المساعد (${assistantName}): ${err.message || 'خطأ في الشبكة'}. لم يتم توليد أي إجابة.`
          : `The assistant engine (${assistantName}) could not be reached: ${err.message || 'Network error'}. No answer was generated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const getToneLabel = () => {
    if (personaConfig.tone === 'witty_human') return isAr ? '😊 مرح وبشري ذكي' : '😊 Witty & Human';
    if (personaConfig.tone === 'strict_executive') return isAr ? '⚡ تنفيذي حاسم' : '⚡ Strict Executive';
    return isAr ? '🔍 مدقق جنائي صارم' : '🔍 Forensic Auditor';
  };

  return (
    <div className="platform-page-container">
      <PageHeader
        locale={locale}
        icon={<IconAssistant size={22} />}
        breadcrumb={[isAr ? 'المنصة' : 'Platform', isAr ? 'محركات الذكاء' : 'Intelligence Suite']}
        title={isAr ? `المساعد التنفيذي: ${assistantName}` : `Executive Copilot: ${assistantName}`}
        subtitle={
          isAr
            ? `استجواب فوري لبيانات مؤسستك بلغة طبيعية مع المساعد (${assistantName}). يتميز بصلاحيات تنفيذية في التجميد، وإعداد التقارير، والمحاكاة المالية.`
            : `Natural-language interrogation with your sovereign copilot (${assistantName}). Equipped with autonomous powers for disbursement holds, forensic reports, and what-if simulations.`
        }
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              className="ml-badge"
              style={{
                background: 'rgba(13, 148, 136, 0.15)',
                color: '#0d9488',
                borderColor: 'rgba(13, 148, 136, 0.3)',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600
              }}
            >
              {getToneLabel()}
            </span>
            <div className="kpi-micro-badge">
              <span className="label">{isAr ? 'وضع الاتصال' : 'Connection Mode'}</span>
              <span className="value" style={{ color: isAuthenticated ? 'var(--status-success)' : 'var(--text-tertiary)' }}>
                {isAuthenticated
                  ? (isAr ? `حيّ — ${tenant?.orgNameAr || tenant?.orgNameEn}` : `Live — ${tenant?.orgNameEn}`)
                  : (isAr ? 'يتطلب تسجيل دخول' : 'Sign-in required')}
              </span>
            </div>
          </div>
        }
      />

      {!isAuthenticated ? (
            <EmptyState
              icon={<IconAssistant size={30} />}
              title={isAr ? 'سجّل الدخول لاستخدام المساعد التنفيذي' : 'Sign in to use the executive assistant'}
              description={
                isAr
                  ? 'يُستخدم المساعد لاستجواب بيانات مؤسستك الحية حصرياً. بعد تسجيل الدخول ستتمكن من طرح الأسئلة والحصول على إجابات موثقة بسجلاتك الفعلية.'
                  : 'The assistant interrogates your organization’s live data exclusively. After signing in you can ask questions and receive answers grounded in your actual records.'
              }
              action={
                <button onClick={openAuthModal} className="ml-btn ml-btn--primary">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </button>
              }
            />
          ) : (
            <>
              {/* Suggested Queries */}
              {messages.length === 0 && (
                <div className="vb-suggest-row">
                  <span className="vb-suggest-label">{isAr ? 'استفسارات مقترحة:' : 'Suggested queries:'}</span>
                  {suggestedQueries.map((sq, i) => (
                    <button key={i} onClick={() => handleSend(sq)} className="filter-chip">
                      {sq}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Thread */}
              {messages.length === 0 && !isThinking ? (
                <EmptyState
                  icon={<IconAssistant size={32} />}
                  title={isAr ? `المساعد الذكي (${assistantName}) جاهز لخدمتك` : `${assistantName} is ready`}
                  description={
                    isAr
                      ? `اطرح أي استفسار مالي أو محاسبي، أو اطلب تقريراً شاملاً، أو محاكاة سيناريو، أو فحص وتجميد أوامر الصرف. يعمل المساعد بنبرة (${getToneLabel()}) وبصلاحيات تنفيذية كاملة.`
                      : `Ask any financial question, request forensic reports, simulate what-if scenarios, or audit disbursements. Operating in (${getToneLabel()}) mode with autonomous powers.`
                  }
                />
              ) : (
                <div className="vb-chat-thread" aria-live="polite">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`vb-msg ${m.sender === 'user' ? 'vb-msg--user' : m.isError ? 'vb-msg--error' : 'vb-msg--assistant'}`}
                    >
                      <div className="vb-msg__head">
                        <strong>
                          {m.sender === 'user'
                            ? (isAr ? 'أنت (القيادة)' : 'You (Executive)')
                            : m.isError
                              ? (isAr ? 'خطأ في المحرك' : 'Engine Error')
                              : `${assistantName} (${isAr ? 'المساعد الذكي' : 'Executive Copilot'})`}
                        </strong>
                        {m.providerLabel && (
                          <span className="vb-msg__provider">
                            <IconShield size={11} />
                            {m.providerLabel}
                          </span>
                        )}
                        <span className="vb-msg__time">{m.timestamp}</span>
                      </div>

                      <p className="vb-msg__text">{m.text}</p>

                      {m.citations && m.citations.length > 0 && (
                        <div className="vb-citations">
                          <span className="vb-citations__label">
                            {isAr ? 'السندات المصدرية:' : 'Source Citations:'}
                          </span>
                          {m.citations.map((c, ci) => (
                            <div key={ci} className="vb-citation">
                              <span className="ml-dot" style={{ color: 'var(--status-success)' }} />
                              <span>
                                {c.source} · {isAr ? 'المرجع:' : 'Ref:'} <strong className="ml-mono">{c.docId}</strong> ·{' '}
                                {isAr ? 'التطابق:' : 'Match:'} {c.confidence}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isThinking && (
                    <div className="vb-msg vb-msg--assistant vb-msg--thinking">
                      <span className="vb-dot-pulse" aria-hidden="true" />
                      <span>{isAr ? 'جارِ استعلام بيانات مؤسستك...' : 'Querying your organization’s data...'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Query Input */}
              <form
                className="vb-chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    isAr
                      ? 'اطرح سؤالاً بلغة طبيعية عن بيانات مؤسستك...'
                      : 'Ask a natural-language question about your organization’s data...'
                  }
                  aria-label={isAr ? 'سؤال للمساعد التنفيذي' : 'Question for the executive assistant'}
                  className="ml-input vb-chat-input"
                />
                <button type="submit" disabled={isThinking || !inputVal.trim()} className="ml-btn ml-btn--primary">
                  <span>{isAr ? 'إرسال' : 'Send'}</span>
                  <IconArrowRight size={14} />
                </button>
              </form>

              <p className="vb-chat-hint">
                <IconRisk size={12} />
                {isAr
                  ? 'تُولَّد الإجابات من بيانات مؤسستك الحية فقط. عند فشل الطلب تظهر رسالة خطأ حقيقية دون أي إجابة بديلة مُختلقة.'
                  : 'Answers are generated only from your organization’s live data. If a request fails, a real error message is shown with no substitute answer.'}
              </p>
            </>
          )}
    </div>
  );
};
