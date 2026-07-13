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
    const preview = pin.querySelector('.mapa-pin-preview-img');
    const fotoDaCategoria = document.querySelector(`.galeria img[data-categoria="${filtro}"]`);

    if (fotoDaCategoria) {
        preview.src = fotoDaCategoria.src;
        preview.alt = fotoDaCategoria.alt;
    }

    pin.addEventListener('click', () => {
        const botao = document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`);
        if (botao) {
            botao.click();
            galeriaCompleta.scrollIntoView({ behavior: 'smooth' });
        }
    });
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
