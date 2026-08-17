// ==============================================================================
// 系统全局配置 (Supabase 凭证配置)
// 生产环境安全注意: 前端仅配置 Anon Key，严格禁止写入 Service Role Key
// ==============================================================================
const CONFIG = {
  SUPABASE_URL: "https://your-project.supabase.co", // 替换为你的 Supabase 项目 URL
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // 替换为公开 Anon Key
  USE_MOCK_FALLBACK: true, // 当 Supabase 未配置或断网时，无缝切换到本地离线档案库
  VERSION: "1.0.0-PROD"
};