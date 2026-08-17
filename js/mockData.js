// ==============================================================================
// 结构化离线档案库 (涵盖真实多维度案例：EA弃坑、高质量但高维护风险、营销争议等)
// ==============================================================================
const MOCK_DATA = {
  developers: [
    {
      id: "dev-01",
      name: "青岚工坊",
      founded_year: 2021,
      maintenance_index: 86,
      description: "专注于武侠叙事单机，首发存在优化问题但连续发布42次热更新修复。"
    },
    {
      id: "dev-02",
      name: "星尘互娱工作室",
      founded_year: 2022,
      maintenance_index: 28,
      description: "在众筹与抢先体验阶段承诺大量DLC，发售后半年即失联并转移新项目。"
    }
  ],
  games: [
    {
      id: "game-01",
      name: "侠道长歌 (Chivalry Saga)",
      english_name: "Chivalry Saga",
      developer_id: "dev-01",
      developer_name: "青岚工坊",
      publisher: "青岚工坊",
      release_date: "2024-04-10",
      genre: "武侠单机 RPG",
      commercial_model: "买断制 (Steam/WeGame)",
      platforms: ["PC (Steam)", "WeGame"],
      description: "一款开放世界武侠RPG。发售初期因加载卡顿遭遇多半差评，制作组持续重构底层渲染并免费追加大型终局章节。",
      cover_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
      maintenance_status: "active",
      last_update_date: "2025-02-18",
      longest_update_gap_days: 28,
      quality_score: 84,
      recommend_score: 88,
      risk_score: 18,
      tags: ["#长期维护", "#积极更新", "#优化优秀", "#值得购买"]
    },
    {
      id: "game-02",
      name: "深空遗落 (Deep Space Relics)",
      english_name: "Deep Space Relics",
      developer_id: "dev-02",
      developer_name: "星尘互娱工作室",
      publisher: "星尘互娱",
      release_date: "2023-11-15",
      genre: "科幻沙盒建造",
      commercial_model: "抢先体验 (Early Access)",
      platforms: ["PC (Steam)"],
      description: "发售宣传片展示了无缝星球探索与多人联机，实际EA版为缺乏核心机制的半成品。长达320天未发布任何实质性修复代码。",
      cover_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      maintenance_status: "abandoned",
      last_update_date: "2024-03-01",
      longest_update_gap_days: 348,
      quality_score: 62,
      recommend_score: 15,
      risk_score: 92,
      tags: ["#长期无更新", "#半成品", "#开发商失联", "#高风险", "#承诺未兑现"]
    }
  ],
  incidents: [
    {
      id: "inc-01",
      game_id: "game-01",
      game_name: "侠道长歌",
      developer_name: "青岚工坊",
      title: "针对首发内存泄漏发布公开致歉信并连发8个热修补丁",
      incident_type: "red",
      category: "开发商责任",
      severity: 1,
      event_date: "2024-04-15",
      player_opinion: "首发当天崩溃率高，但开发团队当晚在B站直播连夜调试，诚意值得认可。",
      factual_description: "首发48小时内制作组更新0.1.2至0.1.9补丁，重构内存池释放机制，崩溃率降低94%。",
      evidence_level: "S",
      evidence_links: ["https://store.steampowered.com/news/app/example/1"],
      official_response: "官方承诺首月每周二、周五固定汇报BUG修复清单，并无条件延长退款协助窗口。",
      official_response_date: "2024-04-16",
      status: "resolved"
    },
    {
      id: "inc-02",
      game_id: "game-02",
      game_name: "深空遗落",
      developer_name: "星尘互娱工作室",
      title: "抢先体验路线图中承诺的联机模块与新星系全面取消，社媒停更",
      incident_type: "black",
      category: "营销宣传与承诺",
      severity: 4,
      event_date: "2024-06-20",
      player_opinion: "典型画大饼圈钱跑路，依靠概念CG吸引购买后放弃维护。",
      factual_description: "开发者路线图原定2024 Q2交付多人网络架构，2024年6月开发组清空官方群公告，Steam论坛版主账号注销。",
      evidence_level: "A",
      evidence_links: ["https://store.steampowered.com/news/app/example/roadmap_archive"],
      official_response: "无任何回应，官方微博最后一条停留在2024年2月抽奖动态。",
      official_response_date: null,
      status: "confirmed"
    }
  ],
  updateTimeline: [
    { game_id: "game-01", date: "2025-02-18", version: "v1.4.0", type: "大型更新", summary: "新增终局宗门争霸模式及完整MOD编辑器支持。" },
    { game_id: "game-01", date: "2024-11-02", version: "v1.3.2", type: "BUG修复", summary: "修复高分辨率缩放UI错位问题。" },
    { game_id: "game-02", date: "2024-03-01", version: "v0.2.1", type: "热修补丁", summary: "最后一次微小补丁：修改启动器Logo文字。" }
  ]
};