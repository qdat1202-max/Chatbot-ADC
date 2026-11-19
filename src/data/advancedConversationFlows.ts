import { AdvancedConversationFlow, ConversationFlowCategory, EquipmentModel } from '../types';

export const ADVANCED_CONVERSATION_FLOWS: AdvancedConversationFlow[] = [
  // =========================================================================
  // 1. NHÓM KỊCH BẢN: XỬ LÝ SỰ CỐ KỸ THUẬT PHỨC TẠP (COMPLEX TROUBLESHOOTING)
  // =========================================================================
  {
    id: 'flow-e101-probe-jam',
    title: 'Sự cố kẹt cơ khí & trôi tọa độ kim hút mẫu (E101)',
    category: 'complex_troubleshooting',
    categoryLabel: 'Sự cố kỹ thuật phức tạp',
    targetModels: ['Zybio EXC200/220'],
    triggerKeywords: ['e101', 'kẹt kim', 'lệch kim', 'va chạm kim', 'kim không hút mẫu', 'kim cong', 'trôi tọa độ kim'],
    triggerErrorCodes: ['E101'],
    summary: 'Chẩn đoán và phân nhánh khắc phục va chạm cơ khí trục Z, trôi tọa độ đĩa phản ứng hoặc bám bụi ray trượt bi trên Zybio EXC200/220.',
    initialQuestion: 'Phát hiện lỗi E101: Cụm kim hút mẫu gặp trở ngại cơ học trên trục Z hoặc lệch đĩa phản ứng. KTV vui lòng quan sát thực tế và chọn hiện tượng:',
    guidedOptions: [
      'Kim va vào miệng ống mẫu / cuvette',
      'Kim đứng yên kêu cạch cạch trượt bánh răng',
      'Kim bị cong vênh bằng mắt thường',
      'Yêu cầu Kỹ sư ADC đến căn chỉnh'
    ],
    branches: [
      {
        userChoice: 'Kim va vào miệng ống mẫu / cuvette',
        replyText: `HƯỚNG DẪN HIỆU CHỈNH TỌA ĐỘ TRỤC X/Y (Zybio EXC200/220):
1. Nhấn nút STOP khẩn cấp trên giao diện phần mềm để dừng mọi chuyển động cơ khí.
2. Vào Menu: Maintenance -> Alignment -> Sample Probe Calibration.
3. Đặt ống chuẩn vào vị trí số 1 trên khay mẫu bệnh nhân.
4. Dùng phím điều hướng (X-Step / Y-Step) tinh chỉnh đầu kim hạ xuống đúng tâm ống mẫu (dung sai cho phép < 0.5mm).
5. Nhấn SAVE Position và chạy lệnh Test Reset để máy tự học lại vị trí chuẩn.
6. Chạy thử 3 chu trình hút nước cất để kiểm chứng độ mượt mà.`,
        nextQuestion: 'Sau khi lưu tọa độ, tình trạng kim hút hiện tại như thế nào?',
        nextOptions: [
          'Đã cân chỉnh và hết báo lỗi E101',
          'Vẫn bị lệch tâm sau khi lưu tọa độ',
          'Chuyển tiếp Kỹ sư Đạt đến viện hỗ trợ'
        ]
      },
      {
        userChoice: 'Kim đứng yên kêu cạch cạch trượt bánh răng',
        replyText: `CHẨN ĐOÁN KẸT RAY TRƯỢT BI & TRÙNG DÂY ĐAI TIMING BELT:
1. TẮT CÔNG TẮC NGUỒN MÁY và rút phích cắm điện để bảo vệ động cơ bước (Stepper Motor).
2. Dùng gạc y tế sạch tẩm cồn 70° lau sạch bụi bám dọc trục thanh trượt Z và bánh răng dẫn động.
3. Tra 1-2 giọt mỡ bôi trơn chuyên dụng mỡ trắng Teflon y sinh (Part: OIL-01) vào ổ bi trượt.
4. Dùng tay nhẹ nhàng di chuyển cụm kim lên xuống 5 lần xem có trơn tru không.
5. Kiểm tra độ căng dây đai đồng bộ (Timing Belt): nếu dây đai võng quá 3mm, cần kỹ sư siết ốc tăng đơ.`,
        nextQuestion: 'Sau khi vệ sinh ray trượt, chuyển động cơ học thế nào?',
        nextOptions: [
          'Kim đã trơn tru, máy chạy lại bình thường',
          'Vẫn kẹt cơ khí trục Z kêu cạch cạch',
          'Cần kỹ sư điều phối khẩn cấp'
        ]
      },
      {
        userChoice: 'Kim bị cong vênh bằng mắt thường',
        replyText: `CẢNH BÁO: Kim hút vi lượng bị cong vênh tuyệt đối KHÔNG ĐƯỢC tự uốn nắn bằng tay vì sẽ làm sai lệch vĩnh viễn cảm biến mực chất lỏng điện dung (Capacitance Liquid Level Detection) và gây nứt vỡ cuvette quang học thạch anh.
Hệ thống kích hoạt ngay luồng điều phối Kỹ sư ADC mang kim thay thế chính hãng đến xử lý.`,
        autoEscalate: true,
        escalationReason: 'keyword_match',
        nextQuestion: 'KTV vui lòng xác nhận thông tin để Kỹ sư ADC mang linh kiện thay thế đến ngay:'
      },
      {
        userChoice: 'Yêu cầu Kỹ sư ADC đến căn chỉnh',
        replyText: `Đã tiếp nhận yêu cầu điều phối kỹ sư tận viện cho sự cố cơ khí E101 máy EXC200/220. Kỹ sư trưởng trực ca (KS. Nguyễn Quang Đạt) sẽ liên hệ lại trong vòng 15 phút.`,
        autoEscalate: true,
        escalationReason: 'direct_request'
      }
    ]
  },

  {
    id: 'flow-e205-temp-vacuum',
    title: 'Nhiệt độ buồng ủ 37°C dao động & mất áp suất chân không (E205)',
    category: 'complex_troubleshooting',
    categoryLabel: 'Sự cố kỹ thuật phức tạp',
    targetModels: ['Zybio EXC200/220'],
    triggerKeywords: ['e205', 'nhiệt độ buồng ủ', 'nhiệt độ dao động', 'buồng ủ không nóng', 'áp suất chân không', 'sai số men gan'],
    triggerErrorCodes: ['E205'],
    summary: 'Xử lý lỗi kết hợp đa triệu chứng: dao động nhiệt đĩa ủ phản ứng và suy giảm áp lực hút chân không buồng phản ứng.',
    initialQuestion: 'Cảnh báo E205: Đĩa ủ phản ứng dao động ngoài dải chuẩn 37.0°C ± 0.2°C hoặc áp suất chân không suy giảm. Vui lòng chọn kiểm tra bước đầu:',
    guidedOptions: [
      'Nhiệt độ nhảy vọt thất thường (35°C nhảy lên 42°C)',
      'Nhiệt độ tăng rất chậm, không đạt 37°C',
      'Áp suất chân không báo yếu (-32kPa)',
      'Điều phối Kỹ sư kiểm tra phần cứng'
    ],
    branches: [
      {
        userChoice: 'Nhiệt độ nhảy vọt thất thường (35°C nhảy lên 42°C)',
        replyText: `CHẨN ĐOÁN LÂM SÀNG: CẢM BIẾN NHIỆT NTC 10K BỊ CHẬP NGẮT QUÃNG:
Khi nhiệt độ hiển thị nhảy vọt đột ngột trong 1-2 giây, đây không phải do thanh gia nhiệt mà do cảm biến nhiệt điện trở NTC bị lỏng giắc hoặc chập vi mạch.
Các bước xử lý tạm thời:
1. Đảm bảo nắp che bảo vệ buồng ủ phản ứng được đậy kín 100%.
2. Tắt máy trong 5 phút, mở nắp hông máy kiểm tra giắc cắm cảm biến Temp Sensor CN12 trên bo mạch chính.
3. Cắm chặt lại giắc, khởi động lại máy và quan sát đồ thị nhiệt độ trong 15 phút.`,
        nextQuestion: 'Đồ thị nhiệt độ sau khi cắm chặt giắc cảm biến:',
        nextOptions: [
          'Nhiệt độ đã ổn định 37.0°C',
          'Vẫn nhảy loạn nhiệt độ',
          'Yêu cầu thay cảm biến NTC chính hãng'
        ]
      },
      {
        userChoice: 'Nhiệt độ tăng rất chậm, không đạt 37°C',
        replyText: `KIỂM TRA CẦU CHÌ NHIỆT & MẠCH NGUỒN SƯỞI 24V:
1. Kiểm tra nhiệt độ phòng xét nghiệm: Phòng máy cần duy trì máy lạnh 20 - 25°C.
2. Kiểm tra quạt tản nhiệt phía sau buồng ủ có bị nghẹt bụi bẩn làm giảm hiệu suất tuần hoàn gió nóng.
3. Dùng nhiệt kế chuẩn thủy ngân / nhiệt kế điện tử đo đối chứng trực tiếp tại cuvette số 1 xem nhiệt độ thực tế là bao nhiêu.`,
        nextQuestion: 'Kết quả đo đối chứng nhiệt độ thực tế:',
        nextOptions: [
          'Nhiệt kế đo đúng 37 độ, phần mềm hiển thị sai',
          'Nhiệt kế đo dưới 35 độ, máy không sưởi',
          'Chuyển kỹ sư kiểm tra mạch nguồn'
        ]
      },
      {
        userChoice: 'Áp suất chân không báo yếu (-32kPa)',
        replyText: `HƯỚNG DẪN XỬ LÝ HỞ KHÍ ĐƯỜNG ỐNG CHÂN KHÔNG:
Áp suất chuẩn yêu cầu phải đạt từ -40kPa đến -45kPa.
1. Kiểm tra nắp bình bẫy bọt thải (Waste Trap Bottle): Nắp bình bị kênh gioăng silicone hoặc vặn lỏng là nguyên nhân 80% gây tụt áp.
2. Vặn chặt nắp bình bẫy bọt, kiểm tra xem gioăng cao su có bị rách không.
3. Lần theo ống silicone hút khí từ bơm màng chân không xem có vết nứt hoặc gấp khúc không.`,
        nextQuestion: 'Sau khi siết chặt nắp bình bẫy bọt:',
        nextOptions: [
          'Áp suất đã hồi phục trên -42kPa',
          'Vẫn báo áp suất yếu dưới -35kPa',
          'Gọi kỹ sư ADC hỗ trợ'
        ]
      },
      {
        userChoice: 'Điều phối Kỹ sư kiểm tra phần cứng',
        replyText: 'Đã chuyển ca sự cố E205 sang trạng thái ưu tiên cao. Kỹ sư ADC sẽ chuẩn bị đồng hồ đo áp suất và cảm biến nhiệt để đến hỗ trợ trực tiếp.',
        autoEscalate: true,
        escalationReason: 'high_complexity'
      }
    ]
  },

  {
    id: 'flow-h101-wbc-aperture',
    title: 'Tắc buồng đếm trở kháng WBC/RBC & Bọt khí Lyse (H101/H108)',
    category: 'complex_troubleshooting',
    categoryLabel: 'Sự cố kỹ thuật phức tạp',
    targetModels: ['Zybio Z3 CRP', 'Zybio Z50'],
    triggerKeywords: ['h101', 'h108', 'tắc buồng đếm', 'clot buồng đếm', 'clot wbc', 'clot rbc', 'lỗ đếm sapphire', 'bọt khí lyse'],
    triggerErrorCodes: ['H101', 'H108'],
    summary: 'Khai thông tắc nghẽn lỗ đếm sapphire 3 cấp độ (Zap xung điện cao áp, ngâm E-Z Cleanser và thông ngược).',
    initialQuestion: 'Báo lỗi H101/H108: Nghẽn lỗ đếm sapphire hoặc bọt khí đường ống pha loãng. Vui lòng chọn cấp độ can thiệp:',
    guidedOptions: [
      'Cấp độ 1: Bắn xung điện cao áp (Zap & Flush)',
      'Cấp độ 2: Ngâm ủ dung dịch tẩy E-Z Cleanser',
      'Cấp độ 3: Tháo xịt rửa buồng đếm thủ công',
      'Kết nối Kỹ sư chuyên trách dòng máy'
    ],
    branches: [
      {
        userChoice: 'Cấp độ 1: Bắn xung điện cao áp (Zap & Flush)',
        replyText: `QUY TRÌNH BẮN XUNG CAO ÁP TỰ ĐỘNG KHAI THÔNG LỖ ĐẾM:
1. Trên phần mềm máy, vào Menu: Service -> Maintenance -> Aperture Maintenance.
2. Nhấn chọn "Zap WBC Aperture" 3 lần liên tiếp (tiếng tạch nhỏ là xung điện đốt cháy cục máu đông).
3. Nhấn "Backflush" để dòng dung dịch đẩy cặn ra khỏi lỗ đếm.
4. Chạy mẫu nền trắng Background Run để kiểm tra lại: Yêu cầu WBC < 0.2 x10^9/L, RBC < 0.02 x10^12/L.`,
        nextQuestion: 'Kết quả chạy mẫu nền trắng sau khi Zap & Flush:',
        nextOptions: [
          'Background sạch, máy đã hết báo lỗi H101',
          'Vẫn báo H101 tắc buồng đếm',
          'Chuyển sang Cấp độ 2: Ngâm E-Z Cleanser'
        ]
      },
      {
        userChoice: 'Cấp độ 2: Ngâm ủ dung dịch tẩy E-Z Cleanser',
        replyText: `QUY TRÌNH NGÂM HÓA CHẤT TẨY RỬA ENZYME CHUYÊN DỤNG (E-Z CLEANSER):
1. Chuẩn bị 2.0ml dung dịch tẩy E-Z Cleanser chính hãng Zybio.
2. Mở nắp khoang buồng đếm, dùng ống hút Pasteur nhỏ trực tiếp dung dịch vào buồng đếm WBC và RBC.
3. Để ngâm ủ nguyên vị trí trong 15-20 phút để enzyme hòa tan hoàn toàn màng fibrin và tủa protein.
4. Trên phần mềm, nhấn "Drain & Rinse" 2 chu trình để rửa sạch hoàn toàn hóa chất tẩy.
5. Chạy Background Run kiểm tra lại.`,
        nextQuestion: 'Sau khi ngâm E-Z Cleanser 20 phút:',
        nextOptions: [
          'Đã hết tắc, kết quả đo trở lại bình thường',
          'Vẫn báo lỗi tắc buồng đếm',
          'Cần kỹ sư đến tháo rửa buồng đếm'
        ]
      },
      {
        userChoice: 'Cấp độ 3: Tháo xịt rửa buồng đếm thủ công',
        replyText: `LƯU Ý AN TOÀN Y SINH CẤP ĐỘ 2:
Mẫu máu bệnh nhân có nguy cơ lây nhiễm mầm bệnh qua đường máu.
BẮT BUỘC: Đeo găng tay y tế đôi, khẩu trang và kính bảo hộ giọt bắn.
1. Tháo buồng đếm ra khỏi khung máy, đặt lên khay men y tế.
2. Dùng bơm tiêm 5ml gắn ống mềm bơm dung dịch tẩy thông ngược từ mặt sau của lỗ đếm sapphire.
3. Tuyệt đối KHÔNG dùng kim kim loại chọc trực tiếp vào lỗ đếm vì sẽ làm mẻ đá sapphire gây hỏng vĩnh viễn buồng đếm.`,
        safetyWarning: 'Nguy cơ lây nhiễm sinh học. Tuyệt đối không dùng vật kim loại cứng chọc vào đá sapphire lỗ đếm.',
        nextQuestion: 'Tình trạng buồng đếm sau khi thông ngược:',
        nextOptions: [
          'Lỗ đếm đã thông suốt hoàn toàn',
          'Không thể thông được, cần thay cụm buồng đếm',
          'Yêu cầu kỹ sư ADC hỗ trợ tại viện'
        ]
      },
      {
        userChoice: 'Kết nối Kỹ sư chuyên trách dòng máy',
        replyText: 'Đã chuyển thông tin sự cố H101 của máy Zybio Z3 CRP tới KS. Trần Minh Tuấn (Chuyên gia kỹ thuật huyết học ADC). Kỹ sư sẽ gọi lại trong 15 phút.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      }
    ]
  },

  {
    id: 'flow-z501-laser-sheath',
    title: 'Lỗi Laser 5 thành phần & Dòng dịch bao bọc Sheath (Z501)',
    category: 'complex_troubleshooting',
    categoryLabel: 'Sự cố kỹ thuật phức tạp',
    targetModels: ['Zybio Z50'],
    triggerKeywords: ['z501', 'lỗi laser', 'sheath flow', 'dịch bao bọc', 'tán xạ 3 góc', 'scattergram trắng', 'lọc sheath'],
    triggerErrorCodes: ['Z501'],
    summary: 'Phân tích suy giảm năng lượng diode laser, bọt khí trong dòng dịch bao bọc và kiểm tra bộ lọc tinh 0.2µm.',
    initialQuestion: 'Báo lỗi Z501 (Optical Laser Flowcell): Biểu đồ phân bố bạch cầu Scattergram bị biến dạng hoặc chùm laser suy giảm. Chọn nội dung kiểm tra:',
    guidedOptions: [
      'Xả bọt khí đường dịch bao bọc (Prime Sheath)',
      'Kiểm tra và thay thế bộ lọc Sheath Filter 0.2µm',
      'Đo kiểm điện áp Diode Laser bán dẫn',
      'Điều phối Kỹ sư Đạt đến viện'
    ],
    branches: [
      {
        userChoice: 'Xả bọt khí đường dịch bao bọc (Prime Sheath)',
        replyText: `CHU TRÌNH PRIME ĐUỔI BỌT KHÍ CỤM QUANG LASER:
1. Bọt khí trong flowcell sẽ làm tán xạ chùm laser sai lệch, khiến biểu đồ bạch cầu 5 thành phần bị trắng hoặc dồn cục.
2. Vào Menu: Service -> Fluidic Prime -> Chọn 'Prime Sheath Flow'.
3. Thực hiện chu trình 2 lần liên tiếp. Quan sát đường ống dẫn sheath trong suốt xem còn bọt khí li ti không.
4. Chạy mẫu QC 5 thành phần để kiểm tra độ phân tách giữa Lympho, Mono, Neutro, Eosino và Baso.`,
        nextQuestion: 'Biểu đồ Scattergram sau khi xả bọt khí:',
        nextOptions: [
          'Biểu đồ phân tách 5 quần thể rõ ràng',
          'Biểu đồ vẫn bị co cụm bất thường',
          'Cần kiểm tra bộ lọc Sheath Filter'
        ]
      },
      {
        userChoice: 'Kiểm tra và thay thế bộ lọc Sheath Filter 0.2µm',
        replyText: `BẢO TRÌ BỘ LỌC TINH DỊCH BAO BỌC SHEATH FILTER:
1. Vị trí bộ lọc: Nằm ở khoang bên trái máy, vỏ lọc dạng con nhộng trong suốt.
2. Nếu màng lọc ngả màu vàng sẫm hoặc đã vận hành trên 6 tháng (> 10.000 test), trở lực dòng chảy sẽ tăng cao gây thiếu dịch bao bọc.
3. Thay thế bằng lọc Sheath Filter 0.2µm chính hãng Zybio (Part: Z50-FLT-02). Sau khi thay, bắt buộc chạy Prime 3 lần.`,
        nextQuestion: 'KTV đã có sẵn lọc Sheath Filter dự phòng chưa?',
        nextOptions: [
          'Đã có lọc dự phòng, đã thay thành công',
          'Chưa có lọc dự phòng, cần ADC xuất kho gửi gấp',
          'Yêu cầu Kỹ sư mang lọc đến thay và bảo dưỡng'
        ]
      },
      {
        userChoice: 'Đo kiểm điện áp Diode Laser bán dẫn',
        replyText: 'CẢNH BÁO AN TOÀN QUANG HỌC: Bức xạ laser vô hình cấp độ 3B có thể gây tổn thương giác mạc vĩnh viễn. Việc mở hộp buồng quang chỉ được thực hiện bởi kỹ sư ADC đã qua đào tạo của hãng Zybio với kính lọc bảo hộ chuyên dụng.',
        safetyWarning: 'Tuyệt đối không nhìn trực tiếp vào chùm tia laser. Thao tác thuộc thẩm quyền kỹ sư ủy quyền.',
        autoEscalate: true,
        escalationReason: 'keyword_match'
      },
      {
        userChoice: 'Điều phối Kỹ sư Đạt đến viện',
        replyText: 'Đã tạo yêu cầu điều phối KS. Nguyễn Quang Đạt (Chuyên gia máy huyết học Z50 Laser). Phiếu điều phối cam kết phản hồi trong 15 phút.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      }
    ]
  },

  {
    id: 'flow-fs101-cassette',
    title: 'Kẹt khay thẻ test cassette & Lỗi đầu đọc quang (FS-205)',
    category: 'complex_troubleshooting',
    categoryLabel: 'Sự cố kỹ thuật phức tạp',
    targetModels: ['FS-205'],
    triggerKeywords: ['fs101', 'kẹt cassette', 'không đọc thẻ', 'khay không nhả', 'lỗi đầu đọc quang'],
    triggerErrorCodes: ['FS101'],
    summary: 'Xử lý kẹt cơ khí khay đẩy cassette đo Troponin I/D-Dimer và sự cố đầu đọc quang huỳnh quang.',
    initialQuestion: 'Báo lỗi FS-205 (Miễn dịch huỳnh quang): Khay cassette không nhả hoặc đầu đọc quang báo lỗi. KTV chọn hiện tượng:',
    guidedOptions: [
      'Cassette bị kẹt cứng bên trong máy',
      'Đầu đọc quang huỳnh quang không đo được',
      'Yêu cầu Kỹ sư ADC hỗ trợ trực tiếp'
    ],
    branches: [
      {
        userChoice: 'Cassette bị kẹt cứng bên trong máy',
        replyText: `THAO TÁC NHẢ CASSETTE AN TOÀN TRÁNH GÃY BÁNH RĂNG DẪN ĐỘNG:
1. Nhấn nút "Eject" trên màn hình cảm ứng 2 lần để kích hoạt động cơ nhả khay.
2. Nếu máy phát tiếng kẹt rè rè, TẮT NGUỒN máy ngay lập tức.
3. Dùng que gắp y tế nhựa mềm kẹp nhẹ vào gờ đuôi của cassette và kéo thẳng theo chiều trượt ra ngoài.
4. TUYỆT ĐỐI KHÔNG DÙNG LỰC GIẬT MẠNH hoặc nạy bằng dao kim loại làm trầy xước khay trượt quang học.
5. Kiểm tra xem thẻ cassette có bị dính dịch mẫu máu bệnh nhân ở mặt đáy gây bết dính không.`,
        nextQuestion: 'Sau khi lấy cassette bị kẹt ra:',
        nextOptions: [
          'Đã lấy ra an toàn, máy chạy lại bình thường',
          'Vẫn kẹt khay trượt, không nạp được test mới',
          'Cần kỹ sư đến kiểm tra cụm motor đẩy'
        ]
      },
      {
        userChoice: 'Đầu đọc quang huỳnh quang không đo được',
        replyText: 'Cụm cảm biến quang huỳnh quang LED cần hiệu chuẩn lại dải bước sóng kích thích. Đã chuyển yêu cầu sang kỹ sư chuyên trách POCT.',
        autoEscalate: true,
        escalationReason: 'high_complexity'
      },
      {
        userChoice: 'Yêu cầu Kỹ sư ADC hỗ trợ trực tiếp',
        replyText: 'Đã tiếp nhận yêu cầu hỗ trợ máy miễn dịch FS-205. Kỹ sư ADC sẽ gọi lại hỗ trợ ngay.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      }
    ]
  },

  // =========================================================================
  // 2. NHÓM KỊCH BẢN: HƯỚNG DẪN SỬ DỤNG & VẬN HÀNH CHI TIẾT (OPERATIONAL GUIDES)
  // =========================================================================
  {
    id: 'flow-daily-startup',
    title: 'Quy trình khởi động đầu ngày & Chạy mẫu nền Blank chuẩn',
    category: 'detailed_guide',
    categoryLabel: 'Hướng dẫn sử dụng chi tiết',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['khởi động', 'bảo trì đầu ngày', 'đầu ca', 'chạy blank', 'background run', 'startup', 'chuẩn bị máy'],
    summary: 'Quy trình chuẩn hóa 5 bước từ kiểm tra vật tư, bật máy, prime xả khí đến nghiệm thu chỉ số mẫu nền Blank đạt chuẩn trước khi phân tích.',
    initialQuestion: 'Hướng dẫn vận hành đầu ca xét nghiệm: Quý khách muốn xem quy trình chi tiết cho dòng máy nào?',
    guidedOptions: [
      'Khởi động máy Sinh hóa Zybio EXC200/220',
      'Khởi động máy Huyết học Zybio Z3 CRP',
      'Khởi động máy Huyết học Z50 (5TP Laser)',
      'Khởi động máy Miễn dịch FS-205'
    ],
    branches: [
      {
        userChoice: 'Khởi động máy Sinh hóa Zybio EXC200/220',
        replyText: `QUY TRÌNH KHỞI ĐỘNG ĐẦU NGÀY MÁY SINH HÓA EXC200/220:
Bước 1: Bật ổn áp điện và công tắc nguồn phía sau máy. Bật máy tính điều khiển.
Bước 2: Kiểm tra thể tích nước cất rửa (Deionized Water) và can nước thải sinh học. Đổ nước thải nếu đã đầy quá 2/3 can.
Bước 3: Chờ 15-20 phút để đĩa ủ phản ứng đạt nhiệt độ ổn định 37.0°C ± 0.2°C và đèn Halogen đạt độ sáng bão hòa.
Bước 4: Vào Reagent Inventory quét kiểm tra thể tích các chai thuốc thử trên khay lạnh.
Bước 5: Chạy "Cuvette Blank Check" kiểm tra độ sạch của 80 cuvette phản ứng: Yêu cầu Abs < 0.005 A.`,
        nextQuestion: 'KTV muốn xem tiếp hướng dẫn nào?',
        nextOptions: [
          'Hướng dẫn chạy kiểm chuẩn IQC sinh hóa',
          'Hướng dẫn Prime mồi hóa chất',
          'Đã hoàn tất khởi động, bắt đầu ca chạy'
        ]
      },
      {
        userChoice: 'Khởi động máy Huyết học Zybio Z3 CRP',
        replyText: `QUY TRÌNH KHỞI ĐỘNG ĐẦU CA MÁY HUYẾT HỌC Z3 CRP:
Bước 1: Bật công tắc nguồn bên hông máy. Chờ máy tự kiểm tra phần cứng (Self-Test: 3 phút).
Bước 2: Kiểm tra dây cắm các can hóa chất: Diluent (nắp xanh), Lyse (nắp đỏ), Probe Cleanser (nắp vàng).
Bước 3: Thực hiện chu trình Prime Diluent & Prime Lyse 1 lần để xả bọt khí.
Bước 4: Chạy Background Run (mẫu nền trắng).
TIÊU CHUẨN NGHIỆM THU BACKGROUND CHUẨN:
• WBC ≤ 0.2 x10^9/L
• RBC ≤ 0.02 x10^12/L
• HGB ≤ 1 g/L
• HCT ≤ 0.5%
• PLT ≤ 10 x10^9/L`,
        nextQuestion: 'Chỉ số Background sau khi chạy có đạt chuẩn không?',
        nextOptions: [
          'Background đạt chuẩn, sẵn sàng chạy bệnh nhân',
          'Chỉ số WBC/PLT bị cao vượt ngưỡng',
          'Hướng dẫn chạy mẫu chuẩn QC huyết học'
        ]
      },
      {
        userChoice: 'Khởi động máy Huyết học Z50 (5TP Laser)',
        replyText: `QUY TRÌNH KHỞI ĐỘNG MÁY HUYẾT HỌC 5 THÀNH PHẦN Z50:
Bước 1: Bật nguồn máy, chờ áp suất bơm chân không đạt ngưỡng từ -40kPa đến -45kPa.
Bước 2: Kiểm tra dịch bao bọc Sheath Reagent và chất tẩy rửa E-Z Cleanser.
Bước 3: Chạy chu trình Prime Sheath Flow để làm sạch buồng quang laser.
Bước 4: Chạy Background Run kiểm tra 5 thành phần bạch cầu (Diff Blank).`,
        nextQuestion: 'KTV cần xem tiếp nội dung nào?',
        nextOptions: [
          'Cách xử lý khi Background không sạch',
          'Chạy mẫu kiểm chuẩn 5 thành phần (QC High/Normal/Low)',
          'Đã sẵn sàng ca chạy mẫu'
        ]
      },
      {
        userChoice: 'Khởi động máy Miễn dịch FS-205',
        replyText: `QUY TRÌNH KHỞI ĐỘNG MÁY POCT MIỄN DỊCH FS-205:
Bước 1: Cắm adapter nguồn 12V chính hãng, bật công tắc nguồn.
Bước 2: Máy tự kiểm tra động cơ bước khay nạp thẻ và hệ quang huỳnh quang.
Bước 3: Kiểm tra cài đặt ngày giờ trên máy để đảm bảo kết quả in ra đúng thời gian lâm sàng.
Bước 4: Cắm thẻ chip lô xét nghiệm (Troponin I, D-Dimer, HbA1c, PCT, CRP) để nạp đường chuẩn.`,
        nextQuestion: 'KTV cần hỗ trợ thêm thao tác nào trên FS-205?',
        nextOptions: [
          'Cách cài đặt máy in nhiệt tích hợp',
          'Cách kết nối truyền dữ liệu LIS',
          'Đã sẵn sàng chạy mẫu'
        ]
      }
    ]
  },

  {
    id: 'flow-calibration-iqc',
    title: 'Quy trình Hiệu chuẩn (Calibration) & Kiểm chuẩn nội bộ (IQC)',
    category: 'detailed_guide',
    categoryLabel: 'Hướng dẫn sử dụng chi tiết',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['calibration', 'hiệu chuẩn', 'calib', 'qc', 'kiểm chuẩn', 'levey jennings', 'westgard', 'sai số'],
    summary: 'Hướng dẫn chuẩn bị mẫu chuẩn, lắc trộn đúng kỹ thuật, dựng đường chuẩn đa điểm và đánh giá vi phạm quy tắc Westgard.',
    initialQuestion: 'Hướng dẫn Hiệu chuẩn (Calib) & Kiểm tra chất lượng (IQC): Vui lòng chọn nội dung Quý khách cần tra cứu:',
    guidedOptions: [
      'Chuẩn bị & Chạy Calibrator đúng kỹ thuật',
      'Đánh giá biểu đồ kiểm chuẩn Levey-Jennings',
      'Xử lý khi vi phạm quy tắc Westgard (1-3s, 2-2s)',
      'Tư vấn Kỹ sư trưởng về sai số xét nghiệm'
    ],
    branches: [
      {
        userChoice: 'Chuẩn bị & Chạy Calibrator đúng kỹ thuật',
        replyText: `KỸ THUẬT PHỤC HỒI & HOÀN NGUYÊN MẪU CHUẨN / KIỂM CHUẨN:
1. Lấy lọ Calibrator / Control đông khô từ tủ lạnh 2-8°C, để ấm ở nhiệt độ phòng trong 15 phút.
2. Dùng pipet chuẩn lấy chính xác lượng nước cất pha mẫu theo đúng hướng dẫn trên nhãn lọ (sai số thể tích < 1%).
3. Đậy nắp kín, xoay tròn và đảo nhẹ theo hình số 8 từ 10 đến 15 lần.
4. TUYỆT ĐỐI KHÔNG lắc mạnh bằng máy Vortex vì sẽ làm đứt gãy cấu trúc protein và sinh bọt khí vi lượng.
5. Để yên 30 phút trong bóng râm cho mẫu tan hoàn toàn trước khi nạp vào máy.`,
        nextQuestion: 'KTV muốn xem bước tiếp theo:',
        nextOptions: [
          'Cách cài đặt giá trị đích Target/SD trên phần mềm',
          'Đánh giá biểu đồ kiểm chuẩn Levey-Jennings',
          'Đã nắm rõ kỹ thuật chuẩn bị'
        ]
      },
      {
        userChoice: 'Đánh giá biểu đồ kiểm chuẩn Levey-Jennings',
        replyText: `TIÊU CHÍ ĐÁNH GIÁ KẾT QUẢ QC TRÊN BIỂU ĐỒ LEVEY-JENNINGS:
• Đạt chuẩn (In-Control): Điểm đo nằm trong khoảng ±1SD đến ±2SD xung quanh giá trị trung bình (Target Mean).
• Cảnh báo (Warning): Điểm đo rơi vào khoảng từ ±2SD đến ±3SD (Quy tắc 1-2s). Cho phép chạy lại lần 2.
• Mất kiểm soát (Out-of-Control): Điểm đo vượt ngoài ±3SD (Quy tắc 1-3s) hoặc 2 điểm liên tiếp cùng vượt ±2SD (Quy tắc 2-2s).
BẮT BUỘC: Dừng ngay ca chạy mẫu bệnh nhân, không trả kết quả khi hệ thống đang Out-of-Control!`,
        nextQuestion: 'Tình trạng điểm QC của phòng xét nghiệm hiện tại:',
        nextOptions: [
          'Vượt ngoài dải 3SD (Out of Control)',
          'Có xu hướng trôi dần về một phía (Trend/Shift)',
          'QC đạt chuẩn trong khoảng ±1SD'
        ]
      },
      {
        userChoice: 'Xử lý khi vi phạm quy tắc Westgard (1-3s, 2-2s)',
        replyText: `CÁC BƯỚC KHẮC PHỤC KHI VI PHẠM WESTGARD:
Bước 1: Kiểm tra nhiệt độ buồng ủ (Sinh hóa 37°C, Huyết học 35°C). Sai số nhiệt độ là nguyên nhân 60% gây lỗi QC.
Bước 2: Kiểm tra hạn dùng chai hóa chất đang mở trên máy. Nếu hóa chất đã mở quá 30 ngày, thay chai mới.
Bước 3: Lấy ống Control mới hoàn nguyên lại để chạy đối chứng (loại trừ biến tính ống control cũ).
Bước 4: Làm sạch kim hút mẫu và cuvette bằng hóa chất tẩy rửa chuyên dụng.
Bước 5: Chạy lại Calib nếu điểm đo trôi có hệ thống.`,
        nextQuestion: 'Sau khi kiểm tra các bước trên:',
        nextOptions: [
          'Chạy lại QC đã đạt trong khoảng 1SD',
          'Vẫn bị lệch kết quả sau khi thay hóa chất',
          'Cần kỹ sư ADC hỗ trợ cân chỉnh quang học'
        ]
      },
      {
        userChoice: 'Tư vấn Kỹ sư trưởng về sai số xét nghiệm',
        replyText: 'Đã kết nối yêu cầu tư vấn thẩm định kết quả kiểm chuẩn tới KS. Nguyễn Quang Đạt. Kỹ sư sẽ xem đối chiếu dữ liệu Levey-Jennings và liên hệ lại.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      }
    ]
  },

  {
    id: 'flow-auto-shutdown',
    title: 'Chu trình Tắt máy (Shutdown) & Ngâm rửa cuvette định kỳ',
    category: 'detailed_guide',
    categoryLabel: 'Hướng dẫn sử dụng chi tiết',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['shutdown', 'tắt máy', 'ngâm cuvette', 'bảo dưỡng cuối ngày', 'vệ sinh cuối ngày', 'rửa kim'],
    summary: 'Quy trình ngâm rửa cuvette thạch anh và kim hút bằng dung dịch enzyme E-Z Cleanser trước khi ngắt nguồn kết thúc ngày làm việc.',
    initialQuestion: 'Bảo dưỡng và Tắt máy cuối ngày: Vui lòng chọn nội dung thao tác:',
    guidedOptions: [
      'Quy trình Shutdown tự động máy Sinh hóa EXC200/220',
      'Quy trình Shutdown ngâm kim máy Huyết học Z3/Z50',
      'Pha hóa chất ngâm rửa chuyên dụng (E-Z Cleanser / Acid Clean)',
      'Xử lý nước thải y tế an toàn sinh học'
    ],
    branches: [
      {
        userChoice: 'Quy trình Shutdown tự động máy Sinh hóa EXC200/220',
        replyText: `QUY TRÌNH SHUTDOWN MÁY SINH HÓA EXC200/220:
1. Đặt 1 ống chứa 3.0ml dung dịch Acid Wash và 1 ống Alkaline Wash vào khay mẫu ở vị trí W1 và W2.
2. Trên màn hình chính, nhấn nút "Auto Shutdown".
3. Máy sẽ tự động thực hiện chu trình ngâm rửa 80 cuvette phản ứng trong 12 phút để tẩy sạch cặn protein và hóa chất bám dính.
4. Sau khi máy báo "Shutdown Completed", nhấn Exit phần mềm và tắt công tắc nguồn.
5. Vệ sinh kim hút và đĩa mẫu bằng gạc tẩm cồn 70°.`,
        nextQuestion: 'KTV muốn tra cứu thêm:',
        nextOptions: [
          'Cách pha dung dịch rửa chuyên dụng',
          'Bảo quản cuvette khi nghỉ cuối tuần',
          'Hoàn tất chu trình tắt máy'
        ]
      },
      {
        userChoice: 'Quy trình Shutdown ngâm kim máy Huyết học Z3/Z50',
        replyText: `QUY TRÌNH SHUTDOWN MÁY HUYẾT HỌC:
1. Nhấn nút "Shutdown" trên giao diện phần mềm.
2. Khi máy yêu cầu "Feed Probe Cleanser": Đưa lọ Probe Cleanser ngập đầu kim hút và nhấn nút hút mẫu.
3. Máy sẽ hút 1.5ml hóa chất tẩy và giữ ngâm buồng đếm trong 10 phút.
4. Chờ màn hình hiện thông báo "Please turn off the power switch", tắt công tắc nguồn bên hông máy.`,
        nextQuestion: 'Thao tác hoàn tất, KTV cần trợ giúp thêm gì?',
        nextOptions: [
          'Cách xử lý can nước thải y tế sinh học',
          'Quy trình khởi động cho ca trực đêm',
          'Đã hoàn thành bảo dưỡng cuối ngày'
        ]
      },
      {
        userChoice: 'Pha hóa chất ngâm rửa chuyên dụng (E-Z Cleanser / Acid Clean)',
        replyText: `HƯỚNG DẪN DÙNG HÓA CHẤT RỬA CHÍNH HÃNG:
• Tuyệt đối KHÔNG dùng cồn hoặc nước tẩy Javen nồng độ cao để ngâm cuvette vì sẽ làm đục lớp keo quang học của cuvette thạch anh.
• Chỉ sử dụng dung dịch rửa chính hãng: E-Z Cleanser (Zybio) hoặc Acid Wash chuyên dụng do ADC cung cấp.
• Bảo quản chai hóa chất rửa ở nhiệt độ phòng 15 - 30°C, tránh ánh nắng trực tiếp.`,
        nextQuestion: 'Quý khách muốn kiểm tra tồn kho vật tư hóa chất rửa?',
        nextOptions: [
          'Liên hệ bộ phận vật tư ADC đặt thêm hóa chất',
          'Đã có sẵn hóa chất, tiếp tục tắt máy'
        ]
      },
      {
        userChoice: 'Xử lý nước thải y tế an toàn sinh học',
        replyText: 'Nước thải xét nghiệm có chứa mầm bệnh sinh học nguy hại. Trước khi thải ra hệ thống xử lý nước thải bệnh viện, cần bổ sung 50ml dung dịch Cloramin B hoặc Javen khử khuẩn vào can nước thải sinh học.',
        safetyWarning: 'Luôn mang găng tay và kính bảo hộ khi thao tác với bình chứa nước thải y tế.'
      }
    ]
  },

  {
    id: 'flow-prime-reagents',
    title: 'Thay thế hóa chất, mồi hóa chất (Prime) & Xả bọt khí đường ống',
    category: 'detailed_guide',
    categoryLabel: 'Hướng dẫn sử dụng chi tiết',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['thay hóa chất', 'hết hóa chất', 'prime', 'mồi hóa chất', 'xả khí', 'bọt khí đường ống', 'reagent volume'],
    summary: 'Các bước nạp chai hóa chất mới, cập nhật mã vạch barcode lô test và xả sạch bọt khí tích tụ trong bơm syringe vi lượng.',
    initialQuestion: 'Thay thế & Mồi hóa chất (Prime Reagents): Vui lòng chọn dòng máy cần hỗ trợ:',
    guidedOptions: [
      'Thay hóa chất máy Sinh hóa EXC200/220',
      'Thay can hóa chất máy Huyết học Z3 CRP (Diluent/Lyse)',
      'Thay dịch bao bọc máy Huyết học Z50 (Sheath/Diluent)',
      'Mồi xả bọt khí cụm bơm Syringe Hamilton vi lượng'
    ],
    branches: [
      {
        userChoice: 'Thay hóa chất máy Sinh hóa EXC200/220',
        replyText: `QUY TRÌNH THAY CHAI THUỐC THỬ SINH HÓA:
1. Vào Reagent Inventory trên phần mềm, chọn vị trí chai hóa chất cần thay (R1 hoặc R2).
2. Nhấn nút "Open Reagent Cover" để mở nắp đĩa lạnh chứa hóa chất.
3. Lấy chai cũ ra, mở nắp chai mới và đưa mã vạch barcode qua mắt đọc mã vạch tự động (hoặc nhập số lô bằng tay).
4. Đặt chai mới vào đúng ô quy định, đóng nắp đĩa lạnh.
5. Máy tự động xoay kiểm tra thể tích còn lại bằng kim cảm biến mực chất lỏng.`,
        nextQuestion: 'KTV cần xem tiếp thao tác nào?',
        nextOptions: [
          'Mồi xả bọt khí kim hút thuốc thử (Prime Reagent Probe)',
          'Chạy mẫu kiểm chuẩn QC sau khi thay hóa chất',
          'Đã hoàn tất thay thế'
        ]
      },
      {
        userChoice: 'Thay can hóa chất máy Huyết học Z3 CRP (Diluent/Lyse)',
        replyText: `QUY TRÌNH THAY CAN HÓA CHẤT HUYẾT HỌC:
1. Đeo găng tay y tế. Mở nắp can mới, tháo nắp bảo vệ màng nhôm.
2. Rút cụm phao cảm biến và ống hút từ can cũ cắm thẳng ngập đáy can mới.
3. Vặn chặt nắp ren chống bay hơi.
4. Trên phần mềm Z3, vào Reagent -> Replace Reagent -> Quét mã vạch trên nhãn can.
5. Nhấn "Prime" để máy tự động bơm hóa chất vào buồng đếm (máy chạy bơm trong 60 giây).`,
        nextQuestion: 'Sau khi Prime xong:',
        nextOptions: [
          'Chạy Background Run kiểm tra độ sạch',
          'Đường ống vẫn còn nhiều bọt khí',
          'Hoàn tất thay can hóa chất'
        ]
      },
      {
        userChoice: 'Thay dịch bao bọc máy Huyết học Z50 (Sheath/Diluent)',
        replyText: 'Sau khi thay can Sheath Reagent Z50, bắt buộc thực hiện chu trình Prime Sheath ít nhất 2 lần để đảm bảo dòng bao bọc bao quanh tế bào không bị gián đoạn bọt khí.',
        nextOptions: [
          'Kiểm tra biểu đồ tán xạ quang laser',
          'Đã sẵn sàng ca chạy'
        ]
      },
      {
        userChoice: 'Mồi xả bọt khí cụm bơm Syringe Hamilton vi lượng',
        replyText: `KỸ THUẬT XẢ BỌT KHÍ BƠM VI LƯỢNG SYRINGE:
1. Mở nắp khoang bơm pít-tông Syringe bên hông máy.
2. Quan sát ống thủy tinh pít-tông Hamilton xem có bóng khí đọng ở đỉnh vòm không.
3. Vào Maintenance -> Fluidic -> Chọn "De-bubble Syringe" (xả bọt khí).
4. Pít-tông sẽ tự động đẩy nhanh 5 chu trình hành trình tối đa để tống hết bọt khí ra cổng xả thải.`,
        nextQuestion: 'Tình trạng bóng khí trong xilanh pít-tông:',
        nextOptions: [
          'Đã hết bọt khí, buồng bơm trong suốt',
          'Vẫn còn bọt khí bám ở đầu pít-tông Teflon',
          'Yêu cầu kỹ sư ADC hỗ trợ bảo dưỡng bơm'
        ]
      }
    ]
  },

  // =========================================================================
  // 3. NHÓM KỊCH BẢN: CHUYỂN TIẾP CUỘC GỌI & ĐIỀU PHỐI KỸ SƯ TRỰC TIẾP
  // =========================================================================
  {
    id: 'flow-emergency-biosafety',
    title: 'Chuyển tiếp khẩn cấp khi phát hiện rủi ro an toàn y sinh / Phần cứng nguy hại',
    category: 'engineer_escalation',
    categoryLabel: 'Chuyển tiếp kỹ sư trực tiếp',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['cháy', 'nổ', 'rò điện', 'mùi khét', 'vỡ cuvette', 'hỏng bo mạch', 'tràn hóa chất', 'chập điện'],
    summary: 'Kích hoạt cảnh báo nguy cơ an toàn cấp độ 1, ngắt điện ngay lập tức, hiển thị Hotline trực tiếp KS. Nguyễn Quang Đạt và tạo phiếu TICK-xxxx cam kết 15 phút.',
    initialQuestion: '🚨 CẢNH BÁO AN TOÀN SINH HỌC & THIẾT BỊ CẤP ĐỘ CAO NHẤT: Phát hiện dấu hiệu nguy hại phần cứng hoặc tràn hóa chất nguy hiểm.',
    guidedOptions: [
      'Ngắt nguồn điện khẩn cấp & Gọi Kỹ sư trưởng ngay',
      'Tràn hóa chất xét nghiệm / Vỡ cuvette thủy tinh',
      'Mùi khét / Bốc khói tại cụm bo mạch nguồn',
      'Yêu cầu kỹ sư gọi lại trong 15 phút'
    ],
    branches: [
      {
        userChoice: 'Ngắt nguồn điện khẩn cấp & Gọi Kỹ sư trưởng ngay',
        replyText: `HÀNH ĐỘNG SINH TỒN THIẾT BỊ:
1. TẮT CÔNG TẮC NGUỒN VÀ RÚT NGAY PHÍCH CẮM ĐIỆN KHỎI Ổ CẮM TƯỜNG.
2. KHÔNG chạm tay trần vào thân vỏ kim loại nếu nghi ngờ rò điện.
3. Bấm nút gọi thoại trực tiếp bên dưới để nối máy ngay với KS. Nguyễn Quang Đạt (Hotline khẩn 24/7: 0988 123 456).`,
        autoEscalate: true,
        escalationReason: 'keyword_match'
      },
      {
        userChoice: 'Tràn hóa chất xét nghiệm / Vỡ cuvette thủy tinh',
        replyText: `XỬ LÝ TRÀN ĐỔ HÓA CHẤT & MẢNH VỠ THEO QUY CHUẨN AN TOÀN Y TẾ:
1. Đeo găng tay y tế chống hóa chất (nitrile) và kính bảo hộ giọt bắn.
2. Dùng kẹp y tế gắp các mảnh vỡ cuvette cho vào hộp đựng rác thải sắc nhọn màu vàng.
3. Dùng giấy thấm chuyên dụng phủ lên vùng hóa chất tràn, lau từ ngoài vào trong.
4. Trung hòa bằng dung dịch khử khuẩn trước khi lau lại bằng nước sạch.`,
        safetyWarning: 'Nguy cơ đâm xuyên và phơi nhiễm hóa chất sinh học. Tuyệt đối không dùng tay trần nhặt mảnh vỡ.',
        autoEscalate: true,
        escalationReason: 'keyword_match'
      },
      {
        userChoice: 'Mùi khét / Bốc khói tại cụm bo mạch nguồn',
        replyText: 'Cắt cầu dao điện tổng của phòng xét nghiệm nếu khói bốc nhiều. Sử dụng bình chữa cháy khí CO2 (Bình khí dành cho thiết bị điện tử y tế). Tuyệt đối không dùng bình bọt nước xịt vào máy!',
        safetyWarning: 'Nguy cơ cháy nổ chập điện. Chỉ dùng bình chữa cháy CO2.',
        autoEscalate: true,
        escalationReason: 'keyword_match'
      },
      {
        userChoice: 'Yêu cầu kỹ sư gọi lại trong 15 phút',
        replyText: 'Hệ thống đã tự động tạo Phiếu Điều Phối Ưu Tiên Số 1 (Priority: Urgent). Kỹ sư ADC cam kết phản hồi cuộc gọi trong vòng 15 phút.',
        autoEscalate: true,
        escalationReason: 'keyword_match'
      }
    ]
  },

  {
    id: 'flow-direct-engineer-call',
    title: 'Yêu cầu kết nối trực tiếp Kỹ sư trực ca ADC 24/7',
    category: 'engineer_escalation',
    categoryLabel: 'Chuyển tiếp kỹ sư trực tiếp',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['gặp kỹ sư', 'chuyển máy', 'gọi điện', 'người thật', 'tổng đài', 'kỹ thuật viên', 'hotline', 'cần hỗ trợ trực tiếp'],
    summary: 'Chuyển giao phiên hỗ trợ trực tiếp từ chatbot sang nhân viên kỹ thuật ADC với một chạm gọi điện hoặc gửi lời nhắn yêu cầu gọi lại.',
    initialQuestion: 'Quý khách muốn kết nối với Kỹ sư kỹ thuật ADC theo phương thức nào?',
    guidedOptions: [
      'Gọi điện thoại trực tiếp cho Kỹ sư trực ca',
      'Nhắn tin qua Zalo Hỗ trợ Kỹ thuật ADC',
      'Để lại số điện thoại để Kỹ sư gọi lại',
      'Xem danh sách kỹ sư theo khu vực'
    ],
    branches: [
      {
        userChoice: 'Gọi điện thoại trực tiếp cho Kỹ sư trực ca',
        replyText: 'Đã sẵn sàng kết nối. Kỹ sư trưởng trực ca 24/7 của ADC (KS. Nguyễn Quang Đạt - SĐT: 0988 123 456) đang sẵn sàng tiếp nhận cuộc gọi hỗ trợ lâm sàng.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      },
      {
        userChoice: 'Nhắn tin qua Zalo Hỗ trợ Kỹ thuật ADC',
        replyText: 'Quý khách có thể kết nối Zalo kỹ thuật ADC để gửi hình ảnh màn hình lỗi, video tiếng kêu động cơ hoặc kết quả xét nghiệm để kỹ sư chẩn đoán từ xa.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      },
      {
        userChoice: 'Để lại số điện thoại để Kỹ sư gọi lại',
        replyText: 'Vui lòng xác nhận Tên Bệnh viện và Số điện thoại bên dưới. Kỹ sư chuyên trách dòng máy sẽ liên hệ lại ngay trong vòng 15 phút.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      },
      {
        userChoice: 'Xem danh sách kỹ sư theo khu vực',
        replyText: `DANH SÁCH KỸ SƯ TRỰC BAN ADC THEO KHU VỰC:
1. KS. Nguyễn Quang Đạt - Trưởng nhóm KT (Hà Nội & Miền Bắc) - 0988 123 456
2. KS. Trần Minh Tuấn - Chuyên viên huyết học (Hải Phòng - Quảng Ninh) - 0977 456 789
3. KS. Hoàng Văn Nam - Chuyên viên miễn dịch POCT (Bắc Ninh - Bắc Giang) - 0915 234 567
4. Đ/P. Lê Thu Trang - Trung tâm Điều phối CSKH ADC 24/7 - 0966 888 999`,
        nextQuestion: 'Quý khách muốn kết nối với kỹ sư nào?',
        nextOptions: [
          'Kết nối KS. Nguyễn Quang Đạt',
          'Kết nối KS. Trần Minh Tuấn',
          'Yêu cầu Điều phối viên tiếp nhận'
        ]
      }
    ]
  },

  {
    id: 'flow-unresolved-sla',
    title: 'Điều phối khẩn cấp khi thất bại lặp lại & Đánh giá chưa hiệu quả',
    category: 'engineer_escalation',
    categoryLabel: 'Chuyển tiếp kỹ sư trực tiếp',
    targetModels: ['Tất cả dòng máy'],
    triggerKeywords: ['vẫn không được', 'vẫn lỗi', 'đã thử nhưng không chạy', 'không được', 'vẫn bị', 'chưa hiệu quả'],
    summary: 'Cơ chế tự động can thiệp khi KTV thực hiện theo SOP nhưng không thành công hoặc đánh giá chưa hiệu quả, kích hoạt hẹn giờ SLA 15 phút.',
    initialQuestion: '⚠️ Nhận thấy quy trình tự động chưa khắc phục được triệt để sự cố máy xét nghiệm của Quý khách. ADC xin lỗi vì sự bất tiện này.',
    guidedOptions: [
      'Tạo phiếu điều phối kỹ sư khẩn cấp (SLA 15 phút)',
      'Gọi điện trao đổi trực tiếp với Kỹ sư trưởng',
      'Thử lại một quy trình chẩn đoán khác',
      'Đóng yêu cầu hỗ trợ'
    ],
    branches: [
      {
        userChoice: 'Tạo phiếu điều phối kỹ sư khẩn cấp (SLA 15 phút)',
        replyText: 'Hệ thống tự động khởi tạo phiếu điều phối ưu tiên cao và kích hoạt đồng hồ đếm ngược SLA 15 phút. Kỹ sư ADC sẽ nhận thông báo đẩy tức thì trên ứng dụng quản trị.',
        autoEscalate: true,
        escalationReason: 'bot_unresolved'
      },
      {
        userChoice: 'Gọi điện trao đổi trực tiếp với Kỹ sư trưởng',
        replyText: 'Nối máy trực tiếp tới KS. Nguyễn Quang Đạt (0988 123 456). Vui lòng nhấn nút Gọi bên dưới.',
        autoEscalate: true,
        escalationReason: 'direct_request'
      },
      {
        userChoice: 'Thử lại một quy trình chẩn đoán khác',
        replyText: 'Quý khách có thể mô tả chi tiết thêm hiện tượng bất thường (tiếng kêu, mùi, mã lỗi mới xuất hiện) để chatbot tra cứu quy trình xử lý phù hợp.',
        nextQuestion: 'Quý khách muốn kiểm tra cụm nào tiếp theo?',
        nextOptions: [
          'Kiểm tra cụm hút mẫu và kim',
          'Kiểm tra cụm đo quang và buồng phản ứng',
          'Kiểm tra hóa chất và đường ống'
        ]
      },
      {
        userChoice: 'Đóng yêu cầu hỗ trợ',
        replyText: 'Cảm ơn Quý khách đã sử dụng Trợ lý Kỹ thuật AI ADC 24/7. Chúc Quý phòng xét nghiệm có một ca làm việc thuận lợi và an toàn!'
      }
    ]
  }
];

// Helper functions for matching and querying conversation flows
export function getFlowsByCategory(category?: ConversationFlowCategory): AdvancedConversationFlow[] {
  if (!category) return ADVANCED_CONVERSATION_FLOWS;
  return ADVANCED_CONVERSATION_FLOWS.filter(f => f.category === category);
}

export function findMatchingConversationFlow(
  query: string,
  model?: EquipmentModel
): AdvancedConversationFlow | null {
  if (!query || typeof query !== 'string') return null;
  const qLower = query.toLowerCase().trim();

  // First check exact ID match or error code match
  for (const flow of ADVANCED_CONVERSATION_FLOWS) {
    if (flow.triggerErrorCodes?.some(code => qLower.includes(code.toLowerCase()))) {
      if (!model || flow.targetModels.includes('Tất cả dòng máy') || flow.targetModels.includes(model)) {
        return flow;
      }
    }
  }

  // Second check keyword matches
  for (const flow of ADVANCED_CONVERSATION_FLOWS) {
    if (flow.triggerKeywords.some(kw => qLower.includes(kw.toLowerCase()))) {
      if (!model || flow.targetModels.includes('Tất cả dòng máy') || flow.targetModels.includes(model)) {
        return flow;
      }
    }
  }

  return null;
}

export function findMatchingBranch(
  flow: AdvancedConversationFlow,
  choiceOrText: string
): AdvancedConversationFlow['branches'][0] | null {
  if (!flow || !choiceOrText) return null;
  const targetLower = choiceOrText.toLowerCase().trim();

  // Exact match
  const exact = flow.branches.find(b => b.userChoice.toLowerCase().trim() === targetLower);
  if (exact) return exact;

  // Substring match
  const partial = flow.branches.find(b => 
    targetLower.includes(b.userChoice.toLowerCase().trim()) || 
    b.userChoice.toLowerCase().trim().includes(targetLower)
  );
  return partial || null;
}
