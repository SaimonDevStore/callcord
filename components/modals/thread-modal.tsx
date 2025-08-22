"use client";

import { useEffect, useRef, useState, type ElementRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useModal } from "@/hooks/use-modal-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ThreadModal = () => {
  const { isOpen, type, onClose, data } = useModal();
  const isOpenModal = isOpen && type === "thread";
  const { threadId, memberId } = (data as any) || {};
  const router = useRouter();
  const inputRef = useRef<ElementRef<"input">>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isOpenModal || !threadId) return;
    (async () => {
      const res = await axios.get(`/api/threads/${threadId}/messages`);
      setMessages(res.data.items || []);
    })();
  }, [isOpenModal, threadId]);

  const onSend = async () => {
    const value = inputRef.current?.value?.trim() || "";
    if (!value) return;
    try {
      setPending(true);
      await axios.post(`/api/threads/${threadId}/messages`, {
        content: value,
        memberId,
      });
      inputRef.current!.value = "";
      const res = await axios.get(`/api/threads/${threadId}/messages`);
      setMessages(res.data.items || []);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={isOpenModal} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="pt-6 px-6">
          <DialogTitle className="text-lg font-semibold">Thread</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="text-sm text-zinc-300">
              {m.content}
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 flex items-center gap-2">
          <Input ref={inputRef} placeholder="Mensagem da thread" className="flex-1" />
          <Button onClick={onSend} disabled={pending}>Enviar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};


