export interface ChartDatum {
  label: string
  value: number
}

export function countRecordToData(record: Record<string, number>): ChartDatum[] {
  return Object.entries(record)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function renderBarChart(title: string, data: ChartDatum[]) {
  const max = Math.max(1, ...data.map((item) => item.value))
  const rows = data.length
    ? data.map((item) => {
      const width = Math.max(4, (item.value / max) * 100)
      return `
        <li>
          <span>${escapeHtml(item.label)}</span>
          <b style="--bar-width: ${width}%"></b>
          <strong>${item.value}</strong>
        </li>
      `
    }).join('')
    : '<li class="empty">No data</li>'

  return `
    <article class="chart-card">
      <h2>${escapeHtml(title)}</h2>
      <ol>${rows}</ol>
    </article>
  `
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
