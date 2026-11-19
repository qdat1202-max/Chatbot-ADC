import { 
  EngineerProfile, 
  EquipmentModel, 
  SystemSettings, 
  SmartForwardingRuleReason,
  ChatCallForwardingInfo,
  SmartForwardingRulesConfig,
  SOPArticle
} from '../types';

export interface EvaluationParams {
  userQuery: string;
  equipmentModel: EquipmentModel;
  matchedSOP?: SOPArticle | null;
  consecutiveUnresolvedCount?: number;
  isDirectActionClick?: boolean;
  isUnhelpfulFeedbackTrigger?: boolean;
  settings: SystemSettings;
  engineers: EngineerProfile[];
}

export interface ForwardingEvaluationResult {
  shouldForward: boolean;
  reason: SmartForwardingRuleReason;
  reasonLabel: string;
  matchedRuleText: string;
  priority: 'urgent' | 'normal';
  suggestHandoverPrompt: string;
  assignedEngineer: EngineerProfile;
  routingStrategy: 'specialist' | 'duty_engineer' | 'coordinator';
  strategyExplanation: string;
}

/**
 * Normalizes text for fast, accent-insensitive and lowercase matching
 */
function normalizeQuery(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Selects the optimal support engineer based on real-time availability and routing rules
 */
export function selectBestAvailableEngineer(
  engineers: EngineerProfile[],
  model: EquipmentModel,
  settings: SystemSettings
): {
  engineer: EngineerProfile;
  strategy: 'specialist' | 'duty_engineer' | 'coordinator';
  strategyExplanation: string;
} {
  const rules = settings.smartForwardingRules;
  const pref = rules?.routingPreference || 'specialist_first';
  const dutyName = settings.dutyEngineerName || 'Nguyễn Quang Đạt';

  // 1. Separate engineers by real-time status
  const availableEngineers = engineers.filter(e => e.status === 'available');
  const allEngineers = engineers.length > 0 ? engineers : [];

  // Helper to find duty engineer
  const dutyEng = allEngineers.find(e => e.name.toLowerCase().includes(dutyName.toLowerCase()));

  // STRATEGY: Specialist First (Default & Recommended for Medical Equipment)
  if (pref === 'specialist_first') {
    // Look for available specialist for this specific machine model
    const availableSpecialists = availableEngineers.filter(e => 
      e.specialties && e.specialties.includes(model)
    );

    if (availableSpecialists.length > 0) {
      // Pick specialist with lowest active tickets count (least loaded)
      const sorted = [...availableSpecialists].sort((a, b) => (a.activeTicketsCount || 0) - (b.activeTicketsCount || 0));
      const chosen = sorted[0];
      return {
        engineer: chosen,
        strategy: 'specialist',
        strategyExplanation: `Kỹ sư chuyên trách dòng máy ${model} đang sẵn sàng trực chiến (${chosen.name} - ${chosen.area})`
      };
    }

    // If no available specialist, check if duty engineer is available
    if (dutyEng && dutyEng.status === 'available') {
      return {
        engineer: dutyEng,
        strategy: 'duty_engineer',
        strategyExplanation: `Kỹ sư trưởng trực ca 24/7 toàn hệ thống (${dutyEng.name})`
      };
    }

    // If any available engineer exists
    if (availableEngineers.length > 0) {
      const sorted = [...availableEngineers].sort((a, b) => (a.activeTicketsCount || 0) - (b.activeTicketsCount || 0));
      const chosen = sorted[0];
      return {
        engineer: chosen,
        strategy: 'specialist',
        strategyExplanation: `Kỹ sư hiện trường đang sẵn sàng tiếp nhận (${chosen.name} - ${chosen.area})`
      };
    }
  }

  // STRATEGY: Duty Engineer First
  if (pref === 'duty_engineer_first') {
    if (dutyEng) {
      return {
        engineer: dutyEng,
        strategy: 'duty_engineer',
        strategyExplanation: `Ưu tiên kết nối trực tiếp Kỹ sư trưởng trực ban 24/7 (${dutyEng.name})`
      };
    }
  }

  // STRATEGY: Coordinator / CSS First
  if (pref === 'coordinator_first') {
    const coordinator = availableEngineers.find(e => e.role === 'css');
    if (coordinator) {
      return {
        engineer: coordinator,
        strategy: 'coordinator',
        strategyExplanation: `Phòng CSS ADC sẵn sàng hỗ trợ (${coordinator.name})`
      };
    }
  }

  // Fallback: If all engineers are currently on-site or off-duty, connect to duty engineer or primary engineer profile
  if (dutyEng) {
    return {
      engineer: dutyEng,
      strategy: 'duty_engineer',
      strategyExplanation: `Kỹ sư trưởng trực ca 24/7 ADC (${dutyEng.name} - Hotline khẩn: ${settings.dutyEngineerPhone || dutyEng.phone})`
    };
  }

  const fallbackEngineer: EngineerProfile = allEngineers[0] || {
    id: 'ENG-DUTY',
    name: settings.dutyEngineerName || 'Kỹ sư Trực Ban ADC',
    role: 'field_engineer',
    phone: settings.dutyEngineerPhone || settings.hotline || '0988 123 456',
    email: 'kythuat@adctbyt.vn',
    status: 'available',
    activeTicketsCount: 1,
    area: 'Hà Nội & Toàn quốc',
    specialties: [model]
  };

  return {
    engineer: fallbackEngineer,
    strategy: 'duty_engineer',
    strategyExplanation: `Kỹ sư điều phối kỹ thuật ADC (${fallbackEngineer.name})`
  };
}

/**
 * Core Rule Evaluation Engine to determine whether to escalate/forward call
 */
export function evaluateForwardingRules(params: EvaluationParams): ForwardingEvaluationResult | null {
  const {
    userQuery,
    equipmentModel,
    matchedSOP,
    consecutiveUnresolvedCount = 0,
    isDirectActionClick = false,
    isUnhelpfulFeedbackTrigger = false,
    settings,
    engineers
  } = params;

  const rules: SmartForwardingRulesConfig = settings.smartForwardingRules || {
    enabled: true,
    directRequestKeywords: [
      'gặp kỹ sư', 'chuyển máy', 'gọi điện', 'người thật', 'tổng đài',
      'kỹ thuật viên', 'nói chuyện trực tiếp', 'hotline', 'cần hỗ trợ trực tiếp',
      'gặp nhân viên', 'chuyển tiếp cuộc gọi', 'gọi cho tôi'
    ],
    criticalKeywords: [
      'cháy', 'nổ', 'rò điện', 'mùi khét', 'vỡ cuvette', 'hỏng bo mạch',
      'lệch laser', 'khẩn cấp', 'dừng máy hoàn toàn', 'tràn hóa chất', 'chập điện', 'hỏng nặng'
    ],
    maxUnresolvedAttempts: 2,
    autoForwardOnUnhelpfulFeedback: true,
    routingPreference: 'specialist_first',
    autoCreateTicketOnCall: true
  };

  if (!rules.enabled) {
    return null;
  }

  const rawLower = (userQuery || '').toLowerCase();
  const normalized = normalizeQuery(userQuery);

  const bestEngineerResult = selectBestAvailableEngineer(engineers, equipmentModel, settings);

  // 1. RULE 1: Direct Customer Action or Explicit Keyword Request
  if (isDirectActionClick) {
    return {
      shouldForward: true,
      reason: 'direct_request',
      reasonLabel: 'Yêu cầu trực tiếp từ khách hàng',
      matchedRuleText: 'Khách hàng nhấn nút yêu cầu chuyển tiếp cuộc gọi tới Kỹ sư',
      priority: 'normal',
      suggestHandoverPrompt: `Đã kết nối trực tiếp với ${bestEngineerResult.engineer.name}. Bạn có thể gọi thoại ngay hoặc để lại lời nhắn để kỹ sư gọi lại.`,
      assignedEngineer: bestEngineerResult.engineer,
      routingStrategy: bestEngineerResult.strategy,
      strategyExplanation: bestEngineerResult.strategyExplanation
    };
  }

  for (const kw of rules.directRequestKeywords) {
    const normKw = normalizeQuery(kw);
    if (rawLower.includes(kw.toLowerCase()) || normalized.includes(normKw)) {
      return {
        shouldForward: true,
        reason: 'direct_request',
        reasonLabel: 'Khách hàng yêu cầu gặp nhân viên / kỹ sư',
        matchedRuleText: `Phát hiện từ khóa yêu cầu chuyển cuộc gọi: "${kw}"`,
        priority: 'normal',
        suggestHandoverPrompt: `Dạ em hiểu Quý khách muốn trao đổi trực tiếp với nhân viên kỹ thuật. Em đã chuyển tiếp ngay phiên hỗ trợ tới ${bestEngineerResult.engineer.name}.`,
        assignedEngineer: bestEngineerResult.engineer,
        routingStrategy: bestEngineerResult.strategy,
        strategyExplanation: bestEngineerResult.strategyExplanation
      };
    }
  }

  // 2. RULE 2: Critical Severity & Emergency Hardware Failure
  for (const cKw of rules.criticalKeywords) {
    const normCKw = normalizeQuery(cKw);
    if (rawLower.includes(cKw.toLowerCase()) || normalized.includes(normCKw)) {
      return {
        shouldForward: true,
        reason: 'keyword_match',
        reasonLabel: 'Sự cố phần cứng nghiêm trọng & Khẩn cấp',
        matchedRuleText: `Cảnh báo an toàn kỹ thuật: Phát hiện dấu hiệu sự cố nguy hại "${cKw}"`,
        priority: 'urgent',
        suggestHandoverPrompt: `CẢNH BÁO NGUY HẠI: Máy xuất hiện tình trạng "${cKw}". Chatbot khuyến nghị dừng vận hành khẩn cấp và đã ưu tiên chuyển cuộc gọi ngay cho Kỹ sư trưởng ADC.`,
        assignedEngineer: bestEngineerResult.engineer,
        routingStrategy: bestEngineerResult.strategy,
        strategyExplanation: bestEngineerResult.strategyExplanation
      };
    }
  }

  // 3. RULE 3: Unhelpful Feedback Trigger
  if (isUnhelpfulFeedbackTrigger && rules.autoForwardOnUnhelpfulFeedback) {
    return {
      shouldForward: true,
      reason: 'unhelpful_feedback',
      reasonLabel: 'Giải pháp tự động chưa giải quyết được sự cố',
      matchedRuleText: 'Khách hàng đánh giá hướng dẫn chưa hiệu quả và cần kỹ sư hỗ trợ chuyên sâu',
      priority: 'normal',
      suggestHandoverPrompt: `Dạ rất xin lỗi vì quy trình tự động chưa khắc phục được triệt để sự cố. Em đã chuyển tiếp thông tin tới ${bestEngineerResult.engineer.name} để hỗ trợ xử lý trực tiếp.`,
      assignedEngineer: bestEngineerResult.engineer,
      routingStrategy: bestEngineerResult.strategy,
      strategyExplanation: bestEngineerResult.strategyExplanation
    };
  }

  // 4. RULE 4: Multi-clause High Complexity Question
  const isLengthy = userQuery.length > 150;
  const complexMarkers = [
    'chập chờn', 'nhiều lần', 'kết quả sai lệch toàn bộ', 'đã thay nhưng không được',
    'báo lỗi liên tục', 'kẹt cơ khí và mất kết nối', 'mùi lạ', 'áp suất tụt sâu',
    'khay và kim', 'cả hai kênh', 'sai số lớn'
  ];
  const matchedComplexCount = complexMarkers.filter(m => rawLower.includes(m) || normalized.includes(normalizeQuery(m))).length;
  
  if (isLengthy && matchedComplexCount >= 2 && !matchedSOP) {
    return {
      shouldForward: true,
      reason: 'high_complexity',
      reasonLabel: 'Mức độ phức tạp kỹ thuật cao vượt ngưỡng AI',
      matchedRuleText: `Câu hỏi chứa ${matchedComplexCount} triệu chứng kết hợp và độ dài ${userQuery.length} ký tự chưa có SOP đơn lẻ khớp hoàn toàn`,
      priority: 'urgent',
      suggestHandoverPrompt: `Sự cố trên máy ${equipmentModel} có tính chất phức tạp đa cụm. Em đã chuyển tiếp toàn bộ chẩn đoán này tới Kỹ sư chuyên trách để phân tích trực tiếp.`,
      assignedEngineer: bestEngineerResult.engineer,
      routingStrategy: bestEngineerResult.strategy,
      strategyExplanation: bestEngineerResult.strategyExplanation
    };
  }

  // 5. RULE 5: Repeated Unresolved Bot Inability
  const maxAttempts = rules.maxUnresolvedAttempts || 2;
  const frustrationPhrases = ['vẫn không được', 'vẫn lỗi', 'đã thử nhưng không chạy', 'không được', 'vẫn bị'];
  const hasFrustration = frustrationPhrases.some(f => rawLower.includes(f) || normalized.includes(normalizeQuery(f)));

  if (!matchedSOP && (consecutiveUnresolvedCount >= maxAttempts || hasFrustration)) {
    return {
      shouldForward: true,
      reason: 'bot_unresolved',
      reasonLabel: 'Chatbot không thể giải quyết sau nhiều lần thử',
      matchedRuleText: hasFrustration 
        ? 'Khách hàng phản hồi thao tác theo hướng dẫn nhưng máy vẫn báo lỗi' 
        : `Không tìm thấy SOP phù hợp sau ${consecutiveUnresolvedCount} lượt hỏi liên tiếp`,
      priority: 'normal',
      suggestHandoverPrompt: `Chatbot nhận thấy vấn đề vẫn chưa được khắc phục triệt để. Để không gián đoạn ca chạy mẫu bệnh viện, em đã chuyển tiếp ngay phiên hỗ trợ cho Kỹ sư trực ADC.`,
      assignedEngineer: bestEngineerResult.engineer,
      routingStrategy: bestEngineerResult.strategy,
      strategyExplanation: bestEngineerResult.strategyExplanation
    };
  }

  return null;
}

/**
 * Builds ChatCallForwardingInfo object ready to be attached to a ChatMessage
 */
export function buildCallForwardingInfo(
  evalResult: ForwardingEvaluationResult,
  callbackPhone?: string,
  hospitalClinic?: string
): ChatCallForwardingInfo {
  return {
    triggerReason: evalResult.reason,
    triggerReasonLabel: evalResult.reasonLabel,
    matchedRuleText: evalResult.matchedRuleText,
    assignedEngineer: evalResult.assignedEngineer,
    routingStrategy: evalResult.routingStrategy,
    strategyExplanation: evalResult.strategyExplanation,
    timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    callStatus: 'initiated',
    callbackPhone,
    hospitalClinic
  };
}
