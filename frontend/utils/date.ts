export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", isoString);
    return "Неизвестная дата";
  }

  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", isoString);
    return "Неизвестная дата";
  }

  return date.toLocaleString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}