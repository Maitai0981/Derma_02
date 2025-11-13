import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { imageUriToTensor, processOutputTensor } from '../utils/tensorUtils';
import { useTheme } from '../context/ThemeContext';

// Definindo tipos
type ModelStatus = 'unloaded' | 'loading' | 'loaded' | 'error';
type ModelResult = {
  classificacao: string;
  confianca: string;
  prioridade: 'Alta' | 'Baixa';
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [model, setModel] = useState<any>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('unloaded');

  const modelStatusText = {
    loaded: 'Pronto',
    loading: 'Carregando...',
    error: 'Erro ao carregar',
    unloaded: 'Aguardando',
  }[modelStatus];

  // Carregar o modelo manualmente (sem Expo)
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('========================================');
        console.log('[Model] Iniciando carregamento do modelo');
        console.log('[Model] Arquivo: malenet.pte');
        console.log('[Model] Timestamp:', new Date().toISOString());
        console.log('========================================');

        setModelStatus('loading');

        // Nota: O carregamento do modelo ExecuTorch requer configuração nativa
        // Por enquanto, apenas simulamos o estado de "loaded" para testar a UI
        // A implementação completa requer binding nativo do ExecuTorch

        console.log('[Model] ⚠️  AVISO: Carregamento de modelo ExecuTorch requer implementação nativa');
        console.log('[Model] UI está funcionando - modelo será integrado posteriormente');

        // Simular carregamento para testar a UI
        setTimeout(() => {
          setModelStatus('loaded');
          console.log('========================================');
          console.log('[Model] ✓ UI pronta (modelo pendente de integração nativa)');
          console.log('========================================');
        }, 1000);

      } catch (error) {
        console.log('========================================');
        console.error('[Model] ✗ ERRO ao carregar modelo');
        console.error('[Model] Mensagem:', error);
        console.log('========================================');
        setModelStatus('error');
      }
    };

    loadModel();
  }, []);

  const handleCaptureImage = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      includeBase64: false,
    });

    if (result.didCancel) return;

    const asset: Asset | undefined = result.assets?.[0];
    if (asset?.uri) setImageUri(asset.uri);
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    });

    if (result.didCancel) return;

    const asset: Asset | undefined = result.assets?.[0];
    if (asset?.uri) setImageUri(asset.uri);
  };

  const handleAnalyze = async () => {
    if (!imageUri) return Alert.alert('Atenção', 'Escolha uma imagem primeiro');
    if (modelStatus !== 'loaded') return Alert.alert('Erro', 'Modelo não carregado');

    setIsAnalyzing(true);

    try {
      console.log('========================================');
      console.log('[Analyze] Iniciando análise da imagem');
      console.log('[Analyze] URI:', imageUri);
      console.log('[Analyze] Timestamp:', new Date().toISOString());
      console.log('========================================');

      console.log('[Analyze] ETAPA 1: Convertendo imagem para tensor...');
      const tensorStartTime = Date.now();
      const inputTensor = await imageUriToTensor(imageUri);
      const tensorTime = Date.now() - tensorStartTime;
      console.log('[Analyze] ✓ Tensor criado em', tensorTime, 'ms');

      console.log('[Analyze] ETAPA 2: Simulando inferência do modelo...');
      console.log('[Analyze] ⚠️  NOTA: Inferência real requer binding nativo do ExecuTorch');
      console.log('[Analyze] Modelo: malenet.pte (Classificação Binária)');
      const inferenceStartTime = Date.now();

      // Simular saída do modelo para teste da UI (CLASSIFICAÇÃO BINÁRIA)
      // Em produção, isso será substituído por: const output = await model.forward([inputTensor]);
      // Simulando diferentes cenários de saída
      const scenario = Math.random();
      let mockLogits;

      if (scenario < 0.5) {
        // Cenário 1: Alta probabilidade de Benigno
        mockLogits = [2.5, -1.2]; // [Benigno, Maligno]
        console.log('[Analyze] Cenário de teste: Alta probabilidade BENIGNO');
      } else {
        // Cenário 2: Alta probabilidade de Maligno
        mockLogits = [-1.8, 3.1]; // [Benigno, Maligno]
        console.log('[Analyze] Cenário de teste: Alta probabilidade MALIGNO');
      }

      const mockOutput = {
        dataPtr: new Float32Array(mockLogits),
        sizes: [1, 2], // Binário: Benigno e Maligno
        scalarType: 6,
      };

      console.log('[Analyze] Logits simulados:', mockLogits);
      const inferenceTime = Date.now() - inferenceStartTime;
      console.log('[Analyze] ✓ Inferência simulada em', inferenceTime, 'ms');

      console.log('[Analyze] ETAPA 3: Processando saída do modelo...');
      const processStartTime = Date.now();
      const resultado: ModelResult = processOutputTensor(mockOutput);
      const processTime = Date.now() - processStartTime;
      console.log('[Analyze] ✓ Processamento concluído em', processTime, 'ms');

      const totalTime = tensorTime + inferenceTime + processTime;
      console.log('========================================');
      console.log('[Analyze] ✓ ANÁLISE COMPLETA (SIMULADA)');
      console.log('[Analyze] Resultado:', resultado.classificacao);
      console.log('[Analyze] Confiança:', resultado.confianca);
      console.log('[Analyze] Tempo total:', totalTime, 'ms');
      console.log('[Analyze]   - Tensor:', tensorTime, 'ms');
      console.log('[Analyze]   - Inferência:', inferenceTime, 'ms');
      console.log('[Analyze]   - Processamento:', processTime, 'ms');
      console.log('========================================');

      // Navegar para a tela de relatório com os resultados
      const reportData = {
        diagnostico: `Classificação: ${resultado.classificacao}`,
        prioridade: resultado.prioridade,
        modelo: 'MelaNet CNN (Demo)',
        inferenceTime: `${totalTime}ms`,
      };

      navigation.navigate('Report', { result: JSON.stringify(reportData) });
    } catch (err: any) {
      console.log('========================================');
      console.error('[Analyze] ✗ ERRO durante análise');
      console.error('[Analyze] Tipo do erro:', err?.constructor?.name || typeof err);
      console.error('[Analyze] Mensagem:', err?.message || String(err));
      console.error('[Analyze] Stack:', err?.stack || 'N/A');
      console.log('========================================');
      Alert.alert('Erro', err.message || 'Erro desconhecido durante análise');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const styles = getStyles(theme);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Análise de Lesões Cutâneas</Text>
        <Text style={styles.subtitle}>
          Capture ou selecione uma imagem para análise por IA
        </Text>

        {/* Status do modelo */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  modelStatus === 'loaded'
                    ? theme.success
                    : modelStatus === 'error'
                    ? theme.error
                    : theme.warning,
              },
            ]}
          />
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusLabel}>Modelo CNN Local</Text>
            <Text style={styles.statusText}>{modelStatusText}</Text>
          </View>
          <Ionicons
            name="info-circle"
            size={20}
            color={theme.subtext}
            style={styles.refreshIcon}
          />
        </View>

        {/* Botões de captura/seleção */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleCaptureImage}
            style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          >
            <Ionicons name="camera" size={24} color={theme.buttonText} />
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Capturar Imagem
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSelectImage}
            style={[styles.button, { backgroundColor: theme.success }]}
          >
            <Ionicons name="images" size={24} color="#ffffff" />
            <Text style={styles.buttonText}>Importar da Galeria</Text>
          </TouchableOpacity>
        </View>

        {/* Preview da imagem */}
        {imageUri && (
          <View style={styles.previewCard}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isAnalyzing || modelStatus !== 'loaded'}
              style={[
                styles.analyzeButton,
                { backgroundColor: theme.warning },
                (isAnalyzing || modelStatus !== 'loaded') && styles.buttonDisabled,
              ]}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color="#111827" size="small" />
                  <Text style={[styles.buttonText, { color: '#111827', marginLeft: 8 }]}>
                    Analisando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics" size={24} color="#111827" />
                  <Text style={[styles.buttonText, { color: '#111827' }]}>
                    Analisar com IA Local
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    scrollView: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: theme.spacing.lg,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: 'bold',
      color: theme.primary,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.subtext,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardBackground,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.md,
    },
    statusIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: theme.spacing.md,
    },
    statusTextContainer: {
      flex: 1,
    },
    statusLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.subtext,
      marginBottom: 2,
    },
    statusText: {
      fontSize: theme.fontSize.md,
      color: theme.text,
      fontWeight: '600',
    },
    refreshIcon: {
      marginLeft: theme.spacing.sm,
    },
    buttonContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    buttonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: '#ffffff',
    },
    previewCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.lg,
    },
    imageContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: theme.borderRadius.lg,
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing.sm,
      top: theme.spacing.sm,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    analyzeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.md,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });