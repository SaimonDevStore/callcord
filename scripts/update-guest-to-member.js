const { PrismaClient, MemberRole } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateGuestToMember() {
  try {
    console.log('🔧 Atualizando usuários GUEST para MEMBER...');

    // Buscar todos os membros com cargo GUEST
    const guestMembers = await prisma.member.findMany({
      where: {
        role: MemberRole.GUEST
      },
      include: {
        profile: true,
        server: true
      }
    });

    console.log(`📊 Encontrados ${guestMembers.length} usuários com cargo GUEST`);

    if (guestMembers.length === 0) {
      console.log('✅ Nenhum usuário GUEST encontrado para atualizar');
      return;
    }

    let updatedCount = 0;
    for (const member of guestMembers) {
      // Não atualizar se for o dono do servidor
      if (member.profileId === member.server.profileId) {
        console.log(`⏭️  Pulando ${member.profile.name} - é dono do servidor ${member.server.name}`);
        continue;
      }

      console.log(`🔄 Atualizando ${member.profile.name} no servidor ${member.server.name}`);
      
      // Atualizar para MEMBER
      await prisma.member.update({
        where: { id: member.id },
        data: { role: MemberRole.MEMBER }
      });

      updatedCount++;
      console.log(`✅ ${member.profile.name} atualizado para MEMBER`);
    }

    console.log(`🎉 Atualização concluída! ${updatedCount} usuários atualizados de GUEST para MEMBER`);
  } catch (error) {
    console.error('❌ Erro ao atualizar cargos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateGuestToMember();
