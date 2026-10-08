/**
 * UTILIDAD: Plantilla HTML para Generar PDF Ejecutivos de Reportes (DIRPOLES)
 */

export const generateReporteHTML = ({
  titulo = 'Reporte Estadístico Consolidado',
  usuario = 'Administrador',
  periodo = 'Todos los Tiempos',
  filtrosAplicados = [],
  beneficiarios = { total: 0, genero: [], pnf: [], lista: [] },
  citas = { total: 0, estados: [], lista: [] },
  inventario = { total_insumos: 0, total_unidades: 0, estatus: [], lista: [] },
}) => {
  const fechaHoy = new Date().toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const filtrosBadges = Array.isArray(filtrosAplicados) && filtrosAplicados.length > 0
    ? filtrosAplicados.map(f => `<span class="filter-tag">${f}</span>`).join(' ')
    : `<span class="filter-tag">Sin filtros adicionales</span>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${titulo}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #1F2937;
      margin: 0;
      padding: 30px;
      font-size: 13px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1E40AF;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .institution {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6B7280;
      font-weight: bold;
    }
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #1E40AF;
      margin: 4px 0;
    }
    .filter-tag {
      display: inline-block;
      background: #EFF6FF;
      color: #1D4ED8;
      border: 1px solid #BFDBFE;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
      margin-right: 4px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #4B5563;
    }
    .grid {
      display: flex;
      gap: 15px;
      margin-bottom: 25px;
    }
    .card {
      flex: 1;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .card-num {
      font-size: 24px;
      font-weight: bold;
      color: #1E40AF;
    }
    .card-title {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      font-weight: 600;
    }
    h2 {
      font-size: 15px;
      color: #0F172A;
      border-left: 4px solid #1E40AF;
      padding-left: 8px;
      margin-top: 25px;
      margin-bottom: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 8px 12px;
      text-align: left;
      border-bottom: 1px solid #E2E8F0;
    }
    th {
      background-color: #F1F5F9;
      color: #475569;
      font-size: 11px;
      text-transform: uppercase;
    }
    tr:nth-child(even) {
      background-color: #FAFAFA;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
    }
    .badge-green { background: #DEF7EC; color: #03543F; }
    .badge-blue { background: #DBEAFE; color: #1E40AF; }
    .badge-amber { background: #FEF3C7; color: #92400E; }
    .badge-red { background: #FDE8E8; color: #9B1C1C; }
    .footer {
      margin-top: 50px;
      padding-top: 15px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
      font-size: 10px;
      color: #94A3B8;
    }
    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 60px;
    }
    .sig-line {
      border-top: 1px solid #94A3B8;
      width: 200px;
      text-align: center;
      padding-top: 5px;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="institution">UPTAEB — Dirección de Políticas Estudiantiles</div>
      <div class="title">${titulo}</div>
      <div style="font-size: 11px; color: #64748B; margin-top: 4px;">Período: <strong>${periodo}</strong></div>
      <div style="margin-top: 6px;">${filtrosBadges}</div>
    </div>
    <div class="meta-box">
      <div>Fecha de Emisión: <strong>${fechaHoy}</strong></div>
      <div>Generado por: <strong>${usuario}</strong></div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-num">${beneficiarios.total}</div>
      <div class="card-title">Beneficiarios Evaluados</div>
    </div>
    <div class="card">
      <div class="card-num">${citas.total}</div>
      <div class="card-title">Citas Agendadas</div>
    </div>
    <div class="card">
      <div class="card-num">${inventario.total_insumos}</div>
      <div class="card-title">Insumos Evaluados (${inventario.total_unidades} Unid.)</div>
    </div>
  </div>

  <h2>1. Módulo de Beneficiarios</h2>
  <table>
    <thead>
      <tr>
        <th>Programa Académico (PNF)</th>
        <th>Total Estudiantes</th>
      </tr>
    </thead>
    <tbody>
      ${
        beneficiarios.pnf.length === 0
          ? '<tr><td colspan="2">No hay registros de PNF para los filtros seleccionados</td></tr>'
          : beneficiarios.pnf.map(p => `
            <tr>
              <td>${p.nombre_pnf || 'Desconocido'}</td>
              <td><strong>${p.total}</strong></td>
            </tr>
          `).join('')
      }
    </tbody>
  </table>

  <h2>2. Módulo de Citas Médicas / Psicológicas</h2>
  <table>
    <thead>
      <tr>
        <th>Estado de Atención</th>
        <th>Total Citas</th>
      </tr>
    </thead>
    <tbody>
      ${
        citas.estados.length === 0
          ? '<tr><td colspan="2">No hay citas registradas para los filtros seleccionados</td></tr>'
          : citas.estados.map(e => `
            <tr>
              <td><span class="badge badge-blue">${e.estado}</span></td>
              <td><strong>${e.total}</strong></td>
            </tr>
          `).join('')
      }
    </tbody>
  </table>

  <h2>3. Módulo de Inventario Médico</h2>
  <table>
    <thead>
      <tr>
        <th>Estatus / Nivel de Stock</th>
        <th>Total Insumos</th>
      </tr>
    </thead>
    <tbody>
      ${
        inventario.estatus.length === 0
          ? '<tr><td colspan="2">No hay insumos registrados para los filtros seleccionados</td></tr>'
          : inventario.estatus.map(s => `
            <tr>
              <td><span class="badge badge-green">${s.estatus}</span></td>
              <td><strong>${s.total}</strong></td>
            </tr>
          `).join('')
      }
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-line">Dirección de Políticas Estudiantiles</div>
    <div class="sig-line">Firma del Especialista de Turno</div>
  </div>

  <div class="footer">
    Documento oficial generado automáticamente por la App Móvil DIRPOLES — Universidad Politécnica Territorial Andrés Eloy Blanco.
  </div>

</body>
</html>
  `;
};
