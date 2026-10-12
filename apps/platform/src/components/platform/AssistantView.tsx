import React, { useState } from 'react';
import { LocaleMode } from '../../types';
import { IconAssistant, IconArrowRight } from '../Icons';

interface AssistantViewProps {
  locale: LocaleMode;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{ source: string; docId: string; confidence: string }>;
  timestamp: string;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: isAr
        ? 'مرحباً بك في المساعد التنفيذي لمؤسستك. أنا مهيأ للإجابة عن أسئلة الأعمال استناداً حصراً إلى السجلات المحاسبية والبيانات المؤكدة في ERP مع توثيق السندات المصدرية ودون افتراضات.'
        : 'Welcome to your Executive Business Assistant. I answer leadership queries grounded strictly in verified ledger data and ERP records with verifiable evidence citations and zero hallucinations.',
      timestamp: '09:00'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedQueries = isAr
    ? [
        'ما هي أبرز حالات الهدر المالي التي تحتاج قراراً هذا الأسبوع؟',
        'هل يوجد تفاوت سعري غير مبرر في عقود توريد حديد التسليح؟',
        'ما هي المشاريع التي تواجه انحرافاً في التكلفة يتجاوز 100 ألف ريال؟'
      ]
    : [
        'What are the highest-impact financial leaks requiring action this week?',
        'Is there unexplainable price creep in structural steel procurement contracts?',
        'Which active projects have cost overruns exceeding 100,000 SAR?'
      ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputVal;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: '09:12'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsThinking(true);

    setTimeout(() => {
      let respText = isAr
        ? 'بناءً على فحص سجل المدفوعات في SAP S/4HANA: تم رصد صرف مكرر بقيمة 48,500 ريال تحت أمر الشراء PO-8921 بتاريخ 10 أكتوبر 2026. القرار الموصى به: تجميد الدفعة الثانية لحين استلام إشعار المطابقة من المورد.'
        : 'Based on SAP S/4HANA payment records: A duplicate payment pattern of 48,500 SAR was flagged under PO-8921 on Oct 10, 2026. Recommended action: freeze the second disbursement pending vendor credit reconciliation.';

      if (q.includes('حديد') || q.toLowerCase().includes('steel') || q.toLowerCase().includes('price')) {
        respText = isAr
          ? 'بناءً على عقود التوريد في دفتر الأستاذ: يظهر المورد "شركة التوريدات الهندسية الكبرى" تزايداً سعرياً بنسبة +16.5% مقارنة بأسعار العقد الأساسي CTR-04، مع أثر مالي تقديري يبلغ 84,000 ريال.'
          : 'Based on procurement ledgers: Vendor "Global Engineering Supplies Co." shows an uncontracted price creep of +16.5% vs baseline contract CTR-04, totaling approximately 84,000 SAR in variance.';
      }

      const botMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: respText,
        citations: [
          { source: 'SAP S/4HANA (GL-4029)', docId: 'INV-8840', confidence: '99.4%' },
          { source: 'Contract Repository', docId: 'CTR-04-V2', confidence: '96.8%' }
        ],
        timestamp: '09:12'
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 1000);
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
              ? 'استجواب فوري لبيانات المؤسسة باللغة الطبيعية مع إسناد قاطع وموثق لكل نتيجة، دون أي اختلاق للمعلومات.'
              : 'Natural-language queries against enterprise data with verifiable accounting citations and strictly zero hallucinations.'}
          </p>
        </div>

        <div className="kpi-micro-badge">
          <span className="label">{isAr ? 'وضع الاستجواب' : 'Query Mode'}</span>
          <span className="value">{isAr ? 'أدلة محاسبية قطعية' : 'Strict Deterministic'}</span>
        </div>
      </div>

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
      <div className="chat-thread-container" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.sender === 'user' ? 'var(--accent-base)' : 'var(--bg-surface-elevated)',
              color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '10px', opacity: 0.8 }}>
              <strong>{m.sender === 'user' ? (isAr ? 'أنت (القيادة)' : 'You (Executive)') : (isAr ? 'المساعد التنفيذي' : 'MIKHLAFI Executive Assistant')}</strong>
              <span>{m.timestamp}</span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>{m.text}</p>

            {/* Verifiable Evidence Citations */}
            {m.citations && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--accent-light)', fontWeight: 700 }}>
                  {isAr ? '📎 السندات المحاسبية الموثقة:' : '📎 Verifiable Ledger Citations:'}
                </span>
                {m.citations.map((c, ci) => (
                  <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--status-success)' }} />
                    <span>{c.source} &bull; Ref: <strong>{c.docId}</strong> &bull; {isAr ? 'نسبة التطابق:' : 'Match:'} {c.confidence}</span>
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
          placeholder={isAr ? 'اطرح سؤالاً على بيانات المؤسسة (مثال: هل توجد فواتير مكررة معلقة؟)...' : 'Ask an evidence-based question about your business records...'}
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
          className="btn-primary"
          style={{ padding: '0 20px', fontSize: '13px' }}
        >
          <span>{isAr ? 'إرسال الاستفسار' : 'Submit Query'}</span>
          <IconArrowRight size={14} />
        </button>
      </form>
    </div>
  );
};
