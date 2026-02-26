import moment from 'moment';

export function formatTime(data) {
  return moment(data).format('HH:mm'); // Formato 24 horas com minutos
}
