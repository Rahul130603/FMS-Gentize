/**
 * Helper utility to export tabular data to CSV format and trigger instant browser download.
 */
export function exportToCsv(filename, rows, columns) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  // Format headers
  const headers = columns.map(c => `"${(c.header || c.label || '').replace(/"/g, '""')}"`).join(',');

  // Format rows
  const csvRows = rows.map(row => {
    return columns.map(c => {
      let val = '';
      if (typeof c.accessor === 'function') {
        val = c.accessor(row);
      } else if (c.key && row[c.key] !== undefined) {
        val = row[c.key];
      }
      if (val === null || val === undefined) val = '';
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = [headers, ...csvRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
