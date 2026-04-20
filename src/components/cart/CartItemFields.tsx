import { useCallback, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CustomField } from '../../lib/types';
import { isNiveauHidden, isNiveauField } from '../../lib/utils';

function isSelectType(type: string) {
  return type === 'select' || type === 'selection';
}

interface Props {
  fields: CustomField[];
  values: Record<string, string | number>;
  onChange: (values: Record<string, string | number>) => void;
}

export default function CartItemFields({ fields, values, onChange }: Props) {
  const sorted = useMemo(() => [...fields].sort((a, b) => a.order - b.order), [fields]);

  const hideNiveau = useMemo(() => isNiveauHidden(fields, values), [fields, values]);

  const isFieldVisible = useCallback(
    (field: CustomField): boolean => {
      if (hideNiveau && isNiveauField(field)) return false;
      if (!field.parent) return true;
      const parentValue = values[String(field.parent.customFieldId)];
      if (parentValue === undefined) return false;
      const parentField = fields.find((f) => f.id === field.parent!.customFieldId);
      if (!parentField?.options) return false;
      const selectedOption = parentField.options.find(
        (o) => String(o.value) === String(parentValue)
      );
      if (!selectedOption) return false;
      return String(selectedOption.id) === String(field.parent.optionId);
    },
    [fields, values, hideNiveau]
  );

  const updateValue = useCallback(
    (fieldId: number, value: string | number) => {
      const next = { ...values, [String(fieldId)]: value };
      const parentField = fields.find((f) => f.id === fieldId);
      if (parentField && isSelectType(parentField.type)) {
        for (const child of fields) {
          if (child.parent && child.parent.customFieldId === fieldId) {
            delete next[String(child.id)];
          }
        }
        const selectedOpt = parentField.options?.find(
          (o) => String(o.value) === String(value)
        );
        if (selectedOpt) {
          for (const child of fields) {
            if (
              child.parent &&
              child.parent.customFieldId === fieldId &&
              String(child.parent.optionId) === String(selectedOpt.id)
            ) {
              if (child.type === 'number') {
                const dv = String(child.default_value ?? child.minimum ?? 0);
                next[String(child.id)] = dv.includes('-') ? (Number(dv.split('-')[0]) || 0) : (Number(dv) || 0);
              } else if (child.type === 'checkbox') {
                next[String(child.id)] = Number(child.default_value) || 0;
              } else if (isSelectType(child.type) && child.options?.length) {
                const s = [...child.options].sort((a, b) => Number(a.order) - Number(b.order));
                next[String(child.id)] = child.default_value ?? s[0].value;
              } else if (child.default_value !== undefined) {
                next[String(child.id)] = child.default_value;
              }
            }
          }
        }
      }
      onChange(next);
    },
    [values, onChange, fields]
  );

  const visible = sorted.filter(isFieldVisible);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2.5 pt-1">
      {visible.map((field) => {
        const key = String(field.id);
        const currentValue = values[key];

        if (isSelectType(field.type) && field.options?.length) {
          return (
            <CompactSelect
              key={field.id}
              field={field}
              value={currentValue}
              onUpdate={(v) => updateValue(field.id, v)}
            />
          );
        }

        if (field.type === 'number') {
          return (
            <CompactNumber
              key={field.id}
              field={field}
              value={currentValue}
              onUpdate={(v) => updateValue(field.id, v)}
            />
          );
        }

        if (field.type === 'checkbox') {
          return (
            <CompactCheckbox
              key={field.id}
              field={field}
              value={currentValue}
              onUpdate={(v) => updateValue(field.id, v)}
            />
          );
        }

        return (
          <CompactText
            key={field.id}
            field={field}
            value={currentValue}
            onUpdate={(v) => updateValue(field.id, v)}
          />
        );
      })}
    </div>
  );
}

function CompactSelect({
  field,
  value,
  onUpdate,
}: {
  field: CustomField;
  value: string | number | undefined;
  onUpdate: (v: string | number) => void;
}) {
  const options = [...(field.options || [])].sort((a, b) => Number(a.order) - Number(b.order));
  const minPrice = Math.min(...options.map((o) => Number(o.price) || 0));

  return (
    <div>
      <label className="text-[11px] font-medium text-volcanic-400 mb-1 block">{field.name}</label>
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={(e) => onUpdate(e.target.value)}
          className="w-full appearance-none px-2.5 py-1.5 pr-7 bg-volcanic-800/80 border border-volcanic-700/50 rounded-lg text-volcanic-200 text-xs focus:outline-none focus:border-ark-600/50 transition-all cursor-pointer"
        >
          {options.map((opt) => {
            const relPrice = (Number(opt.price) || 0) - minPrice;
            return (
              <option key={opt.id} value={opt.value}>
                {opt.name}
                {relPrice > 0 ? ` (+${relPrice.toFixed(2)} EUR)` : ''}
              </option>
            );
          })}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-volcanic-500 pointer-events-none" />
      </div>
    </div>
  );
}

function CompactNumber({
  field,
  value,
  onUpdate,
}: {
  field: CustomField;
  value: string | number | undefined;
  onUpdate: (v: number) => void;
}) {
  const min = Number(field.minimum ?? 0);
  const max = Number(field.maximum ?? 100);
  const step = Number(field.step) || 1;
  const numValue = value !== undefined ? Number(value) : min;
  const pct = max > min ? ((numValue - min) / (max - min)) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[11px] font-medium text-volcanic-400">{field.name}</label>
        <span className="text-[11px] font-semibold text-volcanic-200">{numValue}</span>
      </div>
      <div className="relative group">
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full h-1.5 rounded-full bg-volcanic-700/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-ark-600 to-ark-500 transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numValue}
          onChange={(e) => onUpdate(Number(e.target.value))}
          className="relative w-full h-4 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-ark-500/30 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ark-500 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ark-500 [&::-moz-range-track]:bg-transparent"
        />
      </div>
      <div className="flex justify-between text-[10px] text-volcanic-600 mt-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function CompactCheckbox({
  field,
  value,
  onUpdate,
}: {
  field: CustomField;
  value: string | number | undefined;
  onUpdate: (v: number) => void;
}) {
  const checked = value === 1 || value === '1' || value === 'true';

  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <div className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onUpdate(e.target.checked ? 1 : 0)}
          className="sr-only peer"
        />
        <div className="w-8 h-[18px] bg-volcanic-700 rounded-full peer-checked:bg-ark-600 transition-colors" />
        <div className="absolute top-[1px] left-[1px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-[14px]" />
      </div>
      <span className="text-[11px] font-medium text-volcanic-400 group-hover:text-volcanic-300 transition-colors">
        {field.name}
      </span>
      {field.price !== undefined && Number(field.price) > 0 && (
        <span className="text-[10px] text-ark-400 ml-auto">
          +{Number(field.price).toFixed(2)} EUR
        </span>
      )}
    </label>
  );
}

function CompactText({
  field,
  value,
  onUpdate,
}: {
  field: CustomField;
  value: string | number | undefined;
  onUpdate: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-volcanic-400 mb-1 block">{field.name}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={field.placeholder || field.name}
        className="w-full px-2.5 py-1.5 bg-volcanic-800/80 border border-volcanic-700/50 rounded-lg text-volcanic-200 text-xs placeholder-volcanic-600 focus:outline-none focus:border-ark-600/50 transition-all"
      />
    </div>
  );
}
