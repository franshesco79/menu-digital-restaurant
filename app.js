'use strict';

/**
 * ============================================================
 *  Sabores & Co. — Menú Digital
 *  ------------------------------------------------
 *  Sitio 100% estático: HTML + CSS (Tailwind CDN) + JS puro.
 *  Sin build ni dependencias: sube la carpeta tal cual a
 *  Vercel o Netlify y se publica automáticamente.
 * ============================================================
 */

/* ---------- Configuración ---------- */
const NUMERO_WHATSAPP = '5491123456789'; // Número del restaurante (código país + número, sin "+" ni espacios)
const STORAGE_KEY = 'sabores_carrito';   // Clave de localStorage para el carrito

/* ---------- Menú (catálogo de productos) ---------- */
const PRODUCTOS = [
  { id: 1,  categoria: 'entradas', nombre: 'Bruschetta de Tomate',  descripcion: 'Pan artesanal, tomate cherry y albahaca fresca.',   precio: 6.50,  emoji: '🍅' },
  { id: 2,  categoria: 'entradas', nombre: 'Croquetas de Jamón',    descripcion: 'Cremosas, con jamón ibérico y bechamel.',         precio: 7.20,  emoji: '🧀' },
  { id: 3,  categoria: 'platos',   nombre: 'Lomo Saltado',          descripcion: 'Lomo de res, cebolla morada y papas fritas.',     precio: 14.90, emoji: '🥩' },
  { id: 4,  categoria: 'platos',   nombre: 'Risotto de Hongos',     descripcion: 'Arroz cremoso con hongos y parmesano.',          precio: 13.50, emoji: '🍄' },
  { id: 5,  categoria: 'platos',   nombre: 'Pollo a la Brasa',      descripcion: 'Cuarto de pollo, ensalada y papas al romero.',    precio: 12.80, emoji: '🍗' },
  { id: 6,  categoria: 'bebidas',  nombre: 'Limonada Frozen',       descripcion: 'Limonada helada con toque de menta.',            precio: 4.20,  emoji: '🍋' },
  { id: 7,  categoria: 'bebidas',  nombre: 'Café de Especialidad',  descripcion: 'Café peruano de taza, leche de almendras.',       precio: 3.80,  emoji: '☕' },
  { id: 8,  categoria: 'bebidas',  nombre: 'Jugo de Maracuyá',      descripcion: 'Jugo natural bien frío.',                        precio: 4.50,  emoji: '🥭' },
  { id: 9,  categoria: 'postres',  nombre: 'Cheesecake de Frutos',  descripcion: 'Base de galleta y salsa de frutos rojos.',        precio: 6.90,  emoji: '🍰' },
  { id: 10, categoria: 'postres',  nombre: 'Brownie con Helado',    descripcion: 'Brownie caliente con helado de vainilla.',        precio: 5.80,  emoji: '🍫' },
];

const NOMBRES_CATEGORIA = {
  todas: 'Todo el menú',
  entradas: 'Entradas',
  platos: 'Platos Fuertes',
  bebidas: 'Bebidas',
  postres: 'Postres',
};

/* ---------- Estado global ---------- */
const $ = (id) => document.getElementById(id);

let categoriaSeleccionada = 'todas';
let carrito = {};     // { idProducto: cantidad } — estado del carrito
const cargando = {};  // { idProducto: true }     — muestra spinner al añadir
const animarIds = new Set(); // ids que deben animarse en el próximo render

/* ---------- Persistencia (localStorage) ---------- */

// Recupera el carrito guardado validando los datos (solo productos reales y cantidades enteras positivas).
function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    carrito = {};
    for (const [id, cantidad] of Object.entries(guardado)) {
      const pid = Number(id);
      if (Number.isInteger(cantidad) && cantidad > 0 && PRODUCTOS.some((p) => p.id === pid)) {
        carrito[pid] = cantidad;
      }
    }
  } catch {
    carrito = {}; // si el almacenamiento falla, se inicia vacío
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
  } catch {
    /* almacenamiento no disponible (modo incógnito, etc.) */
  }
}

/* ---------- Renderizado dinámico ---------- */

function renderProductos(categoria) {
  const grid = $('grid');
  const productos = categoria === 'todas'
    ? PRODUCTOS
    : PRODUCTOS.filter((p) => p.categoria === categoria);

  $('titulo-categoria').textContent = NOMBRES_CATEGORIA[categoria];
  $('contador').textContent = `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`;

  if (productos.length === 0) {
    grid.innerHTML = '<p class="col-span-full text-center text-stone-500 py-10">No hay productos en esta categoría.</p>';
    return;
  }

  grid.innerHTML = productos.map((p) => {
    const cantidad = carrito[p.id] || 0;
    const enCarrito = cantidad > 0;
    const animar = animarIds.has(p.id) ? ' animar-card' : '';
    const control = enCarrito
      ? `
        <div class="flex items-center gap-2 bg-brand-600 text-white rounded-full px-2 py-1.5 shadow${animar}">
          <button data-accion="restar" data-id="${p.id}" class="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition font-bold text-sm leading-none">−</button>
          <span class="text-sm font-bold min-w-4 text-center">${cantidad}</span>
          <button data-accion="sumar" data-id="${p.id}" class="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition font-bold text-sm leading-none">+</button>
        </div>`
      : `
        <button data-accion="agregar" data-id="${p.id}"
          class="bg-brand-600 hover:bg-brand-700 active:scale-95 transition text-white text-xs font-bold px-4 py-2 rounded-full shadow">
          ${cargando[p.id] ? '<span class="spinner"></span>' : 'Añadir'}
        </button>`;

    return `
      <article class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden flex flex-col${animar}">
        <div class="h-28 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-5xl">${p.emoji}</div>
        <div class="p-3.5 flex flex-col flex-1">
          <h3 class="font-bold text-stone-800 text-sm leading-tight">${p.nombre}</h3>
          <p class="text-xs text-stone-500 mt-1 leading-relaxed flex-1">${p.descripcion}</p>
          <div class="flex items-center justify-between mt-3">
            <span class="font-extrabold text-brand-600">${formatearPrecio(p.precio)}</span>
            ${control}
          </div>
        </div>
      </article>`;
  }).join('');
}

/* ---------- Lógica del carrito ---------- */

// Añade un producto por primera vez con pequeño "estado de carga" (spinner en el botón).
function agregarAlCarrito(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  cargando[id] = true;
  animarIds.add(id);
  actualizarCarrito();
  animarBotonFlotante();
  mostrarToast('Añadido al pedido ✅');

  // El spinner dura 350 ms y luego el botón pasa a los controles +/−
  setTimeout(() => {
    delete cargando[id];
    actualizarCarrito();
  }, 350);
}

function incrementar(id) {
  carrito[id] = (carrito[id] || 0) + 1;
  animarIds.add(id);
  actualizarCarrito();
}

function decrementar(id) {
  carrito[id] = (carrito[id] || 0) - 1;
  if (carrito[id] <= 0) delete carrito[id];
  actualizarCarrito();
}

function eliminarItem(id) {
  delete carrito[id];
  mostrarToast('Producto eliminado 🗑️');
  actualizarCarrito();
}

function totalItems() {
  return Object.values(carrito).reduce((acc, n) => acc + n, 0);
}

function totalPrecio() {
  return Object.entries(carrito).reduce((acc, [id, n]) => {
    const producto = PRODUCTOS.find((p) => p.id === Number(id));
    return acc + (producto ? producto.precio * n : 0);
  }, 0);
}

// Sincroniza TODA la interfaz del carrito (botón flotante, panel, badge, grid).
function actualizarCarrito() {
  const items = totalItems();
  const total = totalPrecio();

  // Botón flotante y badge
  const badge = $('badge-carrito');
  badge.textContent = items;
  if (items > 0) {
    badge.classList.remove('animar-badge');
    void badge.offsetWidth; // reinicia la animación del badge
    badge.classList.add('animar-badge');
  }
  $('total-flotante').textContent = formatearPrecio(total);

  // Panel del carrito
  $('total-panel-items').textContent = `${items} ${items === 1 ? 'producto' : 'productos'}`;
  $('total-panel').textContent = formatearPrecio(total);
  $('btn-whatsapp').classList.toggle('opacity-60', items === 0);

  renderItemsCarrito();
  renderProductos(categoriaSeleccionada);

  animarIds.clear();      // animaciones puntuales, solo una vez por cambio
  guardarCarrito();       // persiste el estado tras cada modificación
}

function renderItemsCarrito() {
  const contenedor = $('items-carrito');
  const entradas = Object.entries(carrito);

  if (entradas.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center py-12 text-stone-400">
        <div class="text-5xl mb-3">🛒</div>
        <p class="text-sm font-medium">Tu carrito está vacío</p>
        <p class="text-xs mt-1">Agrega algo del menú para empezar</p>
      </div>`;
    return;
  }

  contenedor.innerHTML = entradas.map(([id, cantidad]) => {
    const p = PRODUCTOS.find((prod) => prod.id === Number(id));
    const animar = animarIds.has(p.id) ? ' animar-row' : '';
    return `
      <div class="flex items-center gap-3 py-4 border-b border-orange-100 last:border-0${animar}">
        <div class="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-2xl shrink-0">${p.emoji}</div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-sm text-stone-800 truncate">${p.nombre}</p>
          <p class="text-xs text-stone-500">${formatearPrecio(p.precio)} c/u</p>
        </div>
        <div class="flex items-center gap-1.5">
          <button data-accion="restar" data-id="${p.id}" class="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 active:scale-90 transition text-stone-700 font-bold">−</button>
          <span class="text-sm font-bold w-5 text-center">${cantidad}</span>
          <button data-accion="sumar" data-id="${p.id}" class="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 active:scale-90 transition text-stone-700 font-bold">+</button>
          <button data-accion="eliminar" data-id="${p.id}" title="Eliminar"
            class="ml-1 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 active:scale-90 transition text-red-500 text-sm font-bold">✕</button>
        </div>
        <span class="font-extrabold text-brand-600 text-sm w-14 text-right">${formatearPrecio(p.precio * cantidad)}</span>
      </div>`;
  }).join('');
}

/* ---------- Envío por WhatsApp ---------- */

// Toma el carrito + datos del cliente y arma el pedido con formato para WhatsApp.
function enviarPorWhatsApp() {
  const nombre = $('input-nombre').value.trim();
  const mesa = $('input-mesa').value.trim();
  const metodo = document.querySelector('input[name="metodo-pago"]:checked')?.value || 'Efectivo';
  const items = totalItems();

  if (items === 0) {
    mostrarToast('Tu carrito está vacío');
    return;
  }
  if (!nombre) {
    mostrarToast('Ingresa tu nombre 👤');
    $('input-nombre').focus();
    return;
  }
  if (!mesa) {
    mostrarToast('Ingresa tu mesa o dirección 📍');
    $('input-mesa').focus();
    return;
  }

  const lineas = Object.entries(carrito).map(([id, cantidad]) => {
    const p = PRODUCTOS.find((prod) => prod.id === Number(id));
    return `  • ${p.emoji} ${cantidad} x ${p.nombre} — ${formatearPrecio(p.precio * cantidad)}`;
  });

  const mensaje = [
    '🍽️ *NUEVO PEDIDO — Sabores & Co.*',
    '',
    `👤 *Cliente:* ${nombre}`,
    `📍 *Mesa / Dirección:* ${mesa}`,
    `💳 *Método de pago:* ${metodo}`,
    '',
    '──────────────',
    ...lineas,
    '──────────────',
    `🧾 *TOTAL: ${formatearPrecio(totalPrecio()).toUpperCase()}*`,
    '',
    '✅ ¡Gracias por tu pedido!',
  ].join('\n');

  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');

  // Pedido enviado: se limpia carrito, formulario y se cierra el panel.
  carrito = {};
  $('input-nombre').value = '';
  $('input-mesa').value = '';
  document.querySelectorAll('input[name="metodo-pago"]').forEach((r) => { r.checked = r.value === 'Efectivo'; });
  actualizarCarrito();
  abrirCarrito(false);
  mostrarToast('Pedido enviado a WhatsApp 🎉');
}

/* ---------- Utilidades de UI ---------- */

function formatearPrecio(valor) {
  return `${valor.toFixed(2).replace('.', ',')} €`;
}

// Pulso breve en el botón flotante al añadir un producto.
function animarBotonFlotante() {
  const btn = $('btn-carrito');
  btn.classList.remove('animar-btn');
  void btn.offsetWidth;
  btn.classList.add('animar-btn');
}

let toastTimer = null;
function mostrarToast(mensaje) {
  const toast = $('toast');
  toast.textContent = mensaje;
  toast.classList.remove('translate-y-20', 'opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 1800);
}

function abrirCarrito(abrir) {
  const panel = $('panel-carrito');
  panel.querySelector('.backdrop').classList.toggle('opacity-0', !abrir);
  panel.querySelector('.backdrop').classList.toggle('pointer-events-none', !abrir);
  panel.querySelector('.absolute.bottom-0').classList.toggle('translate-y-full', !abrir);
  document.body.style.overflow = abrir ? 'hidden' : ''; // bloquea el scroll de fondo
}

/* ---------- Eventos ---------- */

document.querySelectorAll('.categoria-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    categoriaSeleccionada = btn.dataset.categoria;
    document.querySelectorAll('.categoria-btn').forEach((b) => {
      b.className = 'categoria-btn shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition ' +
        (b === btn
          ? 'bg-brand-600 text-white shadow'
          : 'text-stone-600 hover:bg-orange-100');
    });
    renderProductos(categoriaSeleccionada);
  });
});

// Delegación de eventos sobre el grid (botones Añadir / + / −)
$('grid').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-accion]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.accion === 'agregar') agregarAlCarrito(id);
  if (btn.dataset.accion === 'sumar') incrementar(id);
  if (btn.dataset.accion === 'restar') decrementar(id);
});

// Delegación de eventos sobre la lista del panel (controles + / − / eliminar)
$('items-carrito').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-accion]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.accion === 'sumar') incrementar(id);
  if (btn.dataset.accion === 'restar') decrementar(id);
  if (btn.dataset.accion === 'eliminar') eliminarItem(id);
});

$('btn-carrito').addEventListener('click', () => abrirCarrito(true));
$('cerrar-carrito').addEventListener('click', () => abrirCarrito(false));
$('panel-carrito').addEventListener('click', (e) => {
  if (e.target.classList.contains('backdrop')) abrirCarrito(false);
});

$('btn-whatsapp').addEventListener('click', enviarPorWhatsApp);

/* ---------- Inicialización ---------- */

cargarCarrito();
actualizarCarrito();
renderProductos(categoriaSeleccionada);