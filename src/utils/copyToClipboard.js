import { toast } from "vue3-toastify";

export default async function copyToClipboard(text) {
  try {
    // Método moderno (funciona na maioria dos navegadores atuais)
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } 
    // Fallback para dispositivos mais antigos ou alguns mobiles
    else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';  // Evita rolagem indesejada
      document.body.appendChild(textarea);
      textarea.select();
      
      // Método legado (funciona em mais dispositivos)
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (!successful) {
        throw new Error('Falha ao copiar');
      }
    }
    
    toast("Copiado para a área de transferência!", {
      theme: "colored",
      position: "top-right",
      autoClose: 2000,
      type: "success",
    });
    
  } catch (err) {
    console.error('Erro ao copiar:', err);
    toast("Falha ao copiar texto", {
      theme: "colored",
      position: "top-right",
      autoClose: 2000,
      type: "error",
    });
  }
}