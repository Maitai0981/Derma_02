import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

// Constantes de normalização ImageNet
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

// Classificação Binária
const CLASSES = [
  "Benigno",
  "Maligno",
];

const PRIORIDADE = {
  "Benigno": "Baixa",
  "Maligno": "Alta",
};

/**
 * Converte URI de imagem em tensor Float32Array
 * IMPORTANTE: Esta é uma implementação simplificada para desenvolvimento
 * Para produção, use processamento nativo ou servidor
 */
export async function imageUriToTensor(uri) {
  try {
    const startTime = Date.now();
    console.log('=== [Tensor] INÍCIO DA CONVERSÃO ===');
    console.log('[Tensor] URI da imagem:', uri);
    console.log('[Tensor] Timestamp:', new Date().toISOString());

    // 1. Redimensionar imagem com react-native-image-resizer
    console.log('[Tensor] Passo 1/4: Redimensionando imagem para 224x224...');
    const resized = await ImageResizer.createResizedImage(
      uri,
      224,
      224,
      'JPEG', // Formato
      90,     // Qualidade (0-100)
      0       // Rotação
    );
    console.log('[Tensor] ✓ Imagem redimensionada:', resized.uri);

    // 2. Ler imagem como base64 com react-native-fs
    console.log('[Tensor] Passo 2/4: Lendo imagem como base64...');
    const base64 = await RNFS.readFile(resized.uri, 'base64');
    console.log('[Tensor] ✓ Base64 lido, tamanho:', base64.length, 'bytes');

    // 3. Decodificar pixels (implementação simulada mantida)
    console.log('[Tensor] Passo 3/4: Decodificando pixels...');
    const pixels = await decodeBase64ToPixels(base64);
    console.log('[Tensor] ✓ Pixels decodificados, array size:', pixels.length);

    // 4. Normalizar e converter para NCHW
    console.log('[Tensor] Passo 4/4: Normalizando e formatando tensor...');
    const tensor = normalizeAndFormatTensor(pixels);

    const elapsedTime = Date.now() - startTime;
    console.log('[Tensor] ✓ Tensor criado:');
    console.log('[Tensor]   - Shape:', tensor.sizes);
    console.log('[Tensor]   - ScalarType:', tensor.scalarType, '(FLOAT)');
    console.log('[Tensor]   - DataPtr length:', tensor.dataPtr.length);
    console.log('[Tensor]   - Tempo total:', elapsedTime, 'ms');
    console.log('=== [Tensor] CONVERSÃO CONCLUÍDA ===\n');
    return tensor;
  } catch (error) {
    console.error('=== [Tensor] ERRO NA CONVERSÃO ===');
    console.error('[Tensor] Erro:', error);
    console.error('[Tensor] Stack:', error.stack);
    throw new Error('Falha ao processar imagem');
  }
}

/**
 * Decodifica base64 para array de pixels
 * NOTA: Implementação simplificada - use lib nativa para produção
 * (Esta função não dependia do Expo e foi mantida como estava)
 */
async function decodeBase64ToPixels(base64) {
  // Para desenvolvimento, retorna pixels simulados
  // Em produção, implemente decodificação JPEG/PNG real
  console.warn('[Tensor] Usando pixels simulados - implemente decodificação real');
  
  const size = 224 * 224 * 3;
  const pixels = new Uint8Array(size);
  
  // Simula pixels variados baseados no hash do base64
  const hash = base64.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  for (let i = 0; i < size; i++) {
    pixels[i] = Math.abs((hash + i) % 256);
  }
  
  return pixels;
}

/**
 * Normaliza pixels e formata para NCHW
 * Retorna TensorPtr para compatibilidade com ExecutorchModule
 */
function normalizeAndFormatTensor(pixels) {
  const dataPtr = new Float32Array(1 * 3 * 224 * 224);
  let idx = 0;

  // NCHW: Batch, Channel, Height, Width
  for (let c = 0; c < 3; c++) {
    for (let h = 0; h < 224; h++) {
      for (let w = 0; w < 224; w++) {
        const pixelIdx = (h * 224 + w) * 3 + c;
        const value = pixels[pixelIdx] / 255.0;
        const normalized = (value - MEAN[c]) / STD[c];
        dataPtr[idx++] = normalized;
      }
    }
  }

  // Retornar TensorPtr com formato esperado pelo ExecutorchModule
  return {
    dataPtr: dataPtr,
    sizes: [1, 3, 224, 224], // [batch, channels, height, width]
    scalarType: 6, // ScalarType.FLOAT
  };
}

/**
 * Processa saída do modelo (logits) e retorna classificação
 * Aceita TensorPtr ou array
 * CLASSIFICAÇÃO BINÁRIA: Benigno vs Maligno
 */
export function processOutputTensor(outputTensor) {
  try {
    const startTime = Date.now();
    console.log('=== [Tensor] INÍCIO DO PROCESSAMENTO DE SAÍDA ===');
    console.log('[Tensor] Timestamp:', new Date().toISOString());

    // Se for TensorPtr, extrair o dataPtr
    let logits;
    if (outputTensor && outputTensor.dataPtr) {
      console.log('[Tensor] Tipo de entrada: TensorPtr');
      console.log('[Tensor] Shape da saída:', outputTensor.sizes);
      logits = Array.from(outputTensor.dataPtr);
    } else if (Array.isArray(outputTensor)) {
      console.log('[Tensor] Tipo de entrada: Array');
      logits = outputTensor;
    } else {
      console.log('[Tensor] Tipo de entrada: TypedArray ou outro');
      logits = Array.from(outputTensor);
    }

    console.log('[Tensor] Logits brutos (raw model output):', logits);
    console.log('[Tensor] Número de classes:', logits.length);

    // Validar que temos exatamente 2 saídas para classificação binária
    if (logits.length !== 2) {
      console.warn(`[Tensor] ⚠️ AVISO: Esperado 2 logits (binário), recebido ${logits.length}`);
    }

    // Aplicar softmax
    console.log('[Tensor] Aplicando função softmax...');
    const maxLogit = Math.max(...logits);
    console.log('[Tensor] Max logit:', maxLogit);

    const expScores = logits.map(x => Math.exp(x - maxLogit));
    console.log('[Tensor] Exp scores:', expScores);

    const sumExp = expScores.reduce((a, b) => a + b, 0);
    console.log('[Tensor] Sum exp:', sumExp);

    const probabilities = expScores.map(x => x / sumExp);
    console.log('[Tensor] Probabilidades após softmax:', probabilities);

    // Encontrar classe com maior probabilidade
    let maxProb = -1;
    let maxIndex = -1;

    probabilities.forEach((prob, idx) => {
      console.log(`[Tensor] Classe ${CLASSES[idx]}: ${(prob * 100).toFixed(2)}%`);
      if (prob > maxProb) {
        maxProb = prob;
        maxIndex = idx;
      }
    });

    const classificacao = CLASSES[maxIndex] || "Desconhecida";
    const confianca = `${(maxProb * 100).toFixed(2)}%`;
    const prioridade = PRIORIDADE[classificacao] || "Baixa";

    const elapsedTime = Date.now() - startTime;

    console.log('[Tensor] ✓ RESULTADO FINAL:');
    console.log('[Tensor]   - Classificação:', classificacao);
    console.log('[Tensor]   - Confiança:', confianca);
    console.log('[Tensor]   - Prioridade:', prioridade);
    console.log('[Tensor]   - Tempo de processamento:', elapsedTime, 'ms');
    console.log('=== [Tensor] PROCESSAMENTO CONCLUÍDO ===\n');

    return {
      classificacao,
      confianca,
      prioridade,
      probabilidades: probabilities.map((p, i) => ({
        classe: CLASSES[i],
        prob: (p * 100).toFixed(2) + '%'
      })).sort((a, b) => parseFloat(b.prob) - parseFloat(a.prob))
    };
  } catch (error) {
    console.error('=== [Tensor] ERRO NO PROCESSAMENTO ===');
    console.error('[Tensor] Erro:', error);
    console.error('[Tensor] Stack:', error.stack);
    throw new Error('Falha no pós-processamento');
  }
}
