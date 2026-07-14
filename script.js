const galeria = document.querySelector('.galeria');
const fotos = Array.from(galeria.children);

for (let i = fotos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
}

fotos.forEach(foto => galeria.appendChild(foto));

const botoesFiltro = document.querySelectorAll('.filtro-btn');
const imagens = document.querySelectorAll('.galeria img');
const pinsMapa = document.querySelectorAll('.mapa-pin');
const galeriaCompleta = document.querySelector('.galeria_completa');

botoesFiltro.forEach(botao => {
    botao.addEventListener('click', () => {
        botoesFiltro.forEach(b => b.classList.remove('ativo'));
        botao.classList.add('ativo');

        const filtro = botao.dataset.filtro;

        imagens.forEach(img => {
            const mostrar = filtro === 'todos' || img.dataset.categoria === filtro;
            img.style.display = mostrar ? '' : 'none';
        });

        pinsMapa.forEach(pin => {
            pin.classList.toggle('ativo', pin.dataset.filtro === filtro);
        });
    });
});

pinsMapa.forEach(pin => {
    const filtro = pin.dataset.filtro;
    const preview = pin.querySelector('.mapa-pin-preview');
    const previewImg = pin.querySelector('.mapa-pin-preview-img');
    const fotoDaCategoria = document.querySelector(`.galeria img[data-categoria="${filtro}"]`);

    if (fotoDaCategoria) {
        previewImg.src = fotoDaCategoria.src;
        previewImg.alt = fotoDaCategoria.alt;
    } else {
        preview.classList.add('sem-foto');
    }

    pin.addEventListener('click', () => {
        const botao = document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`);
        if (botao) {
            botao.click();
            galeriaCompleta.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const mapaWrapper = document.getElementById('mapa-wrapper');
const mapaZoomConteudo = document.getElementById('mapa-zoom-conteudo');
const MAPA_ZOOM_MAX = 4;

let mapaEscala = 1;
let mapaX = 0;
let mapaY = 0;
let gestoPinca = null;
let arrasteMapa = null;
let ultimoToqueMapa = 0;

function aplicarZoomMapa() {
    mapaZoomConteudo.style.transform = `translate(${mapaX}px, ${mapaY}px) scale(${mapaEscala})`;
}

function limitarPan(valor, tamanho) {
    const minimo = tamanho * (1 - mapaEscala);
    return Math.min(0, Math.max(minimo, valor));
}

function distanciaEntreToques(t0, t1) {
    return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
}

function resetarZoomMapa() {
    mapaEscala = 1;
    mapaX = 0;
    mapaY = 0;
    mapaZoomConteudo.style.transition = 'transform 0.25s ease';
    aplicarZoomMapa();
    setTimeout(() => { mapaZoomConteudo.style.transition = ''; }, 250);
}

mapaWrapper.addEventListener('touchstart', (evento) => {
    if (evento.touches.length === 2) {
        mapaWrapper.style.touchAction = 'none';
        const rect = mapaWrapper.getBoundingClientRect();
        const [t0, t1] = evento.touches;
        const midX = (t0.clientX + t1.clientX) / 2 - rect.left;
        const midY = (t0.clientY + t1.clientY) / 2 - rect.top;

        gestoPinca = {
            distanciaInicial: distanciaEntreToques(t0, t1),
            escalaInicial: mapaEscala,
            ancoraX: (midX - mapaX) / mapaEscala,
            ancoraY: (midY - mapaY) / mapaEscala
        };
        arrasteMapa = null;
    } else if (evento.touches.length === 1 && mapaEscala > 1) {
        arrasteMapa = {
            x: evento.touches[0].clientX,
            y: evento.touches[0].clientY,
            tx: mapaX,
            ty: mapaY
        };
    }
}, { passive: true });

mapaWrapper.addEventListener('touchmove', (evento) => {
    const rect = mapaWrapper.getBoundingClientRect();

    if (evento.touches.length === 2 && gestoPinca) {
        evento.preventDefault();
        const [t0, t1] = evento.touches;
        const novaDistancia = distanciaEntreToques(t0, t1);
        const novaEscala = Math.min(
            MAPA_ZOOM_MAX,
            Math.max(1, gestoPinca.escalaInicial * (novaDistancia / gestoPinca.distanciaInicial))
        );
        const midX = (t0.clientX + t1.clientX) / 2 - rect.left;
        const midY = (t0.clientY + t1.clientY) / 2 - rect.top;

        mapaEscala = novaEscala;
        mapaX = limitarPan(midX - novaEscala * gestoPinca.ancoraX, rect.width);
        mapaY = limitarPan(midY - novaEscala * gestoPinca.ancoraY, rect.height);
        aplicarZoomMapa();
    } else if (evento.touches.length === 1 && arrasteMapa) {
        evento.preventDefault();
        const dx = evento.touches[0].clientX - arrasteMapa.x;
        const dy = evento.touches[0].clientY - arrasteMapa.y;
        mapaX = limitarPan(arrasteMapa.tx + dx, rect.width);
        mapaY = limitarPan(arrasteMapa.ty + dy, rect.height);
        aplicarZoomMapa();
    }
}, { passive: false });

mapaWrapper.addEventListener('touchend', (evento) => {
    if (evento.touches.length === 0) {
        mapaWrapper.style.touchAction = 'pan-y';

        if (evento.changedTouches.length === 1 && !gestoPinca && !arrasteMapa) {
            const agora = Date.now();
            const eraDoubleTap = agora - ultimoToqueMapa < 300 && mapaEscala > 1;
            ultimoToqueMapa = agora;

            gestoPinca = null;
            arrasteMapa = null;

            if (eraDoubleTap || mapaEscala <= 1) {
                resetarZoomMapa();
                return;
            }
        }

        gestoPinca = null;
        arrasteMapa = null;
    } else if (evento.touches.length === 1) {
        gestoPinca = null;
        arrasteMapa = mapaEscala > 1 ? {
            x: evento.touches[0].clientX,
            y: evento.touches[0].clientY,
            tx: mapaX,
            ty: mapaY
        } : null;
    }
});

const lightbox = document.getElementById('lightbox');
const lightboxConteudo = document.querySelector('.lightbox-conteudo');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxImgAnterior = document.getElementById('lightbox-img-anterior');
const lightboxImgProxima = document.getElementById('lightbox-img-proxima');
const btnFechar = document.getElementById('lightbox-fechar');
const btnAnterior = document.getElementById('lightbox-anterior');
const btnProxima = document.getElementById('lightbox-proxima');
const btnInfo = document.getElementById('lightbox-info-botao');
const fundoInfo = document.getElementById('lightbox-info-fundo');
const painelInfo = document.getElementById('lightbox-info-painel');
const btnInfoFechar = document.getElementById('lightbox-info-fechar');

const camposInfo = ['data', 'camera', 'lente', 'iso', 'foco', 'obturador'];

let indiceAtual = 0;

function getVisiveis() {
    return Array.from(imagens).filter(img => img.style.display !== 'none');
}

function abrirLightbox(img) {
    const visiveis = getVisiveis();
    indiceAtual = visiveis.indexOf(img);
    mostrarFoto();
    lightbox.classList.add('ativo');
    document.body.classList.add('sem-scroll');
}

function mostrarFoto() {
    const visiveis = getVisiveis();
    const total = visiveis.length;
    const imgAnterior = visiveis[(indiceAtual - 1 + total) % total];
    const img = visiveis[indiceAtual];
    const imgProxima = visiveis[(indiceAtual + 1) % total];

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxImgAnterior.src = imgAnterior.src;
    lightboxImgAnterior.alt = imgAnterior.alt;
    lightboxImgProxima.src = imgProxima.src;
    lightboxImgProxima.alt = imgProxima.alt;

    atualizarPainelInfo(img);
}

function atualizarPainelInfo(img) {
    camposInfo.forEach(campo => {
        const valor = img.dataset[campo] || '';
        const item = painelInfo.querySelector(`[data-campo="${campo}"]`);
        document.getElementById(`info-${campo}`).textContent = valor;
        item.classList.toggle('vazio', valor === '');
    });
}

function fecharLightbox() {
    lightbox.classList.remove('ativo');
    document.body.classList.remove('sem-scroll');
    fecharInfo();
}

function fecharInfo() {
    fundoInfo.classList.remove('ativo');
    btnInfo.classList.remove('ativo');
}

function fotoAnterior() {
    const visiveis = getVisiveis();
    indiceAtual = (indiceAtual - 1 + visiveis.length) % visiveis.length;
    mostrarFoto();
}

function fotoProxima() {
    const visiveis = getVisiveis();
    indiceAtual = (indiceAtual + 1) % visiveis.length;
    mostrarFoto();
}

imagens.forEach(img => {
    img.addEventListener('click', () => abrirLightbox(img));
});

btnInfo.addEventListener('click', () => {
    fundoInfo.classList.toggle('ativo');
    btnInfo.classList.toggle('ativo');
});

btnInfoFechar.addEventListener('click', fecharInfo);

fundoInfo.addEventListener('click', (evento) => {
    if (evento.target === fundoInfo) {
        fecharInfo();
    }
});

btnFechar.addEventListener('click', fecharLightbox);
btnAnterior.addEventListener('click', fotoAnterior);
btnProxima.addEventListener('click', fotoProxima);
lightboxImgAnterior.addEventListener('click', fotoAnterior);
lightboxImgProxima.addEventListener('click', fotoProxima);

lightbox.addEventListener('click', (evento) => {
    if (evento.target === lightbox || evento.target === lightboxConteudo) {
        fecharLightbox();
    }
});

document.addEventListener('keydown', (evento) => {
    if (!lightbox.classList.contains('ativo')) return;

    if (evento.key === 'Escape') {
        if (fundoInfo.classList.contains('ativo')) {
            fecharInfo();
        } else {
            fecharLightbox();
        }
    }
    if (evento.key === 'ArrowLeft') fotoAnterior();
    if (evento.key === 'ArrowRight') fotoProxima();
});

let navegacaoBloqueada = false;

function navegarComBloqueio(callback) {
    if (navegacaoBloqueada) return;
    navegacaoBloqueada = true;
    callback();
    setTimeout(() => { navegacaoBloqueada = false; }, 400);
}

lightbox.addEventListener('wheel', (evento) => {
    if (!lightbox.classList.contains('ativo')) return;
    if (Math.abs(evento.deltaX) < Math.abs(evento.deltaY)) return;
    if (Math.abs(evento.deltaX) < 20) return;

    evento.preventDefault();

    navegarComBloqueio(() => {
        if (evento.deltaX > 0) {
            fotoProxima();
        } else {
            fotoAnterior();
        }
    });
}, { passive: false });

let toqueInicialX = 0;

lightbox.addEventListener('touchstart', (evento) => {
    toqueInicialX = evento.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchmove', (evento) => {
    evento.preventDefault();
}, { passive: false });

lightbox.addEventListener('touchend', (evento) => {
    const toqueFinalX = evento.changedTouches[0].screenX;
    const diferenca = toqueFinalX - toqueInicialX;

    if (Math.abs(diferenca) < 50) return;

    if (diferenca < 0) {
        fotoProxima();
    } else {
        fotoAnterior();
    }
}, { passive: true });
