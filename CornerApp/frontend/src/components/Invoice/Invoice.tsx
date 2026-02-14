import { Order, Table, PaymentMethod } from '../../types';
import Logo from '../Logo/Logo';

interface InvoiceProps {
  orders: Order[];
  table: Table | null;
  totalAmount: number;
  paymentMethod: string;
  paymentMethods: PaymentMethod[];
  onClose?: () => void;
}

export default function Invoice({ orders, table, totalAmount, paymentMethod, paymentMethods, onClose }: InvoiceProps) {
  const paymentMethodDisplay = paymentMethods.find(m => m.name === paymentMethod)?.displayName || paymentMethod;
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });


  return (
    <div className="invoice-container bg-white p-8 max-w-2xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Logo */}
      <div className="mb-6 text-center">
        <Logo variant="text-only" className="justify-center" />
      </div>

      {/* Información del negocio */}
      <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">FACTURA</h1>
        <p className="text-sm text-gray-600">Fecha: {formattedDate}</p>
        {table && (
          <p className="text-sm text-gray-600 mt-1">Mesa: #{table.number}</p>
        )}
      </div>

      {/* Información de pedidos */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Detalle de Pedidos</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-gray-200 pb-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800">Pedido #{order.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-700">${order.total.toFixed(2)}</p>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div className="ml-4 mt-2 space-y-1">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-gray-700">
                          {item.quantity}x {item.productName}
                        </span>
                        {item.subProducts && item.subProducts.length > 0 && (
                          <div className="ml-4 text-xs text-gray-500">
                            {item.subProducts.map((sub, subIndex) => (
                              <div key={subIndex}>+ {sub.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="border-t-2 border-gray-300 pt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-gray-800">Subtotal:</span>
          <span className="text-lg font-semibold text-gray-800">${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">TOTAL:</span>
          <span className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Método de pago */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Método de Pago:</span> {paymentMethodDisplay}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p>Gracias por su visita</p>
        <p className="mt-1">RiDi Express</p>
      </div>

      {/* Botones de acción (solo visibles en pantalla, no en impresión) */}
      <div className="mt-6 flex gap-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          Imprimir
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-container,
          .invoice-container * {
            visibility: visible;
          }
          .invoice-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
