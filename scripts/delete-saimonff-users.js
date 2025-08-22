const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteSaimonffUsers() {
  try {
    console.log('🔧 Buscando usuários com email saimonff2020@gmail.com...');

    // Buscar perfis com o email específico
    const profiles = await prisma.profile.findMany({
      where: {
        email: 'saimonff2020@gmail.com'
      },
      include: {
        members: {
          include: {
            server: true
          }
        }
      }
    });

    console.log(`📊 Encontrados ${profiles.length} perfis com email saimonff2020@gmail.com`);

    if (profiles.length === 0) {
      console.log('✅ Nenhum usuário encontrado com este email');
      return;
    }

    for (const profile of profiles) {
      console.log(`🗑️  Excluindo usuário: ${profile.name} (${profile.email})`);
      
      // Listar servidores onde o usuário é membro
      for (const member of profile.members) {
        console.log(`   - Membro do servidor: ${member.server.name}`);
      }
      
      // Excluir o perfil (isso também excluirá automaticamente os membros devido ao CASCADE)
      await prisma.profile.delete({
        where: { id: profile.id }
      });
      
      console.log(`✅ Usuário ${profile.name} excluído com sucesso`);
    }

    console.log(`🎉 Exclusão concluída! ${profiles.length} usuários excluídos`);
  } catch (error) {
    console.error('❌ Erro ao excluir usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteSaimonffUsers();
