export default function createRippleAnimation(event) {
    const button = event.currentTarget;
    // Criar elemento de ripple
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    // Posicionar o círculo
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;

    // Adicionar classes
    circle.classList.add('ripple');

    // Remover ripple existente se houver
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    // Adicionar o ripple ao botão
    button.appendChild(circle);
};