// ==============================================================================
// 开发商模块：维护指数算法与全历史项目履约率追踪
// ==============================================================================
const DevelopersView = {
  renderList(container, developersList, gamesList, incidentsList) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px;">开发商履约信誉档案</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">基于历史作品维护周期、BUG修复表现及承诺兑现度客观计算，拒绝主观偏见。</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
        ${developersList.map(dev => {
          const devGames = gamesList.filter(g => g.developer_id === dev.id);
          const devIncidents = incidentsList.filter(i => i.developer_name === dev.name);
          const redCount = devIncidents.filter(i => i.incident_type === 'red').length;
          const blackCount = devIncidents.filter(i => i.incident_type === 'black').length;

          return `
            <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div>
                  <h3 style="font-family: var(--font-serif); font-size: 18px; font-weight: 700;">${dev.name}</h3>
                  <div style="font-size: 12px; color: var(--text-muted);">成立年份：${dev.founded_year || '公开数据未载'}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 11px; color: var(--text-muted);">开发商维护指数</div>
                  <div style="font-family: var(--font-serif); font-size: 24px; font-weight: 900; color: ${dev.maintenance_index >= 70 ? 'var(--green-main)' : 'var(--red-main)'};">
                    ${dev.maintenance_index}/100
                  </div>
                </div>
              </div>

              <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">${dev.description}</p>

              <div style="background: var(--bg-alt); padding: 10px 14px; border-radius: 4px; font-size: 12px; margin-bottom: 14px; display: flex; justify-content: space-between;">
                <span>旗下收录作品：<strong>${devGames.length}</strong> 款</span>
                <span>🟢 <strong>${redCount}</strong> 个正面记录</span>
                <span>🔴 <strong>${blackCount}</strong> 个负面事件</span>
              </div>

              <div>
                <div style="font-size: 12px; font-weight: 700; margin-bottom: 6px;">项目追踪：</div>
                ${devGames.map(g => `
                  <div style="display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
                    <span style="color: #2563EB; cursor: pointer;" onclick="App.navigate('game-detail', '${g.id}')">${g.name}</span>
                    <span style="color: var(--text-muted);">${g.maintenance_status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};