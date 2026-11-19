import { ADCBulletin } from '../types';

export const INITIAL_BULLETINS: ADCBulletin[] = [
  {
    id: 'BLT-2026-001',
    title: 'Khuyến cáo kiểm soát bọt khí đường ống Reagent và hiệu chuẩn Cuvette máy Zybio EXC200',
    category: 'Khuyến cáo kỹ thuật',
    equipmentModel: 'Zybio EXC200/220',
    summary: 'Kiểm soát bọt khí trong buồng bơm áp lực và quy trình kiểm tra độ hấp thụ quang của cuvette để tránh sai lệch kết quả sinh hóa men gan AST/ALT.',
    content: `Trong quá trình vận hành máy sinh hóa tự động Zybio EXC200/EXC220 tại các phòng xét nghiệm có nhiệt độ phòng biến động (>28°C), kỹ sư ADC ghi nhận hiện tượng bọt khí siêu nhỏ tích tụ tại van chia hóa chất (Distributor Valve) và ống dẫn kim R1/R2, gây suy giảm độ chính xác kết quả đo quang phổ.

Ban Kỹ Thuật ADC và KS. Nguyễn Quang Đạt khuyến cáo các khoa xét nghiệm tuân thủ quy trình kiểm soát bắt buộc đầu ca làm việc mỗi ngày.`,
    recommendations: [
      'Bật máy trước 20 phút để buồng ủ quang học đạt nhiệt độ ổn định chuẩn 37.0°C ± 0.1°C.',
      'Thực hiện chức năng "Water Blank & Cell Blank" trước khi chạy mẫu, đảm bảo độ hấp thụ của từng giếng cuvette < 0.005 OD.',
      'Kiểm tra bình hóa chất rửa Acid/Alkaline Wash: không để mức dung dịch dưới vạch MIN 15%.',
      'Nếu phát hiện bọt khí trong xi-lanh bơm (Syringe), dùng lệnh "De-bubble Syringe" trong menu Bảo dưỡng để xả khí tự động.',
      'Định kỳ 1 lần/tuần ngâm kim hút trong dung dịch Probe Cleaner pha loãng 1:10 trong 15 phút.'
    ],
    engineerAuthor: 'KS. Nguyễn Quang Đạt (Trưởng nhóm Kỹ thuật Xét nghiệm ADC)',
    approvedAt: '2026-10-25 09:30',
    status: 'published',
    isPinned: true,
    priority: 'high',
    createdAt: '2026-10-25 08:15',
    updatedAt: '2026-10-25 09:30'
  },
  {
    id: 'BLT-2026-002',
    title: 'Quy trình ngâm rửa chống tắc buồng đếm trở kháng và kim hút Probe máy huyết học Zybio Z3 CRP',
    category: 'Hướng dẫn bảo dưỡng',
    equipmentModel: 'Zybio Z3 CRP',
    summary: 'Cảnh báo nguy cơ hình thành màng Fibrin/Protein bám lỗ đếm WBC/RBC và quy trình ngâm E-Z Cleanser cuối mỗi ngày làm việc.',
    content: `Máy huyết học tự động Zybio Z3 CRP tích hợp buồng đo quang học CRP và buồng đếm tế bào trở kháng điện tích. Các mẫu máu bệnh nhân có nồng độ Fibrinogen cao hoặc mẫu máu mao mạch có xu hướng tạo vi huyết khối bám vào lỗ đếm Sapphire (Aperture 70µm/50µm), dẫn đến báo động mã lỗi H101 (RBC Clog) hoặc kết quả CRP dao động bất thường.

Quy trình bảo dưỡng dự phòng này được biên soạn bởi Kỹ sư ADC và đã được phê duyệt làm quy chuẩn kỹ thuật hỗ trợ khách hàng.`,
    recommendations: [
      'Tuyệt đối thực hiện lệnh "Daily Shutdown" tự động với dung dịch ngâm E-Z Cleanser vào cuối mỗi buổi làm việc.',
      'Không lắc mẫu máu quá mạnh tạo bọt khí; đảo nhẹ nhàng mẫu từ 8-10 lần trước khi nạp vào giá hút.',
      'Khi gặp cảnh báo "Aperture Clog", nhấn nút "Zap / Flush" trên màn hình cảm ứng để bắn tia điện nhiệt giải phóng clot nghẽn.',
      'Kiểm tra ống thải chất lỏng (Waste Tube), đảm bảo ống không bị gập khúc hoặc đè nén bởi chân bàn.',
      'Thay mới bộ màng lọc không khí phía sau máy 03 tháng/lần để bảo vệ bơm hút chân không.'
    ],
    engineerAuthor: 'KS. Nguyễn Quang Đạt & KS. Trần Minh Tuấn',
    approvedBy: 'Ban Quản Trị ADC (Ths. Hoàng Văn Nam)',
    approvedAt: '2026-10-26 14:15',
    status: 'published',
    isPinned: true,
    priority: 'urgent',
    createdAt: '2026-10-26 11:20',
    updatedAt: '2026-10-26 14:15'
  },
  {
    id: 'BLT-2026-003',
    title: 'Cảnh báo bảo quản hóa chất Lyse Laser và chống ẩm cho buồng quang học Zybio Z50 trong mùa nồm',
    category: 'Cảnh báo sự cố',
    equipmentModel: 'Zybio Z50',
    summary: 'Lưu ý kiểm soát nhiệt độ phòng xét nghiệm 18°C - 26°C và độ ẩm < 70% nhằm bảo vệ cụm Diode Laser 5 thành phần bạch cầu.',
    content: `Khí hậu nồm ẩm tại khu vực miền Bắc và miền Trung có thể gây đọng sương trên lăng kính Diode Laser và các cảm biến quang học góc tán xạ (FSC/SSC) của máy huyết học 5 thành phần Zybio Z50. Hiện tượng này dẫn đến biểu đồ Scattergram phân cụm bạch cầu bị nhòe mờ, không tách bạch được dòng Neutrophil và Eosinophil.

Kỹ sư ADC khuyến cáo các bệnh viện và phòng khám duy trì điều hòa hút ẩm liên tục 24/24 trong phòng đặt máy.`,
    recommendations: [
      'Duy trì máy hút ẩm hoặc điều hòa nhiệt độ phòng 20°C - 24°C, độ ẩm tương đối không vượt quá 65% RH.',
      'Hóa chất Diluent và Lyse (L1, L2) cần để cách sàn tối thiểu 15cm trên kệ gỗ hoặc pallet nhựa, tránh nhiễm lạnh ẩm từ nền gạch.',
      'Khi phát hiện biểu đồ tán xạ bị xê dịch cụm, chạy mẫu chuẩn Calibrator và kiểm tra điện áp nguồn ổn định 220V qua bộ lưu điện UPS.',
      'Liên hệ ngay Hotline kỹ thuật ADC 1900 6868 nếu đèn laser báo cảnh báo "Laser Current Out of Range".'
    ],
    engineerAuthor: 'KS. Trần Minh Tuấn (Kỹ sư Hiện trường ADC)',
    approvedBy: 'Ban Quản Trị ADC',
    approvedAt: '2026-10-27 10:00',
    status: 'published',
    isPinned: false,
    priority: 'high',
    createdAt: '2026-10-27 08:30',
    updatedAt: '2026-10-27 10:00'
  },
  {
    id: 'BLT-2026-004',
    title: 'Lưu ý định kỳ vệ sinh khay ủ test strip và cảm biến huỳnh quang máy miễn dịch FS-205',
    category: 'Lưu ý vận hành',
    equipmentModel: 'FS-205',
    summary: 'Hướng dẫn lau sạch bụi phát quang và bụi giấy thử trên khay trượt test cartridge của máy miễn dịch huỳnh quang FS-205.',
    content: `Máy miễn dịch huỳnh quang FS-205 sử dụng đèn kích thích UV-LED và cảm biến bắt tín hiệu phát xạ huỳnh quang siêu nhạy (ng/mL). Bụi bẩn bám trên rãnh trượt khay test hoặc vân tay dính trên ô đọc quang có thể làm sai lệch trị số xét nghiệm Tim mạch (Troponin I, CK-MB) và Viêm (hs-CRP, PCT).

KS. Nguyễn Quang Đạt hướng dẫn quy trình vệ sinh nhẹ nhàng bằng cồn y tế 70 độ.`,
    recommendations: [
      'Chỉ sử dụng tăm bông y tế tẩm cồn Isopropyl 70% lau nhẹ bề mặt thấu kính quang học khi đã tắt nguồn máy.',
      'Không dùng cồn 90 độ hoặc dung môi acetone vì có thể gây mờ đục mặt kính bảo vệ cảm biến.',
      'Định kỳ chạy thẻ kiểm định quang học (Optical Quality Control Card) đi kèm máy 01 lần mỗi đầu tháng.',
      'Đảm bảo cắm thẻ chip code (IC Card) khớp chính xác với số lô (Lot number) của hộp hóa chất đang sử dụng.'
    ],
    engineerAuthor: 'KS. Nguyễn Quang Đạt',
    approvedBy: 'Ban Quản Trị ADC',
    approvedAt: '2026-10-27 16:45',
    status: 'published',
    isPinned: false,
    priority: 'normal',
    createdAt: '2026-10-27 15:00',
    updatedAt: '2026-10-27 16:45'
  },
  {
    id: 'BLT-2026-005',
    title: 'Thông báo lịch trực hỗ trợ kỹ thuật hiện trường 24/7 và kiểm tra bảo dưỡng định kỳ quý 4/2026',
    category: 'Thông báo khẩn',
    equipmentModel: 'Tất cả dòng máy',
    summary: 'Công ty Cổ phần Thiết Bị Y Tế ADC công bố lịch trực điều phối kỹ sư hỗ trợ 24/7 và gói kiểm chuẩn máy miễn phí quý 4.',
    content: `Nhằm đảm bảo hoạt động khám chữa bệnh xuyên suốt của các cơ sở y tế đối tác trong giai đoạn cao điểm cuối năm 2026, ADC Medical Tech duy trì đội ngũ kỹ sư trực chiến 24/7 tại tất cả các khu vực Hà Nội, Hải Phòng, Quảng Ninh, Thái Nguyên, Nam Định và các tỉnh lân cận.

Mọi sự cố khẩn cấp sẽ được kỹ sư tiếp nhận cuộc gọi và có mặt tại viện trong vòng 60 - 90 phút.`,
    recommendations: [
      'Lưu số Hotline khẩn cấp 1900 6868 hoặc Hotline kỹ sư trực: 0988 123 456 (KS. Nguyễn Quang Đạt).',
      'Đăng ký lịch kiểm tra định kỳ miễn phí quý 4 qua nút "Yêu cầu hỗ trợ trực tiếp" trên cổng khách hàng.',
      'Kiểm tra hạn sử dụng hóa chất và lượng tồn kho vật tư tiêu hao (Cuvette, Kim hút, Giấy in) để được cung ứng kịp thời.'
    ],
    engineerAuthor: 'Đội ngũ Kỹ sư ADC',
    approvedBy: 'Ban Quản Trị ADC (Toàn quyền)',
    approvedAt: '2026-10-28 08:00',
    status: 'published',
    isPinned: true,
    priority: 'urgent',
    createdAt: '2026-10-28 07:30',
    updatedAt: '2026-10-28 08:00'
  },
  {
    id: 'BLT-2026-006',
    title: '[Bản nháp nội bộ] Hướng dẫn thay thế seal van điện từ V2 trên máy sinh hóa EXC220',
    category: 'Khuyến cáo kỹ thuật',
    equipmentModel: 'Zybio EXC200/220',
    summary: 'Tài liệu hướng dẫn nội bộ cho kỹ sư về căn chỉnh lực vặn ốc và kiểm tra rò rỉ tại cụm van điện từ V2.',
    content: `Bản nháp hướng dẫn kỹ thuật thay thế gioăng cao su chịu hóa chất seal van V2 máy EXC220 khi có hiện tượng rò rỉ dung dịch rửa kiềm. Bài viết đang được hoàn thiện quy trình an toàn sinh học trước khi phê duyệt công bố ra cổng khách hàng.`,
    recommendations: [
      'Ngắt nguồn điện chính và xả áp suất khí nén trong hệ thống trước khi tháo rời.',
      'Bôi trơn nhẹ nhàng bằng mỡ silicon y tế chịu nhiệt trên bề mặt gioăng O-ring mới.',
      'Siết ốc theo đường chéo với lực vặn đều 1.2 Nm tránh cong vênh đế van.'
    ],
    engineerAuthor: 'KS. Nguyễn Quang Đạt',
    status: 'draft',
    isPinned: false,
    priority: 'normal',
    createdAt: '2026-10-28 10:15',
    updatedAt: '2026-10-28 10:15'
  },
  {
    id: 'BLT-2026-007',
    title: '[Đang chờ duyệt] Khuyến nghị tăng tần suất chạy Probe Cleanser cho phòng khám có lưu lượng >200 mẫu/ngày',
    category: 'Khuyến cáo kỹ thuật',
    equipmentModel: 'Zybio Z3 CRP',
    summary: 'Đề xuất tăng chu kỳ bảo dưỡng giữa ca cho các phòng khám công suất lớn nhằm hạn chế sai số HGB và PLT.',
    content: `Theo dõi thực tế tại các phòng khám đa khoa có lưu lượng xét nghiệm trên 200 mẫu/ngày cho thấy cặn protein tích tụ nhanh gấp 3 lần bình thường. Kỹ sư đề xuất khuyến cáo chạy Probe Cleanser bổ sung vào giữa ca trưa (12h30). Đang trình Ban Quản Trị ADC xét duyệt nội dung.`,
    recommendations: [
      'Thêm 01 lần rửa tăng cường "Enhanced Rinse" vào giữa ngày làm việc.',
      'Định kỳ kiểm tra kim hút mẫu dưới kính lúp kỹ thuật số 1 lần/tuần.'
    ],
    engineerAuthor: 'KS. Trần Minh Tuấn',
    status: 'pending_review',
    isPinned: false,
    priority: 'normal',
    createdAt: '2026-10-28 11:30',
    updatedAt: '2026-10-28 11:30'
  }
];
