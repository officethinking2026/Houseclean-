// =====================================
// HOUSECLEAN!!! v2.0 — FUNCIONAL COMPLETO
// =====================================

// ===== DATOS INICIALES =====
const DATOS_DEFAULT = {
  familia: [
    {id:1, nombre:"Administrador", avatar:"👑", rol:"Admin", puntos:0, tareas:0, dinero:0},
    {id:2, nombre:"Mamá", avatar:"👩", rol:"Madre", puntos:0, tareas:0, dinero:0},
    {id:3, nombre:"Papá", avatar:"👨", rol:"Padre", puntos:0, tareas:0, dinero:0},
    {id:4, nombre:"Hijo", avatar:"👦", rol:"Hijo", puntos:0, tareas:0, dinero:0},
  ],
  tareas: [
    {id:1, nombre:"Ordenar habitación", puntos:10, dinero:500, asignado:2, fecha:"", completada:false, completadaPor:null},
    {id:2, nombre:"Lavar los platos", puntos:8, dinero:300, asignado:3, fecha:"", completada:false, completadaPor:null},
    {id:3, nombre:"Sacar la basura", puntos:5, dinero:200, asignado:4, fecha:"", completada:false, completadaPor:null},
  ],
  mensajes: [
    {id:1, usuarioId:2, texto:"¡Hola familia! 🏡", hora: new Date(Date.now()-3600000).toISOString()},
    {id:2, usuarioId:3, texto:"¡Buenos días a todos! ☀️", hora: new Date(Date.now()-1800000).toISOString()},
  ],
  eventos: [
    {id:1, titulo:"Limpieza general", fecha: hoyStr(), desc:"Limpieza semanal del hogar"},
  ],
  recompensas: [
    {id:1, nombre:"Pago semanal", monto:2000, miembroId:2, pagado:false},
  ],
  actividad: [
    "🏡 HouseClean!!! iniciado.",
    "👨 Administrador conectado."
  ],
  perfilActivo: 1,
  nextId: {familia:5, tareas:4, mensajes:3, eventos:2, recompensas:2}
};

function hoyStr(){
  const h=new Date();
  return h.toISOString().split('T')[0];
}

// ===== ESTADO =====
let DB = cargarDB();
let calFecha = new Date();
let calDiaSeleccionado = null;
let tareaEditandoId = null;
let miembroDetalleId = null;
let filtroTareaActual = 'todas';

function cargarDB(){
  try{
    const raw = localStorage.getItem('houseclean_v2');
    return raw ? JSON.parse(raw) : clonar(DATOS_DEFAULT);
  }catch(e){return clonar(DATOS_DEFAULT);}
}

function guardarDB(){
  localStorage.setItem('houseclean_v2', JSON.stringify(DB));
}

function clonar(obj){return JSON.parse(JSON.stringify(obj));}

function getMiembro(id){return DB.familia.find(m=>m.id===id);}
function getMiembroActivo(){return getMiembro(DB.perfilActivo);}

// ===== NAVEGACIÓN =====
function navegar(pagina){
  document.querySelectorAll('.pagina').forEach(p=>p.classList.remove('activa'));
  document.querySelectorAll('nav button').forEach(b=>b.classList.remove('nav-activo'));
  document.getElementById('pag-'+pagina)?.classList.add('activa');
  document.getElementById('nav-'+pagina)?.classList.add('nav-activo');

  if(pagina==='inicio') renderInicio();
  if(pagina==='tareas') renderTareas();
  if(pagina==='chat') renderChat();
  if(pagina==='ranking') renderRanking();
  if(pagina==='calendario') renderCalendario();
  if(pagina==='recompensas') renderRecompensas();
  if(pagina==='familia') renderFamilia();
  if(pagina==='perfil') renderPerfil();
}

// ===== MODALES =====
function abrirModal(id){document.getElementById(id).classList.remove('oculto');}
function cerrarModal(id){document.getElementById(id).classList.add('oculto');}

// ===== TOAST =====
function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.classList.add('visible');
  setTimeout(()=>t.classList.remove('visible'),2800);
}

// ===== ACTIVIDAD =====
function addActividad(txt){
  DB.actividad.unshift(txt);
  if(DB.actividad.length>20) DB.actividad.pop();
  guardarDB();
}

// ===== RENDER INICIO =====
function renderInicio(){
  const m = getMiembroActivo();
  document.getElementById('saludoNombre').textContent = m ? m.nombre : 'familia';
  document.getElementById('headerNombre').textContent = m ? m.nombre : 'Admin';
  document.getElementById('headerNivel').textContent = m ? getNivel(m.puntos) : '';
  document.getElementById('headerAvatar').textContent = m ? m.avatar : '😊';

  const totalTareas = DB.tareas.filter(t=>t.completada).length;
  const totalPuntos = DB.familia.reduce((s,m)=>s+m.puntos,0);
  const totalPagos = DB.recompensas.filter(r=>r.pagado).reduce((s,r)=>s+r.monto,0);

  document.getElementById('statTareas').textContent = totalTareas;
  document.getElementById('statPuntos').textContent = totalPuntos;
  document.getElementById('statPagos').textContent = '$'+totalPagos.toLocaleString();

  const feed = document.getElementById('feedActividad');
  feed.innerHTML = DB.actividad.map(a=>`<div class="feed-item">${a}</div>`).join('');
}

// ===== TAREAS =====
function renderTareas(){
  const sel = document.getElementById('tareaAsignado');
  sel.innerHTML = DB.familia.map(m=>`<option value="${m.id}">${m.avatar} ${m.nombre}</option>`).join('');

  let lista = DB.tareas;
  if(filtroTareaActual==='pendientes') lista=lista.filter(t=>!t.completada);
  if(filtroTareaActual==='completadas') lista=lista.filter(t=>t.completada);

  document.getElementById('listaTareas').innerHTML = lista.length===0
    ? `<div class="feed-item">No hay tareas en este filtro.</div>`
    : lista.map(t=>{
      const m = getMiembro(t.asignado);
      const mNom = m ? `${m.avatar} ${m.nombre}` : '—';
      const fechaTxt = t.fecha ? ` · Vence: ${t.fecha}` : '';
      return `<div class="tarea-item ${t.completada?'completada':''}">
        <button class="check-btn ${t.completada?'hecho':''}" onclick="toggleTarea(${t.id})">${t.completada?'✓':''}</button>
        <div class="tarea-info">
          <div class="tarea-nombre">${t.nombre}</div>
          <div class="tarea-meta">${mNom}${fechaTxt}</div>
        </div>
        <div class="tarea-pts">+${t.puntos}pts ${t.dinero>0?'· $'+t.dinero:''}</div>
        <div class="tarea-acciones">
          <button class="btn btn-gris btn-sm" onclick="editarTarea(${t.id})">✏️</button>
          <button class="btn btn-rojo btn-sm" onclick="eliminarTarea(${t.id})">🗑</button>
        </div>
      </div>`;
    }).join('');
}

function filtrarTareas(tipo, el){
  filtroTareaActual = tipo;
  document.querySelectorAll('.filtro').forEach(f=>f.classList.remove('activo'));
  el.classList.add('activo');
  renderTareas();
}

function abrirModalTarea(){
  tareaEditandoId = null;
  document.getElementById('modalTareaTitulo').textContent = 'Nueva Tarea';
  document.getElementById('tareaNombre').value='';
  document.getElementById('tareaPuntos').value='10';
  document.getElementById('tareaDinero').value='0';
  document.getElementById('tareaFecha').value='';
  renderTareas(); // actualiza select
  abrirModal('modalTarea');
}

function editarTarea(id){
  const t = DB.tareas.find(x=>x.id===id);
  if(!t) return;
  tareaEditandoId = id;
  document.getElementById('modalTareaTitulo').textContent = 'Editar Tarea';
  document.getElementById('tareaNombre').value = t.nombre;
  document.getElementById('tareaPuntos').value = t.puntos;
  document.getElementById('tareaDinero').value = t.dinero;
  document.getElementById('tareaFecha').value = t.fecha||'';
  const sel = document.getElementById('tareaAsignado');
  sel.innerHTML = DB.familia.map(m=>`<option value="${m.id}" ${m.id===t.asignado?'selected':''}>${m.avatar} ${m.nombre}</option>`).join('');
  abrirModal('modalTarea');
}

function guardarTarea(){
  const nombre = document.getElementById('tareaNombre').value.trim();
  if(!nombre){toast('⚠️ Escribe el nombre de la tarea');return;}
  const puntos = parseInt(document.getElementById('tareaPuntos').value)||10;
  const dinero = parseInt(document.getElementById('tareaDinero').value)||0;
  const asignado = parseInt(document.getElementById('tareaAsignado').value);
  const fecha = document.getElementById('tareaFecha').value;

  if(tareaEditandoId){
    const t = DB.tareas.find(x=>x.id===tareaEditandoId);
    t.nombre=nombre; t.puntos=puntos; t.dinero=dinero; t.asignado=asignado; t.fecha=fecha;
    addActividad(`✏️ Tarea editada: ${nombre}`);
    toast('✅ Tarea actualizada');
  } else {
    DB.tareas.push({id:DB.nextId.tareas++, nombre, puntos, dinero, asignado, fecha, completada:false, completadaPor:null});
    addActividad(`📋 Nueva tarea creada: ${nombre}`);
    toast('✅ Tarea creada');
  }
  guardarDB();
  cerrarModal('modalTarea');
  renderTareas();
}

function eliminarTarea(id){
  DB.tareas = DB.tareas.filter(t=>t.id!==id);
  guardarDB();
  addActividad('🗑 Tarea eliminada');
  toast('🗑 Tarea eliminada');
  renderTareas();
}

function toggleTarea(id){
  const t = DB.tareas.find(x=>x.id===id);
  if(!t) return;
  if(t.completada){
    // desmarcar
    t.completada=false;
    const m = getMiembro(t.asignado);
    if(m){m.puntos=Math.max(0,m.puntos-t.puntos); m.tareas=Math.max(0,m.tareas-1); m.dinero=Math.max(0,m.dinero-t.dinero);}
    addActividad(`↩️ Tarea desmarcada: ${t.nombre}`);
    toast('↩️ Tarea desmarcada');
  } else {
    t.completada=true;
    t.completadaPor=DB.perfilActivo;
    const m = getMiembro(t.asignado);
    if(m){m.puntos+=t.puntos; m.tareas+=1; m.dinero+=t.dinero;}
    addActividad(`✅ Tarea completada: ${t.nombre} por ${m?m.nombre:'?'}`);
    toast(`✅ ¡Tarea completada! +${t.puntos} puntos`);
  }
  guardarDB();
  renderTareas();
}

// ===== NIVELES =====
function getNivel(pts){
  if(pts>=1500) return '👑 Maestro del Hogar';
  if(pts>=700) return '⭐ Experto';
  if(pts>=300) return '🥇 Responsable';
  if(pts>=100) return '🥈 Ayudante';
  return '🌱 Principiante';
}
function getMedalla(pts){
  if(pts>=1500) return '👑';
  if(pts>=700) return '🏆';
  if(pts>=300) return '🥇';
  if(pts>=100) return '🥈';
  return '🌱';
}
function getPtsSiguiente(pts){
  if(pts>=1500) return 1500;
  if(pts>=700) return 1500;
  if(pts>=300) return 700;
  if(pts>=100) return 300;
  return 100;
}

// ===== CHAT =====
function renderChat(){
  // botones de quién escribe
  const contenedor = document.getElementById('chatQuienBtns');
  contenedor.innerHTML = DB.familia.map(m=>
    `<button class="quien-btn ${m.id===DB.perfilActivo?'activo':''}" onclick="setChatQuien(${m.id})">${m.avatar} ${m.nombre}</button>`
  ).join('');
  renderMensajes();
}

function setChatQuien(id){
  DB.perfilActivo = id;
  guardarDB();
  document.querySelectorAll('.quien-btn').forEach(b=>b.classList.remove('activo'));
  event.target.closest('.quien-btn').classList.add('activo');
  renderHeader();
}

function renderHeader(){
  const m = getMiembroActivo();
  if(!m) return;
  document.getElementById('headerAvatar').textContent = m.avatar;
  document.getElementById('headerNombre').textContent = m.nombre;
  document.getElementById('headerNivel').textContent = getNivel(m.puntos);
}

function renderMensajes(){
  const cont = document.getElementById('chatMensajes');
  if(!DB.mensajes.length){
    cont.innerHTML='<div style="text-align:center;color:#888;padding:40px;">No hay mensajes aún. ¡Di hola! 👋</div>';
    return;
  }
  cont.innerHTML = DB.mensajes.map(msg=>{
    const m = getMiembro(msg.usuarioId);
    const esMio = msg.usuarioId===DB.perfilActivo;
    const hora = new Date(msg.hora);
    const horaStr = hora.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
    return `<div class="chat-msg ${esMio?'mio':'otro'}">
      <div class="msg-burbuja">${msg.texto}</div>
      <div class="msg-meta">${m?m.avatar+' '+m.nombre:'?'} · ${horaStr}</div>
    </div>`;
  }).join('');
  cont.scrollTop = cont.scrollHeight;
}

function enviarMensajeChat(){
  const input = document.getElementById('chatInput');
  const texto = input.value.trim();
  if(!texto) return;
  DB.mensajes.push({id:DB.nextId.mensajes++, usuarioId:DB.perfilActivo, texto, hora:new Date().toISOString()});
  addActividad(`💬 Mensaje de ${getMiembroActivo()?.nombre||'?'}`);
  guardarDB();
  input.value='';
  renderMensajes();
}

// ===== RANKING =====
function renderRanking(){
  const ordenado = [...DB.familia].sort((a,b)=>b.puntos-a.puntos);
  document.getElementById('listaRanking').innerHTML = ordenado.map((m,i)=>{
    const pos = i+1;
    const posClass = pos<=3?`pos-${pos}`:'pos-resto';
    const siguiente = getPtsSiguiente(m.puntos);
    const pct = Math.min(100, Math.round((m.puntos/siguiente)*100));
    return `<div class="ranking-item">
      <div class="rank-pos ${posClass}">${pos<=3?['🥇','🥈','🥉'][i]:pos}</div>
      <div class="rank-avatar">${m.avatar}</div>
      <div class="rank-info">
        <div class="rank-nombre">${m.nombre} <span class="badge badge-verde">${getMedalla(m.puntos)}</span></div>
        <div class="rank-nivel">${getNivel(m.puntos)} · ${m.tareas} tareas · $${m.dinero.toLocaleString()} ganados</div>
        <div class="barra-prog"><div class="barra-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="rank-pts"><strong>${m.puntos}</strong><span>puntos</span></div>
    </div>`;
  }).join('');
}

// ===== CALENDARIO =====
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function renderCalendario(){
  const anio=calFecha.getFullYear(), mes=calFecha.getMonth();
  document.getElementById('calTitulo').textContent = `${MESES[mes]} ${anio}`;
  const primerDia = new Date(anio,mes,1).getDay();
  const totalDias = new Date(anio,mes+1,0).getDate();
  const hoy = new Date();

  let html = DIAS.map(d=>`<div class="cal-dia-nombre">${d}</div>`).join('');
  for(let i=0;i<primerDia;i++) html+=`<div class="cal-celda vacio"></div>`;
  for(let d=1;d<=totalDias;d++){
    const dateStr=`${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const esHoy=hoy.getFullYear()===anio&&hoy.getMonth()===mes&&hoy.getDate()===d;
    const tieneEvento=DB.eventos.some(e=>e.fecha===dateStr);
    const esSel=calDiaSeleccionado===dateStr;
    html+=`<div class="cal-celda ${esHoy?'hoy':''} ${esSel?'seleccionado':''} ${tieneEvento?'tiene-evento':''}" onclick="seleccionarDia('${dateStr}')">${d}</div>`;
  }
  document.getElementById('calGrid').innerHTML=html;
  if(calDiaSeleccionado) mostrarEventosDia(calDiaSeleccionado);
}

function cambiarMes(dir){
  calFecha.setMonth(calFecha.getMonth()+dir);
  renderCalendario();
}

function seleccionarDia(dateStr){
  calDiaSeleccionado=dateStr;
  renderCalendario();
  mostrarEventosDia(dateStr);
}

function mostrarEventosDia(dateStr){
  const eventos=DB.eventos.filter(e=>e.fecha===dateStr);
  const [anio,mes,dia]=dateStr.split('-');
  const label=`${dia} de ${MESES[parseInt(mes)-1]} ${anio}`;
  let html=`<h4>📅 ${label}</h4>`;
  if(!eventos.length){
    html+=`<div class="feed-item" style="color:#888;">Sin eventos este día. <button class="btn btn-sm" style="margin-left:10px;" onclick="abrirModalEvento('${dateStr}')">+ Agregar</button></div>`;
  } else {
    html+=eventos.map(e=>`<div class="evento-item">
      <div class="evento-info"><strong>${e.titulo}</strong><span>${e.desc||''}</span></div>
      <button class="btn btn-rojo btn-sm" onclick="eliminarEvento(${e.id})">🗑</button>
    </div>`).join('');
    html+=`<button class="btn btn-sm" style="margin-top:10px;" onclick="abrirModalEvento('${dateStr}')">+ Agregar evento</button>`;
  }
  document.getElementById('eventosDia').innerHTML=html;
}

function abrirModalEvento(fecha=''){
  document.getElementById('eventoTitulo').value='';
  document.getElementById('eventoFecha').value=fecha||calDiaSeleccionado||hoyStr();
  document.getElementById('eventoDesc').value='';
  abrirModal('modalEvento');
}

function guardarEvento(){
  const titulo=document.getElementById('eventoTitulo').value.trim();
  if(!titulo){toast('⚠️ Escribe el título');return;}
  const fecha=document.getElementById('eventoFecha').value||hoyStr();
  const desc=document.getElementById('eventoDesc').value.trim();
  DB.eventos.push({id:DB.nextId.eventos++, titulo, fecha, desc});
  addActividad(`📅 Evento: ${titulo}`);
  guardarDB();
  cerrarModal('modalEvento');
  calDiaSeleccionado=fecha;
  renderCalendario();
  toast('✅ Evento guardado');
}

function eliminarEvento(id){
  DB.eventos=DB.eventos.filter(e=>e.id!==id);
  guardarDB();
  toast('🗑 Evento eliminado');
  if(calDiaSeleccionado) mostrarEventosDia(calDiaSeleccionado);
  renderCalendario();
}

// ===== RECOMPENSAS =====
function renderRecompensas(){
  const sel=document.getElementById('recompMiembro');
  sel.innerHTML=DB.familia.map(m=>`<option value="${m.id}">${m.avatar} ${m.nombre}</option>`).join('');

  const pendiente=DB.recompensas.filter(r=>!r.pagado).reduce((s,r)=>s+r.monto,0);
  const pagado=DB.recompensas.filter(r=>r.pagado).reduce((s,r)=>s+r.monto,0);
  document.getElementById('resumenPagos').innerHTML=`
    <div class="pago-stat"><strong>$${pendiente.toLocaleString()}</strong><span>Pendiente</span></div>
    <div class="pago-stat"><strong>$${pagado.toLocaleString()}</strong><span>Pagado</span></div>
    <div class="pago-stat"><strong>${DB.recompensas.length}</strong><span>Total recompensas</span></div>
  `;
  document.getElementById('listaRecompensas').innerHTML=DB.recompensas.length===0
    ? `<div class="feed-item">No hay recompensas aún.</div>`
    : DB.recompensas.map(r=>{
      const m=getMiembro(r.miembroId);
      return `<div class="recompensa-item">
        <div class="recomp-info">
          <div class="recomp-nombre">${r.nombre}</div>
          <div class="recomp-meta">${m?m.avatar+' '+m.nombre:'?'} · $${r.monto.toLocaleString()}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="recomp-estado ${r.pagado?'estado-pagado':'estado-pendiente'}">${r.pagado?'✅ Pagado':'⏳ Pendiente'}</span>
          ${!r.pagado?`<button class="btn btn-sm btn-amarillo" onclick="pagarRecompensa(${r.id})">Pagar</button>`:''}
          <button class="btn btn-rojo btn-sm" onclick="eliminarRecompensa(${r.id})">🗑</button>
        </div>
      </div>`;
    }).join('');
}

function abrirModalRecompensa(){
  document.getElementById('recompNombre').value='';
  document.getElementById('recompMonto').value='';
  renderRecompensas();
  abrirModal('modalRecompensa');
}

function guardarRecompensa(){
  const nombre=document.getElementById('recompNombre').value.trim();
  if(!nombre){toast('⚠️ Escribe la descripción');return;}
  const monto=parseInt(document.getElementById('recompMonto').value)||0;
  if(!monto){toast('⚠️ Ingresa un monto');return;}
  const miembroId=parseInt(document.getElementById('recompMiembro').value);
  DB.recompensas.push({id:DB.nextId.recompensas++, nombre, monto, miembroId, pagado:false});
  addActividad(`💰 Nueva recompensa: ${nombre}`);
  guardarDB();
  cerrarModal('modalRecompensa');
  renderRecompensas();
  toast('✅ Recompensa registrada');
}

function pagarRecompensa(id){
  const r=DB.recompensas.find(x=>x.id===id);
  if(!r) return;
  r.pagado=true;
  addActividad(`💵 Pago realizado: ${r.nombre} $${r.monto.toLocaleString()}`);
  guardarDB();
  renderRecompensas();
  toast(`💵 ¡Pago registrado! $${r.monto.toLocaleString()}`);
}

function eliminarRecompensa(id){
  DB.recompensas=DB.recompensas.filter(r=>r.id!==id);
  guardarDB();
  renderRecompensas();
  toast('🗑 Recompensa eliminada');
}

// ===== FAMILIA =====
function renderFamilia(){
  document.getElementById('listaFamilia').innerHTML=DB.familia.map(m=>`
    <div class="miembro-card">
      <div class="miembro-avatar">${m.avatar}</div>
      <div class="miembro-nombre">${m.nombre}</div>
      <div class="miembro-nivel">${m.rol} · ${getNivel(m.puntos)}</div>
      <div class="miembro-stats">
        <div class="m-stat"><strong>${m.puntos}</strong><span>puntos</span></div>
        <div class="m-stat"><strong>${m.tareas}</strong><span>tareas</span></div>
        <div class="m-stat"><strong>$${m.dinero.toLocaleString()}</strong><span>ganados</span></div>
      </div>
      <button class="miembro-btn" onclick="verDetalleMiembro(${m.id})">Ver detalles</button>
    </div>`
  ).join('');
}

function abrirModalMiembro(){
  document.getElementById('miembroNombre').value='';
  document.getElementById('miembroAvatar').value='😊';
  document.getElementById('miembroRol').value='';
  abrirModal('modalMiembro');
}

function guardarMiembro(){
  const nombre=document.getElementById('miembroNombre').value.trim();
  if(!nombre){toast('⚠️ Escribe el nombre');return;}
  const avatar=document.getElementById('miembroAvatar').value||'😊';
  const rol=document.getElementById('miembroRol').value.trim()||'Miembro';
  DB.familia.push({id:DB.nextId.familia++, nombre, avatar, rol, puntos:0, tareas:0, dinero:0});
  addActividad(`➕ Nuevo miembro: ${nombre}`);
  guardarDB();
  cerrarModal('modalMiembro');
  renderFamilia();
  toast(`✅ ${nombre} agregado a la familia`);
}

function verDetalleMiembro(id){
  miembroDetalleId=id;
  const m=getMiembro(id);
  if(!m) return;
  const tareasDe=DB.tareas.filter(t=>t.completada&&t.asignado===id);
  document.getElementById('detalleMiembroTitulo').textContent=`${m.avatar} ${m.nombre}`;
  document.getElementById('detalleMiembroContenido').innerHTML=`
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:48px;margin-bottom:8px;">${m.avatar}</div>
      <div style="font-size:18px;font-weight:600;">${m.nombre}</div>
      <div style="color:#aaa;font-size:13px;">${m.rol}</div>
      <div style="font-size:15px;margin-top:8px;">${getNivel(m.puntos)}</div>
    </div>
    <div style="display:flex;justify-content:space-around;margin-bottom:20px;">
      <div style="text-align:center;"><strong style="font-size:24px;color:var(--verde-neon);">${m.puntos}</strong><br><span style="font-size:12px;color:#aaa;">Puntos</span></div>
      <div style="text-align:center;"><strong style="font-size:24px;color:var(--verde-neon);">${m.tareas}</strong><br><span style="font-size:12px;color:#aaa;">Tareas</span></div>
      <div style="text-align:center;"><strong style="font-size:24px;color:var(--verde-neon);">$${m.dinero.toLocaleString()}</strong><br><span style="font-size:12px;color:#aaa;">Ganados</span></div>
    </div>
    <div><strong style="font-size:14px;">Tareas completadas:</strong>
      ${tareasDe.length===0?'<div style="color:#888;font-size:13px;margin-top:8px;">Ninguna aún.</div>':
        tareasDe.map(t=>`<div class="historial-item" style="margin-top:8px;">${t.nombre}<span style="color:var(--verde-neon);">+${t.puntos}pts</span></div>`).join('')}
    </div>`;
  abrirModal('modalDetalleMiembro');
}

function eliminarMiembroActual(){
  if(!miembroDetalleId) return;
  if(DB.familia.length<=1){toast('⚠️ Debe haber al menos un miembro');return;}
  const m=getMiembro(miembroDetalleId);
  DB.familia=DB.familia.filter(x=>x.id!==miembroDetalleId);
  if(DB.perfilActivo===miembroDetalleId) DB.perfilActivo=DB.familia[0].id;
  addActividad(`➖ Miembro eliminado: ${m?.nombre}`);
  guardarDB();
  cerrarModal('modalDetalleMiembro');
  renderFamilia();
  toast('🗑 Miembro eliminado');
}

// ===== PERFIL =====
function renderPerfil(){
  const m=getMiembroActivo();
  if(!m) return;
  document.getElementById('perfilAvatar').textContent=m.avatar;
  document.getElementById('perfilNombre').textContent=m.nombre;
  document.getElementById('perfilNivel').textContent=getNivel(m.puntos);
  document.getElementById('perfilPuntos').textContent=m.puntos;
  document.getElementById('perfilTareas').textContent=m.tareas;
  document.getElementById('perfilDinero').textContent='$'+m.dinero.toLocaleString();
  renderHeader();

  const tareasDe=DB.tareas.filter(t=>t.completada&&t.asignado===m.id);
  document.getElementById('perfilHistorial').innerHTML=tareasDe.length===0
    ? `<div class="feed-item" style="color:#888;">Aún no has completado tareas.</div>`
    : tareasDe.map(t=>`<div class="historial-item">${t.nombre}<span style="color:var(--verde-neon);">+${t.puntos}pts</span></div>`).join('');

  document.getElementById('perfilSelector').innerHTML=DB.familia.map(mi=>
    `<button class="quien-btn ${mi.id===DB.perfilActivo?'activo':''}" style="margin:4px;" onclick="cambiarPerfilActivo(${mi.id})">${mi.avatar} ${mi.nombre}</button>`
  ).join('');
}

function cambiarPerfilActivo(id){
  DB.perfilActivo=id;
  guardarDB();
  renderPerfil();
  renderHeader();
  toast(`👤 Perfil: ${getMiembro(id)?.nombre}`);
}

// ===== INIT =====
window.addEventListener('load',()=>{
  renderHeader();
  renderInicio();
});
