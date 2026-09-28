// VATLYTHPT V5.1 — cấu hình CÔNG KHAI cho website.
// Chỉ được đặt Supabase URL + PUBLISHABLE KEY ở đây.
// TUYỆT ĐỐI KHÔNG đặt sb_secret_..., OPENAI_API_KEY hay GEMINI_API_KEY.
window.VATLYTHPT_CONFIG = {
  version: '5.1.0',
  supabaseUrl: 'https://mtzueerddrwtvkbehrpn.supabase.co',
  supabasePublishableKey: 'PASTE_SUPABASE_PUBLISHABLE_KEY_HERE',
  functions: {
    generatePractice: 'generate-practice',
    aiTutor: 'ai-tutor',
    studentSkillSummary: 'student-skill-summary'
  },
  defaults: {
    practiceSource: 'auto',
    practiceCount: 10,
    weakThreshold: 0.60,
    avoidSeen: true,
    avoidFamily: true
  }
};
