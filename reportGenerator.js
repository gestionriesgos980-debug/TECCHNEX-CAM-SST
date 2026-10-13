// CAM-SST-06C — FÓRMULA GANADORA TECCHNEX
// Informe primero: CAM-SST construye el informe completo.
// Word: recipiente visual que recibe el contenido mediante altChunk + MHTML.
// Esta estrategia reproduce la solución estable utilizada anteriormente en
// el Sistema de Inspecciones de Seguridad para evitar depender del XML interno
// de tablas o de relaciones individuales de fotografías.

const HSEQ_TEMPLATE_URL=new URL('./templates/HSEQ_INFORME_TODO_EN_TABLA_CONTAINER.docx',import.meta.url).href;
const NAVY='#123B5D';
const CYAN='#0AA7C0';
const GREEN='#2E7D5B';
const RED='#B23A48';
const AMBER='#B57B10';
const LIGHT='#EAF3F6';
const VERY_LIGHT='#F6F8FA';
const BORDER='#D5E0E6';
const WHITE='#FFFFFF';
const FONT='Century Gothic, Arial, sans-serif';

const esc=v=>String(v??'')
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const trim=v=>String(v??'').replace(/\s+/g,' ').trim();
const fmtDate=value=>{
  if(!value)return '';
  const d=new Date(`${value}T00:00:00`);
  if(Number.isNaN(d.getTime()))return String(value);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const css=`
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:${NAVY};font-family:${FONT};font-size:10pt;line-height:1.18}
body{padding:0}
.report{width:100%;max-width:100%;margin:0 auto}
table{border-collapse:collapse;border-spacing:0;width:100%;table-layout:fixed}
td,th{border:1px solid ${BORDER};padding:5px 7px;vertical-align:middle;word-wrap:break-word;overflow-wrap:anywhere}
.no-border td{border:none}
.top-brand{font-size:24pt;font-weight:700;color:${NAVY};padding:0 0 2px 0;border:none}
.brand-sub{font-size:10pt;font-weight:700;color:${CYAN};padding:0 0 10px 0;border:none}
.title-table td{border:none;padding:0}
.title-bar{background:${NAVY};color:#fff;font-size:20pt;font-weight:700;padding:8px 10px;text-align:left}
.title-sub{background:${NAVY};color:#fff;font-size:10pt;padding:0 10px 8px 10px}
.section{margin:7px 0 5px 0;width:100%}
.section td{border:1px solid ${BORDER};padding:0}
.section .section-block{width:44%;background:${CYAN};height:22px}
.section .section-title{width:56%;background:#fff;border-left:none;padding:3px 7px}
.section .section-title strong{display:block;font-size:16pt;line-height:1.0;color:${NAVY}}
.section .section-title span{display:block;font-size:8.5pt;color:#687784;margin-top:2px}
.metrics td{padding:5px 4px;text-align:center}
.metric-value{font-size:20pt;font-weight:700;line-height:1;color:${NAVY}}
.metric-label{font-size:8pt;font-weight:700;color:#38576B;margin-top:2px}
.info th{background:${LIGHT};color:${NAVY};text-align:left;font-weight:700;width:14%}
.info td{background:#fff;width:36%}
.info .obs{background:${LIGHT};width:14%}
.reading{background:${LIGHT};padding:7px}
.callout{background:${LIGHT};padding:7px;border:1px solid ${BORDER};font-size:9pt}
.callout strong{font-size:8.5pt;display:block;margin-bottom:3px}
.callout .big{font-size:17pt;font-weight:700;color:${NAVY};display:block;margin-bottom:2px}
.category th,.aspect th,.follow th{background:${NAVY};color:#fff;font-size:8.5pt;text-align:left}
.category td,.aspect td,.follow td{font-size:8.5pt}
.center{text-align:center}
.rating-C{background:${GREEN};color:#fff;font-weight:700;text-align:center}
.rating-NC{background:${RED};color:#fff;font-weight:700;text-align:center}
.rating-NA{background:${AMBER};color:#fff;font-weight:700;text-align:center}
.row-C{background:#EFF7F2}
.row-NC{background:#FDF0F2}
.row-NA{background:#FFF7E6}
.evidence{text-align:center;padding:3px}
.evidence-box{width:2.7cm;height:1.9cm;margin:0 auto;border:1px solid #cfd9df;border-collapse:collapse;table-layout:fixed}
.evidence-box td{width:2.5cm;height:1.7cm;padding:1px;border:none;text-align:center;vertical-align:middle}
.evidence-box img{display:block;width:90px;height:60px;margin:0 auto;object-fit:fill;border:none;max-width:none;max-height:none}
.finding{margin:4px 0;border:1px solid #E0E8ED;background:${VERY_LIGHT};padding:7px}
.finding-title{font-weight:700;color:${NAVY};font-size:9.5pt}
.finding-line{font-size:8.5pt;margin-top:2px}
.follow td.status-pending{background:${RED};color:#fff;font-weight:700;text-align:center}
.follow td.status-process{background:${NAVY};color:#fff;font-weight:700;text-align:center}
.follow td.status-follow{background:${GREEN};color:#fff;font-weight:700;text-align:center}
.follow td.status-closed{background:${GREEN};color:#fff;font-weight:700;text-align:center}
.status-grid td{text-align:center;border:1px solid ${BORDER};padding:6px 3px}
.status-value{font-size:18pt;font-weight:700;display:block}
.status-label{font-size:8pt;font-weight:700;color:#38576B}
.bullets{font-size:9pt;margin:3px 0 3px 17px;padding:0}
.signature th{background:${NAVY};color:#fff;text-align:center;font-size:8.5pt}
.signature td{font-size:8.5pt;padding:7px}
.footer-note{font-size:7.5pt;color:#687784;text-align:center;padding-top:5px}
.keep{page-break-inside:avoid}
img{max-width:100%}
`;

function section(title,subtitle){
  return `<table class="section keep"><tr><td class="section-block">&nbsp;</td><td class="section-title"><strong>${esc(title)}</strong><span>${esc(subtitle||'')}</span></td></tr></table>`;
}
function metricTable(metrics){
  return `<table class="metrics keep"><tr>${metrics.map(m=>`<td><div class="metric-value" style="color:${m.color||NAVY}">${esc(m.value)}</div><div class="metric-label">${esc(m.label)}</div></td>`).join('')}</tr></table>`;
}
function infoTable(c){
  return `<table class="info keep">
  <tr><th>Cliente</th><td>${esc(c.cliente)}</td><th>Sede</th><td>${esc(c.sede)}</td></tr>
  <tr><th>Lugar</th><td>${esc(c.lugar)}</td><th>Fecha de evaluación</th><td>${esc(fmtDate(c.fecha))}</td></tr>
  <tr><th>Inspector</th><td>${esc(c.inspector)}</td><th>Director / responsable</th><td>${esc(c.director)}</td></tr>
  <tr><th>Servicio</th><td>${esc(c.servicio)}</td><th>Personal expuesto</th><td>${esc(c.expuestos)}</td></tr>
  <tr><th class="obs">Observación general</th><td>${esc(c.obs||'Sin observación general registrada.')}</td><th></th><td></td></tr>
  </table>`;
}
function categoryTable(cats){
  let html=`<table class="category keep"><thead><tr><th style="width:25%">Categoría</th><th style="width:10%" class="center">Aspectos</th><th style="width:9%" class="center">C</th><th style="width:9%" class="center">NC</th><th style="width:9%" class="center">NA</th><th>Lectura</th></tr></thead><tbody>`;
  for(const r of cats){html+=`<tr class="${r.NC>0?'row-NC':''}"><td><b>${esc(r.category)}</b></td><td class="center">${esc(r.aspects)}</td><td class="center" style="color:${GREEN};font-weight:700">${esc(r.C)}</td><td class="center" style="color:${RED};font-weight:700">${esc(r.NC)}</td><td class="center" style="color:${AMBER};font-weight:700">${esc(r.NA)}</td><td style="background:${r.NC>0?'#FDF0F2':'#EFF7F2'}">${esc(r.reading)}</td></tr>`;}
  return html+`</tbody></table>`;
}
function actionStateTable(values){
  return `<table class="status-grid keep"><tr>${values.map(v=>`<td><span class="status-value" style="color:${v.color}">${esc(v.value)}</span><span class="status-label">${esc(v.label)}</span></td>`).join('')}</tr></table>`;
}
function statusClass(v){
  const x=String(v||'').toLowerCase();
  if(x.includes('pendiente'))return 'status-pending';
  if(x.includes('proceso'))return 'status-process';
  if(x.includes('seguimiento')||x.includes('verificado')||x.includes('cerrad')||x.includes('complet'))return 'status-follow';
  return '';
}
function findingBlock(f,index){
  return `<div class="finding keep"><div class="finding-title">HALLAZGO ${String(index+1).padStart(2,'0')} · ASPECTO ${String(f.aspectId).padStart(2,'0')} · ${esc(f.title).toUpperCase()}</div>
  <div class="finding-line"><b>Observación:</b> ${esc(f.observation||'Sin observación adicional registrada.')}</div>
  <div class="finding-line"><b>Acción propuesta:</b> ${esc(f.action||'Sin acción preliminar registrada.')}</div>
  <div class="finding-line"><b>Responsable:</b> ${esc(f.responsible||'Sin responsable registrado.')}</div>
  <div class="finding-line"><b>Fecha objetivo:</b> ${esc(f.dueDate||'Sin fecha registrada.')}</div>
  <div class="finding-line"><b>Estado de la acción:</b> ${esc(f.actionStatus||'Pendiente')}</div>
  </div>`;
}
function followTable(findings){
  let html=`<table class="follow keep"><thead><tr><th style="width:13%">Aspecto</th><th style="width:22%">Acción</th><th style="width:18%">Responsable</th><th style="width:12%">Fecha objetivo</th><th style="width:11%">Estado acción</th><th style="width:11%">Seguimiento</th><th style="width:13%">Resultado</th></tr></thead><tbody>`;
  for(const f of findings){
    const fu=f.followUp||{};
    html+=`<tr><td>${esc(String(f.aspectId).padStart(2,'0')+' '+f.title)}</td><td>${esc(f.action||'Sin acción preliminar registrada.')}</td><td>${esc(f.responsible||'Sin responsable registrado.')}</td><td class="center">${esc(f.dueDate||'Sin fecha registrada.')}</td><td class="${statusClass(f.actionStatus)}">${esc(f.actionStatus||'Pendiente')}</td><td class="${statusClass(fu.status)}">${esc(fu.status||'Pendiente')}</td><td>${esc(fu.result||'Sin resultado registrado')}</td></tr>`;
  }
  return html+`</tbody></table>`;
}
function signatureTable(c){
  return `<table class="signature keep"><tr><th>RESPONSABLE DE LA EVALUACIÓN</th><th>RESPONSABLE DEL CLIENTE</th></tr><tr><td>${esc(c.inspector||'Equipo de evaluación HSEQ')}<br><br>Firma: ______________________________</td><td>${esc(c.director||'Responsable designado por el cliente')}<br><br>Firma: ______________________________</td></tr></table>`;
}

async function blobToBase64(blob){
  if(!blob)return '';
  return await new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const value=String(reader.result||'');
      const comma=value.indexOf(',');
      resolve(comma>=0?value.slice(comma+1):value);
    };
    reader.onerror=()=>reject(reader.error||new Error('No se pudo leer la fotografía.'));
    reader.readAsDataURL(blob);
  });
}

// CAM-SST-06C-FOTO-02: el ajuste visual por CSS no estaba siendo respetado de forma
// consistente por Word al interpretar MHTML. Por eso reducimos físicamente cada
// fotografía antes de incorporarla al informe y, adicionalmente, la alojamos en una
// celda con dimensiones fijas. Así el tamaño no depende del motor de Word.
async function resizePhotoForWord(blob,targetW=95,targetH=64){
  if(!blob)return null;
  try{
    let source=null;
    if(window.createImageBitmap){
      source=await createImageBitmap(blob);
    }else{
      source=await new Promise((resolve,reject)=>{
        const img=new Image();
        const url=URL.createObjectURL(blob);
        img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
        img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo decodificar la fotografía.'));};
        img.src=url;
      });
    }
    const canvas=document.createElement('canvas');
    canvas.width=targetW; canvas.height=targetH;
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('No se pudo preparar el lienzo de la fotografía.');
    const sw=source.width||source.naturalWidth||targetW;
    const sh=source.height||source.naturalHeight||targetH;
    const scale=Math.max(targetW/sw,targetH/sh);
    const dw=sw*scale, dh=sh*scale;
    const dx=(targetW-dw)/2, dy=(targetH-dh)/2;
    ctx.drawImage(source,dx,dy,dw,dh);
    if(source.close)source.close();
    const resized=await new Promise((resolve,reject)=>{
      canvas.toBlob(b=>b?resolve(b):reject(new Error('No se pudo comprimir la fotografía.')),'image/jpeg',0.84);
    });
    return resized;
  }catch(err){
    console.warn('CAM-SST 06C · No se pudo redimensionar la fotografía; se usará el original.',err);
    return blob;
  }
}
async function getPhotoBlob(id){
  if(!id||!window.__camSstGetPhoto)return null;
  const item=await window.__camSstGetPhoto(id);
  return item?.blob||null;
}

function categorySummary(evaluation,aspects){
  const rows=new Map();
  for(const aspect of aspects){
    const x=evaluation.aspects?.[aspect.id]||{};
    const row=rows.get(aspect.category)||{category:aspect.category,aspects:0,C:0,NC:0,NA:0};
    row.aspects++;
    if(x.rating==='C')row.C++; else if(x.rating==='NC')row.NC++; else if(x.rating==='NA')row.NA++;
    rows.set(aspect.category,row);
  }
  return [...rows.values()].map(r=>({...r,reading:r.NC>0?'Requiere gestión':'Sin NC'}));
}
function findingFromAspect(a,aspect){
  const observation=trim(a.finding);
  const isNC=a.rating==='NC';
  if(!observation&&!isNC)return null;
  return {aspectId:aspect.id,title:aspect.title,observation:observation||'Se registra condición no conforme sin observación adicional.',action:trim(a.preliminaryAction),responsible:trim(a.responsible),dueDate:fmtDate(a.dueDate),actionStatus:a.actionStatus||'Pendiente',followUp:a.followUp||{}};
}

async function buildHseqHtml({evaluation,aspects,stageSetter}){
  const c={...(evaluation.context||{}),obs:evaluation.general||evaluation.context?.obs||''};
  const vals=Object.values(evaluation.aspects||{});
  const counts={C:0,NC:0,NA:0};
  vals.forEach(v=>{if(counts[v.rating]!==undefined)counts[v.rating]++;});
  const findings=aspects.map(a=>findingFromAspect(evaluation.aspects?.[a.id]||{},a)).filter(Boolean);
  const evaluable=counts.C+counts.NC;
  const conformity=evaluable?counts.C/evaluable*100:0;
  const cats=categorySummary(evaluation,aspects);
  const actionCounts={pending:findings.filter(f=>f.actionStatus==='Pendiente').length,inProcess:findings.filter(f=>f.actionStatus==='En proceso').length,follow:findings.filter(f=>f.followUp?.status==='En seguimiento').length,closed:findings.filter(f=>['Cerrada','Completada'].includes(f.actionStatus)||f.followUp?.status==='Cerrado').length};
  const parts=[];
  parts.push(`<div class="report">`);
  parts.push(`<div class="top-brand">TECCHNEX</div><div class="brand-sub">DE LA NECESIDAD A LA SOLUCIÓN</div>`);
  parts.push(`<table class="title-table"><tr><td><div class="title-bar">INFORME DE EVALUACIÓN HSEQ</div><div class="title-sub">Evaluación integral de condiciones observadas, hallazgos, acciones y seguimiento</div></td></tr></table>`);
  parts.push(infoTable({cliente:c.cliente||'Sin cliente',sede:c.sede||'Sin sede',lugar:c.lugar||'Sin área',fecha:c.fecha||'',inspector:c.inspector||'Sin inspector',director:c.director||'Responsable de gestión del cliente',servicio:c.servicio||'',expuestos:c.expuestos||'',obs:c.obs||'Sin observación general registrada.'}));
  parts.push(`<div style="font-weight:700;font-size:8.5pt;color:${NAVY};padding:4px 0">ID DEL INFORME HSEQ-${esc(evaluation.id||'SIN-ID')}</div>`);

  parts.push(section('1. Resumen ejecutivo','Vista rápida de la evaluación y del estado de gestión'));
  parts.push(metricTable([
    {value:aspects.length,label:'Aspectos evaluados',color:NAVY},{value:counts.C,label:'Conformes (C)',color:GREEN},{value:counts.NC,label:'No conformes (NC)',color:RED},{value:counts.NA,label:'No aplica (NA)',color:AMBER},{value:findings.length,label:'Hallazgos documentados',color:NAVY}
  ]));
  parts.push(`<div style="font-size:8.8pt;padding:4px 1px"><b>Lectura ejecutiva.</b> La evaluación reúne la información capturada en campo, los hallazgos asociados, las acciones de gestión, las evidencias fotográficas y el estado de seguimiento.</div>`);
  parts.push(`<div class="callout keep"><strong>Indicador de evaluación</strong><span class="big">Conformidad de aspectos evaluables: ${conformity.toFixed(1).replace('.',',')}%</span><span>Cálculo de muestra: ${counts.C} conformes / ${evaluable} aspectos evaluables.</span></div>`);

  parts.push(section('2. Información general','Datos de la evaluación realizada'));
  parts.push(infoTable({cliente:c.cliente||'Sin cliente',sede:c.sede||'Sin sede',lugar:c.lugar||'Sin área',fecha:c.fecha||'',inspector:c.inspector||'Sin inspector',director:c.director||'',servicio:c.servicio||'',expuestos:c.expuestos||'',obs:c.obs||'Sin observación general registrada.'}));

  parts.push(section('3. Alcance y criterio de presentación','Cómo se organiza el resultado'));
  parts.push(`<ul class="bullets"><li>La evaluación se presenta sobre ${aspects.length} aspectos organizados por categoría HSEQ.</li><li>Cada aspecto registra calificación C, NC o NA; cuando corresponde, incorpora observación/hallazgo, evidencia y gestión asociada.</li><li>Los hallazgos con gestión se convierten en acciones con responsable, fecha objetivo y estado.</li><li>El seguimiento se conserva separado de la acción para permitir documentar evolución, verificación y cierre.</li><li>Las evidencias fotográficas se mantienen vinculadas al aspecto correspondiente y se presentan junto al registro.</li></ul>`);

  parts.push(section('4. Consolidado por categoría','Resumen del resultado registrado en los aspectos evaluados'));
  parts.push(categoryTable(cats));
  parts.push(`<div style="font-size:8.8pt;font-weight:700;padding:5px 0">Resumen de gestión: ${findings.length} hallazgo(s) requieren tratamiento o seguimiento con base en la captura realizada.</div>`);

  parts.push(section('5. Estado de acciones','Estado de la gestión identificada durante la evaluación'));
  parts.push(actionStateTable([{value:actionCounts.pending,label:'Pendientes',color:RED},{value:actionCounts.inProcess,label:'En proceso',color:NAVY},{value:actionCounts.follow,label:'En seguimiento',color:GREEN},{value:actionCounts.closed,label:'Cerradas',color:GREEN}]));

  parts.push(section('6. Aspectos evaluados','Detalle de la captura estructurada realizada por la plataforma'));
  let aspectHtml=`<table class="aspect"><thead><tr><th style="width:6%" class="center">No.</th><th style="width:20%">Aspecto / criterio</th><th style="width:12%">Categoría</th><th style="width:8%" class="center">Calif.</th><th style="width:32%">Hallazgo / lectura</th><th style="width:22%" class="center">Evidencia</th></tr></thead><tbody>`;
  let photoSeq=1;
  for(let i=0;i<aspects.length;i++){
    const a=aspects[i];const x=evaluation.aspects?.[a.id]||{};
    const reading=x.rating==='NA'?'No aplica para las condiciones revisadas en esta evaluación.':trim(x.finding)||'Sin hallazgo documentado en esta captura.';
    let evidence='';
    const photos=Array.isArray(x.photos)?x.photos:[];
    for(const pid of photos.slice(0,3)){
      stageSetter(`incorporando fotografía del aspecto ${String(a.id).padStart(2,'0')}`);
      const blob=await getPhotoBlob(pid); if(!blob)continue;
      const resized=await resizePhotoForWord(blob,90,60);
      const base64=await blobToBase64(resized);
      const mime='image/jpeg';
      const cid=`tecchnex-hseq-img-${photoSeq}@informe`;
      evidence+=`<table class="evidence-box"><tr><td><img src="cid:${cid}" data-mht-cid="${cid}" width="90" height="60" alt="Evidencia ${photoSeq}"></td></tr></table>`;
      // Colocamos la evidencia en el cuerpo y devolvemos sus recursos al caller.
      if(!buildHseqHtml._images)buildHseqHtml._images=[];
      buildHseqHtml._images.push({cid,name:`hseq-photo-${photoSeq}.jpg`,mime,base64});
      photoSeq++;
    }
    const rowClass=x.rating==='C'?'row-C':x.rating==='NC'?'row-NC':x.rating==='NA'?'row-NA':'';
    const ratingClass=x.rating==='C'?'rating-C':x.rating==='NC'?'rating-NC':x.rating==='NA'?'rating-NA':'';
    aspectHtml+=`<tr class="${rowClass} keep"><td class="center"><b>${String(i+1).padStart(2,'0')}</b></td><td>${esc(a.title)}</td><td>${esc(a.category)}</td><td class="${ratingClass}">${esc(x.rating||'')}</td><td>${esc(reading)}</td><td class="evidence">${evidence}</td></tr>`;
  }
  aspectHtml+=`</tbody></table>`;
  parts.push(aspectHtml);

  parts.push(section('7. Hallazgos y gestión','Hallazgos que requieren tratamiento o seguimiento'));
  if(findings.length)findings.forEach((f,i)=>parts.push(findingBlock(f,i))); else parts.push(findingBlock({aspectId:0,title:'SIN HALLAZGOS REGISTRADOS',observation:'No se registraron hallazgos en la evaluación.',action:'',responsible:'',dueDate:'',actionStatus:'Sin hallazgos'},0));

  parts.push(section('9. Seguimiento, verificación y cierre','Control posterior de las acciones registradas'));
  if(findings.length)parts.push(followTable(findings)); else parts.push(`<div style="font-size:9pt;padding:4px 0">No se registraron acciones para seguimiento.</div>`);
  const verified=findings.filter(f=>f.followUp?.verificationDate||f.followUp?.verificationResult||Array.isArray(f.followUp?.verificationEvidence)&&f.followUp.verificationEvidence.length).length;
  parts.push(`<div style="font-size:8.5pt;font-weight:700;padding:5px 0">${verified?`Verificación y cierre: ${verified} acción(es) registran datos de verificación en la evaluación.`:'Verificación y cierre: No se han registrado verificaciones formales en esta evaluación.'}</div>`);

  parts.push(section('10. Conclusiones y responsables','Cierre de la lectura del informe'));
  parts.push(`<ul class="bullets"><li>La evaluación permite centralizar contexto, aspectos, hallazgos, fotografías, acciones y seguimiento en un mismo registro.</li><li>La estructura facilita pasar de una observación de campo a una acción gestionable, sin perder la relación con el aspecto que originó el hallazgo.</li><li>El seguimiento y la verificación quedan diferenciados de la captura inicial para facilitar la continuidad del proceso.</li><li>El informe final conserva la información proveniente de la evaluación realizada y de las acciones efectivamente registradas.</li></ul>`);
  parts.push(signatureTable(c));
  parts.push(`<div class="footer-note"><b>TECCHNEX · INFORME HSEQ</b><br>Documento generado por la plataforma TECCHNEX. La interpretación y las decisiones de implementación corresponden al responsable designado por el cliente.</div>`);
  parts.push(`</div>`);
  const images=buildHseqHtml._images||[];buildHseqHtml._images=[];
  return {html:parts.join(''),images};
}

function nextRid(relsXml){
  const nums=[...String(relsXml||'').matchAll(/Id="rId(\d+)"/g)].map(m=>Number(m[1]));
  const max=nums.length?Math.max(...nums):0;
  return `rId${max+1}`;
}
function buildMhtml(html,images){
  const boundary='----=_TECCHNEX_HSEQ_MHTML_'+Date.now();
  let body=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><style>${css}</style></head><body>${html}</body></html>`;
  const parts=[];
  for(const img of images){
    body=body.split(`cid:${img.cid}`).join(`cid:${img.cid}`);
    parts.push(`--${boundary}\r\nContent-Type: ${img.mime}; name="${img.name}"\r\nContent-Transfer-Encoding: base64\r\nContent-Location: ${img.name}\r\nContent-ID: <${img.cid}>\r\n\r\n${img.base64}\r\n`);
  }
  return `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"; type="text/html"; start="<tecchnex-root@hseq>"\r\n\r\n--${boundary}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: 8bit\r\nContent-Location: hseq-tecchnex.html\r\nContent-ID: <tecchnex-root@hseq>\r\n\r\n${body.replace(/\n/g,'\r\n')}\r\n${parts.join('')}--${boundary}--\r\n`;
}
async function installAltChunk(zip,mhtml){
  const chunkName='word/afchunk-tecchnex-hseq.mht';
  const relId='rIdTecchnexHSEQInformeCompleto';
  zip.file(chunkName,mhtml);
  let docXml=await zip.file('word/document.xml').async('string');
  const doc=new DOMParser().parseFromString(docXml,'application/xml');
  const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const body=doc.getElementsByTagNameNS(W,'body')[0];
  const sect=[...body.childNodes].find(n=>n.nodeType===1&&n.namespaceURI===W&&n.localName==='sectPr');
  while(body.firstChild)body.removeChild(body.firstChild);
  const frag=new DOMParser().parseFromString(`<w:altChunk xmlns:w="${W}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${relId}"/>`,'application/xml').documentElement;
  body.appendChild(doc.importNode(frag,true));
  if(sect)body.appendChild(sect);
  zip.file('word/document.xml',new XMLSerializer().serializeToString(doc));

  let relsXml=await zip.file('word/_rels/document.xml.rels').async('string');
  if(!relsXml.includes(`Id="${relId}"`)){
    const rid=nextRid(relsXml);
    const actualRid=rid===relId?`${relId}2`:relId;
    const chosen=actualRid;
    const old=new DOMParser().parseFromString(relsXml,'application/xml');
    const rel=old.createElementNS('http://schemas.openxmlformats.org/package/2006/relationships','Relationship');
    rel.setAttribute('Id',chosen);rel.setAttribute('Type','http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk');rel.setAttribute('Target','afchunk-tecchnex-hseq.mht');
    old.documentElement.appendChild(rel);
    const doc2=new DOMParser().parseFromString(await zip.file('word/document.xml').async('string'),'application/xml');
    const alt=doc2.getElementsByTagNameNS(W,'altChunk')[0];
    alt.setAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','r:id',chosen);
    zip.file('word/document.xml',new XMLSerializer().serializeToString(doc2));
    relsXml=new XMLSerializer().serializeToString(old);
    zip.file('word/_rels/document.xml.rels',relsXml);
  }
  let ct=await zip.file('[Content_Types].xml').async('string');
  if(!ct.includes('/word/afchunk-tecchnex-hseq.mht')){
    ct=ct.replace('</Types>','<Override PartName="/word/afchunk-tecchnex-hseq.mht" ContentType="message/rfc822"/></Types>');
    zip.file('[Content_Types].xml',ct);
  }
}

export async function generateHseqWordReport({evaluation,aspects}){
  let stage='inicio';
  try{
    if(!evaluation)throw new Error('No hay una evaluación seleccionada.');
    if(!window.JSZip)throw new Error('JSZip no está disponible.');
    stage='cargando el recipiente Word';
    const response=await fetch(HSEQ_TEMPLATE_URL,{cache:'no-store'});
    if(!response.ok)throw new Error(`No se pudo cargar el recipiente Word (${response.status}).`);
    const zip=await window.JSZip.loadAsync(await response.arrayBuffer());
    stage='construyendo el informe completo';
    const {html,images}=await buildHseqHtml({evaluation,aspects,stageSetter:s=>{stage=s;}});
    stage='empaquetando fotografías mediante MHTML';
    const mhtml=buildMhtml(html,images);
    stage='insertando el informe completo en el recipiente Word';
    await installAltChunk(zip,mhtml);
    stage='generando el archivo DOCX';
    const blob=await zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE',compressionOptions:{level:6}});
    const safe=(evaluation.context?.cliente||'Cliente').replace(/[^\wáéíóúÁÉÍÓÚñÑ-]+/g,'_');
    const filename=`Informe_HSEQ_${safe}_${evaluation.id||'SIN-ID'}.docx`;
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1500);
    console.info('CAM-SST 06C · Informe generado correctamente',{filename,images:images.length});
    return {blob,filename,images:images.length};
  }catch(err){
    console.error(`CAM-SST 06C · ${stage}:`,err);
    throw new Error(`CAM-SST 06C · ${stage}: ${err?.message||String(err)}`);
  }
}
