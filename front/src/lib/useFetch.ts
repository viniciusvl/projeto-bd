import { useCallback, useEffect, useState } from "react";

/**
 * Hook simples de busca de dados: executa `fn`, expõe estados de
 * carregamento/erro e uma função `reload` para refazer a requisição.
 */
export function useFetch<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoFn = useCallback(fn, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await memoFn());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [memoFn]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
