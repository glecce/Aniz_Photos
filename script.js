const CLOUDINARY_CLOUD = 'glecce';
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function cloudinaryUrl(publicId, largura) {
    const larguraReal = Math.round(largura * DPR);
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,w_${larguraReal}/${publicId}`;
}

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const galeria = document.querySelector('#dados-fotos, .galeria');
const fotosOrdemOriginal = galeria ? Array.from(galeria.children) : [];
const fotos = embaralhar([...fotosOrdemOriginal]);

if (galeria && galeria.classList.contains('galeria')) {
    fotos.forEach(foto => galeria.appendChild(foto));
}

const botoesFiltroLocal = document.querySelectorAll('.filtro-btn:not(.filtro-estilo):not(.filtro-album)');
const botoesFiltroEstilo = document.querySelectorAll('.filtro-btn.filtro-estilo');
const botoesFiltroAlbum = document.querySelectorAll('.filtro-btn.filtro-album');
const botoesFiltroPeriodo = document.querySelectorAll('.filtro-toggle-periodo');
const imagens = document.querySelectorAll('.galeria img');
const pinsMapa = document.querySelectorAll('.mapa-pin');
const galeriaCompleta = document.querySelector('.galeria_completa');
const toggleFavoritas = document.getElementById('toggle-favoritas');

const imagensOrdemOriginal = fotosOrdemOriginal.map(item => item.querySelector('img'));

imagens.forEach(img => {
    img.src = cloudinaryUrl(img.dataset.publicId, 640);
});

const BANDEIRAS = {
    cairo: '🇪🇬',
    malta: '🇲🇹',
    atenas: '🇬🇷',
    barcelona: '🇪🇸',
    madrid: '🇪🇸',
    porto: '🇵🇹',
    sangiovanni: '🇮🇹',
    manfredonia: '🇮🇹',
    paris: '🇫🇷',
    amsterdam: '🇳🇱',
    berlim: '🇩🇪',
};

function criarEstrela() {
    const estrela = document.createElement('img');
    estrela.className = 'estrela-favorita';
    estrela.src = './img_Icones/estrela-favorita.png';
    estrela.alt = 'Favorite';
    return estrela;
}

function criarBandeira(categoria) {
    const emoji = BANDEIRAS[categoria];
    if (!emoji) return null;
    const bandeira = document.createElement('span');
    bandeira.className = 'bandeira-foto';
    bandeira.textContent = emoji;
    bandeira.setAttribute('aria-hidden', 'true');
    return bandeira;
}

imagens.forEach(img => {
    const wrapper = img.parentElement;
    const bandeira = criarBandeira(img.dataset.categoria);
    if (bandeira) wrapper.appendChild(bandeira);
    if (img.dataset.favorita === 'true') {
        wrapper.appendChild(criarEstrela());
    }
});

let filtroLocalAtivo = 'todos';
let filtroEstiloAtivo = 'todos';
let filtroAlbumAtivo = 'todos';
let filtroPeriodoAtivo = 'todos';
let filtroFavoritaAtivo = false;

function atualizarGaleria() {
    imagens.forEach(img => {
        const bateLocal = filtroLocalAtivo === 'todos' || img.dataset.categoria === filtroLocalAtivo;
        const estilos = (img.dataset.estilo || '').split(' ');
        const bateEstilo = filtroEstiloAtivo === 'todos' || estilos.includes(filtroEstiloAtivo);
        const albuns = (img.dataset.album || '').split(' ');
        const bateAlbum = filtroAlbumAtivo === 'todos' || albuns.includes(filtroAlbumAtivo);
        const batePeriodo = filtroPeriodoAtivo === 'todos' || img.dataset.periodo === filtroPeriodoAtivo;
        const bateFavorita = !filtroFavoritaAtivo || img.dataset.favorita === 'true';
        const visivel = bateLocal && bateEstilo && bateAlbum && batePeriodo && bateFavorita;
        img.style.display = visivel ? '' : 'none';
        img.parentElement.style.display = visivel ? '' : 'none';
    });

    pinsMapa.forEach(pin => {
        pin.classList.toggle('ativo', pin.dataset.filtro === filtroLocalAtivo);
    });
}

if (toggleFavoritas) {
    toggleFavoritas.addEventListener('click', () => {
        filtroFavoritaAtivo = !filtroFavoritaAtivo;
        toggleFavoritas.classList.toggle('ativo', filtroFavoritaAtivo);
        toggleFavoritas.setAttribute('aria-pressed', String(filtroFavoritaAtivo));
        atualizarGaleria();
    });
}

function configurarGrupoFiltro(botoes, aoClicar) {
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('ativo'));
            botao.classList.add('ativo');
            aoClicar(botao);
            atualizarGaleria();
        });
    });
}

configurarGrupoFiltro(botoesFiltroLocal, botao => { filtroLocalAtivo = botao.dataset.filtro; });
configurarGrupoFiltro(botoesFiltroEstilo, botao => { filtroEstiloAtivo = botao.dataset.estilo; });
configurarGrupoFiltro(botoesFiltroAlbum, botao => { filtroAlbumAtivo = botao.dataset.album; });
configurarGrupoFiltro(botoesFiltroPeriodo, botao => { filtroPeriodoAtivo = botao.dataset.periodo; });

pinsMapa.forEach(pin => {
    const filtro = pin.dataset.filtro;
    const preview = pin.querySelector('.mapa-pin-preview');
    const previewImg = pin.querySelector('.mapa-pin-preview-img');
    const fotoDaCategoria = document.querySelector(`#dados-fotos img[data-categoria="${filtro}"], .galeria img[data-categoria="${filtro}"]`);
    const botaoFiltro = document.querySelector(`.filtro-btn[data-filtro="${filtro}"]`);

    if (fotoDaCategoria) {
        previewImg.src = cloudinaryUrl(fotoDaCategoria.dataset.publicId, 220);
        previewImg.alt = fotoDaCategoria.alt;
    } else {
        preview.classList.add('sem-foto');
    }

    pin.addEventListener('click', () => {
        const secaoCidade = document.getElementById(`album-${filtro}`);
        if (secaoCidade) {
            secaoCidade.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (botaoFiltro) {
            botaoFiltro.click();
            if (galeriaCompleta) galeriaCompleta.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const mapaScroll = document.querySelector('.mapa');
if (mapaScroll) {
    mapaScroll.scrollLeft = (mapaScroll.scrollWidth - mapaScroll.clientWidth) / 2;
}

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
let listaAtual = [];

function getVisiveis() {
    return Array.from(imagens).filter(img => img.style.display !== 'none');
}

function abrirLightbox(img, lista) {
    listaAtual = lista || getVisiveis();
    indiceAtual = listaAtual.indexOf(img);
    mostrarFoto();
    lightbox.classList.add('ativo');
    document.body.classList.add('sem-scroll');
}

let tokenFoto = 0;

function mostrarFoto() {
    const total = listaAtual.length;
    const imgAnterior = listaAtual[(indiceAtual - 1 + total) % total];
    const img = listaAtual[indiceAtual];
    const imgProxima = listaAtual[(indiceAtual + 1) % total];

    tokenFoto++;
    const tokenDestaFoto = tokenFoto;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;

    const versaoGrande = new Image();
    versaoGrande.onload = () => {
        if (tokenDestaFoto === tokenFoto) {
            lightboxImg.src = versaoGrande.src;
        }
    };
    versaoGrande.src = cloudinaryUrl(img.dataset.publicId, 1200);

    lightboxImgAnterior.src = cloudinaryUrl(imgAnterior.dataset.publicId, 500);
    lightboxImgAnterior.alt = imgAnterior.alt;
    lightboxImgProxima.src = cloudinaryUrl(imgProxima.dataset.publicId, 500);
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
    indiceAtual = (indiceAtual - 1 + listaAtual.length) % listaAtual.length;
    mostrarFoto();
}

function fotoProxima() {
    indiceAtual = (indiceAtual + 1) % listaAtual.length;
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
let toqueInicialY = 0;
let toqueEmAndamento = false;

lightbox.addEventListener('touchstart', (evento) => {
    toqueInicialX = evento.changedTouches[0].screenX;
    toqueInicialY = evento.changedTouches[0].screenY;
    toqueEmAndamento = true;
}, { passive: true });

lightbox.addEventListener('touchmove', (evento) => {
    if (!toqueEmAndamento) return;
    evento.preventDefault();
}, { passive: false });

function finalizarToque(evento) {
    if (!toqueEmAndamento) return;
    toqueEmAndamento = false;

    const toqueFinalX = evento.changedTouches[0].screenX;
    const toqueFinalY = evento.changedTouches[0].screenY;
    const diferencaX = toqueFinalX - toqueInicialX;
    const diferencaY = toqueFinalY - toqueInicialY;

    if (Math.abs(diferencaX) < 50 || Math.abs(diferencaX) < Math.abs(diferencaY)) return;

    navegarComBloqueio(() => {
        if (diferencaX < 0) {
            fotoProxima();
        } else {
            fotoAnterior();
        }
    });
}

lightbox.addEventListener('touchend', finalizarToque, { passive: true });
lightbox.addEventListener('touchcancel', () => { toqueEmAndamento = false; }, { passive: true });

function criarPolaroid(img, lista, mostrarEstrela = true) {
    const polaroid = document.createElement('figure');
    polaroid.className = 'polaroid';
    polaroid.style.setProperty('--rot', `${(Math.random() * 12 - 6).toFixed(2)}deg`);
    polaroid.style.setProperty('--desloc', `${Math.round(Math.random() * 12 - 4)}px`);
    polaroid.style.setProperty('--sobreposicao', `${Math.round(-95 + Math.random() * 35)}px`);

    const imgClone = document.createElement('img');
    imgClone.src = cloudinaryUrl(img.dataset.publicId, 400);
    imgClone.alt = img.alt;
    imgClone.loading = 'lazy';
    polaroid.appendChild(imgClone);

    const bandeira = criarBandeira(img.dataset.categoria);
    if (bandeira) polaroid.appendChild(bandeira);

    if (mostrarEstrela && img.dataset.favorita === 'true') {
        polaroid.appendChild(criarEstrela());
    }

    polaroid.addEventListener('click', () => abrirLightbox(img, lista));
    return polaroid;
}

const secaoFavoritas = document.getElementById('secao-favoritas');
const carrosselFavoritas = document.getElementById('carrossel-favoritas');
const carrosselRecentes = document.getElementById('carrossel-recentes');

if (secaoFavoritas && carrosselFavoritas) {
    const favoritas = embaralhar(imagensOrdemOriginal.filter(img => img.dataset.favorita === 'true'));
    if (favoritas.length === 0) {
        secaoFavoritas.hidden = true;
    } else {
        favoritas.forEach(img => carrosselFavoritas.appendChild(criarPolaroid(img, favoritas, false)));
    }
}

if (carrosselRecentes) {
    const recentes = imagensOrdemOriginal.slice(-15).reverse();
    recentes.forEach(img => carrosselRecentes.appendChild(criarPolaroid(img, recentes, false)));
}

function chaveAlbum(el) {
    if (el.dataset.album) return el.dataset.album;
    if (el.dataset.estilo) return el.dataset.estilo;
    if (el.dataset.periodo) return el.dataset.periodo;
    if (el.dataset.filtro) return el.dataset.filtro;
    if (el.hasAttribute('data-favoritos')) return 'favoritos';
    return null;
}

function fotosDoAlbum(el) {
    if (el.dataset.album) {
        const album = el.dataset.album;
        return imagensOrdemOriginal.filter(img => (img.dataset.album || '').split(' ').includes(album));
    }
    if (el.dataset.estilo) {
        const estilo = el.dataset.estilo;
        return imagensOrdemOriginal.filter(img => (img.dataset.estilo || '').split(' ').includes(estilo));
    }
    if (el.dataset.periodo) {
        const periodo = el.dataset.periodo;
        return imagensOrdemOriginal.filter(img => img.dataset.periodo === periodo);
    }
    if (el.dataset.filtro) {
        const filtro = el.dataset.filtro;
        return imagensOrdemOriginal.filter(img => img.dataset.categoria === filtro);
    }
    if (el.hasAttribute('data-favoritos')) {
        return imagensOrdemOriginal.filter(img => img.dataset.favorita === 'true');
    }
    return [];
}

document.querySelectorAll('.album-pilha').forEach(pilha => {
    const fotosFonte = fotosDoAlbum(pilha);

    if (fotosFonte.length === 0) {
        pilha.classList.add('sem-fotos');
    } else {
        const fotos = embaralhar([...fotosFonte]).slice(0, 3);
        const cartoes = Array.from(pilha.querySelectorAll('.album-cartao-cor')).reverse();
        fotos.forEach((foto, i) => {
            if (!cartoes[i]) return;
            cartoes[i].style.backgroundImage = `url(${cloudinaryUrl(foto.dataset.publicId, 400)})`;
        });
    }

    const chave = chaveAlbum(pilha);
    if (!chave) return;
    pilha.addEventListener('click', () => {
        const alvo = document.getElementById(`album-${chave}`);
        if (alvo) {
            alvo.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.location.href = `albums.html#album-${chave}`;
        }
    });
});

document.querySelectorAll('.album-secao').forEach(secao => {
    const galeriaEl = secao.querySelector('.album-secao-galeria');
    if (!galeriaEl) return;

    const fotosFonte = fotosDoAlbum(secao);
    if (fotosFonte.length === 0) {
        return;
    }

    const clones = embaralhar([...fotosFonte]).map(img => {
        const clone = document.createElement('img');
        clone.src = cloudinaryUrl(img.dataset.publicId, 640);
        clone.alt = img.alt;
        clone.loading = 'lazy';
        Object.assign(clone.dataset, img.dataset);
        return clone;
    });

    clones.forEach(clone => {
        const item = document.createElement('div');
        item.className = 'galeria-item';
        item.appendChild(clone);

        const bandeira = criarBandeira(clone.dataset.categoria);
        if (bandeira) item.appendChild(bandeira);
        if (clone.dataset.favorita === 'true') item.appendChild(criarEstrela());

        clone.addEventListener('click', () => abrirLightbox(clone, clones));
        galeriaEl.appendChild(item);
    });
});
