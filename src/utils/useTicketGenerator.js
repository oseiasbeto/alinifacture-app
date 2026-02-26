import { ref } from "vue";
import QRCode from "qrcode";
import moment from "moment";
import { jsPDF } from "jspdf";

// Importação otimizada do logo (ajuste o caminho conforme necessário)
const logoImage = new URL("../assets/imgs/logo.png", import.meta.url).href;

export function useTicketGenerator() {
  const isLoading = ref(false);
  const error = ref(null);

  const generateTicket = async (ticketData, orderData, eventData) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Cria um novo PDF com compressão
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5", // Tamanho menor que A4
        compress: true // Ativa compressão
      });

      // Configurações de estilo
      const styles = {
        titleColor: "#2c3e50",
        infoColor: "#333333",
        subtleColor: "#777777",
        accentColor: "#e74c3c",
        borderColor: "#dddddd",
        margin: 15,
        pageWidth: doc.internal.pageSize.getWidth(),
        get centerX() { return this.pageWidth / 2 }
      };

      let yPos = styles.margin;

      // === LOGOTIPO (com proporções mantidas) ===
     try {
        const logoWidth = 40; // Largura fixa
        // Altura calculada para manter proporção (assumindo logo quadrado)
        const logoHeight = logoWidth; 
        
        // Carrega a imagem para obter suas dimensões reais
        const img = new Image();
        img.src = logoImage;
        await new Promise((resolve) => img.onload = resolve);
        
        // Calcula a altura proporcional
        const aspectRatio = img.height / img.width;
        const proportionalHeight = logoWidth * aspectRatio;
        
        doc.addImage(
          logoImage,
          "PNG",
          styles.centerX - (logoWidth/2),
          yPos,
          logoWidth,
          proportionalHeight,
          undefined,
          "FAST" // Renderização rápida
        );
        yPos += proportionalHeight + 20; // Aumentei de 10 para 20mm o espaçamento após a logo
      } catch (logoError) {
        console.warn("Não foi possível carregar o logo:", logoError);
        yPos = styles.margin + 20; // Também aumentei o fallback
      }

      // === NOME DO EVENTO (tratamento melhorado) ===
      const formatEventTitle = (name) => {
        // Remove emojis e caracteres especiais
        const cleanName = name.replace(/[^\w\sÀ-ÿ]/gi, '').trim();
        
        // Quebra em linhas inteligentes
        const words = cleanName.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + ' ' + word;
          const testWidth = doc.getStringUnitWidth(testLine) * doc.getFontSize() / doc.internal.scaleFactor;
          
          if (testWidth > styles.pageWidth - 30) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        
        return lines;
      };

      const titleLines = formatEventTitle(eventData.name);
      const titleFontSize = titleLines.length > 1 ? 14 : 16;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(styles.titleColor);
      doc.setFontSize(titleFontSize);

      titleLines.forEach((line, i) => {
        doc.text(line, styles.centerX, yPos + (i * 6), { align: "center" });
      });

      yPos += (titleLines.length * 6) + 8;

      // === INFORMAÇÕES DO EVENTO ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(styles.infoColor);
      
      // Endereço
      const address = eventData.address?.location || "";
      if (address) {
        doc.text(address, styles.centerX, yPos, { align: "center", maxWidth: styles.pageWidth - 30 });
        yPos += 6;
      }
      
      // Data e hora
      const startDate = moment(eventData.starts_at?.date).format("DD/MM/YYYY");
      const startTime = moment(eventData.starts_at?.hm).format("HH:mm");
      doc.text(`Início em ${startDate} às ${startTime}`, styles.centerX, yPos, { align: "center" });
      yPos += 10;

      // === ÁREA/LOTE ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(styles.titleColor);
      doc.text(ticketData.batch?.name || "Área Geral", styles.centerX, yPos, { align: "center" });
      yPos += 12;

      // === QR CODE OTIMIZADO ===
      const qrSize = 40;
      const qrPadding = 3;
      const qrTotalSize = qrSize + (qrPadding * 2);
      
      // Borda
      doc.setDrawColor(styles.borderColor);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        styles.centerX - (qrTotalSize/2),
        yPos,
        qrTotalSize,
        qrTotalSize,
        2,
        2,
        "FD"
      );
      
      // QR Code com qualidade reduzida para menor tamanho
      const qrDataUrl = await QRCode.toDataURL(ticketData.code, {
        width: 200, // Tamanho reduzido
        margin: 0,
        errorCorrectionLevel: 'M' // Nível médio de correção
      });
      
      doc.addImage(
        qrDataUrl,
        "PNG",
        styles.centerX - (qrSize/2),
        yPos + qrPadding,
        qrSize,
        qrSize,
        undefined,
        "FAST"
      );
      
      yPos += qrTotalSize + 10;

      // === DADOS DO PARTICIPANTE ===
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor("#000000");
      
      // Código do ticket
      doc.text(`Código: ${ticketData.code}`, styles.centerX, yPos, { align: "center" });
      yPos += 6;
      
      // Nome do participante
      if (orderData?.data?.full_name) {
        doc.text(`Participante: ${orderData.data.full_name}`, styles.centerX, yPos, { 
          align: "center",
          maxWidth: styles.pageWidth - 30
        });
        yPos += 8;
      }

      // === INSTRUÇÕES ===
      doc.setFontSize(9);
      doc.setTextColor(styles.subtleColor);
      
      const instructions = [
        "• Não compartilhe seu ingresso com outras pessoas",
        "• Pode ser apresentado digitalmente ou impresso",
        "• Não compre ingressos de terceiros",
        "• Use apenas a plataforma oficial"
      ];
      
      instructions.forEach((text, i) => {
        doc.text(text, styles.centerX, yPos + (i * 5), { align: "center" });
      });
      
      yPos += (instructions.length * 5) + 10;

      // === RODAPÉ ===
      doc.setFontSize(8);
      doc.setTextColor(styles.infoColor);
      doc.text("www.piweto.it.ao", styles.centerX, yPos, { align: "center" });

      // Salva o PDF otimizado
      const pdfOutput = doc.output("blob");
      const compressedPdf = await compressPDF(pdfOutput);
      
      saveAs(compressedPdf, `${ticketData.code}.pdf`);

    } catch (err) {
      error.value = "Erro ao gerar o ingresso. Por favor, tente novamente.";
      console.error("Erro na geração do ingresso:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // Função para compressão adicional do PDF
  async function compressPDF(blob) {
    try {
      // Se o PDF já estiver pequeno, retorna sem compressão adicional
      if (blob.size < 1024 * 1024) { // Menor que 1MB
        return blob;
      }
      
      // Aqui você pode adicionar lógica de compressão adicional se necessário
      return blob;
    } catch {
      return blob; // Fallback para o original
    }
  }

  // Função para salvar o arquivo
  function saveAs(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  return {
    isLoading,
    error,
    generateTicket,
  };
}