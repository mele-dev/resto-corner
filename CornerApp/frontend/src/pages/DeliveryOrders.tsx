import { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Play,
  PackageCheck,
  Wifi,
  WifiOff,
  DollarSign,
  X
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../components/Toast/ToastContext';
import { useOrdersHub } from '../hooks/useOrdersHub';
import { useNotificationSound, getTimeElapsed } from '../hooks/useNotificationSound';
import Modal from '../components/Modal/Modal';
import ConfirmModal from '../components/Modal/ConfirmModal';
import type { Order, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  preparing: { label: 'Preparando', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package },
  delivering: { label: 'En camino', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Truck },
  completed: { label: 'Completado', color: 'text-green-700', bgColor: 'bg-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
};

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cashRegisterStatus, setCashRegisterStatus] = useState<{ isOpen: boolean; cashRegister: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isOpeningCashRegister, setIsOpeningCashRegister] = useState(false);
  const [isClosingCashRegister, setIsClosingCashRegister] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  
  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; order: Order } | null>(null);

  const { showToast } = useToast();
  const { playSound } = useNotificationSound();

  // SignalR handlers
  const handleOrderCreated = useCallback((order: Order) => {
    // Solo agregar si está asignado al repartidor actual
    if (order.deliveryPersonId && ACTIVE_STATUSES.includes(order.status as OrderStatus)) {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        if (exists) {
          return prev.map(o => o.id === order.id ? order : o);
        }
        return [order, ...prev];
      });
      showToast(`🆕 Nuevo pedido #${order.id} asignado`, 'success');
      playSound();
    }
  }, [showToast, playSound]);

  const handleOrderUpdated = useCallback((order: Order) => {
    if (order.deliveryPersonId && ACTIVE_STATUSES.includes(order.status as OrderStatus)) {
      setOrders(prev => {
        const exists = prev.some(o => o.id === order.id);
        if (exists) {
          return prev.map(o => o.id === order.id ? order : o);
        }
        return [order, ...prev];
      });
    } else {
      // Si el pedido ya no está activo o fue desasignado, removerlo
      setOrders(prev => prev.filter(o => o.id !== order.id));
    }
  }, []);

  const handleOrderStatusChanged = useCallback((event: { orderId: number; status: string }) => {
    if (ACTIVE_STATUSES.includes(event.status as OrderStatus)) {
      setOrders(prev => prev.map(o =>
        o.id === event.orderId ? { ...o, status: event.status as OrderStatus } : o
      ));
    } else {
      setOrders(prev => prev.filter(o => o.id !== event.orderId));
    }
  }, []);

  const handleOrderDeleted = useCallback((event: { orderId: number }) => {
    setOrders(prev => prev.filter(o => o.id !== event.orderId));
  }, []);

  useOrdersHub({
    onOrderCreated: handleOrderCreated,
    onOrderUpdated: handleOrderUpdated,
    onOrderStatusChanged: handleOrderStatusChanged,
    onOrderDeleted: handleOrderDeleted,
    onConnectionStatusChange: setIsConnected,
  });

  const ACTIVE_STATUSES: OrderStatus[] = ['preparing', 'delivering'];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const status = await api.getDeliveryCashRegisterStatus();
      setCashRegisterStatus(status);
      
      if (status.isOpen) {
        try {
          const ordersData = await api.getDeliveryOrders();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error: any) {
          // Si falla obtener pedidos pero la caja está abierta, solo mostrar error
          console.error('Error al cargar pedidos:', error);
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      if (error.response?.status !== 400) { // Ignorar error 400 (caja no abierta)
        showToast(error.message || 'Error al cargar datos', 'error');
      }
      setCashRegisterStatus({ isOpen: false, cashRegister: null });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, []);

  // Recargar pedidos periódicamente si la caja está abierta
  useEffect(() => {
    if (cashRegisterStatus?.isOpen) {
      const interval = setInterval(() => {
        loadData();
      }, 10000); // Cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [cashRegisterStatus?.isOpen, loadData]);

  const handleOpenCashRegister = async () => {
    try {
      setIsOpeningCashRegister(true);
      await api.openDeliveryCashRegister();
      showToast('Caja abierta exitosamente', 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al abrir la caja', 'error');
    } finally {
      setIsOpeningCashRegister(false);
    }
  };

  const handleCloseCashRegister = async () => {
    try {
      setIsClosingCashRegister(true);
      await api.closeDeliveryCashRegister(closeNotes || undefined);
      showToast('Caja cerrada exitosamente', 'success');
      setCloseNotes('');
      setIsCloseModalOpen(false);
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al cerrar la caja', 'error');
    } finally {
      setIsClosingCashRegister(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      await api.updateDeliveryOrderStatus(order.id, newStatus);
      showToast(`Estado actualizado a ${statusConfig[newStatus].label}`, 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al actualizar estado', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay caja abierta, mostrar pantalla para abrirla
  if (!cashRegisterStatus?.isOpen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={40} className="text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Abrir Caja de Repartidor</h2>
            <p className="text-gray-600">
              Para gestionar tus pedidos, primero debes abrir tu caja de trabajo.
            </p>
          </div>
          <button
            onClick={handleOpenCashRegister}
            disabled={isOpeningCashRegister}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOpeningCashRegister ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                <Play size={20} />
                Abrir Caja
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con estado de caja */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-800">🚚 Mis Pedidos de Delivery</h1>
              <p className="text-sm text-gray-500">
                {orders.length} pedido{orders.length !== 1 ? 's' : ''} asignado{orders.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Connection indicator */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? 'En vivo' : 'Offline'}
            </div>
          </div>

          {/* Botón cerrar caja */}
          <button
            onClick={() => setIsCloseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            <X size={18} />
            Cerrar Caja
          </button>
        </div>

        {/* Info de caja abierta */}
        {cashRegisterStatus.cashRegister && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-purple-700">
                <DollarSign size={16} />
                <span>Caja abierta desde {new Date(cashRegisterStatus.cashRegister.openedAt).toLocaleTimeString('es-ES')}</span>
              </div>
              <div className="text-purple-600">
                {cashRegisterStatus.cashRegister.activeOrders || 0} activos | {cashRegisterStatus.cashRegister.completedOrders || 0} completados
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de pedidos */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-green-400" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Todo al día!</h2>
          <p className="text-gray-500">No tienes pedidos asignados en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            const elapsed = getTimeElapsed(order.updatedAt || order.createdAt);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${
                  order.status === 'preparing' ? 'border-orange-500' :
                  order.status === 'delivering' ? 'border-purple-500' :
                  'border-gray-300'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">#{order.id}</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                      <span className={`text-xs ${elapsed.isUrgent ? 'text-red-600 font-bold animate-pulse' : 'text-gray-400'}`}>
                        {elapsed.isUrgent && '🔥'} {elapsed.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  {/* Cliente */}
                  <div>
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      {order.customerPhone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {order.customerPhone}
                        </span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={12} />
                      <span className="truncate">{order.customerAddress}</span>
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="text-sm text-gray-600">
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx}>
                        {item.quantity}x {item.productName}
                      </div>
                    ))}
                    {order.items && order.items.length > 2 && (
                      <div className="text-gray-400">+{order.items.length - 2} más...</div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">💳 {order.paymentMethod}</span>
                    <span className="text-xl font-bold text-green-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex gap-2">
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleStatusChange(order, 'delivering')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm font-medium"
                      >
                        <Truck size={16} />
                        En Camino
                      </button>
                    )}
                    {order.status === 'delivering' && (
                      <button
                        onClick={() => handleStatusChange(order, 'completed')}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                      >
                        <PackageCheck size={16} />
                        Entregado
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailsModalOpen(true);
                      }}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de detalles */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Pedido #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">👤 Cliente</h4>
              <p className="font-medium">{selectedOrder.customerName}</p>
              {selectedOrder.customerPhone && <p className="text-sm text-gray-600">📱 {selectedOrder.customerPhone}</p>}
              <p className="text-sm text-gray-600">📍 {selectedOrder.customerAddress}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">🛒 Productos</h4>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="text-sm py-1">
                  <div className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-600">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
            {selectedOrder.comments && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium mb-1">💬 Comentarios</h4>
                <p className="text-sm">{selectedOrder.comments}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de cerrar caja */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => {
          setIsCloseModalOpen(false);
          setCloseNotes('');
        }}
        title="Cerrar Caja"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro de que deseas cerrar tu caja? Asegúrate de haber completado todos los pedidos activos.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Notas sobre el cierre de caja..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsCloseModalOpen(false);
                setCloseNotes('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCloseCashRegister}
              disabled={isClosingCashRegister}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isClosingCashRegister ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <X size={18} />
                  Cerrar Caja
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
