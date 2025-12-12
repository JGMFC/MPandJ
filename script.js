// Configuración de Google Sheets
const CONFIG = {
    // IMPORTANTE: Reemplaza estas URLs con las de tu Google Apps Script
    DAIMIEL_SHEET_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_DAIMIEL',
    AREQUIPA_SHEET_URL: 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AREQUIPA'
};

// Variables globales
let currentEvent = '';
const modal = document.getElementById('formModal');
const closeBtn = document.getElementsByClassName('close')[0];
const form = document.getElementById('rsvpForm');
const asistenciaSelect = document.getElementById('asistencia');
const acompanantesGroup = document.getElementById('acompanantesGroup');

// Animación de la calabaza en el scroll
function animateCarriage() {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Calcular el porcentaje de scroll
    const scrollPercent = scrollPosition / (documentHeight - windowHeight);
    
    // Animar la calabaza
    const carriage = document.querySelector('.carriage');
    
    // Rotación basada en el scroll
    const rotation = scrollPercent * 720; // 2 vueltas completas
    
    // Movimiento que sigue el camino de la izquierda
    // El carruaje se mueve de izquierda a derecha siguiendo una curva sinusoidal
    const verticalProgress = scrollPercent * 100; // Porcentaje vertical
    const horizontalOffset = Math.sin(scrollPercent * Math.PI * 3) * 80 - 100; // Oscila por la izquierda
    
    // Escala (crece y decrece)
    const scale = 1 + Math.sin(scrollPercent * Math.PI * 2) * 0.15;
    
    // Posicionar el carruaje
    carriage.style.transform = `rotate(${rotation}deg) scale(${scale})`;
    carriage.parentElement.style.left = `${30 + (horizontalOffset * 0.3)}%`; // Mantenerlo más a la izquierda
    carriage.parentElement.style.top = `${20 + (verticalProgress * 0.6)}%`;
}

// Event listeners para las tarjetas de eventos
document.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', function() {
        currentEvent = this.getAttribute('data-event');
        openModal(currentEvent);
    });
});

// Abrir modal
function openModal(event) {
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const eventLocationInput = document.getElementById('eventLocation');
    
    if (event === 'daimiel') {
        modalTitle.textContent = 'Confirma tu asistencia - Daimiel';
        modalSubtitle.textContent = 'España - 4 de julio de 2026';
        eventLocationInput.value = 'Daimiel';
    } else {
        modalTitle.textContent = 'Confirma tu asistencia - Arequipa';
        modalSubtitle.textContent = 'Perú - 19 de Diciembre 2026';
        eventLocationInput.value = 'Arequipa';
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal
closeBtn.onclick = function() {
    closeModal();
}

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    form.reset();
    document.getElementById('successMessage').style.display = 'none';
    form.style.display = 'block';
}

// Mostrar/ocultar campo de acompañantes
asistenciaSelect.addEventListener('change', function() {
    if (this.value === 'si') {
        acompanantesGroup.style.display = 'block';
    } else {
        acompanantesGroup.style.display = 'none';
        document.getElementById('acompanantes').value = '0';
    }
});

// Enviar formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    // Recopilar datos del formulario
    const formData = {
        timestamp: new Date().toISOString(),
        evento: document.getElementById('eventLocation').value,
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value || 'No proporcionado',
        asistencia: document.getElementById('asistencia').value,
        acompanantes: document.getElementById('acompanantes').value || '0',
        restricciones: document.getElementById('restricciones').value || 'Ninguna',
        mensaje: document.getElementById('mensaje').value || 'Sin mensaje'
    };
    
    try {
        // Seleccionar la URL correcta según el evento
        const sheetUrl = formData.evento === 'Daimiel' 
            ? CONFIG.DAIMIEL_SHEET_URL 
            : CONFIG.AREQUIPA_SHEET_URL;
        
        // Enviar a Google Sheets
        const response = await fetch(sheetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Mostrar mensaje de éxito
        form.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
            closeModal();
        }, 3000);
        
    } catch (error) {
        console.error('Error al enviar:', error);
        alert('Hubo un error al enviar tu confirmación. Por favor, intenta nuevamente.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Confirmación';
    }
});

// Animación suave en scroll
let ticking = false;

window.addEventListener('scroll', function() {
    if (!ticking) {
        window.requestAnimationFrame(function() {
            animateCarriage();
            ticking = false;
        });
        ticking = true;
    }
});

// Animación inicial
animateCarriage();

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Efecto parallax suave en las tarjetas
window.addEventListener('scroll', function() {
    const cards = document.querySelectorAll('.event-card');
    const scrolled = window.pageYOffset;
    
    cards.forEach((card, index) => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        // card.style.transform = `translateY(${yPos}px)`;
    });
});

console.log('Web de boda cargada correctamente! 💕');
console.log('Para conectar con Google Sheets, configura las URLs en CONFIG al inicio del archivo script.js');
