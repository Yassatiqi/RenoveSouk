class HeaderComponent extends HTMLElement {
	async connectedCallback() {
		this.innerHTML = /*html*/ `
            <!-- Top Bar -->
            <div class="top-bar bg-light py-2">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <span class="text-muted">
                                <i class="fas fa-map-marker-alt me-2"></i>
                                Bienvenue sur RenovSouk - Livraison dans tout le Maroc
                            </span>
                        </div>
                        <div class="col-md-6 text-end">
                            <a href="#" class="text-decoration-none me-3">
                                <i class="fas fa-store me-1"></i>Nos Magasins
                            </a>
                            <a href="#" class="text-decoration-none me-3">
                                <i class="fas fa-truck me-1"></i>Suivi Commande
                            </a>
                            <a href="/pages/mon-compte.html" class="text-decoration-none">
                                <i class="fas fa-user me-1"></i>Mon Compte
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Header -->
            <header class="header bg-white shadow-sm">
                <div class="container">
                    <div class="row align-items-center py-3">
                        <!-- Logo -->
                        <div class="col-lg-2 col-md-3">
                            <div class="logo">
                                <a href="/index.html" class="text-decoration-none">
                                    <h2 class="mb-0 text-primary fw-bold">
                                        <i class="fas fa-tools me-2"></i>RenovSouk
                                    </h2>
                                    <small class="text-muted">Votre souk digital</small>
                                </a>
                            </div>
                        </div>

                        <!-- Search Bar -->
                        <div class="col-lg-6 col-md-5">
                            <div class="search-bar">
                                <div class="input-group">
                                    <select class="form-select" id="search-category" style="max-width: 200px;">
                                        <option value="">Toutes Catégories</option>
                                        <!-- <option value="outillage">Outillage & Machines</option>
                                        <option value="materiaux">Matériaux Construction</option>
                                        <option value="electricite">Électricité & Éclairage</option>
                                        <option value="plomberie">Plomberie & Sanitaire</option>
                                        <option value="peinture">Peinture & Revêtements</option>
                                        <option value="portes">Portes & Fenêtres</option>
                                        <option value="jardin">Jardin & Extérieur</option>
                                        <option value="securite">Sécurité & Surveillance</option> -->
                                    </select>
                                    <input type="text" class="form-control" id="search-input" placeholder="Rechercher des produits...">
                                    <button class="btn btn-primary" type="button" id="search-btn">
                                        <i class="fas fa-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- User Actions -->
                        <div class="col-lg-4 col-md-4">
                            <div class="user-actions d-flex justify-content-end align-items-center">
                                <a href="/pages/favoris.html" class="text-decoration-none me-3">
                                    <i class="fas fa-heart text-danger"></i>
                                    <span class="badge bg-danger rounded-pill" id="favorites-count">0</span>
                                </a>
                                <a href="/pages/comparaison.html" class="text-decoration-none me-3">
                                    <i class="fas fa-balance-scale text-info"></i>
                                    <span class="badge bg-info rounded-pill" id="compare-count">0</span>
                                </a>
                                <a href="/pages/panier.html" class="text-decoration-none">
                                    <i class="fas fa-shopping-cart text-success"></i>
                                    <span class="badge bg-success rounded-pill" id="cart-count">0</span>
                                    <span class="ms-1" id="cart-total">0.00 MAD</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Navigation -->
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-bars me-2"></i>Toutes Catégories
                                </a>
                                <ul class="dropdown-menu" id="nav-categories-dropdown">
                                    <!-- <li><a class="dropdown-item" href="/pages/boutique.html?category=outillage"><i class="fas fa-tools me-2"></i>Outillage & Machines</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=materiaux"><i class="fas fa-building me-2"></i>Matériaux Construction</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=electricite"><i class="fas fa-bolt me-2"></i>Électricité & Éclairage</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=plomberie"><i class="fas fa-faucet me-2"></i>Plomberie & Sanitaire</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=peinture"><i class="fas fa-paint-roller me-2"></i>Peinture & Revêtements</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=portes"><i class="fas fa-door-open me-2"></i>Portes & Fenêtres</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=jardin"><i class="fas fa-seedling me-2"></i>Jardin & Extérieur</a></li>
                                    <li><a class="dropdown-item" href="/pages/boutique.html?category=securite"><i class="fas fa-shield-alt me-2"></i>Sécurité & Surveillance</a></li> -->
                                </ul>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/index.html">Accueil</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/pages/boutique.html">Boutique</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/index.html#sale">Promotions</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/index.html#new">Nouveautés</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="/pages/contact.html">Contact</a>
                            </li>
                        </ul>
                        <div class="d-flex">
                            <span class="navbar-text me-3">
                                <i class="fas fa-phone me-1"></i>+212 5XX-XXXXXX
                            </span>
                        </div>
                    </div>
                </div>
            </nav>
        `;

		this.initializeSearch();
		await this.initializeDynamicCategories();

		document.dispatchEvent(
			new CustomEvent("component-loaded-header", {
				detail: { componentName: "header", element: this },
			}),
		);
	}

	initializeSearch() {
		const searchBtn = this.querySelector("#search-btn");
		const searchInput = this.querySelector("#search-input");
		const searchCategory = this.querySelector("#search-category");

		if (searchBtn && searchInput) {
			const performSearch = () => {
				const query = searchInput.value.trim();
				const category = searchCategory.value;

				if (query.length > 0) {
					let searchUrl = `pages/boutique.html?search=${encodeURIComponent(query)}`;
					if (category) {
						searchUrl += `&category=${encodeURIComponent(category)}`;
					}

					// Adjust URL according to current page
					if (window.location.pathname.includes("/pages/")) {
						searchUrl = searchUrl.replace("pages/", "");
					}

					window.location.href = searchUrl;
				}
			};

			searchBtn.addEventListener("click", performSearch);
			searchInput.addEventListener("keypress", (e) => {
				if (e.key === "Enter") {
					performSearch();
				}
			});
		}
	}

	async initializeDynamicCategories() {
		try {
			console.log("loading dynamic categories");

			const response = await fetch(`http://localhost:5001/api/categories`);
			if (!response.ok) throw new Error("Impossible de charger les catégories");

			const categories = await response.json();
			console.log(categories);

			const searchCategoryEl = document.getElementById("search-category");
			const navDropdownEl = document.getElementById("nav-categories-dropdown");
			console.log(searchCategoryEl, navDropdownEl);

			if (!searchCategoryEl || !navDropdownEl) return;

			let searchOptionsHTML = '<option value="">Toutes Catégories</option>';
			let navDropdownHTML = "";

			categories.forEach((cat) => {
				// Option pour la barre de recherche
				searchOptionsHTML += `<option value="${cat.slug}">${cat.name}</option>`;
				// Lien pour le menu de navigation principal
				navDropdownHTML += `<li><a class="dropdown-item" href="/pages/boutique.html?category=${cat.slug}"><i class="${cat.icon || "fas fa-tag"} me-2"></i>${cat.name}</a></li>`;
			});

			// Vider les anciens placeholders et injecter le nouveau HTML
			searchCategoryEl.innerHTML = searchOptionsHTML;
			// Pour le menu dropdown, on l'insère avant les deux derniers éléments (le séparateur et le lien "tout voir")
			const divider = navDropdownEl.querySelector(".dropdown-divider");
			if (divider) {
				navDropdownEl.insertAdjacentHTML("afterbegin", navDropdownHTML);
			} else {
				navDropdownEl.innerHTML = navDropdownHTML;
			}
		} catch (error) {
			console.error(
				"Erreur lors de l'initialisation des catégories dynamiques:",
				error,
			);
		}
	}
}

// Register the custom element
customElements.define("header-component", HeaderComponent);
