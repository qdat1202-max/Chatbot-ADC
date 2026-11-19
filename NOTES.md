# BẢN QUY TẮC PHÁT TRIỂN DỰ ÁN (PROJECT RULES & GUIDELINES)

Dự án: **Hệ thống Chatbot ADC Hỗ trợ Kỹ thuật Thiết bị Y tế & Quản trị Điều phối Kỹ sư**
Tham chiếu tài liệu tri thức: `2026-XLKT - Sổ tay xử lý kỹ thuật của KS. Nguyễn Quang Đạt` & SOP 4 dòng máy y tế (Zybio EXC200/220, Z3 CRP, Z50, FS-205).

---

## 1. Quy tắc về Công nghệ (Technology Rules)

1. **Kiến trúc Chatbot Lai (Hybrid Server-Side LLM & Local SOP Cache)**:
   - Toàn bộ lệnh gọi mô hình ngôn ngữ lớn phải thực hiện ở server-side thông qua SDK `@google/genai` (model `gemini-3.8-flash`) với `httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }` để bảo vệ API key tuyệt đối.
   - Luôn duy trì cơ chế đệm tri thức SOP và đối khớp mã lỗi tức thì (Local Pattern & Keyword Matcher) chạy song song, đảm bảo phản hồi tức thì dưới 0.2 giây ngay cả khi kết nối mạng chập chờn tại phòng xét nghiệm bệnh viện.

2. **Xử lý Dữ liệu Chuẩn Excel & Đồng bộ Lưu trữ (Excel Engine & Persistence)**:
   - Sử dụng thư viện `xlsx` (SheetJS) để xuất và nhập dữ liệu dạng bảng tính chuẩn `.xlsx` cho phiếu kỹ thuật, lịch sử máy và kho tri thức SOP.
   - Sử dụng cơ chế lưu trữ client-side reactive store có đồng bộ `localStorage` giúp dữ liệu của kỹ sư hiện trường không bị mất mát khi thao tác ngoài hiện trường.

---

## 2. Quy tắc về Nội dung & Nghiệp vụ (Content & Domain Rules)

1. **Chuẩn mực An toàn Sinh học & Kỹ thuật Thiết bị Y sinh (Biomedical Safety & Accuracy)**:
   - Mọi hướng dẫn xử lý lỗi phải bám sát tài liệu SOP chính hãng và kinh nghiệm thực chiến từ sổ tay `2026-XLKT`.
   - Bắt buộc phải có cảnh báo an toàn sinh học (ví dụ: ngắt nguồn điện trước khi tháo vỏ máy, đeo găng tay chống nhiễm khuẩn đối với bộ phận tiếp xúc máu/hóa chất, xả áp suất trước khi rút ống dẫn dịch).

2. **Trải nghiệm Đa kênh Tức thì & Tôn trọng Yêu cầu Khách hàng (Direct Support & Escalation)**:
   - Khi chatbot không thể giúp người dùng tự khắc phục hoặc sự cố cần tháo máy chuyên sâu, giao diện phải làm nổi bật nút **"Yêu cầu hỗ trợ trực tiếp"** để tạo phiếu kỹ thuật khẩn.
   - Luôn duy trì 2 biểu tượng Zalo (icon vuông) và Hotline (tông màu trắng đỏ) ở góc dưới bên trái màn hình khách hàng, cho phép di chuyển hoặc đóng bằng dấu `x`, kết nối ngay với kỹ sư trực ca 24/7.

---

## 3. Điều cấm (Forbidden Rule)

1. **Nghiêm cấm Trả lời Phỏng đoán Y tế Không có Cơ sở (Strict Anti-Hallucination & Anti-Slop)**:
   - Tuyệt đối không được sáng tạo ra các bước can thiệp phần cứng tùy tiện có nguy cơ gây hỏng bo mạch, sai lệch kết quả xét nghiệm của bệnh nhân hoặc rò rỉ hóa chất độc hại. Nếu không tìm thấy mã lỗi hoặc hiện tượng chưa từng có trong SOP, chatbot phải khuyến nghị khách hàng ngưng chạy mẫu và bấm nút **"Yêu cầu hỗ trợ trực tiếp"** để kỹ sư đến kiểm tra tận nơi.
   - Không hiển thị các chỉ số đo lường giả lập (fake scores, fake latency badges), không dùng viền dày đơn điệu hoặc pill badge rườm rà.
