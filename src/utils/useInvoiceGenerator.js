import { ref } from "vue";
import { jsPDF } from "jspdf";
import moment from "moment";

export function useInvoiceGenerator() {
    const isLoading = ref(false);
    const error = ref(null);

    const generateInvoicePDF = async (orderData) => {
        try {
            isLoading.value = true;
            error.value = null;
            
            // Inicializa o documento PDF
            const doc = new jsPDF();

            // Configurações iniciais
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const lineHeight = 8;
            let y = margin;

            // Configurações de estilo - Verde Piweto #32BB78
            const primaryColor = [50, 187, 120]; // #32BB78
            const secondaryColor = [52, 73, 94]; // Cinza escuro
            const accentColor = [40, 150, 100]; // Verde escuro

            // Carregar o logotipo da Piweto
            const logoImage = new URL("../assets/imgs/logo.png", import.meta.url).href;
            const logoWidth = 40;

            // Função para adicionar cabeçalho da factura
            const addHeader = async () => {
                // Adicionar logo da Piweto
                try {
                    const img = new Image();
                    img.src = logoImage;
                    await new Promise((resolve) => img.onload = resolve);

                    // Calcula a altura proporcional
                    const aspectRatio = img.height / img.width;
                    const proportionalHeight = logoWidth * aspectRatio;

                    // Adiciona a imagem ao PDF
                    doc.addImage(img, 'PNG', margin, y, logoWidth, proportionalHeight);
                } catch (error) {
                    console.error("Erro ao carregar o logo:", error);
                    // Fallback para texto caso a imagem não carregue
                    doc.setFontSize(16);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...primaryColor);
                    doc.text("PIWETO", margin, y + 10);
                }

                // Título da factura em negrito
                doc.setFontSize(20);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...primaryColor);
                doc.text("FACTURA Nº " + orderData.id, pageWidth - margin, y + 10, { align: "right" });

                y += 30;
                y += lineHeight * 1.5;
            };

            // Função para adicionar informações do evento
            const addEventInfo = () => {
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...primaryColor);
                doc.text("EVENTO", margin, y);
                y += lineHeight;

                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...secondaryColor);

                // Nome do evento
                doc.text(`Nome: ${orderData.event.name}`, margin, y);
                y += lineHeight;

                // Data e hora do evento
                const eventDate = moment(orderData.event.starts_at.date).format("DD/MM/YYYY");
                const eventTime = moment(orderData.event.starts_at.hm).format("HH:mm");
                doc.text(`Data: ${eventDate} às ${eventTime}`, margin, y);
                y += lineHeight;

                // Local do evento
                const locationLines = doc.splitTextToSize(`Local: ${orderData.event.address.location}`, pageWidth - 2 * margin);
                doc.text(locationLines, margin, y);
                y += lineHeight * locationLines.length;

                y += lineHeight;
            };

            // Função para adicionar informações do cliente
            const addCustomerInfo = () => {
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...primaryColor);
                doc.text("CLIENTE", margin, y);
                y += lineHeight;

                doc.setFontSize(12);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...secondaryColor);

                doc.text(`Nome: ${orderData.data.full_name}`, margin, y);
                y += lineHeight;

                doc.text(`Telefone: ${orderData.data.phone}`, margin, y);
                y += lineHeight;

                if (orderData.data.email) {
                    doc.text(`Email: ${orderData.data.email}`, margin, y);
                    y += lineHeight;
                }
                y += lineHeight;
            };

            // Função para adicionar detalhes da compra
            const addOrderDetails = () => {
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...primaryColor);
                doc.text("DETALHES DA COMPRA", margin, y);
                y += lineHeight * 1.5;

                // Configurações responsivas da tabela
                // Calcular larguras dinâmicas para as colunas "Preço" e "Total"
                doc.setFontSize(12); // Usar a fonte do conteúdo da tabela para medição
                doc.setFont("helvetica", "normal");
                const maxPriceWidth = orderData.batches.reduce((maxWidth, batch) => {
                    const priceText = formatAmount(batch.price);
                    return Math.max(maxWidth, doc.getTextWidth(priceText));
                }, 0);
                const maxTotalWidth = orderData.batches.reduce((maxWidth, batch) => {
                    const qty = batch.quantitySelected || 1;
                    const totalText = formatAmount(batch.price * qty);
                    return Math.max(maxWidth, doc.getTextWidth(totalText));
                }, 0);
                const priceColumnWidth = maxPriceWidth + 8; // Adiciona 8 de padding
                const totalColumnWidth = maxTotalWidth + 8; // Adiciona 8 de padding
                // Garantir que a tabela caiba na página
                const descriptionColumnWidth = 90; // Largura fixa para Descrição
                const qtyColumnWidth = 20; // Largura fixa para Quantidade
                const maxTableWidth = pageWidth - 2 * margin;
                const totalTableWidth = descriptionColumnWidth + qtyColumnWidth + priceColumnWidth + totalColumnWidth;
                const scaleFactor = totalTableWidth > maxTableWidth ? maxTableWidth / totalTableWidth : 1;
                const colWidths = [
                    descriptionColumnWidth * scaleFactor,
                    qtyColumnWidth * scaleFactor,
                    priceColumnWidth * scaleFactor,
                    totalColumnWidth * scaleFactor,
                ];
                doc.setFontSize(14); // Restaurar a fonte para o cabeçalho
                doc.setFont("helvetica", "bold");

                const colPositions = [
                    margin, // Coluna 0: Descrição
                    margin + colWidths[0], // Coluna 1: Quantidade
                    margin + colWidths[0] + colWidths[1], // Coluna 2: Preço
                    margin + colWidths[0] + colWidths[1] + colWidths[2], // Coluna 3: Total
                ];
                const tableWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];

                // Cabeçalho da tabela
                doc.setFillColor(...primaryColor);
                doc.setTextColor(255, 255, 255);
                doc.rect(margin, y, tableWidth, lineHeight * 1.5, 'F');

                doc.setFont("helvetica", "bold");
                // Centralizar os textos nos cabeçalhos
                doc.text("Ingresso", colPositions[0] + (colWidths[0] / 2), y + lineHeight, { align: "center" });
                doc.text("Qtd", colPositions[1] + (colWidths[1] / 2), y + lineHeight, { align: "center" });
                doc.text("Preço", colPositions[2] + (colWidths[2] / 2), y + lineHeight, { align: "center" });
                doc.text("Total", colPositions[3] + (colWidths[3] / 2), y + lineHeight, { align: "center" });

                y += lineHeight * 2;

                // Dados dos ingressos
                doc.setTextColor(...secondaryColor);
                doc.setFont("helvetica", "normal");

                orderData.batches.forEach((batch, index) => {
                    if (y > 250) {
                        doc.addPage();
                        y = margin;
                        // Redesenhar cabeçalho da tabela na nova página
                        doc.setFillColor(...primaryColor);
                        doc.setTextColor(255, 255, 255);
                        doc.rect(margin, y, tableWidth, lineHeight * 1.5, 'F');
                        doc.setFont("helvetica", "bold");
                        doc.text("Ingresso", colPositions[0] + (colWidths[0] / 2), y + lineHeight, { align: "center" });
                        doc.text("Qtd", colPositions[1] + (colWidths[1] / 2), y + lineHeight, { align: "center" });
                        doc.text("Preço", colPositions[2] + (colWidths[2] / 2), y + lineHeight, { align: "center" });
                        doc.text("Total", colPositions[3] + (colWidths[3] / 2), y + lineHeight, { align: "center" });

                        y += lineHeight * 2;
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(...secondaryColor);
                    }

                    // Quebra de linha para descrições longas
                    const descriptionLines = doc.splitTextToSize(batch.name, colWidths[0] - 4);
                    const qty = batch.quantitySelected || 1;
                    const total = batch.price * qty;

                    // Calcular altura da linha baseada no número de linhas da descrição
                    const lineHeightMultiplier = Math.max(descriptionLines.length, 1);
                    const rowHeight = lineHeight * lineHeightMultiplier;

                    // Desenhar bordas da linha
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.3);

                    // Desenhar células individuais com bordas
                    doc.rect(colPositions[0], y, colWidths[0], rowHeight); // Descrição
                    doc.rect(colPositions[1], y, colWidths[1], rowHeight); // Quantidade
                    doc.rect(colPositions[2], y, colWidths[2], rowHeight); // Preço
                    doc.rect(colPositions[3], y, colWidths[3], rowHeight); // Total

                    // Calcular a posição y para centralizar verticalmente
                    const textHeight = lineHeight * descriptionLines.length;
                    const textY = y + (rowHeight - textHeight) / 2 + (lineHeight * 0.8); // Ajuste fino para centralização

                    // Desenhar conteúdo da linha - Ajustado para centralizar verticalmente e respeitar linhas
                    doc.text(descriptionLines, colPositions[0] + 2, y + (rowHeight - textHeight) / 2 + (lineHeight * 0.8)); // Esquerda, centralizado verticalmente
                    doc.text(String(qty), colPositions[1] + (colWidths[1] / 2), textY, { align: "center" }); // Centro, centralizado verticalmente
                    doc.text(formatAmount(batch.price), colPositions[2] + (colWidths[2] - 2), textY, { align: "right" }); // Direita, centralizado verticalmente
                    doc.text(formatAmount(total), colPositions[3] + (colWidths[3] - 2), textY, { align: "right" }); // Direita, centralizado verticalmente

                    y += rowHeight;
                });

                // Linha do total
                doc.setDrawColor(150, 150, 150);
                doc.setLineWidth(0.5);
                doc.line(margin, y, pageWidth - margin, y);
                y += lineHeight;

                // Total diretamente (sem desconto/taxas)
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...accentColor);
                const totalText = "TOTAL:";
                const amountText = formatAmount(orderData.amount);
                const amountWidth = doc.getTextWidth(amountText);
                const totalX = colPositions[3] + colWidths[3] - amountWidth - 5; // Position amount right-aligned with 5-unit padding
                doc.text(amountText, colPositions[3] + colWidths[3] - 2, y, { align: "right" });
                doc.text(totalText, totalX - doc.getTextWidth(totalText) - 5, y); // Position "TOTAL:" left of amount with 5-unit gap

                y += lineHeight * 2;
            };

            // Função para adicionar informações de pagamento
            const addPaymentInfo = () => {
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...secondaryColor);

                doc.text("INFORMAÇÕES DE PAGAMENTO", margin, y);
                y += lineHeight;

                doc.setFont("helvetica", "normal");
                doc.text(`Método: ${getPaymentMethod(orderData.data.payment_method)}`, margin, y);
                y += lineHeight;

                doc.text(`Nº Reserva: ${orderData.reservation_number}`, margin, y);
                y += lineHeight;

                // Informações específicas para pagamento por referência
                if (orderData.data.payment_method === 'reference' && orderData.biz_content) {
                    doc.text(`Entidade: ${orderData.biz_content.entity_id}`, margin, y);
                    y += lineHeight;

                    doc.text(`Referência: ${orderData.biz_content.reference_id}`, margin, y);
                    y += lineHeight;
                }

                if (orderData.data.payment_method === 'paypay' && orderData.biz_content) {
                    doc.text("Link de Pagamento:", margin, y);
                    y += lineHeight;
                    doc.setFont("helvetica", "italic");
                    doc.setTextColor(...primaryColor);
                    const linkLines = doc.splitTextToSize(orderData.biz_content.dynamic_link, pageWidth - 2 * margin);
                    doc.text(linkLines, margin, y);
                    y += lineHeight * linkLines.length;
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...secondaryColor);
                }
                // Data de expiração se houver - Texto corrigido
                if (orderData.expires_at) {
                    const expiresAt = moment(orderData.expires_at).format("DD/MM/YYYY HH:mm");
                    doc.text(`Pagamento válido até: ${expiresAt}`, margin, y);
                    y += lineHeight;
                }
                y += lineHeight;
            };

            // Função para adicionar rodapé
            const addFooter = () => {
                const footerY = 280;
                doc.setFontSize(8);
                doc.setFont("helvetica", "italic");
                doc.setTextColor(150, 150, 150);

                doc.text("Este documento serve como comprovativo de reserva.", margin, footerY);
                doc.text("Em caso de problemas, contacte-nos pelo WhatsApp: 948 360 831", margin, footerY + 5);

                const generationDate = moment().format("DD/MM/YYYY HH:mm:ss");
                doc.text(`Factura gerada em: ${generationDate}`, margin, footerY + 15);
            };

            // Funções auxiliares
            const formatAmount = (amount) => {
                return new Intl.NumberFormat("pt-AO", {
                    style: "currency",
                    currency: "AOA",
                }).format(Number(amount || 0));
            };

            const getPaymentMethod = (method) => {
                const methods = {
                    'reference': 'Referência Multicaixa',
                    'mul': 'Multicaixa Express',
                    'paypay': 'PayPay',
                    'cash': 'Dinheiro'
                };
                return methods[method] || method;
            };

            // Gerar a factura
            await addHeader();
            addEventInfo();
            addCustomerInfo();
            addOrderDetails();
            addPaymentInfo();
            addFooter();

            // Salvar o PDF
            const fileName = `factura_${orderData.id}_${orderData.data.full_name.replace(/\s+/g, '_')}.pdf`;
            doc.save(fileName);

        } catch (err) {
            error.value = "Erro ao gerar a factura. Por favor, tente novamente.";
            console.error("Erro na geração da factura:", err);
            throw err; // Propaga o erro para o chamador
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        error,
        generateInvoicePDF,
    };
}