import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconAssistant, IconArrowRight } from '../Icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ExecutiveAssistantWorkbench } from '../assistant/ExecutiveAssistantWorkbench';

interface AssistantViewProps {
  locale: LocaleMode;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{ source: string; docId: string; confidence: string }>;
  timestamp: string;
  isDemo?: boolean;
  isError?: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const { isAuthenticated, tenant } = useAuth();
  const [viewMode, setViewMode] = useState<'workbench' | 'chat'>('workbench');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: isAr
        ? 'مرحباً بك في المساعد التنفيذي لمؤسستك. أنا مهيأ للإجابة عن أسئلة الأعمال استناداً حصراً إلى السجلات المحاسبية والبيانات المؤكدة في قاعدة البيانات مع توثيق السندات المصدرية.'
        : 'Welcome to your Executive Business Assistant. I answer leadership queries grounded strictly in verified ledger data and ERP records with verifiable evidence citations.',
      timestamp: '09:00',
      isDemo: !isAuthenticated
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQueries = isAr
    ? [
        'ما هي أبرز حالات الهدر المالي التي تحتاج قراراً هذا الأسبوع؟',
        'هل يوجد تفاوت سعري غير مبرر في عقود الموردين؟',
        'ما هي المشاريع التي تواجه انحرافاً في التكلفة يتجاوز 100 ألف ريال؟',
        'أعطني ملخصاً تنفيذياً شاملاً لجميع محركات الذكاء'
      ]
    : [
        'What are the highest-impact financial leaks requiring action this week?',
        'Is there unexplainable price creep in supplier contracts?',
        'Which active projects have cost overruns exceeding 100,000 SAR?',
        'Provide an executive summary across all intelligence engines'
      ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputVal;
    if (!q.trim()) return;

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

    if (isAuthenticated) {
      try {
        const res = await api.askAssistant(q, locale);
        const botMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: res.response,
          citations: res.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDemo: false
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        // CRITICAL: Never fake a response for authenticated users — show real error
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: isAr
            ? `⚠️ تعذّر الاتصال بمحرك الذكاء: ${err.message || 'خطأ في الشبكة'}. يرجى التحقق من اتصال API والمحاولة مجدداً.`
            : `⚠️ Assistant engine connection failed: ${err.message || 'Network error'}. Please verify API connectivity and retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsThinking(false);
      }
      return;
    }

    // Demo simulation for unauthenticated visitors — clearly labeled
    setTimeout(() => {
      let respText = isAr
        ? '[وضع المعاينة التجريبية — ليست بيانات حقيقية] بناءً على بيانات نموذجية: تم محاكاة رصد صرف مكرر بقيمة 48,500 ريال تحت أمر الشراء PO-8921. للحصول على تحليل حقيقي لبيانات مؤسستك، سجّل دخولك وارفع قيودك المحاسبية عبر CSV.'
        : '[Preview Simulation — NOT real data] Based on sample fixtures: A simulated duplicate payment of 48,500 SAR was detected under PO-8921. For real analysis of your own data, sign in and ingest your ledger records via CSV.';

      if (q.includes('مورد') || q.includes('حديد') || q.toLowerCase().includes('steel') || q.toLowerCase().includes('price') || q.toLowerCase().includes('supplier')) {
        respText = isAr
          ? '[وضع المعاينة التجريبية — ليست بيانات حقيقية] بناءً على بيانات نموذجية: يظهر مورد نموذجي تزايداً سعرياً بنسبة +16.5% مقارنة بأسعار العقد الأساسي. للتحليل الحقيقي، سجّل دخولك وارفع عقودك وفواتيرك الفعلية.'
          : '[Preview Simulation — NOT real data] Based on sample fixtures: A sample vendor shows a +16.5% price creep vs baseline contract. For real analysis, sign in and upload your actual contracts and invoices.';
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: respText,
        citations: [
          { source: isAr ? 'بيانات توضيحية فقط (غير حقيقية)' : 'Sample Fixture Data (NOT real)', docId: 'DEMO-ONLY', confidence: 'N/A — simulation' }
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isDemo: true
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 900);
  };

  return (
    <div className="platform-page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-breadcrumb">
            <span>{isAr ? 'المنصة' : 'Platform'}</span>
            <span>/</span>
            <span>{isAr ? 'محركات الذكاء' : 'Intelligence Suite'}</span>
            <span>/</span>
            <span className="current">{isAr ? 'المساعد التنفيذي الذكي' : 'AI Executive Assistant'}</span>
          </div>
          <h1 className="page-title">
            <IconAssistant size={24} />
            <span>{isAr ? 'المساعد التنفيذي المدعوم بالأدلة المحاسبية' : 'Evidence-Grounded Executive Assistant'}</span>
          </h1>
          <p className="page-subtitle">
            {isAr
              ? 'استجواب فوري لبيانات المؤسسة باللغة الطبيعية مع إسناد قاطع وموثق لكل نتيجة.'
              : 'Natural-language queries against enterprise data with verifiable accounting citations.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'وضع التشغيل' : 'Engine Mode'}</span>
          <span className="value" style={{ color: isAuthenticated ? 'var(--status-success)' : 'var(--status-warning)' }}>
            {isAuthenticated
              ? (isAr ? `● حي — ${tenant?.orgNameAr || tenant?.orgNameEn}` : `● Live — ${tenant?.orgNameEn}`)
              : (isAr ? '◌ معاينة تجريبية' : '◌ Preview Simulation')}
          </span>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', margin: '14px 0 20px 0', overflowX: 'auto' }}>
        <button
          onClick={() => setViewMode('workbench')}
          className={`ctrl-btn ${viewMode === 'workbench' ? 'active' : ''}`}
          style={{
            fontWeight: viewMode === 'workbench' ? 800 : 500,
            background: viewMode === 'workbench' ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(79, 70, 229, 0.15))' : undefined,
            borderColor: viewMode === 'workbench' ? '#6366F1' : undefined,
            color: viewMode === 'workbench' ? '#818CF8' : undefined
          }}
        >
          {isAr ? '🔬 منصة الاستجواب السيادي والأدلة الحسابية (Workbench)' : '🔬 Sovereign AI Assistant Workbench'}
        </button>
        <button
          onClick={() => setViewMode('chat')}
          className={`ctrl-btn ${viewMode === 'chat' ? 'active' : ''}`}
          style={{ fontWeight: viewMode === 'chat' ? 700 : 500 }}
        >
          {isAr ? '💬 المحادثة والاستجواب المباشر (Chat Console)' : '💬 Conversational Chat Console'}
        </button>
      </div>

      {viewMode === 'workbench' ? (
        <ExecutiveAssistantWorkbench
          locale={locale}
          initialScenario="conglomerate_holding"
        />
      ) : (
        <>
      {/* CRITICAL: Mode Disclaimer Banner for unauthenticated visitors */}
      {!isAuthenticated && (
        <div className="honest-alert" style={{ marginBottom: '14px', borderColor: 'var(--status-warning)', background: 'rgba(245, 158, 11, 0.08)' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: 'var(--status-warning)' }}>
              {isAr ? 'وضع المعاينة التجريبية — البيانات ليست حقيقية:' : 'Preview Simulation Mode — Data is NOT real:'}
            </strong>{' '}
            {isAr
              ? 'الردود المعروضة أدناه هي محاكاة توضيحية فقط، وليست استناداً لبيانات فعلية من مؤسستك. للحصول على تحليل حقيقي، سجّل الدخول وارفع قيودك المحاسبية.'
              : 'Responses shown below are demonstration simulations only, not real data analysis from your organization. To query your actual business records, sign in and upload your ledger data.'}
          </div>
        </div>
      )}

      {/* Suggested Query Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '14px 0' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 600 }}>
          {isAr ? 'استفسارات مقترحة:' : 'Quick Queries:'}
        </span>
        {suggestedQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="filter-chip"
            style={{ fontSize: '11px', padding: '5px 10px', background: 'var(--bg-surface-elevated)' }}
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Chat Thread Box */}
      <div
        className="chat-thread-container"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          minHeight: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.isError
                ? 'rgba(239, 68, 68, 0.1)'
                : m.sender === 'user'
                  ? 'var(--accent-base)'
                  : 'var(--bg-surface-elevated)',
              color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: m.isError
                ? '1px solid var(--status-danger)'
                : m.isDemo && m.sender === 'assistant'
                  ? '1px solid rgba(245,158,11,0.35)'
                  : m.sender === 'user'
                    ? 'none'
                    : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '10px', opacity: 0.8 }}>
              <strong>
                {m.sender === 'user'
                  ? (isAr ? 'أنت (القيادة)' : 'You (Executive)')
                  : m.isDemo
                    ? (isAr ? '🔶 محاكاة تجريبية — ليست بيانات حقيقية' : '🔶 Preview Simulation — NOT real data')
                    : m.isError
                      ? (isAr ? '⚠️ خطأ في المحرك' : '⚠️ Engine Error')
                      : (isAr ? '🟢 المساعد التنفيذي (حي — بياناتك الفعلية)' : '🟢 Executive Assistant (Live — your real data)')}
              </strong>
              <span>{m.timestamp}</span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{m.text}</p>

            {m.citations && m.citations.length > 0 && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: m.isDemo ? 'var(--status-warning)' : 'var(--accent-light)', fontWeight: 700 }}>
                  {m.isDemo
                    ? (isAr ? '⚠️ بيانات توضيحية فقط — غير مرتبطة بمؤسستك:' : '⚠️ Sample Fixture Data — NOT from your organization:')
                    : (isAr ? '📎 السندات المحاسبية الموثقة من قاعدة البيانات:' : '📎 Verifiable Ledger Citations:')}
                </span>
                {m.citations.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: m.isDemo ? 'var(--status-warning)' : 'var(--status-success)' }} />
                    <span>{c.source} • Ref: <strong>{c.docId}</strong> • {isAr ? 'التطابق:' : 'Match:'} {c.confidence}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span>{isAr ? 'جارِ فحص وتدقيق القيود المحاسبية...' : 'Auditing ledger records...'}</span>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '10px', marginTop: '14px' }}
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isAr ? 'اطرح سؤالاً على بيانات المؤسسة...' : 'Ask an evidence-based question about your business records...'}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={isThinking}
          className="btn-primary"
          style={{ padding: '0 20px', fontSize: '13px' }}
        >
          <span>{isAr ? 'إرسال الاستفسار' : 'Submit Query'}</span>
          <IconArrowRight size={14} />
        </button>
      </form>
      </>
      )}
    </div>
  );
};
