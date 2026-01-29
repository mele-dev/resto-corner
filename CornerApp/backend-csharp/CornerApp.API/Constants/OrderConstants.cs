namespace CornerApp.API.Constants;

/// <summary>
/// Constantes relacionadas con pedidos
/// </summary>
public static class OrderConstants
{
    // Estados de pedidos
    // Flujo: pending → preparing → delivering → completed (para delivery)
    //                     ↘ delivered (para pedidos de mesa, listo para cobrar)
    //                     ↘ cancelled (desde cualquier estado activo)
    public const string STATUS_PENDING = "pending";       // Pedido nuevo, esperando aceptación
    public const string STATUS_PREPARING = "preparing";   // Aceptado, en preparación
    public const string STATUS_DELIVERING = "delivering"; // Repartidor asignado, en camino
    public const string STATUS_DELIVERED = "delivered";  // Entregado a la mesa (listo para cobrar)
    public const string STATUS_COMPLETED = "completed";   // Entregado exitosamente (finalizado y cobrado)
    public const string STATUS_CANCELLED = "cancelled";   // Pedido cancelado
}
