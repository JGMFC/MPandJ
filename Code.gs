// ============================================
// CONFIGURACIÓN
// ============================================

// IMPORTANTE: Reemplaza con el ID de tu Google Sheet
const SHEET_ID = 'TU_SHEET_ID_AQUI';

// Columnas de la hoja (cada persona es una fila)
const COLUMNS = [
    'timestamp',
    'evento',
    'nombre_apellidos',
    'prefijo',
    'telefono',
    'alergias',
    'es_principal',           // TRUE/FALSE
    'autobuses',              // Tramos de autobús separados por comas
    'consentimiento',
    'origen_url',
    'user_agent'
];

// ============================================
// FUNCIÓN PRINCIPAL (recibe las peticiones POST)
// ============================================

function doPost(e) {
    try {
        // Parsear el payload JSON
        const data = JSON.parse(e.postData.contents);
        
        // Validar datos básicos
        if (!data.evento || !data.personas || !Array.isArray(data.personas)) {
            return createResponse(400, {
                success: false,
                error: 'Datos inválidos: se requiere evento y array de personas'
            });
        }
        
        // Validar que haya al menos una persona
        if (data.personas.length === 0) {
            return createResponse(400, {
                success: false,
                error: 'Debe haber al menos una persona'
            });
        }
        
        // Obtener o crear la hoja
        const sheet = getOrCreateSheet();
        
        // Timestamp común para todo el grupo
        const timestamp = new Date().toISOString();
        
        // Insertar cada persona como una fila
        let insertedRows = 0;
        
        // Preparar datos de autobuses (comunes para todos en el grupo)
        const busOptions = data.busOptions || [];
        const busText = busOptions.length > 0 ? busOptions.join(', ') : '';
        
        data.personas.forEach((persona) => {
            const row = [
                timestamp,
                data.evento,
                persona.nombre_apellidos || '',
                persona.prefijo || '+34',
                persona.telefono || '',
                persona.alergias || '',
                persona.es_principal === true ? 'Sí' : 'No',
                busText,
                persona.consentimiento || '',
                persona.origen_url || '',
                persona.user_agent || ''
            ];
            
            sheet.appendRow(row);
            insertedRows++;
        });
        
        // Respuesta exitosa
        return createResponse(200, {
            success: true,
            message: `Se registraron ${insertedRows} persona(s) para el evento ${data.evento}`,
            insertedRows: insertedRows
        });
        
    } catch (error) {
        Logger.log('Error en doPost: ' + error.toString());
        return createResponse(500, {
            success: false,
            error: error.toString()
        });
    }
}

// ============================================
// FUNCIÓN PARA PRUEBAS GET
// ============================================

function doGet(e) {
    return createResponse(200, {
        success: true,
        message: 'Google Apps Script funcionando correctamente',
        timestamp: new Date().toISOString(),
        info: 'Envía una petición POST con el formulario RSVP'
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene la hoja o la crea si no existe
 */
function getOrCreateSheet() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('Confirmaciones');
    
    // Si no existe, crearla con encabezados
    if (!sheet) {
        sheet = ss.insertSheet('Confirmaciones');
        
        // Crear encabezados
        const headers = COLUMNS.map(col => {
            // Capitalizar y reemplazar guiones bajos
            return col
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        });
        
        sheet.appendRow(headers);
        
        // Formatear encabezados
        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#E75829');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');
        
        // Ajustar ancho de columnas
        sheet.setColumnWidth(1, 180);  // timestamp
        sheet.setColumnWidth(2, 100);  // evento
        sheet.setColumnWidth(3, 200);  // nombre_apellidos
        sheet.setColumnWidth(4, 80);   // prefijo
        sheet.setColumnWidth(5, 120);  // telefono
        sheet.setColumnWidth(6, 250);  // alergias
        sheet.setColumnWidth(7, 100);  // es_principal
        sheet.setColumnWidth(8, 120);  // consentimiento
        sheet.setColumnWidth(9, 300);  // origen_url
        sheet.setColumnWidth(10, 400); // user_agent
        
        // Congelar fila de encabezados
        sheet.setFrozenRows(1);
    }
    
    return sheet;
}

/**
 * Crea una respuesta HTTP con CORS habilitado
 */
function createResponse(statusCode, data) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Headers CORS (importante para que funcione desde GitHub Pages)
    return output;
}

// ============================================
// FUNCIÓN DE UTILIDAD PARA OBTENER ESTADÍSTICAS
// ============================================

/**
 * Obtiene estadísticas de las confirmaciones
 * Puedes ejecutar esta función desde el editor de Scripts
 */
function getEstadisticas() {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Quitar encabezados
    const rows = data.slice(1);
    
    // Contar por evento
    const stats = {
        total: rows.length,
        daimiel: rows.filter(row => row[1] === 'daimiel').length,
        arequipa: rows.filter(row => row[1] === 'arequipa').length,
        principales: rows.filter(row => row[6] === 'Sí').length,
        acompanantes: rows.filter(row => row[6] === 'No').length
    };
    
    Logger.log('=== ESTADÍSTICAS DE CONFIRMACIONES ===');
    Logger.log('Total de personas: ' + stats.total);
    Logger.log('Evento Daimiel: ' + stats.daimiel);
    Logger.log('Evento Arequipa: ' + stats.arequipa);
    Logger.log('Invitados principales: ' + stats.principales);
    Logger.log('Acompañantes: ' + stats.acompanantes);
    
    return stats;
}

/**
 * Agrupa personas por invitado principal (mismo timestamp)
 * Útil para ver quién viene con quién
 */
function getGrupos() {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const rows = data.slice(1);
    
    // Agrupar por timestamp
    const grupos = {};
    
    rows.forEach(row => {
        const timestamp = row[0];
        if (!grupos[timestamp]) {
            grupos[timestamp] = [];
        }
        grupos[timestamp].push({
            nombre: row[2],
            telefono: row[3] + row[4],
            es_principal: row[6],
            evento: row[1]
        });
    });
    
    Logger.log('=== GRUPOS DE INVITADOS ===');
    Object.keys(grupos).forEach(timestamp => {
        const grupo = grupos[timestamp];
        const principal = grupo.find(p => p.es_principal === 'Sí');
        const acompanantes = grupo.filter(p => p.es_principal === 'No');
        
        Logger.log(`\n${principal.nombre} (${principal.evento})`);
        if (acompanantes.length > 0) {
            Logger.log(`  + ${acompanantes.length} acompañante(s):`);
            acompanantes.forEach(acomp => {
                Logger.log(`    - ${acomp.nombre}`);
            });
        }
    });
    
    return grupos;
}
