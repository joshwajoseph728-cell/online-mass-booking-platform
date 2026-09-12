// Lightweight SVG Charts for Parish Admin Dashboard (Zero External Weight)

export function renderMonthlyBookingsBarChart(monthsData = []) {
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = monthsData.length ? monthsData : defaultMonths.map(m => ({ label: m, count: 0 }));
  const maxCount = Math.max(...data.map(d => d.count), 5);
  const chartHeight = 180;
  const chartWidth = 500;
  const barWidth = 36;
  const gap = (chartWidth - data.length * barWidth) / (data.length + 1);

  return `
    <div style="width: 100%; overflow-x: auto;">
      <svg viewBox="0 0 ${chartWidth} ${chartHeight + 40}" style="width: 100%; max-height: 240px; font-family: var(--font-sans);">
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#d4af37" />
            <stop offset="100%" stop-color="#1e3a8a" />
          </linearGradient>
        </defs>
        <!-- Horizontal Grid Lines -->
        <line x1="20" y1="20" x2="${chartWidth - 20}" y2="20" stroke="var(--border-subtle)" stroke-dasharray="4" />
        <line x1="20" y1="${chartHeight / 2}" x2="${chartWidth - 20}" y2="${chartHeight / 2}" stroke="var(--border-subtle)" stroke-dasharray="4" />
        <line x1="20" y1="${chartHeight}" x2="${chartWidth - 20}" y2="${chartHeight}" stroke="var(--border-medium)" />

        <!-- Bars -->
        ${data.map((item, idx) => {
          const h = (item.count / maxCount) * (chartHeight - 40);
          const x = gap + idx * (barWidth + gap);
          const y = chartHeight - h;
          return `
            <g class="chart-bar-group">
              <rect x="${x}" y="${y}" width="${barWidth}" height="${Math.max(h, 3)}" rx="6" fill="url(#barGrad)" style="transition: all 0.3s ease; cursor: pointer;">
                <title>${item.label}: ${item.count} Mass Intentions</title>
              </rect>
              <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--text-primary)">
                ${item.count}
              </text>
              <text x="${x + barWidth / 2}" y="${chartHeight + 20}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--text-secondary)">
                ${item.label}
              </text>
            </g>
          `;
        }).join('')}
      </svg>
    </div>
  `;
}

export function renderIntentionDistributionDonut(distribution = {}) {
  const categories = [
    { name: 'Departed Soul', count: distribution['Departed Soul'] || 0, color: '#334155' },
    { name: 'Thanksgiving', count: distribution['Thanksgiving'] || 0, color: '#d4af37' },
    { name: 'Healing Prayer', count: distribution['Healing Prayer'] || 0, color: '#15803d' },
    { name: 'Special Intention', count: distribution['Special Intention'] || 0, color: '#0284c7' }
  ];

  const total = categories.reduce((acc, c) => acc + c.count, 0);

  if (total === 0) {
    return `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5;">📊</div>
        <p style="margin: 0; font-size: 0.9rem; font-weight: 600;">No intentions booked yet</p>
        <small style="font-size: 0.8rem;">Category breakdown will appear here once parishioners book intentions.</small>
      </div>
    `;
  }

  let accumulatedAngle = 0;
  const radius = 65;
  const cx = 90;
  const cy = 90;

  return `
    <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 1.5rem;">
      <!-- SVG Donut -->
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--bg-surface-alt)" stroke-width="24"/>
        ${categories.map(cat => {
          if (cat.count === 0) return '';
          const sliceAngle = (cat.count / total) * 360;
          const strokeDash = (sliceAngle / 360) * (2 * Math.PI * radius);
          const strokeGap = (2 * Math.PI * radius) - strokeDash;
          const rotation = accumulatedAngle - 90;
          accumulatedAngle += sliceAngle;

          return `
            <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${cat.color}" stroke-width="24"
              stroke-dasharray="${strokeDash} ${strokeGap}"
              transform="rotate(${rotation} ${cx} ${cy})"
              style="transition: stroke-dasharray 0.5s ease;">
              <title>${cat.name}: ${cat.count} (${Math.round((cat.count / total) * 100)}%)</title>
            </circle>
          `;
        }).join('')}
        <!-- Center Text -->
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="20" font-weight="800" font-family="var(--font-serif)" fill="var(--text-primary)">
          ${total}
        </text>
        <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="10" font-weight="700" text-transform="uppercase" fill="var(--text-muted)">
          Total Intentions
        </text>
      </svg>

      <!-- Legend -->
      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        ${categories.map(cat => `
          <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: ${cat.color}; display: inline-block;"></span>
            <span style="color: var(--text-secondary); font-weight: 500;">${cat.name}</span>
            <strong style="color: var(--text-primary); margin-left: auto;">${cat.count} (${Math.round((cat.count / total) * 100)}%)</strong>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
