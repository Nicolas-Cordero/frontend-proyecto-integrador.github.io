class TemaManager {

    constructor() {
        this.elemento = document.documentElement;
        this.claveTema = 'app-theme';
        this.inicializar();
    }

    inicializar() {
        const temaGuardado = localStorage.getItem(this.claveTema);
        const temaPreferido = temaGuardado || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.aplicarTema(temaPreferido);
    }

    aplicarTema(tema) {
        this.elemento.setAttribute('data-theme', tema);
        localStorage.setItem(this.claveTema, tema);
    }

    alternarTema() {
        const temaActual = this.elemento.getAttribute('data-theme');
        const nuevoTema = temaActual === 'dark' ? 'light' : 'dark';
        this.aplicarTema(nuevoTema);
    }

    obtenerTemaActual() {
        return this.elemento.getAttribute('data-theme');
    }

}

const temaManager = new TemaManager();