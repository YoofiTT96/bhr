import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useUpdateProject } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';
import type { Project, ProjectStatus } from '../types/project.types';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

const PROJECT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function EditProjectModal({ open, onClose, project }: EditProjectModalProps) {
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setStatus(project.status);
    setStartDate(project.startDate || '');
    setEndDate(project.endDate || '');
    setBudget(project.budget != null ? String(project.budget) : '');
  }, [project]);

  useEffect(() => {
    updateProject.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    if (!updateProject.isPending) onClose();
  }, [updateProject.isPending, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          budget: budget ? parseFloat(budget) : undefined,
        },
      });
      onClose();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Project"
      closeDisabled={updateProject.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormSelect
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProjectStatus)}
            options={PROJECT_STATUS_OPTIONS}
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <FormInput
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step={0.01}
            min={0}
            placeholder="e.g. 150000"
          />

          <ModalError error={updateProject.isError ? getApiErrorMessage(updateProject.error, 'Failed to update project') : null} />
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
            disabled={!name.trim() || updateProject.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {updateProject.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
