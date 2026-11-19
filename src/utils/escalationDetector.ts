import { EquipmentModel, SOPArticle, EscalationTriggerType, ChatEscalationCard } from '../types';

// Các từ khóa sự cố phần cứng & an toàn y sinh nghiêm trọng
export const HARDWARE_EMERGENCY_KEYWORDS = [
  'cháy',
  'nổ',
  'rò điện',
  'mùi khét',
  'vỡ cuvette',
  'hỏng bo mạch',
  'tràn hóa chất',
  // Biến thể tự nhiên thực tế tại phòng xét nghiệm
  'chập điện',
  'bốc khói',
  'vỡ cuvet',
  'rò rỉ điện',
  'mùi cháy',
  'tràn dung dịch',
  'chập cháy',
  'cháy nổ',
  'nổ tụ',
  'giật điện',
  'cháy bo',
  'hỏng mainboard',
  'bể cuvette'
];

// Khuyến cáo an toàn y sinh khẩn cấp khi phát hiện keyword_match
export const BIOSAFETY_EMERGENCY_ALERTS = [
  'NGẮT NGUỒN ĐIỆN NGAY: Tắt công tắc nguồn chính (Power Switch) hoặc rút phích cắm điện máy xét nghiệm ngay lập tức.',
  'CÁCH LY THIẾT BỊ: Dán biển cảnh báo tạm ngưng ca máy, không để nhân viên khác tiếp cận gần khu vực sự cố.',
  'BẢO HỘ Y SINH: Mang găng tay nitrile, khẩu trang, kính chắn giọt bắn nếu có tràn hóa chất tẩy rửa / dịch sinh học hoặc mảnh vỡ thủy tinh cuvette.',
  'TUYỆT ĐỐI KHÔNG BẬT LẠI MÁY: Tránh hiện tượng đoản mạch lan rộng phá hỏng các bo mạch chính (Main Board, Driver Board) hoặc gây nguy cơ hỏa hoạn.'
];

// Cụm từ khách hàng phản hồi không khắc phục được sau khi thử các bước
export const UNRESOLVED_FEEDBACK_PHRASES = [
  'không khắc phục được',
  'vẫn không được',
  'vẫn bị',
  'vẫn lỗi',
  'vẫn còn lỗi',
  'đã thử nhưng không được',
  'không giải quyết được',
  'chưa chạy được',
  'thử rồi vẫn lỗi',
  'vẫn báo lỗi cũ',
  'không hết lỗi',
  'làm theo nhưng không được',
  'thử các bước rồi vẫn',
  'thử hết cách',
  'chưa được',
  'vẫn kẹt',
  'vẫn tràn',
  'làm y như vậy mà không được'
];

/**
 * 1. Kiểm tra sự cố phần cứng khẩn cấp (keyword_match)
 */
export function checkEmergencyKeywordMatch(text: string): {
  isEmergency: boolean;
  matchedKeywords: string[];
  safetyAlerts: string[];
} {
  const lower = (text || '').toLowerCase();
  const matched = HARDWARE_EMERGENCY_KEYWORDS.filter(kw => lower.includes(kw));

  return {
    isEmergency: matched.length > 0,
    matchedKeywords: matched,
    safetyAlerts: matched.length > 0 ? BIOSAFETY_EMERGENCY_ALERTS : []
  };
}

/**
 * 2. Kiểm tra phản hồi chưa khắc phục được của người dùng (bot_unresolved condition B)
 */
export function checkCustomerUnresolvedPhrase(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return UNRESOLVED_FEEDBACK_PHRASES.some(phrase => lower.includes(phrase));
}

/**
 * 3. Kiểm tra mức độ phức tạp cao (high_complexity)
 * Mô tả dài, chứa nhiều triệu chứng kết hợp mà không khớp một quy trình SOP đơn lẻ
 */
export function checkHighComplexity(
  text: string,
  matchedSOP: SOPArticle | undefined,
  availableSOPs: SOPArticle[]
): {
  isHighComplexity: boolean;
  reasons: string[];
  detectedSymptomGroups: string[];
} {
  const lower = (text || '').toLowerCase().trim();
  const reasons: string[] = [];
  const detectedSymptomGroups: string[] = [];

  // Định nghĩa các nhóm triệu chứng kỹ thuật
  const symptomGroups = [
    {
      group: 'Cơ khí & Kim hút',
      keywords: ['kim hút', 'kẹt kim', 'cong kim', 'motor', 'dây curoa', 'trục z', 'trục x', 'cánh tay kim']
    },
    {
      group: 'Hóa chất & Buồng đếm / Đường ống',
      keywords: ['buồng đếm', 'aperture', 'clot', 'máu đông', 'lyse', 'diluent', 'tràn nước', 'bơm xả', 'tắc ống', 'áp lực âm', 'bơm hút']
    },
    {
      group: 'Quang học & Cảm biến / Đèn đo',
      keywords: ['đèn halogen', 'photometer', 'hấp thụ quang', 'laser', 'cảm biến', 'gain', 'dark current', 'crp huỳnh quang', 'bước sóng']
    },
    {
      group: 'Nhiệt độ & Nguồn điện / Bo mạch',
      keywords: ['nhiệt độ', '37 độ', 'ủ ấm', 'nguồn điện', 'quá nhiệt', 'chập chờn điện áp', 'mainboard']
    },
    {
      group: 'Phần mềm & Kết nối LIS / Truyền số liệu',
      keywords: ['lis', 'his', 'mất mạng', 'cổng com', 'không đẩy kết quả', 'treo phần mềm']
    }
  ];

  // Phát hiện các nhóm triệu chứng có mặt trong câu hỏi
  symptomGroups.forEach(sg => {
    const hits = sg.keywords.filter(kw => lower.includes(kw));
    if (hits.length > 0) {
      detectedSymptomGroups.push(sg.group);
    }
  });

  // Điều kiện kích hoạt high_complexity:
  // 1. Độ dài mô tả đáng kể (> 70 ký tự hoặc có dấu phẩy/chấm kết hợp nhiều ý)
  // 2. Chứa từ 2 nhóm triệu chứng khác nhau HOẶC chứa nhiều triệu chứng đồng thời (như "vừa... vừa...", "đồng thời", "cả hai")
  // 3. Không có một SOP đơn lẻ nào giải quyết bao quát trọn vẹn
  const hasMultipleGroups = detectedSymptomGroups.length >= 2;
  const hasMultipleConjunctions = /đồng thời|kèm theo|vừa bị|cả hai|cùng lúc|kết hợp/i.test(lower);
  const isLengthy = lower.length >= 70;

  if (isLengthy && (hasMultipleGroups || hasMultipleConjunctions) && !matchedSOP) {
    reasons.push(`Mô tả chi tiết đa triệu chứng liên nhóm (${detectedSymptomGroups.join(', ')})`);
    reasons.push('Không khớp quy trình chuẩn SOP đơn lẻ nào trong cơ sở tri thức.');
    return {
      isHighComplexity: true,
      reasons,
      detectedSymptomGroups
    };
  }

  // Trường hợp có khớp SOP nhưng câu hỏi chứa thêm nhiều lỗi của nhóm khác mà SOP đó không chứa
  if (isLengthy && hasMultipleGroups && matchedSOP) {
    const otherGroups = detectedSymptomGroups.filter(g => !matchedSOP.category.includes(g));
    if (otherGroups.length >= 2) {
      reasons.push(`Sự cố phức tạp vượt ngoài phạm vi SOP [${matchedSOP.errorCode}], xuất hiện thêm triệu chứng: ${otherGroups.join(', ')}`);
      return {
        isHighComplexity: true,
        reasons,
        detectedSymptomGroups
      };
    }
  }

  return {
    isHighComplexity: false,
    reasons: [],
    detectedSymptomGroups
  };
}

/**
 * Tạo dữ liệu thẻ điều phối (Escalation Card) theo đúng lý do kích hoạt
 */
export function buildEscalationCard(
  type: EscalationTriggerType,
  equipmentModel: EquipmentModel,
  userText: string,
  extra?: {
    unresolvedCount?: number;
    safetyAlerts?: string[];
    errorCode?: string;
  }
): ChatEscalationCard {
  const commitmentMinutes = 15; // Cam kết phản hồi trong vòng 15 phút

  switch (type) {
    case 'keyword_match':
      return {
        type,
        title: 'CẢNH BÁO AN TOÀN Y SINH & SỰ CỐ PHẦN CỨNG KHẨN CẤP',
        description: 'Hệ thống đã phát hiện từ khóa nguy hiểm phần cứng/an toàn sinh học trong thông điệp. Quy trình hỏi đáp thông thường được ngắt lập tức để bảo vệ an toàn cho kỹ thuật viên và máy xét nghiệm.',
        safetyAlerts: extra?.safetyAlerts || BIOSAFETY_EMERGENCY_ALERTS,
        commitmentMinutes,
        prefillData: {
          issueDescription: `[SỰ CỐ KHẨN CẤP] ${userText}`,
          errorCode: extra?.errorCode
        }
      };

    case 'high_complexity':
      return {
        type,
        title: 'ĐIỀU PHỐI KỸ THUẬT: SỰ CỐ ĐA TRIỆU CHỨNG PHỨC TẠP CAO',
        description: 'Mô tả chứa nhiều triệu chứng kỹ thuật kết hợp không thuộc một quy trình SOP đơn lẻ. Chatbot chuyển tiếp tự động sang Kỹ sư chuyên sâu ADC để tránh thao tác can thiệp sai tại phòng xét nghiệm.',
        safetyAlerts: [
          'Không tự ý tháo mở bo mạch hoặc nắn chỉnh cơ học khi chưa có hướng dẫn trực tiếp từ Kỹ sư ADC.',
          'Ghi nhận lại toàn bộ mã lỗi hiển thị trên màn hình máy xét nghiệm.'
        ],
        commitmentMinutes,
        prefillData: {
          issueDescription: `[PHỨC TẠP CAO - ĐA TRIỆU CHỨNG] ${userText}`,
          errorCode: extra?.errorCode
        }
      };

    case 'bot_unresolved':
      return {
        type,
        title: 'ĐIỀU PHỐI KỸ THUẬT: CHATBOT CHƯA GIẢI QUYẾT ĐƯỢC',
        description: extra?.unresolvedCount && extra.unresolvedCount >= 2
          ? `Hệ thống không tìm thấy quy trình SOP phù hợp sau ${extra.unresolvedCount} lần tra cứu liên tiếp. Tự động chuyển tiếp kỹ sư điều phối ưu tiên cao.`
          : 'Ghi nhận phản hồi không khắc phục được sau khi thử các bước hướng dẫn. Chuyển tiếp kỹ sư ADC hỗ trợ trực tiếp.',
        commitmentMinutes,
        prefillData: {
          issueDescription: `[CHƯA KHẮC PHỤC ĐƯỢC] ${userText}`,
          errorCode: extra?.errorCode
        }
      };

    case 'unhelpful_feedback':
      return {
        type,
        title: 'ĐIỀU PHỐI ƯU TIÊN CAO: ĐÁNH GIÁ CHƯA HIỆU QUẢ',
        description: 'Quý khách vừa đánh giá hướng dẫn chưa hiệu quả. Hệ thống kích hoạt ngay phiếu điều phối ưu tiên cao để Kỹ sư ADC gọi lại hỗ trợ kịp thời ca trực.',
        commitmentMinutes,
        prefillData: {
          issueDescription: `[ĐÁNH GIÁ CHƯA HIỆU QUẢ] ${userText}`,
          errorCode: extra?.errorCode
        }
      };

    case 'direct_request':
      return {
        type,
        title: 'YÊU CẦU KẾT NỐI KỸ SƯ TRỰC CA ADC 24/7',
        description: 'Đã chuyển tiếp phiên hỗ trợ tới Kỹ sư chuyên trách ADC theo yêu cầu của Quý khách. Cam kết phản hồi và gọi lại trong 15 phút.',
        commitmentMinutes,
        prefillData: {
          issueDescription: `[YÊU CẦU GỌI TRỰC TIẾP] ${userText}`,
          errorCode: extra?.errorCode
        }
      };

    default:
      return {
        type: 'manual',
        title: 'YÊU CẦU ĐIỀU PHỐI KỸ SƯ HỖ TRỢ TRỰC TIẾP',
        description: 'Hỗ trợ kỹ thuật trực tiếp từ đội ngũ Kỹ sư Thiết bị Y tế ADC.',
        commitmentMinutes,
        prefillData: {
          issueDescription: userText,
          errorCode: extra?.errorCode
        }
      };
  }
}
