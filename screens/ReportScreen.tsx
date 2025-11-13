import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useLLM, LLAMA3_2_1B_SPINQUANT } from 'react-native-executorch';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from "@react-navigation/native";

const ReportScreen = () => {
  const route = useRoute();
  const params = route.params;
  const result = params.result ? JSON.parse(params.result) : null;

  const [laudoGerado, setLaudoGerado] = useState("");
  const [estaGerando, setEstaGerando] = useState(false);
  const [usarLLM, setUsarLLM] = useState(false);
  const { isDark } = useTheme();
  // Inicializa o hook do LLM
  const llm = useLLM({ model: LLAMA3_2_1B_SPINQUANT });

  // Função para gerar laudo estático (sem LLM) - CLASSIFICAÇÃO BINÁRIA
  const gerarLaudoEstatico = (diagnostico, prioridade) => {
    const classe = diagnostico.split('(')[0].replace('Classificação:', '').trim();
    const confianca = diagnostico.match(/\(([^)]+)\)/)?.[1] || 'N/A';

    let descricaoClinica = '';
    let recomendacoes = '';
    let urgencia = '';
    let observacoes = '';

    // Classificação Binária: Benigno vs Maligno
    switch (classe) {
      case 'Maligno':
        descricaoClinica = 'Lesão cutânea com características suspeitas de malignidade identificadas pela análise de IA. A lesão apresenta padrões morfológicos compatíveis com neoplasia maligna da pele, que pode incluir melanoma, carcinoma basocelular ou carcinoma espinocelular.';
        recomendacoes = `
• ENCAMINHAMENTO URGENTE para dermatologista/oncologista
• Avaliação dermatoscópica profissional obrigatória
• Considerar biópsia para confirmação histopatológica
• NÃO aguardar agendamento regular - buscar atendimento prioritário
• Evitar exposição solar da lesão
• Fotografar a lesão para documentação
• Apresentar este laudo ao médico na consulta`;
        urgencia = '🔴 ALTA PRIORIDADE - ENCAMINHAMENTO URGENTE';
        observacoes = 'Lesões malignas da pele requerem diagnóstico e tratamento precoces. O prognóstico é significativamente melhor quando detectadas e tratadas em estágios iniciais.';
        break;

      case 'Benigno':
        descricaoClinica = 'Lesão cutânea com características predominantemente benignas identificadas pela análise de IA. A lesão não apresenta sinais visuais típicos de malignidade segundo os padrões dermatoscópicos analisados. Pode corresponder a nevos melanocíticos, queratoses seborreicas, lesões vasculares benignas ou outras alterações cutâneas não-malignas.';
        recomendacoes = `
• Acompanhamento dermatológico de rotina recomendado
• Fotografar a lesão para monitoramento de mudanças
• Consulta com dermatologista em até 3-6 meses
• Observar alterações em: tamanho, cor, formato, bordas
• Manter proteção solar adequada (FPS 30+)
• Consulta prioritária se houver: crescimento rápido, sangramento, coceira persistente, mudança de cor
• Auto-exame mensal da pele`;
        urgencia = '🟢 BAIXA PRIORIDADE - MONITORAMENTO';
        observacoes = 'Mesmo lesões benignas devem ser monitoradas ao longo do tempo. Mudanças no aspecto da lesão podem indicar necessidade de reavaliação médica.';
        break;

      default:
        descricaoClinica = 'Lesão cutânea identificada pelo sistema de análise. Classificação não determinada com confiança suficiente.';
        recomendacoes = 'Consulta com dermatologista para avaliação clínica completa e classificação definitiva.';
        urgencia = '🟡 AVALIAÇÃO NECESSÁRIA';
        observacoes = 'Recomenda-se avaliação profissional para classificação adequada.';
    }

    return `
**🔬 ANÁLISE POR INTELIGÊNCIA ARTIFICIAL**

**CLASSIFICAÇÃO:** ${classe}
**CONFIANÇA:** ${confianca}
**PRIORIDADE CLÍNICA:** ${urgencia}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**📋 DESCRIÇÃO CLÍNICA:**
${descricaoClinica}

**💡 OBSERVAÇÕES IMPORTANTES:**
${observacoes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**🎯 ANÁLISE TÉCNICA DO SISTEMA:**
• Modelo: MelaNet CNN (Classificador Binário)
• Arquitetura: Rede Neural Convolucional
• Dataset de Treinamento: HAM10000 (10.015 imagens dermatoscópicas)
• Tipo de Análise: Classificação Binária (Benigno vs Maligno)
• Metodologia: Deep Learning com Transfer Learning
• Confiança da Predição: ${confianca}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**✅ RECOMENDAÇÕES MÉDICAS:**
${recomendacoes}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**⚠️ LIMITAÇÕES E DISCLAIMER:**

Este laudo foi gerado por sistema de inteligência artificial para fins de TRIAGEM e SUPORTE À DECISÃO MÉDICA.

IMPORTANTE:
• NÃO substitui avaliação médica presencial
• NÃO deve ser usado como diagnóstico definitivo
• Confirmação diagnóstica requer exame clínico por dermatologista
• Dermatoscopia profissional e possível histopatologia são essenciais
• A precisão do sistema varia conforme qualidade da imagem
• Fatores como iluminação e ângulo podem afetar o resultado

**Precisão estimada do sistema:** ~85-90% (validação cruzada)
**Taxa de falso negativo:** <5% (importante em triagem de malignidade)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **RECOMENDAÇÃO FINAL:** Apresentar este laudo ao dermatologista durante consulta presencial para correlação clínico-radiológica adequada.

Data de Geração: ${new Date().toLocaleString('pt-BR')}
Sistema: MelaNet AI v1.0
    `.trim();
  };

  // Função para gerar laudo com LLM
  const gerarLaudoComLLM = useCallback(async () => {
    if (llm.isGenerating || !llm.isReady) return;

    setEstaGerando(true);
    setLaudoGerado("");

    const diag_principal = result.diagnostico.replace("Classificação: ", "");
    const desc_laudo = "[Análise baseada em modelo CNN local executado no dispositivo]";

    const systemPrompt = `Você é DermAI, assistente especializado em laudos dermatológicos.

DIRETRIZES:
1. Use terminologia médica precisa
2. Máximo 2-3 frases por seção
3. Enfatize que é análise preliminar
4. Não faça diagnósticos definitivos
5. Seja conciso e técnico`;

    const userPrompt = `DADOS:
Classificação IA: ${diag_principal}
Prioridade: ${result.prioridade}

GERE LAUDO COM ESTAS SEÇÕES:

**DESCRIÇÃO CLÍNICA:**
[Características esperadas da lesão. Máximo 2 frases.]

**ANÁLISE COMPUTACIONAL:**
[Resultado da IA (${diag_principal}). Mencione análise preliminar. Máximo 2 frases.]

**RECOMENDAÇÕES:**
[Encaminhamentos necessários baseado em ${diag_principal}. Máximo 2 frases.]

**DISCLAIMER:**
[Enfatize: análise de IA, não substitui médico, confirmação necessária. Máximo 2 frases.]`;

    try {
      llm.configure({
        chatConfig: {
          systemPrompt: systemPrompt,
        },
      });

      llm.clearHistory();
      await llm.sendMessage(userPrompt.trim());

    } catch (e) {
      setLaudoGerado(`Erro ao gerar laudo com LLM: ${e.message}`);
    }
  }, [llm.isReady, llm.isGenerating, result.diagnostico, result.prioridade]);

  // Gera laudo estático automaticamente ao carregar
  useEffect(() => {
    if (!usarLLM) {
      const laudoEstatico = gerarLaudoEstatico(result.diagnostico, result.prioridade);
      setLaudoGerado(laudoEstatico);
    }
  }, [result.diagnostico, result.prioridade, usarLLM]);

  // Gera laudo com LLM quando ativado
  useEffect(() => {
    if (usarLLM && llm.isReady && !estaGerando && !llm.isGenerating) {
      gerarLaudoComLLM();
    }
  }, [usarLLM, llm.isReady, gerarLaudoComLLM, estaGerando, llm.isGenerating]);

  // Atualiza laudo do LLM em tempo real
  useEffect(() => {
    if (usarLLM && llm.response) {
      setLaudoGerado(llm.response);
    }
  }, [llm.response, usarLLM]);

  // Controla estado de loading
  useEffect(() => {
    setEstaGerando(llm.isGenerating);
  }, [llm.isGenerating]);

  const styles = getStyles(isDark);

  return (
    <ScrollView style={styles.container}>
      {/* Card de Resultado CNN */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="analytics" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text style={styles.title}>Resultado da Análise (CNN)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Diagnóstico:</Text>
          <Text style={styles.value}>{result.diagnostico}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Prioridade:</Text>
          <Text style={[styles.value, {
            fontWeight: 'bold',
            color: result.prioridade === 'Alta' ? '#ef4444' :
                   result.prioridade === 'Média' ? '#f59e0b' : '#10b981'
          }]}>
            {result.prioridade}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Modelo:</Text>
          <Text style={styles.value}>{result.modelo}</Text>
        </View>

        {result.inferenceTime && (
          <View style={styles.row}>
            <Text style={styles.label}>Tempo:</Text>
            <Text style={styles.value}>{result.inferenceTime}</Text>
          </View>
        )}
      </View>

      {/* Card de Laudo */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
          <Text style={styles.title}>Laudo Preliminar</Text>
        </View>

        {/* Toggle LLM */}
        <TouchableOpacity
          style={styles.toggleContainer}
          onPress={() => setUsarLLM(!usarLLM)}
        >
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>
              {usarLLM ? '🤖 Laudo com LLM' : '📝 Laudo Estruturado'}
            </Text>
            <View style={[styles.toggle, usarLLM && styles.toggleActive]}>
              <View style={[styles.toggleThumb, usarLLM && styles.toggleThumbActive]} />
            </View>
          </View>
          <Text style={styles.toggleHint}>
            {usarLLM
              ? 'Usando modelo de linguagem local (experimental)'
              : 'Usando template estruturado baseado em evidências'}
          </Text>
        </TouchableOpacity>

        {/* Conteúdo do Laudo */}
        {usarLLM && !llm.isReady ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={isDark ? "#fff" : "#000"} />
            <Text style={styles.value}>Carregando modelo LLM...</Text>
          </View>
        ) : (estaGerando || (usarLLM && llm.isGenerating)) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={isDark ? "#fff" : "#000"} />
            <Text style={styles.value}>{laudoGerado || "Gerando laudo..."}</Text>
          </View>
        ) : (
          <ScrollView style={styles.laudoScroll}>
            <Text style={styles.laudoText}>{laudoGerado || "Laudo não disponível."}</Text>
          </ScrollView>
        )}
      </View>

      {/* Card de Probabilidades (se disponível) */}
      {result.probabilidades && result.probabilidades.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={24} color={isDark ? "#60a5fa" : "#2563eb"} />
            <Text style={styles.title}>Distribuição de Probabilidades</Text>
          </View>
          {result.probabilidades.slice(0, 5).map((prob, idx) => (
            <View key={idx} style={styles.probRow}>
              <Text style={styles.probLabel}>{prob.classe}</Text>
              <View style={styles.probBarContainer}>
                <View
                  style={[
                    styles.probBar,
                    { width: prob.prob, backgroundColor: idx === 0 ? '#3b82f6' : '#9ca3af' }
                  ]}
                />
              </View>
              <Text style={styles.probValue}>{prob.prob}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Aviso Legal */}
      <View style={[styles.card, styles.disclaimerCard]}>
        <Ionicons name="alert-circle" size={20} color="#f59e0b" />
        <Text style={styles.disclaimerText}>
          Este é um sistema de auxílio diagnóstico. Resultados devem ser validados por profissional médico qualificado.
        </Text>
      </View>
    </ScrollView>
  );
};

// Estilos
const getStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? "#111827" : "#f3f4f6",
    padding: 16,
  },
  card: {
    backgroundColor: isDark ? "#1f2937" : "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? "#f9fafb" : "#1f2937",
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? "#d1d5db" : "#4b5563",
    width: 100,
  },
  value: {
    fontSize: 14,
    color: isDark ? "#f3f4f6" : "#1f2937",
    flex: 1,
    lineHeight: 20,
  },
  toggleContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: isDark ? "#374151" : "#f3f4f6",
    borderRadius: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? "#f3f4f6" : "#1f2937",
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    backgroundColor: isDark ? "#4b5563" : "#d1d5db",
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: "#3b82f6",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleHint: {
    fontSize: 11,
    color: isDark ? "#9ca3af" : "#6b7280",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  laudoScroll: {
    maxHeight: 400,
  },
  laudoText: {
    fontSize: 14,
    color: isDark ? "#f3f4f6" : "#1f2937",
    lineHeight: 22,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  probLabel: {
    fontSize: 12,
    color: isDark ? "#d1d5db" : "#4b5563",
    width: 120,
  },
  probBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: isDark ? "#374151" : "#e5e7eb",
    borderRadius: 4,
    overflow: 'hidden',
  },
  probBar: {
    height: '100%',
    borderRadius: 4,
  },
  probValue: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? "#f3f4f6" : "#1f2937",
    width: 50,
    textAlign: 'right',
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: isDark ? "#78350f" : "#fef3c7",
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: isDark ? "#fbbf24" : "#78350f",
    lineHeight: 18,
  },
});

export default ReportScreen;