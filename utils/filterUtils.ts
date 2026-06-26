import { Compromisso } from '@/contexts/StudayContext';

export type OrderOption = 'proximo' | 'novo' | 'antigo' | 'alfabetica';
export type OrderDirection = 'asc' | 'desc';

/**
 * Filtra e ordena uma lista de compromissos com suporte a múltiplos filtros simultâneos.
 * Versão segura: Aceita null, string única ou arrays, sem quebrar as outras telas do App.
 */
export function filtrarEOrdenarCompromissos(
  lista: Compromisso[],
  buscaTexto: string,
  materiasFiltro: string | string[] | null | undefined,
  categoriasOuDataFiltro: string | string[] | null | undefined,
  opcaoOrdenacao: OrderOption,
  direcao: OrderDirection
): Compromisso[] {
  
  let resultado = [...lista];

  // 1. FILTRO DE TEXTO ("Ctrl + F")
  if (buscaTexto && buscaTexto.trim()) {
    const textoUpper = buscaTexto.toUpperCase();
    resultado = resultado.filter(item => 
      (item.titulo && item.titulo.toUpperCase().includes(textoUpper)) || 
      (item.descricao && item.descricao.toUpperCase().includes(textoUpper)) ||
      (item.hora && item.hora.includes(textoUpper))
    );
  }

  // 2. FILTRO POR MATÉRIAS (Seguro contra null)
  if (materiasFiltro) {
    const materiasArray = Array.isArray(materiasFiltro) ? materiasFiltro : [materiasFiltro];
    
    if (materiasArray.length > 0) {
      resultado = resultado.filter(item => item.materiaId && materiasArray.includes(item.materiaId));
    }
  }

  // 3. FILTRO POR CATEGORIAS OU DATAS (Seguro contra null e retrocompatível)
  if (categoriasOuDataFiltro) {
    const filtroArray = Array.isArray(categoriasOuDataFiltro) ? categoriasOuDataFiltro : [categoriasOuDataFiltro];
    
    if (filtroArray.length > 0) {
      resultado = resultado.filter(item => {
        if (filtroArray[0].includes('-') && filtroArray[0].length === 10) {
          return item.data === filtroArray[0];
        }
        
        const catId = item.categoriaId || item.categoria;
        return catId && filtroArray.includes(catId);
      });
    }
  }

  // 4. ALGORITMO DE ORDENAÇÃO
  resultado.sort((a, b) => {
    let comparacao = 0;

    switch (opcaoOrdenacao) {
      case 'proximo': {
        // ✨ CORRIGIDO: Ordem cronológica real (Data mais antiga para a mais nova)
        const dataA = new Date(a.data).getTime();
        const dataB = new Date(b.data).getTime();
        comparacao = dataA - dataB;
        break;
      }
      case 'novo':
        comparacao = new Date(b.data).getTime() - new Date(a.data).getTime();
        break;
      case 'antigo':
        comparacao = new Date(a.data).getTime() - new Date(b.data).getTime();
        break;
      case 'alfabetica':
        comparacao = (a.titulo || '').localeCompare(b.titulo || '');
        break;
    }

    // Aplica a direção (Crescente vs Decrescente / A-Z vs Z-A)
    return direcao === 'asc' ? comparacao : -comparacao;
  });

  return resultado;
}