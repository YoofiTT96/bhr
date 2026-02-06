import { useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalError } from '../../../shared/components/ui/Modal';
import { FormInput, FormSelect, FormTextarea } from '../../../shared/components/ui/FormFields';
import { useCreateProject, useActiveClients } from '../hooks/useProjects';
import { getApiErrorMessage } from '../../../shared/utils/getApiErrorMessage';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const { data: clients } = useActiveClients();
  const createProject = useCreateProject();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const resetFields = () => {
    setName('');
    setClientId('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setBudget('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        name,
        clientId,
        description: description || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        budget: budget ? parseFloat(budget) : undefined,
      });
      resetFields();
      onClose();
    } catch {
      // Error is handled by mutation state
    }
  };

  const handleClose = () => {
    if (!createProject.isPending) {
      onClose();
    }
  };

  const clientOptions = [
    { value: '', label: 'Select client...' },
    ...(clients?.map((client) => ({ value: client.id, label: client.name })) ?? []),
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Project"
      closeDisabled={createProject.isPending}
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <FormInput
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter project name"
          />

          <FormSelect
            label="Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            options={clientOptions}
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Project description (optional)"
          />

          <div className="grid grid-cols-2 gap-3">
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
              min={startDate}
            />
          </div>

          <FormInput
            label="Budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="0"
            step="0.01"
            placeholder="Project budget (optional)"
          />

          <ModalError error={createProject.isError ? getApiErrorMessage(createProject.error, 'Failed to create project') : null} />
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
            disabled={createProject.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
