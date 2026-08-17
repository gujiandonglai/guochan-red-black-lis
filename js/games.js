// ==============================================================================
// 游戏模块：支持全维度过滤与双轨详情页渲染
// ==============================================================================
const GamesView = {
  currentFilter: { genre: 'all', status: 'all', risk: 'all', search: '' },

  renderLibrary(container, gamesList) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px;">国产游戏消费者档案库</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">实时追踪游戏更新频率、商业模式、开发商履约表现与弃坑风险。</p>
      </div>

      <!-- 多维度筛选工具条 -->
      <div style="background: #FFF; border: 1px solid var(--border-color); padding: 16px; border-radius: var(--radius-md); display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <input type="text" id="gameSearchInput" placeholder="输入游戏名、开发商或标签..." class="form-input" style="flex: 1; min-width: 220px; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 4px;">
        
        <select id="statusFilter" class="form-select" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 4px;">
          <option value="all">全部维护状态</option>
          <option value="active">活跃维护中</option>
          <option value="abandoned">停止维护/弃坑</option>
        </select>

        <select id="riskFilter" class="form-select" style="padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 4px;">
          <option value="all">全部购买风险</option>
          <option value="low">低风险 (推荐)</option>
          <option value="high">高风险 (谨慎)</option>
        </select>
      </div>

      <div class="games-grid" id="gamesGridContainer"></div>
    `;

    this.bindEvents(gamesList);
    this.updateGrid(gamesList);
  },

  updateGrid(gamesList) {
    const grid = document.getElementById('gamesGridContainer');
    if (!grid) return;

    let filtered = gamesList.filter(g => {
      const matchSearch = g.name.toLowerCase().includes(this.currentFilter.search.toLowerCase()) ||
                          g.developer_name.toLowerCase().includes(this.currentFilter.search.toLowerCase());
      const matchStatus = this.currentFilter.status === 'all' || g.maintenance_status === this.currentFilter.status;
      const matchRisk = this.currentFilter.risk === 'all' || 
                        (this.currentFilter.risk === 'low' && g.risk_score <= 40) ||
                        (this.currentFilter.risk === 'high' && g.risk_score > 60);
      return matchSearch && matchStatus && matchRisk;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; padding: 60px 0; text-align: center; color: var(--text-muted);">未找到符合条件的档案记录。</div>`;
      return;
    }

    grid.innerHTML = filtered.map(game => {
      const statusInfo = Utils.parseMaintenanceStatus(game.maintenance_status);
      const riskInfo = Utils.calculateRiskLevel(game.risk_score);
      const daysSinceUpdate = Utils.getDaysSinceLastUpdate(game.last_update_date);

      return `
        <div class="game-card" onclick="App.navigate('game-detail', '${game.id}')">
          <div class="game-card-cover">
            <img src="${game.cover_url}" alt="${game.name}" loading="lazy">
            <div style="position: absolute; top: 10px; right: 10px;">
              <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
            </div>
          </div>
          <div class="game-card-body">
            <h3 class="game-card-title">${game.name}</h3>
            <div class="game-card-dev">开发商：${game.developer_name} · ${game.genre}</div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">${game.description.substring(0, 58)}...</p>
            
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              ${game.tags.map(t => `<span style="font-size: 11px; background: var(--bg-alt); padding: 2px 6px; border-radius: 3px;">${t}</span>`).join('')}
            </div>

            <div class="game-scores-inline">
              <div>
                <div class="mini-score-label">品质分 (好玩度)</div>
                <div class="mini-score-val" style="color: #2563EB;">${game.quality_score}</div>
              </div>
              <div>
                <div class="mini-score-label">消费者推荐指数</div>
                <div class="mini-score-val" style="color: var(--green-main);">${game.recommend_score}%</div>
              </div>
              <div>
                <div class="mini-score-label">弃坑风险</div>
                <div class="mini-score-val" style="color: ${game.risk_score > 60 ? 'var(--red-main)' : 'var(--green-main)'};">${game.risk_score}</div>
              </div>
            </div>
            
            <div style="margin-top: 10px; font-size: 11px; color: var(--text-muted); text-align: right;">
              距上次更新：${daysSinceUpdate} 天
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderDetail(container, gameId, allGames, allIncidents, allTimeline) {
    const game = allGames.find(g => g.id === gameId) || allGames[0];
    const incidents = allIncidents.filter(i => i.game_id === game.id);
    const timeline = allTimeline.filter(t => t.game_id === game.id);
    const statusInfo = Utils.parseMaintenanceStatus(game.maintenance_status);
    const riskInfo = Utils.calculateRiskLevel(game.risk_score);
    const daysSince = Utils.getDaysSinceLastUpdate(game.last_update_date);

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <div>
          <!-- 游戏详情顶栏 -->
          <div style="background: #FFF; border: 1px solid var(--border-color); padding: 24px; border-radius: var(--radius-md); margin-bottom: 24px;">
            <div style="display: flex; gap: 20px;">
              <img src="${game.cover_url}" style="width: 140px; height: 180px; object-fit: cover; border-radius: 6px;" alt="${game.name}">
              <div style="flex: 1;">
                <div style="display: flex; gap: 8px; margin-bottom: 6px;">
                  <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
                  <span style="font-size: 12px; background: var(--bg-alt); padding: 3px 8px; border-radius: 4px;">${game.commercial_model}</span>
                </div>
                <h1 style="font-family: var(--font-serif); font-size: 24px; margin-bottom: 4px;">${game.name}</h1>
                <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
                  开发商：<strong style="color: var(--text-primary); cursor: pointer;" onclick="App.navigate('dev-detail', '${game.developer_id}')">${game.developer_name}</strong> · 发行日期：${game.release_date}
                </div>
                <p style="font-size: 13px; color: var(--text-secondary);">${game.description}</p>
              </div>
            </div>

            <!-- 核心双轨评分与风险温度计 -->
            <div class="dual-score-card">
              <div class="score-box quality">
                <div class="score-title">游戏基础品质分</div>
                <div class="score-num">${game.quality_score}</div>
                <div class="score-desc">玩法、优化、内容量与艺术综合表现</div>
              </div>
              <div class="score-box recommend">
                <div class="score-title">消费者推荐指数</div>
                <div class="score-num">${game.recommend_score}%</div>
                <div class="score-desc">结合开发商责任、履约与长期风险</div>
              </div>
            </div>

            <div class="risk-meter">
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                <span>长期维护与弃坑风险评级</span>
                <span style="color: ${game.risk_score > 60 ? 'var(--red-main)' : 'var(--green-main)'};">${riskInfo.label} (${game.risk_score}/100)</span>
              </div>
              <div class="risk-meter-bar-wrap">
                <div class="risk-meter-bar ${riskInfo.colorClass}" style="width: ${game.risk_score}%;"></div>
              </div>
              <div style="font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between;">
                <span>极长无更新间隔：${game.longest_update_gap_days} 天</span>
                <span>当前距离最后更新：${daysSince} 天</span>
              </div>
            </div>
          </div>

          <!-- 事件档案区 (三层结构渲染) -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-family: var(--font-serif); font-size: 18px;">关联事件与事实证据 (${incidents.length})</h3>
              <button class="btn btn-sm btn-outline" onclick="App.openSubmitModal('${game.id}', '${game.name}')">+ 提交本游戏事件</button>
            </div>
            <div id="gameIncidentsList">
              ${incidents.length === 0 ? '<div style="background:#FFF; padding:30px; text-align:center; color:var(--text-muted); border:1px solid var(--border-color); border-radius:6px;">暂无重大红黑榜事件记录。</div>' : incidents.map(inc => IncidentsView.renderIncidentCard(inc)).join('')}
            </div>
          </div>
        </div>

        <!-- 侧边栏：维护时间线与官方履约历史 -->
        <div>
          <div style="background: #FFF; border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md); margin-bottom: 20px;">
            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">更新历史与节奏</h4>
            <div class="timeline">
              ${timeline.map(t => `
                <div class="timeline-item">
                  <div class="timeline-date">${t.date} · <span style="color: var(--blue-main);">${t.version}</span></div>
                  <div class="timeline-content"><strong>[${t.type}]</strong> ${t.summary}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="background: #FFF; border: 1px solid var(--border-color); padding: 20px; border-radius: var(--radius-md);">
            <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 10px;">消费者购买警示说明</h4>
            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
              若游戏品质高但推荐指数低，通常代表开发团队存在停止更新、虚假宣传或运营争议等风险。购买前建议查阅开发商历史信誉。
            </p>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(gamesList) {
    const input = document.getElementById('gameSearchInput');
    const statusSelect = document.getElementById('statusFilter');
    const riskSelect = document.getElementById('riskFilter');

    if (input) input.addEventListener('input', (e) => { this.currentFilter.search = e.target.value; this.updateGrid(gamesList); });
    if (statusSelect) statusSelect.addEventListener('change', (e) => { this.currentFilter.status = e.target.value; this.updateGrid(gamesList); });
    if (riskSelect) riskSelect.addEventListener('change', (e) => { this.currentFilter.risk = e.target.value; this.updateGrid(gamesList); });
  }
};