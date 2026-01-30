import { useCallback, useRef } from 'react';

// Sonido de notificación en base64 (beep corto)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp+jm5eHdmlcV1lmdYGOnJqbl42AcmRZU1RdaXmFkJWVkYl+cmZdWFleaHWAio+RjoeDe3JpZGFlbHV+hoyOjIqGgXp0bmtqbnN5f4WHiIeGhIF9eHRxcHJ1eX1/gYKCgYB+fHp4d3d4ent9fn9/fn59fHt6eXl5ent8fX5+fn59fHx7e3t7e3x8fX19fX19fHx8fHx8fHx8fH19fX19fX19fX19fX19fX19fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    try {
      // Crear audio si no existe
      if (!audioRef.current) {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.5;
      }
      
      // Reiniciar y reproducir
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => {
        // El navegador puede bloquear autoplay sin interacción del usuario
        console.log('No se pudo reproducir sonido:', e);
      });
    } catch (error) {
      console.log('Error al reproducir sonido:', error);
    }
  }, []);

  return { playSound };
}

// Función helper para calcular tiempo transcurrido como contador (empieza en 0 y va incrementando)
// Si el pedido está entregado (delivered), el contador se detiene en el momento de entrega
export function getTimeElapsed(
  createdAt: string, 
  orderStatus?: string, 
  deliveredAt?: string | null,
  currentTime?: number // Timestamp actual opcional para actualización en tiempo real
): { text: string; isUrgent: boolean; minutes: number } {
  try {
    // Si el pedido está entregado, usar el tiempo hasta la entrega (deliveredAt o updatedAt)
    // Si no está entregado, usar el tiempo actual (pasado como parámetro o new Date())
    const endTime = (orderStatus === 'delivered' && deliveredAt) 
      ? new Date(deliveredAt) 
      : (currentTime ? new Date(currentTime) : new Date());
    
    // Parsear la fecha de creación, manejando diferentes formatos
    let startDate: Date;
    if (typeof createdAt === 'string') {
      // Intentar parsear la fecha
      startDate = new Date(createdAt);
      
      // Si la fecha no es válida, intentar parsearla de otra manera
      if (isNaN(startDate.getTime())) {
        // Si viene en formato ISO sin Z, agregar Z para UTC
        if (createdAt.includes('T') && !createdAt.includes('Z') && !createdAt.includes('+')) {
          startDate = new Date(createdAt + 'Z');
        } else {
          startDate = new Date(createdAt);
        }
      }
    } else {
      startDate = new Date(createdAt);
    }
    
    // Validar que las fechas sean válidas
    if (isNaN(startDate.getTime()) || isNaN(endTime.getTime())) {
      console.warn('Fecha inválida en getTimeElapsed:', { createdAt, deliveredAt, orderStatus });
      return { text: '0:00', isUrgent: false, minutes: 0 };
    }
    
    const diffMs = endTime.getTime() - startDate.getTime();
    
    // Si el tiempo es negativo o cero, retornar 0:00
    // (puede pasar si hay problemas de zona horaria o si la fecha está en el futuro)
    if (diffMs <= 0) {
      return { text: '0:00', isUrgent: false, minutes: 0 };
    }
  
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    const remainingSeconds = diffSeconds % 60;
    
    let text: string;
    let isUrgent = false;
    
    // Mostrar como contador que empieza en 0
    if (diffMinutes < 1) {
      // Menos de 1 minuto: mostrar segundos (0:00, 0:01, etc.)
      text = `0:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (diffMinutes < 60) {
      // Menos de 1 hora: mostrar minutos y segundos (1:23, 15:45, etc.)
      text = `${diffMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      // Urgente si más de 15 minutos
      isUrgent = diffMinutes > 15;
    } else if (diffHours < 24) {
      // Menos de 24 horas: mostrar horas, minutos y segundos (1:23:45)
      text = `${diffHours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      isUrgent = true;
    } else {
      // Más de 24 horas: mostrar días y horas
      const diffDays = Math.floor(diffHours / 24);
      const remainingHours = diffHours % 24;
      text = `${diffDays}d ${remainingHours}h`;
      isUrgent = true;
    }
    
    return { text, isUrgent, minutes: diffMinutes };
  } catch (error) {
    console.error('Error al calcular tiempo transcurrido:', error, { createdAt, deliveredAt, orderStatus });
    return { text: '0:00', isUrgent: false, minutes: 0 };
  }
}

