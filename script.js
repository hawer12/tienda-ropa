// ✅ CONFIGURACIÓN DE LA API
const API_URL = "http://localhost:4000/api/productos";

// Variables globales
let productos = []; // Ahora se carga desde la API
let carrito = [];
let categoriaActual = null;

// ✅ CARGAR PRODUCTOS DESDE LA API
async function cargarProductos() {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }
    
    const data = await response.json();
    
    // Filtrar solo productos activos
    productos = data.filter(p => p.activo === true);
    
    console.log(`✅ ${productos.length} productos cargados desde la API`);
    
    // Mostrar catálogo después de cargar
    mostrarCatalogo();
    
  } catch (error) {
    console.error("Error cargando productos:", error);
    
    // Mostrar mensaje de error en el catálogo
    const catalogo = document.getElementById("catalogo");
    catalogo.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #f59e0b; margin-bottom: 20px;"></i>
        <h3 style="color: #333; margin-bottom: 10px;">No se pudieron cargar los productos</h3>
        <p style="color: #666; margin-bottom: 20px;">Verifica que el servidor esté corriendo en http://localhost:4000</p>
        <button onclick="cargarProductos()" style="padding: 12px 24px; background: #b805f9; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-redo"></i> Reintentar
        </button>
      </div>
    `;
  }
}

// Función para mostrar el catálogo con filtro opcional
function mostrarCatalogo(filtro = null) {
  const catalogo = document.getElementById("catalogo");
  const sinProductos = document.getElementById("sin-productos");
  const tituloCategoria = document.getElementById("titulo-categoria");
  const productosCount = document.getElementById("productos-count");
  
  catalogo.innerHTML = "";
  categoriaActual = filtro;

  const filtrados = filtro ? productos.filter(p => p.categoria === filtro) : productos;

  // Actualizar título de categoría
  if (filtro === 'mujer') {
    tituloCategoria.textContent = "👩 Ropa para Mujer";
  } else if (filtro === 'hombre') {
    tituloCategoria.textContent = "👨 Ropa para Hombre";
  } else if (filtro === 'unisex') {
    tituloCategoria.textContent = "👫 Ropa Unisex";
  } else {
    tituloCategoria.textContent = "🛍️ Todos los Productos";
  }

  productosCount.textContent = `${filtrados.length} producto${filtrados.length !== 1 ? 's' : ''} disponible${filtrados.length !== 1 ? 's' : ''}`;

  if (filtrados.length === 0) {
    catalogo.classList.add('oculto');
    sinProductos.classList.remove('oculto');
    return;
  }

  catalogo.classList.remove('oculto');
  sinProductos.classList.add('oculto');

  filtrados.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    // ✅ Manejar la URL de la imagen correctamente
    const imagenURL = p.imagen && p.imagen.startsWith("/uploads/")
      ? `http://localhost:4000${p.imagen}`
      : (p.imagen || "img/placeholder.jpg");

    card.innerHTML = `
      <img src="${imagenURL}" alt="${p.nombre}" onerror="this.src='img/placeholder.jpg'">
      <h3>${p.nombre}</h3>
      <p class="precio">$${p.precio.toLocaleString('es-CO')}</p>
      ${p.stock > 0 
        ? `<span class="stock-badge">✓ Disponible</span>` 
        : `<span class="stock-badge agotado">Agotado</span>`
      }
      <button onclick="agregarAlCarrito('${p._id}')" ${p.stock <= 0 ? 'disabled' : ''}>
        <i class="fas fa-cart-plus"></i>
        ${p.stock > 0 ? 'Agregar' : 'Sin stock'}
      </button>
    `;
    catalogo.appendChild(card);
  });

  // Animación de entrada
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

// Función para agregar productos al carrito
function agregarAlCarrito(id) {
  const producto = productos.find(p => p._id === id);
  
  if (!producto) {
    mostrarNotificacion('❌ Producto no encontrado');
    return;
  }
  
  if (producto.stock <= 0) {
    mostrarNotificacion('❌ Producto sin stock');
    return;
  }
  
  // ✅ Usar las tallas del producto o valores por defecto
  const tallasDisponibles = producto.tallas && producto.tallas.length > 0 
    ? producto.tallas 
    : ["S", "M", "L", "XL"];
  
  const coloresDisponibles = producto.colores && producto.colores.length > 0
    ? producto.colores
    : ["Estándar"];
  
  carrito.push({
    ...producto,
    talla: tallasDisponibles[0], // Primera talla disponible
    color: coloresDisponibles[0], // Primer color disponible
    tallasDisponibles,
    coloresDisponibles,
    carritoId: Date.now() + Math.random() // ID único para cada item del carrito
  });

  actualizarContadorCarrito();
  mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

// Función para actualizar el contador del carrito
function actualizarContadorCarrito() {
  const badge = document.getElementById('carrito-count');
  badge.textContent = carrito.length;
  
  if (carrito.length > 0) {
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// Función para ver el carrito
function verCarrito() {
  const modal = document.getElementById("carrito");
  const contenedor = document.getElementById("items-carrito");
  const totalTexto = document.getElementById("total-carrito");
  const carritoVacio = document.getElementById("carrito-vacio");

  modal.classList.remove("oculto");
  document.body.style.overflow = 'hidden';
  
  contenedor.innerHTML = "";

  if (carrito.length === 0) {
    carritoVacio.classList.remove('oculto');
    contenedor.classList.add('oculto');
    totalTexto.textContent = "$0";
    return;
  }

  carritoVacio.classList.add('oculto');
  contenedor.classList.remove('oculto');

  let total = 0;

  carrito.forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "item-carrito";
    
    const imagenURL = p.imagen && p.imagen.startsWith("/uploads/")
      ? `http://localhost:4000${p.imagen}`
      : (p.imagen || "img/placeholder.jpg");

    // ✅ Generar opciones dinámicas de tallas y colores
    const opcionesTallas = p.tallasDisponibles.map(t => 
      `<option value="${t}"${p.talla === t ? " selected" : ""}>${t}</option>`
    ).join('');
    
    const opcionesColores = p.coloresDisponibles.map(c => 
      `<option value="${c}"${p.color === c ? " selected" : ""}>${c}</option>`
    ).join('');

    item.innerHTML = `
      <img src="${imagenURL}" alt="${p.nombre}" class="item-imagen" onerror="this.src='img/placeholder.jpg'">
      <div class="item-info">
        <div class="item-nombre">${p.nombre}</div>
        <div class="item-precio">$${p.precio.toLocaleString('es-CO')}</div>
        <div class="item-opciones">
          <select onchange="actualizarTalla(${index}, this.value)">
            ${opcionesTallas}
          </select>
          <select onchange="actualizarColor(${index}, this.value)">
            ${opcionesColores}
          </select>
          <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    contenedor.appendChild(item);
    total += p.precio;
  });

  totalTexto.textContent = `$${total.toLocaleString('es-CO')}`;
}

// Función para actualizar talla
function actualizarTalla(index, talla) {
  carrito[index].talla = talla;
  mostrarNotificacion(`Talla actualizada a ${talla}`);
}

// Función para actualizar color
function actualizarColor(index, color) {
  carrito[index].color = color;
  mostrarNotificacion(`Color actualizado a ${color}`);
}

// Función para eliminar del carrito
function eliminarDelCarrito(index) {
  const producto = carrito[index];
  carrito.splice(index, 1);
  actualizarContadorCarrito();
  verCarrito();
  mostrarNotificacion(`❌ ${producto.nombre} eliminado del carrito`);
}

// Función para vaciar el carrito
function vaciarCarrito() {
  if (carrito.length === 0) return;
  
  if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
    carrito = [];
    actualizarContadorCarrito();
    verCarrito();
    mostrarNotificacion('🗑️ Carrito vaciado');
  }
}

// Función para cerrar el carrito
function cerrarCarrito() {
  document.getElementById("carrito").classList.add("oculto");
  document.body.style.overflow = 'auto';
}

// Función para finalizar compra
function finalizarCompra() {
  if (carrito.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  let mensaje = "¡Hola! 👋 Quiero realizar el siguiente pedido:\n\n";
  let total = 0;

  carrito.forEach((p, index) => {
    mensaje += `${index + 1}. ${p.nombre}\n`;
    mensaje += `   💰 Precio: $${p.precio.toLocaleString('es-CO')}\n`;
    mensaje += `   📏 Talla: ${p.talla}\n`;
    mensaje += `   🎨 Color: ${p.color}\n\n`;
    total += p.precio;
  });

  mensaje += `━━━━━━━━━━━━━━━━\n`;
  mensaje += `💵 TOTAL: $${total.toLocaleString('es-CO')}\n\n`;
  mensaje += `¿Podrían confirmar disponibilidad y método de envío? ¡Gracias! 😊`;

  const url = `https://wa.me/573015198613?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");

  // Limpiar carrito después de enviar
  carrito = [];
  actualizarContadorCarrito();
  cerrarCarrito();
  mostrarNotificacion('✅ Pedido enviado por WhatsApp');
}

// Función para filtrar productos
function filtrar(categoria) {
  mostrarCatalogo(categoria);
  
  // Scroll suave al catálogo
  const catalogo = document.getElementById('catalogo');
  catalogo.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
  const notif = document.createElement('div');
  notif.textContent = mensaje;
  notif.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #b805f9, #e91e63);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 600;
  `;

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// Agregar estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  .stock-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #10b981;
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin: 8px 0;
  }
  
  .stock-badge.agotado {
    background: #ef4444;
  }
  
  .card button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
document.head.appendChild(style);

// ✅ INICIALIZAR AL CARGAR LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
  // Cargar productos desde la API
  cargarProductos();
  
  actualizarContadorCarrito();
  
  // Cerrar carrito con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cerrarCarrito();
    }
  });
});