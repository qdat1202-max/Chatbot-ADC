# KẾ HOẠCH & TÀI LIỆU CẤU TRÚC CÁC LUỒNG HỘI THOẠI NÂNG CAO
## CHATBOT HỖ TRỢ KỸ THUẬT Y TẾ 24/7 - CÔNG TY CỔ PHẦN THIẾT BỊ Y TẾ ADC

---

## 1. TỔNG QUAN & NGUYÊN TẮC THIẾT KẾ HỘI THOẠI

Chatbot ADC phục vụ đội ngũ y bác sĩ, kỹ thuật viên (KTV) xét nghiệm tại các bệnh viện, trung tâm y tế và phòng khám đa khoa trên toàn quốc. Do tính chất đặc thù của xét nghiệm y khoa (mẫu máu bệnh nhân, mẫu cấp cứu, hóa chất sinh học), hệ thống hội thoại được xây dựng theo 5 nguyên tắc cốt lõi:

1. **Tốc độ lâm sàng cao (< 500ms)**: Phản hồi đi thẳng vào bản chất kỹ thuật, không rào đón khách sáo để KTV nhanh chóng duy trì ca chạy mẫu.
2. **Cây quyết định phân nhánh rõ ràng (Decision Tree)**: Mỗi câu trả lời đi kèm **Câu hỏi định hướng** và **2-4 nút lựa chọn tương tác** (`suggestedOptions`) để người dùng bấm chọn 1 chạm, không cần gõ phím.
3. **Ưu tiên An toàn sinh học & Thiết bị**: Nhận diện tức thời các sự cố nguy hại (cháy, nổ, rò điện, mùi khét, tràn hóa chất, vỡ cuvette) và phát cảnh báo dừng máy khẩn cấp.
4. **Cam kết SLA phản hồi 15 phút**: Khi sự cố vượt ngưỡng AI hoặc người dùng yêu cầu, hệ thống tự động kích hoạt tạo phiếu điều phối (`TICK-xxxx`) và chuyển tiếp tới Kỹ sư trưởng trực ca ADC 24/7.
5. **Học hỏi liên tục (Continuous Learning)**: Tiếp thu mẹo xử lý thực tế từ KTV và sổ tay thực chiến `2026-XLKT` của KS. Nguyễn Quang Đạt.

---

## 2. BẢN ĐỒ DÒNG THIẾT BỊ TRỌNG TÂM (SUPPORTED MODELS)

| Mã dòng máy | Phân loại thiết bị | Cụm chức năng nhạy cảm nhất | Kỹ sư chuyên trách |
| :--- | :--- | :--- | :--- |
| **Zybio EXC200 / EXC220** | Máy xét nghiệm sinh hóa tự động | Kim hút mẫu vi lượng, đĩa ủ nhiệt 37°C, cuvette quang học thạch anh, bơm Syringe Hamilton | KS. Nguyễn Quang Đạt / KS. Trần Minh Tuấn |
| **Zybio Z3 CRP** | Máy huyết học 3 thành phần + CRP | Buồng đếm trở kháng WBC/RBC, cụm đo quang CRP độc lập, van pinch hóa chất Lyse/Diluent | KS. Trần Minh Tuấn / KS. Nguyễn Quang Đạt |
| **Zybio Z50** | Máy huyết học 5 thành phần Laser | Buồng tán xạ laser 3 góc (FSC/SSC/FL), lọc tinh Sheath Filter, bơm chân không áp lực âm | KS. Nguyễn Quang Đạt |
| **FS-205** | Máy miễn dịch huỳnh quang POCT | Đầu đọc quang huỳnh quang LED, cảm biến RFID thẻ lô, động cơ nạp khay cassette | KS. Hoàng Văn Nam / KS. Nguyễn Quang Đạt |

---

## 3. LUỒNG 1: KỊCH BẢN XỬ LÝ SỰ CỐ KỸ THUẬT PHỨC TẠP
*(Complex Technical Troubleshooting Flows)*

### Kịch bản 1.1: Trôi tọa độ & Kẹt cơ khí kim hút mẫu trục Z (Mã lỗi E101)
- **Dòng máy áp dụng**: Zybio EXC200 / EXC220
- **Từ khóa nhận diện**: `E101`, `kẹt kim`, `lệch kim`, `va chạm kim`, `kim không hút mẫu`, `kim cong`
- **Mức độ ưu tiên**: Cao (High / Urgent nếu kim bị kẹt cứng)
- **Cây quyết định & Phân nhánh hội thoại**:
  ```
  [User: "Máy EXC200 báo lỗi E101 va chạm kim hút mẫu"]
        │
        ├──> [Bot Bước 1: Khảo sát hiện trạng]
        │    "Phát hiện lỗi E101: Kim hút mẫu gặp trở ngại cơ học trên trục Z hoặc lệch đĩa phản ứng.
        │     KTV vui lòng quan sát thực tế và chọn tình trạng hiện tại:"
        │    ├── [Option A]: "Kim va vào thành ống mẫu / cuvette"
        │    ├── [Option B]: "Kim đứng yên phát tiếng kêu cạch cạch"
        │    ├── [Option C]: "Kim cong vênh rõ rệt bằng mắt thường"
        │    └── [Option D]: "Cần kỹ sư ADC đến cân chỉnh ngay"
        │
        ├──> [Nhánh A: Kim va vào thành ống mẫu / cuvette]
        │    "Hướng dẫn xử lý trôi tọa độ trục X/Y:
        │     1. Nhấn nút STOP khẩn cấp trên phần mềm.
        │     2. Vào Maintenance -> Alignment -> Sample Probe Calibration.
        │     3. Đặt ống chuẩn vào vị trí số 1 trên khay mẫu.
        │     4. Dùng phím điều hướng tinh chỉnh kim hạ đúng tâm ống (sai số < 0.5mm).
        │     5. Nhấn SAVE và chạy Test Reset."
        │    └── Guided Options: ["Đã cân chỉnh và hết báo lỗi", "Vẫn bị lệch tâm sau khi lưu", "Yêu cầu kỹ sư hỗ trợ"]
        │
        ├──> [Nhánh B: Kẹt trục Z kêu cạch cạch - Trượt dây đai/bụi ray trượt]
        │    "Chẩn đoán: Bụi bẩn bám dính trên ray trượt bi trục Z hoặc dây đai Timing Belt bị trùng.
        │     1. Tắt công tắc nguồn máy, rút phích cắm điện.
        │     2. Dùng gạc sạch tẩm cồn y tế 70° lau sạch bụi dọc trục thanh trượt Z.
        │     3. Tra 1-2 giọt dầu bôi trơn chuyên dụng mỡ trắng Teflon y sinh (Part: OIL-01).
        │     4. Dùng tay nhẹ nhàng di chuyển cụm kim lên xuống xem có trơn tru không.
        │     5. Bật máy, chạy chu trình Home Position Check."
        │    └── Guided Options: ["Kim đã trơn tru, hết kêu", "Vẫn kẹt cơ khí trục Z", "Gọi kỹ sư điều phối"]
        │
        └──> [Nhánh C & D: Kim cong vênh / Cần kỹ sư]
             ──> Chuyển tiếp ngay sang LUỒNG 3 (Kích hoạt tạo phiếu TICK-xxxx & Hotline 15 phút).
  ```

---

### Kịch bản 1.2: Dao động nhiệt độ buồng ủ 37°C & Mất áp suất chân không kết hợp (Mã lỗi E205)
- **Dòng máy áp dụng**: Zybio EXC200 / EXC220
- **Từ khóa nhận diện**: `E205`, `nhiệt độ buồng ủ`, `nhiệt độ dao động`, `buồng ủ không nóng`, `áp suất chân không`
- **Cây quyết định & Phân nhánh hội thoại**:
  ```
  [User: "Nhiệt độ đĩa ủ nhảy loạn 35 - 39 độ, áp suất báo yếu"]
        │
        ├──> [Bot: Phân tích sự cố kết hợp đa triệu chứng]
        │    "Cảnh báo: Hiện tượng kết hợp giữa mạch cảm biến nhiệt NTC buồng ủ và rò rỉ đường chân không.
        │     Nhiệt độ không chuẩn 37.0°C ± 0.2°C sẽ làm sai lệch hoàn toàn kết quả men gan AST/ALT, Ure, Glucose."
        │    ├── [Option 1]: "Kiểm tra mức nước và tuần hoàn nhiệt đĩa ủ"
        │    ├── [Option 2]: "Kiểm tra bẫy bọt và màng bơm chân không"
        │    ├── [Option 3]: "Đo đối chứng bằng nhiệt kế chuẩn"
        │    └── [Option 4]: "Điều phối Kỹ sư Đạt đến viện"
        │
        ├──> [Xử lý tuần hoàn nhiệt & Cảm biến NTC]:
        │    "Các bước kiểm tra:
        │     1. Mở nắp khoang đĩa ủ, kiểm tra quạt đối lưu nhiệt phía sau có quay đều không.
        │     2. Đảm bảo nắp che bảo vệ buồng ủ được đóng kín hoàn toàn, tránh thất thoát nhiệt.
        │     3. Nếu nhiệt độ nhảy vọt tức thời (VD từ 35°C nhảy lên 42°C trong 2 giây) -> Cảm biến NTC bị chập mạch ngắt quãng (Tham khảo sổ tay 2026-XLKT-016)."
        │
        └──> [Xử lý mất áp suất]:
             "Kiểm tra bình bẫy bọt thải (Waste Trap) có bị đầy hoặc nắp bình bị hở gioăng silicon không. Xiết chặt nắp bình."
  ```

---

### Kịch bản 1.3: Tắc nghẽn buồng đếm trở kháng WBC/RBC & Bọt khí Lyse (Mã lỗi H101 / H108)
- **Dòng máy áp dụng**: Zybio Z3 CRP / Z50
- **Từ khóa nhận diện**: `H101`, `tắc buồng đếm`, `clot buồng đếm`, `clot WBC`, `clot RBC`, `H108`, `bọt khí lyse`
- **Cây quyết định & Phân nhánh hội thoại**:
  ```
  [User: "Máy Z3 CRP báo H101 tắc buồng đếm WBC"]
        │
        ├──> [Bot: Hướng dẫn khai thông 3 cấp độ]
        │    "Mã H101: Tắc lỗ đếm sapphire (Aperture Clog) do tủa protein hoặc máu đông vi thể (micro-clot).
        │     Vui lòng thực hiện tuần tự theo 3 cấp độ:"
        │    ├── [Level 1 - Nhẹ]: "Chạy Zap & Flush tự động trên phần mềm"
        │    ├── [Level 2 - Trung bình]: "Ngâm tẩy rửa buồng đếm bằng E-Z Cleanser"
        │    ├── [Level 3 - Nặng]: "Tháo ống xịt rửa buồng đếm thủ công"
        │    └── [Escalation]: "Cần hỗ trợ trực tiếp từ KS. Tuấn"
        │
        ├──> [Chi tiết Level 1: Zap & Flush]:
        │    "Vào Service -> Maintenance -> Chọn 'Zap Aperture' 3 lần liên tiếp, sau đó chọn 'Backflush'.
        │     Chạy Background Run kiểm tra lại: WBC < 0.2, RBC < 0.02."
        │
        ├──> [Chi tiết Level 2: Ngâm E-Z Cleanser]:
        │    "1. Nhỏ 2.0ml dung dịch tẩy rửa chuyên dụng E-Z Cleanser trực tiếp vào buồng đếm WBC.
        │     2. Để ngâm ủ trong 15-20 phút cho tan hết cặn tủa protein.
        │     3. Nhấn Drain & Rinse 2 lần để rửa sạch hóa chất tẩy."
        │
        └──> [Chi tiết Level 3: Tháo rửa thủ công]:
             "CẢNH BÁO AN TOÀN SINH HỌC: Mẫu máu chứa nguy cơ lây nhiễm.
              Đeo găng tay y tế đôi, kính bảo hộ. Dùng bơm tiêm 5ml gắn ống mềm bơm dịch rửa thông ngược từ ngoài vào trong."
  ```

---

### Kịch bản 1.4: Lỗi cụm quang Laser 5 thành phần & Dòng dịch bao bọc (Mã lỗi Z501)
- **Dòng máy áp dụng**: Zybio Z50 (5TP Laser)
- **Từ khóa nhận diện**: `Z501`, `lỗi laser`, `tán xạ quang`, `sheath flow`, `dịch bao bọc`, `biểu đồ scattergram bất thường`
- **Cây quyết định**:
  1. Kiểm tra bong bóng khí trong đường ống Sheath: Chạy chu trình `Prime Sheath Flow` 2 lần.
  2. Kiểm tra bộ lọc Sheath Filter 0.2µm: Nếu đã dùng trên 6 tháng hoặc có cặn, đề xuất thay lọc.
  3. Kiểm tra điện áp phát Diode Laser: Nếu Scattergram bị co cụm hoặc trắng biểu đồ, yêu cầu kỹ sư ADC đo kiểm nguồn quang.

---

### Kịch bản 1.5: Kẹt khay nạp thẻ test cassette & Lỗi RFID lô hóa chất (FS-205)
- **Dòng máy áp dụng**: FS-205 (Miễn dịch huỳnh quang)
- **Từ khóa nhận diện**: `FS101`, `FS203`, `kẹt cassette`, `không đọc thẻ`, `thẻ rfid invalid`, `khay không nhả`
- **Cây quyết định**:
  1. Thao tác nhả cassette an toàn: Vào `Menu -> Eject Cassette`. Nếu motor không kéo, dùng gắp nhựa nhẹ nhàng kéo ra theo chiều trượt, không giật mạnh.
  2. Lỗi thẻ RFID: Đặt thẻ lô chip vuông góc và áp sát vùng đọc RFID 13.56MHz trong 2 giây. Nếu vẫn báo Invalid Card, vệ sinh bề mặt tiếp xúc của đầu đọc.

---

## 4. LUỒNG 2: HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH CHI TIẾT
*(Detailed Operational & User Guide Flows)*

### Hướng dẫn 2.1: Quy trình Khởi động đầu ca & Chạy nền Blank (Daily Startup)
- **Mục tiêu**: Đảm bảo toàn bộ hệ sinh thái thiết bị sạch cặn bẩn, áp suất đạt chuẩn trước khi phân tích mẫu bệnh nhân.
- **Các bước chuẩn hóa**:
  1. Bật công tắc nguồn chính và khởi động phần mềm điều khiển.
  2. Kiểm tra lượng hóa chất còn lại trên khay (Reagent Volume Check) và bình nước rửa/nước thải.
  3. Chờ buồng ủ đạt nhiệt độ ổn định (EXC200: 37°C ± 0.2°C; Z3/Z50: 35°C).
  4. Thực hiện chu trình Prime hóa chất để đẩy hết bọt khí tích tụ qua đêm trong đường ống.
  5. Chạy mẫu nền trắng (Blank / Background Run).
- **Tiêu chuẩn nghiệm thu Background Run**:
  - Máy huyết học: `WBC ≤ 0.2 x10^9/L`, `RBC ≤ 0.02 x10^12/L`, `HGB ≤ 1 g/L`, `PLT ≤ 10 x10^9/L`.
  - Máy sinh hóa: Độ hấp thụ quang cuvette nước trắng `Abs < 0.005 A` ở bước sóng 340nm.

---

### Hướng dẫn 2.2: Quy trình Hiệu chuẩn (Calibration) & Kiểm chuẩn nội bộ (IQC Levey-Jennings)
- **Mục tiêu**: Đảm bảo kết quả xét nghiệm nằm trong dải tin cậy 95% (±2SD).
- **Các bước chuẩn hóa**:
  1. Lấy ống mẫu Calibrator / Control từ tủ lạnh 2-8°C, để ấm ở nhiệt độ phòng 15-20 phút trước khi chạy.
  2. Lắc trộn nhẹ nhàng theo chiều số 8 (10-15 lần), tuyệt đối không lắc mạnh tạo bọt khí.
  3. Đặt vào đúng vị trí Calib/QC trên khay máy.
  4. Chọn chương trình QC 2 mức (Level 1: Bình thường, Level 2: Bệnh lý).
  5. Quan sát biểu đồ Levey-Jennings:
     - Nếu vi phạm quy tắc Westgard $1_{3s}$ hoặc $2_{2s}$ -> Dừng chạy mẫu bệnh nhân, chạy lại lần 2.
     - Nếu lỗi lặp lại -> Kiểm tra nhiệt độ buồng ủ và hạn dùng hóa chất.

---

### Hướng dẫn 2.3: Chu trình Tắt máy (Shutdown) & Ngâm rửa bảo dưỡng định kỳ
- **Mục tiêu**: Loại bỏ tủa protein, chống nghẹt kim và giữ độ trong suốt cho cuvette quang học thạch anh.
- **Các bước chuẩn hóa**:
  1. Đặt ống hóa chất tẩy rửa enzyme chuyên dụng `E-Z Cleanser` hoặc dung dịch `Acid Clean` vào vị trí quy định.
  2. Nhấn lệnh `Auto Shutdown` trên giao diện phần mềm.
  3. Hệ thống tự động hút dung dịch tẩy ngâm cuvette và kim hút trong 10-15 phút trước khi cắt điện.
  4. Vệ sinh khay đựng bệnh phẩm bằng cồn 70° và đổ bình chứa nước thải sinh học.

---

### Hướng dẫn 2.4: Thay thế & Mồi hóa chất (Prime Reagents)
- **Mục tiêu**: Thay thế an toàn chai hóa chất cạn, không để lọt không khí vào bơm vi lượng.
- **Các bước chuẩn hóa**:
  1. Vào màn hình quản lý hóa chất `Reagent Inventory`.
  2. Quét mã vạch chai hóa chất mới để máy tự động cập nhật số lô, hạn dùng và thể tích.
  3. Cắm đầu hút hóa chất ngập đáy bình, đảm bảo gioăng chống bay hơi được đậy khít.
  4. Nhấn `Prime Reagent` (chọn hóa chất tương ứng) từ 2 đến 3 chu trình để đẩy sạch khí trong dây dẫn.

---

## 5. LUỒNG 3: CHUYỂN TIẾP CUỘC GỌI & ĐIỀU PHỐI KỸ SƯ TRỰC TIẾP
*(Call Forwarding & Real-Time Escalation Flows)*

Hệ thống tích hợp công nghệ phân loại sự cố và cơ chế chuyển tiếp linh hoạt theo 4 kịch bản chuẩn:

```
                          ┌───────────────────────────┐
                          │   Tin nhắn từ Kỹ thuật    │
                          │      viên bệnh viện       │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
   [Kịch bản 3.1]               [Kịch bản 3.2]               [Kịch bản 3.3]
Nguy hại sinh học /          KTV yêu cầu trực tiếp       Không giải quyết sau
cháy nổ / rò điện /          gặp kỹ sư / gọi điện        2 lần / "Chưa hiệu quả"
tràn hóa chất / vỡ cuvette   ("gặp kỹ sư", "hotline")    
           │                            │                            │
           ▼                            ▼                            ▼
   [MỨC ĐỘ: KHẨN CẤP]           [MỨC ĐỘ: BÌNH THƯỜNG]        [MỨC ĐỘ: ĐIỀU PHỐI]
   Cảnh báo an toàn,            Hiển thị thông tin kỹ sư     Hiển thị thẻ điều phối
   ngắt điện ngay lập tức       trực ban + Nút gọi 1 chạm    và đếm ngược SLA 15 phút
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        ▼
                          [Kịch bản 3.4: Thu thập thông tin]
                          • Tên Bệnh viện / Phòng khám
                          • Số điện thoại liên hệ trực tiếp
                          • Khoa / Phòng xét nghiệm
                          • Mô tả hiện tượng & mã lỗi
                                        │
                                        ▼
                          [Tạo phiếu TICK-xxxx trên hệ thống]
                          • Cam kết kỹ sư gọi lại trong 15 phút
                          • Gửi thông báo đẩy sang Admin Portal
                          • Tự động mở Popup khẩn cấp trên màn hình kỹ sư
```

### Chi tiết Kịch bản 3.1: Nguy hại an toàn sinh học & Cháy nổ phần cứng (`keyword_match`)
- **Điều kiện kích hoạt**: Tin nhắn chứa bất kỳ từ khóa: `cháy`, `nổ`, `rò điện`, `mùi khét`, `vỡ cuvette`, `hỏng bo mạch`, `tràn hóa chất`, `chập điện`.
- **Hành vi hệ thống**:
  1. Ngắt ngay luồng hỏi đáp SOP thông thường.
  2. Bật còi cảnh báo hình ảnh (Banner đỏ nhấp nháy).
  3. Cung cấp hướng dẫn sinh tồn thiết bị:
     - *"TẮT CÔNG TẮC NGUỒN VÀ RÚT PHÍCH CẮM ĐIỆN NGAY LẬP TỨC"*.
     - *"ĐEO GĂNG TAY Y TẾ BẢO HỘ TRÁNH TIẾP XÚC TRỰC TIẾP HÓA CHẤT / MẢNH VỠ CUVETTE"*.
  4. Hiển thị Hotline khẩn cấp trực tiếp của KS. Nguyễn Quang Đạt (`0988 123 456`).
  5. Mở form yêu cầu gọi lại tự động gắn cờ `priority: 'urgent'`, thời gian phản hồi: 15 phút.

### Chi tiết Kịch bản 3.2: Khách hàng yêu cầu hỗ trợ trực tiếp (`direct_request`)
- **Điều kiện kích hoạt**: Khách hàng nhấn nút *"Yêu cầu hỗ trợ trực tiếp"* hoặc nhập từ khóa: `gặp kỹ sư`, `chuyển máy`, `gọi điện`, `người thật`, `tổng đài`, `kỹ thuật viên`, `hotline`.
- **Hành vi hệ thống**:
  1. Lựa chọn kỹ sư tối ưu theo chuyên môn dòng máy và tình trạng sẵn sàng (`status: 'available'`).
  2. Xuất trình thẻ kết nối kỹ sư với ảnh, tên, số điện thoại và khu vực phụ trách.
  3. Cung cấp nút bấm `tel:` gọi ngay và nút nhắn tin Zalo kết nối trong 1 chạm.

### Chi tiết Kịch bản 3.3: Chatbot không thể giải quyết / Thất bại lặp lại (`bot_unresolved` & `unhelpful_feedback`)
- **Điều kiện kích hoạt**:
  - Không tìm thấy SOP sau 2 lần hỏi liên tiếp (`maxUnresolvedAttempts: 2`).
  - Khách hàng phản hồi: *"vẫn không được"*, *"vẫn lỗi"*, *"đã thử nhưng không chạy"*.
  - Khách hàng nhấn nút *"Chưa hiệu quả"* ở đánh giá câu trả lời.
- **Hành vi hệ thống**:
  - Đưa ra lời xin lỗi chân thành: *"Dạ rất tiếc vì quy trình tự động chưa khắc phục được triệt để sự cố. Để không làm gián đoạn ca chạy mẫu bệnh nhân, hệ thống đã chuyển tiếp phiên hỗ trợ tới Kỹ sư chuyên trách ADC."*
  - Tự động hiển thị Thẻ điều phối kỹ sư ưu tiên (`ChatEscalationCardView`).

### Chi tiết Kịch bản 3.4: Thu thập thông tin & Kích hoạt phiếu TICK-xxxx
- **Dữ liệu tự động điền sẵn (Auto-fill)**: Dòng máy hiện tại, mã lỗi vừa tra cứu, tóm tắt hiện tượng từ đoạn chat.
- **Trường thông tin cần KTV xác nhận**: Tên Bệnh viện / Phòng khám, Số điện thoại bác sĩ/KTV phụ trách.
- **Đầu ra**:
  - Mã phiếu điều phối chuẩn: `TICK-2026-xxx`.
  - Hẹn giờ đếm ngược SLA 15 phút trên cả giao diện Khách hàng và Màn hình Quản trị.
  - Tự động mở Popup khẩn cấp trên màn hình Admin (`EmergencyIncidentModal`).

---

## 6. SƠ ĐỒ TRẠNG THÁI VÀ CẤU TRÚC DỮ LIỆU (STATE MACHINE SCHEMA)

Mỗi kịch bản trong hệ thống được định nghĩa dưới dạng một đối tượng cấu trúc:

```typescript
export interface AdvancedConversationFlow {
  id: string; // VD: 'flow-e101-probe-jam'
  title: string; // Tên luồng hiển thị
  category: 'complex_troubleshooting' | 'detailed_guide' | 'engineer_escalation';
  targetModels: EquipmentModel[]; // Dòng máy hỗ trợ
  triggerKeywords: string[]; // Từ khóa kích hoạt tự động
  triggerErrorCodes?: string[]; // Mã lỗi tương ứng (E101, H101, Z501, FS101...)
  summary: string; // Tóm tắt ngắn gọn
  initialQuestion: string; // Lời mở đầu hoặc câu hỏi dẫn dắt
  guidedOptions: string[]; // Các lựa chọn tương tác 1 chạm ban đầu
  branches: {
    userChoice: string; // Lựa chọn người dùng bấm
    replyText: string; // Nội dung hướng dẫn kỹ thuật chi tiết
    nextQuestion?: string; // Câu hỏi định hướng bước kế tiếp
    nextOptions?: string[]; // Các lựa chọn bước kế tiếp
    safetyWarning?: string; // Cảnh báo an toàn y sinh
    autoEscalate?: boolean; // Tự động chuyển kỹ sư nếu chọn nhánh này
    escalationReason?: 'keyword_match' | 'high_complexity' | 'bot_unresolved' | 'direct_request';
  }[];
}
```

---

## 7. HƯỚNG DẪN QUẢN LÝ VÀ CẬP NHẬT KỊCH BẢN (MAINTENANCE RUNBOOK)

1. **Bổ sung mã lỗi mới**: Khi có dòng máy hoặc phiên bản phần mềm mới, kỹ sư trưởng ADC thêm định nghĩa vào file `src/data/advancedConversationFlows.ts` và đồng bộ nội dung vào `plan.md`.
2. **Hiệu chỉnh thời gian SLA**: Cấu hình biến `callbackCommitmentMinutes` trong `SystemSettings` (mặc định 15 phút).
3. **Thêm từ khóa an toàn**: Cập nhật mảng `CRITICAL_EMERGENCY_KEYWORDS` trong `src/utils/escalationDetector.ts`.
4. **Kiểm tra tương thích**: Chạy `npm run lint` (`tsc --noEmit`) và `npm run build` sau mỗi lần cập nhật.

---
*Tài liệu ban hành bởi: Bộ Phận Kỹ Thuật & Dịch Vụ Khách Hàng ADC - Phiên bản 2026.1*
