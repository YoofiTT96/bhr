import { useEmployeeSectionValues, useSectionWithFields, useUpdateFieldValue } from '../hooks/useEmployeeSections';
import type { SectionField, FieldValue } from '../types/section.types';
import { useState } from 'react';

interface ConfigurableSectionProps {
  employeeId: string;
  sectionName: string;
}

export default function ConfigurableSection({ employeeId, sectionName }: ConfigurableSectionProps) {
  const { data: section, isLoading: loadingSection } = useSectionWithFields(sectionName);
  const { data: values, isLoading: loadingValues } = useEmployeeSectionValues(employeeId, sectionName);
  const updateFieldValue = useUpdateFieldValue();

  if (loadingSection || loadingValues) {
    return <div className="text-sm text-gray-500 py-4">Loading section data...</div>;
  }

  if (!section?.fields || section.fields.length === 0) {
    return <div className="text-sm text-gray-500 py-4">No fields configured for this section.</div>;
  }

  return (
    <div className="space-y-4">
      {section.fields.map((field) => {
        const fieldValue = values?.find((v) => v.sectionFieldId === field.id);
        return (
          <DynamicField
            key={field.id}
            field={field}
            value={fieldValue ?? null}
            onSave={(value) => {
              updateFieldValue.mutate({
                employeeId,
                fieldId: field.id,
                value,
              });
            }}
          />
        );
      })}
    </div>
  );
}

function DynamicField({
  field,
  value,
  onSave,
}: {
  field: SectionField;
  value: FieldValue | null;
  onSave: (value: Record<string, unknown>) => void;
}) {
  const currentValue = value?.value;
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState<string>(
    extractDisplayValue(currentValue ?? null, field.fieldType)
  );

  const handleSave = () => {
    const wrapped = wrapValue(localValue, field.fieldType);
    onSave(wrapped);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-50">
        <div>
          <p className="text-xs text-gray-500">{field.fieldLabel}</p>
          <p className="text-sm text-gray-900">
            {currentValue ? extractDisplayValue(currentValue, field.fieldType) : '—'}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 border-b border-gray-50">
      <label className="block text-xs text-gray-500 mb-1">
        {field.fieldLabel}
        {field.isRequired && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {renderInput(field, localValue, setLocalValue)}
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function renderInput(
  field: SectionField,
  value: string,
  onChange: (v: string) => void
) {
  const inputClass =
    'w-full px-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  switch (field.fieldType) {
    case 'TEXT':
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
    case 'NUMBER':
      return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
    case 'DATE':
      return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
    case 'BOOLEAN':
      return (
        <input
          type="checkbox"
          checked={value === 'true'}
          onChange={(e) => onChange(String(e.target.checked))}
          className="h-4 w-4"
        />
      );
    case 'SELECT': {
      const options = (field.fieldOptions as { options?: string[] })?.options ?? [];
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    default:
      return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
  }
}

function extractDisplayValue(value: Record<string, unknown> | null, _fieldType: string): string {
  if (!value) return '';
  const v = value.stringValue ?? value.numberValue ?? value.dateValue ?? value.booleanValue ?? value.selectedValue ?? '';
  return String(v);
}

function wrapValue(value: string, fieldType: string): Record<string, unknown> {
  switch (fieldType) {
    case 'TEXT':
      return { stringValue: value };
    case 'NUMBER':
      return { numberValue: Number(value) };
    case 'DATE':
      return { dateValue: value };
    case 'BOOLEAN':
      return { booleanValue: value === 'true' };
    case 'SELECT':
    case 'MULTI_SELECT':
      return { selectedValue: value };
    default:
      return { stringValue: value };
  }
}
