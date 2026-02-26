export function renderAdsterra(containerSelector, options) {
  // Remove script duplicado
  const oldScript = document.querySelector('script[data-adsterra="1"]');
  if (oldScript) oldScript.remove();

  // Define configurações do banner
  window.atOptions = {
    key: options.key,
    format: options.format || "iframe",
    height: options.height,
    width: options.width,
    params: options.params || {}
  };

  // Cria o script
  const script = document.createElement("script");
  script.setAttribute("data-adsterra", "1");
  script.type = "text/javascript";
  script.src = `//www.highperformanceformat.com/${options.key}/invoke.js`;

  // Encontra container
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Adsterra container '${containerSelector}' not found`);
    return;
  }

  // Limpa container e injeta script
  container.innerHTML = "";
  container.appendChild(script);
}
