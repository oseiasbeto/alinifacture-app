// utils/dateFormatter.js

/**
 * Formata o intervalo de datas do evento
 * @param {string|Date} startDate - Data de início do evento
 * @param {string|Date} endDate - Data de encerramento do evento
 * @returns {string} Data formatada no padrão solicitado
 */

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export default function formatEventDates(startDate, endDate) {
  try {
    // Converter para objetos Date se for string
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validar as datas
    if (isNaN(start.getTime())) throw new Error("Data de início inválida");
    if (isNaN(end.getTime())) throw new Error("Data de encerramento inválida");
    if (start > end)
      throw new Error(
        "Data de início não pode ser após a data de encerramento"
      );

    // Opções para formatação
    const dayOptions = { day: "2-digit" };
    const monthOptions = { month: "long" };
    const yearOptions = { year: "numeric" };

    // Extrair partes das datas
    const startDay = start.toLocaleDateString("pt-BR", dayOptions);
    const startMonth = start.toLocaleDateString("pt-BR", monthOptions);
    const startYear = start.toLocaleDateString("pt-BR", yearOptions);

    const endDay = end.toLocaleDateString("pt-BR", dayOptions);
    const endMonth = end.toLocaleDateString("pt-BR", monthOptions);
    const endYear = end.toLocaleDateString("pt-BR", yearOptions);

    // Verificar se é o mesmo dia
    const isSameDay =
      start.getDate() === end.getDate() &&
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear();

    if (isSameDay) {
      // Formato para mesmo dia: "06 de julho de 2025"
      return `${startDay} de ${startMonth.toLowerCase()} de ${startYear}`;
    } else {
      // Formato para dias diferentes: "06 de Julho a 06 de julho de 2025"
      return `${startDay} de ${capitalizeFirstLetter(
        startMonth
      )} a ${endDay} de ${endMonth.toLowerCase()} de ${endYear}`;
    }
  } catch (error) {
    console.error("Erro ao formatar datas do evento:", error);
    return "Data inválida";
  }
}
