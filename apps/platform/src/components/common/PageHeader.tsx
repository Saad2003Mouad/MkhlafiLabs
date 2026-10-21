// MIKHLAFI LABS — Shared Page Header
// Consistent header block used across all protected workspace views.

import React from 'react';

interface PageHeaderProps {
  locale: 'ar' | 'en';
  icon?: React.ReactNode;
  breadcrumb?: string[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  locale,
  icon,
  breadcrumb,
  title,
  subtitle,
  action
}) => {
  const isAr = locale === 'ar';

  return (
    <header className="page-header">
      <div className="page-header__main">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="page-breadcrumb" aria-label={isAr ? 'مسار التنقل' : 'Breadcrumb'}>
            {breadcrumb.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <span>{crumb}</span>
                <span className="page-breadcrumb__sep" aria-hidden="true">/</span>
              </React.Fragment>
            ))}
            <span className="current">{title}</span>
          </nav>
        )}
        <h1 className="page-title">
          {icon && <span className="page-title__icon">{icon}</span>}
          <span>{title}</span>
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </header>
  );
};
