// ==============================================================================
// 审校后台模块：审核待审投稿、证据交叉核验、一键收录至正式库
// ==============================================================================
const AdminView = {
  render(container) {
    const list = App.state.pendingSubmissions;

    container.innerHTML = `
      <div class="page-header" style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-family: var(--font-serif); font-size: 24px;">档案审核与中立监督后台</h2>
            <p style="color: var(--text-secondary); font-size: 13px;">核验提交之客观事实、证据链接有效性及是否违背中立反诽谤原则。</p>
          </div>
          <span class="badge badge-s">管理员权限活跃</span>
        </div>
      </div>

      <div style="background: #FFF; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden;">
        <div style="padding: 16px; border-bottom: 1px solid var(--border-color); font-weight: 700;">
          待审校队列 (${list.length})
        </div>

        ${list.length === 0 ? '<div style="padding: 40px; text-align: center; color: var(--text-muted);">暂无待审核之投稿档案。</div>' : list.map(item => `
          <div style="padding: 20px; border-bottom: 1px solid var(--border-color);" id="item-${item.id}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <div>
                <span class="badge ${item.type === 'red' ? 'badge-s' : 'badge-d'}">${item.type === 'red' ? '红榜' : '黑榜'}</span>
                <span style="font-weight: 700; margin-left: 8px;">[${item.category}] ${item.title}</span>
              </div>
              <span style="font-size: 12px; color: var(--text-muted);">${item.submitted_at}</span>
            </div>

            <div style="font-size: 13px; background: var(--bg-main); padding: 10px; border-radius: 4px; margin-bottom: 10px;">
              <div><strong>事实陈述：</strong> ${item.fact}</div>
              <div style="margin-top: 4px;"><strong>玩家观点：</strong> ${item.opinion || '未填写'}</div>
              <div style="margin-top: 4px;"><strong>证据源：</strong> <a href="${item.evidence_url}" target="_blank" style="color: #2563EB;">${item.evidence_url}</a> (${item.evidence_level}级)</div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px;">
              <button class="btn btn-sm btn-outline" onclick="AdminView.reject('${item.id}')">驳回/要求补充证据</button>
              <button class="btn btn-sm btn-green" onclick="AdminView.approve('${item.id}')">核验证据并通过收录</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  approve(subId) {
    const idx = App.state.pendingSubmissions.findIndex(s => s.id === subId);
    if (idx === -1) return;
    const sub = App.state.pendingSubmissions[idx];

    // 将投稿转换为正式事件
    const newInc = {
      id: "inc-" + Date.now(),
      game_id: "game-01",
      game_name: sub.target_name,
      developer_name: "开发团队",
      title: sub.title,
      incident_type: sub.type,
      category: sub.category,
      severity: 2,
      event_date: sub.submitted_at,
      player_opinion: sub.opinion,
      factual_description: sub.fact,
      evidence_level: sub.evidence_level,
      evidence_links: [sub.evidence_url],
      official_response: null,
      status: "confirmed"
    };

    App.state.incidents.unshift(newInc);
    App.state.pendingSubmissions.splice(idx, 1);
    alert("已成功核验并加入公共事件数据库！");
    this.render(document.getElementById('appRoot'));
  },

  reject(subId) {
    App.state.pendingSubmissions = App.state.pendingSubmissions.filter(s => s.id !== subId);
    alert("已驳回该记录。");
    this.render(document.getElementById('appRoot'));
  }
};