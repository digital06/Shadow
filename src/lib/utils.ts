import type { CustomField } from './types';

function isSelectType(type: string) {
  return type === 'select' || type === 'selection';
}

export function isNiveauHidden(
  fields: CustomField[],
  values: Record<string, string | number>
): boolean {
  const statsField = fields.find(
    (f) =>
      isSelectType(f.type) &&
      f.name.toLowerCase().includes('choix') &&
      f.name.toLowerCase().includes('stat')
  );
  if (!statsField) return false;

  const val = values[String(statsField.id)];
  if (val === undefined || val === null) return false;

  const selectedOpt = statsField.options?.find(
    (o) => String(o.value) === String(val)
  );
  if (!selectedOpt) return false;

  const hasVisibleStatChildren = fields.some(
    (f) =>
      f.parent &&
      f.parent.customFieldId === statsField.id &&
      String(f.parent.optionId) === String(selectedOpt.id)
  );

  return hasVisibleStatChildren;
}

export function isNiveauField(field: CustomField): boolean {
  const name = field.name.toLowerCase();
  const marker = (field.marker || '').toLowerCase();
  return (
    field.type === 'number' &&
    (marker === 'niveau' || name === 'niveau' || name.includes('niveau'))
  );
}

export function getCustomFieldDefaults(fields: CustomField[]): Record<string, string | number> {
  const defaults: Record<string, string | number> = {};
  fields.forEach((f) => {
    if (f.default_value !== undefined) {
      const dv = String(f.default_value);
      if (f.type === 'number' && dv.includes('-')) {
        defaults[String(f.id)] = Number(dv.split('-')[0]) || 0;
      } else {
        defaults[String(f.id)] = f.default_value;
      }
    } else if (f.type === 'number' && f.minimum !== undefined) {
      defaults[String(f.id)] = Number(f.minimum) || 0;
    } else if ((f.type === 'select' || f.type === 'selection') && f.options?.[0]) {
      defaults[String(f.id)] = f.options[0].value;
    } else if (f.type === 'checkbox') {
      defaults[String(f.id)] = 0;
    }
  });
  return defaults;
}

const periodicityMap: Record<string, string> = {
  month: 'mois',
  months: 'mois',
  week: 'semaine',
  weeks: 'semaines',
  day: 'jour',
  days: 'jours',
  year: 'an',
  years: 'ans',
};

export function translatePeriodicity(value: string): string {
  return periodicityMap[value.toLowerCase()] || value;
}

export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export function stripHtml(html: string): string {
  if (!html) return '';
  return decodeHtmlEntities(
    html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
}

export function decodeProductData<T extends { name?: string; description?: string }>(
  data: T
): T {
  const decoded = { ...data };
  if (decoded.name) {
    decoded.name = decodeHtmlEntities(decoded.name);
  }
  if (decoded.description) {
    decoded.description = decodeHtmlEntities(decoded.description);
  }
  return decoded;
}
