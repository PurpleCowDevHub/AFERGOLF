/**
 * CATALOGO AFERGOLF - Carga dinámica desde backend
 */

const API_URL = "http://localhost/AFERGOLF/back/modules/products/api/admin_products.php";

document.addEventListener("DOMContentLoaded", () => {
    loadCatalogProducts();

    document.getElementById("tipo").addEventListener("change", loadCatalogProducts);
    document.getElementById("marca").addEventListener("change", loadCatalogProducts);
});


async function loadCatalogProducts() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!data.success || !data.productos.length) {
            renderEmptyState();
            return;
        }

        const productos = filterProducts(data.productos);
        renderProducts(productos);

    } catch (error) {
        console.error("Error cargando catálogo:", error);
        renderEmptyState();
    }
}

function filterProducts(productos) {
    const tipo = document.getElementById("tipo").value;
    const marca = document.getElementById("marca").value;

    return productos.filter(p => {
        const matchTipo = tipo === "" || p.categoria === tipo;
        const matchMarca = marca === "" || p.marca === marca;
        return matchTipo && matchMarca;
    });
}

function renderProducts(productos) {
    const container = document.getElementById("catalogo-productos");
    container.innerHTML = "";

    if (productos.length === 0) {
        renderEmptyState();
        return;
    }

    productos.forEach(p => {
        const article = document.createElement("article");
        article.className = "catalogo-producto";

        article.innerHTML = `
            <img src="${p.imagen_principal || '../assets/img/placeholder-product.jpg'}" 
                 alt="${p.nombre}" loading="lazy">

            <h3>${p.nombre}</h3>
            <p class="catalogo-precio">${formatPrice(p.precio)}</p>

            ${renderTallas(p)}
        `;

        container.appendChild(article);
    });
}

function renderTallas(producto) {
    if (producto.categoria !== "guantes") return "";

    return `
        <div class="catalogo-tallas">
            ${producto.stock_talla_s > 0 ? "<button>S</button>" : ""}
            ${producto.stock_talla_m > 0 ? "<button>M</button>" : ""}
            ${producto.stock_talla_l > 0 ? "<button>L</button>" : ""}
            ${producto.stock_talla_xl > 0 ? "<button>XL</button>" : ""}
            ${producto.stock_talla_xxl > 0 ? "<button>XXL</button>" : ""}
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0
    }).format(price);
}

function renderEmptyState() {
    document.getElementById("catalogo-productos").innerHTML = `
        <p style="padding: 20px; font-size: 1rem;">
            No se encontraron productos para los filtros seleccionados.
        </p>
    `;
}
