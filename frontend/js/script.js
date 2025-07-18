// Fichier: frontend/js/script.js
// Version: 1.6 - Corrigée pour Bootstrap 5 et API sur port 5001

// ==============================================================================
// --- CONSTANTES ET CONFIGURATION ---
// ==============================================================================
const API_BASE_URL = "http://localhost:5001"; // CORRECTION: Port 5001

// ==============================================================================
// --- GESTION DU PANIER (localStorage) ---
// ==============================================================================
const cart = {
	getItems: () => JSON.parse(localStorage.getItem("renovsoukCart")) || [],

	saveItems: (items) => {
		localStorage.setItem("renovsoukCart", JSON.stringify(items));
		// Déclencher un événement personnalisé chaque fois que le panier est sauvegardé
		// Cela permettra à d'autres parties du site (comme la page panier) de réagir.
		document.dispatchEvent(new Event("cartUpdated"));
	},

	addItem: function (productId, quantity = 1) {
		const items = this.getItems();
		const existingItem = items.find((item) => item.id === productId);

		if (existingItem) {
			existingItem.quantity += quantity;
		} else {
			items.push({ id: productId, quantity: quantity });
		}

		this.saveItems(items);
		this.updateDisplay(); // Mettre à jour immédiatement l'affichage
		this.showNotification(`${quantity} produit(s) ajouté(s) au panier !`);
	},

	updateDisplay: async function () {
		const items = this.getItems();
		const cartBadge = document.getElementById("cart-count");
		const cartTotalEl = document.getElementById("cart-total");

		if (!cartBadge || !cartTotalEl) {
			// Si les éléments du header ne sont pas encore chargés, on attend un peu et on réessaie.
			// Cela peut arriver au premier chargement de la page.
			setTimeout(() => this.updateDisplay(), 100);
			return;
		}

		// 1. Mettre à jour le nombre d'articles (INSTANTANÉ)
		const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
		cartBadge.textContent = totalItems;

		// 2. Animer le badge pour un effet visuel
		cartBadge.classList.add("animate__animated", "animate__tada");
		cartBadge.addEventListener(
			"animationend",
			() => {
				cartBadge.classList.remove("animate__animated", "animate__tada");
			},
			{ once: true },
		);

		if (totalItems === 0) {
			cartTotalEl.textContent = "0.00 MAD";
			return;
		}

		// 3. Mettre à jour le montant total (ASYNCHRONE)
		try {
			const productIds = items.map((item) => item.id);
			if (productIds.length === 0) return;

			const response = await fetch(`${API_BASE_URL}/api/products/by-ids`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: productIds }),
			});

			if (!response.ok) throw new Error("Erreur API pour le total du panier");
			const productsDetails = await response.json();

			let totalAmount = 0;
			items.forEach((cartItem) => {
				const productDetail = productsDetails.find((p) => p.id === cartItem.id);
				if (productDetail) {
					totalAmount += productDetail.price * cartItem.quantity;
				}
			});
			cartTotalEl.textContent = `${totalAmount.toFixed(2)} MAD`;
		} catch (error) {
			console.error("Erreur calcul total panier:", error);
			cartTotalEl.textContent = "Erreur";
		}
	},

	showNotification: (message, type = "success") => {
		const notificationContainer =
			document.getElementById("notification-container") || document.body;
		const notification = document.createElement("div");
		notification.className = `alert alert-${type} position-fixed`;
		notification.style.cssText = "top: 20px; right: 20px; z-index: 9999;";
		notification.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "danger" ? "exclamation-circle" : "info"} me-2"></i> ${message}`;
		notificationContainer.appendChild(notification);
		setTimeout(() => {
			notification.classList.add("fade");
			setTimeout(() => notification.remove(), 500);
		}, 3000);
	},
};

// Exposer le panier globalement pour qu'il soit accessible depuis d'autres scripts
window.cart = cart;

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
	// CORRECTION: Attendre que le header soit chargé pour interagir avec
	document.addEventListener("component-loaded-header", () => {
		cart.updateDisplay(); // Mettre à jour le panier une fois le header prêt
	});

	// Délégation d'événements pour les boutons "Ajouter au panier"
	document.body.addEventListener("click", (event) => {
		const addToCartButton = event.target.closest(".add-to-cart-btn");
		if (addToCartButton) {
			event.preventDefault();
			const productId = parseInt(addToCartButton.dataset.productId);
			if (productId) {
				cart.addItem(productId);
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
