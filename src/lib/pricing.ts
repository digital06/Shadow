import type { CustomField } from './types';
import { isNiveauHidden, isNiveauField } from './utils';

function isFieldVisible(
  field: CustomField,
  allFields: CustomField[],
  values: Record<string, string | number>,
  hideNiveau: boolean
): boolean {
  if (hideNiveau && isNiveauField(field)) return false;
  if (!field.parent) return true;
  const parentVal = values[String(field.parent.customFieldId)];
  if (parentVal === undefined) return false;
  const parentField = allFields.find((pf) => pf.id === field.parent!.customFieldId);
  if (!parentField?.options) return false;
  const selectedOpt = parentField.options.find(
    (o) => String(o.id) === String(parentVal)
  );
  return selectedOpt ? String(selectedOpt.id) === String(field.parent.optionId) : false;
}

export function computeExtrasPrice(
  fields: CustomField[] | undefined,
  values: Record<string, string | number>
): number {
  if (!fields) return 0;
  const hideNiveau = isNiveauHidden(fields, values);
  let extra = 0;
  fields.forEach((f) => {
    if (!isFieldVisible(f, fields, values, hideNiveau)) return;
    const val = values[String(f.id)];
    if ((f.type === 'select' || f.type === 'selection') && f.options) {
      const opt = f.options.find((o) => String(o.id) === String(val));
      if (opt) {
        extra += Number(opt.price) || 0;
      }
    }
    if (f.type === 'checkbox' && (val === 1 || val === '1')) {
      extra += Number(f.price) || 0;
    }
    if (f.type === 'number' && f.price) {
      const min = Number(f.minimum ?? 0);
      extra += Math.max(0, (Number(val) || 0) - min) * Number(f.price);
    }
  });
  return extra;
}
