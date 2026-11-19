import { SOPArticle, SupportTicket, EngineerProfile, MaintenanceRecord, SystemSettings } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {

  companyName: 'Công ty Cổ phần Thiết Bị Y Tế ADC',
  supportHours: 'Hỗ trợ kỹ thuật trực tuyến 24/7 & Điều phối khẩn cấp',
  dutyEngineerName: 'Nguyễn Quang Đạt',
  dutyEngineerPhone: '0968 220 800',
  announcement: 'Kỹ sư ADC trực 24/7, đồng hành giải đáp mọi thắc mắc cùng bạn',
  chatbotWelcomeMessage: 'Xin chào Quý khách! Tôi là Trợ Lý Kỹ Thuật AI ADC 24/7.\nRất hân hạnh được hỗ trợ Quý Bệnh viện & Phòng Khám.',
  chatbotConfidenceThreshold: 85,
  chatbotAutoEscalateOnUnknown: true,
  chatbotEmergencyAlertsEnabled: true,
  maxUnresolvedAttemptsBeforeEscalate: 2,
  callbackCommitmentMinutes: 15
};

export const INITIAL_ENGINEERS: EngineerProfile[] = [
  {
    id: 'ENG-DIR-001',
    name: 'Lê Thanh Tùng',
    role: 'director',
    department: 'Ban Giám Đốc',
    phone: '0868 595 700',
    email: 'tung@adctbyt.vn',
    username: 'tung',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Ban Giám Đốc ADC (Toàn quốc)',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'create_ticket',
      'bulletins',
      'dispatch',
      'sop_mgmt',
      'records',
      'staff',
      'analytics',
      'chatbot_analytics',
      'learning',
      'settings',
      'excel'
    ]
  },
  {
    id: 'ENG-SALES-001',
    name: 'Phạm Đức Trung',
    role: 'sales',
    department: 'Phòng Kinh Doanh',
    phone: '0984 873 237',
    email: 'trung@adctbyt.vn',
    username: 'trung',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Khối Kinh Doanh & Bán Hàng Thiết Bị',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  },
  {
    id: 'ENG-SALES-002',
    name: 'Nguyễn Đình Chiểu',
    role: 'sales',
    department: 'Phòng Kinh Doanh',
    phone: '0984 873 237',
    email: 'chieu@adctbyt.vn',
    username: 'chieu',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Khối Kinh Doanh & Bán Hàng Thiết Bị',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  },
  {
    id: 'ENG-SALES-003',
    name: 'Nguyễn Trọng Mai',
    role: 'sales',
    department: 'Phòng Kinh Doanh',
    phone: '0984 873 237',
    email: 'mai@adctbyt.vn',
    username: 'mai',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Khối Kinh Doanh & Bán Hàng Thiết Bị',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  },
  {
    id: 'ENG-SALES-004',
    name: 'Vũ Tất Đạt',
    role: 'sales',
    department: 'Phòng Kinh Doanh',
    phone: '0984 873 237',
    email: 'dat.vt@adctbyt.vn',
    username: 'dat.vt',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Khối Kinh Doanh & Bán Hàng Thiết Bị',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  },
  {
    id: 'ENG-CSS-001',
    name: 'Kim Anh',
    role: 'css',
    department: 'Phòng CSS',
    phone: '0868 595 709',
    email: 'kimanh@adctbyt.vn',
    username: 'kimanh',
    password: '286286',
    status: 'available',
    activeTicketsCount: 1,
    area: 'Trung Tâm Dịch Vụ Khách Hàng (CSS)',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'create_ticket',
      'bulletins',
      'dispatch',
      'records',
      'sop_mgmt',
      'staff',
      'analytics'
    ]
  },
  {
    id: 'ENG-WH-001',
    name: 'Vũ Văn Hoan',
    role: 'warehouse',
    department: 'Bộ Phận Kho',
    phone: '0868 595 725',
    email: 'hoan@adctbyt.vn',
    username: 'hoan',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Kho Tổng Thiết Bị & Linh Kiện ADC',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'records',
      'sop_mgmt',
      'bulletins',
      'excel'
    ]
  },
  {
    id: 'ENG-002',
    name: 'Nguyễn Quang Đạt',
    role: 'field_engineer',
    department: 'Phòng Kỹ Thuật',
    phone: '0968 220 800',
    email: 'dat.nq@adctbyt.vn',
    username: 'dat.nq',
    password: '286286',
    status: 'on_site',
    activeTicketsCount: 2,
    area: 'Hà Nội & Khu vực phía Bắc',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'create_ticket',
      'bulletins',
      'dispatch',
      'sop_mgmt',
      'records',
      'learning'
    ]
  },
  {
    id: 'ENG-SALES-006',
    name: 'Vũ Thị Mai Lan',
    role: 'sales',
    department: 'Phòng CSS',
    phone: '0966 888 999',
    email: 'lan@adctbyt.vn',
    username: 'trang.lt',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Phòng CSS & Tiếp Nhận',
    specialties: ['Zybio EXC200/220', 'Zybio Z3 CRP', 'Zybio Z50', 'FS-205'],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  },
  {
    id: 'ENG-SALES-005',
    name: 'Trương Thị Hồng Tuyết',
    role: 'sales',
    department: 'Phòng CSS',
    phone: '0966 888 999',
    email: 'tuyet@adctbyt.vn',
    username: 'trang.lt',
    password: '286286',
    status: 'available',
    activeTicketsCount: 0,
    area: 'Phòng CSS & Tiếp Nhận',
    specialties: [],
    allowedTabs: [
      'dispatch',
      'create_ticket',
      'bulletins'
    ]
  }
];

export const INITIAL_SOPS: SOPArticle[] = [
  // --- Zybio EXC200/220 (Sinh hóa) ---
  {
    id: 'SOP-EXC-001',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    errorCode: 'E101',
    title: 'Kim hút mẫu/hóa chất bị nghẽn hoặc va chạm cơ cấu',
    symptom: 'Máy báo lỗi E101 (Sample/Reagent Probe Error), kim không hút được chất lỏng hoặc dừng đột ngột kèm tiếng kêu cơ khí.',
    rootCause: '1. Cặn fibrin hoặc hạt mẫu đông gây bít lỗ kim; 2. Cảm biến va chạm kim (Collision Sensor) bị kẹt; 3. Lệch vị trí gốc (Origin Sensor) trục Z.',
    resolutionSteps: [
      'Bước 1: Tạm dừng xét nghiệm trên phần mềm, bấm nút Emergency Stop nếu kim đang kẹt đĩa mẫu.',
      'Bước 2: Mở nắp bảo vệ, kiểm tra trực quan đầu kim xem có cong vênh hay cọ xát thành ống nghiệm không.',
      'Bước 3: Dùng dây kim thông nòng inox 0.15mm nhẹ nhàng thông ngược từ đầu kim lên theo hướng dẫn bảo trì định kỳ.',
      'Bước 4: Sử dụng dung dịch tẩy rửa chuyên dụng (Concentrated Wash Solution) hút ngâm 15 phút.',
      'Bước 5: Vào phần mềm máy: Maintenance -> Probe Maintenance -> Thực hiện lệnh Rinse Probe và kiểm tra tia nước phun thẳng đều, không bắn tóe.',
      'Bước 6: Khởi động lại mô-đun và chạy thử nghiệm trắng (Blank Test).'
    ],
    safetyWarnings: [
      'Bắt buộc đeo găng tay y tế và kính bảo hộ chống lây nhiễm chéo mẫu bệnh phẩm sinh học.',
      'Không dùng kìm hoặc lực tay uốn thẳng kim hút nếu phát hiện biến dạng mạnh; hãy bấm Yêu cầu hỗ trợ trực tiếp để thay kim chuẩn.'
    ],
    componentLocation: 'Cụm cánh tay kim hút mẫu/thuốc thử (Bên trái đĩa phản ứng)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-005)',
    isCommon: true,
    updatedAt: '2026-03-15'
  },
  {
    id: 'SOP-EXC-002',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Điện tử & Nhiệt độ',
    errorCode: 'E104',
    title: 'Nhiệt độ buồng ủ đĩa phản ứng không đạt chuẩn 37°C',
    symptom: 'Nhiệt độ hiển thị nhấp nháy màu đỏ dưới 36.5°C hoặc vượt 37.5°C; máy từ chối nhận lệnh phân tích mẫu.',
    rootCause: '1. Môi trường phòng lab quá lạnh (<20°C) hoặc có gió điều hòa thổi trực diện vào máy; 2. Tấm ủ nhiệt điện trở (Incubation Heating Plate) suy giảm; 3. Quạt đối lưu gió buồng ủ bị bám bụi kẹt trục.',
    resolutionSteps: [
      'Bước 1: Kiểm tra nhiệt độ phòng xét nghiệm (đảm bảo nhiệt độ phòng đạt 22°C - 26°C), hướng cánh gió điều hòa không thổi trực tiếp vào thân máy.',
      'Bước 2: Đóng kín nắp buồng đĩa phản ứng, chờ từ 15 đến 20 phút để hệ thống sấy cân bằng nhiệt tĩnh.',
      'Bước 3: Mở phần mềm: System Status -> Temperature Monitor, quan sát đường cong nhiệt độ thực tế.',
      'Bước 4: Kiểm tra khe tản nhiệt phía sau thân máy, dùng chổi mềm vệ sinh bụi bẩn tích tụ.',
      'Bước 5: Nếu sau 30 phút nhiệt độ vẫn sai lệch quá ±0.5°C, liên hệ kỹ sư ADC kiểm tra cảm biến nhiệt NTC hoặc rơ-le nhiệt.'
    ],
    safetyWarnings: [
      'Không tháo tấm ốp sau máy khi chưa ngắt công tắc nguồn điện chính 220V.',
      'Tránh làm đổ hóa chất hoặc nước rửa vào đĩa buồng ủ gây chập linh kiện sấy khô.'
    ],
    componentLocation: 'Vành đĩa buồng ủ phản ứng (Reaction Carousel Incubation Well)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-007)',
    isCommon: false,
    updatedAt: '2026-02-28'
  },
  {
    id: 'SOP-EXC-003',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    errorCode: 'E205',
    title: 'Lỗi trạm rửa Cuvette tự động & Tràn nước thải',
    symptom: 'Nước rửa dâng cao ở cốc phản ứng, cảnh báo Cuvette Wash Station Drain Error hoặc bọt nước tràn ra bề mặt đĩa.',
    rootCause: '1. Ống hút xả nước thải chân không bị nghẹt tinh thể muối; 2. Bơm xả thải (Waste Drainage Pump) áp suất yếu; 3. Bình chứa nước thải đầy hoặc cảm biến phao ngắt mạch.',
    resolutionSteps: [
      'Bước 1: Kiểm tra ngay bình chứa nước thải sinh học (Waste Tank), nếu phao báo đầy thì xả bình và kiểm tra van thông hơi.',
      'Bước 2: Tháo trạm kim rửa cuvette (Wash Probes), kiểm tra các đầu kim hút xả 8 giai đoạn xem có sợi rác hay tủa protein không.',
      'Bước 3: Dùng xilanh bơm 20ml nước cất ấm (khoảng 45°C) xả ngược đường ống dẫn thải chân không để làm tan muối kết tủa.',
      'Bước 4: Thực hiện Cuvette Blank Check trên phần mềm để kiểm tra giá trị quang học của các cốc rửa sau xử lý.'
    ],
    safetyWarnings: [
      'Nước thải buồng phản ứng chứa hóa chất và mẫu bệnh nhân, bắt buộc thu gom theo quy định xử lý chất thải y tế nguy hại.'
    ],
    componentLocation: 'Cụm trạm rửa cuvette tự động 8 bước (Góc trên bên phải đĩa phản ứng)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-001)',
    isCommon: true,
    updatedAt: '2026-01-20'
  },
  {
    id: 'SOP-EXC-004',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Quang học & Cảm biến',
    errorCode: 'E310',
    title: 'Lỗi hệ thống đo quang học / Điện áp đèn Halogen',
    symptom: 'Giá trị trắng cuvette dao động mạnh, kết quả đo OD sai lệch hoặc báo lỗi "Lamp Energy Low" tại bước sóng 340nm.',
    rootCause: '1. Đèn Halogen-Tungsten hết tuổi thọ (>2000 giờ); 2. Kính lọc quang học bị bụi mờ hoặc ố hơi ẩm; 3. Nguồn cấp điện áp đèn photometer không ổn định.',
    resolutionSteps: [
      'Bước 1: Xem số giờ hoạt động của bóng đèn trong menu Maintenance -> Optical System.',
      'Bước 2: Nếu bóng đèn đã dùng trên 2000 giờ, cần tiến hành thay bóng đèn mới (loại 12V/20W chính hãng Zybio).',
      'Bước 3: Kiểm tra nguồn điện lưới qua UPS ổn áp, đảm bảo điện áp 220V ổn định không sụt áp.',
      'Bước 4: Chạy kiểm tra quang học toàn bộ dải bước sóng (Optical Full Gain Calibration).'
    ],
    safetyWarnings: [
      'Bóng đèn Halogen khi hoạt động tỏa nhiệt rất cao, phải chờ tối thiểu 15 phút sau khi tắt máy mới được chạm tay thay thế.',
      'Không dùng tay trần chạm vào bầu thủy tinh bóng đèn mới (dầu trên ngón tay làm cháy ố bóng đèn).'
    ],
    componentLocation: 'Hộp quang kế mặt trước bên trong (Photometer Enclosure)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-010)',
    isCommon: false,
    updatedAt: '2026-03-02'
  },

  // --- Zybio Z3 CRP (Huyết học 3TP + CRP) ---
  {
    id: 'SOP-Z3-001',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Hóa chất & Buồng đếm',
    errorCode: 'H101',
    title: 'Tắc buồng đếm trở kháng WBC / RBC (Aperture Clog)',
    symptom: 'Biểu đồ phân bố tế bào máu bị méo mó, thời gian đếm vượt chuẩn, màn hình hiện cảnh báo "WBC Clog" hoặc "RBC Clog".',
    rootCause: '1. Mẫu máu có cục đông nhỏ (Micro-clot); 2. Lỗ đếm vi mô sapphire bị bám màng protein lâu ngày không ngâm rửa Protease.',
    resolutionSteps: [
      'Bước 1: Nhấn nút Zap / Flush Aperture trên màn hình cảm ứng để phóng tia điện cao áp và dòng áp suất đánh tan dị vật.',
      'Bước 2: Nếu sau 2 lần Flush không hết, vào Menu -> Maintenance -> Thực hiện quy trình "Zap & Clean".',
      'Bước 3: Sử dụng 2ml dung dịch chống đông/tẩy protein Zybio E-Z Cleanser bơm vào buồng đếm hoặc thực hiện chu trình Soak 15 phút.',
      'Bước 4: Sau khi ngâm, chạy chu trình rửa nền Background Run để kiểm tra (Yêu cầu WBC < 0.2, RBC < 0.02, HGB < 1, PLT < 10).'
    ],
    safetyWarnings: [
      'Tuyệt đối không dùng kim sắt hoặc vật nhọn chọc vào lỗ đếm vi mô sapphire tránh làm vỡ gãy buồng đếm đắt tiền.'
    ],
    componentLocation: 'Khối buồng đếm trở kháng WBC/RBC (Phía sau cửa bảo vệ bên trái)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-002)',
    isCommon: true,
    updatedAt: '2026-03-10'
  },
  {
    id: 'SOP-Z3-002',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Hóa chất & Buồng đếm',
    errorCode: 'H202',
    title: 'Hóa chất Lyse cạn hoặc bọt khí đường ống dẫn',
    symptom: 'Chỉ số HGB hoặc WBC nhảy bất thường, máy cảnh báo "Lyse Empty" hoặc "Lyse Reagent Bubble".',
    rootCause: '1. Can hóa chất Lyse đã hết hoặc cắm ống hút không chạm đáy can; 2. Đường ống dẫn hóa chất bị hở rò khí hoặc kẹt van điện từ Valve 3.',
    resolutionSteps: [
      'Bước 1: Kiểm tra lượng hóa chất trong can Lyse Z3, thay can mới nếu mức hóa chất dưới vạch tối thiểu.',
      'Bước 2: Kiểm tra gioăng cao su nắp can và khớp nối nhanh màu đỏ xem có bị lỏng gây lọt khí không.',
      'Bước 3: Vào Menu -> Maintenance -> Reagent Prime -> Chọn "Prime Lyse" từ 2-3 lần để đẩy sạch bọt khí ra khỏi buồng đo.',
      'Bước 4: Chạy mẫu chuẩn trắng (Blank Test) xác nhận chỉ số HGB và WBC ổn định.'
    ],
    safetyWarnings: [
      'Hóa chất Lyse có tính phá vỡ màng tế bào, tránh để bắn vào mắt hoặc dính vào da hở.'
    ],
    componentLocation: 'Khoang hóa chất bên sườn và van phân phối chất lỏng',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-Z3)',
    isCommon: true,
    updatedAt: '2026-02-14'
  },
  {
    id: 'SOP-Z3-003',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Quang học & Cảm biến',
    errorCode: 'H305',
    title: 'Lỗi đo quang học CRP / Trôi điểm chuẩn Zero',
    symptom: 'Kết quả định lượng CRP không hiển thị số (báo ***) hoặc kết quả CRP âm tính bất thường.',
    rootCause: '1. Cuvette đo quang CRP bám cặn hạt latex phản ứng; 2. Đèn LED phát quang CRP bị suy giảm hoặc kính phản xạ bị mờ; 3. Hóa chất CRP R1/R2 hết hạn hoặc bảo quản sai nhiệt độ (quá 8°C).',
    resolutionSteps: [
      'Bước 1: Kiểm tra hạn dùng và trạng thái bảo quản của kit hóa chất CRP (bảo quản 2-8°C, không để đóng băng).',
      'Bước 2: Vào Menu Maintenance -> CRP Module -> Thực hiện "Clean CRP Optical Flow Cell" bằng dung dịch tẩy rửa chuyên dụng.',
      'Bước 3: Thực hiện Zero Calibration quang học cho kênh CRP.',
      'Bước 4: Chạy mẫu nội kiểm (QC CRP) mức Low và High để đối chiếu đồ thị Levey-Jennings.'
    ],
    safetyWarnings: [
      'Tránh ánh sáng mặt trời chiếu trực tiếp vào cảm biến đo quang buồng CRP.'
    ],
    componentLocation: 'Mô-đun đo quang miễn dịch CRP tích hợp (Phía trên buồng đếm huyết học)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-006)',
    isCommon: false,
    updatedAt: '2026-01-25'
  },
  {
    id: 'SOP-Z3-004',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Cơ khí & Kim hút',
    errorCode: 'H408',
    title: 'Phát hiện cục máu đông (Fibrin Clot) trong kim hút mẫu',
    symptom: 'Hút mẫu không đủ thể tích, máy báo lỗi "Aspiration Clot Detected", kim dừng không xả mẫu vào buồng pha loãng.',
    rootCause: 'Ống mẫu máu chống đông EDTA chưa đảo đều hoặc có sợi huyết fibrin chui vào lòng kim hút mẫu.',
    resolutionSteps: [
      'Bước 1: Không cố gắng chạy tiếp mẫu. Nhấn nút "Unclot Probe" trên màn hình điều khiển.',
      'Bước 2: Mở cửa máy, dùng giấy thấm cồn lau sạch đầu ngoài kim hút.',
      'Bước 3: Dùng bơm xilanh tiệt trùng gắn ống mềm bơm dung dịch Cleanser áp lực ngược từ đầu vòi xả.',
      'Bước 4: Thực hiện Prime Diluent 2 chu kỳ để rửa sạch hoàn toàn hệ thống đường ống hút.'
    ],
    safetyWarnings: [
      'Thao tác nhẹ tay tránh làm cong đầu kim hút mẫu sắc nhọn.'
    ],
    componentLocation: 'Cần kim hút mẫu tự động mặt trước',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-CLOT)',
    isCommon: true,
    updatedAt: '2026-03-05'
  },

  // --- Zybio Z50 (Huyết học 5 thành phần Laser) ---
  {
    id: 'SOP-Z50-001',
    equipmentModel: 'Zybio Z50',
    category: 'Quang học & Cảm biến',
    errorCode: 'Z501',
    title: 'Suy giảm nguồn buồng phát xạ Laser phân tích 5 thành phần',
    symptom: 'Biểu đồ Scattergram (tán xạ 3D) phân tán bạch cầu bị nhòe, không tách được cụm Mono / Eos / Baso, cảnh báo Optical Flow Cell Warning.',
    rootCause: '1. Buồng đếm dòng tế bào (Sheath Flow Cell) bị bám cặn quang học; 2. Đi-ốt bán dẫn Laser phát quang bị lệch góc hội tụ hoặc suy giảm công suất; 3. Bọt khí vi mô tồn đọng trong dòng dịch bao bọc.',
    resolutionSteps: [
      'Bước 1: Vào Advanced Maintenance -> Thực hiện chu trình "Flow Cell Deep De-bubble" để xả bọt khí.',
      'Bước 2: Nạp dung dịch rửa Proteinase chuyên dụng vào cổng hút khẩn, thực hiện chu trình "Optical Cell Soak" 20 phút.',
      'Bước 3: Sau chu trình ngâm, chạy liên tiếp 3 lần Background Run với dung dịch Sheath Fluid.',
      'Bước 4: Kiểm tra thông số Gain và Laser Power trên bảng chẩn đoán kỹ thuật. Nếu Laser Power < 75%, liên hệ kỹ sư ADC hiệu chuẩn quang học.'
    ],
    safetyWarnings: [
      'Bức xạ Laser Class 3B vô hình nguy hiểm: Không được mở buồng quang học khi máy đang bật nguồn điện.'
    ],
    componentLocation: 'Buồng hội tụ quang học Laser kín (Shielded Laser Optics Chamber)',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-003)',
    isCommon: false,
    updatedAt: '2026-02-18'
  },
  {
    id: 'SOP-Z50-002',
    equipmentModel: 'Zybio Z50',
    category: 'Cơ khí & Kim hút',
    errorCode: 'Z508',
    title: 'Bơm hút chân không chính quá tải hoặc rò rỉ áp suất',
    symptom: 'Máy phát ra tiếng rít từ bơm chân không, báo lỗi "Vacuum Pressure Low (-40kPa)", không thể hút dịch và xả thải.',
    rootCause: '1. Ống khí nén chân không bị gập hoặc nứt lão hóa; 2. Màng bơm chân không (Diaphragm Pump) bị rách hoặc van 1 chiều kẹt muối; 3. Bình đệm bẫy nước (Trap Chamber) bị đầy nước tràn vào van áp.',
    resolutionSteps: [
      'Bước 1: Kiểm tra bình bẫy nước phía sau máy (Trap Bottle), xả sạch nước nếu có chất lỏng đọng.',
      'Bước 2: Kiểm tra các đường ống silicone dẫn áp suất chân không xem có bị gập góc phía sau máy không.',
      'Bước 3: Vào Service Menu -> Pressure Test để kiểm tra độ kín buồng chân không trong 60 giây.',
      'Bước 4: Nếu áp suất không duy trì được trên -38kPa, yêu cầu kỹ sư hiện trường kiểm tra thay màng bơm hoặc van điện từ.'
    ],
    safetyWarnings: [
      'Tắt nguồn máy trước khi kiểm tra cơ cấu bơm động cơ điện áp cao.'
    ],
    componentLocation: 'Khối bơm khí nén chân không đáy máy bên phải',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-008)',
    isCommon: true,
    updatedAt: '2026-01-30'
  },

  // --- FS-205 (Miễn dịch huỳnh quang) ---
  {
    id: 'SOP-FS-001',
    equipmentModel: 'FS-205',
    category: 'Cơ khí & Kim hút',
    errorCode: 'FS101',
    title: 'Kẹt khay nạp thẻ thử Cassette (Cassette Tray Jam)',
    symptom: 'Khay nạp thẻ không đẩy ra hoặc thụt vào bị giật, phát ra tiếng tạch tạch của động cơ bước kèm mã lỗi FS101.',
    rootCause: '1. Thẻ cassette đặt sai chiều hoặc bị vênh gờ nhựa cọ vào ray dẫn; 2. Bụi bẩn bám dính trên ray trượt khay thử; 3. Dây curoa truyền động động cơ bước bị chùng hoặc trượt răng.',
    resolutionSteps: [
      'Bước 1: Tắt nguồn máy bằng công tắc phía sau, đợi 10 giây.',
      'Bước 2: Dùng tay nhẹ nhàng kiểm tra cửa nạp khay thử, nếu thẻ thử bị kẹt một nửa thì rút nhẹ thẻ thẳng ra ngoài.',
      'Bước 3: Dùng tăm bông tẩm cồn y tế 70 độ vệ sinh nhẹ rãnh trượt dẫn hướng của khay cassette.',
      'Bước 4: Bật lại máy để cơ cấu khay tự động thực hiện hành trình hồi gốc (Home Calibration).',
      'Bước 5: Thử nạp một thẻ thử mới theo đúng hướng mũi tên in trên vỏ nhựa.'
    ],
    safetyWarnings: [
      'Không dùng lực kéo giật quá mạnh làm gãy chốt truyền động của động cơ khay thử.'
    ],
    componentLocation: 'Cửa trượt nạp thẻ thử mặt trước máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-004)',
    isCommon: true,
    updatedAt: '2026-03-01'
  },

  // --- CÁC QUY TRÌNH KỸ THUẬT BỔ SUNG TỪ SỔ TAY THỰC CHIẾN 2026-XLKT (KS. NGUYỄN QUANG ĐẠT) ---
  {
    id: 'SOP-Z3-005',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Hóa chất & Buồng đếm',
    errorCode: 'H108',
    title: 'Nghẽn đường hút hóa chất Diluent & Lyse do kẹt/bẹp van pinch (2026-XLKT-011)',
    symptom: 'Máy báo lỗi H108 không thể hút dung dịch pha loãng Diluent hoặc dung dịch phá hồng cầu Lyse, thể tích buồng pha loãng không đạt chuẩn.',
    rootCause: 'Đoạn ống silicone mềm đi qua cụm van kẹp (Pinch Valve) bị xẹp dính, mất tính đàn hồi sau thời gian dài bị kẹp hoặc có tinh thể muối kết tủa làm tắc đường ống.',
    resolutionSteps: [
      'Bước 1: Tắt nguồn máy, mở nắp khoang hóa chất bên sườn máy để tiếp cận cụm van kẹp Pinch Valve.',
      'Bước 2: Dùng tay bóp nhẹ các đoạn ống cao su silicone đi qua khe van kẹp để kiểm tra độ đàn hồi, giải phóng hiện tượng dính ống.',
      'Bước 3: Dùng xilanh 20ml chứa nước cất ấm (khoảng 45°C) bơm súc rửa đường ống để hòa tan tinh thể muối kết tinh.',
      'Bước 4: Nếu ống bị lão hóa, bẹp vĩnh viễn: thay đoạn ống kẹp cao su silicone y tế Z3 chính hãng mới.',
      'Bước 5: Bật máy, vào Menu -> Maintenance -> Reagent Prime -> Chạy liên tiếp 3 chu trình Prime Diluent và Prime Lyse để đuổi sạch bọt khí.',
      'Bước 6: Chạy kiểm tra nền Background Run đạt chuẩn (WBC < 0.2, RBC < 0.02, HGB < 1, PLT < 10).'
    ],
    safetyWarnings: [
      'Hóa chất Lyse có tính ăn mòn da và màng nhầy, bắt buộc mang găng tay và kính bảo hộ khi thao tác đường ống.'
    ],
    componentLocation: 'Cụm van pinch kẹp ống hóa chất khoang chất lỏng bên sườn máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-011)',
    isCommon: true,
    updatedAt: '2026-04-05'
  },
  {
    id: 'SOP-Z50-003',
    equipmentModel: 'Zybio Z50',
    category: 'Cơ khí & Kim hút',
    errorCode: '',
    title: 'Kẹt trục dẫn động kim hút mẫu trục Z khi đâm xuyên nắp ống máu (2026-XLKT-012)',
    symptom: 'Kim hút mẫu phát ra tiếng kêu cơ khí tạch tạch trượt bánh răng, dừng đột ngột khi đi xuống đâm nắp cao su ống máu nghiệm thu.',
    rootCause: 'Ray trượt bi tuyến tính trục Z bị bám bụi bẩn và khô mỡ bôi trơn sau thời gian dài vận hành; dây đai đồng bộ timing belt trục Z bị chùng.',
    resolutionSteps: [
      'Bước 1: Nhấn Emergency Stop, tắt công tắc nguồn phía sau máy và ngắt dây nguồn 220V.',
      'Bước 2: Tháo ốp vỏ mặt trước bảo vệ cụm cánh tay kim hút mẫu.',
      'Bước 3: Dùng khăn vải không dệt tẩm cồn y tế lau sạch toàn bộ cặn bụi, gỉ sét và dầu mỡ cũ trên ray trượt bi dẫn hướng trục Z.',
      'Bước 4: Thoa một lớp mỏng mỡ bôi trơn chuyên dụng Teflon y sinh chịu tải cao lên rãnh trượt bi.',
      'Bước 5: Kiểm tra và tăng lực căng đai đồng bộ timing belt trục Z (độ võng đai chuẩn 2-3mm khi ấn lực 5N).',
      'Bước 6: Bật máy, vào Service Tool chạy lệnh Z-Axis Move Test 30 lần đâm xuyên nắp cao su kiểm tra chuyển động êm ái.'
    ],
    safetyWarnings: [
      'Ngắt nguồn điện trước khi thao tác cơ khí; cẩn thận đầu kim hút mẫu sắc nhọn chống tổn thương đâm xuyên.'
    ],
    componentLocation: 'Cụm ray trượt bi dẫn hướng trục Z cánh tay kim hút mẫu mặt trước máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-012)',
    isCommon: true,
    updatedAt: '2026-04-08'
  },
  {
    id: 'SOP-FS-003',
    equipmentModel: 'FS-205',
    category: 'Điện tử & Nhiệt độ',
    errorCode: '',
    title: 'Trôi điểm chạm màn hình cảm ứng & cân chuẩn Touch Calibration 5 điểm (2026-XLKT-013)',
    symptom: 'Màn hình cảm ứng bị lệch vị trí bấm, nhấn phím này lại nhảy sang phím bên cạnh hoặc liệt cảm ứng từng vùng mép.',
    rootCause: 'Dung dịch sát khuẩn cồn hoặc dịch xét nghiệm dính vào mép viền màn hình điện dung gây nhiễu điện tích bề mặt; trôi dạt tham số tọa độ calibration.',
    resolutionSteps: [
      'Bước 1: Tắt nguồn máy, dùng khăn vi sợi ẩm tẩm dung dịch vệ sinh màn hình chuyên dụng lau sạch mép viền và bề mặt kính cảm ứng.',
      'Bước 2: Dùng quạt sấy mát làm khô hoàn toàn khe hở giữa khung nhựa vỏ máy và màn hình cảm ứng.',
      'Bước 3: Kiểm tra và thay thế tấm đệm gioăng cách điện quanh khung viền màn hình nếu phát hiện bị ngấm dịch ẩm.',
      'Bước 4: Bật máy, giữ ngón tay trên màn hình trong 5 giây khi khởi động hoặc vào Menu -> System Setting -> Touch Calibration.',
      'Bước 5: Dùng bút cảm ứng hoặc đầu ngón tay chạm chính xác vào tâm 5 điểm dấu chữ thập (+) xuất hiện lần lượt tại 4 góc và chính giữa màn hình.',
      'Bước 6: Nhấn OK lưu cấu hình và thử nghiệm bấm các menu chức năng kiểm tra độ nhạy chính xác 100%.'
    ],
    safetyWarnings: [
      'Không xịt trực tiếp cồn hoặc dung dịch lỏng lên mặt màn hình tránh nước chảy lọt vào bo mạch hiển thị bên trong.'
    ],
    componentLocation: 'Khung màn hình cảm ứng màu LCD mặt trước máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-013)',
    isCommon: true,
    updatedAt: '2026-04-12'
  },
  {
    id: 'SOP-EXC-005',
    equipmentModel: 'Zybio EXC200/220',
    category: 'Cơ khí & Kim hút',
    errorCode: '',
    title: 'Rò rỉ bơm vi lượng Syringe Hamilton 100µL & sai lệch thể tích hút mẫu (2026-XLKT-014)',
    symptom: 'Có giọt nước rỉ ra ở đầu nối piston xilanh bơm mẫu, kết quả xét nghiệm sinh hóa bị giảm giả tạo do thiếu thể tích hút mẫu.',
    rootCause: 'Gioăng Teflon đầu pít-tông bơm vi lượng Hamilton 100µL bị mòn xước sau > 50.000 chu trình hút nhả mẫu; van 3 ngả của cụm syringe bị hở.',
    resolutionSteps: [
      'Bước 1: Vào Maintenance -> Service Position để đưa piston syringe về điểm chết dưới, tắt nguồn máy.',
      'Bước 2: Tháo ốc cố định pít-tông và tháo rời xilanh thủy tinh Syringe Hamilton 100µL ra khỏi giá đỡ.',
      'Bước 3: Kiểm tra đầu gioăng làm kín pít-tông Teflon: nếu có vết xước dọc hoặc biến dạng mép, tiến hành thay đầu pít-tông Teflon mới.',
      'Bước 4: Vệ sinh lòng ống thủy tinh bằng cồn y tế và tráng nước cất deion, tra một giọt nước cất bôi trơn trước khi luồn pít-tông vào nòng.',
      'Bước 5: Lắp lại syringe vào máy, siết chặt vừa tay ốc cố định, kiểm tra độ kín bằng áp lực nước 5 bar không rò rỉ giọt nước.',
      'Bước 6: Chạy chu trình Flush Syringe 5 lần để xả sạch bọt khí, dùng cân phân tích 4 số lẻ kiểm chuẩn độ lặp lại pipet đạt CV < 0.8% tại mức 3µL.'
    ],
    safetyWarnings: [
      'Xilanh làm bằng thủy tinh quang học chính xác cao, thao tác nhẹ tay tránh làm nứt vỡ thân xilanh.'
    ],
    componentLocation: 'Cụm bơm tiêm vi lượng Sample Syringe Hamilton khoang bơm phía trước bên trái',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-014)',
    isCommon: true,
    updatedAt: '2026-04-15'
  },
  {
    id: 'SOP-Z3-006',
    equipmentModel: 'Zybio Z3 CRP',
    category: 'Phần mềm & Kết nối',
    errorCode: '',
    title: 'Mất kết nối truyền dữ liệu hai chiều LIS/HIS qua giao thức ASTM/HL7 (2026-XLKT-015)',
    symptom: 'Máy không tự động gửi kết quả xét nghiệm sang phần mềm quản lý bệnh viện LIS, biểu tượng mạng báo chấm than hoặc Disconnected.',
    rootCause: 'Chân đồng hạt mạng RJ45 Cat6 bị oxy hóa gỉ sét do độ ẩm phòng xét nghiệm; xung đột địa chỉ IP tĩnh hoặc sai cổng Port giao thức ASTM/HL7.',
    resolutionSteps: [
      'Bước 1: Kiểm tra đèn LED chỉ báo trạng thái (Link/Act) ở cổng mạng LAN RJ45 phía sau thân máy (đèn xanh sáng tĩnh, đèn cam nhấp nháy dữ liệu).',
      'Bước 2: Dùng kìm bấm mạng cắt bỏ đầu cáp cũ, bấm lại hạt mạng RJ45 Cat6 chống nhiễu mạ vàng chuẩn T568B hoặc thay dây mạng đúc sẵn Cat6 3m.',
      'Bước 3: Vào Menu -> System Setup -> Network: kiểm tra địa chỉ IP tĩnh của máy (ví dụ: 192.168.1.150), Subnet Mask (255.255.255.0) và Gateway.',
      'Bước 4: Kiểm tra IP máy chủ Server LIS và cổng Port truyền thông (chuẩn ASTM thường dùng cổng 5100 hoặc HL7 cổng 6000).',
      'Bước 5: Nhấn nút "Ping Test" trên máy để kiểm tra thông tuyến tín hiệu tới server bệnh viện.',
      'Bước 6: Chạy thử một mẫu bệnh phẩm và kiểm tra kết quả đổ tự động về phần mềm LIS bệnh viện trong vòng 3 giây.'
    ],
    safetyWarnings: [
      'Tắt máy hoặc rút cáp mạng trước khi đo thông mạch bằng máy test mạng chuyên dụng.'
    ],
    componentLocation: 'Cổng mạng LAN RJ45 và bo mạch giao tiếp truyền thông mặt sau máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-015)',
    isCommon: true,
    updatedAt: '2026-04-18'
  },
  {
    id: 'SOP-Z50-004',
    equipmentModel: 'Zybio Z50',
    category: 'Điện tử & Nhiệt độ',
    errorCode: '',
    title: 'Dao động nhiệt độ buồng ủ phản ứng Lyse & thay cảm biến nhiệt NTC 10k (2026-XLKT-016)',
    symptom: 'Nhiệt độ buồng ủ lyse quang học nhấp nháy báo động dao động ngoài khoảng 35°C - 39°C, máy dừng không cho chạy mẻ xét nghiệm 5 thành phần.',
    rootCause: 'Cảm biến nhiệt điện trở NTC 10k buồng ủ bị chập ngắt quãng khi nhiệt độ tăng cao, giá trị điện trở bị trôi dạt làm vi điều khiển đọc sai nhiệt độ.',
    resolutionSteps: [
      'Bước 1: Tắt công tắc nguồn chính, rút phích cắm điện 220V và chờ buồng ủ nguội về nhiệt độ phòng trong 15 phút.',
      'Bước 2: Tháo tấm ốp bảo vệ khoang buồng phản ứng quang học lyse bên trong thân máy.',
      'Bước 3: Dùng đồng hồ vạn năng kỹ thuật số VOM thang đo trở kháng 20kΩ đo chân cảm biến NTC ở 25°C: nếu sai lệch xa giá trị chuẩn 10.0kΩ (±1%) hoặc đứt ngắt quãng khi lắc dây thì kết luận hỏng cảm biến.',
      'Bước 4: Tháo vít hãm đầu đo cảm biến, vệ sinh sạch keo tản nhiệt cũ, thoa một lớp keo tản nhiệt công nghiệp silicon mới.',
      'Bước 5: Lắp cảm biến nhiệt NTC 10k chính hãng Zybio mới (Part: Z50-NTC-02), siết chặt vít định vị và cắm chắc chắn giắc nối lên mainboard.',
      'Bước 6: Bật nguồn máy, dùng nhiệt kế chuẩn Fluke đo đối chiếu nhiệt độ thực tế buồng ủ đạt chuẩn 37.0°C ± 0.2°C ổn định.'
    ],
    safetyWarnings: [
      'Ngắt hoàn toàn nguồn điện 220V trước khi đo kiểm trở kháng trên bo mạch điều khiển sấy nhiệt.'
    ],
    componentLocation: 'Khoang buồng ủ phản ứng quang học lyse mặt bên phải thân máy',
    sourceFile: 'NEW-Nguyễn Quang Đạt.html (Sổ tay 2026-XLKT-016)',
    isCommon: true,
    updatedAt: '2026-04-22'
  }
];

export const INITIAL_MAINTENANCE_RECORDS: MaintenanceRecord[] = [
  {
    id: 'MREC-001',
    code: '2026-XLKT-001',
    date: '2026-03-12',
    hospital: 'Bệnh viện Đa khoa Nông Nghiệp',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC220-VN-2024-089',
    faultFound: 'Lỗi trạm rửa cuvette E205, tràn nước thải buồng phản ứng do kết tủa muối photphat làm tắc ống silicone hút xả.',
    solutionProvided: 'Thông tắc toàn bộ 8 kim hút trạm rửa bằng dây thông nòng 0.15mm, ngâm dung dịch tẩy rửa ADC-Cleanser 30 phút, thay thế 2 đoạn ống dẫn thải chịu áp. Chạy kiểm tra Cuvette Blank đạt chuẩn OD < 0.05.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Ống dẫn silicone chịu áp Ø3x5 (2m), Van một chiều xả thải',
    status: 'Đã nghiệm thu',
    notes: 'KTV phòng xét nghiệm đã ký biên bản hài lòng, máy bàn giao vận hành ổn định.'
  },
  {
    id: 'MREC-002',
    code: '2026-XLKT-002',
    date: '2026-03-14',
    hospital: 'Phòng khám Đa khoa Quốc tế Thu Cúc',
    equipmentModel: 'Zybio Z3 CRP',
    serialNumber: 'Z3CRP-HN-2025-114',
    faultFound: 'Lỗi H101 nghẽn buồng đếm WBC do mẫu máu đọng clot. Kết quả WBC dao động mạnh không kiểm soát.',
    solutionProvided: 'Thực hiện zap xung điện cao áp, tháo cụm buồng đếm trở kháng sapphire vệ sinh ngâm Protease dung dịch Zybio Cleanser. Cân chuẩn lại điện áp ngưỡng buồng đếm.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Gioăng làm kín buồng đếm O-ring 12mm',
    status: 'Đã nghiệm thu',
    notes: 'Bàn giao lại máy lúc 11h30 trưa, hướng dẫn KTV cách đảo ống nghiệm chống đông chuẩn.'
  },
  {
    id: 'MREC-003',
    code: '2026-XLKT-003',
    date: '2026-03-16',
    hospital: 'Trung tâm Y tế Huyện Đông Anh',
    equipmentModel: 'Zybio Z50',
    serialNumber: 'Z50-2024-0042',
    faultFound: 'Biểu đồ tán xạ Laser 5 thành phần bị nhòe, cảnh báo bọt khí vi mô buồng đếm dòng tế bào Z501.',
    solutionProvided: 'Thực hiện chu trình Flow Cell Deep De-bubble, vệ sinh buồng quang học Laser kín, cân chỉnh góc phản xạ quang học và đo áp suất dịch bao bọc Sheath Fluid.',
    engineerName: 'Trần Minh Tuấn',
    replacedParts: 'Lọc tinh dịch bao bọc Sheath Filter 0.2µm',
    status: 'Đã nghiệm thu',
    notes: 'Chạy kiểm tra QC 3 mức L-N-H đạt chuẩn CV < 1.8%.'
  },
  {
    id: 'MREC-004',
    code: '2026-XLKT-004',
    date: '2026-03-18',
    hospital: 'Phòng khám Bác sĩ Gia đình Hà Nội',
    equipmentModel: 'FS-205',
    serialNumber: 'FS205-2025-021',
    faultFound: 'Kẹt khay nạp thẻ cassette FS101 do trượt răng dây curoa truyền động động cơ bước.',
    solutionProvided: 'Tháo vỏ mặt trước, vệ sinh ray dẫn hướng khay cassette, tăng độ căng dây curoa động cơ bước, bôi trơn dầu silicon chuyên dụng y tế.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Dây curoa đồng bộ mini GT2-120mm',
    status: 'Đã nghiệm thu',
    notes: 'Thử nghiệm nạp nhả 50 lần liên tục không xuất hiện lỗi.'
  },
  {
    id: 'MREC-005',
    code: '2026-XLKT-005',
    date: '2026-03-21',
    hospital: 'Bệnh viện Đa khoa Đức Giang',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC200-HN-2023-018',
    faultFound: 'Lỗi kim hút mẫu E101 va quẹt thành ống nghiệm khi xoay trục Z, cảm biến va chạm (Collision Sensor) nhảy liên tục.',
    solutionProvided: 'Căn chỉnh lại tọa độ gốc Home Position trục Z & R bằng phần mềm hiệu chuẩn Service Tool. Nắn vi chỉnh góc kim, siết chặt ốc định vị puly dẫn hướng cánh tay kim.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Cụm lò xo chống va đập kim hút (Collision Spring Assembly)',
    status: 'Đã nghiệm thu',
    notes: 'Chạy test 100 vị trí khay mẫu đạt độ đồng tâm sai số < 0.1mm.'
  },
  {
    id: 'MREC-006',
    code: '2026-XLKT-006',
    date: '2026-03-23',
    hospital: 'Bệnh viện Sản Nhi Bắc Ninh',
    equipmentModel: 'Zybio Z3 CRP',
    serialNumber: 'Z3CRP-BN-2024-055',
    faultFound: 'Kênh đo quang miễn dịch đục CRP báo mã H305, kết quả hiển thị dấu *** do bóng LED quang 630nm bị chập chờn.',
    solutionProvided: 'Kiểm tra bo mạch đo quang CRP, phát hiện lỏng cáp dẹt tín hiệu FPC từ buồng ủ CRP sang mainboard. Vệ sinh chân cáp mạ vàng, cắm cố định chốt ngàm, hiệu chuẩn lại giá trị trắng CRP Blank đạt chuẩn.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Cáp dẹt tín hiệu quang FPC 14-pin',
    status: 'Đã nghiệm thu',
    notes: 'Chạy đối chứng mẫu huyết thanh chuẩn CRP đạt độ lặp lại CV < 2.5%.'
  },
  {
    id: 'MREC-007',
    code: '2026-XLKT-007',
    date: '2026-03-25',
    hospital: 'Bệnh viện Đa khoa Phố Nối Hưng Yên',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC220-HY-2024-033',
    faultFound: 'Báo lỗi E104 nhiệt độ buồng ủ đĩa phản ứng không đạt 37°C, tụt xuống 35.8°C vào đầu ca làm việc buổi sáng.',
    solutionProvided: 'Kiểm tra tấm nhiệt điện trở sấy đáy buồng ủ và rơ-le nhiệt SSR. Thay thế rơ-le bán dẫn đóng ngắt nhiệt SSR 12VDC/220VAC bị chai tiếp điểm. Cân chỉnh lại nhiệt kế chuẩn Pt100.',
    engineerName: 'Hoàng Văn Nam',
    replacedParts: 'Rơ-le bán dẫn đóng nhiệt SSR-25DA, Keo tản nhiệt công nghiệp',
    status: 'Đã nghiệm thu',
    notes: 'Nhiệt độ ổn định tuyệt đối ở 37.0°C ± 0.1°C sau 15 phút khởi động.'
  },
  {
    id: 'MREC-008',
    code: '2026-XLKT-008',
    date: '2026-03-27',
    hospital: 'Phòng khám Đa khoa Medlatec Tây Hồ',
    equipmentModel: 'Zybio Z50',
    serialNumber: 'Z50-HN-2024-099',
    faultFound: 'Báo lỗi Z508 áp suất bơm chân không không đạt (-32kPa so với yêu cầu -42kPa), chu trình xả thải buồng đếm kéo dài.',
    solutionProvided: 'Kiểm tra bình bẫy bọt và màng bơm hút khí chân không. Phát hiện nứt ống silicone 4x6mm nối van chân không số 3. Thay đoạn ống và bảo dưỡng van điện từ xả thải Solenoid Valve.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Ống silicone chịu áp lực âm 4x6 (1.5m), Màng van khí 1 chiều',
    status: 'Đã nghiệm thu',
    notes: 'Áp suất duy trì ổn định -43.5kPa, tốc độ xả buồng đạt yêu cầu.'
  },
  {
    id: 'MREC-010',
    code: '2026-XLKT-010',
    date: '2026-04-02',
    hospital: 'Bệnh viện Đa khoa Tỉnh Hà Nam',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC200-HN-2023-045',
    faultFound: 'Lỗi đèn đo quang Halogen E310, năng lượng đèn bước sóng 340nm tụt xuống dưới 8000 counts, đo ALT/AST bị âm kết quả.',
    solutionProvided: 'Bóng đèn Halogen 12V/20W đã vận hành 2180 giờ (vượt tuổi thọ khuyến cáo 2000 giờ). Thay bóng Halogen chính hãng Zybio mới, làm sạch thấu kính tụ quang và chạy Full Gain Calibration.',
    engineerName: 'Trần Minh Tuấn',
    replacedParts: 'Bóng đèn Halogen 12V/20W Zybio chính hãng (Part: EXC-LMP-01)',
    status: 'Đã nghiệm thu',
    notes: 'Năng lượng quang các kênh 340 - 800nm đồng đều trên 38.000 counts, QC đạt chuẩn.'
  },
  {
    id: 'MREC-011',
    code: '2026-XLKT-011',
    date: '2026-04-05',
    hospital: 'Bệnh viện Sản Nhi Quảng Ninh',
    equipmentModel: 'Zybio Z3 CRP',
    serialNumber: 'Z3CRP-QN-2024-012',
    faultFound: 'Nghẽn đường hút hóa chất pha loãng Diluent và dung dịch phá hồng cầu Lyse, báo mã H108 do tắc nghẽn van pinch.',
    solutionProvided: 'Vệ sinh đường ống hóa chất, thay đoạn ống pinch cao su bị bẹp đàn hồi do sử dụng lâu ngày. Chạy chu trình Prime Lyse & Prime Diluent 3 lần để đuổi hết khí.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Đoạn ống kẹp van pinch đặc biệt silicone y tế Z3 (2 sợi)',
    status: 'Đã nghiệm thu',
    notes: 'Kiểm tra nền Background Run: WBC=0.01, RBC=0.00, HGB=0, PLT=1 (đạt chuẩn sạch).'
  },
  {
    id: 'MREC-012',
    code: '2026-XLKT-012',
    date: '2026-04-08',
    hospital: 'Trung tâm Y tế Thành phố Uông Bí',
    equipmentModel: 'Zybio Z50',
    serialNumber: 'Z50-UB-2025-007',
    faultFound: 'Kẹt trục kim hút mẫu chuyển động lên xuống trục Z, phát ra tiếng kêu cơ khí trượt bánh răng khi đâm xuyên nắp ống máu.',
    solutionProvided: 'Tháo cụm trục dẫn động trục Z của kim hút, tẩy sạch cặn bụi bám dính trên ray trượt bi chính xác, bôi mỡ bôi trơn chuyên dụng mỡ trắng Teflon. Căn chỉnh lực căng dây đai đồng bộ timing belt.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Mỡ tra ray trượt y sinh chống bụi, Vòng đệm hãm trục kim',
    status: 'Đã nghiệm thu',
    notes: 'Kim hút chuyển động êm ái, test đâm xuyên nắp cao su 30 lần ổn định.'
  },
  {
    id: 'MREC-013',
    code: '2026-XLKT-013',
    date: '2026-04-12',
    hospital: 'Phòng khám Đa khoa 108 Hào Nam',
    equipmentModel: 'FS-205',
    serialNumber: 'FS205-HN-2024-039',
    faultFound: 'Màn hình cảm ứng bị trôi điểm chạm, thao tác chọn phím xét nghiệm bị nhảy lệch sang nút bên cạnh.',
    solutionProvided: 'Tháo mặt nạ bảo vệ, vệ sinh mép màn hình cảm ứng điện dung bị bám dịch sát khuẩn gây nhiễu điện tích. Vào System Setting chạy lại chu trình cân chuẩn cảm ứng 5 điểm Touch Calibration.',
    engineerName: 'Hoàng Văn Nam',
    replacedParts: 'Tấm đệm gioăng cách điện khung màn hình',
    status: 'Đã nghiệm thu',
    notes: 'Cảm ứng nhạy bén, các điểm chạm chính xác 100%.'
  },
  {
    id: 'MREC-014',
    code: '2026-XLKT-014',
    date: '2026-04-15',
    hospital: 'Bệnh viện Đa khoa Quốc tế Bắc Hà',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC220-BH-2024-071',
    faultFound: 'Syringe bơm hút mẫu sinh hóa (Sample Syringe) bị rò rỉ dung dịch tại đầu pít-tông, thể tích hút mẫu bị thiếu hụt gây giảm giả tạo kết quả xét nghiệm.',
    solutionProvided: 'Tháo cụm bơm vi lượng Syringe Hamilton 100µL, phát hiện gioăng Teflon pít-tông bị xước mòn. Thay pít-tông Teflon mới, kiểm tra độ kín bằng áp lực nước 5 bar không rò giọt. Cân chỉnh độ lặp lại pipet bằng cân phân tích 4 số lẻ.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Pít-tông Teflon đầu bơm Syringe Hamilton 100µL',
    status: 'Đã nghiệm thu',
    notes: 'Hệ số biến thiên hút mẫu CV < 0.8% tại mức thể tích 3µL.'
  },
  {
    id: 'MREC-015',
    code: '2026-XLKT-015',
    date: '2026-04-18',
    hospital: 'Bệnh viện Đa khoa Tỉnh Bắc Giang',
    equipmentModel: 'Zybio Z3 CRP',
    serialNumber: 'Z3CRP-BG-2023-082',
    faultFound: 'Mất kết nối truyền dữ liệu LIS hai chiều sang phần mềm quản lý bệnh viện HIS/LIS của bệnh viện.',
    solutionProvided: 'Kiểm tra địa chỉ IP tĩnh trên máy xét nghiệm và cổng mạng LAN. Phát hiện đầu bấm mạng RJ45 bị gỉ chân đồng gây chập chờn gói tin TCP/IP. Bấm lại hạt mạng mới, cấu hình lại cổng truyền ASTM/HL7 trên máy và server LIS.',
    engineerName: 'Nguyễn Quang Đạt',
    replacedParts: 'Hạt mạng RJ45 Cat6 chống nhiễu mạ vàng, Dây nhảy mạng UTP 3m',
    status: 'Đã nghiệm thu',
    notes: 'Kết nối truyền dữ liệu tự động 100% hai chiều mượt mà.'
  },
  {
    id: 'MREC-016',
    code: '2026-XLKT-016',
    date: '2026-04-22',
    hospital: 'Bệnh viện Đa khoa Vân Đình',
    equipmentModel: 'Zybio Z50',
    serialNumber: 'Z50-VD-2025-015',
    faultFound: 'Cảnh báo nhiệt độ buồng ủ phản ứng lyse quang học dao động ngoài khoảng 35°C - 39°C do hỏng cảm biến nhiệt điện trở NTC.',
    solutionProvided: 'Tháo vỏ khoang buồng phản ứng, đo trở kháng cảm biến nhiệt NTC 10k bị chập ngắt quãng khi nhiệt độ tăng. Thay cảm biến nhiệt độ NTC chính hãng Zybio, kiểm tra đo kiểm đối chiếu bằng nhiệt kế chuẩn Fluke.',
    engineerName: 'Trần Minh Tuấn',
    replacedParts: 'Cảm biến nhiệt NTC 10k buồng ủ Z50 (Part: Z50-NTC-02)',
    status: 'Đang theo dõi',
    notes: 'Nhiệt độ duy trì chuẩn mực 37.0°C ± 0.2°C, đang theo dõi chạy mẻ bệnh nhân 24h.'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-001',
    ticketCode: 'TICK-2026-001',
    hospitalClinic: 'Bệnh viện Đa khoa Nông Nghiệp',
    department: 'Khoa Xét nghiệm - Hóa sinh',
    contactPerson: 'BS. Lê Hoài An',
    phone: '0912 888 123',
    equipmentModel: 'Zybio EXC200/220',
    serialNumber: 'EXC220-VN-2024-089',
    issueDescription: 'Máy báo lỗi kim hút mẫu E101 liên tục khi chạy mẻ bệnh nhân sáng nay, kim có tiếng kêu va chạm khi xoay.',
    errorCode: 'E101',
    priority: 'urgent',
    status: 'in_progress',
    assignedEngineerId: 'ENG-002',
    assignedEngineerName: 'Nguyễn Quang Đạt',
    createdAt: '2026-03-20T07:45:00Z',
    source: 'customer_portal',
    notes: 'Kỹ sư Đạt đang có mặt tại hiện trường xử lý cân chỉnh vị trí kim.'
  },
  {
    id: 'TICK-002',
    ticketCode: 'TICK-2026-002',
    hospitalClinic: 'Phòng khám Đa khoa Medlatec Tây Hồ',
    department: 'Khoa Xét nghiệm Huyết học',
    contactPerson: 'KTV. Hoàng Minh Thư',
    phone: '0983 555 777',
    equipmentModel: 'Zybio Z3 CRP',
    serialNumber: 'Z3CRP-HN-2025-067',
    issueDescription: 'Kênh đo quang CRP không trả kết quả (báo ***), mẫu huyết học vẫn chạy bình thường.',
    errorCode: 'H305',
    priority: 'normal',
    status: 'assigned',
    assignedEngineerId: 'ENG-002',
    assignedEngineerName: 'Trần Minh Tuấn',
    createdAt: '2026-03-20T08:15:00Z',
    source: 'customer_portal',
    notes: 'Kỹ sư Tuấn đã liên hệ hướng dẫn ngâm rửa cuvette quang, đang di chuyển đến hỗ trợ trực tiếp.'
  },
  {
    id: 'TICK-003',
    ticketCode: 'TICK-2026-003',
    hospitalClinic: 'Bệnh viện Đa khoa Hồng Ngọc - Phúc Trường Minh',
    department: 'Khoa Xét nghiệm Cấp cứu',
    contactPerson: 'CN. Nguyễn Văn Thành',
    phone: '0978 222 333',
    equipmentModel: 'FS-205',
    serialNumber: 'FS205-2025-088',
    issueDescription: 'Khay thử cassette bị kẹt không nhả ra sau khi đo xong mẫu Troponin I cấp cứu.',
    errorCode: 'FS101',
    priority: 'urgent',
    status: 'pending',
    createdAt: '2026-03-20T08:50:00Z',
    source: 'customer_portal',
    notes: 'Yêu cầu xử lý khẩn cấp trước 10h sáng.'
  },
  {
    id: 'TICK-004',
    ticketCode: 'TICK-2026-004',
    hospitalClinic: 'Phòng khám Đa khoa Hồng Hà',
    department: 'Phòng Xét nghiệm Tổng hợp',
    contactPerson: 'Bác sĩ Quách Tấn',
    phone: '0904 111 999',
    equipmentModel: 'Zybio Z50',
    serialNumber: 'Z50-2024-0019',
    issueDescription: 'Bảo trì định kỳ quý I/2026, thay thế lọc dịch bao bọc và kiểm tra hiệu chuẩn laser.',
    priority: 'scheduled',
    status: 'completed',
    assignedEngineerId: 'ENG-002',
    assignedEngineerName: 'Nguyễn Quang Đạt',
    createdAt: '2026-03-19T09:00:00Z',
    resolvedAt: '2026-03-19T14:30:00Z',
    source: 'internal_sales',
    engineerReport: {
      actualRootCause: 'Bảo dưỡng định kỳ 6 tháng theo khuyến cáo nhà sản xuất Zybio.',
      actionsTaken: 'Thay thế lọc tinh Sheath Filter 0.2µm, làm sạch buồng quang laser, kiểm chuẩn Levey-Jennings 3 nồng độ.',
      replacedParts: [
        { name: 'Sheath Filter 0.2µm', code: 'Z50-FLT-02', quantity: 1 },
        { name: 'Dây dẫn dịch bao bọc', code: 'Z50-TUB-01', quantity: 1 }
      ],
      preventiveAdvice: 'Nhắc nhở KTV chạy shutdown tự động hàng ngày với E-Z Cleanser.',
      completedAt: '2026-03-19T14:30:00Z',
      engineerName: 'Nguyễn Quang Đạt',
      customerRepresentative: 'Bác sĩ Quách Tấn'
    }
  }
];
