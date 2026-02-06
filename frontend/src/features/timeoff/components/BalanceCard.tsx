import type { TimeOffBalance } from '../types/timeoff.types';

interface BalanceCardProps {
  balance: TimeOffBalance;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  const total = balance.totalAllocated + balance.carryOver;
  const usedPercent = total > 0 ? (balance.used / total) * 100 : 0;
  const pendingPercent = total > 0 ? (balance.pending / total) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">{balance.timeOffTypeName}</h3>
        <span className="text-xs text-gray-500">{balance.year}</span>
      </div>

      {balance.isUnlimited ? (
        <>
          <div className="mb-3">
            <span className="text-lg font-semibold text-green-600">Unlimited</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Used</span>
              <p className="font-medium text-blue-600">{balance.used} days</p>
            </div>
            <div>
              <span className="text-gray-500">Pending</span>
              <p className="font-medium text-yellow-600">{balance.pending} days</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div className="h-full flex">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
              <div
                className="bg-yellow-400 h-full"
                style={{ width: `${Math.min(pendingPercent, 100 - usedPercent)}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Remaining</span>
              <p className="font-semibold text-gray-900">{balance.remaining} days</p>
            </div>
            <div>
              <span className="text-gray-500">Total</span>
              <p className="font-semibold text-gray-900">{total} days</p>
            </div>
            <div>
              <span className="text-gray-500">Used</span>
              <p className="font-medium text-blue-600">{balance.used} days</p>
            </div>
            <div>
              <span className="text-gray-500">Pending</span>
              <p className="font-medium text-yellow-600">{balance.pending} days</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
