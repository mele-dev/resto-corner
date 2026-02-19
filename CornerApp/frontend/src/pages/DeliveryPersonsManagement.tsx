import { useState, useEffect } from 'react';
import { Truck, Plus, Search, DollarSign, XCircle, X, Eye, ShoppingCart, Phone, CheckCircle, Ban, MapPin } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../components/Toast/ToastContext';
import Modal from '../components/Modal/Modal';
import ConfirmModal from '../components/Modal/ConfirmModal';
import HelpIcon from '../components/HelpIcon/HelpIcon';
import type { DeliveryPerson, Product, PaymentMethod, Order, Category, SubProduct, CreateOrderRequest, Customer } from '../types';

export default function DeliveryPersonsManagementPage() {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<DeliveryPerson | null>(null);
  const [cashRegisterStatuses, setCashRegisterStatuses] = useState<Record<number, { isOpen: boolean; cashRegister: any }>>({});
  
  // Modal states
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCloseCashRegisterModalOpen, setIsCloseCashRegisterModalOpen] = useState(false);
  const [isOpenCashRegisterModalOpen, setIsOpenCashRegisterModalOpen] = useState(false);
  const [selectedDeliveryPersonForCashRegister, setSelectedDeliveryPersonForCashRegister] = useState<number | null>(null);
  const [initialAmount, setInitialAmount] = useState<string>('0');
  const [closeNotes, setCloseNotes] = useState('');
  const [actualCashAmount, setActualCashAmount] = useState<string>('');
  const [deliveryPersonOrders, setDeliveryPersonOrders] = useState<Order[]>([]);
  const [loadingOrdersForClose, setLoadingOrdersForClose] = useState(false);
  const [cashRegisterMovements, setCashRegisterMovements] = useState<any>(null);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'preparing' | 'delivering' | 'completed' | 'cancelled'>('all');
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [isCancelOrderModalOpen, setIsCancelOrderModalOpen] = useState(false);
  
  // Order creation state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orderItems, setOrderItems] = useState<Array<{ id: number; name: string; price: number; quantity: number; subProducts?: Array<{ id: number; name: string; price: number }> }>>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productSubProducts, setProductSubProducts] = useState<SubProduct[]>([]);
  const [selectedSubProducts, setSelectedSubProducts] = useState<number[]>([]);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<string>('cash');
  const [orderComments, setOrderComments] = useState<string>('');
  const [orderCustomerName, setOrderCustomerName] = useState<string>('');
  const [orderCustomerAddress, setOrderCustomerAddress] = useState<string>('');
  const [orderCustomerPhone, setOrderCustomerPhone] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [selectedDeliveryPersonForOrder, setSelectedDeliveryPersonForOrder] = useState<number | null>(null);
  
  // Customer search state
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [foundCustomers, setFoundCustomers] = useState<Customer[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
    loadProducts();
    loadPaymentMethods();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const deliveryPersonsData = await api.getDeliveryPersons();
      setDeliveryPersons(deliveryPersonsData);
      
      // Cargar estado de caja de cada repartidor activo
      const statuses: Record<number, { isOpen: boolean; cashRegister: any }> = {};
      for (const dp of deliveryPersonsData.filter(d => d.isActive)) {
        try {
          const status = await api.getDeliveryPersonCashRegisterStatus(dp.id);
          statuses[dp.id] = status;
        } catch (error) {
          statuses[dp.id] = { isOpen: false, cashRegister: null };
        }
      }
      setCashRegisterStatuses(statuses);
    } catch (error) {
      showToast('Error al cargar repartidores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      setProducts(productsData);
      
      // Cargar todas las categorías activas (no solo las que tienen productos)
      const validCategories = Array.isArray(categoriesData) 
        ? categoriesData
            .filter(cat => cat && typeof cat === 'object' && 'id' in cat && 'name' in cat)
            .map(cat => ({
              id: Number(cat.id),
              name: String(cat.name || '').trim(),
              description: cat.description ? String(cat.description).trim() : undefined,
              icon: cat.icon ? String(cat.icon).trim() : undefined,
              displayOrder: Number(cat.displayOrder || 0),
              isActive: Boolean(cat.isActive !== false),
              createdAt: cat.createdAt ? String(cat.createdAt) : new Date().toISOString(),
            }))
            .filter(cat => cat.isActive && cat.name)
            .sort((a, b) => a.displayOrder - b.displayOrder)
        : [];
      setCategories(validCategories);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await api.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  const searchCustomers = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setFoundCustomers([]);
      return;
    }

    try {
      setIsSearchingCustomers(true);
      const response = await api.getCustomers({ search: searchTerm, pageSize: 10 });
      const customers = response?.data || [];
      setFoundCustomers(customers);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      setFoundCustomers([]);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setOrderCustomerName(customer.name);
    setOrderCustomerAddress(customer.defaultAddress || '');
    setOrderCustomerPhone(customer.phone || '');
    setCustomerSearchTerm('');
    setFoundCustomers([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setOrderCustomerName('');
    setOrderCustomerAddress('');
    setOrderCustomerPhone('');
    setCustomerSearchTerm('');
    setFoundCustomers([]);
  };

  const handleOpenCashRegisterClick = (deliveryPersonId: number) => {
    setSelectedDeliveryPersonForCashRegister(deliveryPersonId);
    setInitialAmount('0');
    setIsOpenCashRegisterModalOpen(true);
  };

  const handleOpenCashRegister = async () => {
    if (!selectedDeliveryPersonForCashRegister) return;
    
    const amount = parseFloat(initialAmount);
    if (isNaN(amount) || amount < 0) {
      showToast('El monto inicial debe ser un número mayor o igual a 0', 'error');
      return;
    }

    try {
      await api.openDeliveryPersonCashRegister(selectedDeliveryPersonForCashRegister, amount);
      showToast('Caja abierta exitosamente', 'success');
      setIsOpenCashRegisterModalOpen(false);
      setInitialAmount('0');
      setSelectedDeliveryPersonForCashRegister(null);
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al abrir la caja', 'error');
    }
  };

  const handleCloseCashRegister = async () => {
    if (!selectedDeliveryPerson) return;
    
    // Validar que se haya ingresado el monto en efectivo
    if (!actualCashAmount || parseFloat(actualCashAmount) < 0) {
      showToast('Debe ingresar el monto en efectivo que tiene el repartidor', 'error');
      return;
    }
    
    try {
      const actualCash = parseFloat(actualCashAmount);
      const result = await api.closeDeliveryPersonCashRegister(
        selectedDeliveryPerson.id, 
        closeNotes || undefined,
        actualCash
      );
      showToast('Caja cerrada exitosamente', 'success');
      setCloseNotes('');
      setActualCashAmount('');
      setIsCloseCashRegisterModalOpen(false);
      
      // Mostrar movimientos
      if (result && result.movements) {
        setCashRegisterMovements(result);
        setIsMovementsModalOpen(true);
      }
      
      // Recargar datos para actualizar el estado de la caja
      await loadData();
      // Si el modal de detalles está abierto, recargar los pedidos
      if (isDetailsModalOpen && selectedDeliveryPerson) {
        await loadDeliveryPersonOrders(selectedDeliveryPerson.id, false);
      }
    } catch (error: any) {
      showToast(error.message || 'Error al cerrar la caja', 'error');
    }
  };

  const openCreateOrderModal = (deliveryPersonId: number) => {
    // Verificar que la caja esté abierta
    const status = cashRegisterStatuses[deliveryPersonId];
    if (!status || !status.isOpen) {
      showToast('Debes abrir la caja del repartidor primero', 'error');
      return;
    }
    
    setSelectedDeliveryPersonForOrder(deliveryPersonId);
    setOrderCustomerName('');
    setOrderCustomerAddress('');
    setOrderCustomerPhone('');
    setOrderItems([]);
    setOrderPaymentMethod('cash');
    setOrderComments('');
    setSelectedProductId(null);
    setProductQuantity(1);
    setSelectedSubProducts([]);
    setIsCreateOrderModalOpen(true);
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductId) {
      showToast('Selecciona un producto', 'error');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const selectedSubs = productSubProducts.filter(sp => selectedSubProducts.includes(sp.id));
    const subProductsTotal = selectedSubs.reduce((sum, sp) => sum + sp.price, 0);
    
    setOrderItems([...orderItems, {
      id: product.id,
      name: product.name,
      price: product.price + subProductsTotal,
      quantity: productQuantity,
      subProducts: selectedSubs.length > 0 ? selectedSubs.map(sp => ({
        id: sp.id,
        name: sp.name,
        price: sp.price
      })) : undefined
    }]);
    
    setSelectedProductId(null);
    setProductQuantity(1);
    setSelectedSubProducts([]);
    setProductSubProducts([]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleProductSelect = async (productId: number) => {
    setSelectedProductId(productId);
    setProductQuantity(1);
    setSelectedSubProducts([]);
    try {
      const subProducts = await api.getSubProductsByProduct(productId);
      setProductSubProducts(subProducts.filter(sp => sp.isAvailable));
    } catch (error) {
      console.error('Error loading subproducts:', error);
      setProductSubProducts([]);
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const subProductsTotal = (item.subProducts || []).reduce((subSum, sp) => subSum + sp.price, 0);
      return sum + itemTotal + subProductsTotal;
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedDeliveryPersonForOrder) {
      showToast('Selecciona un repartidor', 'error');
      return;
    }

    if (!orderCustomerName.trim()) {
      showToast('El nombre del cliente es requerido', 'error');
      return;
    }

    if (!orderCustomerAddress.trim()) {
      showToast('La dirección es requerida', 'error');
      return;
    }

    if (orderItems.length === 0) {
      showToast('Agrega al menos un producto', 'error');
      return;
    }

    try {
      setIsCreatingOrder(true);
      
      const orderData: CreateOrderRequest = {
        customerName: orderCustomerName.trim(),
        customerAddress: orderCustomerAddress.trim(),
        customerPhone: orderCustomerPhone.trim() || undefined,
        paymentMethod: orderPaymentMethod,
        comments: orderComments.trim() || undefined,
        items: orderItems.map(item => {
          const product = products.find(p => p.id === item.id);
          return {
            id: item.id,
            name: product?.name || item.name,
            price: item.price,
            quantity: item.quantity,
            subProducts: item.subProducts?.map(sp => ({
              id: sp.id,
              name: sp.name,
              price: sp.price
            }))
          };
        })
      };

      const order = await api.createOrder(orderData);
      
      // Asignar el pedido al repartidor
      await api.updateOrderStatus(order.id, 'preparing', selectedDeliveryPersonForOrder);
      
      showToast('Pedido creado y asignado exitosamente', 'success');
      setIsCreateOrderModalOpen(false);
      setOrderCustomerName('');
      setOrderCustomerAddress('');
      setOrderCustomerPhone('');
      setOrderItems([]);
      setOrderPaymentMethod('cash');
      setOrderComments('');
      setSelectedDeliveryPersonForOrder(null);
      setSelectedCustomer(null);
      setCustomerSearchTerm('');
      setFoundCustomers([]);
      setSelectedCategoryId(null);
      setSelectedProductId(null);
      setProductSubProducts([]);
      setSelectedSubProducts([]);
      setProductQuantity(1);
      
      // Recargar datos
      await loadData();
      if (selectedDeliveryPerson) {
        await loadDeliveryPersonOrders(selectedDeliveryPerson.id);
      }
    } catch (error: any) {
      showToast(error.message || 'Error al crear el pedido', 'error');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const openDetailsModal = async (deliveryPerson: DeliveryPerson) => {
    setSelectedDeliveryPerson(deliveryPerson);
    setIsDetailsModalOpen(true);
    // Cargar todos los pedidos (incluyendo completados) para poder verlos en el modal
    await loadDeliveryPersonOrders(deliveryPerson.id, true);
  };

  const loadDeliveryPersonOrders = async (deliveryPersonId: number, includeCompleted: boolean = false) => {
    try {
      console.log('Cargando pedidos del repartidor:', deliveryPersonId, 'includeCompleted:', includeCompleted);
      const orders = await api.getDeliveryPersonOrdersByAdmin(deliveryPersonId, includeCompleted);
      console.log('Pedidos obtenidos:', orders);
      console.log('Cantidad de pedidos:', orders?.length || 0);
      setDeliveryPersonOrders(orders || []);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setDeliveryPersonOrders([]);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !selectedDeliveryPerson) return;

    try {
      await api.updateOrderStatus(orderToCancel.id, 'cancelled');
      showToast('Pedido cancelado exitosamente', 'success');
      setIsCancelOrderModalOpen(false);
      setOrderToCancel(null);
      
      // Recargar pedidos del repartidor
      await loadDeliveryPersonOrders(selectedDeliveryPerson.id, true);
      
      // Recargar datos generales
      await loadData();
    } catch (error: any) {
      showToast(error.message || 'Error al cancelar el pedido', 'error');
    }
  };

  const filteredDeliveryPersons = deliveryPersons.filter(dp =>
    dp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dp.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDeliveryPersons = filteredDeliveryPersons.filter(dp => dp.isActive);
  const inactiveDeliveryPersons = filteredDeliveryPersons.filter(dp => !dp.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck size={28} className="text-primary-500" />
            Repartidores
            <HelpIcon
              title="Manual de Repartidores"
              content={
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">📋 Gestión de Repartidores</h3>
                    <p className="mb-2">En esta sección puedes gestionar los repartidores de tu restaurante y crear pedidos de delivery.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">✅ Repartidores Activos</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Abrir Caja:</strong> Antes de crear pedidos, debes abrir la caja del repartidor. Ingresa el monto inicial en efectivo que llevará de cambio.</li>
                      <li><strong>Ver Detalles:</strong> Haz clic en el botón "Ver Detalles" para ver los pedidos del repartidor y su estado de caja.</li>
                      <li><strong>Crear Pedido:</strong> Una vez abierta la caja, puedes crear pedidos de delivery para ese repartidor.</li>
                      <li><strong>Cerrar Caja:</strong> Al finalizar el turno, cierra la caja. El sistema mostrará un resumen de movimientos.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">🛒 Crear Pedido de Delivery</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Abre la caja del repartidor (si no está abierta).</li>
                      <li>Haz clic en "Crear Pedido" junto al repartidor.</li>
                      <li>Busca o ingresa los datos del cliente (nombre, teléfono, dirección).</li>
                      <li>Selecciona productos de las categorías disponibles.</li>
                      <li>Agrega subproductos si el producto los tiene (ej: tamaño, extras).</li>
                      <li>Selecciona el método de pago (efectivo, tarjeta, POS).</li>
                      <li>Agrega comentarios si es necesario.</li>
                      <li>Confirma el pedido.</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">💰 Gestión de Caja</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li><strong>Estado de Caja:</strong> Verás si la caja está abierta o cerrada con un indicador visual.</li>
                      <li><strong>Movimientos:</strong> Desde "Ver Detalles" puedes ver todos los movimientos de la caja (apertura, pedidos, cierre).</li>
                      <li><strong>Cerrar Caja:</strong> Al cerrar, puedes agregar notas sobre el cierre (opcional).</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">📊 Pedidos del Repartidor</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Puedes filtrar pedidos por estado: Todos, Preparando, En Camino, Completados, Cancelados.</li>
                      <li>Puedes cancelar pedidos que estén en estado "Preparando".</li>
                      <li>Cada pedido muestra el cliente, productos, total y método de pago.</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> Siempre abre la caja antes de crear pedidos. El sistema requiere que la caja esté abierta para registrar las transacciones correctamente.
                    </p>
                  </div>
                </div>
              }
            />
          </h1>
          <p className="text-gray-600 mt-1">Gestiona repartidores y crea pedidos de delivery</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar repartidor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Cash Register Status Banner */}
      {Object.values(cashRegisterStatuses).some(s => s.isOpen) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-700">
            <DollarSign size={20} />
            <span className="font-medium">
              {Object.values(cashRegisterStatuses).filter(s => s.isOpen).length} caja(s) abierta(s)
            </span>
          </div>
        </div>
      )}

      {/* Active Delivery Persons */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Repartidores Activos</h2>
        {activeDeliveryPersons.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay repartidores activos</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeliveryPersons.map(dp => {
              const status = cashRegisterStatuses[dp.id];
              const isOpen = status?.isOpen || false;
              
              return (
                <div
                  key={dp.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    isOpen ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{dp.name}</h3>
                      {dp.phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Phone size={14} />
                          {dp.phone}
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                    </div>
                  </div>

                  {/* Active Orders Section */}
                  {dp.activeOrders && dp.activeOrders.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 mt-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <ShoppingCart size={12} />
                          Pedidos Asignados
                        </h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          dp.activeOrders.length > 0
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {dp.activeOrders.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {dp.activeOrders.map((order) => (
                          <div key={order.id} className="bg-gray-50 rounded-lg p-2 border border-gray-100 hover:border-primary-200 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-primary-600">#{order.id}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                                order.status === 'delivering'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {order.status === 'delivering' ? 'En Camino' : 'Preparando'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-800 line-clamp-1">{order.customerName}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                              <MapPin size={10} />
                              <span className="line-clamp-1">{order.customerAddress}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    {!isOpen ? (
                      <button
                        onClick={() => handleOpenCashRegisterClick(dp.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                      >
                        <DollarSign size={16} />
                        Abrir Caja
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => openCreateOrderModal(dp.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm font-medium"
                        >
                          <Plus size={16} />
                          Crear Pedido
                        </button>
                        <button
                          onClick={async () => {
                            setSelectedDeliveryPerson(dp);
                            setLoadingOrdersForClose(true);
                            try {
                              // Recargar estado de caja para obtener el monto esperado calculado
                              const status = await api.getDeliveryPersonCashRegisterStatus(dp.id);
                              if (status && status.cashRegister) {
                                setCashRegisterStatuses(prev => ({
                                  ...prev,
                                  [dp.id]: status
                                }));
                              }
                              // Cargar pedidos completados antes de abrir el modal
                              await loadDeliveryPersonOrders(dp.id, true);
                            } finally {
                              setLoadingOrdersForClose(false);
                            }
                            setIsCloseCashRegisterModalOpen(true);
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                          disabled={loadingOrdersForClose}
                        >
                          {loadingOrdersForClose ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => openDetailsModal(dp)}
                      className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inactive Delivery Persons */}
      {inactiveDeliveryPersons.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Repartidores Inactivos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveDeliveryPersons.map(dp => (
              <div
                key={dp.id}
                className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 opacity-60"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{dp.name}</h3>
                    {dp.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone size={14} />
                        {dp.phone}
                      </p>
                    )}
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-600">
                    Inactivo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={isCreateOrderModalOpen}
        onClose={() => {
          setIsCreateOrderModalOpen(false);
          setOrderCustomerName('');
          setOrderCustomerAddress('');
          setOrderCustomerPhone('');
          setOrderItems([]);
          setOrderPaymentMethod('cash');
          setOrderComments('');
          setSelectedDeliveryPersonForOrder(null);
          setSelectedCustomer(null);
          setCustomerSearchTerm('');
          setFoundCustomers([]);
          setSelectedCategoryId(null);
          setSelectedProductId(null);
          setProductSubProducts([]);
          setSelectedSubProducts([]);
          setProductQuantity(1);
        }}
        title="Crear Pedido de Delivery"
      >
        <div className="space-y-4">
          {/* Búsqueda de Cliente */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Buscar Cliente (por nombre, teléfono o documento)
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={customerSearchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomerSearchTerm(value);
                      if (value.length >= 2) {
                        searchCustomers(value);
                      } else {
                        setFoundCustomers([]);
                      }
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Buscar por nombre, teléfono o documento..."
                    disabled={!!selectedCustomer}
                  />
                  {selectedCustomer && (
                    <button
                      onClick={handleClearCustomer}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Lista de clientes encontrados */}
              {isSearchingCustomers && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                  Buscando clientes...
                </div>
              )}
              {foundCustomers.length > 0 && !selectedCustomer && !isSearchingCustomers && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {foundCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{customer.name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.phone && <span>📱 {customer.phone}</span>}
                        {customer.documentNumber && (
                          <span className="ml-2">
                            {customer.documentType}: {customer.documentNumber}
                          </span>
                        )}
                      </div>
                      {customer.defaultAddress && (
                        <div className="text-xs text-gray-500 mt-1">📍 {customer.defaultAddress}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Cliente seleccionado */}
              {selectedCustomer && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-green-800">{selectedCustomer.name}</div>
                      <div className="text-sm text-green-600 mt-1">
                        {selectedCustomer.phone && <span>📱 {selectedCustomer.phone}</span>}
                        {selectedCustomer.documentNumber && (
                          <span className="ml-2">
                            {selectedCustomer.documentType}: {selectedCustomer.documentNumber}
                          </span>
                        )}
                      </div>
                      {selectedCustomer.defaultAddress && (
                        <div className="text-xs text-green-600 mt-1">📍 {selectedCustomer.defaultAddress}</div>
                      )}
                    </div>
                    <button
                      onClick={handleClearCustomer}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cliente - Campos manuales */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={orderCustomerName}
              onChange={(e) => setOrderCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Juan Pérez"
              disabled={!!selectedCustomer}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Dirección *
            </label>
            <input
              type="text"
              value={orderCustomerAddress}
              onChange={(e) => setOrderCustomerAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: Calle 123, Barrio Centro"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              value={orderCustomerPhone}
              onChange={(e) => setOrderCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ej: 099123456"
            />
          </div>

          {/* Productos */}
          <div className="space-y-3">
            {!selectedCategoryId ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Selecciona una Categoría
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {categories
                    .filter(cat => cat && typeof cat === 'object' && 'id' in cat && 'name' in cat)
                    .map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategoryId(category.id)}
                        className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                      >
                        {category.icon && category.icon.startsWith('/') ? (
                          <img 
                            src={category.icon} 
                            alt={category.name}
                            className="w-12 h-12 object-contain mb-2"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = document.createElement('span');
                              fallback.className = 'text-3xl mb-2';
                              fallback.textContent = '📦';
                              target.parentNode?.replaceChild(fallback, target);
                            }}
                          />
                        ) : (
                          <span className="text-3xl mb-2">{category.icon || '📦'}</span>
                        )}
                        <span className="text-sm font-medium text-gray-700 text-center">
                          {String(category.name || '').trim() || 'Sin nombre'}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSelectedProductId(null);
                    setProductSubProducts([]);
                    setSelectedSubProducts([]);
                  }}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  ← Volver a Categorías
                </button>

                <div className="flex items-center gap-2 pb-2 border-b">
                  {(() => {
                    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                    const icon = selectedCategory?.icon;
                    return icon && icon.startsWith('/') ? (
                      <img 
                        src={icon} 
                        alt={selectedCategory?.name || 'Categoría'}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = document.createElement('span');
                          fallback.className = 'text-2xl';
                          fallback.textContent = '📦';
                          target.parentNode?.replaceChild(fallback, target);
                        }}
                      />
                    ) : (
                      <span className="text-2xl">{icon || '📦'}</span>
                    );
                  })()}
                  <span className="text-lg font-semibold text-gray-800">
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Selecciona un Producto
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {products
                      .filter(p => p.categoryId === selectedCategoryId && p.isAvailable)
                      .map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product.id)}
                          className={`p-3 border-2 rounded-lg text-left transition-all ${
                            selectedProductId === product.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {product.description}
                            </div>
                          )}
                          <div className="text-sm font-bold text-primary-600 mt-2">
                            ${product.price.toFixed(2)}
                          </div>
                        </button>
                      ))}
                  </div>

                  {products.filter(p => p.categoryId === selectedCategoryId && p.isAvailable).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay productos disponibles en esta categoría
                    </div>
                  )}
                </div>

                {selectedProductId && productSubProducts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <label className="block text-sm font-medium text-gray-700">
                      Guarniciones (opcional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {productSubProducts.map((subProduct) => (
                        <label
                          key={subProduct.id}
                          className="flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSubProducts.includes(subProduct.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSubProducts([...selectedSubProducts, subProduct.id]);
                              } else {
                                setSelectedSubProducts(selectedSubProducts.filter(id => id !== subProduct.id));
                              }
                            }}
                            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">{subProduct.name}</div>
                            <div className="text-xs text-primary-600">+${subProduct.price.toFixed(2)}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProductId && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex gap-2 items-center">
                      <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                      <input
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(1, Number(e.target.value) || 1))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleAddProductToOrder}
                      className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Agregar al Pedido
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items del pedido */}
          {orderItems.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Productos agregados:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {orderItems.map((item, idx) => {
                  const itemTotal = item.price * item.quantity;
                  const subProductsTotal = (item.subProducts || []).reduce((sum, sp) => sum + sp.price, 0);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.quantity}x {item.name}</div>
                        {item.subProducts && item.subProducts.length > 0 && (
                          <div className="text-xs text-gray-600">
                            {item.subProducts.map(sp => sp.name).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${(itemTotal + subProductsTotal).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Método de Pago
            </label>
            <select
              value={orderPaymentMethod}
              onChange={(e) => setOrderPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {paymentMethods.map(method => (
                <option key={method.name} value={method.name}>
                  {method.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Comentarios */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Comentarios
            </label>
            <textarea
              value={orderComments}
              onChange={(e) => setOrderComments(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setIsCreateOrderModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateOrder}
              disabled={isCreatingOrder || orderItems.length === 0 || !orderCustomerName.trim() || !orderCustomerAddress.trim()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingOrder ? 'Creando...' : 'Crear y Asignar Pedido'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDeliveryPerson(null);
          setDeliveryPersonOrders([]);
          setOrderFilter('all');
        }}
        title={`Repartidor: ${selectedDeliveryPerson?.name}`}
      >
        {selectedDeliveryPerson && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Información</h4>
              <p><strong>Teléfono:</strong> {selectedDeliveryPerson.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedDeliveryPerson.email || 'N/A'}</p>
              <p><strong>Usuario:</strong> {selectedDeliveryPerson.username || 'N/A'}</p>
            </div>

            {/* Estadísticas de la sesión */}
            {cashRegisterStatuses[selectedDeliveryPerson.id]?.isOpen && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium mb-3 text-blue-900">Estadísticas de la Sesión</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Total Pedidos</p>
                    <p className="text-2xl font-bold text-blue-900">{deliveryPersonOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Total Cobrado</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${deliveryPersonOrders
                        .filter(o => o.status === 'completed' || o.status === 'delivered')
                        .reduce((sum, o) => sum + o.total, 0)
                        .toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">En Preparación</p>
                    <p className="text-xl font-semibold text-orange-600">
                      {deliveryPersonOrders.filter(o => o.status === 'preparing').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">En Camino</p>
                    <p className="text-xl font-semibold text-purple-600">
                      {deliveryPersonOrders.filter(o => o.status === 'delivering').length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros de pedidos */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">
                  Pedidos Asignados
                </h4>
                {deliveryPersonOrders.length > 0 && (
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                    {(['all', 'preparing', 'delivering', 'completed', 'cancelled'] as const).map(filter => (
                      <button
                        key={filter}
                        onClick={() => setOrderFilter(filter)}
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          orderFilter === filter
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {filter === 'all' ? 'Todos' :
                         filter === 'preparing' ? 'Preparando' :
                         filter === 'delivering' ? 'En Camino' :
                         filter === 'completed' ? 'Completados' :
                         'Cancelados'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {deliveryPersonOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos asignados</p>
              ) : (() => {
                const filteredOrders = orderFilter === 'all' 
                  ? deliveryPersonOrders 
                  : deliveryPersonOrders.filter(o => o.status === orderFilter);
                
                if (filteredOrders.length === 0) {
                  return (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No hay pedidos con este estado</p>
                      {orderFilter === 'delivering' && (
                        <p className="text-sm text-gray-400 mt-2">
                          Los pedidos en camino aparecerán aquí cuando se asignen al repartidor
                        </p>
                      )}
                    </div>
                  );
                }

                // Agrupar por estado
                const ordersByStatus = filteredOrders.reduce((acc, order) => {
                  if (!acc[order.status]) acc[order.status] = [];
                  acc[order.status].push(order);
                  return acc;
                }, {} as Record<string, Order[]>);

                return (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(ordersByStatus).map(([status, orders]) => (
                      <div key={status} className="border rounded-lg p-3">
                        <h5 className="font-medium mb-2 text-sm text-gray-700">
                          {status === 'preparing' ? '🟠 Preparando' :
                           status === 'delivering' ? '🟣 En Camino' :
                           status === 'completed' ? '✅ Completados' :
                           status === 'delivered' ? '✅ Entregados' :
                           '❌ Cancelados'} ({orders.length})
                        </h5>
                        <div className="space-y-2">
                          {orders.map(order => (
                            <div key={order.id} className="bg-gray-50 rounded p-3 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">Pedido #{order.id}</p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    <strong>Cliente:</strong> {order.customerName}
                                  </p>
                                  {order.customerPhone && (
                                    <p className="text-xs text-gray-600">
                                      📱 {order.customerPhone}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-600 mt-1">
                                    📍 {order.customerAddress}
                                  </p>
                                  {order.paymentMethod && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      💳 {order.paymentMethod}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-green-600">
                                    ${order.total.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(order.createdAt).toLocaleTimeString('es-ES', { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                </div>
                              </div>
                              {order.items && order.items.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Productos:</p>
                                  <div className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="text-xs text-gray-600">
                                        {item.quantity}x {item.productName} - ${item.subtotal.toFixed(2)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {order.comments && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-xs text-gray-500">
                                    <strong>Notas:</strong> {order.comments}
                                  </p>
                                </div>
                              )}
                              {/* Botones de acción para pedidos activos */}
                              {order.status === 'delivering' && (
                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={async () => {
                                        try {
                                          await api.updateOrderStatus(order.id, 'completed');
                                          showToast('Pedido finalizado exitosamente', 'success');
                                          // Recargar pedidos del repartidor
                                          if (selectedDeliveryPerson) {
                                            await loadDeliveryPersonOrders(selectedDeliveryPerson.id, true);
                                          }
                                        } catch (error: any) {
                                          showToast(error.message || 'Error al finalizar el pedido', 'error');
                                        }
                                      }}
                                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium transition-colors"
                                    >
                                      <CheckCircle size={16} />
                                      Entregado
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOrderToCancel(order);
                                        setIsCancelOrderModalOpen(true);
                                      }}
                                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
                                    >
                                      <Ban size={16} />
                                      Rechazar
                                    </button>
                                  </div>
                                </div>
                              )}
                              {order.status === 'preparing' && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <button
                                    onClick={() => {
                                      setOrderToCancel(order);
                                      setIsCancelOrderModalOpen(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                                  >
                                    <XCircle size={16} />
                                    Cancelar Pedido
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <ConfirmModal
        isOpen={isCancelOrderModalOpen}
        onClose={() => {
          setIsCancelOrderModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={handleCancelOrder}
        title="Cancelar Pedido"
        message={
          orderToCancel
            ? `¿Estás seguro de que deseas cancelar el pedido #${orderToCancel.id} de ${orderToCancel.customerName}?`
            : '¿Estás seguro de que deseas cancelar este pedido?'
        }
        confirmText="Cancelar Pedido"
        cancelText="No Cancelar"
        type="danger"
      />

      {/* Close Cash Register Modal */}
      <Modal
        isOpen={isCloseCashRegisterModalOpen}
        onClose={() => {
          setIsCloseCashRegisterModalOpen(false);
          setCloseNotes('');
          setActualCashAmount('');
        }}
        title="Cerrar Caja"
      >
        <div className="space-y-4">
          {loadingOrdersForClose ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Cargando pedidos...</span>
            </div>
          ) : (() => {
            const cashRegister = selectedDeliveryPerson 
              ? cashRegisterStatuses[selectedDeliveryPerson.id]?.cashRegister 
              : null;
            const initialAmount = cashRegister?.initialAmount || 0;
            const openedAt = cashRegister?.openedAt ? new Date(cashRegister.openedAt) : null;
            
            // Si el backend ya calculó el monto esperado, usarlo directamente (más confiable)
            const backendExpectedAmount = cashRegister?.expectedAmount;
            const backendTotalCash = cashRegister?.totalCash;
            
            // Filtrar pedidos completados de esta sesión de caja (desde que se abrió)
            // El backend ya debería estar filtrando por fecha, pero por si acaso lo hacemos aquí también
            const completedOrders = deliveryPersonOrders.filter(o => {
              if (o.status !== 'completed') return false;
              if (!openedAt) return true; // Si no hay fecha de apertura, incluir todos
              const orderDate = new Date(o.createdAt);
              return orderDate >= openedAt;
            });
            
            // Calcular total en efectivo de pedidos completados de esta sesión (fallback si el backend no lo calculó)
            // El método de pago puede venir como "cash", "efectivo", o el displayName
            const cashOrders = completedOrders.filter(
              o => {
                const method = (o.paymentMethod || '').toLowerCase().trim();
                // Verificar si es efectivo: puede ser "cash", "efectivo", o contener "efectivo"
                return method === 'cash' || 
                       method === 'efectivo' || 
                       method.includes('efectivo') ||
                       method === 'efectivo al entregar';
              }
            );
            const frontendTotalCash = cashOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            
            // Usar el monto esperado del backend si está disponible (más confiable), sino calcularlo
            const totalCash = backendTotalCash !== undefined && backendTotalCash !== null
              ? Number(backendTotalCash)
              : frontendTotalCash;
            const expectedAmount = backendExpectedAmount !== undefined && backendExpectedAmount !== null
              ? Number(backendExpectedAmount)
              : Number(initialAmount) + totalCash;
            
            console.log('Cash Register:', cashRegister);
            console.log('Initial Amount:', initialAmount);
            console.log('Backend Total Cash:', backendTotalCash);
            console.log('Backend Expected Amount:', backendExpectedAmount);
            console.log('Frontend Total Cash:', frontendTotalCash);
            console.log('Final Expected Amount:', expectedAmount);
            
            return (
              <>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Resumen de Caja</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto inicial:</span>
                      <span className="font-medium">${initialAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pedidos completados:</span>
                      <span className="font-medium">{completedOrders.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pedidos en efectivo:</span>
                      <span className="font-medium">${totalCash.toFixed(2)} ({cashOrders.length} pedidos)</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="font-semibold text-blue-900">Monto esperado:</span>
                      <span className="font-bold text-blue-900 text-lg">${expectedAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Lista de pedidos entregados */}
                {completedOrders.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Pedidos Entregados ({completedOrders.length})</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {completedOrders.map(order => (
                        <div key={order.id} className="bg-white rounded p-3 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium text-sm">Pedido #{order.id}</div>
                              <div className="text-xs text-gray-600">{order.customerName}</div>
                              <div className="text-xs text-gray-500">{order.customerAddress}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">${order.total.toFixed(2)}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {order.paymentMethod?.toLowerCase() || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString('es-ES')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto en efectivo que tiene el repartidor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualCashAmount}
                    onChange={(e) => setActualCashAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {actualCashAmount && parseFloat(actualCashAmount) !== expectedAmount && (
                    <p className="mt-1 text-sm text-red-600">
                      El monto ingresado (${parseFloat(actualCashAmount || '0').toFixed(2)}) no coincide con el esperado (${expectedAmount.toFixed(2)})
                    </p>
                  )}
                  {actualCashAmount && parseFloat(actualCashAmount) === expectedAmount && (
                    <p className="mt-1 text-sm text-green-600">
                      ✓ El monto coincide correctamente
                    </p>
                  )}
                </div>
                
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
                      setIsCloseCashRegisterModalOpen(false);
                      setCloseNotes('');
                      setActualCashAmount('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCloseCashRegister}
                    disabled={!actualCashAmount || parseFloat(actualCashAmount) < 0}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cerrar Caja
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      </Modal>

      {/* Open Cash Register Modal */}
      <Modal
        isOpen={isOpenCashRegisterModalOpen}
        onClose={() => {
          setIsOpenCashRegisterModalOpen(false);
          setInitialAmount('0');
          setSelectedDeliveryPersonForCashRegister(null);
        }}
        title="Abrir Caja de Repartidor"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ingresa el monto en efectivo que el repartidor llevará de cambio.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto Inicial en Efectivo *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsOpenCashRegisterModalOpen(false);
                setInitialAmount('0');
                setSelectedDeliveryPersonForCashRegister(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleOpenCashRegister}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Abrir Caja
            </button>
          </div>
        </div>
      </Modal>

      {/* Movements Modal */}
      <Modal
        isOpen={isMovementsModalOpen}
        onClose={() => {
          setIsMovementsModalOpen(false);
          setCashRegisterMovements(null);
        }}
        title="Movimientos de Caja"
      >
        {cashRegisterMovements && (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium mb-3">Resumen</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Monto Inicial:</span>
                  <span className="font-medium ml-2">${cashRegisterMovements.cashRegister.initialAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Monto Final:</span>
                  <span className="font-medium ml-2">${cashRegisterMovements.cashRegister.finalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Ventas:</span>
                  <span className="font-medium ml-2 text-green-600">${cashRegisterMovements.summary.totalSales.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Pedidos:</span>
                  <span className="font-medium ml-2">{cashRegisterMovements.summary.totalOrders}</span>
                </div>
                <div>
                  <span className="text-gray-600">Efectivo:</span>
                  <span className="font-medium ml-2">${cashRegisterMovements.summary.totalCash.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">POS:</span>
                  <span className="font-medium ml-2">${cashRegisterMovements.summary.totalPOS.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Transferencia:</span>
                  <span className="font-medium ml-2">${cashRegisterMovements.summary.totalTransfer.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Movimientos */}
            <div>
              <h4 className="font-medium mb-2">Pedidos ({cashRegisterMovements.movements.length})</h4>
              {cashRegisterMovements.movements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos en esta sesión</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cashRegisterMovements.movements.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          {order.customerAddress && (
                            <p className="text-xs text-gray-500">{order.customerAddress}</p>
                          )}
                          {order.items && order.items.length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {order.items.slice(0, 2).map((item: any, idx: number) => (
                                <div key={idx}>{item.quantity}x {item.productName}</div>
                              ))}
                              {order.items.length > 2 && <div>+{order.items.length - 2} más...</div>}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs ${
                            order.paymentMethod?.toLowerCase() === 'cash' ? 'bg-green-100 text-green-700' :
                            order.paymentMethod?.toLowerCase() === 'pos' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {order.paymentMethod || 'N/A'}
                          </span>
                          <p className="text-sm font-medium text-green-600 mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
