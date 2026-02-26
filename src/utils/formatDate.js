import moment from 'moment';
import 'moment/locale/pt-br'; // Importa o locale para português do Brasil

moment.locale('pt-br'); // Define o locale como pt-br

export function formatDate(data) {
  return moment(data).format('DD MMM - YYYY'); // Formato com mês abreviado
}
