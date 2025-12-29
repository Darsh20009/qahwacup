import { useCallback } from 'react';

export function useAudio() {
  const playSound = useCallback((type: 'new_order' | 'notification' | 'success' | 'alert') => {
    // We use the Web Speech API for the "New Order" voice and synthesis for creativity
    if (type === 'new_order') {
      const utterance = new SpeechSynthesisUtterance("New order received. Please check the dashboard.");
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
      
      // Also add Arabic voice for local feel
      const arUtterance = new SpeechSynthesisUtterance("تم استلام طلب جديد. يرجى مراجعة اللوحة.");
      arUtterance.lang = 'ar-SA';
      arUtterance.rate = 0.9;
      window.speechSynthesis.speak(arUtterance);
      
      // Creative Chime
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      playTone(523.25, audioContext.currentTime, 0.5); // C5
      playTone(659.25, audioContext.currentTime + 0.1, 0.5); // E5
      playTone(783.99, audioContext.currentTime + 0.2, 0.5); // G5
    } else if (type === 'notification') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, []);

  return { playSound };
}
