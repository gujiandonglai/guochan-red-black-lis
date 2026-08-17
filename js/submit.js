// ==============================================================================
// 投稿提交模块：包含证据分级选择器、来源校验、防止人身攻击提醒
// ==============================================================================
const SubmitSystem = {
  renderForm(container, presetGameId = '', presetGameName = '') {
    container.innerHTML = `
      <form id="submissionForm" onsubmit="SubmitSystem.handleSubmit(event)">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">关联游戏名称 *</label>
          <input type="text" id="subGameName" class="form-input" value="${presetGameName}" required placeholder="例如：侠道长歌" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">事件类型 *</label>
            <select id="subType" class="form-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
              <option value="red">🟢 责任红榜 (负责任优化/补偿/兑现承诺)</option>
              <option value="black">🔴 避坑黑榜 (停更/半成品/欺诈宣传/不公待遇)</option>
              <option value="dispute">🟡 存在争议事件</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">所属核心分类 *</label>
            <select id="subCategory" class="form-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
              <option value="开发商责任">开发商责任 (更新维护/弃坑/修复)</option>
              <option value="营销与宣传">营销策略 (宣传不符/角色营销争议)</option>
              <option value="玩家群体公平性">玩家群体公平性 (区别对待/双标政策)</option>
              <option value="内容政策">内容政策 (删减/修改/版本差异)</option>
              <option value="商业模式">商业模式 (逼氪/突然涨价/拆分内容)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">事件标题 *</label>
          <input type="text" id="subTitle" required placeholder="简明概括具体事实（如：官方发布公告宣布取消联机开发计划）" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">第一层：玩家观点与影响描述</label>
          <textarea id="subOpinion" rows="2" placeholder="描述玩家群体如何看待该行为，以及对游戏体验产生的具体影响..." style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">第二层：客观事实陈述 (何时何地发生了什么) *</label>
          <textarea id="subFact" rows="3" required placeholder="必须陈述客观事实，不包含情绪攻击词汇。例如：开发商于2024年X月发布公告..." style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 14px;">
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">证据级别 (自评)</label>
            <select id="subEvidenceTier" class="form-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
              <option value="S">S级 (官方公告/Steam日志)</option>
              <option value="A">A级 (官方认证社交账号)</option>
              <option value="B">B级 (媒体调查/多方来源)</option>
              <option value="C">C级 (录屏/实机截图)</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 12px; font-weight: 700; margin-bottom: 4px;">证据公开链接 (URL) *</label>
            <input type="url" id="subEvidenceUrl" required placeholder="https://store.steampowered.com/news/..." style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
          </div>
        </div>

        <div style="background: var(--bg-alt); padding: 10px; border-radius: 4px; font-size: 11px; color: var(--text-secondary); margin-bottom: 16px;">
          ⚠️ 提示：所有提交将进入审校队列，管理员将核验第三层证据真实性。禁止泄露个人隐私及人身攻击。
        </div>

        <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline" onclick="App.closeSubmitModal()">取消</button>
          <button type="submit" class="btn btn-primary">提交档案审核</button>
        </div>
      </form>
    `;
  },

  handleSubmit(e) {
    e.preventDefault();
    const newSubmission = {
      id: "sub-" + Date.now(),
      target_name: document.getElementById('subGameName').value,
      type: document.getElementById('subType').value,
      category: document.getElementById('subCategory').value,
      title: document.getElementById('subTitle').value,
      opinion: document.getElementById('subOpinion').value,
      fact: document.getElementById('subFact').value,
      evidence_level: document.getElementById('subEvidenceTier').value,
      evidence_url: document.getElementById('subEvidenceUrl').value,
      submitted_at: new Date().toISOString().split('T')[0],
      status: "pending"
    };

    // 保存至状态与本地队列
    App.state.pendingSubmissions.push(newSubmission);
    alert("投稿已提交！已进入档案审校队列，通过后将正式合并入公共数据库。");
    App.closeSubmitModal();
  }
};