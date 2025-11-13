import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const theme = useTheme();

  const openHelpLink = () => {
    Linking.openURL(
      'https://profissoes.vagas.com.br/wp-content/uploads/2020/12/voce-sabe-quando-pedir-ajuda-scaled.jpg',
    );
  };

  const styles = getStyles(theme);

  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Configurações e Ajuda</Text>
        <Text style={styles.subtitle}>
          Personalize sua experiência e acesse suporte
        </Text>

        {/* Card de Tema */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name={theme.isDark ? 'moon' : 'sunny'}
              size={24}
              color={theme.primary}
            />
            <Text style={styles.cardTitle}>Aparência</Text>
          </View>
          <Text style={styles.cardDescription}>
            Alterne entre os modos claro e escuro para melhor conforto visual
          </Text>
          <TouchableOpacity style={styles.button} onPress={theme.toggleTheme}>
            <Ionicons
              name={theme.isDark ? 'sunny' : 'moon'}
              size={20}
              color={theme.buttonText}
            />
            <Text style={styles.buttonText}>
              Alternar para modo {theme.isDark ? 'Claro' : 'Escuro'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card de Informações */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.primary}
            />
            <Text style={styles.cardTitle}>Sobre o App</Text>
          </View>
          <Text style={styles.cardDescription}>
            Sistema de auxílio diagnóstico para análise de lesões cutâneas
            utilizando inteligência artificial. Versão 1.0.0
          </Text>
        </View> 

        {/* Aviso Legal */}
        <View style={[styles.card, styles.disclaimerCard]}>
          <Ionicons name="alert-circle" size={20} color={theme.warning} />
          <Text style={styles.disclaimerText}>
            Este aplicativo é uma ferramenta de auxílio diagnóstico. Resultados
            devem sempre ser validados por profissional médico qualificado.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

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
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    cardTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: 'bold',
      color: theme.primary,
    },
    cardDescription: {
      fontSize: theme.fontSize.sm,
      color: theme.text,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.buttonBackground,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    secondaryButton: {
      backgroundColor: theme.success,
    },
    buttonText: {
      fontSize: theme.fontSize.md,
      fontWeight: '600',
      color: theme.buttonText,
    },
    disclaimerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.warningBg,
      marginTop: theme.spacing.lg,
    },
    disclaimerText: {
      flex: 1,
      fontSize: theme.fontSize.xs,
      color: theme.isDark ? theme.warning : '#78350f',
      lineHeight: 18,
    },
  });