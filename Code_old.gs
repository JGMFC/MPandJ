/**
 * Google Apps Script - Backend para guardar respuestas del formulario RSVP
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
 *    - Reemplázalo en la línea 27 (SHEET_ID)
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
 *    - Copia la URL que te da (algo como: https://script.google.com/macros/s/ABC.../exec)
 * 
 * 5. Pegar la URL en el front-end:
 *    - Abre script.js
 *    - Busca CONFIG.ENDPOINT_URL
 *    - Reemplaza 'TU_URL_DE_APPS_SCRIPT_AQUI' con la URL copiada
 * 
 * 6. Probar:
 *    - Abre tu web y envía el formulario
 *    - Verifica que aparezca una fila nueva en la Sheet
 */

// ============================================
// CONFIGURACIÓN
// ============================================

// Reemplaza con el ID de tu Google Sheet
const SHEET_ID = 'TU_SHEET_ID_AQUI';
const SHEET_NAME = 'Respuestas';

// Columnas de la hoja
const COLUMNS = [
    'timestamp',
    'evento',
    'nombre_apellidos',
    'num_acompanantes',
    'acompanantes',
    'acompanantes_json',
    'prefijo',
    'telefono',
    'alergias',
    'bus_tramos',
    'consentimiento',
    'origen_url',
    'user_agent'
];

// ============================================
// FUNCIÓN PRINCIPAL - POST
// ============================================

function doPost(e) {
    try {
        // Parsear datos JSON
        const data = JSON.parse(e.postData.contents);
        
        // Validaciones básicas
        if (!data.nombre_apellidos || !data.telefono || !data.consentimiento) {
            return createResponse(false, 'Faltan campos obligatorios');
        }
        
        // Anti-spam: honeypot (verificar en cliente)
        // Rate limiting básico (por IP - limitado en Apps Script)
        
        // Abrir o crear hoja
        const sheet = getOrCreateSheet();
        
        // Si no existen headers, crearlos
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(COLUMNS.map(col => col.toUpperCase().replace(/_/g, ' ')));
            sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold')
                .setBackground('#E75829')
                .setFontColor('#FFFFFF');
        }
        
        // Preparar fila
        const row = COLUMNS.map(col => data[col] || '');
        
        // Agregar fila a la hoja
        sheet.appendRow(row);
        
        // Formatear última fila
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow, 1, 1, COLUMNS.length)
            .setBorder(true, true, true, true, false, false, '#E0E0E0', SpreadsheetApp.BorderStyle.SOLID);
        
        // Autoajustar columnas
        sheet.autoResizeColumns(1, COLUMNS.length);
        
        // Log exitoso
        console.log('Confirmación guardada:', data.nombre_apellidos);
        
        return createResponse(true, 'Confirmación recibida correctamente');
        
    } catch (error) {
        console.error('Error en doPost:', error);
        return createResponse(false, 'Error al procesar la solicitud: ' + error.message);
    }
}

// ============================================
// FUNCIÓN PRINCIPAL - GET (Opcional, para testing)
// ============================================

function doGet(e) {
    return ContentService.createTextOutput(
        JSON.stringify({
            status: 'online',
            message: 'Servidor RSVP para boda María Phia & Javier',
            timestamp: new Date().toISOString()
        })
    ).setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Obtiene o crea la hoja de respuestas
 */
function getOrCreateSheet() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
        sheet = ss.insertSheet(SHEET_NAME);
        
        // Configurar hoja
        sheet.setFrozenRows(1);
        sheet.setColumnWidths(1, COLUMNS.length, 150);
    }
    
    return sheet;
}

/**
 * Crea una respuesta JSON con CORS
 */
function createResponse(success, message, data = {}) {
    const output = {
        ok: success,
        message: message,
        timestamp: new Date().toISOString(),
        ...data
    };
    
    return ContentService
        .createTextOutput(JSON.stringify(output))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Manejo de preflight requests (CORS)
 */
function doOptions(e) {
    return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type')
        .setHeader('Access-Control-Max-Age', '86400');
}

// ============================================
// FUNCIONES ADICIONALES (OPCIONAL)
// ============================================

/**
 * Enviar email de notificación cuando llega una confirmación
 * Descomenta y configura si quieres recibir emails
 */
/*
function sendNotificationEmail(data) {
    const recipient = 'tu-email@example.com';
    const subject = '🎉 Nueva confirmación de boda: ' + data.nombre_apellidos;
    const body = `
Nueva confirmación recibida:

Nombre: ${data.nombre_apellidos}
Eventos: ${data.eventos}
Teléfono: ${data.prefijo} ${data.telefono}
Acompañantes: ${data.num_acompanantes}
${data.nombres_acompanantes ? 'Nombres: ' + data.nombres_acompanantes : ''}
${data.alergias ? 'Alergias: ' + data.alergias : ''}
${data.bus_tramos ? 'Bus: ' + data.bus_tramos : ''}

Fecha: ${new Date().toLocaleString('es-ES')}
    `;
    
    MailApp.sendEmail(recipient, subject, body);
}
*/

/**
 * Generar estadísticas básicas
 * Puedes ejecutar esta función manualmente desde el editor
 */
function generateStats() {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
        console.log('No hay datos todavía');
        return;
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Índices de columnas
    const eventosIdx = headers.indexOf('EVENTOS');
    const acompanantesIdx = headers.indexOf('NUM ACOMPANANTES');
    
    // Contadores
    let daimielCount = 0;
    let arequipaCount = 0;
    let ambosCount = 0;
    let totalPersonas = 0;
    
    rows.forEach(row => {
        const eventos = row[eventosIdx] || '';
        const acompanantes = parseInt(row[acompanantesIdx]) || 0;
        
        if (eventos.includes('daimiel') && eventos.includes('arequipa')) {
            ambosCount++;
        } else if (eventos.includes('daimiel')) {
            daimielCount++;
        } else if (eventos.includes('arequipa')) {
            arequipaCount++;
        }
        
        totalPersonas += 1 + acompanantes;
    });
    
    console.log('=== ESTADÍSTICAS ===');
    console.log('Total confirmaciones:', rows.length);
    console.log('Solo Daimiel:', daimielCount);
    console.log('Solo Arequipa:', arequipaCount);
    console.log('Ambos eventos:', ambosCount);
    console.log('Total personas (incluyendo acompañantes):', totalPersonas);
    console.log('==================');
    
    return {
        totalConfirmaciones: rows.length,
        daimiel: daimielCount,
        arequipa: arequipaCount,
        ambos: ambosCount,
        totalPersonas: totalPersonas
    };
}

/**
 * Crear una hoja de resumen con estadísticas
 * Ejecutar manualmente cuando quieras actualizar stats
 */
function createSummarySheet() {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let summarySheet = ss.getSheetByName('Resumen');
    
    if (!summarySheet) {
        summarySheet = ss.insertSheet('Resumen');
    } else {
        summarySheet.clear();
    }
    
    const stats = generateStats();
    
    summarySheet.getRange('A1').setValue('RESUMEN DE CONFIRMACIONES');
    summarySheet.getRange('A1').setFontSize(16).setFontWeight('bold');
    
    summarySheet.getRange('A3').setValue('Métrica');
    summarySheet.getRange('B3').setValue('Valor');
    summarySheet.getRange('A3:B3').setFontWeight('bold').setBackground('#E75829').setFontColor('#FFFFFF');
    
    const metrics = [
        ['Total confirmaciones', stats.totalConfirmaciones],
        ['Solo Daimiel', stats.daimiel],
        ['Solo Arequipa', stats.arequipa],
        ['Ambos eventos', stats.ambos],
        ['Total personas', stats.totalPersonas],
        ['Última actualización', new Date().toLocaleString('es-ES')]
    ];
    
    summarySheet.getRange(4, 1, metrics.length, 2).setValues(metrics);
    summarySheet.autoResizeColumns(1, 2);
    
    console.log('Hoja de resumen creada/actualizada');
}

/**
 * Exportar datos como CSV
 */
function exportToCSV() {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    const csv = data.map(row => 
        row.map(cell => 
            '"' + String(cell).replace(/"/g, '""') + '"'
        ).join(',')
    ).join('\n');
    
    const blob = Utilities.newBlob(csv, 'text/csv', 'confirmaciones-boda.csv');
    
    // Guardar en Google Drive
    DriveApp.createFile(blob);
    
    console.log('CSV exportado a Google Drive');
}