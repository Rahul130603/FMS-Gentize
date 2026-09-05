import { useCallback, useEffect, useState } from 'react';
import { technicalQueryApi } from '../api/technicalQueryApi';

export function useQueryDetail(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await technicalQueryApi.getById(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load technical query');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  return { data, loading, error, refresh: load };
}
