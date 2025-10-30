// src/utils/format.ts

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getFirstClientCreationDate = (clients: { created_at: string }[]): string | null => {
  return clients.length > 0 ? clients[0].created_at : null;
};
