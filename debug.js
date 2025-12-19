// Script de diagnóstico - cargar ANTES de script.js
console.log('🔍 DEBUG: Script de diagnóstico cargado');
console.log('🔍 DEBUG: Hora de carga:', new Date().toISOString());

// Verificar que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 DEBUG: DOM cargado');
    
    // Verificar elementos del formulario
    const formDaimiel = document.getElementById('rsvp-form-daimiel');
    console.log('🔍 DEBUG: Formulario Daimiel encontrado:', !!formDaimiel);
    
    if (formDaimiel) {
        console.log('🔍 DEBUG: ID del form:', formDaimiel.id);
        console.log('🔍 DEBUG: Botón submit:', !!formDaimiel.querySelector('.submit-button'));
        
        // Agregar listener temporal para verificar
        formDaimiel.addEventListener('submit', (e) => {
            console.log('🔍 DEBUG: ¡Formulario enviado!');
            console.log('🔍 DEBUG: Event:', e);
        });
    }
    
    // Verificar que CONFIG exista después de 1 segundo
    setTimeout(() => {
        console.log('🔍 DEBUG: CONFIG definido:', typeof CONFIG !== 'undefined');
        if (typeof CONFIG !== 'undefined') {
            console.log('🔍 DEBUG: ENDPOINT_URL:', CONFIG.ENDPOINT_URL);
        } else {
            console.error('❌ ERROR: CONFIG no está definido - script.js no se cargó correctamente');
        }
    }, 1000);
});

// Detectar errores de JavaScript
window.addEventListener('error', (e) => {
    console.error('❌ ERROR DE JAVASCRIPT:', e.message);
    console.error('❌ Archivo:', e.filename);
    console.error('❌ Línea:', e.lineno);
    console.error('❌ Columna:', e.colno);
});
