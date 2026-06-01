// ============================================
// CONFIGURACIÓN
// ============================================

// IMPORTANTE: Reemplaza con el ID de tu Google Sheet
const SHEET_ID = '1YiDqTnu_Ctn3KR-XMvwZmp5SSRs1_C6fkC8UEQkb6oc';

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

const BUS_COLUMNS = [
    'timestamp',
    'nombre_apellidos',
    'consentimiento',
    'parada_pago_vicario_daimiel_ciudad_real',
    'parada_daimiel_pago_vicario_fin_ceremonia',
    'parada_0300_pago_vicario_daimiel_ciudad_real',
    'parada_0600_pago_vicario_daimiel_ciudad_real',
    'trayectos_resumen',
    'origen_url',
    'user_agent'
];

// ============================================
// FUNCIÓN PRINCIPAL (recibe las peticiones POST)
// ============================================

function doPost(e) {
    try {
        if (!e || !e.postData || !e.postData.contents) {
            return createResponse(400, {
                success: false,
                error: 'Peticion invalida: doPost necesita un body JSON. Si pruebas manualmente, usa pruebaInsercionAutobus() o llama la URL /exec con POST.'
            });
        }

        // Parsear el payload JSON
        const data = JSON.parse(e.postData.contents);

        // Formulario independiente de autobuses
        if (data.tipo_formulario === 'bus') {
            return handleBusFormPost(data);
        }
        
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

function handleBusFormPost(data) {
    var names = [];

    if (data.nombres_apellidos && Array.isArray(data.nombres_apellidos)) {
        names = data.nombres_apellidos
            .map(function(name) { return String(name || '').trim(); })
            .filter(function(name) { return name; });
    } else if (data.nombre_apellidos) {
        names = [String(data.nombre_apellidos).trim()].filter(function(name) { return name; });
    }

    if (!names.length) {
        return createResponse(400, {
            success: false,
            error: 'Datos invalidos para formulario de autobus: falta al menos un nombre'
        });
    }

    const sheet = getOrCreateBusSheet();
    const trayectosResumen = Array.isArray(data.trayectos) ? data.trayectos.join(', ') : '';

    names.forEach(function(name) {
        const row = [
            new Date().toISOString(),
            name,
            data.consentimiento || 'No',
            data.parada_pago_vicario_daimiel_ciudad_real || 'No',
            data.parada_daimiel_pago_vicario_fin_ceremonia || 'No',
            data.parada_0300_pago_vicario_daimiel_ciudad_real || 'No',
            data.parada_0600_pago_vicario_daimiel_ciudad_real || 'No',
            trayectosResumen,
            data.origen_url || '',
            data.user_agent || ''
        ];

        sheet.appendRow(row);
    });

    return createResponse(200, {
        success: true,
        message: 'Confirmacion de autobus guardada correctamente',
        insertedRows: names.length
    });
}

// ============================================
// FUNCIÓN PARA PRUEBAS GET
// ============================================

function doGet(e) {
    if (e && e.parameter && e.parameter.init === 'bus') {
        const sheet = getOrCreateBusSheet();
        return createResponse(200, {
            success: true,
            message: 'Hoja de autobuses inicializada',
            sheetName: sheet.getName()
        });
    }

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

function getOrCreateBusSheet() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName('ConfirmacionesBus');

    if (!sheet) {
        sheet = ss.insertSheet('ConfirmacionesBus');

        const headers = BUS_COLUMNS.map(col => {
            return col
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        });

        sheet.appendRow(headers);

        const headerRange = sheet.getRange(1, 1, 1, headers.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#7B8157');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');

        sheet.setColumnWidth(1, 180);  // timestamp
        sheet.setColumnWidth(2, 220);  // nombre_apellidos
        sheet.setColumnWidth(3, 120);  // consentimiento
        sheet.setColumnWidth(4, 180);  // parada 1
        sheet.setColumnWidth(5, 180);  // parada 2
        sheet.setColumnWidth(6, 180);  // parada 3
        sheet.setColumnWidth(7, 180);  // parada 4
        sheet.setColumnWidth(8, 420);  // trayectos_resumen
        sheet.setColumnWidth(9, 300);  // origen_url
        sheet.setColumnWidth(10, 420); // user_agent

        sheet.setFrozenRows(1);
    } else {
        ensureBusSheetHeaders(sheet);
    }

    return sheet;
}

function ensureBusSheetHeaders(sheet) {
    const lastColumn = Math.max(sheet.getLastColumn(), 1);
    const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(value) {
        return String(value || '').trim();
    });

    BUS_COLUMNS.forEach(function(columnName) {
        const headerLabel = columnName
            .split('_')
            .map(function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');

        if (currentHeaders.indexOf(headerLabel) === -1) {
            const newCol = sheet.getLastColumn() + 1;
            sheet.getRange(1, newCol).setValue(headerLabel);
            currentHeaders.push(headerLabel);
        }
    });
}

/**
 * Inicializa manualmente la pestaña de autobuses.
 * Ejecuta esta funcion una vez desde el editor de Apps Script.
 */
function inicializarHojaAutobuses() {
    const sheet = getOrCreateBusSheet();
    Logger.log('Hoja creada/verificada: ' + sheet.getName());
    return sheet.getName();
}

/**
 * Inserta una fila de prueba para verificar que el guardado de autobuses funciona.
 * Ejecuta esta funcion desde el editor y revisa la pestaña ConfirmacionesBus.
 */
function pruebaInsercionAutobus() {
    const testData = {
        nombre_apellidos: 'PRUEBA SISTEMA',
        trayectos: ['03:00 - Pago del Vicario a Daimiel (parada en Ciudad Real)'],
        consentimiento: 'Si',
        parada_pago_vicario_daimiel_ciudad_real: 'No',
        parada_daimiel_pago_vicario_fin_ceremonia: 'No',
        parada_0300_pago_vicario_daimiel_ciudad_real: 'Si',
        parada_0600_pago_vicario_daimiel_ciudad_real: 'No',
        origen_url: 'prueba-manual-apps-script',
        user_agent: 'apps-script-test'
    };

    const response = handleBusFormPost(testData);
    Logger.log('Resultado prueba autobus: ' + response.getContent());
    return response.getContent();
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
