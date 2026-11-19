import { EquipmentModel, IssueNatureType, NLPClassification, ChatbotSessionRecord, ChatbotPerformanceStats } from '../types';

export const ISSUE_NATURE_CONFIG: Record<IssueNatureType, { label: string; color: string; bg: string; border: string; desc: string }> = {
  hardware: {
    label: 'Phần cứng & Cơ khí',
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Kim hút mẫu/thuốc thử, motor bước, bơm tiêm, van điện từ, đĩa phản ứng, trạm rửa'
  },
  software_lis: {
    label: 'Phần mềm & Kết nối LIS',
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    desc: 'Cổng truyền thông COM/LAN, giao thức HL7/ASTM kết nối phần mềm bệnh viện LIS/HIS'
  },
  reagents_cuvette: {
    label: 'Hóa chất & Buồng đếm',
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    desc: 'Hao hụt hóa chất, buồng phản ứng, cuvette bẩn, tủa protein, nghẽn đường ống fluidic'
  },
  optics_sensor: {
    label: 'Quang học & Cảm biến',
    color: 'text-cyan-800',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    desc: 'Đèn Halogen/LED nguồn, kính lọc bước sóng, photometer, đầu đọc barcode, cảm biến tiệm cận'
  },
  user_guide: {
    label: 'Hướng dẫn vận hành & Hỏi đáp',
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Quy trình chạy mẫu kiểm chuẩn QC, mẫu trắng Blank, bảo dưỡng đầu ca/cuối ca'
  }
};

export interface ModelFaultDefinition {
  code: string;
  name: string;
  category: string;
  model: EquipmentModel;
  keywords: string[];
  severity: 'Khẩn cấp' | 'Cảnh báo' | 'Thông thường';
  desc: string;
}

export const MODEL_FAULTS_CATALOG: Record<EquipmentModel, ModelFaultDefinition[]> = {
  'Zybio EXC200/220': [
    {
      code: 'E101',
      name: 'Va chạm & kẹt kim hút mẫu/thuốc thử',
      category: 'Cơ khí & Kim hút',
      model: 'Zybio EXC200/220',
      keywords: ['e101', 'kim hút', 'va chạm', 'cong kim', 'kẹt kim', 'motor trục z', 'sample probe', 'nghẽn kim'],
      severity: 'Khẩn cấp',
      desc: 'Kim hút mẫu/hóa chất va chạm cơ cấu đĩa mẫu hoặc nghẽn fibrin/máu đông'
    },
    {
      code: 'E205',
      name: 'Tràn nước trạm rửa cuvette & nghẹt xả',
      category: 'Hóa chất & Buồng đếm',
      model: 'Zybio EXC200/220',
      keywords: ['e205', 'tràn nước', 'trạm rửa', 'cuvette', 'nước rửa', 'bơm xả', 'tắc ống', 'muối photphat'],
      severity: 'Cảnh báo',
      desc: 'Nước rửa tràn lênh láng trạm rửa do tắc đường ống thoát muối photphat'
    },
    {
      code: 'E301',
      name: 'Lệch nhiệt độ ủ 37°C & đèn Halogen',
      category: 'Quang học & Cảm biến',
      model: 'Zybio EXC200/220',
      keywords: ['e301', 'nhiệt độ', '37 độ', 'ủ ấm', 'đèn halogen', 'photometer', 'hấp thụ quang'],
      severity: 'Cảnh báo',
      desc: 'Nhiệt độ đĩa ủ phản ứng dao động ngoài dải 37°C ± 0.1°C hoặc bóng đèn quang học suy hao'
    },
    {
      code: 'LIS-EXC',
      name: 'Mất tín hiệu truyền mạng LIS/HIS',
      category: 'Phần mềm & Kết nối LIS',
      model: 'Zybio EXC200/220',
      keywords: ['lis', 'his', 'mất mạng', 'cổng com', 'hl7', 'astm', 'không đẩy kết quả', 'truyền số liệu'],
      severity: 'Thông thường',
      desc: 'Giao thức truyền thông hai chiều ASTM/HL7 bị ngắt kết nối với máy chủ bệnh viện'
    },
    {
      code: 'QC-EXC',
      name: 'Lệch kiểm chuẩn Calib/QC sinh hóa',
      category: 'Hướng dẫn vận hành & Hỏi đáp',
      model: 'Zybio EXC200/220',
      keywords: ['calib', 'qc', 'kiểm chuẩn', 'westgard', 'mẫu trắng', 'blank', 'cuvette blank', 'vệ sinh'],
      severity: 'Thông thường',
      desc: 'Kết quả nội kiểm sinh hóa trôi dạt 2SD, cần chạy lại blank cuvette và calib hóa chất'
    }
  ],
  'Zybio Z3 CRP': [
    {
      code: 'H101',
      name: 'Nghẽn lỗ đếm vi mô sapphire WBC/RBC',
      category: 'Hóa chất & Buồng đếm',
      model: 'Zybio Z3 CRP',
      keywords: ['h101', 'h102', 'lỗ đếm', 'aperture', 'buồng đếm', 'sapphire', 'wbc', 'rbc', 'clot', 'máu đông'],
      severity: 'Khẩn cấp',
      desc: 'Nghẽn khẩu độ vi mô sapphire do clot mẫu máu toàn phần, không đo được tế bào'
    },
    {
      code: 'H204',
      name: 'Rò rỉ van áp lực âm & bơm hút lyse',
      category: 'Phần cứng & Cơ khí',
      model: 'Zybio Z3 CRP',
      keywords: ['h204', 'van áp lực', 'rò rỉ nước', 'bơm hút', 'kêu tít tít', 'áp lực âm', 'lyse', 'van điện từ'],
      severity: 'Khẩn cấp',
      desc: 'Hở gioăng van điện từ 3 ngả hoặc suy hao công suất bơm chân không thể tích'
    },
    {
      code: 'H301',
      name: 'Hao hụt thuốc thử & lệch đo huỳnh quang CRP',
      category: 'Quang học & Cảm biến',
      model: 'Zybio Z3 CRP',
      keywords: ['h301', 'crp', 'thuốc thử crp', 'bọt khí crp', 'đo quang crp', 'lyse crp'],
      severity: 'Cảnh báo',
      desc: 'Bọt khí đường dẫn kháng thể CRP hoặc suy giảm độ tuyến tính kênh miễn dịch đo độ đục'
    },
    {
      code: 'LIS-Z3',
      name: 'Lỗi gửi biểu đồ hồng cầu/bạch cầu lên LIS',
      category: 'Phần mềm & Kết nối LIS',
      model: 'Zybio Z3 CRP',
      keywords: ['lis', 'biểu đồ', 'histogram', 'truyền số liệu', 'kết nối máy tính'],
      severity: 'Thông thường',
      desc: 'Số lượng tế bào gửi thành công nhưng biểu đồ phân bố kích thước tế bào bị gián đoạn'
    }
  ],
  'Zybio Z50': [
    {
      code: 'Z501',
      name: 'Bọt khí buồng đếm dòng tế bào laser 5TP',
      category: 'Quang học & Cảm biến',
      model: 'Zybio Z50',
      keywords: ['z501', 'laser', 'buồng đếm dòng', 'flow cell', 'bọt khí', 'tán xạ', '5 thành phần'],
      severity: 'Khẩn cấp',
      desc: 'Bọt khí vi mô buồng đếm dòng tế bào laser (Flow cell) gây nhiễu biểu đồ Scattergram'
    },
    {
      code: 'Z502',
      name: 'Mất áp suất chân không & bơm syringe rò',
      category: 'Phần cứng & Cơ khí',
      model: 'Zybio Z50',
      keywords: ['z502', 'bơm syringe', 'áp suất chân không', 'piston', 'áp lực', 'kêu rít'],
      severity: 'Cảnh báo',
      desc: 'Bơm syringe định lượng mẫu bị xước gioăng teflon dẫn đến hụt áp chân không'
    },
    {
      code: 'Z503',
      name: 'Suy hao công suất nguồn diode laser quang học',
      category: 'Quang học & Cảm biến',
      model: 'Zybio Z50',
      keywords: ['z503', 'diode laser', 'nguồn laser', 'công suất quang', 'scattergram mờ'],
      severity: 'Cảnh báo',
      desc: 'Nhiệt độ diode laser tăng cao, công suất phát quang suy giảm cần hiệu chỉnh dòng kích'
    },
    {
      code: 'DIFF-ERR',
      name: 'Lỗi phân tách quần thể bạch cầu Scattergram',
      category: 'Hướng dẫn vận hành & Hỏi đáp',
      model: 'Zybio Z50',
      keywords: ['diff', 'bạch cầu', 'neutrophil', 'lympho', 'eosinophil', 'baso', 'mono', 'scattergram'],
      severity: 'Thông thường',
      desc: 'Quần thể tế bào đè lên nhau do nhiệt độ ủ lyse chưa đạt chuẩn 35°C'
    }
  ],
  'FS-205': [
    {
      code: 'FS101',
      name: 'Kẹt khay nạp thẻ test',
      category: 'Phần cứng & Cơ khí',
      model: 'FS-205',
      keywords: ['fs101', 'kẹt khay', 'cassette', 'thẻ test', 'dây curoa', 'khay nạp', 'motor trượt'],
      severity: 'Khẩn cấp',
      desc: 'Khay nạp thẻ cassette kẹt cơ học do trượt răng dây curoa mini hoặc kẹt dị vật'
    },
    {
      code: 'FS-BAR-01',
      name: 'Lỗi đầu đọc quang không nhận barcode thẻ chíp',
      category: 'Quang học & Cảm biến',
      model: 'FS-205',
      keywords: ['fs-bar-01', 'barcode', 'mã vạch', 'đầu đọc quang', 'quét thẻ', 'thẻ chip', 'không nhận test'],
      severity: 'Cảnh báo',
      desc: 'Bụi bẩn bám trên thấu kính đầu đọc quang barcode khiến máy từ chối đọc thông tin lô test'
    },
    {
      code: 'FS-CAL-01',
      name: 'Lỗi đọc thẻ nhớ hiệu chuẩn lô mới (ID Card)',
      category: 'Hướng dẫn vận hành & Hỏi đáp',
      model: 'FS-205',
      keywords: ['id card', 'thẻ calib', 'hiệu chuẩn lô', 'hạn dùng test'],
      severity: 'Thông thường',
      desc: 'Không đồng bộ được hệ số đường cong chuẩn từ IC Card của hộp hóa chất mới'
    }
  ]
};

const NATURE_KEYWORDS: Record<IssueNatureType, string[]> = {
  hardware: [
    'kim hút', 'kim mẫu', 'kim thuốc thử', 'gãy kim', 'kẹt kim', 'cong kim',
    'motor', 'động cơ', 'trục z', 'trục x', 'cánh tay', 'dây curoa', 'trượt bước',
    'bơm', 'van', 'van xả', 'van hút', 'rò rỉ', 'áp lực', 'khí nén',
    'đĩa mẫu', 'đĩa phản ứng', 'trạm rửa', 'kim rửa', 'home position', 'vị trí gốc'
  ],
  software_lis: [
    'lis', 'his', 'kết nối', 'mạng', 'lan', 'cổng com', 'rs232', 'ip',
    'phần mềm', 'treo máy', 'đơ máy', 'đứng máy', 'không gửi kết quả', 'mất kết nối',
    'lỗi hệ thống', 'khởi động lại', 'bản quyền', 'license', 'database', 'cơ sở dữ liệu',
    'truyền dữ liệu', 'in kết quả'
  ],
  reagents_cuvette: [
    'hóa chất', 'thuốc thử', 'hết hóa chất', 'reagent', 'diluent', 'rinse', 'lyse',
    'buồng đếm', 'aperture', 'cuvette', 'bọt khí', 'bọt', 'nghẽn', 'tủa', 'protein',
    'đường ống', 'thủng ống', 'hút không đủ', 'hút hụt', 'thể tích'
  ],
  optics_sensor: [
    'cảm biến', 'sensor', 'quang học', 'đèn', 'halogen', 'led', 'photometer',
    'đo quang', 'hấp thụ', 'absorbance', 'kính lọc', 'bước sóng', 'filter',
    'barcode', 'mã vạch', 'đầu đọc', 'tín hiệu yếu', 'gain', 'dark current'
  ],
  user_guide: [
    'hướng dẫn', 'cách làm', 'làm sao', 'thao tác', 'vận hành', 'quy trình',
    'kiểm chuẩn', 'calib', 'hiệu chuẩn', 'mẫu trắng', 'blank', 'cuvette blank',
    'qc', 'westgard', 'bảo dưỡng', 'vệ sinh', 'ngâm rửa', 'mở máy', 'tắt máy'
  ]
};

// Deterministic local rule classifier for high-speed fallback & client evaluation
export function localClassifyMessage(message: string, currentModel: EquipmentModel): NLPClassification {
  const cleanMsg = (message || '').toLowerCase();
  const detectedKeywords: string[] = [];
  const scores: Record<IssueNatureType, number> = {
    hardware: 0,
    software_lis: 0,
    reagents_cuvette: 0,
    optics_sensor: 0,
    user_guide: 0
  };

  // Check detected model in query if mentioned
  let detectedModel = currentModel;
  if (/exc|200|220/i.test(cleanMsg)) detectedModel = 'Zybio EXC200/220';
  else if (/z3|crp/i.test(cleanMsg)) detectedModel = 'Zybio Z3 CRP';
  else if (/z50|5 phần/i.test(cleanMsg)) detectedModel = 'Zybio Z50';
  else if (/fs|205/i.test(cleanMsg)) detectedModel = 'FS-205';

  // Specific Model Fault Matching
  const modelFaults = MODEL_FAULTS_CATALOG[detectedModel] || [];
  let bestFault: ModelFaultDefinition | null = null;
  let maxFaultScore = 0;

  for (const fault of modelFaults) {
    let faultScore = 0;
    // Check error code match
    if (cleanMsg.includes(fault.code.toLowerCase())) {
      faultScore += 6;
      detectedKeywords.push(`Mã lỗi ${fault.code}`);
    }
    // Check keywords match
    for (const kw of fault.keywords) {
      if (cleanMsg.includes(kw.toLowerCase())) {
        faultScore += kw.length > 5 ? 3 : 2;
        if (!detectedKeywords.includes(kw)) {
          detectedKeywords.push(kw);
        }
      }
    }

    if (faultScore > maxFaultScore) {
      maxFaultScore = faultScore;
      bestFault = fault;
    }
  }

  // Score each nature based on keywords
  (Object.keys(NATURE_KEYWORDS) as IssueNatureType[]).forEach(nature => {
    NATURE_KEYWORDS[nature].forEach(kw => {
      if (cleanMsg.includes(kw)) {
        scores[nature] += kw.length > 5 ? 2 : 1;
        if (!detectedKeywords.includes(kw)) {
          detectedKeywords.push(kw);
        }
      }
    });
  });

  // Check error code pattern
  const codeMatch = cleanMsg.match(/\b([ehfsz]\d{2,4})\b/i);
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    if (!detectedKeywords.includes(`Mã lỗi ${code}`)) {
      detectedKeywords.push(`Mã lỗi ${code}`);
    }
    if (code.startsWith('E')) scores.hardware += 2;
    if (code.startsWith('H')) scores.reagents_cuvette += 2;
    if (code.startsWith('Z')) scores.optics_sensor += 2;
  }

  // Find max scored nature
  let bestNature: IssueNatureType = 'user_guide';
  let maxScore = 0;
  (Object.keys(scores) as IssueNatureType[]).forEach(n => {
    if (scores[n] > maxScore) {
      maxScore = scores[n];
      bestNature = n;
    }
  });

  // If a specific model fault was matched with good score, prioritize its nature category
  const matchedFault: ModelFaultDefinition | null = bestFault;
  if (matchedFault && maxFaultScore >= 3) {
    if (matchedFault.category.includes('Cơ khí')) bestNature = 'hardware';
    else if (matchedFault.category.includes('LIS')) bestNature = 'software_lis';
    else if (matchedFault.category.includes('Buồng đếm') || matchedFault.category.includes('Hóa chất')) bestNature = 'reagents_cuvette';
    else if (matchedFault.category.includes('Quang') || matchedFault.category.includes('Cảm biến')) bestNature = 'optics_sensor';
    else bestNature = 'user_guide';
  }

  const confidence = maxFaultScore >= 6 || maxScore >= 4 ? 0.96 : maxFaultScore >= 3 || maxScore >= 2 ? 0.88 : maxScore === 1 ? 0.72 : 0.60;

  const faultCode = matchedFault ? matchedFault.code : (codeMatch ? codeMatch[1].toUpperCase() : undefined);
  const faultLabel = matchedFault 
    ? `[${matchedFault.code}] ${matchedFault.name}`
    : faultCode 
      ? `[${faultCode}] Sự cố kỹ thuật ${detectedModel}`
      : `Lỗi vận hành ${detectedModel}`;

  return {
    equipmentModel: detectedModel,
    issueNature: bestNature,
    natureLabel: ISSUE_NATURE_CONFIG[bestNature].label,
    confidence,
    keywordsDetected: detectedKeywords.slice(0, 5),
    summaryNote: matchedFault ? `Nhận diện mã lỗi ${matchedFault.code}: ${matchedFault.name}` : 'Phân loại theo từ khóa y sinh học ADC.',
    faultCode,
    faultLabel
  };
}

// Client service calling server classification with fallback
export async function classifyMessageWithAI(message: string, currentModel: EquipmentModel): Promise<NLPClassification> {
  try {
    const res = await fetch('/api/classify-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model: currentModel })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.classification) {
        return data.classification;
      }
    }
  } catch (err) {
    console.warn('Backend classify error, using local NLP classifier:', err);
  }

  return localClassifyMessage(message, currentModel);
}

// Performance stats aggregation function
export function calculateChatbotStats(sessions: ChatbotSessionRecord[]): ChatbotPerformanceStats {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMessages: 0,
      avgResponseTimeMs: 0,
      resolvedByBotRate: 0,
      escalatedRate: 0,
      byModel: {},
      byNature: {},
      byFault: {},
      byModelFault: {},
      topQuestions: [],
      dailyTrends: []
    };
  }

  const totalSessions = sessions.length;
  let totalMessages = 0;
  let totalLatency = 0;
  let resolvedCount = 0;
  let escalatedCount = 0;

  const byModel: Record<string, number> = {};
  const byNature: Record<string, number> = {};
  const byFault: Record<string, number> = {};
  const byModelFault: Record<string, Record<string, number>> = {};
  const questionMap: Record<string, { count: number; nature: string; model: string; faultCode?: string }> = {};
  const dailyMap: Record<string, { sessions: number; messages: number; resolved: number }> = {};

  sessions.forEach(s => {
    totalMessages += s.messageCount || 1;
    totalLatency += s.avgResponseTimeMs || 850;
    if (s.isResolvedByBot) resolvedCount++;
    if (s.escalatedToEngineer) escalatedCount++;

    const m = s.equipmentModel || 'Zybio EXC200/220';
    byModel[m] = (byModel[m] || 0) + 1;

    const n = s.classification?.natureLabel || 'Hướng dẫn vận hành';
    byNature[n] = (byNature[n] || 0) + 1;

    // Model Fault Classification aggregation
    const fault = s.classification?.faultLabel || (s.matchedSOPCode ? `[${s.matchedSOPCode}] Khắc phục theo SOP` : `Sự cố chung ${m}`);
    byFault[fault] = (byFault[fault] || 0) + 1;

    if (!byModelFault[m]) {
      byModelFault[m] = {};
    }
    byModelFault[m][fault] = (byModelFault[m][fault] || 0) + 1;

    // Daily trends
    const date = (s.startedAt || '').split('T')[0] || new Date().toISOString().split('T')[0];
    if (!dailyMap[date]) {
      dailyMap[date] = { sessions: 0, messages: 0, resolved: 0 };
    }
    dailyMap[date].sessions++;
    dailyMap[date].messages += s.messageCount || 1;
    if (s.isResolvedByBot) dailyMap[date].resolved++;

    // User query snippets for top questions
    (s.userQuerySnippets || []).forEach(q => {
      const cleanQ = q.trim();
      if (cleanQ.length > 5) {
        if (!questionMap[cleanQ]) {
          questionMap[cleanQ] = {
            count: 0,
            nature: s.classification?.natureLabel || 'Kỹ thuật',
            model: m,
            faultCode: s.classification?.faultCode || s.matchedSOPCode
          };
        }
        questionMap[cleanQ].count++;
      }
    });
  });

  const topQuestions = Object.entries(questionMap)
    .map(([query, data]) => ({ query, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const dailyTrends = Object.entries(dailyMap)
    .map(([date, data]) => ({
      date: date.slice(5), // MM-DD
      sessions: data.sessions,
      messages: data.messages,
      resolvedRate: Math.round((data.resolved / data.sessions) * 100)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalSessions,
    totalMessages,
    avgResponseTimeMs: Math.round(totalLatency / totalSessions),
    resolvedByBotRate: Math.round((resolvedCount / totalSessions) * 100),
    escalatedRate: Math.round((escalatedCount / totalSessions) * 100),
    byModel,
    byNature,
    byFault,
    byModelFault,
    topQuestions,
    dailyTrends
  };
}
