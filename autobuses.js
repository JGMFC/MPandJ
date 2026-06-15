const BUS_CONFIG = {
    ENDPOINT_URL: 'https://script.google.com/macros/s/AKfycby1mGn7bjiu4FTcjqcp4rrG6Zikh54z5MldowOS4KxifE60bmLh-k-RTpv9BF7gwCQl/exec'
};

const LODGING_LABELS = {
    ciudad_real: 'Ciudad Real',
    daimiel: 'Daimiel',
    otros: 'Otros'
};

const STOP_QUESTIONS = [
    {
        id: 'pv-daimiel-cr',
        label: 'Ciudad Real a Daimiel',
        title: 'Ciudad Real -> Daimiel -- Camino a la ceremonia',
        direction: 'Salida desde Ciudad Real y llegada a Daimiel. El punto de recogida está aquí: <a href="https://www.google.com/maps/place/13001+Ciudad+Real/@38.9826381,-3.9259879,17z/data=!3m1!4b1!4m6!3m5!1s0xd6bc33fc4cee7d5:0x6ae008fffdabf57c!8m2!3d38.9826381!4d-3.9259879!16s%2Fg%2F11c62wwlc8!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">Google Maps</a>.',
        time: '16:50 h.',
        info: 'Te recomendamos llegar 10 minutos antes.'
    },
    {
        id: 'daimiel-pv-fin',
        label: 'Fin de ceremonia: Daimiel a Pago del Vicario (directo)',
        title: 'Daimiel -> Pago del Vicario -- Camino a la celebración',
        direction: 'Punto de recogida en Daimiel (ubicación exacta por WhatsApp).',
        time: 'Al finalizar la ceremonia.',
        info: 'Trayecto directo sin paradas intermedias.'
    },
    {
        id: 'pv-daimiel-cr-0300',
        label: 'Vuelta Cenicienta (03:00) - Pago del Vicario a Daimiel (parada en Ciudad Real)',
        title: 'Vuelta Cenicienta - 03:00',
        direction: 'Salida desde Pago del Vicario, parada en Ciudad Real y llegada a Daimiel.',
        time: '03:00 h.',
        info: 'Perfecta para quien se retira antes del cierre.'
    },
    {
        id: 'pv-daimiel-cr-0600',
        label: 'Hasta las últimas (06:00) - Pago del Vicario a Daimiel (parada en Ciudad Real)',
        title: 'Hasta las últimas - 06:00',
        direction: 'Salida desde Pago del Vicario, parada en Ciudad Real y llegada a Daimiel.',
        time: '06:00 h.',
        info: 'Último autobús de regreso previsto.'
    }
];

let currentStopStartIndex = 0;
let currentStopIndex = 0;
let selectedLodging = '';
let stopAnswers = {};
let pairSelection = '';
let guestNames = [];
const FLOW_PROGRESS_LABELS = {
    'step-stay': 'Paso 1 de 3',
    'step-need': 'Paso 2 de 3',
    'step-stops': 'Paso 3 de 3'
};

document.addEventListener('DOMContentLoaded', () => {
    renderSharedItinerary();
    prefillName();
    bindStepFlow();
    bindConfirm();
    bindGiftCopy();
});

function renderSharedItinerary() {
    const track = document.getElementById('itinerary-track');
    if (!track) return;

    const source = Array.isArray(window.DAIMIEL_ITINERARIO) ? window.DAIMIEL_ITINERARIO : [];
    track.innerHTML = '';

    if (!source.length) {
        track.innerHTML = '<p>No se pudo cargar el itinerario en este momento.</p>';
        return;
    }

    source.forEach((item, index) => {
        const mapsLink = item.mapsUrl || (item.mapsQuery
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapsQuery)}`
            : '');

        const mapBadge = mapsLink
            ? `<a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="it-map-badge" aria-label="Abrir ${item.title || 'ubicación'} en Google Maps" title="Ver en Google Maps">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
                    </svg>
                </a>`
            : '';

        const card = document.createElement('article');
        card.className = 'itinerary-stop';
        card.innerHTML = `
            <div class="itinerary-stop-head">
                <span class="it-time">${item.time || ''}</span>
            </div>
            <h3>${item.title || ''} ${mapBadge}</h3>
            <p>${item.description || ''}</p>
        `;
        track.appendChild(card);

        if (index < source.length - 1) {
            const connector = document.createElement('span');
            connector.className = 'it-connector';
            connector.setAttribute('aria-hidden', 'true');
            track.appendChild(connector);
        }
    });
}

function prefillName() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('nombre') || '';

    if (fromQuery) {
        fromQuery
            .split(/\r?\n/)
            .map(name => name.trim())
            .filter(Boolean)
            .forEach(name => addGuestName(name, false));
    }

    renderGuestNames();
}

function getGuestNames() {
    return [...guestNames];
}

function renderGuestNames() {
    const list = document.getElementById('bus-names-list');
    if (!list) return;

    if (!guestNames.length) {
        list.innerHTML = '<p class="guest-names-empty">Todavía no has añadido ningún nombre.</p>';
        renderMiniSummary();
        return;
    }

    list.innerHTML = guestNames
        .map((name, index) => `
            <span class="guest-name-chip">
                <span>${escapeHtml(name)}</span>
                <button type="button" class="remove-name-btn" data-name-index="${index}" aria-label="Eliminar ${escapeHtml(name)}">Quitar</button>
            </span>
        `)
        .join('');

    list.querySelectorAll('.remove-name-btn').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.getAttribute('data-name-index'));
            removeGuestName(index);
        });
    });

    renderMiniSummary();
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function addGuestName(rawName, syncInput = true) {
    const name = String(rawName || '').trim();
    const entryInput = document.getElementById('bus-name-entry');
    const nameErrorEl = document.getElementById('name-error');

    if (!name) {
        return false;
    }

    guestNames.push(name);

    if (entryInput && syncInput) {
        entryInput.value = '';
        entryInput.focus();
    }

    if (nameErrorEl) {
        nameErrorEl.textContent = '';
    }

    renderGuestNames();
    return true;
}

function removeGuestName(index) {
    if (index < 0 || index >= guestNames.length) return;
    guestNames.splice(index, 1);
    renderGuestNames();
}

function setActiveFlowStep(stepId) {
    const steps = document.querySelectorAll('#flow-card .flow-step');
    const progress = document.getElementById('flow-progress');

    steps.forEach(step => {
        if (step.id === stepId) {
            step.classList.remove('hidden');
            step.classList.add('reveal');
        } else {
            step.classList.add('hidden');
            step.classList.remove('reveal');
        }
    });

    if (progress) {
        progress.textContent = FLOW_PROGRESS_LABELS[stepId] || 'Paso';
    }
}

function animateStopQuestionSwap() {
    const questionCard = document.querySelector('#step-stops .stop-item');
    if (!questionCard) return;

    questionCard.classList.remove('question-swap');
    void questionCard.offsetWidth;
    questionCard.classList.add('question-swap');
}

function highlightGift() {
    const giftSection = document.getElementById('gift-section');
    if (!giftSection) return;
    giftSection.classList.add('reveal');
    giftSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindStepFlow() {
    const stayButtons = Array.from(document.querySelectorAll('#stay-options .choice-btn'));
    const yesBtn = document.getElementById('need-bus-yes');
    const noBtn = document.getElementById('need-bus-no');
    const backToStayBtn = document.getElementById('back-to-stay');
    const stopYesBtn = document.getElementById('stop-answer-yes');
    const stopNoBtn = document.getElementById('stop-answer-no');
    const stopBackBtn = document.getElementById('stop-back');
    const pairStop1Btn = document.getElementById('pair-stop-1-select');
    const pairStop2Btn = document.getElementById('pair-stop-2-select');
    const pairStopNoneBtn = document.getElementById('pair-stop-none');

    const stayError = document.getElementById('stay-error');

    const successPanel = document.getElementById('bus-success');

    setActiveFlowStep('step-stay');

    stayButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lodging = button.getAttribute('data-lodging') || '';
            selectedLodging = lodging;
            stayButtons.forEach(btn => btn.classList.remove('is-selected'));
            button.classList.add('is-selected');
            stayError.textContent = '';
            setActiveFlowStep('step-need');
        });
    });

    yesBtn.addEventListener('click', () => {
        if (!selectedLodging) {
            setActiveFlowStep('step-stay');
            stayError.textContent = 'Indica dónde te hospedas para continuar.';
            return;
        }

        configureStopsByLodging(selectedLodging);
        successPanel.classList.add('hidden');
        setActiveFlowStep('step-stops');
    });

    noBtn.addEventListener('click', () => {
        successPanel.classList.add('hidden');
        setActiveFlowStep('step-need');
        highlightGift();
    });

    backToStayBtn.addEventListener('click', () => {
        setActiveFlowStep('step-stay');
    });

    stopYesBtn.addEventListener('click', () => {
        answerCurrentStop(true);
    });

    stopNoBtn.addEventListener('click', () => {
        answerCurrentStop(false);
    });

    pairStop1Btn.addEventListener('click', () => {
        choosePairedStop(STOP_QUESTIONS[2].id);
    });

    pairStop2Btn.addEventListener('click', () => {
        choosePairedStop(STOP_QUESTIONS[3].id);
    });

    pairStopNoneBtn.addEventListener('click', () => {
        answerCurrentStop(false);
    });

    stopBackBtn.addEventListener('click', () => {
        goBackStopQuestion();
    });
}

function getAllowedStops() {
    return STOP_QUESTIONS.slice(currentStopStartIndex);
}

function getSelectedLodging() {
    return selectedLodging;
}

function getStartIndexByLodging(lodging) {
    if (lodging === 'daimiel') return 1;
    return 0;
}

function resetStopFinalActions() {
    const stopFinalActions = document.getElementById('stop-final-actions');
    const formError = document.getElementById('form-error');
    const stopError = document.getElementById('stop-error');
    const nameError = document.getElementById('name-error');

    setStopFinalViewVisible(false);

    if (formError) {
        formError.textContent = '';
    }

    if (stopError) {
        stopError.textContent = '';
    }

    if (nameError) {
        nameError.textContent = '';
    }

    renderMiniSummary();
}

function setStopFinalViewVisible(isVisible) {
    const questionFlow = document.getElementById('stop-question-flow');
    const stopFinalActions = document.getElementById('stop-final-actions');

    if (questionFlow) {
        questionFlow.classList.toggle('hidden', isVisible);
    }

    if (stopFinalActions) {
        stopFinalActions.classList.toggle('hidden', !isVisible);
    }
}

function renderMiniSummary() {
    const summaryName = document.getElementById('summary-name');
    const summaryLodging = document.getElementById('summary-lodging');
    const summaryRoutes = document.getElementById('summary-routes');

    if (!summaryName || !summaryLodging || !summaryRoutes) return;

    const names = getGuestNames();
    const lodging = LODGING_LABELS[getSelectedLodging()] || 'No indicado';
    const selectedRoutes = getSelectedRoutesFromAnswers();

    summaryName.textContent = names.length ? names.join(' · ') : 'No indicado';
    summaryLodging.textContent = lodging;
    summaryRoutes.textContent = selectedRoutes.length
        ? selectedRoutes.map(route => route.title).join(' · ')
        : 'Ninguna parada seleccionada';
}

function configureStopsByLodging(lodging) {
    const hint = document.getElementById('lodging-hint');

    currentStopStartIndex = getStartIndexByLodging(lodging);
    stopAnswers = {};
    currentStopIndex = 0;
    pairSelection = '';
    resetStopFinalActions();
    renderCurrentStopQuestion();

    if (!hint) return;

    if (lodging === 'daimiel') {
        hint.textContent = '';
        return;
    }

    if (lodging === 'ciudad_real') {
        hint.textContent = '';
        return;
    }

    const lodgingLabel = LODGING_LABELS[lodging] || 'tu zona';
    hint.textContent = `Como te hospedas en ${lodgingLabel}, responderás desde la parada 1 hasta la 4 en orden.`;
}

function renderCurrentStopQuestion() {
    const allowedStops = getAllowedStops();
    const currentStop = allowedStops[currentStopIndex];

    const titleEl = document.getElementById('stop-question-title');
    const directionEl = document.getElementById('stop-question-direction');
    const timeEl = document.getElementById('stop-question-time');
    const infoEl = document.getElementById('stop-question-info');
    const singleView = document.getElementById('single-stop-view');
    const pairView = document.getElementById('paired-stop-view');
    const singleActions = document.getElementById('single-stop-actions');
    const stopPair1 = document.getElementById('pair-stop-1');
    const stopPair2 = document.getElementById('pair-stop-2');
    const stopPair1Title = document.getElementById('pair-stop-1-title');
    const stopPair1Direction = document.getElementById('pair-stop-1-direction');
    const stopPair1Time = document.getElementById('pair-stop-1-time');
    const stopPair1Info = document.getElementById('pair-stop-1-info');
    const stopPair2Title = document.getElementById('pair-stop-2-title');
    const stopPair2Direction = document.getElementById('pair-stop-2-direction');
    const stopPair2Time = document.getElementById('pair-stop-2-time');
    const stopPair2Info = document.getElementById('pair-stop-2-info');
    const stopError = document.getElementById('stop-error');

    if (!currentStop) return;

    const renderPairedChoices = allowedStops.length - currentStopIndex === 2;

    setStopFinalViewVisible(false);
    animateStopQuestionSwap();

    if (renderPairedChoices) {
        if (singleView) singleView.classList.add('hidden');
        if (singleActions) singleActions.classList.add('hidden');
        if (pairView) pairView.classList.remove('hidden');

        const lateStopA = STOP_QUESTIONS[2];
        const lateStopB = STOP_QUESTIONS[3];

        if (stopPair1Title) stopPair1Title.textContent = lateStopA.title;
        if (stopPair1Direction) stopPair1Direction.innerHTML = `<strong>Dirección:</strong> ${lateStopA.direction}`;
        if (stopPair1Time) stopPair1Time.innerHTML = `<strong>Hora estimada:</strong> ${lateStopA.time}`;
        if (stopPair1Info) stopPair1Info.innerHTML = `<strong>Info de interés:</strong> ${lateStopA.info}`;

        if (stopPair2Title) stopPair2Title.textContent = lateStopB.title;
        if (stopPair2Direction) stopPair2Direction.innerHTML = `<strong>Dirección:</strong> ${lateStopB.direction}`;
        if (stopPair2Time) stopPair2Time.innerHTML = `<strong>Hora estimada:</strong> ${lateStopB.time}`;
        if (stopPair2Info) stopPair2Info.innerHTML = `<strong>Info de interés:</strong> ${lateStopB.info}`;

        if (stopPair1) stopPair1.classList.toggle('is-selected', pairSelection === lateStopA.id);
        if (stopPair2) stopPair2.classList.toggle('is-selected', pairSelection === lateStopB.id);

        if (stopError) {
            stopError.textContent = '';
        }

        return;
    }

    if (singleView) singleView.classList.remove('hidden');
    if (singleActions) singleActions.classList.remove('hidden');
    if (pairView) pairView.classList.add('hidden');

    if (titleEl) {
        titleEl.textContent = currentStop.title;
    }

    if (directionEl) {
        directionEl.innerHTML = `<strong>Dirección:</strong> ${currentStop.direction}`;
    }

    if (timeEl) {
        timeEl.innerHTML = `<strong>Hora estimada:</strong> ${currentStop.time}`;
    }

    if (infoEl) {
        infoEl.innerHTML = `<strong>Info de interés:</strong> ${currentStop.info}`;
    }

    if (stopError) {
        stopError.textContent = '';
    }

}

function answerCurrentStop(answerYes) {
    const allowedStops = getAllowedStops();
    const currentStop = allowedStops[currentStopIndex];
    const stopError = document.getElementById('stop-error');

    if (!currentStop) return;

    if (currentStopIndex >= 2) {
        const lateStopA = STOP_QUESTIONS[2];
        const lateStopB = STOP_QUESTIONS[3];

        stopAnswers[lateStopA.id] = false;
        stopAnswers[lateStopB.id] = false;
        pairSelection = '';

        if (stopError) {
            stopError.textContent = '';
        }

        renderMiniSummary();
        setStopFinalViewVisible(true);

        return;
    }

    stopAnswers[currentStop.id] = Boolean(answerYes);

    if (currentStopIndex < allowedStops.length - 1) {
        currentStopIndex += 1;
        renderCurrentStopQuestion();
        return;
    }

    if (stopError) {
        stopError.textContent = '';
    }

    renderMiniSummary();
    setStopFinalViewVisible(true);
}

function choosePairedStop(stopId) {
    const lateStopA = STOP_QUESTIONS[2];
    const lateStopB = STOP_QUESTIONS[3];

    stopAnswers[lateStopA.id] = stopId === lateStopA.id;
    stopAnswers[lateStopB.id] = stopId === lateStopB.id;
    pairSelection = stopId;

    const stopError = document.getElementById('stop-error');

    renderMiniSummary();
    setStopFinalViewVisible(true);

    if (stopError) {
        stopError.textContent = '';
    }
}

function goBackStopQuestion() {
    const stopFinalActions = document.getElementById('stop-final-actions');
    const formError = document.getElementById('form-error');

    if (stopFinalActions && !stopFinalActions.classList.contains('hidden')) {
        setStopFinalViewVisible(false);
        renderCurrentStopQuestion();
        if (formError) {
            formError.textContent = '';
        }
        return;
    }

    if (currentStopIndex > 0) {
        currentStopIndex -= 1;
        pairSelection = '';
        renderCurrentStopQuestion();
        return;
    }

    setActiveFlowStep('step-need');
}

function getSelectedRoutesFromAnswers() {
    const allowedStops = getAllowedStops();
    return allowedStops.filter(stop => Boolean(stopAnswers[stop.id]));
}

function collectData() {
    const selectedRoutes = getSelectedRoutesFromAnswers();

    return {
        names: getGuestNames(),
        lodging: getSelectedLodging(),
        routeIds: selectedRoutes.map(item => item.id),
        routeLabels: selectedRoutes.map(item => item.label)
    };
}

function validate(data) {
    if (!data.names || !data.names.length) return 'Necesitamos al menos un nombre y apellidos.';
    if (!data.lodging) return 'Indica dónde te hospedas.';
    return '';
}

function resetBusForm() {
    const nameInput = document.getElementById('bus-name-entry');
    const stayButtons = Array.from(document.querySelectorAll('#stay-options .choice-btn'));
    const stopFinalActions = document.getElementById('stop-final-actions');
    const formError = document.getElementById('form-error');
    const stopError = document.getElementById('stop-error');
    const nameError = document.getElementById('name-error');

    guestNames = [];
    selectedLodging = '';
    stopAnswers = {};
    pairSelection = '';
    currentStopStartIndex = 0;
    currentStopIndex = 0;

    if (nameInput) {
        nameInput.value = '';
    }

    stayButtons.forEach(button => button.classList.remove('is-selected'));

    if (stopFinalActions) {
        stopFinalActions.classList.add('hidden');
    }

    if (formError) {
        formError.textContent = '';
    }

    if (stopError) {
        stopError.textContent = '';
    }

    if (nameError) {
        nameError.textContent = '';
    }

    renderGuestNames();
    setActiveFlowStep('step-stay');
}

function bindConfirm() {
    const btn = document.getElementById('confirm-bus');
    const errorEl = document.getElementById('form-error');
    const nameErrorEl = document.getElementById('name-error');
    const nameInput = document.getElementById('bus-name-entry');
    const addNameBtn = document.getElementById('add-bus-name');
    const successPanel = document.getElementById('bus-success');

    if (nameInput) {
        nameInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                addGuestName(nameInput.value);
            }
        });
    }

    if (addNameBtn && nameInput) {
        addNameBtn.addEventListener('click', () => {
            addGuestName(nameInput.value);
        });
    }

    renderGuestNames();

    btn.addEventListener('click', async () => {
        const data = collectData();
        const error = validate(data);

        if (error) {
            if (error.includes('nombre')) {
                if (nameErrorEl) {
                    nameErrorEl.textContent = error;
                }
                errorEl.textContent = '';
            } else {
                errorEl.textContent = error;
            }
            return;
        }

        if (nameErrorEl) {
            nameErrorEl.textContent = '';
        }
        errorEl.textContent = '';
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        const sharedPayload = {
            tipo_formulario: 'bus',
            nombres_apellidos: data.names,
            grupo_nombres_apellidos: data.names.join(' · '),
            hospedaje: LODGING_LABELS[data.lodging] || data.lodging,
            trayectos: data.routeLabels,
            parada_pago_vicario_daimiel_ciudad_real: data.routeIds.includes('pv-daimiel-cr') ? 'Sí' : 'No',
            parada_daimiel_pago_vicario_fin_ceremonia: data.routeIds.includes('daimiel-pv-fin') ? 'Sí' : 'No',
            parada_0300_pago_vicario_daimiel_ciudad_real: data.routeIds.includes('pv-daimiel-cr-0300') ? 'Sí' : 'No',
            parada_0600_pago_vicario_daimiel_ciudad_real: data.routeIds.includes('pv-daimiel-cr-0600') ? 'Sí' : 'No',
            consentimiento: 'No solicitado en formulario',
            origen_url: window.location.href,
            user_agent: navigator.userAgent
        };

        try {
            for (const name of data.names) {
                const payload = {
                    ...sharedPayload,
                    nombre_apellidos: name,
                    nombres_apellidos: [name]
                };

                await fetch(BUS_CONFIG.ENDPOINT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            resetBusForm();
            successPanel.classList.remove('hidden');
            successPanel.classList.add('reveal');
            successPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            highlightGift();
        } catch (err) {
            errorEl.textContent = 'No se pudo confirmar ahora mismo. Inténtalo otra vez.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Confirmar autobuses';
        }
    });
}

function bindGiftCopy() {
    const buttons = Array.from(document.querySelectorAll('.copy-method'));
    const feedback = document.getElementById('copy-feedback');

    if (!buttons.length || !feedback) return;

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            const value = button.getAttribute('data-copy') || '';
            const label = button.getAttribute('data-label') || 'Dato';

            try {
                await navigator.clipboard.writeText(value.trim());
                feedback.textContent = `${label} copiado.`;
            } catch (error) {
                feedback.textContent = 'No se pudo copiar automáticamente.';
            }
        });
    });
}

