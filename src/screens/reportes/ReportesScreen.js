import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Platform,
  StatusBar
} from 'react-native';
import { Card, Button, Divider } from 'react-native-paper';
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
  Sparkles
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useReportes } from '../../hooks/useReportes';

/**
 * PANTALLA: Reportes Estadísticos Consolidados (SOLID: Capa de Presentación Única)
 * 
 * Renderiza un dashboard gerencial interactivo de alto impacto visual. Muestra
 * métricas críticas de Beneficiarios, Citas e Inventario Médico mediante
 * medidores y micro-indicadores proporcionales, sin dependencias propensas a errores.
 */
export default function ReportesScreen() {
  const {
    reporteData,
    loading,
    refreshing,
    error,
    handleRefresh,
    abrirReporteWeb
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
    const data = reporteData?.beneficiarios || { total: 0, genero: [], pnf: [] };
    
    // Calcular distribución de género
    let femeninoCount = 0;
    let masculinoCount = 0;
    data.genero.forEach(g => {
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
              <Text style={styles.statNumber}>{data.total}</Text>
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
            subtitle="Top 5 programas académicos"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {data.pnf.length === 0 ? (
              <Text style={styles.emptyText}>No hay datos de PNF registrados.</Text>
            ) : (
              data.pnf.map((p, idx) => {
                const maxVal = parseInt(data.pnf[0]?.total) || 1;
                const progressPct = Math.round((parseInt(p.total) / maxVal) * 100);

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <Text style={styles.progressRowName} numberOfLines={1}>
                        {p.nombre_pnf || 'Desconocido'}
                      </Text>
                      <Text style={styles.progressRowVal}>{p.total}</Text>
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
    const data = reporteData?.citas || { total: 0, estados: [] };

    // Mapear iconos y colores para los estados
    const getStatusConfig = (statusName) => {
      const name = statusName.toLowerCase();
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
              <Text style={styles.statNumber}>{data.total}</Text>
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
            {data.estados.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de citas.</Text>
            ) : (
              data.estados.map((item, idx) => {
                const config = getStatusConfig(item.estado);
                const itemTotal = parseInt(item.total) || 0;
                const totalPct = data.total > 0 ? Math.round((itemTotal / data.total) * 100) : 0;
                const StatusIcon = config.icon;

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <View style={styles.iconLabelGroup}>
                        <StatusIcon size={16} color={config.color} style={{ marginRight: 6 }} />
                        <Text style={styles.progressRowName}>{item.estado}</Text>
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
    const data = reporteData?.inventario || { total_insumos: 0, total_unidades: 0, estatus: [], tipos: [] };

    const getStockConfig = (estatusName) => {
      const name = estatusName.toLowerCase();
      if (name.includes('disponibl') || name.includes('activo')) return { color: COLORS.accent };
      if (name.includes('vencid')) return { color: COLORS.danger };
      return { color: COLORS.warning };
    };

    return (
      <View style={styles.sectionContainer}>
        {/* Grid Dual de Cards */}
        <View style={styles.dualGrid}>
          <Card style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <Card.Content style={[styles.statCardContent, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primaryLight, width: 40, height: 40 }]}>
                <Package size={22} color={COLORS.primary} />
              </View>
              <Text style={[styles.statLabel, { fontSize: 11 }]}>Tipos de Insumos</Text>
              <Text style={[styles.statNumber, { fontSize: 22 }]}>{data.total_insumos}</Text>
            </Card.Content>
          </Card>

          <Card style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
            <Card.Content style={[styles.statCardContent, { flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
              <View style={[styles.iconContainer, { backgroundColor: '#DEF7EC', width: 40, height: 40 }]}>
                <TrendingUp size={22} color={COLORS.accent} />
              </View>
              <Text style={[styles.statLabel, { fontSize: 11 }]}>Unidades Totales</Text>
              <Text style={[styles.statNumber, { fontSize: 22 }]}>{data.total_unidades}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Sección: Condición del Stock */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="Condición del Inventario" 
            titleStyle={styles.cardTitle}
            subtitle="Condición médica y alertas de vencimiento"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {data.estatus.length === 0 ? (
              <Text style={styles.emptyText}>No hay insumos registrados en el inventario.</Text>
            ) : (
              data.estatus.map((item, idx) => {
                const config = getStockConfig(item.estatus);
                const itemTotal = parseInt(item.total) || 0;
                const totalPct = data.total_insumos > 0 ? Math.round((itemTotal / data.total_insumos) * 100) : 0;

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <Text style={styles.progressRowName}>{item.estatus}</Text>
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

        {/* Sección: Clasificación */}
        <Card style={styles.visualCard}>
          <Card.Title 
            title="Clasificación por Tipo" 
            titleStyle={styles.cardTitle}
            subtitle="Medicamentos vs Material Médico e Instrumental"
            subtitleStyle={styles.cardSubtitle}
          />
          <Card.Content>
            {data.tipos.length === 0 ? (
              <Text style={styles.emptyText}>No hay datos clasificados.</Text>
            ) : (
              data.tipos.map((item, idx) => {
                const itemTotal = parseInt(item.total) || 0;
                const totalPct = data.total_insumos > 0 ? Math.round((itemTotal / data.total_insumos) * 100) : 0;

                return (
                  <View key={idx} style={styles.progressRow}>
                    <View style={styles.progressRowHeader}>
                      <View style={styles.iconLabelGroup}>
                        <Layers size={16} color={COLORS.secondary} style={{ marginRight: 6 }} />
                        <Text style={styles.progressRowName}>{item.tipo}</Text>
                      </View>
                      <Text style={styles.progressRowVal}>{itemTotal} u.</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${totalPct}%`, backgroundColor: COLORS.secondary }]} />
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
      {/* CABECERA PREMIUM */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Estadísticas</Text>
          <Text style={styles.subtitle}>Reportes gerenciales consolidados de DIRPOLES</Text>
        </View>
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

        {/* CARD FOOTER: REDIRECCIÓN WEB PARA EXPORTAR PDF */}
        <Card style={styles.exportCard}>
          <Card.Content>
            <View style={styles.exportRow}>
              <FileText size={28} color={COLORS.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exportTitle}>Reportes Oficiales PDF / Excel</Text>
                <Text style={styles.exportDescription}>
                  Para descargar actas de auditoría impresas o reportes filtrados formalmente, por favor utilice el portal web del sistema DIRPOLES.
                </Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 14 }} />
            <Button
              mode="contained"
              onPress={abrirReporteWeb}
              style={styles.exportButton}
              contentStyle={styles.exportButtonContent}
              labelStyle={styles.exportButtonText}
              icon={() => <ArrowRight color="#FFF" size={18} />}
            >
              Acceder a Reportes Web
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
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 20,
    paddingBottom: 15,
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
  scrollContent: {
    paddingHorizontal: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: 16,
  },
  statCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statCardText: {
    marginLeft: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  visualCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  dualBarContainer: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  dualBarLeft: {
    backgroundColor: '#EC4899', // Pink
  },
  dualBarRight: {
    backgroundColor: COLORS.primary, // Blue
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  legendVal: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 1,
  },
  progressRow: {
    marginBottom: 16,
  },
  progressRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRowName: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '75%',
  },
  progressRowVal: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dualGrid: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 13,
    marginVertical: 12,
  },
  exportCard: {
    borderRadius: 20,
    backgroundColor: '#EFF6FF', // Light blue tint
    elevation: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  exportDescription: {
    fontSize: 12,
    color: COLORS.primaryDark,
    lineHeight: 18,
    opacity: 0.85,
  },
  exportButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  exportButtonContent: {
    paddingVertical: 4,
    flexDirection: 'row-reverse',
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
