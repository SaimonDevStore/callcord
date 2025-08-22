"use client";

import { FileIcon, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

import { UploadDropzone } from "@/lib/uploadthing";
import { validateImageUsage } from "@/lib/utils";
import { cn } from "@/lib/utils";

import "@uploadthing/react/styles.css";

type FileUploadProps = {
  endpoint: "messageFile" | "serverImage" | "serverBanner";
  onChange: (url?: string) => void;
  value: string;
  isNitro?: boolean;
  showGifWarning?: boolean;
};

export const FileUpload = ({ 
  endpoint, 
  onChange, 
  value, 
  isNitro = false,
  showGifWarning = true 
}: FileUploadProps) => {
  const { user } = useUser();
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Verificar se o usuário pode usar GIFs baseado no status atual
  const canUseGif = validateImageUsage("", isNitro, user?.emailAddresses?.[0]?.emailAddress).isValid;
  
  // Verificar se a imagem atual é GIF
  const fileType = value ? value.split(".").pop() : "";
  const isGif = fileType === "gif";

  // Mostrar aviso se é GIF e usuário não pode usar
  if (value && isGif && !canUseGif && showGifWarning) {
    return (
      <div className="relative">
        <div className="relative h-20 w-20">
          <Image src={value} alt="uploaded image" className="rounded-full" fill />
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
        </div>
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-xs text-red-400 text-center">
            GIFs requerem Nitro
          </p>
        </div>
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType !== "pdf" && endpoint === "messageFile") {
    return (
      <div className="relative">
        <Image src={value} alt="uploaded image" height={400} width={400} />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20">
        <Image src={value} alt="uploaded image" className="rounded-full" fill />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-zinc-100 dark:bg-zinc-900">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
        <a
          href={value}
          target="_blank"
          rel="noreferrer noopener"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>

        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-2 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <UploadDropzone
        className={cn(
          "border-zinc-500 ut-button:bg-indigo-500 ut-button:ut-uploading:bg-indigo-500/70 after:ut-button:ut-uploading:bg-indigo-500 ut-label:text-indigo-500 hover:ut-label:text-indigo-500/70",
          !canUseGif && "opacity-50"
        )}
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          setUploadError(null);
          const uploadedUrl = res?.[0].url;
          
          if (uploadedUrl) {
            // Validar se o usuário pode usar a imagem
            const validation = validateImageUsage(uploadedUrl, isNitro, user?.emailAddresses?.[0]?.emailAddress);
            
            if (!validation.isValid) {
              setUploadError(validation.error);
              // Não permitir o upload se não for válido
              return;
            }
            
            // Upload válido, atualizar o valor
            onChange(uploadedUrl);
          }
        }}
        onUploadError={(error) => {
          console.error("File Upload Error: ", error);
          setUploadError("Erro no upload. Tente novamente.");
        }}
      />
      
      {uploadError && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-md">
          <p className="text-xs text-red-400 text-center">{uploadError}</p>
        </div>
      )}
      
      {!canUseGif && showGifWarning && (
        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-xs text-yellow-400 text-center">
            Apenas usuários com Nitro podem usar GIFs
          </p>
        </div>
      )}
    </div>
  );
};
