document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('scratch-canvas');
    const ctx = canvas.getContext('2d');
    const scratchContainer = document.getElementById('scratch-container');
    const resetButton = document.getElementById('reset-button');
    const prizeContent = document.getElementById('prize-content');
    const prizeText = document.getElementById('prize-text'); // Nuevo elemento para el texto del premio

    const scratchAudio = document.getElementById('scratch-audio');
    const winAudio = document.getElementById('win-audio');

    let isScratching = false;
    let scratchCompletion = 0;
    const THRESHOLD_PERCENTAGE = 60;

    let currentPrizePercentage = 0; // Para almacenar el porcentaje de premio de esta ronda

    // Función para generar un porcentaje aleatorio entre 10 y 35
    const generateRandomPrize = () => {
        // Genera un número entero entre 10 y 35 (inclusive)
        currentPrizePercentage = Math.floor(Math.random() * (35 - 10 + 1)) + 10;
        prizeText.textContent = `¡Has ganado un ${currentPrizePercentage}% EXTRA!`;
    };

    // Función para ajustar el tamaño del canvas y redibujar la capa rascable
    const setCanvasSize = () => {
        canvas.width = scratchContainer.offsetWidth;
        canvas.height = scratchContainer.offsetHeight;
        drawScratchLayer();
    };

    // Dibuja la capa rascable (simulando una superficie metálica)
    const drawScratchLayer = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#B0B0B0');
        gradient.addColorStop(0.2, '#E0E0E0');
        gradient.addColorStop(0.5, '#A0A0A0');
        gradient.addColorStop(0.8, '#E0E0E0');
        gradient.addColorStop(1, '#B0B0B0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 36px "Luckiest Guy", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RASPA AQUÍ', canvas.width / 2, canvas.height / 2);

        ctx.globalCompositeOperation = 'destination-out';
    };

    // Inicializa el juego
    const initializeGame = () => {
        setCanvasSize();
        generateRandomPrize(); // Genera el premio al inicio
        canvas.style.pointerEvents = 'auto'; // Asegura que se pueda raspar
        scratchCompletion = 0; // Reinicia el progreso de rascado
        // Opcional: para que el texto de premio no se vea antes de raspar
        // prizeContent.style.opacity = 0;
        // prizeText.style.visibility = 'hidden';
    };

    // Inicializa la capa rascable al cargar y ajusta en redimensionamiento
    initializeGame();
    window.addEventListener('resize', setCanvasSize);

    // Configuración del "borrador"
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';

    // Función para calcular el porcentaje de rascado
    const calculateScratchCompletion = () => {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 0; i < pixels.length; i += 4) {
            if (pixels[i + 3] < 128) { // Contar píxeles con alpha (transparencia) inferior a un umbral
                transparentPixels++;
            }
        }
        return (transparentPixels / (pixels.length / 4)) * 100;
    };

    // Función para raspar
    const scratch = (x, y) => {
        if (!isScratching) return;

        // Reproducir sonido de raspar (si no está ya sonando)
        if (scratchAudio.paused) {
            scratchAudio.currentTime = 0; // Reinicia el sonido si ya se tocó antes
            scratchAudio.play().catch(e => console.log("Error al reproducir audio de rascar:", e));
        }

        const rect = canvas.getBoundingClientRect();
        const mouseX = x - rect.left;
        const mouseY = y - rect.top;

        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();

        scratchCompletion = calculateScratchCompletion();
        if (scratchCompletion >= THRESHOLD_PERCENTAGE) {
            // Detener el sonido de raspar
            scratchAudio.pause();
            // Reproducir sonido de victoria
            winAudio.currentTime = 0; // Asegura que el sonido empiece desde el principio
            winAudio.play().catch(e => console.log("Error al reproducir audio de victoria:", e));

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Elimina completamente la capa rascable
            canvas.style.pointerEvents = 'none'; // Deshabilita más rascado
            isScratching = false;

            // Opcional: mostrar el texto del premio (si lo ocultaste inicialmente)
            // prizeContent.style.opacity = 1;
            // prizeText.style.visibility = 'visible';
        }
    };

    // Eventos de ratón
    canvas.addEventListener('mousedown', (e) => {
        isScratching = true;
        ctx.beginPath();
        scratch(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousemove', (e) => {
        scratch(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseup', () => {
        isScratching = false;
        scratchAudio.pause(); // Detener el sonido al levantar el mouse
    });

    canvas.addEventListener('mouseleave', () => {
        isScratching = false;
        scratchAudio.pause(); // Detener el sonido al salir del canvas
    });

    // Eventos táctiles para móviles
    canvas.addEventListener('touchstart', (e) => {
        isScratching = true;
        ctx.beginPath();
        scratch(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        scratch(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        isScratching = false;
        scratchAudio.pause(); // Detener el sonido al levantar el dedo
    });

    // Botón de reiniciar
    resetButton.addEventListener('click', () => {
        initializeGame(); // Reinicia todo el juego, incluyendo un nuevo premio
    });
});
