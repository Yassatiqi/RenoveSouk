class FooterComponent extends HTMLElement {
	connectedCallback() {
		this.innerHTML = /*html*/ `
            <!-- Newsletter -->
            <section class="newsletter py-5 bg-primary text-white">
                <!-- Newsletter content can be added here if needed -->
            </section>

            <!-- Footer -->
            <footer class="footer bg-dark text-white py-5">
                <div class="container">
                    <div class="row g-4">
                        <div class="col-lg-3 col-md-6">
                            <h5 class="fw-bold mb-3">RenovSouk</h5>
                            <p class="text-muted">Votre partenaire de confiance pour tous vos projets de rénovation et de construction.</p>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <h5 class="fw-bold mb-3">Catégories</h5>
                            <ul class="list-unstyled">
                                <li><a href="/pages/boutique.html?category=outillage" class="text-muted text-decoration-none">Outillage & Machines</a></li>
                                <li><a href="/pages/boutique.html?category=materiaux" class="text-muted text-decoration-none">Matériaux Construction</a></li>
                                <li><a href="/pages/boutique.html?category=electricite" class="text-muted text-decoration-none">Électricité & Éclairage</a></li>
                                <li><a href="/pages/boutique.html?category=plomberie" class="text-muted text-decoration-none">Plomberie & Sanitaire</a></li>
                                <li><a href="/pages/boutique.html?category=decoration" class="text-muted text-decoration-none">Décoration</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <h5 class="fw-bold mb-3">Service Client</h5>
                            <ul class="list-unstyled">
                                <li><a href="/pages/contact.html" class="text-muted text-decoration-none">Contact</a></li>
                                <li><a href="/pages/livraison.html" class="text-muted text-decoration-none">Livraison</a></li>
                                <li><a href="/pages/retours.html" class="text-muted text-decoration-none">Retours</a></li>
                                <li><a href="/pages/faq.html" class="text-muted text-decoration-none">FAQ</a></li>
                                <li><a href="/pages/garantie.html" class="text-muted text-decoration-none">Garantie</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-3 col-md-6">
                            <h5 class="fw-bold mb-3">Suivez-nous</h5>
                            <div class="d-flex gap-2">
                                <a href="#" class="text-muted text-decoration-none">
                                    <i class="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" class="text-muted text-decoration-none">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="text-muted text-decoration-none">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="text-muted text-decoration-none">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <p class="text-muted mb-0">© 2024 RenovSouk. Tous droits réservés.</p>
                        </div>
                        <div class="col-md-6 text-end">
                            <a href="/pages/conditions.html" class="text-muted text-decoration-none me-3">Conditions d'utilisation</a>
                            <a href="/pages/confidentialite.html" class="text-muted text-decoration-none">Politique de confidentialité</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;

		this.initializeNewsletter();

		// Dispatch custom event after footer is loaded
		document.dispatchEvent(
			new CustomEvent("component-loaded-footer", {
				detail: { componentName: "footer", element: this },
			}),
		);
	}

	// Initialise la newsletter
	initializeNewsletter() {
		document.addEventListener("component-loaded-footer", () => {
			const newsletterBtn = document.getElementById("newsletter-btn");
			const newsletterEmail = document.getElementById("newsletter-email");

			if (newsletterBtn && newsletterEmail) {
				newsletterBtn.addEventListener("click", () => {
					const email = newsletterEmail.value.trim();
					if (email && this.isValidEmail(email)) {
						// Simuler l'inscription à la newsletter
						this.showNotification(
							"Merci ! Vous êtes maintenant inscrit à notre newsletter.",
							"success",
						);
						newsletterEmail.value = "";
					} else {
						this.showNotification(
							"Veuillez entrer une adresse email valide.",
							"error",
						);
					}
				});

				newsletterEmail.addEventListener("keypress", (e) => {
					if (e.key === "Enter") {
						newsletterBtn.click();
					}
				});
			}
		});
	}

	// Validation email
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Afficher une notification
	showNotification(message, type = "info") {
		const notification = document.createElement("div");
		notification.className = `alert alert-${type === "error" ? "danger" : type} position-fixed`;
		notification.style.cssText =
			"top: 20px; right: 20px; z-index: 9999; max-width: 300px;";
		notification.innerHTML = `
            <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
		document.body.appendChild(notification);
		setTimeout(() => notification.remove(), 5000);
	}
}

// Register the custom element
customElements.define("footer-component", FooterComponent);
