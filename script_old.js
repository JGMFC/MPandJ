// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
    // URL del Google Apps Script (deploy como Web App)
    ENDPOINT_URL: 'TU_URL_DE_APPS_SCRIPT_AQUI',
    
    // URL de la comunidad de WhatsApp
    WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/TU_LINK_AQUI',
    
    // Itinerario Daimiel (editable fácilmente)
    itinerarioDaimiel: [
        {
            time: '17:00',
            title: 'Ceremonia Religiosa',
            description: 'Iglesia de San Pedro, Daimiel',
            mapsQuery: 'Iglesia de San Pedro, Daimiel, Ciudad Real, España'
        },
        {
            time: '18:30',
            title: 'Traslado a Celebración',
            description: 'Viaje hacia Bodega Pago del Vicario',
            mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'
        },
        {
            time: '19:30',
            title: 'Cóctel de Bienvenida',
            description: 'Aperitivos y bebidas en la bodega',
            mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'
        },
        {
            time: '21:00',
            title: 'Cena',
            description: 'Banquete nupcial en Pago del Vicario',
            mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'
        },
        {
            time: '23:00',
            title: 'Baile y Celebración',
            description: '¡Fiesta hasta el amanecer!',
            mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España'
        },
        {
            time: '15:30',
            title: 'Bus: Ciudad Real → Daimiel',
            description: 'Salida desde Ciudad Real hacia Daimiel',
            mapsQuery: 'Ciudad Real, España',
            isBus: true
        },
        {
            time: '18:00',
            title: 'Bus: Daimiel → Pago del Vicario',
            description: 'Traslado tras la ceremonia',
            mapsQuery: 'Daimiel, Ciudad Real, España',
            isBus: true
        },
        {
            time: '02:00',
            title: 'Bus: Pago del Vicario → Daimiel',
            description: 'Regreso con parada en Ciudad Real',
            mapsQuery: 'Bodega Pago del Vicario, Ciudad Real, España',
            isBus: true
        }
    ],
    
    // Eventos para calendario
    eventos: {
        daimiel: {
            title: 'Boda María Phia & Javier - Daimiel',
            location: 'Iglesia de San Pedro, Daimiel, España',
            description: 'Ceremonia religiosa y celebración en Bodega Pago del Vicario',
            date: '2026-07-04',
            time: '17:00',
            duration: 6 // horas
        },
        arequipa: {
            title: 'Boda María Phia & Javier - Arequipa',
            location: 'Arequipa, Perú',
            description: 'Celebración en la ciudad blanca',
            date: '2026-12-19',
            time: '18:00',
            duration: 6
        }
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTimeline();
    initScrollAnimations();
    initFormHandlers();
    initSmoothScroll();
    initCompanionHandlers();
});

// ============================================
// TIMELINE ANIMADO
// ============================================

function initTimeline() {
    const timelineContainer = document.getElementById('timeline-daimiel');
    
    CONFIG.itinerarioDaimiel.forEach((item, index) => {
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        
        // Generar botón de mapa si existe mapsQuery o mapsUrl
        let mapsButton = '';
        if (item.mapsQuery || item.mapsUrl) {
            const mapsLink = item.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapsQuery)}`;
            const busClass = item.isBus ? 'maps-btn-bus' : '';
            mapsButton = `
                <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="timeline-maps-btn ${busClass}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                    Ver en mapa
                </a>
            `;
        }
        
        timelineItem.innerHTML = `
            <div class="timeline-content">
                <div class="timeline-time">${item.time}</div>
                <h4 class="timeline-title-item">${item.title}</h4>
                <p class="timeline-description">${item.description}</p>
                ${mapsButton}
            </div>
        `;
        timelineContainer.appendChild(timelineItem);
    });
}

function initScrollAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('painted');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
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
}

// ============================================
// FORM HANDLERS
// ============================================

function initFormHandlers() {
    // Formulario Daimiel
    const formDaimiel = document.getElementById('rsvp-form-daimiel');
    const companionsDaimiel = document.getElementById('companions-daimiel');
    
    if (formDaimiel) {
        companionsDaimiel.addEventListener('input', (e) => {
            const count = parseInt(e.target.value) || 0;
            updateCompanionsFields(count, 'daimiel');
        });
        
        formDaimiel.addEventListener('submit', (e) => handleFormSubmit(e, 'daimiel'));
    }
    
    // Formulario Arequipa
    const formArequipa = document.getElementById('rsvp-form-arequipa');
    const companionsArequipa = document.getElementById('companions-arequipa');
    
    if (formArequipa) {
        companionsArequipa.addEventListener('input', (e) => {
            const count = parseInt(e.target.value) || 0;
            updateCompanionsFields(count, 'arequipa');
        });
        
        formArequipa.addEventListener('submit', (e) => handleFormSubmit(e, 'arequipa'));
    }
}

function updateCompanionsFields(count, eventId) {
    const container = document.getElementById(`companions-names-${eventId}`);
    container.innerHTML = '';
    
    if (count > 0) {
        container.style.display = 'block';
        const heading = document.createElement('h4');
        heading.textContent = 'Datos de acompañantes';
        heading.style.fontFamily = 'var(--font-serif-alt)';
        heading.style.fontSize = '1.25rem';
        heading.style.color = 'var(--color-green-darker)';
        heading.style.marginBottom = 'var(--spacing-md)';
        container.appendChild(heading);
        
        const hint = document.createElement('p');
        hint.className = 'form-hint';
        hint.textContent = 'Por favor, proporciona el nombre completo de cada acompañante';
        hint.style.marginBottom = 'var(--spacing-md)';
        container.appendChild(hint);
        
        for (let i = 1; i <= count; i++) {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            formGroup.innerHTML = `
                <label for="companion-${eventId}-${i}">Nombre y apellidos del acompañante ${i} <span class="required">*</span></label>
                <input type="text" 
                       id="companion-${eventId}-${i}" 
                       name="companion-${i}" 
                       placeholder="Nombre completo" 
                       required 
                       data-companion-index="${i}">
                <span class="error-message" id="error-companion-${eventId}-${i}"></span>
            `;
            container.appendChild(formGroup);
        }
    } else {
        container.style.display = 'none';
    }
}

// ============================================
// VALIDACIÓN DEL FORMULARIO
// ============================================

function validateForm(formData, eventId) {
    const errors = {};
    
    // Nombre obligatorio
    if (!formData.name.trim()) {
        errors.name = 'Por favor, introduce tu nombre';
    }
    
    // Validar acompañantes
    if (formData.companions > 0) {
        // Verificar que todos los campos de acompañantes estén llenos
        for (let i = 0; i < formData.companionsNames.length; i++) {
            if (!formData.companionsNames[i] || !formData.companionsNames[i].trim()) {
                errors[`companion-${i + 1}`] = 'Este campo es obligatorio';
            } else {
                // Validar que tenga al menos nombre y apellido (dos palabras)
                const nameParts = formData.companionsNames[i].trim().split(/\s+/);
                if (nameParts.length < 2) {
                    errors[`companion-${i + 1}`] = 'Introduce nombre y apellidos completos';
                }
            }
        }
        
        // Verificar que el número de acompañantes coincida
        if (formData.companionsNames.filter(n => n && n.trim()).length < formData.companions) {
            errors.companions = `Debes proporcionar los nombres de todos los ${formData.companions} acompañantes`;
        }
    }
    
    // Teléfono obligatorio
    if (!formData.phone.trim()) {
        errors.phone = 'Por favor, introduce tu teléfono';
    } else if (!/^\d+$/.test(formData.phone.trim())) {
        errors.phone = 'El teléfono solo debe contener números';
    }
    
    // Consentimiento obligatorio
    if (!formData.consent) {
        errors.consent = 'Debes aceptar el tratamiento de datos';
    }
    
    return errors;
}

function showErrors(errors, eventId) {
    // Limpiar errores previos
    document.querySelectorAll(`#rsvp-form-${eventId} .error-message`).forEach(el => el.textContent = '');
    document.querySelectorAll(`#rsvp-form-${eventId} .form-group input, #rsvp-form-${eventId} .form-group textarea, #rsvp-form-${eventId} .form-group select`).forEach(el => {
        el.style.borderColor = '#e0e0e0';
    });
    
    // Mostrar nuevos errores
    Object.keys(errors).forEach(field => {
        // Para errores de acompañantes (companion-1, companion-2, etc.)
        if (field.startsWith('companion-')) {
            const errorEl = document.getElementById(`error-${field}-${eventId}`);
            const inputEl = document.getElementById(`${field}-${eventId}`);
            if (errorEl && inputEl) {
                errorEl.textContent = errors[field];
                inputEl.style.borderColor = 'var(--color-terracota)';
            }
        } else {
            // Para otros campos
            const errorEl = document.getElementById(`error-${field}-${eventId}`);
            if (errorEl) {
                errorEl.textContent = errors[field];
                const inputEl = document.getElementById(`${field}-${eventId}`);
                if (inputEl) {
                    inputEl.style.borderColor = 'var(--color-terracota)';
                }
            }
        }
    });
    
    // Scroll al primer error
    const firstError = Object.keys(errors)[0];
    let firstErrorEl;
    if (firstError.startsWith('companion-')) {
        firstErrorEl = document.getElementById(`${firstError}-${eventId}`);
    } else {
        firstErrorEl = document.getElementById(`${firstError}-${eventId}`);
    }
    if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => firstErrorEl.focus(), 500);
    }
}

// ============================================
// ENVÍO DEL FORMULARIO
// ============================================

async function handleFormSubmit(e, eventId) {
    e.preventDefault();
    
    // Anti-spam: honeypot
    const honeypot = document.getElementById(`website-${eventId}`).value;
    if (honeypot) {
        console.log('Spam detected');
        return;
    }
    
    const form = e.target;
    const submitBtn = document.getElementById(`submit-btn-${eventId}`);
    const buttonText = submitBtn.querySelector('.button-text');
    const buttonLoading = submitBtn.querySelector('.button-loading');
    
    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById(`name-${eventId}`).value.trim(),
        event: eventId, // 'daimiel' o 'arequipa'
        companions: parseInt(document.getElementById(`companions-${eventId}`).value) || 0,
        companionsNames: [],
        phonePrefix: document.getElementById(`phone-prefix-${eventId}`).value,
        phone: document.getElementById(`phone-${eventId}`).value.trim(),
        allergies: document.getElementById(`allergies-${eventId}`).value.trim(),
        bus: [],
        consent: document.getElementById(`consent-${eventId}`).checked
    };
    
    // Recopilar nombres de acompañantes (OBLIGATORIOS si companions > 0)
    for (let i = 1; i <= formData.companions; i++) {
        const companionInput = document.getElementById(`companion-${eventId}-${i}`);
        if (companionInput) {
            formData.companionsNames.push(companionInput.value.trim());
        }
    }
    
    // Recopilar bus (solo para Daimiel)
    if (eventId === 'daimiel') {
        formData.bus = Array.from(document.querySelectorAll(`#rsvp-form-${eventId} input[name="bus"]:checked`)).map(cb => cb.value);
    }
    
    // Validar
    const errors = validateForm(formData, eventId);
    if (Object.keys(errors).length > 0) {
        showErrors(errors, eventId);
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'flex';
    
    try {
        // Preparar datos para enviar
        // Formatear acompañantes como "1) Nombre Apellido | 2) Nombre Apellido"
        const acompanantesFormateados = formData.companionsNames
            .filter(name => name && name.trim())
            .map((name, index) => `${index + 1}) ${name}`)
            .join(' | ');
        
        const payload = {
            timestamp: new Date().toISOString(),
            evento: eventId,
            nombre_apellidos: formData.name,
            num_acompanantes: formData.companions,
            acompanantes: acompanantesFormateados,
            acompanantes_json: JSON.stringify(formData.companionsNames.filter(n => n && n.trim())),
            prefijo: formData.phonePrefix,
            telefono: formData.phone,
            alergias: formData.allergies,
            bus_tramos: formData.bus.join(', '),
            consentimiento: formData.consent ? 'Sí' : 'No',
            origen_url: window.location.href,
            user_agent: navigator.userAgent
        };
        
        // Enviar a Google Apps Script
        const response = await fetch(CONFIG.ENDPOINT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error('Error al enviar el formulario');
        }
        
        const result = await response.json();
        
        if (result.ok) {
            // Guardar evento seleccionado para el calendario
            window.selectedEvent = eventId;
            
            // Mostrar mensaje de éxito
            form.style.display = 'none';
            document.getElementById(`success-message-${eventId}`).style.display = 'block';
            
            // Scroll al mensaje de éxito
            document.getElementById(`success-message-${eventId}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema al enviar tu confirmación. Por favor, inténtalo de nuevo o contacta directamente con los novios.');
        
        // Restaurar botón
        submitBtn.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';
    }
}

// ============================================
// WHATSAPP Y CALENDARIO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Botones WhatsApp
    const whatsappBtnDaimiel = document.getElementById('whatsapp-btn-daimiel');
    const whatsappBtnArequipa = document.getElementById('whatsapp-btn-arequipa');
    if (whatsappBtnDaimiel) whatsappBtnDaimiel.href = CONFIG.WHATSAPP_COMMUNITY_URL;
    if (whatsappBtnArequipa) whatsappBtnArequipa.href = CONFIG.WHATSAPP_COMMUNITY_URL;
    
    // Botones Calendario
    const calendarBtnDaimiel = document.getElementById('calendar-btn-daimiel');
    const calendarBtnArequipa = document.getElementById('calendar-btn-arequipa');
    if (calendarBtnDaimiel) {
        calendarBtnDaimiel.addEventListener('click', () => handleCalendarDownload('daimiel'));
    }
    if (calendarBtnArequipa) {
        calendarBtnArequipa.addEventListener('click', () => handleCalendarDownload('arequipa'));
    }
});

function handleCalendarDownload(eventKey) {
    if (!eventKey) {
        eventKey = window.selectedEvent || 'daimiel';
    }
    
    downloadICS(eventKey);
}

function downloadICS(eventKey) {
    const event = CONFIG.eventos[eventKey];
    if (!event) return;
    
    const startDate = new Date(`${event.date}T${event.time}:00`);
    const endDate = new Date(startDate.getTime() + (event.duration * 60 * 60 * 1000));
    
    // Formatear fechas para ICS (formato: YYYYMMDDTHHmmss)
    const formatICSDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//María Phia & Javier//Wedding//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1D
DESCRIPTION:Recordatorio: Boda mañana
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
    
    // Crear y descargar archivo
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `boda-mariaphia-javier-${eventKey}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// UTILIDADES
// ============================================

// Rate limiting simple (para evitar spam)
const rateLimitMap = new Map();

function checkRateLimit(identifier, maxAttempts = 3, timeWindow = 60000) {
    const now = Date.now();
    const attempts = rateLimitMap.get(identifier) || [];
    
    // Filtrar intentos dentro de la ventana de tiempo
    const recentAttempts = attempts.filter(time => now - time < timeWindow);
    
    if (recentAttempts.length >= maxAttempts) {
        return false;
    }
    
    recentAttempts.push(now);
    rateLimitMap.set(identifier, recentAttempts);
    return true;
}

// Limpiar rate limit cada 5 minutos
setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((attempts, key) => {
        const filtered = attempts.filter(time => now - time < 300000);
        if (filtered.length === 0) {
            rateLimitMap.delete(key);
        } else {
            rateLimitMap.set(key, filtered);
        }
    });
}, 300000);