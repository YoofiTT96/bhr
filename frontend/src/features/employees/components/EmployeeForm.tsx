import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useEmployee, useCreateEmployee, useUpdateEmployee, useEmployees } from '../hooks/useEmployees';
import Header from '../../../shared/components/layout/Header';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  position: z.string().optional(),
  location: z.string().optional(),
  birthday: z.string().optional(),
  hireDate: z.string().min(1, 'Hire date is required'),
  reportsToId: z.string().optional().nullable(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const employeeId = id ?? '';
  const navigate = useNavigate();

  const { data: employee, isLoading: loadingEmployee } = useEmployee(employeeId);
  const { data: allEmployees } = useEmployees(0, 100);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    values: isEdit && employee
      ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phoneNumber: employee.phoneNumber ?? '',
          position: employee.position ?? '',
          location: employee.location ?? '',
          birthday: employee.birthday ?? '',
          hireDate: employee.hireDate,
          reportsToId: employee.reportsToId ?? null,
        }
      : undefined,
  });

  const onSubmit = async (data: EmployeeFormData) => {
    const payload = {
      ...data,
      reportsToId: data.reportsToId || undefined,
      phoneNumber: data.phoneNumber || undefined,
      position: data.position || undefined,
      location: data.location || undefined,
      birthday: data.birthday || undefined,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: employeeId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    navigate('/employees');
  };

  if (isEdit && loadingEmployee) {
    return (
      <>
        <Header title="Edit Employee" />
        <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>
      </>
    );
  }

  // Filter out current employee from manager list
  const managerOptions = allEmployees?.content.filter((e) => e.id !== employeeId) ?? [];

  return (
    <>
      <Header title={isEdit ? 'Edit Employee' : 'Add Employee'} />

      <div className="p-6 max-w-2xl">
        <button
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={16} />
          Back to employees
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={errors.firstName?.message} required>
                <input {...register('firstName')} className={inputClass} />
              </Field>
              <Field label="Last Name" error={errors.lastName?.message} required>
                <input {...register('lastName')} className={inputClass} />
              </Field>
            </div>

            <Field label="Email" error={errors.email?.message} required>
              <input {...register('email')} type="email" className={inputClass} disabled={isEdit} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone Number" error={errors.phoneNumber?.message}>
                <input {...register('phoneNumber')} className={inputClass} />
              </Field>
              <Field label="Position" error={errors.position?.message}>
                <input {...register('position')} className={inputClass} />
              </Field>
            </div>

            <Field label="Location" error={errors.location?.message}>
              <input {...register('location')} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Birthday" error={errors.birthday?.message}>
                <input {...register('birthday')} type="date" className={inputClass} />
              </Field>
              <Field label="Hire Date" error={errors.hireDate?.message} required>
                <input {...register('hireDate')} type="date" className={inputClass} />
              </Field>
            </div>

            <Field label="Reports To">
              <select
                {...register('reportsToId')}
                className={inputClass}
              >
                <option value="">No manager</option>
                {managerOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} — {emp.position || 'No position'}
                  </option>
                ))}
              </select>
            </Field>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate('/employees')}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Employee'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500';

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
