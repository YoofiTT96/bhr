export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'SELECT' | 'MULTI_SELECT';

export type EditableBy = 'EMPLOYEE' | 'HR_ONLY' | 'SYSTEM';

export interface SectionField {
  id: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  fieldOptions?: Record<string, unknown>;
  isRequired: boolean;
  displayOrder: number;
  editableBy: EditableBy;
  validationRules?: Record<string, unknown>;
}

export interface EmployeeSection {
  id: string;
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

// Request types for CRUD operations
export interface CreateSectionRequest {
  name: string;
  displayName: string;
  description?: string;
  displayOrder?: number;
  requiredPermission?: string;
}

export interface UpdateSectionRequest {
  displayName?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  requiredPermission?: string | null;
}

export interface CreateSectionFieldRequest {
  fieldName: string;
  fieldLabel: string;
  fieldType: FieldType;
  fieldOptions?: Record<string, unknown>;
  isRequired?: boolean;
  displayOrder?: number;
  editableBy?: EditableBy;
  validationRules?: Record<string, unknown>;
}

export interface UpdateSectionFieldRequest {
  fieldLabel?: string;
  fieldType?: FieldType;
  fieldOptions?: Record<string, unknown>;
  isRequired?: boolean;
  displayOrder?: number;
  editableBy?: EditableBy;
  validationRules?: Record<string, unknown>;
}
