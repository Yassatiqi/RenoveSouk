// Fichier: frontend/js/script.js
// Version: 1.7 - Cart logic moved to header component

// ==============================================================================
// --- CONSTANTES ET CONFIGURATION ---
// ==============================================================================
const API_BASE_URL = "http://localhost:5001"; // CORRECTION: Port 5001

// ==============================================================================
// --- FONCTIONS DE GÉNÉRATION HTML ---
// ==============================================================================
function createProductCard(product) {
	const imageUrl = product.image_url?.startsWith("/static/")
		? `${API_BASE_URL}${product.image_url}`
		: product.image_url || "./assets/images/placeholder.jpg";
	const placeholderImage = "./assets/images/placeholder.jpg";

	let priceHTML = `<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span>`;
	if (product.is_on_sale && product.original_price) {
		priceHTML = `<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span> <span class="original-price text-muted text-decoration-line-through ms-2">${product.original_price.toFixed(2)} MAD</span>`;
	}

	const badges = [];
	if (product.is_on_sale)
		badges.push(
			'<span class="badge bg-danger position-absolute top-0 end-0 m-2">Promo</span>',
		);
	if (product.is_new)
		badges.push(
			'<span class="badge bg-info position-absolute top-0 start-0 m-2">Nouveau</span>',
		);

	return `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
            <div class="product-card card h-100">
                <div class="product-image position-relative">
                    <img src="${imageUrl}" class="card-img-top" alt="${product.name}" onerror="this.src='${placeholderImage}';">
                    ${badges.join("")}
                    <div class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                        <!-- CORRECTION: Chemin absolu pour le lien -->
                        <a href="/pages/produit.html?id=${product.id}" class="btn btn-primary btn-sm me-2" title="Voir le détail"><i class="fas fa-eye"></i></a>
                        <button class="btn btn-success btn-sm add-to-cart-btn" data-product-id="${product.id}" title="Ajouter au panier"><i class="fas fa-shopping-cart"></i></button>
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${product.name}</h6>
                    <div class="price-section mt-auto pt-2">${priceHTML}</div>
                </div>
            </div>
        </div>`;
}

// ==============================================================================
// --- LOGIQUE D'AFFICHAGE DYNAMIQUE ---
// ==============================================================================
async function loadAndDisplayProducts(endpoint, containerId) {
	const container = document.getElementById(containerId);
	if (!container) return;

	container.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary"></div></div>`;

	try {
		const response = await fetch(`${API_BASE_URL}/api/products/${endpoint}`);
		if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
		const products = await response.json();

		container.innerHTML = "";
		if (products.length === 0) {
			container.innerHTML =
				'<div class="col-12"><p class="text-center text-muted py-5">Aucun produit à afficher.</p></div>';
		} else {
			products.forEach((product) => {
				container.innerHTML += createProductCard(product);
			});
		}
	} catch (error) {
		console.error(`Erreur chargement ${endpoint}:`, error);
		container.innerHTML =
			'<div class="col-12"><p class="text-center text-danger py-5">Erreur de chargement des produits.</p></div>';
	}
}

// ==============================================================================
// --- INITIALISATION DES COMPOSANTS ET ÉVÉNEMENTS ---
// ==============================================================================
document.addEventListener("DOMContentLoaded", () => {
	// Wait for header component to be loaded before accessing cart
	document.addEventListener("component-loaded-header", () => {
		console.log("Header component loaded, cart is now available");
	});

	// Délégation d'événements pour les boutons "Ajouter au panier"
	document.body.addEventListener("click", (event) => {
		const addToCartButton = event.target.closest(".add-to-cart-btn");
		if (addToCartButton) {
			event.preventDefault();
			const productId = parseInt(addToCartButton.dataset.productId);
			if (productId && window.cart) {
				window.cart.addItem(productId);
			}
		}
	});

	// CORRECTION: Logique pour les onglets de la page d'accueil
	const productTabsContainer = document.getElementById("productTabs");
	if (productTabsContainer) {
		// Charger les produits de l'onglet actif par défaut ("En vedette")
		loadAndDisplayProducts("featured", "featured-products-container");

		// Écouter l'événement standard de Bootstrap pour les onglets
		const tabButtons = productTabsContainer.querySelectorAll(
			'button[data-bs-toggle="pill"]',
		);
		tabButtons.forEach((button) => {
			button.addEventListener("shown.bs.tab", (event) => {
				const targetId = event.target.dataset.bsTarget.substring(1); // ex: 'new' ou 'sale'
				const containerId = `${targetId}-products-container`;
				loadAndDisplayProducts(targetId, containerId);
			});
		});
	}
});
