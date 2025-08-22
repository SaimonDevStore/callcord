export const dynamic = 'force-dynamic';

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { validateImageUsage } from '@/lib/utils';

export async function POST(req: Request) {
  // You can find this in your Clerk Dashboard -> Webhooks
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.updated' || eventType === 'user.created') {
    const { id, first_name, last_name, username, image_url, email_addresses } = evt.data;

    // Gerar nome de exibição válido
    let displayName = "Usuário";
    
    const firstName = first_name?.trim();
    const lastName = last_name?.trim();
    const userName = username?.trim();
    
    if (firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    } else if (firstName) {
      displayName = firstName;
    } else if (lastName) {
      displayName = lastName;
    } else if (userName) {
      displayName = userName;
    } else if (email_addresses && email_addresses[0]) {
      const emailPrefix = email_addresses[0].email_address.split('@')[0];
      displayName = emailPrefix || "Usuário";
    }

    // Garantir que o nome não seja "null null" ou similar
    if (displayName.includes("null") || displayName.trim() === "") {
      displayName = "Usuário";
    }

    // Adicionar @ se não tiver
    if (!displayName.startsWith("@")) {
      displayName = `@${displayName}`;
    }

    try {
      // Verificar se o perfil já existe
      const existingProfile = await db.profile.findUnique({
        where: {
          userId: id,
        },
      });

      // Validar se a imagem pode ser usada
      const email = email_addresses[0]?.email_address;
      const isNitro = existingProfile?.isNitro || false;
      
      let validatedImageUrl = image_url;
      
      if (validatedImageUrl) {
        const validation = validateImageUsage(validatedImageUrl, isNitro, email);
        
        if (!validation.isValid) {
          console.log(`GIF blocked for user ${id}: ${validation.error}`);
          
          // Se não pode usar GIF, usar imagem padrão ou manter a atual
          if (existingProfile && !existingProfile.imageUrl.toLowerCase().endsWith('.gif')) {
            // Manter imagem atual se não for GIF
            validatedImageUrl = existingProfile.imageUrl;
          } else {
            // Usar imagem padrão
            validatedImageUrl = "/iconoficial.png";
          }
        }
      }

      if (existingProfile) {
        // Atualizar perfil existente
        await db.profile.update({
          where: {
            userId: id,
          },
          data: {
            name: displayName,
            imageUrl: validatedImageUrl,
            email: email,
          },
        });
      } else {
        // Criar novo perfil
        await db.profile.create({
          data: {
            userId: id,
            name: displayName,
            imageUrl: validatedImageUrl,
            email: email,
          },
        });
      }

      console.log(`Profile ${eventType} for user ${id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      return new Response('Error updating profile', { status: 500 });
    }
  }

  return new Response('Success', { status: 200 });
}
