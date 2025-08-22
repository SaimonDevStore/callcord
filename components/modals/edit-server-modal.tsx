"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useModal } from "@/hooks/use-modal-store";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required.",
  }),
  imageUrl: z.string().min(1, {
    message: "Server image is required.",
  }),
});

export const EditServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "editServer";
  const { server } = data;
  const [activeTab, setActiveTab] = useState("geral");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      bannerUrl: "",
      rulesText: "",
      requireRules: false,
    },
  });

  useEffect(() => {
    if (server) {
      form.setValue("name", server.name);
      form.setValue("imageUrl", server.imageUrl);
      form.setValue("bannerUrl", (server as any).bannerUrl || "");
      form.setValue("rulesText", (server as any).rulesText || "");
      form.setValue("requireRules", Boolean((server as any).requireRules));
    }
  }, [server, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/servers/${server?.id}`, values);

      form.reset();
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Configurações do Servidor
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Personalize seu servidor e gerencie os cargos.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="cargos">CARGOS</TabsTrigger>
          </TabsList>
          <TabsContent value="geral" className="mt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
                autoCapitalize="off"
                autoComplete="off"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-center text-center">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              endpoint="serverImage"
                              value={field.value}
                              onChange={field.onChange}
                              isNitro={false} // Servidores não têm status Nitro específico
                              showGifWarning={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-center text-center">
                    <FormField
                      control={form.control}
                      name="bannerUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <FileUpload
                              endpoint="serverBanner"
                              value={field.value as any}
                              onChange={field.onChange}
                              isNitro={false} // Servidores não têm status Nitro específico
                              showGifWarning={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500">
                          Nome do servidor
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            aria-disabled={isLoading}
                            className="dark:bg-zinc-300/10 bg-zinc-300/50 border-0 dark:text-white text-black"
                            placeholder="Digite o nome do servidor"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requireRules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500">
                          Exigir aceite de regras
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Checkbox checked={field.value as any} onChange={field.onChange} />
                            <span className="text-xs text-zinc-400">Usuários precisam aceitar para participar</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rulesText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase text-xs font-bold text-zinc-500">
                          Regras do servidor
                        </FormLabel>
                        <FormControl>
                          <textarea className="w-full min-h-[120px] p-3 bg-zinc-200/90 dark:bg-zinc-700/75 border-none text-zinc-800 dark:text-zinc-100" placeholder="Escreva as regras..." {...field as any} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter className="px-0 py-4">
                  <Button disabled={isLoading} aria-disabled={isLoading} variant="primary">
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="cargos" className="mt-6">
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                  <Label className="text-xs uppercase text-zinc-500">Cargos Rápidos</Label>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => alert('Use /darcargo (usuario) Ajudante no chat')}>Criar Ajudante</Button>
                    <Button variant="secondary" onClick={() => alert('Use /darcargo (usuario) Admin no chat')}>Criar Admin</Button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Permissões e atribuição rápida serão feitas pelos comandos do chat.</p>
                </div>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                  <Label className="text-xs uppercase text-zinc-500">Como gerenciar cargos</Label>
                  <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-300">
                    Gerencie cargos aqui e use os comandos no chat para ações rápidas (/darcargo, /castigo, /ban, /banip).
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
