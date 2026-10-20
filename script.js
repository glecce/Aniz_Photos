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
    luxor: '🇪🇬',
    marrakech: '🇲🇦',
    malta: '🇲🇹',
    atenas: '🇬🇷',
    barcelona: '🇪🇸',
    madrid: '🇪🇸',
    porto: '🇵🇹',
    roma: '🇮🇹',
    sangiovanni: '🇮🇹',
    manfredonia: '🇮🇹',
    paris: '🇫🇷',
    amsterdam: '🇳🇱',
    berlim: '🇩🇪',
    hamburgo: '🇩🇪',
    lisboa: '🇵🇹',
    sintra: '🇵🇹',
    coimbra: '🇵🇹',
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

function criarEtiqueta(texto) {
    if (!texto) return null;
    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta-foto';
    etiqueta.textContent = texto;
    return etiqueta;
}

const CORES_ADESIVO = ['rosa', 'amarelo', 'azul', 'verde'];

function criarAdesivoData(data) {
    if (!data) return null;
    const adesivo = document.createElement('span');
    adesivo.className = `adesivo-data adesivo-${CORES_ADESIVO[Math.floor(Math.random() * CORES_ADESIVO.length)]}`;
    adesivo.style.setProperty('--rot-adesivo', `${(Math.random() * 8 - 2).toFixed(1)}deg`);
    adesivo.textContent = data;
    return adesivo;
}

imagens.forEach(img => {
    const wrapper = img.parentElement;
    const bandeira = criarBandeira(img.dataset.categoria);
    if (bandeira) wrapper.appendChild(bandeira);
    const etiqueta = criarEtiqueta(img.dataset.legenda);
    if (etiqueta) wrapper.appendChild(etiqueta);
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
    document.querySelectorAll('.mapa-hub').forEach(hub => {
        hub.classList.toggle('ativo', !!hub.querySelector('.mapa-pin.ativo'));
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

const svgMapa = document.getElementById('mapa-svg');
const wrapperMapa = document.getElementById('mapa-wrapper');

if (svgMapa && wrapperMapa) {
    const hubs = Array.from(wrapperMapa.querySelectorAll('.mapa-hub'));
    const cidadesDoHub = hub => Array.from(hub.querySelectorAll('.mapa-pin'));
    const todasCidades = Array.from(wrapperMapa.querySelectorAll('.mapa-pin'));
    const coord = el => [parseFloat(el.dataset.x), parseFloat(el.dataset.y)];
    const paisDoPin = pin => pin.dataset.pais || pin.closest('.mapa-hub')?.dataset.pais;

    function formasDoPais(id) {
        const el = id && svgMapa.getElementById(id);
        if (!el) return null;
        const partes = el.tagName.toLowerCase() === 'g' ? Array.from(el.querySelectorAll('path')) : [el];
        const principal = el.tagName.toLowerCase() === 'g' ? (el.querySelector('path.mainland') || partes[0]) : el;
        return { partes, principal };
    }

    // o contorno do mapa é simplificado: cidades no litoral podem cair no mar, então puxa para dentro do país
    function puxarParaDentro(pin) {
        const formas = formasDoPais(paisDoPin(pin));
        if (!formas) return;
        const dentro = (x, y) => formas.partes.some(parte => parte.isPointInFill(new DOMPoint(x, y)));
        const folga = 0.35;
        const comFolga = (x, y) => dentro(x, y) && dentro(x + folga, y) && dentro(x - folga, y) && dentro(x, y + folga) && dentro(x, y - folga);
        const bb = formas.principal.getBBox();
        const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
        let [x, y] = coord(pin);
        for (let i = 0; i < 40 && !comFolga(x, y); i++) {
            x += (cx - x) * 0.05;
            y += (cy - y) * 0.05;
        }
        pin.dataset.x = x.toFixed(2);
        pin.dataset.y = y.toFixed(2);
    }

    todasCidades.forEach(puxarParaDentro);

    hubs.forEach(hub => {
        const pontos = cidadesDoHub(hub).map(coord);
        const botao = hub.querySelector('.mapa-hub-botao');
        botao.dataset.x = pontos.reduce((s, p) => s + p[0], 0) / pontos.length;
        botao.dataset.y = pontos.reduce((s, p) => s + p[1], 0) / pontos.length;

        cidadesDoHub(hub).forEach(cidade => {
            const nome = document.createElement('span');
            nome.className = 'mapa-pin-nome';
            nome.textContent = cidade.querySelector('.mapa-pin-preview-label')?.textContent || '';
            cidade.appendChild(nome);
        });
    });

    const posicionaveis = [...todasCidades, ...hubs.map(hub => hub.querySelector('.mapa-hub-botao'))];
    const proporcao = () => (wrapperMapa.clientWidth / wrapperMapa.clientHeight) || 1.6;

    function enquadrar(pontos, folga, larguraMinima) {
        const xs = pontos.map(p => p[0]);
        const ys = pontos.map(p => p[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        let w = Math.max((maxX - minX) * (1 + 2 * folga), larguraMinima);
        let h = (maxY - minY) * (1 + 2 * folga);
        const r = proporcao();
        if (w / h < r) w = h * r; else h = w / r;
        return { x: (minX + maxX) / 2 - w / 2, y: (minY + maxY) / 2 - h / 2, w, h };
    }

    let vbAtual;
    function aplicarViewBox(vb) {
        vbAtual = vb;
        svgMapa.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
        posicionaveis.forEach(el => {
            const [x, y] = coord(el);
            el.style.left = `${((x - vb.x) / vb.w) * 100}%`;
            el.style.top = `${((y - vb.y) / vb.h) * 100}%`;
        });
    }

    let quadroAnimacao;
    function animarPara(vb) {
        cancelAnimationFrame(quadroAnimacao);
        const de = { ...vbAtual };
        const inicio = performance.now();
        const passo = agora => {
            const t = Math.min((agora - inicio) / 650, 1);
            const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            aplicarViewBox({
                x: de.x + (vb.x - de.x) * e,
                y: de.y + (vb.y - de.y) * e,
                w: de.w + (vb.w - de.w) * e,
                h: de.h + (vb.h - de.h) * e,
            });
            if (t < 1) quadroAnimacao = requestAnimationFrame(passo);
        };
        quadroAnimacao = requestAnimationFrame(passo);
    }

    // nome de cada cidade vai para o lado oposto à cidade vizinha mais próxima, para não se sobreporem
    function posicionarNomes(hub, vb) {
        const escala = wrapperMapa.clientWidth / vb.w;
        const cidades = cidadesDoHub(hub);
        cidades.forEach(cidade => {
            const [x, y] = coord(cidade);
            let maisPerto = null;
            cidades.forEach(outra => {
                if (outra === cidade) return;
                const [ox, oy] = coord(outra);
                const d = Math.hypot(ox - x, oy - y) * escala;
                if (!maisPerto || d < maisPerto.d) maisPerto = { d, dx: (ox - x) * escala, dy: (oy - y) * escala };
            });
            let lado = 'abaixo';
            if (maisPerto && maisPerto.d < 90) {
                if (Math.abs(maisPerto.dx) >= Math.abs(maisPerto.dy)) lado = maisPerto.dx > 0 ? 'esq' : 'dir';
                else lado = maisPerto.dy > 0 ? 'acima' : 'abaixo';
            }
            cidade.querySelector('.mapa-pin-nome').className = `mapa-pin-nome mapa-pin-nome-${lado}`;
        });
    }

    const vistaGeral = () => enquadrar(todasCidades.map(coord), 0.12, 0);

    const botaoVoltar = document.createElement('button');
    botaoVoltar.type = 'button';
    botaoVoltar.className = 'mapa-voltar';
    botaoVoltar.textContent = '← Back';
    botaoVoltar.hidden = true;
    wrapperMapa.appendChild(botaoVoltar);

    let hubFocado = null;

    function focar(hub) {
        hubFocado = hub;
        hubs.forEach(h => {
            h.classList.toggle('aberto', h === hub);
            h.querySelector('.mapa-hub-botao').setAttribute('aria-expanded', String(h === hub));
        });
        wrapperMapa.classList.add('em-foco');
        botaoVoltar.hidden = false;
        const pontos = cidadesDoHub(hub).map(coord);
        const forma = formasDoPais(hub.dataset.pais)?.principal.getBBox();
        if (forma) pontos.push([forma.x, forma.y], [forma.x + forma.width, forma.y + forma.height]);
        const alvo = enquadrar(pontos, 0.12, 0);
        afastarCidades(hub, alvo);
        posicionarNomes(hub, alvo);
        animarPara(alvo);
    }

    // cidades muito próximas no zoom ganham um deslocamento visual para cada uma continuar clicável
    function afastarCidades(hub, vb) {
        const distanciaMinima = 26;
        const escala = wrapperMapa.clientWidth / vb.w;
        const cidades = cidadesDoHub(hub);
        const px = cidades.map(c => coord(c).map(v => v * escala));
        const desloc = cidades.map(() => [0, 0]);
        for (let rodada = 0; rodada < 12; rodada++) {
            for (let i = 0; i < cidades.length; i++) {
                for (let j = i + 1; j < cidades.length; j++) {
                    const ax = px[i][0] + desloc[i][0], ay = px[i][1] + desloc[i][1];
                    const bx = px[j][0] + desloc[j][0], by = px[j][1] + desloc[j][1];
                    let dx = bx - ax, dy = by - ay;
                    const d = Math.hypot(dx, dy) || 0.01;
                    if (d >= distanciaMinima) continue;
                    const empurrao = (distanciaMinima - d) / 2;
                    dx /= d; dy /= d;
                    desloc[i][0] -= dx * empurrao; desloc[i][1] -= dy * empurrao;
                    desloc[j][0] += dx * empurrao; desloc[j][1] += dy * empurrao;
                }
            }
        }
        cidades.forEach((c, i) => {
            c.style.setProperty('--ax', `${desloc[i][0].toFixed(1)}px`);
            c.style.setProperty('--ay', `${desloc[i][1].toFixed(1)}px`);
        });
    }

    function voltarParaGeral() {
        if (!hubFocado) return;
        hubFocado = null;
        hubs.forEach(h => {
            h.classList.remove('aberto');
            h.querySelector('.mapa-hub-botao').setAttribute('aria-expanded', 'false');
        });
        wrapperMapa.classList.remove('em-foco');
        botaoVoltar.hidden = true;
        animarPara(vistaGeral());
    }

    hubs.forEach(hub => hub.querySelector('.mapa-hub-botao').addEventListener('click', () => focar(hub)));
    botaoVoltar.addEventListener('click', voltarParaGeral);
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape' && !lightbox?.classList.contains('ativo')) voltarParaGeral();
    });

    aplicarViewBox(vistaGeral());
}

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

function criarPolaroid(img, lista, mostrarEstrela = true, comData = false) {
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

    const etiquetas = document.createElement('div');
    etiquetas.className = 'polaroid-etiquetas';
    const etiqueta = criarEtiqueta(img.dataset.legenda);
    if (etiqueta) etiquetas.appendChild(etiqueta);
    const adesivo = comData ? criarAdesivoData(img.dataset.data) : null;
    if (adesivo) etiquetas.appendChild(adesivo);
    if (etiquetas.childElementCount) polaroid.appendChild(etiquetas);

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
    recentes.forEach(img => carrosselRecentes.appendChild(
        criarPolaroid(img, recentes, false, true)
    ));
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

// rodadas (capa de cima de todos antes da 2ª/3ª) e álbuns menores primeiro, para garantir capa única a cada um
function escolherCapasSemRepetir(pilhas) {
    const usadas = new Set();
    const candidatos = pilhas
        .map(pilha => ({ pilha, fotos: embaralhar([...fotosDoAlbum(pilha)]), capas: [] }))
        .filter(album => album.fotos.length > 0)
        .sort((a, b) => a.fotos.length - b.fotos.length);

    for (let rodada = 0; rodada < 3; rodada++) {
        candidatos.forEach(album => {
            const livre = album.fotos.find(foto => !usadas.has(foto));
            if (!livre) return;
            usadas.add(livre);
            album.capas.push(livre);
        });
    }

    candidatos.forEach(album => {
        if (album.capas.length === 0) album.capas.push(album.fotos[0]);
    });

    return new Map(candidatos.map(album => [album.pilha, album.capas]));
}

const pilhasAlbum = Array.from(document.querySelectorAll('.album-pilha'));
const capasPorPilha = escolherCapasSemRepetir(pilhasAlbum);

pilhasAlbum.forEach(pilha => {
    const elementoParaEsconder = pilha.closest('.album-secao') || pilha;
    const fotos = capasPorPilha.get(pilha);

    if (!fotos) {
        elementoParaEsconder.style.display = 'none';
        return;
    }

    elementoParaEsconder.style.display = '';
    const cartoes = Array.from(pilha.querySelectorAll('.album-cartao-cor')).reverse();
    fotos.forEach((foto, i) => {
        if (!cartoes[i]) return;
        cartoes[i].style.backgroundImage = `url(${cloudinaryUrl(foto.dataset.publicId, 400)})`;
    });

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
        const etiqueta = criarEtiqueta(clone.dataset.legenda);
        if (etiqueta) item.appendChild(etiqueta);
        if (clone.dataset.favorita === 'true') item.appendChild(criarEstrela());

        clone.addEventListener('click', () => abrirLightbox(clone, clones));
        galeriaEl.appendChild(item);
    });
});

document.querySelectorAll('.album-grupo').forEach(grupo => {
    const temAlbumVisivel = Array.from(grupo.children).some(secao => secao.style.display !== 'none');
    if (temAlbumVisivel) return;

    grupo.style.display = 'none';

    const legenda = grupo.previousElementSibling;
    if (legenda && legenda.classList.contains('filtros-legenda')) {
        legenda.style.display = 'none';
    }

    const divisor = grupo.nextElementSibling;
    if (divisor && divisor.classList.contains('album-divisor')) {
        divisor.style.display = 'none';
    }
});
