/**
 * Notification Sound System
 * Manages all notification sounds for the application
 */

export type NotificationSoundType = 'newOrder' | 'statusChange' | 'success' | 'alert';

// Base64 encoded notification sounds
const SOUNDS = {
  // Pleasant notification sound for new orders
  newOrder: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OihUBAKVKXh8bllHgU3ktjy0H4yBSp+zPLaizsKGGS58OylUhELTqPi8bRgGgU1j9ny04c6ByaByvDdjkMKGWOz7O+rWBYLUJ7i8bJcGQQyj9fyz4k8Byp4yPDejUQKF2Gy7O+sWBYLVqXi8LNaFwU0kNjy0ok6BSd1xfDdjEMMF2Cz7fCsWRcLUZ3h8K1XFgQyjdfyzoY4BSJvwO/eiD4MFVyx7fCuWRcLU53h8LBYFQMviM',
  
  // Success sound for completed actions
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OihUBAKVKXh8bllHgU3ktjy0H4yBSp+zPLaizsKGGS58OylUhELTqPi8bRgGgU1j9ny04c6ByaByvDdjkMKGWOz7O+rWBYLUJ7i8bJcGQQyj9fyz4k8Byp4yPDejUQKF2Gy7O+sWBYLVqXi8LNaFwU0kNjy0ok6BSd1xfDdjEMMF2Cz7fCsWRcLUZ3h8K1XFgQyjdfyzoY4BSJvwO/eiD4MFVyx7fCuWRcLU53h8LBYFQMviM',
  
  // Status change sound
  statusChange: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OihUBAKVKXh8bllHgU3ktjy0H4yBSp+zPLaizsKGGS58OylUhELTqPi8bRgGgU1j9ny04c6ByaByvDdjkMKGWOz7O+rWBYLUJ7i8bJcGQQyj9fyz4k8Byp4yPDejUQKF2Gy7O+sWBYLVqXi8LNaFwU0kNjy0ok6BSd1xfDdjEMMF2Cz7fCsWRcLUZ3h8K1XFgQyjdfyzoY4BSJvwO/eiD4MFVyx7fCuWRcLU53h8LBYFQMviM',
  
  // Alert sound for important notifications
  alert: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OihUBAKVKXh8bllHgU3ktjy0H4yBSp+zPLaizsKGGS58OylUhELTqPi8bRgGgU1j9ny04c6ByaByvDdjkMKGWOz7O+rWBYLUJ7i8bJcGQQyj9fyz4k8Byp4yPDejUQKF2Gy7O+sWBYLVqXi8LNaFwU0kNjy0ok6BSd1xfDdjEMMF2Cz7fCsWRcLUZ3h8K1XFgQyjdfyzoY4BSJvwO/eiD4MFVyx7fCuWRcLU53h8LBYFQMviM'
};

/**
 * Play a notification sound
 * @param type - Type of notification sound to play
 * @param volume - Volume level (0-1), default is 0.5
 */
export function playNotificationSound(type: NotificationSoundType = 'newOrder', volume: number = 0.5): void {
  try {
    const audio = new Audio(SOUNDS[type]);
    audio.volume = Math.max(0, Math.min(1, volume)); // Clamp volume between 0 and 1
    audio.play().catch((error) => {
      console.debug('Notification sound playback failed:', error);
    });
  } catch (error) {
    console.debug('Failed to create notification sound:', error);
  }
}

/**
 * Play multiple notification sounds in sequence
 * @param types - Array of sound types to play
 * @param delayMs - Delay between sounds in milliseconds
 */
export async function playNotificationSequence(
  types: NotificationSoundType[],
  delayMs: number = 300
): Promise<void> {
  for (const type of types) {
    playNotificationSound(type);
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
