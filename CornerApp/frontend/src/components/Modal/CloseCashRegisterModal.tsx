import { useState } from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface CloseCashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string, actualCashAmount?: number) => Promise<void>;
  cashRegister?: {
    totalSales: number;
    totalCash: number;
    totalPOS: number;
    totalTransfer: number;
    initialAmount: number;
  };
}

export default function CloseCashRegisterModal({
  isOpen,
  onClose,
  onConfirm,
  cashRegister,
}: CloseCashRegisterModalProps) {
  const [notes, setNotes] = useState<string>('');
  const [actualCashAmount, setActualCashAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!actualCashAmount || parseFloat(actualCashAmount) < 0) {
      setError('Debe ingresar el monto en efectivo que tiene en caja');
      return;
    }

    try {
      setIsLoading(true);
      await onConfirm(notes.trim() || undefined, parseFloat(actualCashAmount));
      setNotes('');
      setActualCashAmount('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al cerrar la caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setNotes('');
      setActualCashAmount('');
      setError(null);
      onClose();
    }
  };

  const finalAmount = cashRegister
    ? cashRegister.initialAmount + cashRegister.totalCash
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cerrar Caja" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {cashRegister && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-3">Resumen de la sesión</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Monto inicial:</span>
                  <p className="font-semibold text-gray-900">
                    ${cashRegister.initialAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total ventas:</span>
                  <p className="font-semibold text-gray-900">
                    ${cashRegister.totalSales.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Efectivo:</span>
                  <p className="font-semibold text-green-600">
                    ${cashRegister.totalCash.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">POS:</span>
                  <p className="font-semibold text-blue-600">
                    ${cashRegister.totalPOS.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Transferencias:</span>
                  <p className="font-semibold text-purple-600">
                    ${cashRegister.totalTransfer.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Monto final esperado:</span>
                  <p className="font-semibold text-primary-600">
                    ${finalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="actualCashAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto en efectivo que tiene en caja *
            </label>
            <input
              id="actualCashAmount"
              type="number"
              step="0.01"
              min="0"
              value={actualCashAmount}
              onChange={(e) => setActualCashAmount(e.target.value)}
              disabled={isLoading}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="0.00"
            />
            {actualCashAmount && cashRegister && (
              (() => {
                const entered = parseFloat(actualCashAmount || '0');
                const expected = finalAmount;
                const difference = Math.abs(entered - expected);
                if (difference > 0.01) {
                  return (
                    <p className="mt-1 text-sm text-red-600">
                      El monto ingresado (${entered.toFixed(2)}) no coincide con el esperado (${expected.toFixed(2)})
                      {difference > 0 && (
                        <span className="block">Diferencia: ${difference.toFixed(2)}</span>
                      )}
                    </p>
                  );
                } else {
                  return (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ El monto coincide correctamente
                    </p>
                  );
                }
              })()
            )}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Agregar notas sobre el cierre de caja..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error al cerrar la caja</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !actualCashAmount || parseFloat(actualCashAmount) < 0}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <XCircle className="h-4 w-4" />
              Cerrar Caja
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
