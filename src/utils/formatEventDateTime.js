export default function formatEventDateTime(dateString, timeString) {
    try {
        const date = new Date(dateString);
        date.setUTCDate(date.getUTCDate() + 1);

        const time = new Date(timeString);

        // Formatação customizada para evitar o ponto no mês
        const weekday = date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            timeZone: 'UTC'
        }).replace(/^\w/, c => c.toUpperCase());

        const day = date.getUTCDate();

        const month = date.toLocaleDateString('pt-BR', {
            month: 'short',
            timeZone: 'UTC'
        }).replace('.', '');

        const hours = time.getUTCHours().toString().padStart(2, '0');
        const minutes = time.getUTCMinutes().toString().padStart(2, '0');

        return `${weekday}, ${day} de ${month} - ${hours}:${minutes}`;
    } catch (e) {
        console.error('Erro ao formatar data:', e);
        return 'Data inválida';
    }
}