// Função para garantir que todos os objetos sejam serializáveis
export function ensureSerializable<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(ensureSerializable) as unknown as T;
  }

  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        serialized[key] = ensureSerializable(value);
      }
    }
    return serialized as T;
  }

  return obj;
}

// Função específica para serializar objetos do Prisma
export function serializePrismaObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const serialized = JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }));

  return serialized;
}

// Função para serializar arrays de objetos Prisma
export function serializePrismaArray<T>(array: T[]): T[] {
  if (!Array.isArray(array)) {
    return array;
  }

  return array.map(item => serializePrismaObject(item));
}
