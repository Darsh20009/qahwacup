import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import logoImage from "@assets/Elegant Coffee Culture Design_1757441959827.png";

export default function EmployeeSplash() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Play creative system start sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    audio.volume = 0.5;
    
    const playSound = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.log("Audio playback requires interaction first");
      }
    };

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    const timer = setTimeout(() => {
      setLoading(false);
      setTimeout(() => setLocation("/employee/gateway"), 800);
    }, 3500);

    playSound();

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [setLocation]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden relative">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8 }}
            className="z-10 flex flex-col items-center"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  rotate: 360,
                  boxShadow: ["0 0 20px #8B5A2B", "0 0 50px #D2691E", "0 0 20px #8B5A2B"]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 rounded-full border-2 border-[#8B5A2B] flex items-center justify-center overflow-hidden"
              >
                <img src={logoImage} alt="Logo" className="w-24 h-24 object-contain animate-pulse" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </motion.div>
            </div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold text-amber-500 tracking-widest uppercase text-center"
            >
              QahwaCup OS
            </motion.h1>
            
            <div className="mt-8 w-48 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6 text-gray-500 text-xs font-mono"
            >
              SYSTEM_INIT_COMPLETED: {Math.round(progress)}%
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="grid grid-cols-12 h-full w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "linear" }}
              className="border-r border-[#8B5A2B] h-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
