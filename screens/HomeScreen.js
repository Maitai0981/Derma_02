import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';

import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { torch } from 'react-native-executorch';
import { imageUriToTensor, processOutputTensor } from '../utils/tensorUtils';

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState(null);
  const [modelStatus, setModelStatus] = useState('unloaded');

  const modelStatusText = {
    loaded: 'Pronto',
    loading: 'Carregando...',
    error: 'Erro ao carregar',
    unloaded: 'Aguardando',
  }[modelStatus];

  useEffect(() => {
    loadModel();
  }, []);

  /** -----------------------
   *  CARREGA O MODELO
   * ------------------------ */
  const loadModel = async () => {
    try {
      console.log('[Model] Carregando melanet.pte...');
      setModelStatus('loading');

      const loadedModel = await torch.jit.load(
        require('../assets/models/melanet.pte')
      );

      setModel(loadedModel);
      setModelStatus('loaded');
      console.log('[Model] Modelo carregado!');
    } catch (error) {
      console.error('[Model] Erro ao carregar modelo:', error);
      setModelStatus('error');
    }
  };

  /** -----------------------------------
   *  ABRIR CÂMERA (RN IMAGE PICKER)
   * ----------------------------------- */
  const handleCaptureImage = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 1,
      includeBase64: false,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (asset?.uri) setImageUri(asset.uri);
  };

  /** -----------------------------------
   *  SELECIONAR DA GALERIA
   * ----------------------------------- */
  const handleSelectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      includeBase64: false,
    });

    if (result.didCancel) return;

    const asset = result.assets?.[0];
    if (asset?.uri) setImageUri(asset.uri);
  };

  const handleAnalyze = async () => {
    if (!imageUri) return Alert.alert('Escolha uma imagem');

    if (!model) {
      return Alert.alert('Modelo não carregado');
    }

    setIsLoading(true);

    try {
      console.log('[Analyze] Convertendo para tensor...');
      const inputTensor = await imageUriToTensor(imageUri);

      console.log('[Analyze] Rodando o modelo...');
      const t0 = Date.now();

      const output = await model.forward(inputTensor);

      const inferenceTime = Date.now() - t0;
      console.log('[Analyze] Inferência em:', inferenceTime, 'ms');

      const resultado = processOutputTensor(output);

      Alert.alert(
        'Resultado',
        `Classe: ${resultado.classificacao}\nConfiança: ${resultado.confianca}`
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>
          Análise de Lesões Cutâneas
        </Text>

        {/* Status do modelo */}
        <TouchableOpacity
          onPress={loadModel}
          style={{
            padding: 12,
            backgroundColor: '#EEE',
            borderRadius: 10,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor:
                modelStatus === 'loaded'
                  ? 'green'
                  : modelStatus === 'error'
                  ? 'red'
                  : 'orange',
              marginRight: 10,
            }}
          />
          <Text>Modelo Local: {modelStatusText}</Text>
        </TouchableOpacity>

        {/* Botões */}
        <TouchableOpacity
          onPress={handleCaptureImage}
          style={{
            padding: 14,
            backgroundColor: '#2563EB',
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: '#FFF', textAlign: 'center' }}>
            Capturar Imagem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSelectImage}
          style={{
            padding: 14,
            backgroundColor: '#6B7280',
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#FFF', textAlign: 'center' }}>
            Importar da Galeria
          </Text>
        </TouchableOpacity>

        {/* Preview */}
        {imageUri && (
          <View style={{ marginTop: 20 }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 300, borderRadius: 12 }}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={{
                position: 'absolute',
                right: 10,
                top: 10,
                backgroundColor: '#0008',
                padding: 6,
                borderRadius: 20,
              }}
            >
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAnalyze}
              disabled={isLoading || modelStatus !== 'loaded'}
              style={{
                padding: 14,
                backgroundColor: '#10B981',
                marginTop: 20,
                borderRadius: 10,
                opacity: modelStatus === 'loaded' ? 1 : 0.6,
              }}
            >
              <Text style={{ textAlign: 'center', color: '#FFF' }}>
                {isLoading ? 'Analisando...' : 'Analisar com IA Local'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
