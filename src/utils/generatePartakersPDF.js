import { jsPDF } from "jspdf";
import moment from "moment";

export const generatePartakersPDF = (partakers, event, pagination) => {
  // Inicializa o documento PDF
  const doc = new jsPDF();
  
  // Configurações iniciais
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 10;
  let y = margin;
  const tableWidth = pageWidth - 2 * margin; // 170 mm (210 - 2 * 20)

  // Função para truncar texto com ellipsis
  const truncateText = (text, maxLength) => {
    if (text && text.length > maxLength) {
      return text.substring(0, maxLength - 3) + "...";
    }
    return text || "N/A";
  };

  // Função para adicionar o título
  const addTitle = () => {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Lista de Participantes - ${event.name || "Evento"}`, margin, y);
    y += lineHeight * 2;
  };

  // Função para adicionar informações de paginação
  const addPaginationInfo = () => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const pageText = `Mostrando página ${String(pagination.page || 1)} a ${String(pagination.limit)} de ${String(pagination.total || 0)} resultado(s)`;
    doc.text(pageText, margin, y);
    y += lineHeight * 1.5;
  };

  // Função para adicionar o cabeçalho da tabela com bordas
  const addTableHeader = () => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const headers = ["Status", "Participante", "Ingresso", "Preço", "Nº Reserva", "Data Compra"];
    const colWidths = [25, 40, 35, 25, 25, 20]; // Total: 170 mm
    
    // Desenhar bordas do cabeçalho
    let x = margin;
    headers.forEach((header, index) => {
      doc.rect(x, y - 8, colWidths[index], lineHeight); // Desenha retângulo para a célula
      doc.text(header, x + 2, y); // Texto com pequeno deslocamento interno
      x += colWidths[index];
    });
    y += lineHeight;
    
    // Linha divisória abaixo do cabeçalho
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + tableWidth, y);
    y += lineHeight / 2;
  };

  // Função para adicionar o rodapé com data de geração
  const addFooter = () => {
    const generationDate = moment().format("DD/MM/YYYY HH:mm:ss");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Gerado em: ${generationDate}`, margin, pageHeight - margin);
  };

  // Função para formatar o status
  const generateStatusLegend = (status) => {
    switch (status) {
      case "p":
        return "Pendente";
      case "a":
        return "Activo";
      case "d":
        return "Cancelado";
      default:
        return "Desconhecido";
    }
  };

  // Função para formatar o valor
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
    }).format(Number(amount || 0));
  };

  // Adiciona o título
  addTitle();

  // Adiciona informações de paginação
  addPaginationInfo();

  // Adiciona o cabeçalho da tabela
  addTableHeader();

  // Adiciona os dados dos participantes da página atual com bordas
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  partakers.forEach((partaker) => {
    // Verifica se precisa adicionar uma nova página
    if (y > pageHeight - margin * 2) {
      addFooter();
      doc.addPage();
      y = margin;
      addTableHeader();
    }

    const rowData = [
      generateStatusLegend(partaker.status),
      truncateText(partaker.costumer?.full_name, 20),
      truncateText(partaker.batch?.name, 20),
      formatAmount(partaker.price),
      String(partaker.booking_number || "N/A"),
      moment(partaker.created_at).format("DD/MM/YYYY"),
    ];

    const colWidths = [25, 40, 35, 25, 25, 20]; // Total: 170 mm

    // Desenhar bordas para a linha
    let x = margin;
    rowData.forEach((data, index) => {
      doc.rect(x, y - 8, colWidths[index], lineHeight); // Desenha retângulo para a célula
      doc.text(String(data), x + 2, y); // Texto com pequeno deslocamento interno
      x += colWidths[index];
    });

    y += lineHeight;
  });

  // Adiciona o rodapé
  addFooter();

  // Salva o PDF
  doc.save(`participantes_${event.name || "evento"}_pagina_${String(pagination.page || 1)}.pdf`);
};