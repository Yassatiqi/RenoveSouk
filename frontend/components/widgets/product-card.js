class ProductCard extends HTMLElement {
	constructor() {
		super();
		this.API_BASE_URL = "http://localhost:5001";
	}

	static get observedAttributes() {
		return ["product-id"];
	}

	set product(value) {
		this._product = value;
	}

	get productId() {
		return this.getAttribute("product-id");
	}

	set productId(value) {
		this.setAttribute("product-id", value);
	}

	connectedCallback() {
		const product = this._product || {};
		const placeholderImage = "../assets/images/placeholder.jpg";

		const imageUrl = product.image_url?.startsWith("/static/")
			? `${this.API_BASE_URL}${product.image_url}`
			: product.image_url || placeholderImage;

		let priceHTML = `
			<span class="current-price text-primary fw-bold">${product.price?.toFixed(2) || "0.00"} MAD</span>`;
		if (product.is_on_sale && product.original_price) {
			priceHTML = `
			<span class="current-price text-primary fw-bold">${product.price.toFixed(2)} MAD</span>
			<span class="original-price text-muted text-decoration-line-through ms-2">
				${product.original_price.toFixed(2)} MAD
			</span>`;
		}

		const badges = [];
		if (product.is_on_sale)
			badges.push(
				`<span class="badge bg-danger position-absolute top-0 end-0 m-2">Promo</span>`,
			);
		if (product.is_new)
			badges.push(
				`<span class="badge bg-info position-absolute top-0 start-0 m-2">Nouveau</span>`,
			);

		const productId = this.productId;

		this.innerHTML = /*html*/ `
             <div class="product-card card h-100">
                <div class="product-image position-relative">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='${placeholderImage}'">
                    ${badges.join("")}
                    <div class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                            <a href="produit.html?id=${productId}" class="btn btn-primary btn-sm me-2" title="Voir le détail">
                                <i class="fas fa-eye"></i>
                            </a>
                            <button class="btn btn-success btn-sm me-2 add-to-cart-btn" title="Ajouter au panier">
                                <i class="fas fa-shopping-cart"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" title="Ajouter aux favoris">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${product.name}</h6>
                    <div>${priceHTML}</div>
                    <div >
                        <small class="text-muted">Stock: ${product.stock > 0 ? product.stock : "Rupture"}</small>
                    </div>
                </div>
            </div>
 `;

		const addToCartButton = this.querySelector(".add-to-cart-btn");
		if (addToCartButton) {
			addToCartButton.addEventListener("click", (event) => {
				event.preventDefault();
				const productId = parseInt(this.productId);
				if (productId && window.cart) {
					window.cart.addItem(productId);
				}
			});
		}
	}
}

customElements.define("product-card", ProductCard);
