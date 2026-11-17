const API_URL = 'http://localhost:8080';

// =========================================================
// UTILIDADES VISUALES (Avisos y Estados)
// =========================================================
function mostrarAviso(mensaje, tipo = 'success') {
    const aviso = document.getElementById('aviso');
    aviso.textContent = mensaje;
    aviso.className = `alert alert-${tipo} mb-4`;
    aviso.style.display = 'block';
    setTimeout(() => {
        aviso.style.display = 'none';
    }, 4000);
}

function renderBadgeEstado(estado) {
    if (estado === 'ABIERTO') {
        return `<span class="estado-pill estado-abierto">● ABIERTO</span>`;
    } else if (estado === 'EN_CURSO') {
        return `<span class="estado-pill estado-en-curso">▲ EN CURSO</span>`;
    } else {
        return `<span class="estado-pill estado-finalizado">■ FINALIZADO</span>`;
    }
}

// Navegación desde los botones de la pantalla Inicio
document.querySelectorAll('.btn-ir-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const tabTrigger = document.querySelector(targetId);
        if (tabTrigger) {
            bootstrap.Tab.getOrCreateInstance(tabTrigger).show();
        }
    });
});

// =========================================================
// COMPROBAR CONEXIÓN CON SPRING BOOT
// =========================================================
async function comprobarConexion() {
    const badge = document.getElementById('conexion');
    const aviso = document.getElementById('aviso');
    try {
        const res = await fetch(`${API_URL}/videojuegos`);
        if (res.ok) {
            badge.textContent = 'API Conectada';
            badge.className = 'badge bg-success';
            aviso.style.display = 'none';
        } else {
            throw new Error();
        }
    } catch (e) {
        badge.textContent = 'Backend desconectado';
        badge.className = 'badge bg-danger';
        aviso.textContent = 'Aviso: El servidor Spring Boot (puerto 8080) no responde. Comprueba que está arrancado en IntelliJ.';
        aviso.className = 'alert alert-warning mb-4';
        aviso.style.display = 'block';
    }
}

// =========================================================
// VIDEOJUEGOS
// =========================================================
async function cargarVideojuegos() {
    try {
        const res = await fetch(`${API_URL}/videojuegos`);
        const videojuegos = await res.json();

        document.getElementById('kpiJuegos').textContent = videojuegos.length;

        const cuerpo = document.getElementById('cuerpoJuegos');
        const selectTorneo = document.getElementById('tVideojuego');
        const filtroJuego = document.getElementById('filtroJuego');

        cuerpo.innerHTML = '';
        selectTorneo.innerHTML = '<option value="">Selecciona un videojuego...</option>';
        filtroJuego.innerHTML = '<option value="">Todos los videojuegos</option>';

        videojuegos.forEach(juego => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${juego.id}</td>
                    <td class="fw-semibold">${juego.nombre}</td>
                    <td><span class="badge bg-light text-dark border">${juego.genero}</span></td>
                    <td class="text-end">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary btn-ficha-juego" data-id="${juego.id}" data-nombre="${juego.nombre}" data-genero="${juego.genero}">Ficha</button>
                            <button class="btn btn-primary btn-torneos-juego" data-id="${juego.id}">Ver torneos</button>
                        </div>
                    </td>
                </tr>
            `;
            selectTorneo.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
            filtroJuego.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
        });
    } catch (e) {
        console.error("Error al cargar videojuegos", e);
    }
}

document.getElementById('formJuego').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById('juegoTitulo').value,
        genero: document.getElementById('juegoGenero').value
    };

    const res = await fetch(`${API_URL}/videojuegos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        document.getElementById('formJuego').reset();
        cargarVideojuegos();
        mostrarAviso('Videojuego registrado correctamente.', 'success');
    }
});

document.getElementById('btnBuscarJuego').addEventListener('click', async () => {
    const id = document.getElementById('buscarJuegoId').value;
    if (!id) return;

    const res = await fetch(`${API_URL}/videojuegos/${id}`);
    const cajaRes = document.getElementById('resJuego');

    if (res.ok) {
        const j = await res.json();
        cajaRes.innerHTML = `<div class="alert alert-success mb-0">Videojuego #${j.id}: <strong>${j.nombre}</strong> — Género: ${j.genero}</div>`;
    } else {
        cajaRes.innerHTML = `<div class="alert alert-danger mb-0">No existe ningún videojuego con ID ${id}</div>`;
    }
});

document.getElementById('cuerpoJuegos').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    if (btn.classList.contains('btn-ficha-juego')) {
        const nombre = btn.getAttribute('data-nombre');
        const genero = btn.getAttribute('data-genero');
        const panel = document.getElementById('panelFichaJuego');
        document.getElementById('tituloFichaJuego').textContent = `Ficha: ${nombre}`;
        document.getElementById('contenidoFichaJuego').innerHTML = `
            <p class="mb-2"><strong>ID en catálogo:</strong> #${id}</p>
            <p class="mb-3"><strong>Género competitivo:</strong> ${genero}</p>
            <button type="button" class="btn btn-sm btn-primary" onclick="irATorneosDeJuego('${id}')">Explorar torneos de ${nombre}</button>
        `;
        panel.removeAttribute('hidden');
    }

    if (btn.classList.contains('btn-torneos-juego')) {
        irATorneosDeJuego(id);
    }
});

async function irATorneosDeJuego(juegoId) {
    bootstrap.Tab.getOrCreateInstance(document.querySelector('#tabTorneos')).show();
    document.getElementById('filtroJuego').value = juegoId;
    document.getElementById('filtroEstado').value = '';
    const res = await fetch(`${API_URL}/torneos/videojuego/${juegoId}`);
    if (res.ok) {
        const filtrados = await res.json();
        await pintarTablaTorneos(filtrados);
    }
}

// =========================================================
// JUGADORES (Alta, Edición, Ficha y Borrado)
// =========================================================
async function cargarJugadores() {
    try {
        const res = await fetch(`${API_URL}/jugadores`);
        const jugadores = await res.json();

        document.getElementById('kpiJugadores').textContent = jugadores.length;

        const cuerpo = document.getElementById('cuerpoJugadores');
        const selectIns = document.getElementById('insJugador');

        cuerpo.innerHTML = '';
        selectIns.innerHTML = '<option value="">Selecciona un jugador...</option>';

        jugadores.forEach(j => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${j.id}</td>
                    <td class="fw-semibold">${j.nick}</td>
                    <td>${j.email}</td>
                    <td><span class="badge bg-primary">Nivel ${j.nivel}</span></td>
                    <td class="text-end">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-ver-torneos" data-id="${j.id}" data-nick="${j.nick}" data-email="${j.email}" data-nivel="${j.nivel}">Ficha / Torneos</button>
                            <button class="btn btn-outline-secondary btn-editar-jugador" data-id="${j.id}" data-nick="${j.nick}" data-email="${j.email}" data-nivel="${j.nivel}">Editar</button>
                            <button class="btn btn-danger btn-eliminar-jugador" data-id="${j.id}">Eliminar</button>
                        </div>
                    </td>
                </tr>
            `;
            selectIns.innerHTML += `<option value="${j.id}">${j.nick}</option>`;
        });
    } catch (e) {
        console.error("Error al cargar jugadores", e);
    }
}

document.getElementById('formJugador').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idEdit = document.getElementById('jIdEdit').value;
    const datosJugador = {
        nick: document.getElementById('jNick').value,
        email: document.getElementById('jEmail').value,
        nivel: parseInt(document.getElementById('jNivel').value)
    };

    const url = idEdit ? `${API_URL}/jugadores/${idEdit}` : `${API_URL}/jugadores`;
    const metodo = idEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosJugador)
    });

    if (res.ok) {
        resetearFormJugador();
        cargarJugadores();
        mostrarAviso(idEdit ? 'Jugador actualizado correctamente.' : 'Jugador dado de alta correctamente.', 'success');
    }
});

function resetearFormJugador() {
    document.getElementById('formJugador').reset();
    document.getElementById('jIdEdit').value = '';
    document.getElementById('tituloFormJugador').textContent = 'Alta de Jugador';
    document.getElementById('btnJugador').textContent = 'Guardar Jugador';
    document.getElementById('btnJugador').className = 'btn btn-success w-100';
    document.getElementById('btnCancelarEdicionJugador').setAttribute('hidden', true);
}

document.getElementById('btnCancelarEdicionJugador').addEventListener('click', resetearFormJugador);

document.getElementById('btnBuscarJugador').addEventListener('click', async () => {
    const id = document.getElementById('buscarJugadorId').value;
    if (!id) return;

    const res = await fetch(`${API_URL}/jugadores/${id}`);
    const cajaRes = document.getElementById('resJugador');

    if (res.ok) {
        const j = await res.json();
        cajaRes.innerHTML = `<div class="alert alert-success mb-0">Jugador #${j.id}: <strong>${j.nick}</strong> (${j.email}) — Nivel ${j.nivel}</div>`;
    } else {
        cajaRes.innerHTML = `<div class="alert alert-danger mb-0">No existe ningún jugador con ID ${id}</div>`;
    }
});

document.getElementById('cuerpoJugadores').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    // 1. Editar jugador
    if (btn.classList.contains('btn-editar-jugador')) {
        document.getElementById('jIdEdit').value = id;
        document.getElementById('jNick').value = btn.getAttribute('data-nick');
        document.getElementById('jEmail').value = btn.getAttribute('data-email');
        document.getElementById('jNivel').value = btn.getAttribute('data-nivel');

        document.getElementById('tituloFormJugador').textContent = `Editando Jugador #${id}`;
        document.getElementById('btnJugador').textContent = 'Actualizar Jugador';
        document.getElementById('btnJugador').className = 'btn btn-primary w-100';
        document.getElementById('btnCancelarEdicionJugador').removeAttribute('hidden');
        document.getElementById('jNick').focus();
    }

    // 2. Eliminar jugador
    if (btn.classList.contains('btn-eliminar-jugador')) {
        if (confirm("¿Seguro que quieres eliminar este jugador?")) {
            await fetch(`${API_URL}/jugadores/${id}`, { method: 'DELETE' });
            cargarJugadores();
            mostrarAviso('Jugador eliminado del sistema.', 'warning');
        }
    }

    // 3. Ver ficha y torneos del jugador
    if (btn.classList.contains('btn-ver-torneos')) {
        const nick = btn.getAttribute('data-nick');
        const email = btn.getAttribute('data-email');
        const nivel = btn.getAttribute('data-nivel');

        const panel = document.getElementById('panelTorneosJugador');
        const infoFicha = document.getElementById('infoFichaJugador');
        const lista = document.getElementById('listaTorneosJugador');

        document.getElementById('tituloTorneosJugador').textContent = `Ficha: ${nick}`;
        infoFicha.innerHTML = `
            <div class="p-2 bg-light rounded border small">
                <strong>ID:</strong> #${id} | <strong>Email:</strong> ${email} | <strong>Nivel:</strong> ${nivel}
            </div>
        `;
        lista.innerHTML = '<p class="text-muted small mb-0">Cargando participaciones...</p>';
        panel.removeAttribute('hidden');

        const rutasPosibles = [
            `${API_URL}/jugadores/${id}/participaciones`,
            `${API_URL}/participaciones/jugador/${id}`,
            `${API_URL}/jugadores/${id}/torneos`
        ];

        let participaciones = null;
        for (const url of rutasPosibles) {
            try {
                const res = await fetch(url);
                if (res.ok) {
                    participaciones = await res.json();
                    break;
                }
            } catch (err) {
                console.error("Error consultando:", url, err);
            }
        }

        if (participaciones === null) {
            lista.innerHTML = '<p class="text-danger small mb-0">No se pudo cargar la lista de torneos (revisa la ruta del Controller).</p>';
        } else if (participaciones.length === 0) {
            lista.innerHTML = '<p class="text-muted small mb-0">No participa en ningún torneo todavía.</p>';
        } else {
            lista.innerHTML = '';
            participaciones.forEach(p => {
                const nombreTorneo = p.torneo ? p.torneo.nombre : (p.nombre || 'Torneo inscrito');
                lista.innerHTML += `<div class="alert alert-light border py-2 mb-2 d-flex justify-content-between"><span>${nombreTorneo}</span><strong>${p.puntos || 0} pts</strong></div>`;
            });
        }
    }
});

// =========================================================
// TORNEOS Y PARTICIPACIONES
// =========================================================
async function cargarTorneos() {
    try {
        const res = await fetch(`${API_URL}/torneos`);
        const torneos = await res.json();

        document.getElementById('kpiTorneos').textContent = torneos.length;
        document.getElementById('kpiAbiertos').textContent = torneos.filter(t => t.estado === 'ABIERTO').length;

        await pintarTablaTorneos(torneos);

        const selectIns = document.getElementById('insTorneo');
        selectIns.innerHTML = '<option value="">Selecciona un torneo...</option>';
        torneos.forEach(t => {
            selectIns.innerHTML += `<option value="${t.id}">${t.nombre} (${t.estado})</option>`;
        });
    } catch (e) {
        console.error("Error al cargar torneos", e);
    }
}

async function pintarTablaTorneos(torneos) {
    const cuerpo = document.getElementById('cuerpoTorneos');
    cuerpo.innerHTML = '';

    if (torneos.length === 0) {
        cuerpo.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">No hay torneos que coincidan con el filtro seleccionado.</td></tr>`;
        return;
    }

    for (const t of torneos) {
        const nombreJuego = t.videojuego ? t.videojuego.nombre : 'Sin juego';
        let participantes = [];

        try {
            const res = await fetch(`${API_URL}/torneos/${t.id}/participantes`);
            if (res.ok) {
                participantes = await res.json();
            }
        } catch (e) {
            console.error("Error al cargar participantes", t.id);
        }

        const resumenInscritos = participantes.length > 0
            ? `${participantes.length} jugador(es)`
            : 'Sin inscritos';

        cuerpo.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td class="fw-semibold">${t.nombre}</td>
                <td>${renderBadgeEstado(t.estado)}</td>
                <td>
                    <select class="form-select form-select-sm select-estado" data-id="${t.id}" aria-label="Cambiar estado">
                        <option value="ABIERTO" ${t.estado === 'ABIERTO' ? 'selected' : ''}>ABIERTO</option>
                        <option value="EN_CURSO" ${t.estado === 'EN_CURSO' ? 'selected' : ''}>EN_CURSO</option>
                        <option value="FINALIZADO" ${t.estado === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
                    </select>
                </td>
                <td>${nombreJuego}</td>
                <td><span class="badge bg-light text-dark border">${resumenInscritos}</span></td>
                <td class="text-end">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-detalle-torneo" data-id="${t.id}" data-nombre="${t.nombre}" data-estado="${t.estado}" data-juego="${nombreJuego}">Detalle</button>
                        <button class="btn btn-danger btn-eliminar-torneo" data-id="${t.id}">Eliminar</button>
                    </div>
                </td>
            </tr>
        `;
    }
}

document.getElementById('cuerpoTorneos').addEventListener('change', async (e) => {
    if (e.target.classList.contains('select-estado')) {
        const id = e.target.getAttribute('data-id');
        const nuevoEstado = e.target.value;

        const res = await fetch(`${API_URL}/torneos/${id}/estado?estado=${nuevoEstado}`, {
            method: 'PUT'
        });

        if (res.ok) {
            cargarTorneos();
            mostrarAviso(`Estado del torneo #${id} actualizado a ${nuevoEstado}.`, 'success');
        } else {
            mostrarAviso('Error al cambiar el estado en la base de datos.', 'danger');
            cargarTorneos();
        }
    }
});

document.getElementById('cuerpoTorneos').addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    if (btn.classList.contains('btn-detalle-torneo')) {
        const nombre = btn.getAttribute('data-nombre');
        const estado = btn.getAttribute('data-estado');
        const juego = btn.getAttribute('data-juego');

        const res = await fetch(`${API_URL}/torneos/${id}/participantes`);
        const participantes = res.ok ? await res.json() : [];

        const panel = document.getElementById('panelParticipantesTorneo');
        document.getElementById('tituloParticipantesTorneo').textContent = `Torneo #${id}: ${nombre}`;
        document.getElementById('subtituloParticipantesTorneo').innerHTML = `Videojuego: <strong>${juego}</strong> | Estado: ${renderBadgeEstado(estado)}`;

        const lista = document.getElementById('listaParticipantesTorneo');
        if (participantes.length === 0) {
            lista.innerHTML = '<p class="text-muted small mb-0">Aún no hay jugadores inscritos en este torneo.</p>';
        } else {
            lista.innerHTML = participantes.map(p => `
                <div class="d-flex justify-content-between align-items-center p-2 mb-2 bg-light rounded border">
                    <span><strong>${p.jugador ? p.jugador.nick : 'Jugador'}</strong></span>
                    <span class="badge bg-secondary">Puntos: ${p.puntos || 0} | Pos: ${p.posicion || '-'}</span>
                </div>
            `).join('');
        }
        panel.removeAttribute('hidden');
    }

    if (btn.classList.contains('btn-eliminar-torneo')) {
        if (confirm("¿Seguro que quieres eliminar este torneo?")) {
            await fetch(`${API_URL}/torneos/${id}`, { method: 'DELETE' });
            cargarTorneos();
            mostrarAviso('Torneo eliminado correctamente.', 'warning');
        }
    }
});

document.getElementById('btnBuscarTorneo').addEventListener('click', async () => {
    const id = document.getElementById('buscarTorneoId').value;
    if (!id) return;

    const res = await fetch(`${API_URL}/torneos/${id}`);
    const cajaRes = document.getElementById('resTorneo');

    if (res.ok) {
        const t = await res.json();
        const juego = t.videojuego ? t.videojuego.nombre : 'Sin juego';
        cajaRes.innerHTML = `<div class="alert alert-success mb-0 d-flex justify-content-between align-items-center"><span>Torneo #${t.id}: <strong>${t.nombre}</strong> (${juego})</span>${renderBadgeEstado(t.estado)}</div>`;
    } else {
        cajaRes.innerHTML = `<div class="alert alert-danger mb-0">No existe ningún torneo con ID ${id}</div>`;
    }
});

document.getElementById('formTorneo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById('tNombre').value,
        estado: document.getElementById('tEstado').value,
        videojuego: { id: parseInt(document.getElementById('tVideojuego').value) }
    };

    const res = await fetch(`${API_URL}/torneos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        document.getElementById('formTorneo').reset();
        cargarTorneos();
        mostrarAviso('Torneo creado y publicado correctamente.', 'success');
    } else {
        mostrarAviso('Error al crear el torneo. Revisa los campos.', 'danger');
    }
});

document.getElementById('btnFiltrarTorneos').addEventListener('click', async () => {
    const estado = document.getElementById('filtroEstado').value;
    const juegoId = document.getElementById('filtroJuego').value;

    let url = `${API_URL}/torneos`;

    if (estado && juegoId) {
        url = `${API_URL}/torneos/videojuego/${juegoId}/estado/${estado}`;
    } else if (estado) {
        url = `${API_URL}/torneos/estado/${estado}`;
    } else if (juegoId) {
        url = `${API_URL}/torneos/videojuego/${juegoId}`;
    }

    const res = await fetch(url);
    if (res.ok) {
        const filtrados = await res.json();
        await pintarTablaTorneos(filtrados);
    }
});

document.getElementById('btnResetFiltros').addEventListener('click', () => {
    document.getElementById('filtroEstado').value = '';
    document.getElementById('filtroJuego').value = '';
    document.getElementById('resTorneo').innerHTML = '';
    cargarTorneos();
});

document.getElementById('formInscripcion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevaInscripcion = {
        jugador: { id: parseInt(document.getElementById('insJugador').value) },
        torneo: { id: parseInt(document.getElementById('insTorneo').value) },
        puntos: 0,
        posicion: 0
    };

    const res = await fetch(`${API_URL}/participaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaInscripcion)
    });

    if (res.ok) {
        document.getElementById('formInscripcion').reset();
        cargarTorneos();
        mostrarAviso('Jugador inscrito en el torneo correctamente.', 'success');
    }
});

// =========================================================
// INICIALIZACIÓN
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    comprobarConexion();
    cargarVideojuegos();
    cargarJugadores();
    cargarTorneos();
});