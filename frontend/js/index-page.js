import "../components/widgets/product-card.js";

const API_BASE_URL = "http://localhost:5001";

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
				const card = document.createElement("product-card");
				card.product = product;
				card.productId = product.id;
				card.classList.add("col-lg-3", "col-md-4", "col-sm-6", "mb-4");
				container.appendChild(card);
			});
		}
	} catch (error) {
		console.error(`Erreur chargement ${endpoint}:`, error);
		container.innerHTML =
			'<div class="col-12"><p class="text-center text-danger py-5">Erreur de chargement des produits.</p></div>';
	}
}

document.addEventListener("DOMContentLoaded", () => {
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
