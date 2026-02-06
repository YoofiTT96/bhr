export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';

export interface SectionField {
  id: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  fieldOptions?: Record<string, unknown>;
  isRequired: boolean;
  displayOrder: number;
  validationRules?: Record<string, unknown>;
}

export interface EmployeeSection {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  requiredPermission?: string | null;
  fields?: SectionField[];
}

export interface FieldValue {
  id?: number;
  sectionFieldId: number;
  fieldName: string;
  fieldLabel: string;
  value: Record<string, unknown> | null;
}
