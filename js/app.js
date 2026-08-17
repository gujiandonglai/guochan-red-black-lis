// ==============================================================================
// 全局生命周期与 SPA 路由引擎
// ==============================================================================
const App = {
  state: {
    currentView: 'home',
    games: [...MOCK_DATA.games],
    incidents: [...MOCK_DATA.incidents],
    developers: [...MOCK_DATA.developers],
    updateTimeline: [...MOCK_DATA.updateTimeline],
    pendingSubmissions: [
      {
        id: "sub-demo-01",
        target_name: "侠道长歌",
        type: "red",
        category: "开发商责任",
        title: "2025年春节发布4万字免费剧情更新",
        opinion: "节日期间免费扩充结局，诚意十足。",
        fact: "官方于2025年1月28日上线v1.4版本，免费追加新宗门剧情线及支线任务。",
        evidence_level: "S",
        evidence_url: "https://store.steampowered.com",
        submitted_at: "2025-02-01",
        status: "pending"
      }
    ]
  },

  init() {
    this.bindGlobalNavigation();
    this.navigate('home');
  },

  bindGlobalNavigation() {
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.getAttribute('data-view');
        if (view) this.navigate(view);
      });
    });
  },

  navigate(viewName, param = null) {
    this.state.currentView = viewName;
    const root = document.getElementById('appRoot');

    // 更新导航高亮
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // 路由分发
    switch (viewName) {
      case 'home':
        this.renderHome(root);
        break;
      case 'games':
        GamesView.renderLibrary(root, this.state.games);
        break;
      case 'game-detail':
        GamesView.renderDetail(root, param, this.state.games, this.state.incidents, this.state.updateTimeline);
        break;
      case 'red-list':
        this.renderRedList(root);
        break;
      case 'black-list':
        this.renderBlackList(root);
        break;
      case 'incidents':
        IncidentsView.renderArchivePage(root, this.state.incidents);
        break;
      case 'developers':
        DevelopersView.renderList(root, this.state.developers, this.state.games, this.state.incidents);
        break;
      case 'ranking':
        this.renderRankings(root);
        break;
      case 'admin':
        AdminView.render(root);
        break;
      default:
        this.renderHome(root);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderHome(container) {
    const redIncidents = this.state.incidents.filter(i => i.incident_type === 'red');
    const blackIncidents = this.state.incidents.filter(i => i.incident_type === 'black');

    container.innerHTML = `
      <!-- Hero 区域 -->
      <section style="background: #FFF; border: 1px solid var(--border-color); padding: 40px 30px; border-radius: var(--radius-md); margin-bottom: 30px; text-align: center;">
        <h1 style="font-family: var(--font-serif); font-size: 32px; font-weight: 900; margin-bottom: 12px; letter-spacing: 0.5px;">
          买国产游戏之前，先看看它过去做过什么
        </h1>
        <p style="color: var(--text-secondary); max-width: 680px; margin: 0 auto 24px; font-size: 14px;">
          建立在事实与可查证证据之上的消费者决策档案库。持续跟踪记录开发商维护履约、商业模式演变与弃坑风险。
        </p>
        <div style="display: flex; justify-content: center; gap: 12px;">
          <button class="btn btn-primary" onclick="App.navigate('games')">浏览游戏档案库</button>
          <button class="btn btn-outline" onclick="App.navigate('incidents')">检索最新事实证据</button>
        </div>
      </section>

      <!-- 双栏聚光灯：今日红榜 vs 避坑黑榜 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--green-main);">🟢 负责任开发商表现 (红榜)</h3>
            <button class="btn btn-sm btn-outline" onclick="App.navigate('red-list')">查看更多 →</button>
          </div>
          ${redIncidents.slice(0, 2).map(inc => IncidentsView.renderIncidentCard(inc)).join('')}
        </div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-family: var(--font-serif); font-size: 18px; color: var(--red-main);">🔴 消费者风险警示 (黑榜)</h3>
            <button class="btn btn-sm btn-outline" onclick="App.navigate('black-list')">查看更多 →</button>
          </div>
          ${blackIncidents.slice(0, 2).map(inc => IncidentsView.renderIncidentCard(inc)).join('')}
        </div>
      </div>
    `;
  },

  renderRedList(container) {
    const list = this.state.incidents.filter(i => i.incident_type === 'red');
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px; color: var(--green-main);">🟢 负责任开发商红榜</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">记录积极修复重大BUG、兑现早期承诺、提供合理补偿与长期维护的老实开发团队。</p>
      </div>
      <div>${list.map(i => IncidentsView.renderIncidentCard(i)).join('')}</div>
    `;
  },

  renderBlackList(container) {
    const list = this.state.incidents.filter(i => i.incident_type === 'black');
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px; color: var(--red-main);">🔴 消费者风险黑榜</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">严正记录半成品发售失联、抢先体验烂尾、虚假宣传及严重侵害玩家权益之客观事实。</p>
      </div>
      <div>${list.map(i => IncidentsView.renderIncidentCard(i)).join('')}</div>
    `;
  },

  renderRankings(container) {
    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <h2 style="font-family: var(--font-serif); font-size: 24px;">消费者多维度天平排行榜</h2>
        <p style="color: var(--text-secondary); font-size: 13px;">综合质量、履约态度与弃坑风险排定。</p>
      </div>
      <div style="background: #FFF; padding: 20px; border: 1px solid var(--border-color); border-radius: var(--radius-md);">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border-color); text-align: left;">
              <th style="padding: 10px;">排名与游戏</th>
              <th>开发商</th>
              <th>品质分</th>
              <th>推荐指数</th>
              <th>弃坑风险</th>
              <th>维护状态</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.games.map((g, idx) => `
              <tr style="border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="App.navigate('game-detail', '${g.id}')">
                <td style="padding: 12px 10px;"><strong>#${idx + 1}</strong> ${g.name}</td>
                <td>${g.developer_name}</td>
                <td style="color: #2563EB; font-weight: 700;">${g.quality_score}</td>
                <td style="color: var(--green-main); font-weight: 700;">${g.recommend_score}%</td>
                <td style="color: ${g.risk_score > 50 ? 'var(--red-main)' : 'var(--green-main)'}; font-weight: 700;">${g.risk_score}</td>
                <td><span class="status-badge ${Utils.parseMaintenanceStatus(g.maintenance_status).class}">${Utils.parseMaintenanceStatus(g.maintenance_status).text}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openSubmitModal(gameId = '', gameName = '') {
    const modal = document.getElementById('submitModal');
    const body = document.getElementById('submitModalBody');
    SubmitSystem.renderForm(body, gameId, gameName);
    modal.classList.remove('hidden');
  },

  closeSubmitModal() {
    document.getElementById('submitModal').classList.add('hidden');
  },

  openDisclaimerModal() {
    document.getElementById('disclaimerModal').classList.remove('hidden');
  },

  closeDisclaimerModal() {
    document.getElementById('disclaimerModal').classList.add('hidden');
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});