// MIKHLAFI LABS — Interactive Lab Notice
// Attached to the deterministic engine workbenches. These tools run real algorithms,
// but they run them over curated sample datasets so the behaviour can be inspected
// before any data is connected. The notice states that plainly, in both locales,
// so a sample result is never mistaken for an organisation's own records.

import React from 'react';
import { LocaleMode } from '../../types';
import { IconDatabase } from '../Icons';

interface SandboxNoticeProps {
  locale: LocaleMode;
  /**
   * 'app' — shown inside a signed-in workspace, where a visitor may otherwise
   * assume the listed records belong to their organisation.
   * 'public' — shown on the marketing site, where no data is connected at all.
   */
  variant?: 'app' | 'public';
}

export const SandboxNotice: React.FC<SandboxNoticeProps> = ({ locale, variant = 'app' }) => {
  const isAr = locale === 'ar';

  const copy = variant === 'public'
    ? isAr
      ? 'مختبر تفاعلي — نُشغّل الخوارزمية الحتمية على بيانات نموذجية مُعدّة مسبقاً. لا يلزم إنشاء حساب، ولا تُرفع أي بيانات من جهازك.'
      : 'Interactive lab — the deterministic engine runs here over curated sample data. No account is required and nothing is uploaded from your device.'
    : isAr
      ? 'مختبر تفاعلي — البيانات المعروضة أدناه نموذجية توضّح سلوك المحرك، وليست سجلات مؤسستك. تُحلّل بيانات مؤسستك الفعلية في لوحة الاستخبارات بعد ربط مصدر البيانات.'
      : 'Interactive lab — the records below are a sample dataset that demonstrates how the engine behaves; they are not your organisation\'s records. Your own data is analysed on the intelligence board once a source is connected.';

  return (
    <div
      role="note"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '11px 16px',
        background: 'var(--accent-subtle)',
        borderBottom: '1px solid var(--border-glow)',
        color: 'var(--text-secondary)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          width: '18px',
          height: '18px',
          marginTop: '1px',
          color: 'var(--accent-light)'
        }}
      >
        <IconDatabase size={16} />
      </span>

      <span style={{ fontSize: '12.5px', lineHeight: 1.65 }}>{copy}</span>

      <span
        style={{
          marginInlineStart: 'auto',
          flexShrink: 0,
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.09em',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-light)',
          whiteSpace: 'nowrap',
          paddingTop: '2px'
        }}
      >
        {isAr ? 'بيانات نموذجية' : 'SAMPLE DATA'}
      </span>
    </div>
  );
};
