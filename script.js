// URL base de tu backend (Spring Boot)
const API_URL = 'http://localhost:8080';

//  COMPROBAR CONEXIÓN
async function comprobarConexion() {
    const badge = document.getElementById('conexion');
    const aviso = document.getElementById('aviso');
    try {
        // Hacemos una petición rápida a videojuegos para ver si el backend responde
        const res = await fetch(`${API_URL}/videojuegos`);
        if (res.ok) {
            badge.textContent = 'Conectado';
            badge.className = 'badge bg-success';
            aviso.style.display = 'none'; // Ocultamos la alerta de error
        } else {
            throw new Error();
        }
    } catch (e) {
        badge.textContent = 'Backend apagado';
        badge.className = 'badge bg-danger';
        aviso.textContent = 'Error: No se puede conectar con Spring Boot. Comprueba el puerto 8080.';
        aviso.className = 'alert alert-danger mb-4';
    }
}


// VIDEOJUEGOS

// GET /videojuegos: Cargar tabla y rellenar desplegables de filtros y creación
async function cargarVideojuegos() {
    try {
        const res = await fetch(`${API_URL}/videojuegos`);
        const videojuegos = await res.json();
        
        const cuerpo = document.getElementById('cuerpoJuegos');
        const selectTorneo = document.getElementById('tVideojuego');
        const filtroJuego = document.getElementById('filtroJuego');
        
        // Limpiamos los contenedores antes de rellenarlos
        cuerpo.innerHTML = '';
        selectTorneo.innerHTML = '<option value="">-- Selecciona --</option>';
        filtroJuego.innerHTML = '<option value="">Todos los videojuegos</option>';

        videojuegos.forEach(juego => {
            // Pintamos la fila en la tabla (sin la plataforma, que ya no existe)
            cuerpo.innerHTML += `
                <tr>
                    <td>${juego.id}</td>
                    <td>${juego.nombre}</td>
                    <td>${juego.genero}</td>
                </tr>
            `;
            // Añadimos el juego a los selectores de otras pestañas
            selectTorneo.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
            filtroJuego.innerHTML += `<option value="${juego.id}">${juego.nombre}</option>`;
        });
    } catch (e) { console.error("Error al cargar videojuegos", e); }
}

// POST /videojuegos: Crear un videojuego nuevo
document.getElementById('formJuego').addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
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
        document.getElementById('formJuego').reset(); // Limpia el formulario
        cargarVideojuegos(); // Recarga la tabla para ver el nuevo juego
        alert("Videojuego creado con éxito");
    }
});

// GET /videojuegos/{id}: Buscar un videojuego concreto por ID
document.querySelector('#btnBuscarJuego').addEventListener('click', async () => {
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


//  JUGADORES

// GET /jugadores: Cargar la tabla de jugadores y rellenar el desplegable de inscripción
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
                        <!-- Botones de acciones por fila -->
                        <button class="btn btn-sm btn-info btn-ver-torneos" data-id="${j.id}">Torneos</button>
                        <button class="btn btn-sm btn-danger btn-eliminar-jugador" data-id="${j.id}">Eliminar</button>
                    </td>
                </tr>
            `;
            // Añadir al desplegable para apuntar a un torneo
            selectIns.innerHTML += `<option value="${j.id}">${j.nick}</option>`;
        });
    } catch (e) { console.error("Error al cargar jugadores", e); }
}

// POST /jugadores: Crear un jugador nuevo
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
        alert("Jugador creado correctamente");
    }
});

// GET /jugadores/{id}: Buscar jugador por ID
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

// Delegación de eventos para los botones dentro de la tabla de Jugadores
document.getElementById('cuerpoJugadores').addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    // DELETE /jugadores/{id}: Eliminar jugador
    if (e.target.classList.contains('btn-eliminar-jugador')) {
        if(confirm("¿Seguro que quieres eliminar este jugador?")) {
            await fetch(`${API_URL}/jugadores/${id}`, { method: 'DELETE' });
            cargarJugadores();
        }
    }

    // GET /jugadores/{id}/participaciones: Ver en qué torneos está el jugador
    if (e.target.classList.contains('btn-ver-torneos')) {
        const res = await fetch(`${API_URL}/jugadores/${id}/participaciones`);
        if(res.ok) {
            const participaciones = await res.json();
            const panel = document.getElementById('panelTorneosJugador');
            const lista = document.getElementById('listaTorneosJugador');
            
            panel.removeAttribute('hidden'); // Mostramos el panel lateral
            lista.innerHTML = participaciones.length === 0 ? '<p>No participa en ningún torneo.</p>' : '';
            
            // Pintamos cada torneo en el que participa
            participaciones.forEach(p => {
                const nombreTorneo = p.torneo ? p.torneo.nombre : `Torneo ID: ${p.torneo.id}`;
                lista.innerHTML += `<div class="alert alert-secondary">${nombreTorneo} (Puntos: ${p.puntos || 0})</div>`;
            });
        }
    }
});


// TORNEOS Y PARTICIPACIONES

// GET /torneos: Cargar tabla y rellenar el desplegable de inscripciones
async function cargarTorneos() {
    try {
        const res = await fetch(`${API_URL}/torneos`);
        const torneos = await res.json();
        await pintarTablaTorneos(torneos); // Llamamos a la función asíncrona que pinta la tabla

        const selectIns = document.getElementById('insTorneo');
        selectIns.innerHTML = '<option value="">-- Selecciona --</option>';
        torneos.forEach(t => {
            selectIns.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
        });
    } catch (e) { console.error("Error al cargar torneos", e); }
}

// Función asíncrona para pintar la tabla de torneos (incluye consulta a participantes)
async function pintarTablaTorneos(torneos) {
    const cuerpo = document.getElementById('cuerpoTorneos');
    cuerpo.innerHTML = '';
    
    // Usamos for...of para poder usar await y buscar los participantes de cada torneo
    for (const t of torneos) {
        const nombreJuego = t.videojuego ? t.videojuego.nombre : 'Sin juego';
        let nombresJugadores = "Nadie inscrito";
        
        // GET /torneos/{id}/participantes: Recuperar quién está apuntado a este torneo
        try {
            const res = await fetch(`${API_URL}/torneos/${t.id}/participantes`);
            if (res.ok) {
                const participantes = await res.json();
                if (participantes.length > 0) {
                    // Extraemos los nicks y los unimos con comas
                    nombresJugadores = participantes.map(p => p.jugador ? p.jugador.nick : 'Desconocido').join(', ');
                }
            }
        } catch (e) { console.error("Error al cargar participantes del torneo", t.id); }

        cuerpo.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${t.nombre}</td>
                <td>
                    <!-- Select para cambiar el estado al vuelo -->
                    <select class="form-select form-select-sm select-estado" data-id="${t.id}">
                        <option value="ABIERTO" ${t.estado === 'ABIERTO' ? 'selected' : ''}>ABIERTO</option>
                        <option value="EN_CURSO" ${t.estado === 'EN_CURSO' ? 'selected' : ''}>EN_CURSO</option>
                        <option value="FINALIZADO" ${t.estado === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
                    </select>
                </td>
                <td>${nombreJuego}</td>
                <td>${nombresJugadores}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-danger btn-eliminar-torneo" data-id="${t.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }
}

// PUT /torneos/{id}/estado: Se dispara automáticamente al cambiar el select en la tabla
document.getElementById('cuerpoTorneos').addEventListener('change', async (e) => {
    if (e.target.classList.contains('select-estado')) {
        const id = e.target.getAttribute('data-id');
        const nuevoEstado = e.target.value;
        
        const res = await fetch(`${API_URL}/torneos/${id}/estado?estado=${nuevoEstado}`, { 
            method: 'PUT' 
        });
        
        if (!res.ok) {
            alert("Error al cambiar el estado en la base de datos.");
            cargarTorneos(); // Recarga la tabla para restaurar el estado si hubo un error
        }
    }
});

// Delegación de eventos para la tabla Torneos (Eliminar)
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
});

// POST /torneos: Crear un torneo nuevo
document.getElementById('formTorneo').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nuevo = {
        nombre: document.getElementById('tNombre').value,
        estado: document.getElementById('tEstado').value,
        // JPA requiere que enviemos la relación como un objeto con su ID
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
        alert("Torneo creado");
    } else {
        alert("Error al crear el torneo. Revisa los datos.");
    }
});

// GET /torneos (Filtros Avanzados)
document.getElementById('btnFiltrarTorneos').addEventListener('click', async () => {
    const estado = document.getElementById('filtroEstado').value;
    const juegoId = document.getElementById('filtroJuego').value;
    
    let url = `${API_URL}/torneos`;

    // Montamos la URL dependiendo de qué filtros haya seleccionado el usuario
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
        await pintarTablaTorneos(filtrados); // Repintamos la tabla con los resultados
    }
});

// POST /participaciones: Inscribir un jugador en un torneo
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
        cargarTorneos(); // Recargamos la tabla de torneos para que aparezca el nombre en la columna
        alert("Jugador inscrito correctamente");
    }
});


//  INICIALIZACIÓN
// Esto arranca todas las peticiones cuando el HTML termina de cargar
document.addEventListener('DOMContentLoaded', () => {
    comprobarConexion();
    cargarVideojuegos();
    cargarJugadores();
    cargarTorneos();
});