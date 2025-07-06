// Gestionnaire de composants partagés
// Version: 1.0

class ComponentLoader {
    constructor() {
        this.basePath = this.getBasePath();
    }

    // Détermine le chemin de base selon la page actuelle
    getBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            return '../components/';
        }
        return 'components/';
    }

    // Charge un composant HTML
    async loadComponent(componentName, targetSelector) {
        try {
            const response = await fetch(`${this.basePath}${componentName}.html`);
            if (!response.ok) {
                throw new Error(`Erreur lors du chargement de ${componentName}: ${response.status}`);
            }
            const html = await response.text();
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;
                // Déclencher un événement personnalisé après le chargement
                document.dispatchEvent(new CustomEvent(`component-loaded-${componentName}`, {
                    detail: { componentName, targetSelector }
                }));
            }
        } catch (error) {
            console.error(`Erreur lors du chargement du composant ${componentName}:`, error);
        }
    }

    // Charge tous les composants de base
    async loadBaseComponents() {
        await Promise.all([
            this.loadComponent('header', '#header-placeholder'),
            this.loadComponent('footer', '#footer-placeholder')
        ]);
    }

    // Initialise les liens relatifs selon la page
/*    initializeLinks() {
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        
        // Corriger les liens dans le header
        document.addEventListener('component-loaded-header', () => {
            if (isInPagesFolder) {
                // Corriger les liens pour les pages dans le dossier pages/
                const links = document.querySelectorAll('#header-placeholder a[href]');
                links.forEach(link => {
                    let href = link.getAttribute('href');
                    if (href.startsWith('index.html')) {
                        link.setAttribute('href', '../' + href);
                    } else if (href.startsWith('pages/')) {
                        link.setAttribute('href', href.replace('pages/', ''));
                    }
                });
            }
        });

        // Corriger les liens dans le footer
        document.addEventListener('component-loaded-footer', () => {
            if (isInPagesFolder) {
                const links = document.querySelectorAll('#footer-placeholder a[href]');
                links.forEach(link => {
                    let href = link.getAttribute('href');
                    if (href.startsWith('pages/')) {
                        link.setAttribute('href', href.replace('pages/', ''));
                    }
                });
            }
        });
    }
*/

    // Initialise la fonctionnalité de recherche
    initializeSearch() {
        document.addEventListener('component-loaded-header', () => {
            const searchBtn = document.getElementById('search-btn');
            const searchInput = document.getElementById('search-input');
            const searchCategory = document.getElementById('search-category');

            if (searchBtn && searchInput) {
                const performSearch = () => {
                    const query = searchInput.value.trim();
                    const category = searchCategory.value;
                    
                    if (query.length > 0) {
                        let searchUrl = 'pages/boutique.html?search=' + encodeURIComponent(query);
                        if (category) {
                            searchUrl += '&category=' + encodeURIComponent(category);
                        }
                        
                        // Ajuster l'URL selon la page actuelle
                        if (window.location.pathname.includes('/pages/')) {
                            searchUrl = searchUrl.replace('pages/', '');
                        }
                        
                        window.location.href = searchUrl;
                    }
                };

                searchBtn.addEventListener('click', performSearch);
                searchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        performSearch();
                    }
                });
            }
        });
    }

    // Initialise la newsletter
    initializeNewsletter() {
        document.addEventListener('component-loaded-footer', () => {
            const newsletterBtn = document.getElementById('newsletter-btn');
            const newsletterEmail = document.getElementById('newsletter-email');

            if (newsletterBtn && newsletterEmail) {
                newsletterBtn.addEventListener('click', () => {
                    const email = newsletterEmail.value.trim();
                    if (email && this.isValidEmail(email)) {
                        // Simuler l'inscription à la newsletter
                        this.showNotification('Merci ! Vous êtes maintenant inscrit à notre newsletter.', 'success');
                        newsletterEmail.value = '';
                    } else {
                        this.showNotification('Veuillez entrer une adresse email valide.', 'error');
                    }
                });

                newsletterEmail.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
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
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 300px;';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // Initialisation complète
    async init() {
        await this.loadBaseComponents();
        //this.initializeLinks();
        this.initializeSearch();
        this.initializeNewsletter();
    }
}

// Initialiser les composants quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    const componentLoader = new ComponentLoader();
    componentLoader.init();
});

// Exporter pour utilisation globale
window.ComponentLoader = ComponentLoader;

