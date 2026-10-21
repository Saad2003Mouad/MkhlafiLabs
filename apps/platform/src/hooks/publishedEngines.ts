// MIKHLAFI LABS — Published engine index
//
// The website renders the engines from the operator-owned catalog in the
// database, so renaming, re-ordering or disabling an engine in the admin
// console is visible here immediately. The static catalog remains the fallback
// so a marketing page can never render empty if the API is unreachable.

import { useEffect, useState } from 'react';
import { SERVICES_CATALOG } from '../data/servicesData';
import { api, type PlatformService } from '../api/client';

export interface EngineView {
  id: string;
  engineNumber: string;
  titleAr: string;
  titleEn: string;
  taglineAr: string;
  taglineEn: string;
  /** Longer editorial description, used on directory cards. */
  heroDescriptionAr: string;
  heroDescriptionEn: string;
  badgeAr: string;
  badgeEn: string;
  iconName: string;
  accentColor: string;
}

const STATIC_BY_ID = new Map(SERVICES_CATALOG.map((engine) => [engine.id, engine]));

/** The static catalog, used until the live catalog arrives and if it never does. */
export const FALLBACK_ENGINES: EngineView[] = SERVICES_CATALOG.map((engine) => ({
  id: engine.id,
  engineNumber: engine.engineNumber,
  titleAr: engine.titleAr,
  titleEn: engine.titleEn,
  taglineAr: engine.taglineAr,
  taglineEn: engine.taglineEn,
  heroDescriptionAr: engine.heroDescriptionAr,
  heroDescriptionEn: engine.heroDescriptionEn,
  badgeAr: engine.badgeAr,
  badgeEn: engine.badgeEn,
  iconName: engine.iconName,
  accentColor: engine.accentColor
}));

/** Merge an operator-edited row over the static presentation metadata. */
function mergeService(row: PlatformService): EngineView {
  const meta = STATIC_BY_ID.get(row.id);
  const summaryAr = row.summary_ar?.trim();
  const summaryEn = row.summary_en?.trim();

  return {
    id: row.id,
    engineNumber: row.engine_number || meta?.engineNumber || '',
    titleAr: row.title_ar?.trim() || meta?.titleAr || row.title_en || row.id,
    titleEn: row.title_en?.trim() || meta?.titleEn || row.title_ar || row.id,
    taglineAr: summaryAr || meta?.taglineAr || '',
    taglineEn: summaryEn || meta?.taglineEn || '',
    heroDescriptionAr: summaryAr || meta?.heroDescriptionAr || '',
    heroDescriptionEn: summaryEn || meta?.heroDescriptionEn || '',
    badgeAr: row.badge_ar?.trim() || meta?.badgeAr || '',
    badgeEn: row.badge_en?.trim() || meta?.badgeEn || '',
    iconName: meta?.iconName || 'shield',
    accentColor: meta?.accentColor || 'var(--accent-base)'
  };
}

let cache: EngineView[] | null = null;
let inflight: Promise<EngineView[]> | null = null;

/**
 * Fetch the published index once per session and share the result. A failure
 * releases the in-flight promise so a later mount can retry, and resolves to
 * whatever we already have (or the static catalog) rather than rejecting.
 */
export function loadPublishedEngines(): Promise<EngineView[]> {
  if (inflight) return inflight;

  inflight = api
    .getPublishedServices()
    .then((response) => {
      const rows = Array.isArray(response.services) ? response.services : [];
      cache = rows.length > 0 ? rows.map(mergeService) : FALLBACK_ENGINES;
      return cache;
    })
    .catch(() => {
      inflight = null;
      return cache ?? FALLBACK_ENGINES;
    });

  return inflight;
}

/** Reactive access to the published engine index. */
export function usePublishedEngines(): EngineView[] {
  const [engines, setEngines] = useState<EngineView[]>(() => cache ?? FALLBACK_ENGINES);

  useEffect(() => {
    if (cache) {
      setEngines(cache);
      return undefined;
    }

    let alive = true;
    void loadPublishedEngines().then((list) => {
      if (alive) setEngines(list);
    });

    return () => {
      alive = false;
    };
  }, []);

  return engines;
}
