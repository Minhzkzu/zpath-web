# ZPATH Project Rules for Claude/Cursor

## Tech Stack
- Framework: Next.js 16+ (App Router, Turbopack).
- Styling: Tailwind CSS (Utility-first).
- Icons: Lucide-React.
- Animations: Framer Motion.
- Database/Auth: Supabase.

## Coding Standards
- Luôn sử dụng TypeScript với định nghĩa Type/Interface rõ ràng.
- Sử dụng Functional Components và Arrow Functions.
- Ưu tiên tối đa việc tách Logic ra Custom Hooks trong thư mục `/hooks`.
- Giao diện phải tương thích Mobile-first.

## Database & Migrations
- Không được hướng dẫn người dùng sửa DB trực tiếp trên UI của Supabase Cloud.
- Luôn ưu tiên sử dụng Supabase CLI và tạo file migration khi có thay đổi Schema.

## Tone & Language
- Phản hồi và giải thích code bằng tiếng Việt.
- Comment trong code bằng tiếng Anh theo chuẩn ngành.