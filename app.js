const producto = {
  id: 1,
  nombre: "Nike Air Max Excee White",
  precio: 1999.00,
  impuestos: 0.16, // 16% IVA
  envio: 150.00,
  imagen: "img/tenis-nike-air-max-excee-white-is-CD4165-100-1.png"
};

// Carrito de compras (array de productos)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

function agregarAlCarrito(producto, talla, cantidad = 1) {
  // Buscar si ya existe el producto con la misma talla
  const index = carrito.findIndex(item => item.id === producto.id && item.talla === talla);
  if (index > -1) {
    carrito[index].cantidad += cantidad;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      impuestos: producto.impuestos,
      envio: producto.envio,
      imagen: producto.imagen,
      talla: talla,
      cantidad: cantidad
    });
  }
  guardarCarrito();
  renderCarrito();
  actualizarContadorCarrito();
}

function eliminarDelCarrito(index) {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: '¿Estás seguro de que deseas eliminar este producto del carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito.splice(index, 1);
      guardarCarrito();
      // No mostrar otro modal, solo actualizar el carrito
      renderCarrito();
      actualizarContadorCarrito();
    }
  });
}

function finalizarCompra() {
  if (carrito.length === 0) return;
  let resumen = '<ul style="text-align:left">';
  let total = 0;
  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    resumen += `<li>${item.nombre} (Talla: ${item.talla}) x${item.cantidad} - ${formatearMoneda(subtotal)}</li>`;
  });
  resumen += `</ul><b>Total: ${formatearMoneda(total)}</b>`;
  Swal.fire({
    title: 'Resumen de compra',
    html: resumen,
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Confirmar compra',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      renderCarrito();
      actualizarContadorCarrito();
      Swal.fire('¡Compra realizada!', 'Gracias por tu compra. Recibirás un correo con los detalles.', 'success');
    }
  });
}

// Función para formatear moneda
function formatearMoneda(valor) {
  return valor.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

// Obtener talla seleccionada
function obtenerTallaSeleccionada() {
  const btns = document.querySelectorAll('.tallas .btn');
  for (const btn of btns) {
    if (btn.classList.contains('active')) {
      return btn.textContent.trim();
    }
  }
  return null;
}

// Evento para el botón "Añadir a carrito" y selección de talla
function habilitarBotonCarrito() {
  const ctaBtn = document.querySelector('.cta-principal a, .cta-principal button, .cta-principal div');
  if (ctaBtn) {
    ctaBtn.classList.add('disabled');
    ctaBtn.setAttribute('aria-disabled', 'true');
    ctaBtn.style.pointerEvents = 'none';
  }
  const tallaBtns = document.querySelectorAll('.tallas .btn');
  tallaBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Desactivar todas las tallas
      tallaBtns.forEach(b => b.classList.remove('active'));
      // Activar solo la seleccionada
      this.classList.add('active');
      // Habilitar el botón de carrito
      if (ctaBtn) {
        ctaBtn.classList.remove('disabled');
        ctaBtn.removeAttribute('aria-disabled');
        ctaBtn.style.pointerEvents = 'auto';
      }
    });
  });
}

function cambiarCantidad(index, nuevaCantidad) {
  if (nuevaCantidad < 1) return;
  carrito[index].cantidad = nuevaCantidad;
  guardarCarrito();
  actualizarTotalesCarrito();
  actualizarContadorCarrito(); // Actualiza el contador al cambiar cantidad
}

function actualizarTotalesCarrito() {
  let total = 0;
  let envioTotal = 0;
  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    envioTotal += item.envio;
    // Actualiza el subtotal en la fila
    const fila = document.querySelectorAll('.carrito-cantidad')[i].closest('tr');
    fila.querySelector('.carrito-subtotal').innerHTML = `<b>${formatearMoneda(subtotal)}</b>`;
  });
  // Actualiza el costo de envío y total
  const envioDiv = document.querySelector('.carrito-envio');
  if (envioDiv) envioDiv.innerHTML = `Costo de envío: <b>${formatearMoneda(envioTotal)}</b>`;
  const totalDiv = document.querySelector('.carrito-total');
  if (totalDiv) totalDiv.innerHTML = `Total: <b>${formatearMoneda(total + envioTotal)}</b>`;
}

function renderCarrito() {
  if (carrito.length === 0) {
    Swal.fire({
      title: 'Carrito',
      html: '<div class="carrito-vacio">El carrito está vacío</div>',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      width: '700px',
      customClass: {
        popup: 'swal2-carrito-modal'
      }
    });
    return;
  }
  let html = `<div style="overflow-x:auto"><table style="width:100%;border-collapse:separate;border-spacing:0 12px;"><thead><tr><th style='text-align:left;'>Producto</th><th></th></tr></thead><tbody>`;
  let total = 0;
  let envioTotal = 0;
  carrito.forEach((item, i) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    envioTotal += item.envio;
    // Usar ruta absoluta desde la raíz del sitio para la imagen
    const imagenSrc = `/img/tenis-nike-air-max-excee-white-is-CD4165-100-1.png`;
    html += `<tr>
      <td style="width:60%;padding:12px 0;vertical-align:middle;">
        <div style="display:flex;align-items:center;">
          <img src="${imagenSrc}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:8px;box-shadow:0 2px 8px #ccc;">
          <div style='margin-left:18px;display:flex;flex-direction:column;'>
            <span style='font-weight:600;font-size:1.1em;'>${item.nombre}</span>
            <span style='color:#555;font-size:0.95em;text-align:left;'>Talla: ${item.talla}</span>
            <button data-index="${i}" class="carrito-eliminar" style="margin-top:12px;background:#e74c3c;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;width:fit-content;">Eliminar</button>
          </div>
          <input type="number" min="1" value="${item.cantidad}" data-index="${i}" class="carrito-cantidad" style="width:60px;margin-left:32px;margin-right:32px;text-align:center;">
        </div>
      </td>
      <td style="width:40%;padding:12px 0;vertical-align:middle;text-align:right;">
        <div style='display:flex;flex-direction:column;align-items:flex-end;'>
          <div style='font-size:1em;'>Precio: <b>${formatearMoneda(item.precio)}</b></div>
          <div class="carrito-subtotal" style='font-size:1em;'>Subtotal: <b>${formatearMoneda(subtotal)}</b></div>
        </div>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div><div class="carrito-envio" style="margin:24px 0;text-align:right;font-size:1.1em;">Costo de envío: <b>${formatearMoneda(envioTotal)}</b></div><div class="carrito-total" style="text-align:right;font-size:1.15em;">Total: <b>${formatearMoneda(total + envioTotal)}</b></div><div style="display:flex;gap:16px;margin-top:24px;"><button id="continuar-comprando" style="background:#3498db;color:#fff;border:none;padding:10px 24px;border-radius:4px;cursor:pointer;font-size:1em;flex:1;">Continuar comprando</button><button id="finalizar-compra" style="background:#27ae60;color:#fff;border:none;padding:10px 24px;border-radius:4px;cursor:pointer;font-size:1em;flex:1;">Finalizar compra</button></div>`;
  Swal.fire({
    title: 'Carrito de compras',
    html: html,
    showConfirmButton: false,
    showCloseButton: true,
    width: '950px',
    customClass: {
      popup: 'swal2-carrito-modal'
    },
    didOpen: () => {
      // Eventos para eliminar y cambiar cantidad
      document.querySelectorAll('.carrito-eliminar').forEach(btn => {
        btn.onclick = e => eliminarDelCarrito(Number(btn.dataset.index));
      });
      document.querySelectorAll('.carrito-cantidad').forEach(input => {
        input.oninput = e => cambiarCantidad(Number(input.dataset.index), Number(input.value));
      });
      document.getElementById('finalizar-compra').onclick = finalizarCompra;
      document.getElementById('continuar-comprando').onclick = () => Swal.close();
    }
  });
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const count = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
  const countSpan = document.querySelector('.btn-carrito-header .cart-count');
  if (countSpan) {
    if (count > 0) {
      countSpan.textContent = count;
      countSpan.style.display = 'flex';
    } else {
      countSpan.style.display = 'none';
    }
  }
}

// Llama al cargar la página
actualizarContadorCarrito();

document.addEventListener('DOMContentLoaded', () => {
  habilitarBotonCarrito();
  const cta = document.querySelector('.cta-principal a, .cta-principal button, .cta-principal div');
  if (cta) {
    cta.addEventListener('click', (e) => {
      e.preventDefault();
      const talla = obtenerTallaSeleccionada();
      if (!talla) return;
      agregarAlCarrito(producto, talla, 1);
    });
  }
  const btnCarrito = document.querySelector('.btn-carrito-header');
  if (btnCarrito) {
    btnCarrito.addEventListener('click', function(e) {
      e.preventDefault();
      if (typeof renderCarrito === 'function') {
        renderCarrito();
      }
    });
  }
});
