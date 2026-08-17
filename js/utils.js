// ==============================================================================
// 核心评价算法原则：严格区分“好玩”与“值得买”
// ==============================================================================
const Utils = {
  // 计算最后更新距今天数
  getDaysSinceLastUpdate(dateStr) {
    if (!dateStr) return 999;
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  },

  // 弃坑风险判定函数 (0 - 100)
  calculateRiskLevel(riskScore) {
    if (riskScore <= 20) return { label: "极低风险", colorClass: "risk-low" };
    if (riskScore <= 40) return { label: "较低风险", colorClass: "risk-low" };
    if (riskScore <= 60) return { label: "中等风险", colorClass: "risk-mid" };
    if (riskScore <= 80) return { label: "较高风险 (谨慎购买)", colorClass: "risk-high" };
    return { label: "极高风险 (警惕弃坑)", colorClass: "risk-extreme" };
  },

  // 维护状态解析
  parseMaintenanceStatus(status) {
    const map = {
      active: { text: "🟢 活跃维护中", class: "status-active" },
      normal: { text: "🟢 正常更新", class: "status-active" },
      reduced: { text: "🟡 更新减少", class: "status-dormant" },
      long_dormant: { text: "🟠 长期无更新", class: "status-dormant" },
      abandoned: { text: "🔴 停止维护/跑路", class: "status-abandoned" },
      terminated: { text: "🔴 宣布终止开发", class: "status-abandoned" },
      defunct: { text: "⚫ 已停止运营", class: "status-abandoned" }
    };
    return map[status] || { text: "未知状态", class: "" };
  },

  // 证据等级格式化
  formatEvidenceTier(tier) {
    const tierMap = {
      S: { label: "S级 官方公告/日志", class: "badge-s" },
      A: { label: "A级 官方社媒发布", class: "badge-a" },
      B: { label: "B级 媒体多方采证", class: "badge-b" },
      C: { label: "C级 玩家录屏截图", class: "badge-c" },
      D: { label: "D级 单方口述(存疑)", class: "badge-d" }
    };
    return tierMap[tier] || { label: tier, class: "badge-d" };
  }
};