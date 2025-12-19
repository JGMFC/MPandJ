// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
    // URL del Google Apps Script (deploy como Web App)
    ENDPOINT_URL: 'https://script.google.com/macros/s/AKfycbzfe9S4h1-mqTtU7Zmdw13lLh0E0srVB0e9HS_LiHfuz2CYGmq6EwDFkztvmXIX3OcUMg/exec',
    
    // URL de la comunidad de WhatsApp
    WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/DZNBouDymGLELNyQmrYudh',
    
    // Itinerario Daimiel (editable fácilmente)
    itinerarioDaimiel: [
        {
            time: '18:00',
            title: 'Ceremonia Religiosa',
            description: 'Iglesia de San Pedro, Daimiel',
            mapsQuery: 'Iglesia de San Pedro, Daimiel, Ciudad Real, España'
        },
        {
            time: '19:00',
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
        }
    ],
    
    // Eventos para calendario
    eventos: {
        daimiel: {
            title: 'Boda María Phia & Javier - Daimiel',
            location: 'Iglesia de San Pedro, Daimiel, España',
            description: 'Ceremonia religiosa y celebración en Bodega Pago del Vicario',
            date: '2026-07-04',
            time: '18:00',
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
    
    // Generar el camino después de crear las tarjetas
    setTimeout(() => drawTimelinePath(), 100);
}

function drawTimelinePath() {
    const timelineContainer = document.getElementById('timeline-daimiel');
    const timelineItems = timelineContainer.querySelectorAll('.timeline-item');
    const existingSvg = timelineContainer.querySelector('.timeline-path');
    
    if (!timelineItems.length) return;
    
    // Calcular posiciones de las tarjetas
    const positions = [];
    timelineItems.forEach((item, index) => {
        const content = item.querySelector('.timeline-content');
        const rect = content.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();
        
        // Posición relativa al contenedor
        const x = rect.left - containerRect.left + rect.width / 2;
        const y = rect.top - containerRect.top + rect.height / 2;
        
        positions.push({ x, y });
    });
    
    // Crear el path SVG que conecta las posiciones
    let pathD = `M ${positions[0].x} ${positions[0].y}`;
    
    for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        
        // Calcular punto de control para curva suave
        const midY = (prev.y + curr.y) / 2;
        const controlX1 = prev.x;
        const controlY1 = midY;
        const controlX2 = curr.x;
        const controlY2 = midY;
        
        // Añadir curva bezier
        pathD += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${curr.x} ${curr.y}`;
    }
    
    // Calcular altura total del contenedor
    const totalHeight = timelineContainer.scrollHeight;
    const totalWidth = timelineContainer.offsetWidth;
    
    // Actualizar o crear SVG
    if (existingSvg) {
        existingSvg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
        const pathElement = existingSvg.querySelector('.path-line');
        pathElement.setAttribute('d', pathD);
        
        // Calcular longitud del path para animación
        const pathLength = pathElement.getTotalLength();
        pathElement.style.strokeDasharray = pathLength;
        pathElement.style.strokeDashoffset = pathLength;
    }
}

function initScrollAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const paintingTitles = document.querySelectorAll('.painting-effect');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };
    
    let paintedCount = 0;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('painted');
                paintedCount++;
                
                // Animar el camino hasta este punto
                animatePathToItem(paintedCount, timelineItems.length);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observar items del timeline
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Observar títulos con efecto de pintado
    const titleObserverOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('painting-active');
                titleObserver.unobserve(entry.target);
            }
        });
    }, titleObserverOptions);
    
    paintingTitles.forEach(title => {
        titleObserver.observe(title);
    });
}

function animatePathToItem(itemCount, totalItems) {
    const pathElement = document.querySelector('.timeline-path .path-line');
    if (!pathElement) return;
    
    const pathLength = pathElement.getTotalLength();
    const progress = itemCount / totalItems;
    const targetOffset = pathLength * (1 - progress);
    
    pathElement.style.transition = 'stroke-dashoffset 0.8s ease-out';
    pathElement.style.strokeDashoffset = targetOffset;
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
// GESTIÓN DE ACOMPAÑANTES
// ============================================

let companionCounters = {
    daimiel: 1,  // Empieza en 1 porque 0 es el principal
    arequipa: 1
};

function initCompanionHandlers() {
    // Daimiel
    const addBtnDaimiel = document.getElementById('add-companion-daimiel');
    if (addBtnDaimiel) {
        addBtnDaimiel.addEventListener('click', () => addCompanion('daimiel'));
    }
    
    // Arequipa
    const addBtnArequipa = document.getElementById('add-companion-arequipa');
    if (addBtnArequipa) {
        addBtnArequipa.addEventListener('click', () => addCompanion('arequipa'));
    }
}

function addCompanion(eventId) {
    const container = document.getElementById(`companions-container-${eventId}`);
    const index = companionCounters[eventId]++;
    
    const companionCard = document.createElement('div');
    companionCard.className = 'person-card companion-card';
    companionCard.setAttribute('data-person-index', index);
    companionCard.setAttribute('data-is-main', 'false');
    
    companionCard.innerHTML = `
        <div class="companion-header">
            <h5 class="companion-number">Acompañante #${index}</h5>
            <button type="button" class="remove-companion-btn" onclick="removeCompanion('${eventId}', ${index})">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                Eliminar
            </button>
        </div>
        
        <div class="form-group">
            <label for="name-${eventId}-${index}">Nombre y Apellidos <span class="required">*</span></label>
            <input type="text" id="name-${eventId}-${index}" name="name-${index}" required data-person-index="${index}">
            <span class="error-message" id="error-name-${eventId}-${index}"></span>
        </div>
        
        <div class="form-group form-group-phone">
            <label for="phone-${eventId}-${index}">Teléfono <span class="required">*</span></label>
            <div class="phone-input-group">
                <select id="phone-prefix-${eventId}-${index}" name="phone-prefix-${index}" required data-person-index="${index}">
                    <option value="+51" data-flag="🇵🇪">🇵🇪 +51</option>
                    <option value="+34" data-flag="🇪🇸" selected>🇪🇸 +34</option>
                    <option value="+1" data-flag="🇺🇸">🇺🇸 +1</option>
                    <option value="+44" data-flag="🇬🇧">🇬🇧 +44</option>
                    <option value="+54" data-flag="🇦🇷">🇦🇷 +54</option>
                    <option value="+55" data-flag="🇧🇷">🇧🇷 +55</option>
                    <option value="+56" data-flag="🇨🇱">🇨🇱 +56</option>
                    <option value="+57" data-flag="🇨🇴">🇨🇴 +57</option>
                    <option value="+52" data-flag="🇲🇽">🇲🇽 +52</option>
                </select>
                <input type="tel" id="phone-${eventId}-${index}" name="phone-${index}" required placeholder="Número" data-person-index="${index}">
            </div>
            <span class="error-message" id="error-phone-${eventId}-${index}"></span>
        </div>
        
        <div class="form-group">
            <label for="allergies-${eventId}-${index}">Alergias o intolerancias</label>
            <textarea id="allergies-${eventId}-${index}" name="allergies-${index}" rows="2" placeholder="Ej: Gluten, lactosa..." data-person-index="${index}"></textarea>
        </div>
    `;
    
    container.appendChild(companionCard);
    
    // Scroll suave hasta el nuevo acompañante
    setTimeout(() => {
        companionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

function removeCompanion(eventId, index) {
    const companionCard = document.querySelector(`#companions-container-${eventId} .person-card[data-person-index="${index}"]`);
    if (companionCard) {
        companionCard.style.opacity = '0';
        companionCard.style.transform = 'scale(0.95)';
        setTimeout(() => {
            companionCard.remove();
            renumberCompanions(eventId);
        }, 300);
    }
}

function renumberCompanions(eventId) {
    const companions = document.querySelectorAll(`#companions-container-${eventId} .companion-card`);
    companions.forEach((card, index) => {
        const number = index + 1;
        const header = card.querySelector('.companion-number');
        if (header) {
            header.textContent = `Acompañante #${number}`;
        }
    });
}

// ============================================
// FORM HANDLERS
// ============================================

function initFormHandlers() {
    // Formulario Daimiel
    const formDaimiel = document.getElementById('rsvp-form-daimiel');
    if (formDaimiel) {
        formDaimiel.addEventListener('submit', (e) => handleFormSubmit(e, 'daimiel'));
    }
    
    // Formulario Arequipa
    const formArequipa = document.getElementById('rsvp-form-arequipa');
    if (formArequipa) {
        formArequipa.addEventListener('submit', (e) => handleFormSubmit(e, 'arequipa'));
    }
}

// ============================================
// RECOPILACIÓN Y ENVÍO DE DATOS
// ============================================

function collectFormData(form, eventId) {
    // Recopilar todas las personas (principal + acompañantes)
    const persons = [];
    const personCards = form.querySelectorAll('.person-card');
    
    personCards.forEach((card, index) => {
        const personIndex = card.getAttribute('data-person-index');
        const isMain = card.getAttribute('data-is-main') === 'true';
        
        const nameInput = form.querySelector(`[name="name-${personIndex}"]`);
        const prefixInput = form.querySelector(`[name="phone-prefix-${personIndex}"]`);
        const phoneInput = form.querySelector(`[name="phone-${personIndex}"]`);
        const allergiesInput = form.querySelector(`[name="allergies-${personIndex}"]`);
        
        persons.push({
            nombre_apellidos: nameInput ? nameInput.value.trim() : '',
            prefijo: prefixInput ? prefixInput.value : '+34',
            telefono: phoneInput ? phoneInput.value.trim() : '',
            alergias: allergiesInput ? allergiesInput.value.trim() : '',
            es_principal: isMain
        });
    });
    
    // Recopilar opciones de autobús (solo para Daimiel)
    let busOptions = [];
    if (eventId === 'daimiel') {
        const busCheckboxes = form.querySelectorAll('[name="bus"]:checked');
        busOptions = Array.from(busCheckboxes).map(cb => cb.value);
    }
    
    // Consentimiento
    const consentInput = form.querySelector('[name="consent"]');
    const consent = consentInput ? consentInput.checked : false;
    
    return {
        persons,
        busOptions,
        consent,
        event: eventId
    };
}

function validateForm(formData, eventId) {
    const errors = {};
    
    // Validar cada persona
    formData.persons.forEach((person, index) => {
        const personIndex = document.querySelectorAll(`#rsvp-form-${eventId} .person-card`)[index]?.getAttribute('data-person-index') || index;
        
        // Nombre obligatorio
        if (!person.nombre_apellidos) {
            errors[`name-${personIndex}`] = 'El nombre es obligatorio';
        } else {
            // Validar formato: al menos 2 palabras (nombre + apellido)
            const nameParts = person.nombre_apellidos.split(/\s+/);
            if (nameParts.length < 2) {
                errors[`name-${personIndex}`] = 'Introduce nombre y apellidos completos';
            }
        }
        
        // Teléfono obligatorio
        if (!person.telefono) {
            errors[`phone-${personIndex}`] = 'El teléfono es obligatorio';
        } else if (!/^\d+$/.test(person.telefono)) {
            errors[`phone-${personIndex}`] = 'Solo números';
        }
    });
    
    // Consentimiento obligatorio
    if (!formData.consent) {
        errors.consent = 'Debes aceptar el tratamiento de datos';
    }
    
    return errors;
}

function showErrors(errors, eventId) {
    // Limpiar errores previos
    document.querySelectorAll(`#rsvp-form-${eventId} .error-message`).forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll(`#rsvp-form-${eventId} .error`).forEach(el => {
        el.classList.remove('error');
    });
    
    // Mostrar nuevos errores
    Object.keys(errors).forEach(field => {
        const errorEl = document.getElementById(`error-${field}-${eventId}`);
        const inputEl = document.getElementById(`${field}-${eventId}`);
        
        if (errorEl) {
            errorEl.textContent = errors[field];
            errorEl.style.display = 'block';
        }
        if (inputEl) {
            inputEl.classList.add('error');
        }
    });
}

async function handleFormSubmit(e, eventId) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-button');
    const buttonText = submitBtn.querySelector('.button-text');
    const buttonLoading = submitBtn.querySelector('.button-loading');
    
    // Honeypot anti-spam
    const honeypot = form.querySelector(`#website-${eventId}`);
    if (honeypot && honeypot.value) {
        console.log('Bot detectado');
        return;
    }
    
    // Recopilar datos
    const formData = collectFormData(form, eventId);
    
    // Validar
    const errors = validateForm(formData, eventId);
    if (Object.keys(errors).length > 0) {
        showErrors(errors, eventId);
        // Scroll al primer error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Limpiar errores
    showErrors({}, eventId);
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    buttonText.style.display = 'none';
    buttonLoading.style.display = 'inline-flex';
    
    try {
        // Preparar payload: array de personas + opciones de autobús
        const payload = {
            evento: eventId,
            busOptions: formData.busOptions || [],
            personas: formData.persons.map(person => ({
                ...person,
                consentimiento: formData.consent ? 'Sí' : 'No',
                origen_url: window.location.href,
                user_agent: navigator.userAgent
            }))
        };
        
        // Enviar a Google Apps Script
        const response = await fetch(CONFIG.ENDPOINT_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        // Mostrar mensaje de éxito
        form.style.display = 'none';
        const successMsg = document.getElementById(`success-message-${eventId}`);
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Configurar botones de acción
        const whatsappBtn = document.getElementById(`whatsapp-btn-${eventId}`);
        if (whatsappBtn) {
            whatsappBtn.href = CONFIG.WHATSAPP_COMMUNITY_URL;
        }
        
        const calendarBtn = document.getElementById(`calendar-btn-${eventId}`);
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => downloadCalendar(eventId));
        }
        
    } catch (error) {
        console.error('Error al enviar:', error);
        alert('Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        buttonText.style.display = 'inline';
        buttonLoading.style.display = 'none';
    }
}

// ============================================
// CALENDARIO ICS
// ============================================

function downloadCalendar(eventId) {
    const evento = CONFIG.eventos[eventId];
    if (!evento) return;
    
    const startDate = new Date(`${evento.date}T${evento.time}`);
    const endDate = new Date(startDate.getTime() + evento.duration * 60 * 60 * 1000);
    
    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Boda María Phia & Javier//ES',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${Date.now()}@bodasmariaphiajavier.com`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${evento.title}`,
        `DESCRIPTION:${evento.description}`,
        `LOCATION:${evento.location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'DESCRIPTION:Recordatorio: Boda mañana',
        'ACTION:DISPLAY',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `boda-${eventId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
