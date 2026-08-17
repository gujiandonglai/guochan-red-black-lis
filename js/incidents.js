// ==============================================================================
// 事件渲染系统：三层架构 (玩家观点 + 客观事实 + 证据链与官方回应)
// ==============================================================================
const IncidentsView = {
  renderIncidentCard(incident) {
    const tier = Utils.formatEvidenceTier(incident.evidence_level);
    const isRed = incident.incident_type === 'red';
    const isBlack = incident.incident_type === 'black';
    const typeClass = isRed ? 'red-incident' : (isBlack ? 'black-incident' : 'dispute-incident');
    const typeLabel = isRed ? '🟢 负责任红榜行为' : (isBlack ? '🔴 消费者风险黑榜' : '🟡 争议事件');

    return `
      <div class="incident-card ${typeClass}">
        <div class="incident-header">
          <div>
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px; color: ${isRed ? 'var(--green-main)' : (isBlack ? 'var(--red-main)' : 'var(--amber-main)')};">
              ${typeLabel} · [${incident.category}]
            </div>
            <h4 class="incident-title">${incident.title}</h4>
            <div class="incident-meta">
              <span>发生时间：${incident.event_date}</span>
              <span>关联游戏：${incident.game_name}</span>
              <span>开发商：${incident.developer_name}</span>
            </div>
          </div>
          <div>
            <span class="badge ${tier.class}">${tier.label}</span>
          </div>
        </div>

        <!-- 第一层：玩家观点 -->
        <div class="layer-box layer-opinion">
          <div class="layer-label">第一层：玩家观点与反馈</div>
          <div>${incident.player_opinion}</div>
        </div>

        <!-- 第二层：事实记录 -->
        <div class="layer-box layer-fact">
          <div class="layer-label">第二层：已确认客观事实</div>
          <div>${incident.factual_description}</div>
        </div>

        <!-- 官方回应 (如有) -->
        ${incident.official_response ? `
          <div class="layer-box layer-response">
            <div class="layer-label">官方回应与处理进度 (${incident.official_response_date || '已归档'})</div>
            <div>${incident.official_response}</div>
          </div>
        ` : ''}

        <!-- 第三层：证据链与来源 -->
        ${incident.evidence_links && incident.evidence_links.length > 0 ? `
          <div class="evidence-links-wrap">
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">查证来源：</span>
            ${incident.evidence_links.map((link, idx) => `
              <a href="${link}" target="_blank" rel="noopener noreferrer" class="evidence-link-item">证据源 [${idx + 1}] ↗</a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  renderArchivePage(container, incidentsList) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px;">事件与行为证据数据库</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">收录已归档事实、官方公告、媒体调查及玩家争议记录，支持证据链核查。</p>
      </div>

      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <button class="btn btn-sm btn-outline active" onclick="IncidentsView.filterIncidents(this, 'all')">全部记录</button>
        <button class="btn btn-sm btn-outline" onclick="IncidentsView.filterIncidents(this, 'red')">🟢 仅看红榜行为</button>
        <button class="btn btn-sm btn-outline" onclick="IncidentsView.filterIncidents(this, 'black')">🔴 仅看黑榜风险</button>
      </div>

      <div id="incidentsFeed">
        ${incidentsList.map(inc => this.renderIncidentCard(inc)).join('')}
      </div>
    `;
  },

  filterIncidents(btn, type) {
    const feed = document.getElementById('incidentsFeed');
    if (!feed) return;
    const all = App.state.incidents;
    const filtered = type === 'all' ? all : all.filter(i => i.incident_type === type);
    feed.innerHTML = filtered.map(inc => this.renderIncidentCard(inc)).join('');
  }
};