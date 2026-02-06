import type { PermissionDto } from '../types/admin.types';

interface Props {
  permissions: PermissionDto[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export default function PermissionChecklist({ permissions, selected, onChange }: Props) {
  // Group by resource
  const grouped = permissions.reduce<Record<string, PermissionDto[]>>((acc, p) => {
    (acc[p.resource] ||= []).push(p);
    return acc;
  }, {});

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  };

  const toggleGroup = (perms: PermissionDto[]) => {
    const allSelected = perms.every((p) => selected.has(p.id));
    const next = new Set(selected);
    perms.forEach((p) => {
      if (allSelected) {
        next.delete(p.id);
      } else {
        next.add(p.id);
      }
    });
    onChange(next);
  };

  if (permissions.length === 0) {
    return <p className="text-sm text-gray-400 italic">Loading permissions...</p>;
  }

  return (
    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([resource, perms]) => {
          const allSelected = perms.every((p) => selected.has(p.id));
          const someSelected = perms.some((p) => selected.has(p.id));

          return (
            <div key={resource} className="p-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer mb-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={() => toggleGroup(perms)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {resource}
              </label>
              <div className="ml-5 space-y-0.5">
                {perms.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-mono text-xs">{p.action}</span>
                    {p.description && (
                      <span className="text-gray-400 text-xs">— {p.description}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}
