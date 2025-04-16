function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  // Se asume que la primera fila son los encabezados y se organizan las columnas:
  // [id, name, description, price, image, category, subcategory, menuOptions]
  const products = data.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    description: row[2],
    price: row[3],
    image: row[4],
    category: row[5],
    subcategory: row[6],
    menuOptions: row[7] || ""
  }));

  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  if (!data.action) throw new Error("Acción no especificada");

  if (data.action === 'delete') {
    // Implementación para eliminar productos
    const id = data.id;
    
    // Buscar la fila con el ID correspondiente
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1; // +1 porque los índices de filas en Sheets comienzan en 1
        break;
      }
    }
    
    if (rowIndex !== -1) {
      sheet.deleteRow(rowIndex);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Producto eliminado correctamente" }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Producto no encontrado" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else if (data.action === 'add') {
    // Implementación para añadir productos
    const newRow = [
      new Date().getTime(), // ID único basado en timestamp
      data.name,
      data.description,
      data.price,
      data.image || "",
      data.category || "",
      data.subcategory || "",
      data.menuOptions || ""
    ];
    
    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Producto añadido correctamente", 
      id: newRow[0] 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (data.action === 'update') {
    // Implementación para actualizar productos
    const id = data.id;
    
    // Buscar la fila con el ID correspondiente
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1; // +1 porque los índices de filas en Sheets comienzan en 1
        break;
      }
    }
    
    if (rowIndex !== -1) {
      // Actualizar la fila
      sheet.getRange(rowIndex, 2).setValue(data.name);
      sheet.getRange(rowIndex, 3).setValue(data.description);
      sheet.getRange(rowIndex, 4).setValue(data.price);
      sheet.getRange(rowIndex, 5).setValue(data.image || "");
      sheet.getRange(rowIndex, 6).setValue(data.category || "");
      sheet.getRange(rowIndex, 7).setValue(data.subcategory || "");
      sheet.getRange(rowIndex, 8).setValue(data.menuOptions || "");
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Producto actualizado correctamente" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Producto no encontrado" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else if (data.action === 'getMenus') {
    // Implementación para obtener menús
    const menuSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Menus");
    if (!menuSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Hoja de menús no encontrada" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const menuData = menuSheet.getDataRange().getValues();
    const menus = menuData.slice(1).map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      price: row[3],
      image: row[4] || "",
      products: row[5] || ""
    }));
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      menus: menus 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (data.action === 'addMenu') {
    // Implementación para añadir menús
    let menuSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Menus");
    if (!menuSheet) {
      // Crear la hoja si no existe
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const newSheet = ss.insertSheet("Menus");
      newSheet.appendRow(["id", "name", "description", "price", "image", "products"]);
      menuSheet = newSheet;
    }
    
    const newRow = [
      new Date().getTime(), // ID único basado en timestamp
      data.name,
      data.description,
      data.price,
      data.image || "",
      JSON.stringify(data.products || [])
    ];
    
    menuSheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Menú añadido correctamente", 
      id: newRow[0] 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (data.action === 'updateMenu') {
    // Implementación para actualizar menús
    const menuSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Menus");
    if (!menuSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Hoja de menús no encontrada" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const id = data.id;
    
    // Buscar la fila con el ID correspondiente
    const dataRange = menuSheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex !== -1) {
      // Mantener los valores existentes si no se proporcionan nuevos
      const existingRow = values[rowIndex - 1];
      
      // Actualizar la fila
      menuSheet.getRange(rowIndex, 2).setValue(data.name || existingRow[1]);
      menuSheet.getRange(rowIndex, 3).setValue(data.description || existingRow[2]);
      menuSheet.getRange(rowIndex, 4).setValue(data.price || existingRow[3]);
      menuSheet.getRange(rowIndex, 5).setValue(data.image || existingRow[4] || "");
      
      // Actualizar productos si se proporcionan
      if (data.products) {
        menuSheet.getRange(rowIndex, 6).setValue(JSON.stringify(data.products));
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Menú actualizado correctamente" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Menú no encontrado" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else if (data.action === 'deleteMenu') {
    // Implementación para eliminar menús
    const menuSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Menus");
    if (!menuSheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Hoja de menús no encontrada" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const id = data.id;
    
    // Buscar la fila con el ID correspondiente
    const dataRange = menuSheet.getDataRange();
    const values = dataRange.getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === id) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex !== -1) {
      menuSheet.deleteRow(rowIndex);
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        message: "Menú eliminado correctamente" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Menú no encontrado" 
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Acción no reconocida: " + data.action 
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
