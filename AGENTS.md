# Cursor Agent Instructions

## Project Context
Bạn đang hỗ trợ phát triển ZPATH - một hệ thống hướng nghiệp. Dự án đang ở giai đoạn xây dựng Matching Engine (Thuật toán đối sánh điểm số và tính cách).

## Agent Goals
1. Khi được yêu cầu tạo tính năng mới, hãy tự động kiểm tra xem có cần tạo Component mới trong `/components` hay Hook mới trong `/hooks` không.
2. Nếu có thay đổi liên quan đến dữ liệu, hãy nhắc người dùng chạy `npx supabase db diff` để lưu migration.
3. Luôn đọc file `README.md` để đảm bảo tuân thủ đúng luồng Gitflow của team.

## Critical Constraints
- Tuyệt đối không xóa các file cấu hình quan trọng như `.env.local`, `next.config.ts`, `tsconfig.json`.
- Luôn kiểm tra xem thư viện đã được cài đặt trong `package.json` chưa trước khi sử dụng `import`.