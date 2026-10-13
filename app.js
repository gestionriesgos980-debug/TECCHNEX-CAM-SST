import {ASPECTS} from "./data/aspects.js";
import {generateHseqWordReport} from "./reportGenerator.js";
const DB="tecchnex_sst_cam01a",VER=2,MODEL_VERSION="CAM-SST-02";let db,current;let setupEditing=false;
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
function openDB(){return new Promise((res,rej)=>{let r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{let d=r.result;if(!d.objectStoreNames.contains("evaluations"))d.createObjectStore("evaluations",{keyPath:"id"});if(!d.objectStoreNames.contains("photos")){let s=d.createObjectStore("photos",{keyPath:"id"});s.createIndex("evaluationId","evaluationId")}};r.onsuccess=()=>{db=r.result;res()};r.onerror=()=>rej(r.error)})}
function req(store,mode,op){return new Promise((res,rej)=>{let st=db.transaction(store,mode).objectStore(store),q=op(st);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
const all=s=>req(s,"readonly",st=>st.getAll()),get=(s,k)=>req(s,"readonly",st=>st.get(k)),put=(s,v)=>req(s,"readwrite",st=>st.put(v)),del=(s,k)=>req(s,"readwrite",st=>st.delete(k));
window.__camSstGetPhoto=get.bind(null,'photos');
const id=p=>p+Date.now()+Math.random().toString(36).slice(2,6);
function blank(){return{modelVersion:MODEL_VERSION,id:id("SST-"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),context:{cliente:"",sede:"",lugar:"",inspector:"",director:"",servicio:"",modalidad:"",expuestos:"",fecha:new Date().toISOString().slice(0,10),obs:""},aspects:Object.fromEntries(ASPECTS.map(a=>[a.id,{aspectId:a.id,rating:"",finding:"",needsManagement:"",danger:"",risk:"",existingControl:"",preliminaryAction:"",responsible:"",dueDate:"",actionStatus:"Pendiente",photos:[],followUp:{status:"Pendiente",date:"",result:"",evidence:[],verificationDate:"",verificationResult:"",verificationEvidence:[]}}]))}}
function normalizeEvaluation(e){const b=blank(),o={...b,...(e||{}),modelVersion:MODEL_VERSION,context:{...b.context,...((e||{}).context||{})},aspects:{...b.aspects}};for(const a of ASPECTS){const x=((e||{}).aspects||{})[a.id]||{};o.aspects[a.id]={...b.aspects[a.id],...x,aspectId:a.id,photos:Array.isArray(x.photos)?x.photos:[],followUp:{...b.aspects[a.id].followUp,...(x.followUp||{}),verificationEvidence:Array.isArray(x.followUp?.verificationEvidence)?x.followUp.verificationEvidence:[]}}}return o}
function go(v){
  if(v==='dashboard')v='home';
  $$('.view').forEach(x=>x.classList.remove('active'));
  const target=$('#'+v);
  if(!target)return;
  target.classList.add('active');

  const contextBar=$('#currentContextBar');
  if(contextBar)contextBar.classList.toggle('context-visible',v==='new');

  if(v==='listView')renderSaved();
  if(v==='library')renderCats();
  if(v==='model')renderModel();
  if(v==='evidenceView')renderEvidence();
  if(v==='hallazgosView')renderHallazgos();
  if(v==='seguimientoView')renderSeguimiento();
  if(v==='rolesView')renderRoles();
  if(v==='home')renderLatestStatus();
  scrollTo(0,0);
}
function start(){
  setupEditing=false;
  $('#setupCliente').value='';
  $('#setupSede').value='';
  $('#setupLugar').value='';
  $('#setupInspector').value='';
  $('#setupFecha').value=new Date().toISOString().slice(0,10);
  $('#setupTipo').value='Inspección HSEQ general';
  go('newSetupView');
}
function renderContextBar(){
  if(!current)return;
  const c=current.context||{};
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value||'—';};
  set('#contextClient',c.cliente||'Sin cliente');
  set('#contextSite',c.sede||'Sin sede');
  set('#contextPlace',c.lugar||'Sin área');
  set('#contextInspector',c.inspector||'Sin inspector');
  set('#contextDate',c.fecha||'—');
}
function bind(){let f=$('#form');Object.entries(current.context).forEach(([k,v])=>{if(f.elements[k])f.elements[k].value=v});$('#general').value=current.general||''}
function read(){let f=$('#form');Object.keys(current.context).forEach(k=>{if(f.elements[k])current.context[k]=f.elements[k].value});current.general=$('#general').value;current.updatedAt=new Date().toISOString()}
async function save(){read();current.modelVersion=MODEL_VERSION;return put('evaluations',current).then(()=>{let s=$('#saveStatus');if(s){s.textContent='Guardado';setTimeout(()=>s.textContent='Listo',1200)}return metrics()})}
function step(n){$$('.steps button').forEach(b=>b.classList.toggle('active',+b.dataset.step===n));$$('.panel').forEach(p=>p.classList.toggle('active',+p.dataset.panel===n));if(n===3)summary()}
function matches(a){let q=($('#search')?.value||'').toLowerCase(),c=$('#cat')?.value||'';return(!q||(a.title+' '+a.category+' '+a.question).toLowerCase().includes(q))&&(!c||a.category===c)}

function aspectIsComplete(a){
  const e=current?.aspects?.[a.id]||{};
  return Boolean(e.rating) || Boolean((e.finding||'').trim()) || (Array.isArray(e.photos)&&e.photos.length>0);
}

function updateFieldProgress(){
  const total=ASPECTS.length;
  const done=ASPECTS.filter(aspectIsComplete).length;
  const pct=total?Math.round(done/total*100):0;
  const text=$('#fieldProgressText');
  const bar=$('#fieldProgressBar');
  if(text)text.textContent=`${done}/${total} aspectos`;
  if(bar)bar.style.width=`${pct}%`;
  const visible=$('#visibleAspectCount');
  if(visible)visible.textContent=`${total} aspectos visibles · ${done} capturados`;
}

function scrollToAspect(id){
  const card=document.querySelector(`.aspect[data-id="${CSS.escape(String(id))}"]`);
  if(card)card.scrollIntoView({behavior:'smooth',block:'center'});
}

function summary(){
  if(!current)return;
  const vals=Object.values(current.aspects||{});
  const rated=vals.filter(v=>v.rating).length;
  const findings=vals.filter(v=>(v.finding||'').trim() || v.rating==='NC').length;
  const nc=vals.filter(v=>v.rating==='NC').length;
  const photos=vals.reduce((n,v)=>n+(Array.isArray(v.photos)?v.photos.length:0),0);
  const complete=rated===ASPECTS.length;
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=String(value);};
  set('#summaryTitle',current.context?.tipoEvaluacion||'Inspección HSEQ general');
  set('#summaryClient',current.context?.cliente||'Sin cliente');
  set('#summarySite',current.context?.sede||'Sin sede');
  set('#summaryAspects',`${rated}/${ASPECTS.length}`);
  set('#summaryFindings',findings);
  set('#summaryPhotos',photos);
  set('#summaryNC',nc);
  set('#summaryState',complete?'Lista para revisión':'En proceso');
}

function renderAspects(){
  const list=$('#list');
  if(!list)return;

  const pendingOnly=$('#pendingOnly')?.checked;
  list.innerHTML='';

  ASPECTS.filter(matches).filter(a=>!pendingOnly || !aspectIsComplete(a)).forEach(a=>{
    let e=current.aspects[a.id]||{
      rating:'',
      finding:'',
      needsManagement:'',
      danger:'',
      risk:'',
      existingControl:'',
      preliminaryAction:'',
      responsible:'',
      dueDate:'',
      actionStatus:'Pendiente',
      photos:[],
      followUp:{status:'Pendiente',date:'',result:'',evidence:[]}
    };
    current.aspects[a.id]=e;

    const d=document.createElement('article');
    const complete=aspectIsComplete(a);
    d.className=`aspect ${complete?'done':'pending'}`;
    d.dataset.id=a.id;

    d.innerHTML=`
      <div class="aspect-head-row">
        <small>ASPECTO ${String(a.id).padStart(2,'0')}</small>
        <h3>${esc(a.title)}</h3>
        <span class="tag">${esc(a.category)}</span>
        <span class="capture-state ${complete?'done':'pending'}">${complete?'✓ Capturado':'Pendiente'}</span>
      </div>
      <p>${esc(a.question)}</p>
      <div class="quick-state"><button type="button" data-quick="C">C</button><button type="button" data-quick="NC">NC</button><button type="button" data-quick="NA">NA</button><span class="quick-hint">Selección rápida</span></div>
      <div class="field-grid">
        <label>Calificación
          <select class="rating">
            <option value="">Seleccionar</option>
            <option value="C">C</option>
            <option value="NC">NC</option>
            <option value="NA">NA</option>
          </select>
        </label>
        <label>Hallazgo / observación
          <textarea class="finding" rows="3" placeholder="Describe lo observado..."></textarea>
        </label>
      </div>
      <div class="capture-strip"><span class="capture-save-status">Guardado local</span><span class="capture-note">La información queda vinculada a este aspecto.</span></div>
      <div class="sst-action-toggle">
        <button type="button" class="field-btn sst-toggle">Gestión SST +</button>
        <span class="sst-attention-note"></span>
      </div>
      <div class="sst-action-panel" hidden>
        <div class="sst-action-grid">
          <label>¿Requiere gestión?
            <select class="needs-management">
              <option value="">Seleccionar</option>
              <option value="SI">Sí</option>
              <option value="NO">No</option>
            </select>
          </label>
          <label>Acción preliminar
            <textarea class="preliminary-action" rows="2" placeholder="Qué se debe hacer..."></textarea>
          </label>
          <label>Responsable
            <input class="responsible" placeholder="Quién debe ejecutar la acción">
          </label>
          <label>Fecha objetivo
            <input class="due-date" type="date">
          </label>
          <label>Estado de la acción
            <select class="action-status">
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Completada">Completada</option>
              <option value="Cerrada">Cerrada</option>
            </select>
          </label>
          <label>Estado del seguimiento
            <select class="follow-status">
              <option value="Pendiente">Pendiente</option>
              <option value="En seguimiento">En seguimiento</option>
              <option value="Verificado">Verificado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </label>
          <label>Resultado / seguimiento
            <textarea class="follow-result" rows="2" placeholder="Resultado del seguimiento..."></textarea>
          </label>
          <div class="verification-block">
            <div class="verification-title">
              <strong>Verificación y cierre</strong>
              <span>Solo se habilita para registrar una verificación formal del resultado.</span>
            </div>
            <div class="verification-grid">
              <label>Fecha de verificación
                <input class="verification-date" type="date">
              </label>
              <label>Resultado de verificación
                <textarea class="verification-result" rows="2" placeholder="Qué se verificó y cuál fue el resultado..."></textarea>
              </label>
            </div>
            <div class="verification-actions">
              <label class="photo-btn">📷 Evidencia de verificación
                <input class="verification-input" type="file" accept="image/*" capture="environment" multiple>
              </label>
              <span class="verification-count">0 evidencias</span>
            </div>
          </div>
        </div>
      </div>
      <div class="photo-actions">
        <label class="photo-btn">📷 Tomar foto
          <input class="photo-input" type="file" accept="image/*" capture="environment" multiple>
        </label>
        <span class="photo-count">${(e.photos||[]).length} ${(e.photos||[]).length===1?'foto':'fotos'}</span>
      </div>
      <div class="thumbs"></div>
      <div class="quick-jump">Aspecto ${a.id} de ${ASPECTS.length}</div>
    `;

    list.appendChild(d);

    const rating=d.querySelector('.rating');
    const finding=d.querySelector('.finding');
    if(rating)rating.value=e.rating||'';
    d.querySelectorAll('[data-quick]').forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.quick===(e.rating||''));
      btn.onclick=async()=>{
        e.rating=btn.dataset.quick;
        d.querySelectorAll('[data-quick]').forEach(x=>x.classList.toggle('active',x.dataset.quick===e.rating));
        if(rating)rating.value=e.rating;
        await save();
        updateFieldProgress();
        d.classList.remove('pending');
        d.classList.add('done');
        const state=d.querySelector('.capture-state');
        if(state){state.textContent='✓ Capturado';state.className='capture-state done';}
      };
    });

    if(finding)finding.value=e.finding||'';

    if(rating)rating.onchange=()=>{
      e.rating=rating.value;
      renderAspects();
      save();
    };
    if(finding)finding.oninput=()=>{
      e.finding=finding.value;
      clearTimeout(window.st);
      window.st=setTimeout(async()=>{
        await save();
        updateFieldProgress();
        if((e.finding||'').trim()){
          d.classList.remove('pending');
          d.classList.add('done');
          const state=d.querySelector('.capture-state');
          if(state){state.textContent='✓ Capturado';state.className='capture-state done';}
        }
      },350);
    };

    
    const sstToggle=d.querySelector('.sst-toggle');
    const sstPanel=d.querySelector('.sst-action-panel');
    const needs=d.querySelector('.needs-management');
    const action=d.querySelector('.preliminary-action');
    const responsible=d.querySelector('.responsible');
    const due=d.querySelector('.due-date');
    const status=d.querySelector('.action-status');
    const followResult=d.querySelector('.follow-result');
    const followStatus=d.querySelector('.follow-status');
    const verificationDate=d.querySelector('.verification-date');
    const verificationResult=d.querySelector('.verification-result');
    const verificationInput=d.querySelector('.verification-input');
    const verificationCount=d.querySelector('.verification-count');

    if(needs)needs.value=e.needsManagement||'';
    if(action)action.value=e.preliminaryAction||'';
    if(responsible)responsible.value=e.responsible||'';
    if(due)due.value=e.dueDate||'';
    if(status)status.value=e.actionStatus||'Pendiente';
    if(followResult)followResult.value=e.followUp?.result||'';
    if(followStatus)followStatus.value=e.followUp?.status||'Pendiente';
    if(verificationDate)verificationDate.value=e.followUp?.verificationDate||'';
    if(verificationResult)verificationResult.value=e.followUp?.verificationResult||'';
    if(verificationCount)verificationCount.textContent=`${Array.isArray(e.followUp?.verificationEvidence)?e.followUp.verificationEvidence.length:0} evidencias`;

    const hasSst=Boolean(e.needsManagement||e.preliminaryAction||e.responsible||e.dueDate||(e.actionStatus&&e.actionStatus!=='Pendiente')||(e.followUp?.result||'').trim());
    e.followUp=e.followUp||{status:'Pendiente',date:'',result:'',evidence:[]};
    if((e.followUp.status==='Pendiente') && ((e.followUp.result||'').trim() || (e.followUp.date||'').trim())){
      e.followUp.status='En seguimiento';
    }
    const hasFinding=Boolean((e.finding||'').trim()) || e.rating==='NC';
    const showSstPanel=hasSst || hasFinding;
    if(sstPanel)sstPanel.hidden=!showSstPanel;
    if(sstToggle){
      sstToggle.textContent=showSstPanel?'Gestión SST −':'Gestión SST +';
      sstToggle.classList.toggle('attention',hasFinding && !hasSst);
    }
    const verificationBlock=d.querySelector('.verification-block');
    if(verificationBlock)verificationBlock.classList.toggle('verification-ready',e.followUp?.status==='Verificado'||e.followUp?.status==='Cerrado');

    const attentionNote=d.querySelector('.sst-attention-note');
    if(attentionNote)attentionNote.textContent=(hasFinding && !hasSst)?'Hallazgo detectado · define una acción para seguimiento.':'';

    if(sstToggle && sstPanel){
      sstToggle.onclick=()=>{
        sstPanel.hidden=!sstPanel.hidden;
        sstToggle.textContent=sstPanel.hidden?'Gestión SST +':'Gestión SST −';
      };
    }

    const sstSave=async()=>{
      const nextFollowStatus=followStatus?followStatus.value||'Pendiente':'Pendiente';
      const previousFollowStatus=e.followUp?.status||'Pendiente';

      if(verificationDate)e.followUp=e.followUp||{status:'Pendiente',date:'',result:'',evidence:[],verificationDate:'',verificationResult:'',verificationEvidence:[]};
      e.followUp=e.followUp||{status:'Pendiente',date:'',result:'',evidence:[],verificationDate:'',verificationResult:'',verificationEvidence:[]};

      if(needs)e.needsManagement=needs.value;
      if(action)e.preliminaryAction=action.value;
      if(responsible)e.responsible=responsible.value;
      if(due)e.dueDate=due.value;
      if(status)e.actionStatus=status.value||'Pendiente';
      if(followResult)e.followUp.result=followResult.value;
      if(followStatus)e.followUp.status=nextFollowStatus;
      if(verificationDate)e.followUp.verificationDate=verificationDate.value;
      if(verificationResult)e.followUp.verificationResult=verificationResult.value;

      const requiresVerification=nextFollowStatus==='Verificado'||nextFollowStatus==='Cerrado';
      const hasVerificationDate=Boolean((e.followUp.verificationDate||'').trim());
      const hasVerificationResult=Boolean((e.followUp.verificationResult||'').trim());

      if(requiresVerification && (!hasVerificationDate || !hasVerificationResult)){
        e.followUp.status=previousFollowStatus;
        if(followStatus)followStatus.value=previousFollowStatus;
        alert('Para marcar la acción como Verificado o Cerrado debes registrar fecha y resultado de verificación.');
        return;
      }

      if(nextFollowStatus==='Cerrado' && previousFollowStatus!=='Verificado' && previousFollowStatus!=='Cerrado' && !hasVerificationResult){
        e.followUp.status=previousFollowStatus;
        if(followStatus)followStatus.value=previousFollowStatus;
        alert('Primero registra la verificación antes de cerrar la acción.');
        return;
      }

      await save();
      updateFieldProgress();

      const hasAnySst=e.needsManagement||e.preliminaryAction||e.responsible||e.dueDate||
        (e.followUp?.result||'').trim()||e.followUp.status!=='Pendiente'||e.actionStatus!=='Pendiente';

      if(hasAnySst){
        d.classList.remove('pending');
        d.classList.add('done');
        const state=d.querySelector('.capture-state');
        if(state){state.textContent='✓ Capturado';state.className='capture-state done';}
      }
    };
    [needs,action,responsible,due,status,followStatus,followResult].filter(Boolean).forEach(el=>{
      el.addEventListener('input',()=>{clearTimeout(window.sstTimer);window.sstTimer=setTimeout(sstSave,400);});
      el.addEventListener('change',sstSave);
    });
    if(verificationInput)verificationInput.onchange=async ev=>{
      e.followUp=e.followUp||{status:'Pendiente',date:'',result:'',evidence:[],verificationDate:'',verificationResult:'',verificationEvidence:[]};
      e.followUp.verificationEvidence=Array.isArray(e.followUp.verificationEvidence)?e.followUp.verificationEvidence:[];
      for(const file of [...ev.target.files]){
        if(!file.type.startsWith('image/'))continue;
        const blob=await compress(file);
        const pid=id('VER-');
        await put('photos',{id:pid,evaluationId:current.id,aspectId:a.id,kind:'verification',createdAt:new Date().toISOString(),name:file.name,blob});
        e.followUp.verificationEvidence.push(pid);
      }
      await save();
      if(verificationCount)verificationCount.textContent=`${e.followUp.verificationEvidence.length} evidencias`;
    };


const input=d.querySelector('.photo-input');
    if(input)input.onchange=async ev=>{
      for(const file of [...ev.target.files]){
        if(!file.type.startsWith('image/'))continue;
        const blob=await compress(file);
        const pid=id('PIC-');
        await put('photos',{id:pid,evaluationId:current.id,aspectId:a.id,createdAt:new Date().toISOString(),name:file.name,blob});
        e.photos.push(pid);
      }
      await save();
      updateFieldProgress();
      d.classList.remove('pending');
      d.classList.add('done');
      const state=d.querySelector('.capture-state');
      if(state){state.textContent='✓ Capturado';state.className='capture-state done';}
      const count=d.querySelector('.photo-count');
      if(count)count.textContent=`${e.photos.length} ${e.photos.length===1?'foto':'fotos'}`;
    };
  });

  updateFieldProgress();
  scrollToAspect(current?._focusAspectId||'');
  current._focusAspectId=null;
}

async function renderSaved(){
  const arr=(await all('evaluations')).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  const q=($('#recordsSearch')?.value||'').trim().toLowerCase();
  const filter=$('#recordsFilter')?.value||'';

  const getInfo=e=>{
    const aspects=Object.values(e.aspects||{});
    const rated=aspects.filter(x=>x.rating).length;
    const findings=aspects.filter(x=>(x.finding||'').trim() || x.rating==='NC').length;
    const managed=aspects.filter(x=>x.needsManagement==='SI' || (x.preliminaryAction||'').trim()).length;
    const photos=aspects.reduce((n,x)=>n+(Array.isArray(x.photos)?x.photos.length:0),0);
    const complete=rated===ASPECTS.length;
    const hay=[e.context?.cliente||'',e.context?.sede||'',e.context?.lugar||'',e.context?.inspector||''].join(' ').toLowerCase();
    return {rated,findings,managed,photos,complete,hay};
  };

  const info=arr.map(e=>({e,...getInfo(e)}));

  $('#recordsTotal').textContent=arr.length;
  $('#recordsFindings').textContent=info.filter(x=>x.findings>0).length;
  $('#recordsManaged').textContent=info.filter(x=>x.managed>0).length;
  $('#recordsPhotos').textContent=info.filter(x=>x.photos>0).length;

  const shown=info.filter(x=>{
    if(q && !x.hay.includes(q)) return false;
    if(filter==='findings' && x.findings===0) return false;
    if(filter==='managed' && x.managed===0) return false;
    if(filter==='photos' && x.photos===0) return false;
    return true;
  });

  const box=$('#saved');
  if(!shown.length){
    box.innerHTML='<article class="card records-empty">No hay registros que coincidan con la búsqueda.</article>';
    return;
  }

  box.innerHTML=shown.map(x=>{
    const e=x.e;
    const when=e.updatedAt?new Date(e.updatedAt).toLocaleString('es-CO',{dateStyle:'short',timeStyle:'short'}):'Sin fecha';
    const status=x.complete?'Lista para revisión':'En proceso';
    const badgeClass=x.complete?'record-status ready':'record-status progress';
    return `<article class="saved record-card">
      <div class="record-main">
        <div class="record-title">
          <b>${esc(e.context?.cliente||'Sin cliente')}</b>
          <span>${esc(e.context?.sede||'Sin sede')}</span>
        </div>
        <div class="record-location">${esc(e.context?.lugar||'Sin lugar')} · ${esc(e.context?.fecha||'Sin fecha')}</div>
        <div class="record-meta-line">
          <span>${esc(e.context?.inspector||'Sin inspector')}</span>
          <span>Actualizado ${esc(when)}</span>
        </div>
        <div class="record-status-row">
          <span class="${badgeClass}">${status}</span>
          <span class="record-progress">${x.rated}/${ASPECTS.length} aspectos</span>
        </div>
        <div class="record-tags">
          <span>${x.findings} hallazgo${x.findings===1?'':'s'}</span>
          <span>${x.managed} gestión SST</span>
          <span>${x.photos} foto${x.photos===1?'':'s'}</span>
        </div>
      </div>
      <div class="record-actions">
        <button class="record-open" data-open="${esc(e.id)}">Abrir</button>
        <button class="record-detail" data-detail="${esc(e.id)}">Detalle</button>
        <button class="record-delete" data-del="${esc(e.id)}">Eliminar</button>
      </div>
    </article>`;
  }).join('');

  box.querySelectorAll('[data-detail]').forEach(btn=>{
    btn.onclick=()=>{
      const e=arr.find(v=>v.id===btn.dataset.detail);
      if(!e)return;
      const card=btn.closest('.saved');
      const existing=card.querySelector('.record-inline-detail');
      if(existing){
        existing.remove();
        btn.textContent='Detalle';
        return;
      }
      const aspects=Object.values(e.aspects||{});
      const rated=aspects.filter(x=>x.rating).length;
      const nc=aspects.filter(x=>x.rating==='NC').length;
      const managed=aspects.filter(x=>x.needsManagement==='SI' || (x.preliminaryAction||'').trim()).length;
      const photos=aspects.reduce((n,x)=>n+(Array.isArray(x.photos)?x.photos.length:0),0);
      const div=document.createElement('div');
      div.className='record-inline-detail';
      div.innerHTML=`<div><b>Aspectos capturados:</b> ${rated}/${ASPECTS.length}</div>
        <div><b>Hallazgos:</b> ${((aspects.filter(x=>(x.finding||'').trim() || x.rating==='NC').length))}</div>
        <div><b>No conformes:</b> ${nc}</div>
        <div><b>Fotografías:</b> ${photos}</div>
        <div><b>Gestión SST:</b> ${managed}</div>
        <div><b>Inspector:</b> ${esc(e.context?.inspector||'No registrado')}</div>
        <div><b>Servicio:</b> ${esc(e.context?.servicio||'No registrado')}</div>`;
      card.appendChild(div);
      btn.textContent='Ocultar';
    };
  });
}

async function openEval(k){current=normalizeEvaluation(await get('evaluations',k));setupEditing=false;bind();renderAspects();renderContextBar();step(1);go('new')}
async function removeEval(k){let e=await get('evaluations',k);for(let a of Object.values(e.aspects||{}))for(let pid of a.photos||[])await del('photos',pid);await del('evaluations',k);renderSaved();metrics()}

async function renderHallazgos(){
  const evals=await all('evaluations');
  const q=($('#findingsSearch')?.value||'').trim().toLowerCase();
  const filter=$('#findingsFilter')?.value||'';
  const rows=[];
  const inspectionSet=new Set();

  for(const e of evals){
    let hasFinding=false;
    for(const [id,a] of Object.entries(e.aspects||{})){
      const text=(a.finding||'').trim();
      const isNC=a.rating==='NC';
      const photos=Array.isArray(a.photos)?a.photos.length:0;
      if(!text && !isNC) continue;
      hasFinding=true;
      inspectionSet.add(e.id);
      const aspect=ASPECTS.find(x=>String(x.id)===String(id));
      const hay=[
        e.context?.cliente||'',e.context?.sede||'',e.context?.lugar||'',
        aspect?.title||'',aspect?.category||'',text
      ].join(' ').toLowerCase();
      if(q && !hay.includes(q)) continue;
      if(filter==='NC' && !isNC) continue;
      if(filter==='photos' && photos===0) continue;
      rows.push({e,a,aspect,photos});
    }
    if(!hasFinding) continue;
  }

  const allRows=[];
  for(const e of evals){
    for(const [id,a] of Object.entries(e.aspects||{})){
      const text=(a.finding||'').trim();
      const isNC=a.rating==='NC';
      const photos=Array.isArray(a.photos)?a.photos.length:0;
      if(text || isNC) allRows.push({e,a,aspect:ASPECTS.find(x=>String(x.id)===String(id)),photos});
    }
  }
  const total=allRows.length;
  const nc=allRows.filter(x=>x.a.rating==='NC').length;
  const photoCount=allRows.filter(x=>x.photos>0).length;
  const inspections=new Set(allRows.map(x=>x.e.id)).size;

  $('#findingsTotal').textContent=total;
  $('#findingsNC').textContent=nc;
  $('#findingsPhotos').textContent=photoCount;
  $('#findingsInspections').textContent=inspections;

  const box=$('#findingsList');
  if(!rows.length){
    box.innerHTML='<article class="card findings-empty">No hay hallazgos que coincidan con la búsqueda.</article>';
    return;
  }

  box.innerHTML=rows.map((x,i)=>{
    const status=x.a.rating==='NC'?'No conforme':'Hallazgo';
    const date=x.e.context?.fecha||'Sin fecha';
    return `<article class="finding-card">
      <div class="finding-accent ${x.a.rating==='NC'?'nc':''}"></div>
      <div class="finding-content">
        <div class="finding-top">
          <div>
            <span class="finding-category">${esc(x.aspect?.category||'Sin categoría')}</span>
            <h3>${esc(x.aspect?.title||'Aspecto')}</h3>
          </div>
          <span class="finding-status ${x.a.rating==='NC'?'nc':''}">${status}</span>
        </div>
        <p>${esc(x.a.finding||'Condición marcada como no conforme.')}</p>
        <div class="finding-meta">
          <span>${esc(x.e.context?.cliente||'Sin cliente')}</span>
          <span>${esc(x.e.context?.sede||'Sin sede')}</span>
          <span>${esc(x.e.context?.lugar||'Sin lugar')}</span>
          <span>${esc(date)}</span>
          <span>${x.photos} ${x.photos===1?'foto':'fotos'}</span>
        </div>
        <div class="finding-actions">
          <button type="button" class="finding-open" data-finding-open="${esc(x.e.id)}">Abrir evaluación</button>
        </div>
      </div>
    </article>`;
  }).join('');

  box.querySelectorAll('[data-finding-open]').forEach(btn=>{
    btn.onclick=()=>openEval(btn.dataset.findingOpen);
  });
}



function normalizeFollowUpState(aspect){
  aspect.followUp=aspect.followUp||{status:'Pendiente',date:'',result:'',evidence:[]};
  const current=aspect.followUp.status||'Pendiente';
  const hasResult=Boolean((aspect.followUp.result||'').trim());
  const hasDate=Boolean((aspect.followUp.date||'').trim());

  // Only resolve the contradiction observed in testing:
  // a real follow-up result/date cannot remain visually "Pendiente".
  if(current==='Pendiente' && (hasResult || hasDate)){
    aspect.followUp.status='En seguimiento';
  }
  return aspect.followUp.status||'Pendiente';
}

async function renderSeguimiento(){
  const evals=await all('evaluations');
  const q=($('#followSearch')?.value||'').trim().toLowerCase();
  const filter=$('#followFilter')?.value||'';
  const rows=[];
  const normalizeWrites=[];

  for(const e of evals){
    for(const [id,a] of Object.entries(e.aspects||{})){
      const followStatus=normalizeFollowUpState(a);
      const followStatusClass=followStatus==='Cerrado'?'closed':(followStatus==='Verificado'?'verified':(followStatus==='En seguimiento'?'progress':'pending'));
      const action=(a.preliminaryAction||'').trim();
      const responsible=(a.responsible||'').trim();
      const dueDate=(a.dueDate||'').trim();
      const actionStatus=(a.actionStatus||'Pendiente').trim()||'Pendiente';
      const hasFollow=Boolean(followStatus && followStatus!=='Pendiente') ||
                      Boolean((a.followUp?.result||'').trim()) ||
                      Boolean((a.followUp?.date||'').trim());
      const hasAction=Boolean(action||responsible||dueDate||hasFollow);
      if(!hasAction) continue;

      const aspect=ASPECTS.find(x=>String(x.id)===String(id));
      const hay=[
        e.context?.cliente||'',e.context?.sede||'',e.context?.lugar||'',
        aspect?.title||'',action,responsible,actionStatus,
        followStatus,a.followUp?.result||''
      ].join(' ').toLowerCase();

      if(q && !hay.includes(q)) continue;
      if(filter && actionStatus!==filter) continue;

      rows.push({
        e,a,aspect,followStatus,action,responsible,dueDate,
        actionStatus,result:a.followUp?.result||'',followStatusClass:followStatusClass
      });

      if(a.followUp?.status==='En seguimiento' && (a.followUp?.result||'').trim()){
        normalizeWrites.push({evaluation:e, aspect:a});
      }
    }
  }

  // Persist only legacy contradictions that were normalized by the rule above.
  for(const item of normalizeWrites){
    await put('evaluations',item.evaluation);
  }

  const allActionRows=[];
  for(const e of evals){
    for(const [id,a] of Object.entries(e.aspects||{})){
      const action=(a.preliminaryAction||'').trim();
      const responsible=(a.responsible||'').trim();
      const dueDate=(a.dueDate||'').trim();
      const actionStatus=(a.actionStatus||'Pendiente').trim()||'Pendiente';
      const followStatus=normalizeFollowUpState(a);
      const hasFollow=Boolean(followStatus && followStatus!=='Pendiente') ||
                      Boolean((a.followUp?.result||'').trim()) ||
                      Boolean((a.followUp?.date||'').trim());
      if(action||responsible||dueDate||hasFollow){
        allActionRows.push({actionStatus});
      }
    }
  }

  const totals=allActionRows.reduce((m,x)=>{
    m.total++;
    if(x.actionStatus.toLowerCase().includes('pend'))m.pending++;
    else if(x.actionStatus.toLowerCase().includes('proceso'))m.progress++;
    else if(x.actionStatus.toLowerCase().includes('complet')||x.actionStatus.toLowerCase().includes('cerr'))m.done++;
    return m;
  },{total:0,pending:0,progress:0,done:0});

  $('#followTotal').textContent=totals.total;
  $('#followPending').textContent=totals.pending;
  $('#followProgress').textContent=totals.progress;
  $('#followDone').textContent=totals.done;

  const sel=$('#followFilter');
  if(sel){
    const current=sel.value;
    const statuses=[...new Set(allActionRows.map(x=>x.actionStatus))]
      .sort((a,b)=>a.localeCompare(b,'es'));
    sel.innerHTML='<option value="">Todos los estados</option>'+
      statuses.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('');
    if(statuses.includes(current))sel.value=current;
  }

  const box=$('#followList');
  if(!rows.length){
    box.innerHTML=`<article class="card follow-empty">
      <strong>${allActionRows.length?'No hay acciones que coincidan con el filtro.':'Todavía no hay acciones registradas.'}</strong>
      <span>${allActionRows.length?'Prueba otra búsqueda o estado.':'Cuando una evaluación tenga una acción, responsable, fecha o seguimiento, aparecerá aquí.'}</span>
    </article>`;
    return;
  }

  box.innerHTML=rows.map(x=>{
    const statusClass=x.actionStatus.toLowerCase().includes('complet')||x.actionStatus.toLowerCase().includes('cerr')
      ? 'done'
      : x.actionStatus.toLowerCase().includes('proceso') ? 'progress' : 'pending';

    return `<article class="follow-card">
      <div class="follow-accent ${statusClass}"></div>
      <div class="follow-content">
        <div class="follow-top">
          <div>
            <span class="follow-category">${esc(x.aspect?.category||'Sin categoría')}</span>
            <h3>${esc(x.action||'Acción pendiente de definir')}</h3>
          </div>
          <span class="follow-status ${statusClass}">${esc(x.actionStatus)}</span>
        </div>

        <div class="follow-context">
          <span>${esc(x.e.context?.cliente||'Sin cliente')}</span>
          <span>${esc(x.e.context?.sede||'Sin sede')}</span>
          <span>${esc(x.aspect?.title||'Aspecto')}</span>
        </div>

        <div class="follow-grid">
          <div><small>Responsable</small><b>${esc(x.responsible||'Pendiente')}</b></div>
          <div><small>Fecha objetivo</small><b>${esc(x.dueDate||'Pendiente')}</b></div>
          <div><small>Estado seguimiento</small><b class="follow-verification ${x.followStatusClass||x.followStatus}">${esc(x.followStatus)}</b></div>
          <div><small>Resultado</small><b>${esc(x.result||'Sin registrar')}</b></div>
        </div>

        <button type="button" class="follow-open" data-follow-open="${esc(x.e.id)}">Abrir evaluación</button>
      </div>
    </article>`;
  }).join('');

  box.querySelectorAll('[data-follow-open]').forEach(btn=>{
    btn.onclick=()=>openEval(btn.dataset.followOpen);
  });
}



async function renderRoles(){
  const evals=await all('evaluations');
  let evaluatedAspects=0;
  let findings=0;
  let photos=0;
  let actionCount=0;
  let actionProgress=0;
  let followProgress=0;

  for(const e of evals){
    for(const a of Object.values(e.aspects||{})){
      if(a.rating || (a.finding||'').trim() || (Array.isArray(a.photos)&&a.photos.length)) evaluatedAspects++;
      if((a.finding||'').trim() || a.rating==='NC') findings++;
      photos += Array.isArray(a.photos) ? a.photos.length : 0;
      if((a.preliminaryAction||'').trim() || (a.responsible||'').trim() || (a.dueDate||'').trim()){
        actionCount++;
        const st=(a.actionStatus||'').toLowerCase();
        if(st.includes('proceso')) actionProgress++;
      }
      const fs=(a.followUp?.status||'').toLowerCase();
      if(fs.includes('seguimiento')) followProgress++;
    }
  }

  const inspector=[evals.length,evaluatedAspects,findings,photos];
  const manager=[findings,actionCount,actionProgress,followProgress];

  document.querySelectorAll('#inspectorMetrics b').forEach((el,i)=>el.textContent=inspector[i]);
  document.querySelectorAll('#managerMetrics b').forEach((el,i)=>el.textContent=manager[i]);

  document.querySelectorAll('[data-role-tab]').forEach(btn=>{
    btn.onclick=()=>{
      const role=btn.dataset.roleTab;
      document.querySelectorAll('[data-role-tab]').forEach(x=>x.classList.toggle('active',x===btn));
      const inspectorPanel=$('#roleInspector');
      const managerPanel=$('#roleManager');
      inspectorPanel.hidden=role!=='inspector';
      managerPanel.hidden=role!=='manager';
      inspectorPanel.classList.toggle('active',role==='inspector');
      managerPanel.classList.toggle('active',role==='manager');
    };
  });
}

function renderCats(){
  const counts={};
  ASPECTS.forEach(a=>counts[a.category]=(counts[a.category]||0)+1);

  const q=($('#librarySearch')?.value||'').trim().toLowerCase();
  const entries=Object.entries(counts)
    .filter(([k])=>!q || k.toLowerCase().includes(q))
    .sort((a,b)=>a[0].localeCompare(b[0],'es'));

  $('#libraryTotal').textContent=`${entries.length} ${entries.length===1?'categoría':'categorías'}`;
  $('#libraryHint').textContent=`${ASPECTS.length} aspectos cargados desde el formato actual.`;

  const box=$('#cats');
  if(!entries.length){
    box.innerHTML='<article class="card library-empty">No hay categorías que coincidan con la búsqueda.</article>';
    return;
  }

  box.innerHTML=entries.map(([k,n])=>`
    <article class="cat interactive" tabindex="0" data-category="${esc(k)}">
      <div class="cat-icon">SST</div>
      <div class="cat-copy">
        <h3>${esc(k)}</h3>
        <span>${n} ${n===1?'aspecto':'aspectos'}</span>
      </div>
      <div class="cat-action">Abrir →</div>
    </article>
  `).join('');

  box.querySelectorAll('[data-category]').forEach(card=>{
    const open=()=>{
      activateCategory(card.dataset.category);
    };
    card.onclick=open;
    card.onkeydown=e=>{
      if(e.key==='Enter'||e.key===' '){
        e.preventDefault();
        open();
      }
    };
  });
}

function renderModel(){const models=[
['CONTEXTO','Identifica dónde y en qué realidad se captura la información.',['cliente','sede / centro','lugar / área','inspector','servicio / actividad'],'Este bloque es compartido con Inspecciones y debe mantenerse simple. Aquí se documenta el entorno antes de entrar al análisis SST.'],
['ASPECTO','Representa el criterio proveniente del formato actual.',['id y categoría','pregunta','calificación','hallazgo / observación'],'La fuente actual ya tiene 50 aspectos. No se reemplazan; se convierten en registros estructurados que pueden crecer cuando el área los valide.'],
['EVIDENCIA','Relaciona fotografías y archivos con el aspecto observado.',['aspecto asociado','fotografía','fecha de captura','referencia local'],'La evidencia debe quedar vinculada desde campo. Esto ataca directamente el problema de tener que regresar a la oficina para ajustar las fotografías.'],
['GESTIÓN SST','Capa opcional que se activa cuando el aspecto requiere gestión.',['peligro relacionado','riesgo / condición','control existente','acción preliminar'],'Es la diferencia principal frente a una inspección simple. Por ahora es estructura, no metodología cerrada.'],
['ACCIÓN','Convierte el hallazgo en una tarea gestionable.',['responsable','fecha objetivo','estado'],'La acción debe poder seguirse sin volver a crear el hallazgo. Esto prepara el paso hacia planes y seguimiento.'],
['SEGUIMIENTO','Permite comprobar qué pasó con la acción.',['estado de seguimiento','fecha','resultado','evidencia futura'],'Separamos seguimiento de acción para poder documentar implementación, verificación y resultados posteriormente.'],
['CONFIGURACIÓN','Queda abierta para recibir la metodología real del área.',['escalas','criterios','fórmulas','priorización','reglas del informe'],'Este bloque no se inventa. Se parametrizará cuando tengamos la información y validación del área SST.']
];
$('#modelCards').innerHTML=models.map((m,i)=>'<article class="model-card interactive" tabindex="0" data-model-card="'+i+'"><h3>'+esc(m[0])+'</h3><p>'+esc(m[1])+'</p><ul class="field-list">'+m[2].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul><div class="model-detail"><div><p>'+esc(m[3])+'</p><ul>'+m[2].map(x=>'<li>Dato preparado: '+esc(x)+'</li>').join('')+'</ul></div></div></article>').join('')}
function toggleInfoCard(card){card.classList.toggle('active')}
function toggleModelCard(card){card.classList.toggle('active')}
function activateCategory(category){$('#cat').value=category;go('new');renderAspects();step(2);}
function wireCardInteractions(){
  $$('.metric-card').forEach(c=>{
    const act=()=>{
      const m=c.dataset.metric;
      if(m==='evaluations')go('listView');
      else if(m==='photos'){go('evidenceView');renderEvidence();}
      else go('library');
    };
    c.onclick=act;
    c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}};
  });
}

async function renderEvidence(){
  const [evals, photos] = await Promise.all([all('evaluations'), all('photos')]);
  const byId = Object.fromEntries(evals.map(e=>[e.id,e]));
  const q = ($('#evidenceSearch')?.value || '').trim().toLowerCase();
  const category = $('#evidenceCategory')?.value || '';

  const cats = [...new Set(ASPECTS.map(a=>a.category))].sort((a,b)=>a.localeCompare(b,'es'));
  const catSelect = $('#evidenceCategory');
  if(catSelect && catSelect.options.length === 1){
    catSelect.insertAdjacentHTML('beforeend', cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join(''));
  }

  const items=[];
  for(const p of photos){
    const ev=byId[p.evaluationId];
    if(!ev) continue;
    const aspect=ASPECTS.find(a=>String(a.id)===String(p.aspectId));
    const hay=[
      ev.context?.cliente||'',
      ev.context?.sede||'',
      ev.context?.lugar||'',
      ev.context?.inspector||'',
      aspect?.title||'',
      aspect?.category||''
    ].join(' ').toLowerCase();
    if(q && !hay.includes(q)) continue;
    if(category && aspect?.category!==category) continue;
    items.push({p,ev,aspect});
  }

  items.sort((a,b)=>(b.p.createdAt||'').localeCompare(a.p.createdAt||''));
  $('#evidenceCount').textContent=`${items.length} ${items.length===1?'evidencia':'evidencias'}`;

  const grid=$('#evidenceGrid');
  if(!grid) return;
  if(!items.length){
    grid.innerHTML='<article class="card empty-evidence"><strong>No hay evidencias para mostrar.</strong><span>Captura una fotografía desde una evaluación o ajusta los filtros.</span></article>';
    return;
  }

  grid.innerHTML='';
  for(const item of items){
    const card=document.createElement('article');
    card.className='evidence-card';
    const url=URL.createObjectURL(item.p.blob);
    const date=item.p.createdAt?new Date(item.p.createdAt).toLocaleString('es-CO'):'';
    card.innerHTML=`
      <button type="button" class="evidence-image" title="Ver fotografía en grande">
        <img alt="Evidencia de ${esc(item.aspect?.title||'aspecto')}" src="${url}">
      </button>
      <div class="evidence-meta">
        <strong>${esc(item.aspect?.title||'Aspecto no identificado')}</strong>
        <span>${esc(item.aspect?.category||'Sin categoría')}</span>
        <small>${esc(item.ev.context?.cliente||'Sin cliente')} · ${esc(item.ev.context?.sede||'Sin sede')}</small>
        <small>${esc(date)}</small>
        <div class="evidence-actions">
          <button type="button" class="evidence-open">Abrir evaluación</button>
        </div>
      </div>`;
    grid.appendChild(card);

    card.querySelector('.evidence-image').onclick=()=>openLightbox(url,item.aspect?.title||'Evidencia');
    card.querySelector('.evidence-open').onclick=async()=>{
      await openEval(item.p.evaluationId);
      if(item.aspect?.category) $('#cat').value=item.aspect.category;
      renderAspects();
      step(2);
    };
  }
}

function openLightbox(url,title){
  let layer=$('#evidenceLightbox');
  if(!layer){
    layer=document.createElement('div');
    layer.id='evidenceLightbox';
    layer.className='evidence-lightbox';
    layer.innerHTML='<div class="lightbox-inner"><button type="button" class="lightbox-close">×</button><img alt=""><div class="lightbox-title"></div></div>';
    document.body.appendChild(layer);
    layer.querySelector('.lightbox-close').onclick=()=>layer.classList.remove('open');
    layer.onclick=e=>{if(e.target===layer)layer.classList.remove('open')};
  }
  layer.querySelector('img').src=url;
  layer.querySelector('img').alt=title;
  layer.querySelector('.lightbox-title').textContent=title;
  layer.classList.add('open');
}

function exportCurrent(){read();const payload={app:'TECCHNEX Gestión SST',modelVersion:MODEL_VERSION,exportedAt:new Date().toISOString(),evaluation:current};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(current.context.cliente||'evaluacion')+'_'+current.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function metrics(){$('#mEval').textContent=(await all('evaluations')).length;$('#mPhoto').textContent=(await all('photos')).length;const categories=[...new Set(ASPECTS.map(a=>a.category))];$('#mCat').textContent=categories.length;wireCardInteractions()}
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));


async function createFromSetup(){
  const cliente=$('#setupCliente')?.value.trim();
  if(!cliente){
    $('#setupCliente')?.focus();
    alert('Ingresa el nombre del cliente para iniciar la evaluación.');
    return false;
  }

  if(!setupEditing) current=blank();

  current.context=current.context||{};
  current.context.cliente=cliente;
  current.context.sede=$('#setupSede')?.value.trim()||'';
  current.context.lugar=$('#setupLugar')?.value.trim()||'';
  current.context.inspector=$('#setupInspector')?.value.trim()||'';
  current.context.fecha=$('#setupFecha')?.value || new Date().toISOString().slice(0,10);
  current.context.tipoEvaluacion='Inspección HSEQ general';
  current.updatedAt=new Date().toISOString();

  await put('evaluations',current);
  setupEditing=false;
  bind();
  renderAspects();
  renderContextBar();
  step(1);
  await metrics();
  go('new');
  return true;
}

async function renderLatestStatus(){
  const rows=(await all('evaluations')).sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  const title=$('#latestTitle');
  const empty=$('#latestEmpty');
  const data=$('#latestData');
  const actions=$('#latestActions');
  const badge=$('#latestBadge');
  if(!title||!empty||!data||!actions||!badge)return;

  if(!rows.length){
    title.textContent='Sin evaluaciones guardadas';
    badge.textContent='Pendiente';
    badge.className='status-badge neutral';
    empty.hidden=false;
    data.hidden=true;
    actions.hidden=true;
    return;
  }

  const e=rows[0];
  const aspects=Object.values(e.aspects||{});
  const rated=aspects.filter(a=>a.rating).length;
  const findings=aspects.filter(a=>(a.finding||'').trim() || a.rating==='NC').length;
  const photos=aspects.reduce((n,a)=>n+(Array.isArray(a.photos)?a.photos.length:0),0);
  const updated=e.updatedAt?new Date(e.updatedAt).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'}):'—';
  const complete=rated===50;

  title.textContent=e.context?.cliente||'Evaluación sin cliente';
  badge.textContent=complete?'Lista para revisión':'En proceso';
  badge.className=`status-badge ${complete?'ok':'progress'}`;

  empty.hidden=true;
  data.hidden=false;
  actions.hidden=false;

  $('#latestClient').textContent=e.context?.cliente||'—';
  $('#latestSite').textContent=e.context?.sede||'—';
  $('#latestAspects').textContent=`${rated}/50`;
  $('#latestFindings').textContent=String(findings);
  $('#latestPhotos').textContent=String(photos);
  $('#latestUpdated').textContent=updated;

  $('#latestOpen').onclick=async()=>{await openEval(e.id);};
  $('#latestRecords').onclick=()=>go('listView');
}


(async()=>{
  try{
    await openDB();

    const cat=$('#cat');
    if(cat){
      cat.innerHTML='<option value="">Todas las categorías</option>'+
        [...new Set(ASPECTS.map(a=>a.category))]
          .sort()
          .map(c=>`<option value="${esc(c)}">${esc(c)}</option>`)
          .join('');
    }

    $$('[data-go]').forEach(b=>{
      b.onclick=e=>{
        e.preventDefault();
        e.stopPropagation();
        const v=b.dataset.go;
        if(v==='new') start();
        else go(v);
      };
    });

    $$('[data-step]').forEach(b=>b.onclick=()=>{
      read();
      step(+b.dataset.step);
    });

    $$('[data-next]').forEach(b=>b.onclick=()=>{
      read();
      step(+b.dataset.next);
    });

    $$('[data-prev]').forEach(b=>b.onclick=()=>{
      read();
      step(+b.dataset.prev);
    });

    
    const pendingOnly=$('#pendingOnly');
    if(pendingOnly) pendingOnly.onchange=renderAspects;

    const nextPending=$('#nextPending');
    if(nextPending) nextPending.onclick=()=>{
      const first=ASPECTS.find(a=>!aspectIsComplete(a)&&matches(a));
      if(first){
        current._focusAspectId=first.id;
        renderAspects();
      }else{
        alert('Todos los aspectos visibles ya tienen información capturada.');
      }
    };

    const search=$('#search');
    if(search) search.oninput=renderAspects;

    const librarySearch=$('#librarySearch');
    if(librarySearch) librarySearch.oninput=renderCats;

    const recordsSearch=$('#recordsSearch');
    if(recordsSearch) recordsSearch.oninput=renderSaved;
    const recordsFilter=$('#recordsFilter');
    if(recordsFilter) recordsFilter.onchange=renderSaved;

    
    
    const followSearch=$('#followSearch');
    if(followSearch) followSearch.oninput=renderSeguimiento;
    const followFilter=$('#followFilter');
    if(followFilter) followFilter.onchange=renderSeguimiento;

    const openSeguimiento=$('#openSeguimiento');    const openRoles=$('#openRoles');
    if(openRoles) openRoles.onclick=e=>{e.stopPropagation();go('rolesView');};


    if(openSeguimiento) openSeguimiento.onclick=e=>{e.stopPropagation();go('seguimientoView');};

const findingsSearch=$('#findingsSearch');
    if(findingsSearch) findingsSearch.oninput=renderHallazgos;
    const findingsFilter=$('#findingsFilter');
    if(findingsFilter) findingsFilter.onchange=renderHallazgos;

    const openHallazgos=$('#openHallazgos');
    if(openHallazgos) openHallazgos.onclick=()=>go('hallazgosView');

const evidenceCategory=$('#evidenceCategory');
    if(evidenceCategory) evidenceCategory.onchange=renderEvidence;

    const evidenceSearch=$('#evidenceSearch');
    if(evidenceSearch) evidenceSearch.oninput=renderEvidence;

    if(cat) cat.onchange=renderAspects;

    const form=$('#form');
    if(form){
      form.oninput=()=>{
        read();
        clearTimeout(window.st);
        window.st=setTimeout(save,400);
      };
    }

    const general=$('#general');
    if(general) general.oninput=()=>{
      read();
      save();
    };

    
    const setupContinue=$('#setupContinue');
    if(setupContinue) setupContinue.onclick=async()=>{
      try{
        await createFromSetup();
      }catch(err){
        console.error('Error al crear evaluación:',err);
        alert('No se pudo crear la evaluación. Revisa la consola para ver el detalle.');
      }
    };

    const setupCancel=$('#setupCancel');
    if(setupCancel) setupCancel.onclick=()=>go('dashboard');

    const editContext=$('#editContext');
    if(editContext) editContext.onclick=()=>{
      if(!current)return;
      setupEditing=true;
      $('#setupCliente').value=current.context?.cliente||'';
      $('#setupSede').value=current.context?.sede||'';
      $('#setupLugar').value=current.context?.lugar||'';
      $('#setupInspector').value=current.context?.inspector||'';
      $('#setupFecha').value=current.context?.fecha||new Date().toISOString().slice(0,10);
      $('#setupTipo').value='Inspección HSEQ general';
      go('newSetupView');
    };

const saveBtn=$('#save');
    if(saveBtn) saveBtn.onclick=async()=>{
      await save();
      await renderLatestStatus();
      alert('Evaluación guardada localmente.');
      go('listView');
    };

    const reportBtn=$('#generateReport');
    if(reportBtn) reportBtn.onclick=async()=>{
      try{
        await save();
        reportBtn.disabled=true;
        reportBtn.textContent='Generando informe…';
        await generateHseqWordReport({evaluation:current,aspects:ASPECTS});
      }catch(err){
        console.error('Error generando informe HSEQ:',err);
        alert('No se pudo generar el informe HSEQ.\n\n' + (err?.message||'Revisa la consola para ver el detalle.'));
      }finally{
        reportBtn.disabled=false;
        reportBtn.textContent='Generar informe Word';
      }
    };

    const exportBtn=$('#exportJson');
    if(exportBtn) exportBtn.onclick=exportCurrent;

    const saved=$('#saved');
    if(saved) saved.onclick=async e=>{
      const openBtn=e.target.closest('[data-open]');
      const delBtn=e.target.closest('[data-del]');
      if(openBtn){await openEval(openBtn.dataset.open);return;}
      if(delBtn && confirm('¿Eliminar esta evaluación?')){await removeEval(delBtn.dataset.del);}
    };

    await metrics();
    await renderLatestStatus();
    renderCats();
    renderModel();
    wireCardInteractions();
    renderEvidence();

  }catch(err){
    console.error('CAM-SST-02H init error:',err);
    alert('No fue posible iniciar el módulo. Abre la consola de VS Code/Chrome para revisar el detalle.');
  }
})()
