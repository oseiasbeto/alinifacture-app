// Função auxiliar para extrair o dia da semana (ex: "sábado")
const getWeekday = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
};

// Função auxiliar para formatar o horário (HH:MM) para "XhXX"
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}h${minutes}`;
};

// Função auxiliar para capitalizar a primeira letra
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Função auxiliar para verificar se é o mesmo dia
const isSameDay = (dateString1, dateString2) => {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export default function formatEventTime(startsAt, endsAt) {
  try {
    // Extrair dia da semana da data de início
    const startWeekday = getWeekday(startsAt.date);
    // Extrair horário do campo hm de início
    const startTime = formatTime(startsAt.hm);

    // Extrair dia da semana da data de término
    const endWeekday = getWeekday(endsAt.date);
    // Extrair horário do campo hm de término
    const endTime = formatTime(endsAt.hm);

    // Capitalizar a primeira letra dos dias da semana
    const capitalizedStartWeekday = capitalizeFirstLetter(startWeekday);
    const capitalizedEndWeekday = capitalizeFirstLetter(endWeekday);

    // Verificar se o evento começa e termina no mesmo dia (comparando as datas completas)
    if (isSameDay(startsAt.date, endsAt.date)) {
      return `${capitalizedStartWeekday} às ${startTime} até ${endTime}`;
    }

    return `${capitalizedStartWeekday} às ${startTime} até ${capitalizedEndWeekday} às ${endTime}`;
  } catch (error) {
    console.error("Erro ao formatar horário do evento:", error);
    return "Horário inválido";
  }
}
