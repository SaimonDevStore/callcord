import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { serializeObject } from "@/lib/serialize";

export default async function TestSerializationPage() {
  const profile = await currentProfile();
  
  if (!profile) {
    return <div>Não autorizado</div>;
  }

  // Testar serialização de diferentes objetos
  const testServer = await db.server.findFirst({
    include: {
      channels: true,
      members: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!testServer) {
    return <div>Nenhum servidor encontrado</div>;
  }

  // Serializar usando a função utilitária
  const serializedServer = serializeObject(testServer);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Serialização</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Servidor Original (Prisma)</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(testServer, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Servidor Serializado</h2>
        <pre className="bg-green-100 p-4 rounded text-xs overflow-auto">
          {JSON.stringify(serializedServer, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Verificação de Tipos</h2>
        <div className="space-y-2">
          <div>ID: {typeof serializedServer.id} - {serializedServer.id}</div>
          <div>Nome: {typeof serializedServer.name} - {serializedServer.name}</div>
          <div>CreatedAt: {typeof serializedServer.createdAt} - {serializedServer.createdAt}</div>
          <div>UpdatedAt: {typeof serializedServer.updatedAt} - {serializedServer.updatedAt}</div>
          <div>Canais: {Array.isArray(serializedServer.channels) ? serializedServer.channels.length : 'N/A'}</div>
          <div>Membros: {Array.isArray(serializedServer.members) ? serializedServer.members.length : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}
