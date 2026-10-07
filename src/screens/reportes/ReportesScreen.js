import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Divider, Chip } from 'react-native-paper';
import { 
  BarChart3, 
  Users, 
  CalendarDays, 
  Package, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Layers,
  Sparkles,
  Download,
  Filter
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useReportes } from '../../hooks/useReportes';

/**
 * PANTALLA: Reportes Estadísticos Consolidados (SOLID: Capa de Presentación Única)
 * 
 * Renderiza un dashboard gerencial interactivo de alto impacto visual. Muestra
 * métricas críticas de Beneficiarios, Citas e Inventario Médico mediante
 * medidores y micro-indicadores proporcionales, con exportación a PDF nativa.
 */
export default function ReportesScreen() {
  const {
    reporteData,
    loading,
    refreshing,
    exportingingPdf,
    error,
    periodo,
    setPeriodo,
    handleRefresh,
    exportarPDF
  } = useReportes();

  // Estado del segmento activo: 'beneficiarios', 'citas', 'inventario'
  const [activeSegment, setActiveSegment] = useState('beneficiarios');

  if (loading && !reporteData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Compilando estadísticas DIRPOLES...</Text>
      </SafeAreaView>
    );
  }

  // --- SECCIÓN: BENEFICIARIOS ---
  const renderBeneficiariosSection = () => {
    const data = reporteData?.beneficiarios || {};
    const generoList = Array.isArray(data.genero) ? data.genero : [];
    const pnfList = Array.isArray(data.pnf) ? data.pnf : [];
    
    // Calcular distribución de género
    let femeninoCount = 0;
    let masculinoCount = 0;
    generoList.forEach(g => {
      if (!g) return;
      if (g.genero === 'F') femeninoCount = parseInt(g.total) || 0;
      if (g.genero === 'M') masculinoCount = parseInt(g.total) || 0;
    });
    
    const totalGenero = femeninoCount + masculinoCount || 1;
    const femPct = Math.round((femeninoCount / totalGenero) * 100);
    const mascPct = Math.round((masculinoCount / totalGenero) * 100);

    return (
      <View style={styles.sectionContainer}>
        {/* Card Principal: Total */}
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <Users size={28} color={COLORS.primary} />
            </View>
            <View style={styles.statCardText}>
              <Text style={styles.statLabel}>Beneficiarios Registrados</Text>
              <Text style={styles.statNumber}>{data.total || 0}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Sección: Género */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="Distribución por Género" 
            titleStyle={styles.cardTitle}
            subtitle="Porcentaje proporcional de beneficiarios"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {/* Medidor Proporcional Dual */}
            <View style={styles.dualBarContainer}>
              <View style={[styles.dualBarLeft, { flex: femPct || 1 }]} />
              <View style={[styles.dualBarRight, { flex: mascPct || 1 }]} />
            </View>

            {/* Detalles de Leyenda */}
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <View>
                  <Text style={styles.legendName}>Femenino</Text>
                  <Text style={styles.legendVal}>{femeninoCount} ({femPct}%)</Text>
                </View>
              </View>
              
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <View>
                  <Text style={styles.legendName}>Masculino</Text>
                  <Text style={styles.legendVal}>{masculinoCount} ({mascPct}%)</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sección: Top PNFs */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="PNFs con Mayor Afluencia" 
            titleStyle={styles.cardTitle}
            subtitle="Programas académicos"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {pnfList.length === 0 ? (
              <Text style={styles.emptyText}>No hay datos de PNF registrados.</Text>
            ) : (
              pnfList.map((p, idx) => {
                const maxVal = parseInt(pnfList[0]?.total) || 1;
                const progressPct = Math.round((parseInt(p?.total || 0) / maxVal) * 100);

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <Text style={styles.progressRowName} numberOfLines={1}>
                        {p?.nombre_pnf || 'Desconocido'}
                      </Text>
                      <Text style={styles.progressRowVal}>{p?.total || 0}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progressPct}%`, backgroundColor: COLORS.primary }]} />
                    </View>
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  // --- SECCIÓN: CITAS ---
  const renderCitasSection = () => {
    const data = reporteData?.citas || {};
    const estadosList = Array.isArray(data.estados) ? data.estados : [];

    const getStatusConfig = (statusName) => {
      const name = String(statusName || '').toLowerCase();
      if (name.includes('atendid')) return { color: COLORS.accent, icon: CheckCircle2 };
      if (name.includes('pendient') || name.includes('programad')) return { color: COLORS.info, icon: Clock };
      if (name.includes('confirmad')) return { color: COLORS.primary, icon: Sparkles };
      return { color: COLORS.danger, icon: AlertTriangle };
    };

    return (
      <View style={styles.sectionContainer}>
        {/* Card Principal */}
        <Card style={styles.statCard}>
          <Card.Content style={styles.statCardContent}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
              <CalendarDays size={28} color={COLORS.primary} />
            </View>
            <View style={styles.statCardText}>
              <Text style={styles.statLabel}>Total Citas Agendadas</Text>
              <Text style={styles.statNumber}>{data.total || 0}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Sección: Estados de Cita */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="Distribución por Estatus" 
            titleStyle={styles.cardTitle}
            subtitle="Control operativo de las consultas médicas/psicológicas"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {estadosList.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de citas.</Text>
            ) : (
              estadosList.map((item, idx) => {
                const config = getStatusConfig(item?.estado);
                const itemTotal = parseInt(item?.total) || 0;
                const totalPct = (data.total || 0) > 0 ? Math.round((itemTotal / data.total) * 100) : 0;
                const StatusIcon = config.icon;

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <View style={styles.iconLabelGroup}>
                        <StatusIcon size={16} color={config.color} style={{ marginRight: 6 }} />
                        <Text style={styles.progressRowName}>{item?.estado || 'Desconocido'}</Text>
                      </View>
                      <Text style={styles.progressRowVal}>{itemTotal} ({totalPct}%)</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${totalPct}%`, backgroundColor: config.color }]} />
                    </View>
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  // --- SECCIÓN: INVENTARIO MÉDICO ---
  const renderInventarioSection = () => {
    const data = reporteData?.inventario || {};
    const estatusList = Array.isArray(data.estatus) ? data.estatus : [];

    return (
      <View style={styles.sectionContainer}>
        {/* Grid Dual de Cards */}
        <View style={styles.dualGrid}>
          <Card style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <Card.Content style={[styles.statCardContent, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight, width: 40, height: 40 }]}>
                <Package size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statLabel}>Insumos Distintos</Text>
              <Text style={[styles.statNumber, { fontSize: 24 }]}>{data.total_insumos || 0}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
            <Card.Content style={[styles.statCardContent, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
              <View style={[styles.iconContainer, { backgroundColor: '#DEF7EC', width: 40, height: 40 }]}>
                <TrendingUp size={20} color="#03543F" />
              </View>
              <Text style={styles.statLabel}>Total Unidades</Text>
              <Text style={[styles.statNumber, { fontSize: 24, color: '#03543F' }]}>{data.total_unidades || 0}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Sección: Estatus de Stock */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="Estatus del Stock" 
            titleStyle={styles.cardTitle}
            subtitle="Disponibilidad general de medicamentos y materiales"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {estatusList.length === 0 ? (
              <Text style={styles.emptyText}>No hay datos de inventario.</Text>
            ) : (
              estatusList.map((item, idx) => {
                const itemTotal = parseInt(item?.total) || 0;
                const totalPct = (data.total_insumos || 0) > 0 ? Math.round((itemTotal / data.total_insumos) * 100) : 0;

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <Text style={styles.progressRowName}>{item?.estatus || 'Sin estatus'}</Text>
                      <Text style={styles.progressRowVal}>{itemTotal} insumos ({totalPct}%)</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${totalPct}%`, backgroundColor: COLORS.primary }]} />
                    </View>
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER PRINCIPAL */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Reportes</Text>
          <Text style={styles.subtitle}>Estadísticas consolidadas UPTAEB - DIRPOLES</Text>
        </View>
        
        {/* BOTÓN FLOTANTE PARA EXPORTAR A PDF */}
        <TouchableOpacity 
          style={styles.pdfHeaderButton}
          onPress={exportarPDF}
          disabled={exportingingPdf}
        >
          {exportingingPdf ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Download size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.pdfHeaderButtonText}>PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[COLORS.primary]}
          />
        }
      >
        {/* FILTRO DE PERÍODO */}
        <View style={styles.filterBar}>
          <Filter size={16} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.filterTitle}>Período:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {[
              { id: 'todos', label: 'Histórico' },
              { id: 'mes', label: 'Este Mes' },
              { id: 'semana', label: 'Esta Semana' },
              { id: 'hoy', label: 'Hoy' },
            ].map(p => (
              <Chip
                key={p.id}
                selected={periodo === p.id}
                onPress={() => setPeriodo(p.id)}
                style={[styles.chip, periodo === p.id && styles.chipActive]}
                textStyle={[styles.chipText, periodo === p.id && styles.chipTextActive]}
              >
                {p.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* SEGMENTED CONTROL / SELECTOR DE PESTAÑAS */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentButton, activeSegment === 'beneficiarios' && styles.segmentButtonActive]}
            onPress={() => setActiveSegment('beneficiarios')}
          >
            <Users size={18} color={activeSegment === 'beneficiarios' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.segmentText, activeSegment === 'beneficiarios' && styles.segmentTextActive]}>
              Beneficiarios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentButton, activeSegment === 'citas' && styles.segmentButtonActive]}
            onPress={() => setActiveSegment('citas')}
          >
            <CalendarDays size={18} color={activeSegment === 'citas' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.segmentText, activeSegment === 'citas' && styles.segmentTextActive]}>
              Citas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.segmentButton, activeSegment === 'inventario' && styles.segmentButtonActive]}
            onPress={() => setActiveSegment('inventario')}
          >
            <Package size={18} color={activeSegment === 'inventario' ? COLORS.primary : COLORS.textMuted} />
            <Text style={[styles.segmentText, activeSegment === 'inventario' && styles.segmentTextActive]}>
              Inventario
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO SEGÚN SEGMENTO */}
        {activeSegment === 'beneficiarios' && renderBeneficiariosSection()}
        {activeSegment === 'citas' && renderCitasSection()}
        {activeSegment === 'inventario' && renderInventarioSection()}

        {/* CARD FOOTER: BOTÓN DE EXPORTAR PDF */}
        <Card style={styles.exportCard}>
          <Card.Content>
            <View style={styles.exportRow}>
              <FileText size={28} color={COLORS.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exportTitle}>Generar Informe PDF Formal</Text>
                <Text style={styles.exportDescription}>
                  Exporta las estadísticas consolidadas con formato ejecutivo para presentar ante las autoridades o compartir por WhatsApp y correo.
                </Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 14 }} />
            <Button
              mode="contained"
              onPress={exportarPDF}
              loading={exportingingPdf}
              disabled={exportingingPdf}
              style={styles.exportButton}
              contentStyle={styles.exportButtonContent}
              labelStyle={styles.exportButtonText}
              icon={() => <Download color="#FFF" size={18} />}
            >
              Exportar Reporte a PDF
            </Button>
          </Card.Content>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 15,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pdfHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  pdfHeaderButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    height: 32,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: 16,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statCardText: {
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  visualCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dualBarContainer: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  dualBarLeft: {
    backgroundColor: '#EC4899',
  },
  dualBarRight: {
    backgroundColor: COLORS.primary,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  legendVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressRow: {
    marginBottom: 12,
  },
  progressRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRowName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressRowVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dualGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 16,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  exportCard: {
    marginTop: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  exportDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  exportButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  exportButtonContent: {
    paddingVertical: 6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
