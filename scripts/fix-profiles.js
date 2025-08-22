const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProfiles() {
  try {
    console.log('🔧 Iniciando correção de perfis...');

    // Buscar todos os perfis
    const profiles = await prisma.profile.findMany();

    console.log(`📊 Encontrados ${profiles.length} perfis`);

    for (const profile of profiles) {
      // Verificar se o nome contém "null" ou está vazio
      if (profile.name.includes('null') || profile.name.trim() === '' || profile.name === 'null null') {
        console.log(`⚠️  Corrigindo perfil: ${profile.id} (${profile.name})`);
        
        // Gerar novo nome baseado no email
        let newName = 'Usuário';
        
        if (profile.email) {
          const emailPrefix = profile.email.split('@')[0];
          if (emailPrefix && emailPrefix !== 'null') {
            newName = `@${emailPrefix}`;
          }
        }

        // Atualizar o perfil
        await prisma.profile.update({
          where: { id: profile.id },
          data: { name: newName }
        });

        console.log(`✅ Perfil corrigido: ${profile.id} -> ${newName}`);
      }
    }

    console.log('🎉 Correção de perfis concluída!');
  } catch (error) {
    console.error('❌ Erro ao corrigir perfis:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProfiles();
