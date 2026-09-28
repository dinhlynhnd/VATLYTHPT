# GÓI A — VATLYTHPT GitHub + Vercel + Supabase (không VPS)

## Mục tiêu
Giữ repo GitHub/Vercel hiện tại. Word/PDF không đi qua Vercel Function nên không vướng giới hạn payload; browser upload trực tiếp vào Supabase Storage bằng signed upload URL. Máy Windows của thầy lấy job, xử lý MathType/ảnh/câu hỏi, rồi upload Preview trực tiếp về Supabase.

## 1. Sao lưu repo GitHub hiện tại
Trước khi ghi đè `index.html`, tải ZIP repo hoặc tạo branch `backup-before-processor-v2`.

## 2. Tạo Supabase project miễn phí
Vào Supabase → New project. Sau khi project sẵn sàng:
- SQL Editor → New query
- dán toàn bộ `supabase/SETUP_SUPABASE.sql`
- Run

Sau đó vào Project Settings/API và lấy:
- Project URL → `SUPABASE_URL`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Không đưa service_role key vào GitHub/index.html.**

## 3. Đưa Gói A vào repo GitHub
Copy **nội dung bên trong** Gói A vào root repo `VATLYTHPT`:
```
VATLYTHPT/
  index.html
  lesson.html
  package.json
  vercel.json
  api/
  lib/
  supabase/
```
Nếu repo đã có `assets/`, giữ các ảnh hiện có và merge, không xóa.

## 4. Vercel Environment Variables
Vercel → Project → Settings → Environment Variables. Tạo cho Production (và Preview nếu muốn):
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<mật khẩu mạnh của thầy>
SESSION_SECRET=<chuỗi ngẫu nhiên >= 48 ký tự>
PROCESSOR_KEY=<chuỗi ngẫu nhiên >= 48 ký tự>
PUBLIC_SITE_URL=https://vatlythpt.com
MAX_UPLOAD_MB=100
```
`PROCESSOR_KEY` phải giống hệt trong Gói B Windows.

Có thể sinh 2 chuỗi ngẫu nhiên bằng PowerShell:
```
-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```
Chạy 2 lần: một cho SESSION_SECRET, một cho PROCESSOR_KEY.

## 5. Commit/push lên GitHub
Vercel sẽ redeploy tự động. Sau deploy mở:
`https://vatlythpt.com/api/health`

Kết quả đúng trước khi bật Windows Processor:
```json
{"status":"Vercel + Supabase online","processor_online":false}
```

## 6. Cài Gói B Windows
Làm theo README trong Gói B. Sau khi `START_PROCESSOR.bat` chạy, `/api/health` phải đổi thành `processor_online:true` trong tối đa khoảng 1 phút.

## 7. Luồng sử dụng
Admin → Nội dung học → chọn bài → **Tải Word/PDF** → file upload trực tiếp Supabase → job `queued` → Windows Processor nhận → Preview → thầy duyệt → Xuất bản.

## 8. Kiến trúc an toàn
- Service Role chỉ ở Vercel Environment Variables.
- Processor Key chỉ ở Vercel và `config.ini` máy thầy.
- OpenAI/Gemini API key chỉ ở máy Windows.
- File nguồn nằm bucket private `lesson-originals`.
- Nội dung bài đã xử lý nằm bucket public `lesson-public`.
- Admin dùng HttpOnly cookie được ký HMAC.

## 9. Lưu ý về file lớn
Vercel Functions có giới hạn payload nên V2 **không upload Word/PDF qua Function**. Function chỉ tạo signed URL; browser gửi file thẳng tới Supabase Storage. Đây là chủ ý thiết kế, không phải workaround tạm thời.
