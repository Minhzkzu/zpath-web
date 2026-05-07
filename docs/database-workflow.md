# Quy trình Database chuẩn (Supabase) cho ZPATH

Tài liệu này mô tả quy trình “schema-as-code” để mọi thay đổi Database được review/merge qua Git và tự động cập nhật lên Supabase **mà không thao tác trực tiếp trên UI**.

## Mục tiêu

- **Tất cả thay đổi schema** (tạo bảng/cột/index/RLS/policies/functions/views) phải đi qua `supabase/migrations/*.sql` và được review qua PR.
- **Tách môi trường** (khuyến nghị): `dev` / `staging` / `prod` để an toàn.
- **Tự động đồng bộ DB khi merge code**: khi PR vào `develop` hoặc `main` được merge, CI sẽ chạy và apply migrations lên Supabase project tương ứng.

## Nguyên tắc bắt buộc

- **Không chỉnh schema bằng Supabase Studio trên cloud** (UI) cho môi trường dùng chung. Nếu cần inspect dữ liệu thì được phép, nhưng **không tạo/sửa bảng, policy, function trực tiếp**.
- **Migrations phải idempotent theo tinh thần “chạy tuần tự đúng 1 lần”**:
  - Không sửa file migration đã merge (immutable).
  - Sửa sai thì tạo migration mới để “fix forward”.
- **RLS mặc định bật** cho mọi bảng trong `public` có thể expose qua API.
- **Không commit secrets** (`.env.local`, service_role key, DB password).

## Vai trò & quyền hạn (khuyến nghị)

- **DB Owner (Tech Lead/DevOps)**:
  - Quản lý Supabase projects (`dev/staging/prod`), secrets CI, network restrictions.
  - Duyệt các thay đổi có tác động lớn (DROP/ALTER data, RLS/policies phức tạp).
- **Feature Developer (mọi team)**:
  - Tạo migration + cập nhật code.
  - Viết policy tối thiểu để feature chạy đúng (đặc biệt bảng chứa dữ liệu user).
- **Reviewer**:
  - Review migration SQL, kiểm tra backward-compatibility và data safety.

## Chuẩn đặt tên migration & schema

- **Tên migration**: `YYYYMMDDHHMMSS_<mota_ngan>.sql` (CLI tạo tự động).
- **Tên bảng**: snake_case, số nhiều, prefix theo domain.
  - Ví dụ: `user_profiles`, `survey_questions`, `survey_sessions`, `audit_events`.

## Local Dev: luồng chuẩn để thay đổi DB

### 1) Khởi động Supabase local

```bash
npx supabase start
```

### 2) Tạo/đổi schema (2 cách – chọn 1)

**Cách A (khuyến nghị khi đã rõ SQL): tạo migration rồi viết SQL**

```bash
npx supabase migration new add_personality_schema
```

- Viết SQL vào file mới trong `supabase/migrations/`.
- Chạy reset để test từ đầu:

```bash
npx supabase db reset
```

**Cách B (iter nhanh): thao tác SQL lên local rồi “diff” ra migration**

- Chạy SQL vào local DB (qua psql/Studio local).
- Sinh migration từ diff:

```bash
npx supabase db diff -f add_personality_schema
```

- Test lại bằng:

```bash
npx supabase db reset
```

### 3) Seed dữ liệu local (câu hỏi, ngành, dữ liệu mẫu)

- Entry file: `supabase/seed.sql` (được chạy sau migrations khi `db reset`).
- Quy ước:
  - Seed chỉ phục vụ **local/dev**.
  - Seed dùng `INSERT ... ON CONFLICT DO UPDATE` để chạy lại không lỗi.
  - Không seed dữ liệu nhạy cảm hoặc dữ liệu production.

### 4) Checklist trước khi push PR

- `npx supabase db reset` chạy thành công.
- Migration không có lệnh phá dữ liệu “ngầm” (DROP TABLE/COLUMN) trừ khi có plan migrate data.
- Bảng public có **RLS + policies** tối thiểu.
- Nếu thêm view: ưu tiên `security_invoker` (tuỳ phiên bản Postgres trên Supabase).

## PR / Code review rules (DB)

- PR có thay đổi DB phải có:
  - **Mô tả lý do** thay đổi schema.
  - **Rủi ro/migration strategy** nếu có thay đổi breaking.
  - **Test plan**: đã `db reset`, UI flow nào đã chạy.
- Reviewer check nhanh:
  - Có tạo index cho cột hay query phổ biến chưa.
  - RLS có đúng “actor” (anon/authenticated/service) không.
  - Không dùng `auth.jwt()` với user-editable metadata để phân quyền.

## CI/CD: tự động apply migrations lên Supabase (môi trường dùng chung)

### Branch → Environment mapping (khuyến nghị)

- `develop` → Supabase project **DEV**
- `main` → Supabase project **PROD**

### Secrets cần cấu hình trên GitHub

Tại GitHub repo → Settings → Secrets and variables → Actions:

- **SUPABASE_ACCESS_TOKEN**: token của Supabase (từ DB Owner)
- **SUPABASE_PROJECT_REF_DEV**: project ref môi trường DEV
- **SUPABASE_DB_PASSWORD_DEV**: DB password môi trường DEV
- **SUPABASE_PROJECT_REF_PROD**: project ref môi trường PROD
- **SUPABASE_DB_PASSWORD_PROD**: DB password môi trường PROD

> Lưu ý: DB Owner nên dùng GitHub **Environments** để giới hạn ai được deploy PROD.

### Cơ chế hoạt động

- Khi push/merge vào `develop` hoặc `main`, GitHub Actions sẽ:
  - cài Supabase CLI
  - `supabase link` tới project tương ứng
  - `supabase db push` để apply migrations mới

## Ví dụ schema (tuỳ chọn) cho “Question Bank + Session + Answers” (mẫu tổng quát)

Nếu team nào làm dạng khảo sát/bài test/adaptive flow, thường sẽ có:

- **`*_questions`**: ngân hàng câu hỏi + metadata
- **`*_sessions`**: 1 lần làm của user (progress/resume)
- **`*_answers`**: event trả lời (audit/tuning)
- **`*_results`**: kết quả tổng hợp (vector/score/label nếu có)

RLS gợi ý:

- Bảng chứa dữ liệu user (`*_sessions`, `*_answers`, `*_results`): user chỉ đọc/ghi dữ liệu của chính họ.
- Bảng reference (`*_questions`): thường read cho user, write chỉ dành cho admin/service.

## “Team khác” muốn thêm bảng/thu thập dữ liệu

Quy tắc chung:

- Mỗi domain tạo folder docs + migration riêng, nhưng tất cả vẫn về chung `supabase/migrations/`.
- Khi cần bảng log/event lớn: cân nhắc partitioning hoặc retention sớm (để không phình DB).
- Mọi thay đổi phải có owner và mô tả dữ liệu/PII level (low/medium/high).

