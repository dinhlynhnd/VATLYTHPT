// CẤU HÌNH CÔNG KHAI CHO WEBSITE.
// Chỉ điền SUPABASE URL + PUBLISHABLE KEY. TUYỆT ĐỐI KHÔNG đặt sb_secret_... hay API key OpenAI/Gemini ở đây.
window.VATLYTHPT_CONFIG = {
  version: '5.0.0',
  supabaseUrl: 'https://mtzueerddrwtvkbehrpn.supabase.co',
  supabasePublishableKey: '',
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
