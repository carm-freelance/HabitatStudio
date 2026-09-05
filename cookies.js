(function () {
    const CONSENT_KEY = 'hs_cookie_consent';
    const CONSENT_VERSION = 1;

    function getConsent() {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (parsed.version !== CONSENT_VERSION) return null;
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function applyConsent(consent) {
        // Hook point: enable/disable non-essential scripts (e.g. an analytics tag)
        // here based on consent.analytics. No analytics script ships by default.
        document.dispatchEvent(new CustomEvent('hs-cookie-consent-updated', { detail: consent }));
    }

    function saveConsent(analytics) {
        const consent = {
            necessary: true,
            analytics: !!analytics,
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString()
        };
        try {
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
        } catch (e) {
            /* localStorage unavailable (private mode, etc.) — consent simply won't persist */
        }
        applyConsent(consent);
        return consent;
    }

    function buildBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-banner';
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-live', 'polite');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML =
            '<div class="cookie-banner-content">' +
                '<i class="ph ph-cookie cookie-banner-icon"></i>' +
                '<p>Utilizamos cookies propias y, en su caso, de terceros para el correcto funcionamiento del sitio y, si lo aceptas, para analizar la navegación. Puedes aceptarlas, rechazarlas o configurarlas. Más información en nuestra <a href="politica-cookies.html">Política de Cookies</a>.</p>' +
            '</div>' +
            '<div class="cookie-banner-actions">' +
                '<button type="button" class="btn btn-secondary" id="cookie-reject">Rechazar</button>' +
                '<button type="button" class="btn btn-secondary" id="cookie-configure">Configurar</button>' +
                '<button type="button" class="btn btn-primary" id="cookie-accept">Aceptar todas</button>' +
            '</div>';
        document.body.appendChild(banner);
        return banner;
    }

    function buildModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.id = 'cookie-modal';
        modal.innerHTML =
            '<div class="cookie-modal-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">' +
                '<button type="button" class="cookie-modal-close" id="cookie-modal-close" aria-label="Cerrar">' +
                    '<i class="ph ph-x"></i>' +
                '</button>' +
                '<h3 id="cookie-modal-title">Preferencias de cookies</h3>' +
                '<p>Configura qué tipos de cookies quieres permitir. Puedes cambiar esta configuración cuando quieras desde el enlace "Configurar Cookies" del pie de página.</p>' +
                '<div class="cookie-option">' +
                    '<div class="cookie-option-header">' +
                        '<strong>Necesarias</strong>' +
                        '<label class="cookie-toggle cookie-toggle-disabled">' +
                            '<input type="checkbox" checked disabled>' +
                            '<span class="cookie-toggle-slider"></span>' +
                        '</label>' +
                    '</div>' +
                    '<p>Imprescindibles para que el sitio funcione correctamente. No se pueden desactivar.</p>' +
                '</div>' +
                '<div class="cookie-option">' +
                    '<div class="cookie-option-header">' +
                        '<strong>Analíticas</strong>' +
                        '<label class="cookie-toggle">' +
                            '<input type="checkbox" id="cookie-analytics-toggle">' +
                            '<span class="cookie-toggle-slider"></span>' +
                        '</label>' +
                    '</div>' +
                    '<p>Nos permiten conocer cómo interactúan los visitantes con el sitio para poder mejorarlo.</p>' +
                '</div>' +
                '<div class="cookie-modal-actions">' +
                    '<button type="button" class="btn btn-secondary" id="cookie-modal-reject">Rechazar todas</button>' +
                    '<button type="button" class="btn btn-primary" id="cookie-modal-save">Guardar preferencias</button>' +
                '</div>' +
            '</div>';
        document.body.appendChild(modal);
        return modal;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const banner = buildBanner();
        const modal = buildModal();
        const analyticsToggle = document.getElementById('cookie-analytics-toggle');

        const openBanner = () => banner.classList.add('active');
        const closeBanner = () => banner.classList.remove('active');
        const openModal = () => {
            const consent = getConsent();
            analyticsToggle.checked = !!(consent && consent.analytics);
            modal.classList.add('active');
        };
        const closeModal = () => modal.classList.remove('active');

        document.getElementById('cookie-accept').addEventListener('click', () => {
            saveConsent(true);
            closeBanner();
        });
        document.getElementById('cookie-reject').addEventListener('click', () => {
            saveConsent(false);
            closeBanner();
        });
        document.getElementById('cookie-configure').addEventListener('click', openModal);
        document.getElementById('cookie-modal-close').addEventListener('click', closeModal);
        document.getElementById('cookie-modal-reject').addEventListener('click', () => {
            analyticsToggle.checked = false;
            saveConsent(false);
            closeModal();
            closeBanner();
        });
        document.getElementById('cookie-modal-save').addEventListener('click', () => {
            saveConsent(analyticsToggle.checked);
            closeModal();
            closeBanner();
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        const existing = getConsent();
        if (existing) {
            applyConsent(existing);
        } else {
            openBanner();
        }

        document.querySelectorAll('.js-open-cookie-preferences').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });
    });
})();
