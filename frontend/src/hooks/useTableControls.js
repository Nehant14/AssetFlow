import { useMemo, useState } from 'react';

// Generic client-side search + sort for list/table pages.
// `searchKeys` are the object fields checked against the search string.
export default function useTableControls(rows, searchKeys = []) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const result = useMemo(() => {
    let data = rows || [];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter((row) =>
        searchKeys.some((key) => String(row?.[key] ?? '').toLowerCase().includes(q))
      );
    }

    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = a?.[sortKey];
        const bv = b?.[sortKey];
        if (av == null && bv == null) return 0;
        if (av == null) return -1;
        if (bv == null) return 1;
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'asc' ? av - bv : bv - av;
        }
        return sortDir === 'asc'
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }

    return data;
  }, [rows, search, searchKeys, sortKey, sortDir]);

  return { search, setSearch, sortKey, sortDir, toggleSort, result };
}
