"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const { user } = useUser();
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Só mostra erros para o usuário Saimon
  const shouldShowErrors = user?.emailAddresses?.[0]?.emailAddress === "saimonscheibler1999@gmail.com";

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (shouldShowErrors) {
        setError(event.error);
        setHasError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (shouldShowErrors) {
        setError(new Error(event.reason));
        setHasError(true);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [shouldShowErrors]);

  if (hasError && shouldShowErrors) {
    return (
      <div className="fixed inset-0 bg-red-900/90 text-white p-8 z-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">🚨 Erro Detectado</h1>
          <p className="mb-4">Apenas você (Saimon) pode ver este erro:</p>
          <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
            {error?.message || "Erro desconhecido"}
          </pre>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

