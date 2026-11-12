const API_URL = 'http://localhost:8080'; // Cambia esto si tu API usa '/api' al final

// Función para comprobar si el servidor de Spring Boot está encendido
async function comprobarConexion() {
    const badge = document.getElementById('conexion');
    const aviso = document.getElementById('aviso');
    try {
        // Hacemos un ping a videojuegos para ver si responde
        const res = await fetch(`${API_URL}/videojuegos`);
        if (res.ok) {
            badge.textContent = 'Conectado';
            badge.className = 'badge bg-success';
            aviso.style.display = 'none'; // Ocultamos el aviso si todo va bien
        } else {
            throw new Error();
        }
    } catch (e) {
        badge.textContent = 'Backend apagado';
        badge.className = 'badge bg-danger';
        aviso.textContent = 'Error: No se puede conectar con Spring Boot. Comprueba CORS y el puerto 8080.';
        aviso.className = 'alert alert-danger mb-4';
    }
}



//  VIDEOJUEGOS

// GET /videojuegos: Cargar tabla y rellenar desplegables
async function cargarVideojuegos() {
    try {
        const res = await fetch(`${API_URL}/videojuegos`);
        const videojuegos = await res.json();
        
        const cuerpo = document.getElementById('cuerpoJuegos');
        const selectTorneo = document.getElementById('tVideojuego');
        const filtroJuego = document.getElementById('filtroJuego');
        
        // Limpiamos todo antes de rellenar
        cuerpo.innerHTML = '';
        selectTorneo.innerHTML = '<option value="">-- Selecciona --</option>';
        filtroJuego.innerHTML = '<option value="">Todos los videojuegos</option>';

        videojuegos.forEach(juego => {
            // Pintar fila en la tabla
            cuerpo.innerHTML += `
                <tr>
                    <td>${juego.id}</td>
                    <td>${juego.nombre}</td>
                    <td>${juego.genero}</td>
                    <td>${juego.plataforma || ''}</td>
                </tr>
            `;
            // Añadir al desplegable de "Crear Torneo"
            selectTorneo.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
            // Añadir al desplegable de "Filtros"
            filtroJuego.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
        });
    } catch (e) { console.error("Error al cargar videojuegos", e); }
}

// POST /videojuegos: Crear nuevo
document.getElementById('formJuego').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById('juegoTitulo').value,
        genero: document.getElementById('juegoGenero').value,
        plataforma: document.getElementById('juegoPlataforma').value
    };

    const res = await fetch(`${API_URL}/videojuegos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        document.getElementById('formJuego').reset();
        cargarVideojuegos(); // Recargar tabla
        alert("Videojuego creado con éxito");
    }
});

// GET /videojuegos/{id}: Buscar por ID
document.querySelector('#panel-videojuegos .btn-primary').addEventListener('click', async () => {
    const id = document.getElementById('buscarJuegoId').value;
    if (!id) return;
    const res = await fetch(`${API_URL}/videojuegos/${id}`);
    const cajaRes = document.getElementById('resJuego');
    if (res.ok) {
        const j = await res.json();
        cajaRes.innerHTML = `<div class="alert alert-success">Encontrado: ${j.nombre} (${j.genero})</div>`;
    } else {
        cajaRes.innerHTML = `<div class="alert alert-danger">Videojuego no encontrado</div>`;
    }
});



// JUGADORES

// GET /jugadores: Cargar tabla y rellenar desplegable de inscripción
async function cargarJugadores() {
    try {
        const res = await fetch(`${API_URL}/jugadores`);
        const jugadores = await res.json();
        
        const cuerpo = document.getElementById('cuerpoJugadores');
        const selectIns = document.getElementById('insJugador');
        
        cuerpo.innerHTML = '';
        selectIns.innerHTML = '<option value="">-- Selecciona --</option>';

        jugadores.forEach(j => {
            cuerpo.innerHTML += `
                <tr>
                    <td>${j.id}</td>
                    <td>${j.nick}</td>
                    <td>${j.email}</td>
                    <td>${j.nivel}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-info btn-ver-torneos" data-id="${j.id}">Torneos</button>
                        <button class="btn btn-sm btn-danger btn-eliminar-jugador" data-id="${j.id}">Eliminar</button>
                    </td>
                </tr>
            `;
            selectIns.innerHTML += `<option value="${j.id}">${j.nick}</option>`;
        });
    } catch (e) { console.error("Error al cargar jugadores", e); }
}

// POST /jugadores: Crear nuevo
document.getElementById('formJugador').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nick: document.getElementById('jNick').value,
        email: document.getElementById('jEmail').value,
        nivel: parseInt(document.getElementById('jNivel').value)
    };

    const res = await fetch(`${API_URL}/jugadores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        document.getElementById('formJugador').reset();
        cargarJugadores();
        alert("Jugador creado");
    }
});

// GET /jugadores/{id}: Buscar por ID
document.getElementById('btnBuscarJugador').addEventListener('click', async () => {
    const id = document.getElementById('buscarJugadorId').value;
    if (!id) return;
    const res = await fetch(`${API_URL}/jugadores/${id}`);
    const cajaRes = document.getElementById('resJugador');
    if (res.ok) {
        const j = await res.json();
        cajaRes.innerHTML = `<div class="alert alert-success">Encontrado: ${j.nick} (Nivel ${j.nivel})</div>`;
    } else {
        cajaRes.innerHTML = `<div class="alert alert-danger">Jugador no encontrado</div>`;
    }
});

// Eventos de la tabla Jugadores (Eliminar y Ver Torneos)
document.getElementById('cuerpoJugadores').addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    // DELETE /jugadores/{id}
    if (e.target.classList.contains('btn-eliminar-jugador')) {
        if(confirm("¿Seguro que quieres eliminar este jugador?")) {
            await fetch(`${API_URL}/jugadores/${id}`, { method: 'DELETE' });
            cargarJugadores();
        }
    }

    // GET /jugadores/{id}/participaciones
    if (e.target.classList.contains('btn-ver-torneos')) {
        const res = await fetch(`${API_URL}/jugadores/${id}/participaciones`);
        if(res.ok) {
            const participaciones = await res.json();
            const panel = document.getElementById('panelTorneosJugador');
            const lista = document.getElementById('listaTorneosJugador');
            
            panel.removeAttribute('hidden');
            lista.innerHTML = participaciones.length === 0 ? '<p>No participa en nada.</p>' : '';
            
            participaciones.forEach(p => {
                lista.innerHTML += `<div class="alert alert-secondary">Torneo ID: ${p.torneo.id} - Puntos: ${p.puntos || 0}</div>`;
            });
        }
    }
});



// TORNEOS Y PARTICIPACIONES

// GET /torneos: Cargar tabla y rellenar desplegable
async function cargarTorneos() {
    try {
        const res = await fetch(`${API_URL}/torneos`);
        const torneos = await res.json();
        pintarTablaTorneos(torneos);

        const selectIns = document.getElementById('insTorneo');
        selectIns.innerHTML = '<option value="">-- Selecciona --</option>';
        torneos.forEach(t => {
            selectIns.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
        });
    } catch (e) { console.error("Error al cargar torneos", e); }
}

// Función auxiliar para pintar la tabla de torneos (se usa también en los filtros)
function pintarTablaTorneos(torneos) {
    const cuerpo = document.getElementById('cuerpoTorneos');
    cuerpo.innerHTML = '';
    torneos.forEach(t => {
        // En Spring, t.videojuego suele venir como objeto completo
        const nombreJuego = t.videojuego ? t.videojuego.nombre : 'Sin juego';
        cuerpo.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${t.nombre}</td>
                <td>${t.estado}</td>
                <td>${nombreJuego}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-info btn-ver-participantes" data-id="${t.id}">Participantes</button>
                    <button class="btn btn-sm btn-danger btn-eliminar-torneo" data-id="${t.id}">Eliminar</button>
                </td>
            </tr>
        `;
    });
}

// POST /torneos: Crear nuevo
document.getElementById('formTorneo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById('tNombre').value,
        estado: document.getElementById('tEstado').value,
        videojuegoId: parseInt(document.getElementById('tVideojuego').value) // Mandando solo el ID directo
    };

    const res = await fetch(`${API_URL}/torneos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevo)
    });

    if (res.ok) {
        document.getElementById('formTorneo').reset();
        cargarTorneos();
        alert("Torneo creado");
    }
});

// GET /torneos (Filtros Avanzados combinados)
document.getElementById('btnFiltrarTorneos').addEventListener('click', async () => {
    const estado = document.getElementById('filtroEstado').value;
    const juegoId = document.getElementById('filtroJuego').value;
    
    let url = `${API_URL}/torneos`;

    // Lógica para montar las rutas de consultas derivadas obligatorias del PDF
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
        pintarTablaTorneos(filtrados);
    }
});

// POST /participaciones: Inscribir Jugador
document.getElementById('formInscripcion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevaInscripcion = {
        jugador: { id: parseInt(document.getElementById('insJugador').value) },
        torneo: { id: parseInt(document.getElementById('insTorneo').value) },
        puntos: 0,
        posicion: 0
    };

    const res = await fetch(`${API_URL}/participaciones`, { // O la ruta que hayas puesto para inscripciones
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaInscripcion)
    });

    if (res.ok) {
        document.getElementById('formInscripcion').reset();
        alert("Jugador inscrito correctamente");
    }
});

// Eventos de la tabla Torneos (Eliminar y Ver Participantes)
document.getElementById('cuerpoTorneos').addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    // DELETE /torneos/{id}
    if (e.target.classList.contains('btn-eliminar-torneo')) {
        if(confirm("¿Seguro que quieres eliminar este torneo?")) {
            await fetch(`${API_URL}/torneos/${id}`, { method: 'DELETE' });
            cargarTorneos();
        }
    }

    // GET /torneos/{id}/participantes
    if (e.target.classList.contains('btn-ver-participantes')) {
        const res = await fetch(`${API_URL}/torneos/${id}/participantes`);
        if(res.ok) {
            const participantes = await res.json();
            const panel = document.getElementById('panelParticipantesTorneo');
            const lista = document.getElementById('listaParticipantesTorneo');
            
            panel.removeAttribute('hidden');
            lista.innerHTML = participantes.length === 0 ? '<p>Sin participantes.</p>' : '';
            
            participantes.forEach(p => {
                // p puede ser la Participación entera o solo el Jugador, depende de tu backend.
                // Asumo que devuelve entidades "Participacion" que tienen dentro a "jugador".
                const nombreJugador = p.jugador ? p.jugador.nick : 'Desconocido';
                lista.innerHTML += `<div class="alert alert-secondary">Jugador: ${nombreJugador}</div>`;
            });
        }
    }
});


// INICIALIZACIÓN
// Esto arranca todas las tablas nada más abrir el HTML
document.addEventListener('DOMContentLoaded', () => {
    comprobarConexion();
    cargarVideojuegos();
    cargarJugadores();
    cargarTorneos();
});