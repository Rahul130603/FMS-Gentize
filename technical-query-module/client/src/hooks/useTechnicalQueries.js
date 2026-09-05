import { useCallback, useEffect, useState } from 'react';
import { technicalQueryApi } from '../api/technicalQueryApi';

/**
 * Drives the "My Technical Queries" and "All Queries" grids: owns
 * filter/sort/pagination state and refetches from the server whenever
 * any of it changes (server-side filtering, not client-side slicing —
 * this table is meant to stay fast even with years of accumulated rows).
 */
export function useTechnicalQueries(initialFilters = {}) {
  const [filters, setFilters] = useState({ page: 1, pageSize: 20, sortBy: 'created_at', sortDir: 'desc', ...initialFilters });
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cleaned = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null));
      const res = await technicalQueryApi.list(cleaned);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load technical queries');
    } finally {
      setLoading(false);
    }
  }, [filters, reloadToken]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  const setPage = useCallback((page) => setFilters((prev) => ({ ...prev, page })), []);
  const setSort = useCallback((sortBy, sortDir) => setFilters((prev) => ({ ...prev, sortBy, sortDir })), []);
  const refresh = useCallback(() => setReloadToken((t) => t + 1), []);

  return { filters, updateFilters, setPage, setSort, data, meta, loading, error, refresh };
}
