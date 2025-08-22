"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface ProfileSyncNotificationProps {
  className?: string;
}

export const ProfileSyncNotification = ({ className }: ProfileSyncNotificationProps) => {
  const { user } = useUser();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Verificar se o usuário tem Nitro
      const hasNitro = user.publicMetadata?.isNitro === true;
      const email = user.emailAddresses[0]?.emailAddress;
      const isOwner = email === "saimonscheibler1999@gmail.com";
      
      if (!hasNitro && !isOwner) {
        setNotificationType('warning');
        setMessage('Apenas usuários com Nitro podem usar imagens GIF no avatar e banner. Atualize seu plano para acessar este recurso.');
        setShowNotification(true);
      }
    }
  }, [user]);

  if (!showNotification) return null;

  const getIcon = () => {
    switch (notificationType) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notificationType) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTextColor = () => {
    switch (notificationType) {
      case 'success':
        return 'text-green-700 dark:text-green-300';
      case 'error':
        return 'text-red-700 dark:text-red-300';
      case 'warning':
        return 'text-yellow-700 dark:text-yellow-300';
      case 'info':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return 'text-blue-700 dark:text-blue-300';
    }
  };

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm",
      getBgColor(),
      className
    )}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className={cn("text-sm font-medium", getTextColor())}>
            {message}
          </p>
          <div className="mt-2 flex space-x-2">
            <button
              onClick={() => setShowNotification(false)}
              className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
            >
              Entendi
            </button>
            {notificationType === 'warning' && (
              <button
                onClick={() => {
                  // Aqui você pode adicionar link para upgrade do Nitro
                  window.open('https://discord.com/nitro', '_blank');
                }}
                className="text-xs px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
              >
                Ver Nitro
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowNotification(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
