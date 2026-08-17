// ==============================================================================
// 系统全局配置 (Supabase 凭证配置)
// 生产环境安全注意: 前端仅配置 Anon Key，严格禁止写入 Service Role Key
// ==============================================================================
const CONFIG = {
  SUPABASE_URL: "https://ecapvdkokwwffaycoxsv.supabase.co", // 替换为你的 Supabase 项目 URL
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYXB2ZGtva3d3ZmZheWNveHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTQ2ODgsImV4cCI6MjEwMjQ5MDY4OH0.V-op2AaAX7kyuKT3jGihZiOPzIVRf7JFoa3aoWNrI-o", // 替换为公开 Anon Key
  USE_MOCK_FALLBACK: false, // 当 Supabase 未配置或断网时，无缝切换到本地离线档案库
  VERSION: "1.0.0-PROD"
};
