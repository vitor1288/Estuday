import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  // Títulos de tela (ex: "Compromissos", "Anotações")
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Títulos de seção (ex: "Próximos Compromissos")
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Título de card (ex: nome do compromisso)
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Texto de corpo (ex: descrição, conteúdo)
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  // Texto secundário (ex: data, hora)
  caption: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Texto de botão
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Labels pequenos (ex: badges, contadores)
  small: {
    fontSize: 12,
    fontWeight: '600',
  },
};