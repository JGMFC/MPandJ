/**
 * Google Apps Script - Backend para RSVP con múltiples registros
 * 
 * NUEVA ESTRUCTURA: Cada persona (principal + acompañantes) = 1 fila en Sheets
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 
 * 1. Crear una Google Sheet nueva:
 *    - Ve a https://sheets.google.com
 *    - Crea una nueva hoja
 *    - Nómbrala "Confirmaciones Boda María Phia & Javier"
 * 
 * 2. Copiar el ID de la Sheet:
 *    - En la URL verás algo como: docs.google.com/spreadsheets/d/ABC123XYZ/edit
 *    - Copia "ABC123XYZ" (el ID)
 *    - Reemplázalo abajo en SHEET_ID
 * 
 * 3. Abrir Apps Script:
 *    - En la Sheet, ve a Extensiones > Apps Script
 *    - Borra el código por defecto
 *    - Pega este código completo
 * 
 * 4. Desplegar como Web App:
 *    - Haz clic en "Implementar" > "Nueva implementación"
 *    - Tipo: "Aplicación web"
 *    - Ejecutar como: "Yo"
 *    - Quién tiene acceso: "Cualquier persona"
 *    - Haz clic en "Implementar"
 *    - Copia la URL (https://script.google.com/macros/s/ABC.../exec)
 * 
 * 5. Pegar la URL en script.js:
 *    - Busca CONFIG.ENDPOINT_URL
 *    - Reemplaza con la URL copiada
 */

// ============================================
// CONFIGURACIÓN
// ============================================

const SHEET_ID = 'TU_SHEET_ID_AQUI';  // ← REEMPLAZAR CON TU ID

const COLUMNS = [
    'timestamp',
    'evento',
    'nombre_apellidos',
    'prefijo',
    'telefono',
    'alergias',
    'es_principal',
    'consentimiento',
    'origen_url',
    'user_agent'
];

// ============================================
// ENDPOINT PRINCIPAL
// ============================================

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        // Validar estructura
        if (!data.evento || !data.personas || !Array.isArray(data.personas)) {
            return createResponse(400, { error: 'Estructura de datos inválida' });
        }
        
        // Validar que hay al menos una persona
        if (data.personas.length === 0) {
            return createResponse(400, { error: 'Debe haber al menos una persona' });
        }
        
        // Obtener o crear hoja del evento
        const sheet = getOrCreateSheet(data.evento);
        
        // Procesar cada persona y crear una fila
        const results = [];
        data.personas.forEach((person, index) => {
            // Validar campos obligatorios
            if (!person.nombre_apellidos || !person.telefono) {
                results.push({
                    index,
                    nombre: person.nombre_apellidos || 'Sin nombre',
                    status: 'ERROR',
                    message: 'Faltan campos obligatorios'
                });
                return;
            }
            
            const row = [
                new Date().toISOString(),
                data.evento,
                person.nombre_apellidos || '',
                person.prefijo || '+34',
                person.telefono || '',
                person.alergias || '',
                person.es_principal ? 'Sí' : 'No',
                person.consentimiento || 'No',
                person.origen_url || '',
                person.user_agent || ''
            ];
            
            sheet.appendRow(row);
            results.push({
                index,
                nombre: person.nombre_apellidos,
                status: 'OK'
            });
        });
        
        // Verificar si hubo errores
        const errores = results.filter(r => r.status === 'ERROR');
        if (errores.length > 0) {
            return createResponse(400, {
                success: false,
                message: `${errores.length} persona(s) no pudo(pudieron) ser registrada(s)`,
                details: results
            });
        }
        
        return createResponse(200, {
            success: true,
            message: `${results.length} persona(s) registrada(s) exitosamente`,
            details: results
        });
        
    } catch (error) {
        Logger.log('Error en doPost: ' + error.toString());
        return createResponse(500, { error: error.toString() });
    }
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function getOrCreateSheet(eventName) {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(eventName);
    
    if (!sheet) {
        sheet = spreadsheet.insertSheet(eventName);
        
        // Agregar encabezados
        sheet.appendRow(COLUMNS.map(col => col.toUpperCase().replace(/_/g, ' ')));
        
        // Formatear encabezados
        const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#99A66F');
        headerRange.setFontColor('#FFFFFF');
        headerRange.setHorizontalAlignment('center');
        sheet.setFrozenRows(1);
        
        // Auto-ajustar columnas
        COLUMNS.forEach((_, index) => {
            sheet.autoResizeColumn(index + 1);
        });
    }
    
    return sheet;
}

function createResponse(statusCode, body) {
    return ContentService
        .createTextOutput(JSON.stringify(body))
        .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// FUNCIONES DE TEST (opcional)
// ============================================

function testDoPost() {
    const testData = {
        evento: 'daimiel',
        personas: [
            {
                nombre_apellidos: 'Juan Pérez García',
                prefijo: '+34',
                telefono: '612345678',
                alergias: 'Gluten',
                es_principal: true,
                consentimiento: 'Sí',
                origen_url: 'http://localhost:8000',
                user_agent: 'Test'
            },
            {
                nombre_apellidos: 'María López Ruiz',
                prefijo: '+34',
                telefono: '623456789',
                alergias: '',
                es_principal: false,
                consentimiento: 'Sí',
                origen_url: 'http://localhost:8000',
                user_agent: 'Test'
            }
        ]
    };
    
    const e = {
        postData: {
            contents: JSON.stringify(testData)
        }
    };
    
    const result = doPost(e);
    Logger.log(result.getContent());
}

/**
 * EJEMPLO DE ESTRUCTURA DE DATOS RECIBIDA:
 * 
 * {
 *   "evento": "daimiel",
 *   "personas": [
 *     {
 *       "nombre_apellidos": "Juan Pérez García",
 *       "prefijo": "+34",
 *       "telefono": "612345678",
 *       "alergias": "Gluten, lactosa",
 *       "es_principal": true,
 *       "consentimiento": "Sí",
 *       "origen_url": "https://ejemplo.com",
 *       "user_agent": "Mozilla/5.0..."
 *     },
 *     {
 *       "nombre_apellidos": "Ana García López",
 *       "prefijo": "+34",
 *       "telefono": "623456789",
 *       "alergias": "",
 *       "es_principal": false,
 *       "consentimiento": "Sí",
 *       "origen_url": "https://ejemplo.com",
 *       "user_agent": "Mozilla/5.0..."
 *     }
 *   ]
 * }
 * 
 * RESULTADO EN GOOGLE SHEETS (2 filas):
 * 
 * | TIMESTAMP | EVENTO | NOMBRE APELLIDOS | PREFIJO | TELEFONO | ALERGIAS | ES PRINCIPAL | CONSENTIMIENTO | ORIGEN URL | USER AGENT |
 * |-----------|---------|------------------|---------|----------|----------|--------------|----------------|------------|------------|
 * | 2026-01-15T10:30:00.000Z | daimiel | Juan Pérez García | +34 | 612345678 | Gluten, lactosa | Sí | Sí | https://... | Mozilla... |
 * | 2026-01-15T10:30:00.000Z | daimiel | Ana García López | +34 | 623456789 | | No | Sí | https://... | Mozilla... |
 */
