// Archivo: app.js

// Importa los módulos necesarios desde Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// CONFIGURACIÓN DE FIREBASE:
// En producción, estos valores deben vivir en variables de entorno o en tu sistema seguro.
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicializa la app y la base de datos
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/**
 * Guarda un pedido en Firebase Realtime Database.
 * orderData debe tener: mesa, pedido, precio, notas (opcional).
 * Si no trae fecha, se añade el timestamp del servidor.
 */
export async function guardarPedido(orderData) {
  // Validar que los datos esenciales estén presentes
  if (!orderData.mesa || !orderData.pedido || orderData.precio === undefined) {
    console.error("Error: Faltan datos obligatorios en el pedido");
    throw new Error("El pedido debe contener mesa, pedido y precio");
  }

  // Si no viene con fecha, usar serverTimestamp
  if (!orderData.fecha) {
    orderData.fecha = serverTimestamp();
  }

  // Añadir estado por defecto al pedido
  if (!orderData.estado) {
    orderData.estado = "pendiente";
  }

  // Referencia a la colección de pedidos
  const pedidosRef = ref(db, 'pedidos');
  
  try {
    // Intentar guardar en Firebase
    const newRef = await push(pedidosRef, orderData);
    console.log("Pedido guardado en Firebase con key:", newRef.key);
    return { 
      success: true, 
      key: newRef.key,
      message: "Pedido guardado correctamente" 
    };
  } catch (err) {
    console.error("Error al guardar en Firebase:", err);
    throw err;
  }
}

// Exportar configuración e instancia para posibles usos adicionales
export { firebaseConfig, db };
