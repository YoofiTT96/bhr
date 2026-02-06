import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormSelect } from '../../../shared/components/ui/FormFields';
import { useAssignEmployee, useProjectAssignments } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import apiClient from '../../../api/apiClient';
import type { ProjectAssignmentRole } from '../types/project.types';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
}

interface AssignMemberModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'LEAD', label: 'Lead' },
];

export default function AssignMemberModal({ open, onClose, projectId }: AssignMemberModalProps) {
  const assignEmployee = useAssignEmployee();
  const { data: currentAssignments } = useProjectAssignments(projectId);

  const { data: employeesData } = useQuery({
    queryKey: ['employees', 'all-for-assign'],
    queryFn: async () => {
      const res = await apiClient.get('/employees', { params: { page: 0, size: 100 } });
      return res.data;
    },
    enabled: open,
  });

  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<ProjectAssignmentRole>('MEMBER');

  useEffect(() => {
    assignEmployee.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!assignEmployee.isPending) onClose();
  }, [assignEmployee.isPending, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignEmployee.mutateAsync({
        projectId,
        data: { employeeId, role },
      });
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  const assignedIds = new Set(currentAssignments?.map((a) => a.employeeId) ?? []);
  const employees: Employee[] = (employeesData?.content ?? []).filter(
    (emp: Employee) => !assignedIds.has(emp.id),
  );

  const employeeOptions = [
    { value: '', label: 'Select an employee...' },
    ...employees.map((emp) => ({
      value: emp.id,
      label: `${emp.firstName} ${emp.lastName} — ${emp.position}`,
    })),
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Assign Member"
      size="md"
      closeDisabled={assignEmployee.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormSelect
            label="Employee"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            options={employeeOptions}
          />

          <FormSelect
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as ProjectAssignmentRole)}
            options={ROLE_OPTIONS}
          />

          <ModalError error={assignEmployee.isError ? getApiErrorMessage(assignEmployee.error, 'Failed to assign member') : null} />
        </ModalBody>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={assignEmployee.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {assignEmployee.isPending ? 'Assigning...' : 'Assign Member'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
