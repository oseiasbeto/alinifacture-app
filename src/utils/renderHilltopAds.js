export function renderHilltopAds(containerSelector, scriptUrl, settings = {}) {
  // remove script anterior para evitar duplicações em SPA
  const oldScript = document.querySelector("script[data-hilltop='1']");
  if (oldScript) oldScript.remove();

  // encontra o container alvo
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`HilltopAds: container '${containerSelector}' não encontrado.`);
    return;
  }

  // limpa conteúdo do container
  container.innerHTML = "";

  // criação do script original (igual ao que o HilltopAds te forneceu)
  const script = document.createElement("script");
  script.setAttribute("data-hilltop", "1");
  script.type = "text/javascript";
  script.async = true;
  script.src = scriptUrl;
  script.referrerPolicy = "no-referrer-when-downgrade";

  // cria uma função global de configuração igual ao modelo original
  const wrapper = document.createElement("script");
  wrapper.innerHTML = `
    (function(yjc){
      var d = document,
          s = d.createElement('script');
      s.settings = yjc || {};
      s.src = "${scriptUrl}";
      s.async = true;
      s.referrerPolicy = 'no-referrer-when-downgrade';
      document.querySelector("${containerSelector}").appendChild(s);
    })(${JSON.stringify(settings)});
  `;

  container.appendChild(wrapper);
}
