const { PrismaClient, MemberRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateServerOwners() {
  try {
    console.log('🔧 Atualizando cargos dos servidores...');

    // Buscar todos os servidores
    const servers = await prisma.server.findMany({
      include: {
        members: {
          include: {
            profile: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${servers.length} servidores`);

    for (const server of servers) {
      // Encontrar o membro que criou o servidor (profileId do servidor)
      const ownerMember = server.members.find(member => member.profileId === server.profileId);
      
      if (ownerMember && ownerMember.role !== MemberRole.OWNER) {
        console.log(`⚠️  Atualizando cargo do servidor: ${server.name}`);
        
        // Atualizar para OWNER
        await prisma.member.update({
          where: { id: ownerMember.id },
          data: { role: MemberRole.OWNER }
        });

        console.log(`✅ Servidor ${server.name} atualizado para OWNER`);
      }
    }

    console.log('🎉 Atualização de cargos concluída!');
  } catch (error) {
    console.error('❌ Erro ao atualizar cargos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateServerOwners();




