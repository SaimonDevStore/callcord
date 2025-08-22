"use client";

import { useEffect, useState } from "react";
import { Crown, Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlobalAnnouncementProps {
  message: string;
  author: string;
  timestamp: string;
  onClose: () => void;
}

export const GlobalAnnouncement = ({
  message,
  author,
  timestamp,
  onClose,
}: GlobalAnnouncementProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    // Timer de 15 segundos
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          setTimeout(onClose, 500); // Aguarda animação terminar
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-red-600 via-purple-600 to-blue-600 p-1 rounded-2xl shadow-2xl animate-pulse">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 max-w-md mx-auto text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-400 to-purple-400 rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full translate-x-12 translate-y-12"></div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
            <Megaphone className="h-8 w-8 text-red-500 animate-pulse" />
            <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🚨 AVISO GLOBAL
          </h2>

          {/* Message */}
          <div className="bg-gradient-to-r from-red-50 to-purple-50 dark:from-red-900/20 dark:to-purple-900/20 p-4 rounded-lg mb-4 border-l-4 border-red-500">
            <p className="text-lg text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Por: <span className="font-semibold text-purple-600">{author}</span></p>
            <p>{new Date(timestamp).toLocaleString('pt-BR')}</p>
          </div>

          {/* Timer */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-red-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Fechando em {timeLeft}s
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 500);
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
