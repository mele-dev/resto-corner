import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, MapPin, Phone, User, CreditCard, LogOut, Package, Truck, AlertCircle, Clock, ChevronDown, ChevronUp, MessageCircle, Store, UserPlus } from 'lucide-react';
import { useToast } from '../components/Toast/ToastContext';
import { api } from '../api/client';
import Modal from '../components/Modal/Modal';
import type { Product, Category, PaymentMethod, CreateOrderRequest, Order } from '../types';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subProducts?: Array<{ id: number; name: string; price: number }>;
}

export default function CustomerOrderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPoints, setCustomerPoints] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [comments, setComments] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [availableDeliveryPersons, setAvailableDeliveryPersons] = useState<Array<{ id: number; name: string; phone?: string }>>([]);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<number | null>(null);
  const [businessStatus, setBusinessStatus] = useState<{ isOpen: boolean; isWithinHours: boolean; message: string } | null>(null);
  const [deliveringOrders, setDeliveringOrders] = useState<Order[]>([]);
  const [isOrdersSectionOpen, setIsOrdersSectionOpen] = useState(false);
  const [isRestaurantsModalOpen, setIsRestaurantsModalOpen] = useState(false);
  const [availableRestaurants, setAvailableRestaurants] = useState<Array<{ id: number; name: string; address?: string; phone?: string }>>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<number | null>(null);

  useEffect(() => {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('customer_token');
    const user = localStorage.getItem('customer_user');
    
    if (!token || !user) {
      navigate('/clientes/login');
      return;
    }

    // Cargar datos del usuario
    try {
      const userData = JSON.parse(user);
      setCustomerName(userData.name || '');
      setCustomerAddress(userData.defaultAddress || '');
      setCustomerPhone(userData.phone || '');
      setCustomerPoints(userData.points || 0);
      
      // Cargar nombre del restaurante
      if (userData.restaurantId) {
        setCurrentRestaurantId(userData.restaurantId);
        loadRestaurantName(userData.restaurantId);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }

    loadData();
    loadBusinessStatus();
    loadAvailableDeliveryPersons();
    
    // Cargar pedidos en camino después de un pequeño delay para asegurar que el token esté disponible
    const loadOrdersTimeout = setTimeout(() => {
      loadDeliveringOrders();
    }, 1000);
    
    // Polling cada 15 segundos para actualizar pedidos en camino
    const interval = setInterval(() => {
      loadDeliveringOrders();
    }, 15000);
    
    return () => {
      clearTimeout(loadOrdersTimeout);
      clearInterval(interval);
    };
  }, [navigate]);

  const loadRestaurantName = async (id: number) => {
    try {
      const response = await fetch(`/api/restaurants/${id}`);
      if (response.ok) {
        const restaurant = await response.json();
        setRestaurantName(restaurant.name || '');
      }
    } catch (error) {
      console.error('Error loading restaurant name:', error);
    }
  };

  const openWhatsApp = (order: Order) => {
    if (!order.deliveryPerson?.phone) {
      showToast('El repartidor no tiene número de teléfono registrado', 'error');
      return;
    }

    // Limpiar el número de teléfono (remover espacios, guiones, paréntesis, etc.)
    const cleanPhone = order.deliveryPerson.phone.replace(/[\s\-\(\)]/g, '');
    
    // Asegurar que tenga el código de país (si no lo tiene, asumir Uruguay +598)
    let phoneNumber = cleanPhone;
    if (!phoneNumber.startsWith('+')) {
      // Si no empieza con +, agregar código de Uruguay
      if (phoneNumber.startsWith('598')) {
        phoneNumber = '+' + phoneNumber;
      } else if (phoneNumber.startsWith('0')) {
        // Si empieza con 0, reemplazar por +598
        phoneNumber = '+598' + phoneNumber.substring(1);
      } else {
        // Si no tiene código, agregar +598
        phoneNumber = '+598' + phoneNumber;
      }
    }

    // Crear mensaje personalizado
    const message = `Hola ${order.deliveryPerson.name}! 👋\n\n` +
      `Te escribo sobre mi pedido #${order.orderNumber || order.id}.\n\n` +
      `¿Podrías darme una actualización sobre el estado de mi pedido?\n\n` +
      `Gracias! 😊`;

    // Codificar el mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Crear enlace de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(whatsappUrl, '_blank');
  };

  const loadDeliveringOrders = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        console.log('No hay token de cliente, no se pueden cargar pedidos');
        return;
      }

      console.log('Cargando pedidos del cliente...');
      const response = await api.getMyOrders({ page: 1, pageSize: 50 });
      
      console.log('Respuesta de getMyOrders:', response);
      
      // El backend puede devolver response.data o response directamente
      const ordersArray = response?.data || response || [];
      
      console.log('Pedidos obtenidos:', ordersArray.length);
      
      if (Array.isArray(ordersArray) && ordersArray.length > 0) {
        const now = new Date().getTime();
        const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutos en milisegundos
        
        // Filtrar pedidos en estado "delivering" que tengan menos de 5 minutos desde updatedAt
        const delivering = ordersArray.filter(order => {
          if (order.status !== 'delivering') {
            console.log(`Pedido ${order.id} no está en delivering, status: ${order.status}`);
            return false;
          }
          
          const updatedAt = new Date(order.updatedAt).getTime();
          const timeSinceUpdate = now - updatedAt;
          
          console.log(`Pedido ${order.id} en delivering, tiempo desde update: ${Math.floor(timeSinceUpdate / 60000)} minutos`);
          
          // Si el tiempo es negativo (problema de zona horaria), considerar que es reciente (0 minutos)
          // Solo mostrar si tiene menos de 5 minutos desde que se puso en delivering
          const shouldShow = timeSinceUpdate < fiveMinutesInMs || timeSinceUpdate < 0;
          if (!shouldShow) {
            console.log(`Pedido ${order.id} tiene más de 5 minutos, no se mostrará`);
          }
          return shouldShow;
        });
        
        console.log('Pedidos en camino encontrados:', delivering.length);
        // Debug: verificar información del repartidor
        delivering.forEach(order => {
          if (order.deliveryPerson) {
            console.log(`Pedido ${order.id} - Repartidor:`, {
              name: order.deliveryPerson.name,
              phone: order.deliveryPerson.phone,
              hasPhone: !!order.deliveryPerson.phone
            });
          } else {
            console.log(`Pedido ${order.id} - No tiene repartidor asignado`);
          }
        });
        setDeliveringOrders(delivering);
      } else {
        console.log('No hay pedidos o la respuesta está vacía');
        setDeliveringOrders([]);
      }
    } catch (error) {
      console.error('Error loading delivering orders:', error);
      // No mostrar error al usuario, solo loguear
      setDeliveringOrders([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('customer_token');
      
      if (!token) {
        showToast('No estás autenticado', 'error');
        navigate('/clientes/login');
        return;
      }

      // Usar endpoints autenticados que filtran por RestaurantId del token
      const [productsData, categoriesData, paymentMethodsData] = await Promise.all([
        fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) throw new Error('Error al cargar productos');
          return res.json();
        }).catch(() => []),
        fetch('/api/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) throw new Error('Error al cargar categorías');
          return res.json();
        }).catch(() => []),
        fetch('/api/orders/payment-methods', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) throw new Error('Error al cargar métodos de pago');
          return res.json();
        }).catch(() => []),
      ]);
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setPaymentMethods(Array.isArray(paymentMethodsData) ? paymentMethodsData : []);
    } catch (error) {
      showToast('Error al cargar productos', 'error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinessStatus = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) return;

      const response = await fetch('/api/orders/business-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        setBusinessStatus({
          isOpen: status.isOpen || false,
          isWithinHours: status.isWithinHours || false,
          message: status.message || 'El negocio está cerrado'
        });
      }
    } catch (error) {
      console.error('Error al cargar estado del negocio:', error);
    }
  };

  const loadAvailableDeliveryPersons = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) return;

      const response = await fetch('/api/orders/available-delivery-persons', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const deliveryPersons = await response.json();
        setAvailableDeliveryPersons(Array.isArray(deliveryPersons) ? deliveryPersons : []);
      } else {
        setAvailableDeliveryPersons([]);
      }
    } catch (error) {
      console.error('Error al cargar repartidores disponibles:', error);
      setAvailableDeliveryPersons([]);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
    showToast(`${product.name} agregado al carrito`, 'success');
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      showToast('Agrega al menos un producto al carrito', 'error');
      return;
    }

    if (!customerName.trim() || !customerAddress.trim()) {
      showToast('Nombre y dirección son requeridos', 'error');
      return;
    }

    // Validar horario del negocio
    if (businessStatus && (!businessStatus.isOpen || !businessStatus.isWithinHours)) {
      showToast(businessStatus.message || 'El negocio está cerrado en este momento', 'error');
      return;
    }

    // Validar que haya repartidores disponibles si no se seleccionó uno
    if (availableDeliveryPersons.length === 0 && !selectedDeliveryPersonId) {
      showToast('No hay repartidores disponibles en este momento. Por favor, intenta más tarde.', 'error');
      return;
    }

    // Validar comprobante si es transferencia
    const isTransfer = selectedPaymentMethod.toLowerCase().includes('transfer') || 
                       selectedPaymentMethod.toLowerCase().includes('transferencia');
    if (isTransfer && !receiptImage) {
      showToast('Debes adjuntar el comprobante de transferencia', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData: CreateOrderRequest = {
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod: selectedPaymentMethod,
        comments: comments.trim() || undefined,
        receiptImage: receiptImage || undefined,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subProducts: item.subProducts
        })),
        // Flag para indicar que viene de clientesDelivery y requiere repartidor
        source: 'clientesDelivery',
        // Asignar repartidor si se seleccionó uno
        deliveryPersonId: selectedDeliveryPersonId || undefined
      };

      const token = localStorage.getItem('customer_token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear el pedido');
      }

      const order = await response.json();
      const orderDisplayNumber = order.orderNumber || order.id;
      showToast(`Pedido #${orderDisplayNumber} creado exitosamente. Será asignado a un repartidor.`, 'success');
      
      // Limpiar carrito y formulario
      setCart([]);
      setComments('');
      setReceiptImage(null);
      setReceiptImagePreview(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear el pedido';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/clientes/login');
  };

  const openRestaurantsModal = async () => {
    setIsRestaurantsModalOpen(true);
    await loadAvailableRestaurants();
  };

  const loadAvailableRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await fetch('/api/restaurants');
      
      if (!response.ok) {
        throw new Error('Error al cargar restaurantes');
      }

      const data = await response.json();
      // Filtrar el restaurante actual
      const filtered = data.filter((r: { id: number }) => r.id !== currentRestaurantId);
      setAvailableRestaurants(filtered);
    } catch (error) {
      showToast('Error al cargar restaurantes', 'error');
      console.error(error);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleRegisterToRestaurant = (restaurantId: number) => {
    // Redirigir a la página de registro con el restaurante pre-seleccionado
    navigate(`/clientes/registro?restaurantId=${restaurantId}`);
  };

  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);

  const filteredProducts = selectedCategoryId
    ? products.filter(p => p.categoryId === selectedCategoryId)
    : products;

  // Separar productos recomendados
  const recommendedProducts = products.filter(p => p.isRecommended && p.isAvailable);
  const regularProducts = filteredProducts.filter(p => !p.isRecommended || !p.isAvailable);
  
  // Si solo se muestran recomendados, filtrar productos
  const displayProducts = showRecommendedOnly 
    ? recommendedProducts.filter(p => !selectedCategoryId || p.categoryId === selectedCategoryId)
    : regularProducts;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 w-full overflow-x-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={24} className="text-primary-500 sm:w-7 sm:h-7" />
              <span className="whitespace-nowrap">Realizar Pedido</span>
            </h1>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={openRestaurantsModal}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base whitespace-nowrap"
                title="Ver otros restaurantes"
              >
                <Store size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Restaurantes</span>
                <span className="sm:hidden">Rest.</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <LogOut size={18} className="sm:w-5 sm:h-5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
            {restaurantName && (
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={14} className="text-primary-500 sm:w-4 sm:h-4" />
                <span className="font-semibold">Restaurante:</span>
                <span className="text-primary-600 font-bold">{restaurantName}</span>
              </div>
            )}
            {customerPoints !== undefined && customerPoints !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
                <span className="text-lg sm:text-xl font-bold">⭐</span>
                <span className="font-bold">{customerPoints}</span>
                <span className="hidden sm:inline">puntos</span>
                <span className="sm:hidden">pts</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección Mis Pedidos - Solo pedidos en camino (Desplegable) */}
      {deliveringOrders.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-4 w-full">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-lg border-2 border-purple-300 overflow-hidden w-full">
            {/* Botón para expandir/colapsar */}
            <button
              onClick={() => setIsOrdersSectionOpen(!isOrdersSectionOpen)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Truck size={20} className="text-purple-600 flex-shrink-0 sm:w-6 sm:h-6" />
                <h2 className="text-base sm:text-xl font-bold text-gray-800 truncate">Mis Pedidos en Camino</h2>
                <span className="px-2 py-1 bg-purple-200 text-purple-700 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
                  {deliveringOrders.length}
                </span>
              </div>
              <div className="flex-shrink-0 ml-2">
                {isOrdersSectionOpen ? (
                  <ChevronUp size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                ) : (
                  <ChevronDown size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                )}
              </div>
            </button>
            
            {/* Contenido desplegable */}
            {isOrdersSectionOpen && (
              <div className="px-3 sm:px-4 pb-4 w-full overflow-x-hidden">
                <div className="space-y-3">
                  {deliveringOrders.map(order => {
                // Asegurar que la fecha se parsea correctamente
                // updatedAt puede venir como string ISO desde el backend
                const updatedAt = order.updatedAt ? new Date(order.updatedAt) : new Date();
                
                const now = new Date();
                const diffMs = now.getTime() - updatedAt.getTime();
                const minutesAgo = Math.floor(diffMs / 60000);
                
                // Si el tiempo es negativo (problema de zona horaria o fecha futura), 
                // considerar que es reciente (0 minutos)
                const validMinutesAgo = Math.max(0, minutesAgo);
                const remainingMinutes = Math.max(0, 5 - validMinutesAgo);
                
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-md p-3 sm:p-4 border-l-4 border-purple-500 w-full overflow-x-hidden">
                    <div className="flex flex-col gap-3">
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Truck size={18} className="text-purple-600 flex-shrink-0 sm:w-5 sm:h-5" />
                          <span className="font-bold text-gray-800 text-sm sm:text-base">
                            Pedido #{order.orderNumber || order.id}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex-shrink-0">
                            En Camino
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                          <div className="flex flex-wrap items-center gap-1">
                            <Clock size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                            <span>Hace {validMinutesAgo} minuto{validMinutesAgo !== 1 ? 's' : ''}</span>
                            {remainingMinutes > 0 && (
                              <span className="text-purple-600 font-semibold">
                                • Se ocultará en {remainingMinutes} minuto{remainingMinutes !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          {order.deliveryPerson && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-1 min-w-0">
                                <User size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                <span className="break-words">Repartidor: {order.deliveryPerson.name}</span>
                              </div>
                              {order.deliveryPerson.phone && (
                                <button
                                  onClick={() => openWhatsApp(order)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm font-medium shadow-sm whitespace-nowrap w-full sm:w-auto justify-center"
                                  title="Enviar mensaje por WhatsApp"
                                >
                                  <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                                  <span>WhatsApp</span>
                                </button>
                              )}
                            </div>
                          )}
                          <div className="flex items-start gap-1">
                            <MapPin size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0 mt-0.5" />
                            <span className="break-words">{order.customerAddress}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <span className="font-semibold text-gray-800">Total: ${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Productos Recomendados - Primero y siempre visible */}
            {recommendedProducts.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-4 border-2 border-yellow-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <h2 className="text-xl font-bold text-gray-800">Productos Recomendados</h2>
                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                      {recommendedProducts.length}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map(product => (
                    <div key={product.id} className="bg-white border-2 border-yellow-400 rounded-lg overflow-hidden hover:shadow-lg transition-all transform hover:scale-105">
                      {product.image && (
                        <div className="w-full h-48 overflow-hidden bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1 mb-1">
                              <h3 className="font-bold text-gray-800">{product.name}</h3>
                              <span className="text-yellow-500">⭐</span>
                            </div>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2 font-medium"
                          >
                            <Plus size={18} />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías y Filtros */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Productos</h2>
                {recommendedProducts.length > 0 && (
                  <button
                    onClick={() => {
                      setShowRecommendedOnly(!showRecommendedOnly);
                      setSelectedCategoryId(null);
                    }}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm font-medium ${
                      showRecommendedOnly
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {showRecommendedOnly ? '⭐ Ver Todos' : '⭐ Solo Recomendados'}
                  </button>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setShowRecommendedOnly(false);
                  }}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                    selectedCategoryId === null && !showRecommendedOnly
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setShowRecommendedOnly(false);
                    }}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                      selectedCategoryId === category.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Productos */}
            <div className="bg-white rounded-lg shadow-md p-4">
              {displayProducts.length === 0 && recommendedProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay productos disponibles</p>
              ) : displayProducts.length === 0 && showRecommendedOnly ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No hay productos recomendados en esta categoría</p>
                  <button
                    onClick={() => {
                      setShowRecommendedOnly(false);
                      setSelectedCategoryId(null);
                    }}
                    className="text-primary-500 hover:text-primary-600 font-medium"
                  >
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayProducts.map(product => (
                    <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all">
                      {product.image && (
                        <div className="w-full h-48 overflow-hidden bg-gray-100">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{product.name}</h3>
                            {product.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-primary-600 text-lg">${product.price.toFixed(2)}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                          >
                            <Plus size={18} />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Carrito y Checkout */}
          <div className="space-y-4">
            {/* Carrito */}
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ShoppingCart size={24} />
                Carrito ({cart.length})
              </h2>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">${item.price.toFixed(2)} c/u</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 hover:bg-red-100 text-red-600 rounded ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-primary-600">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Formulario de Checkout */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Datos de Entrega</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User size={16} className="inline mr-1" />
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin size={16} className="inline mr-1" />
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Calle y número"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone size={16} className="inline mr-1" />
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="099123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <CreditCard size={16} className="inline mr-1" />
                      Método de Pago *
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => {
                        setSelectedPaymentMethod(e.target.value);
                        if (!e.target.value.toLowerCase().includes('transfer')) {
                          setReceiptImage(null);
                          setReceiptImagePreview(null);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.id} value={method.name}>
                          {method.displayName || method.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Repartidor */}
                  {availableDeliveryPersons.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Truck size={16} className="inline mr-1" />
                        Repartidor (Opcional)
                      </label>
                      <select
                        value={selectedDeliveryPersonId || ''}
                        onChange={(e) => setSelectedDeliveryPersonId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar repartidor (o asignar desde cocina)</option>
                        {availableDeliveryPersons.map(deliveryPerson => (
                          <option key={deliveryPerson.id} value={deliveryPerson.id}>
                            {deliveryPerson.name} {deliveryPerson.phone ? `(${deliveryPerson.phone})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Si no seleccionas un repartidor, se asignará uno desde cocina
                      </p>
                    </div>
                  )}

                  {/* Alerta si no hay repartidores disponibles */}
                  {availableDeliveryPersons.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-800">No hay repartidores disponibles</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          El pedido será asignado a un repartidor desde cocina cuando esté disponible
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Comprobante para transferencia */}
                  {(selectedPaymentMethod.toLowerCase().includes('transfer') || 
                    selectedPaymentMethod.toLowerCase().includes('transferencia')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comprobante de Transferencia {receiptImage ? '(Adjuntado)' : '*'}
                      </label>
                      {receiptImagePreview ? (
                        <div className="relative">
                          <img
                            src={receiptImagePreview}
                            alt="Vista previa"
                            className="w-full max-h-32 object-contain border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptImage(null);
                              setReceiptImagePreview(null);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            id="receipt-upload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64String = reader.result as string;
                                  setReceiptImage(base64String);
                                  setReceiptImagePreview(base64String);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <label
                            htmlFor="receipt-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Package size={24} className="text-gray-400" />
                            <span className="text-sm text-gray-600">Haz clic para adjuntar comprobante</span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentarios
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Instrucciones especiales..."
                    />
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Realizar Pedido (${calculateTotal().toFixed(2)})
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Restaurantes */}
      <Modal
        isOpen={isRestaurantsModalOpen}
        onClose={() => setIsRestaurantsModalOpen(false)}
        title="Otros Restaurantes"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Selecciona un restaurante para registrarte y poder hacer pedidos desde allí.
          </p>
          
          {loadingRestaurants ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : availableRestaurants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Store size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No hay otros restaurantes disponibles</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Store size={20} className="text-primary-500" />
                        {restaurant.name}
                      </h3>
                      {restaurant.address && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin size={14} />
                          {restaurant.address}
                        </p>
                      )}
                      {restaurant.phone && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <Phone size={14} />
                          {restaurant.phone}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRegisterToRestaurant(restaurant.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      <UserPlus size={16} />
                      Registrarse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
