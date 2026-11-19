import { EquipmentModel, LearnedKnowledgeEntry, ChatbotSessionRecord, SOPArticle, ChatMessageFeedback } from '../types';
import { getStoredLearnedKnowledge, saveLearnedKnowledge } from './storage';

export { getStoredLearnedKnowledge, saveLearnedKnowledge };

/**
 * Continuous Learning Engine for ADC Technical Support Chatbot
 * Manages structured field knowledge, user feedback loops, and auto-synthesis.
 */

// Format learned knowledge for prompt injection
export function formatLearnedKnowledgeForPrompt(
  knowledgeList: LearnedKnowledgeEntry[],
  model: EquipmentModel
): string {
  const relevant = knowledgeList.filter(
    k => k.status === 'active' && (k.equipmentModel === 'Tất cả dòng máy' || k.equipmentModel === model)
  );

  if (relevant.length === 0) return '';

  return relevant.map((item, idx) => {
    return `[Kinh nghiệm thực chiến #${idx + 1}] (${item.equipmentModel} - Độ tin cậy: ${Math.round(item.confidenceScore * 100)}% - Đã giúp ${item.usageCount} KTV):
Hiện tượng: ${item.symptomSummary || item.symptomPattern}
Giải pháp đã chứng minh hiệu quả:
${item.learnedSolution || (item.solutionSteps || []).join('\n')}
${item.preventionTip ? `Mẹo phòng ngừa: ${item.preventionTip}` : ''}`;
  }).join('\n---\n');
}

// Find matching learned entry based on user query
export function findMatchingLearnedKnowledge(
  query: string,
  model: EquipmentModel,
  knowledgeList: LearnedKnowledgeEntry[] = getStoredLearnedKnowledge()
): LearnedKnowledgeEntry | null {
  if (!query || !query.trim()) return null;
  const qLower = query.toLowerCase().trim();

  const candidates = knowledgeList.filter(
    k => k.status === 'active' && (k.equipmentModel === 'Tất cả dòng máy' || k.equipmentModel === model)
  );

  let bestMatch: LearnedKnowledgeEntry | null = null;
  let highestScore = 0;

  for (const item of candidates) {
    let score = 0;

    // Check trigger keywords
    const keywords = item.triggerKeywords || item.matchedKeywords || [];
    for (const kw of keywords) {
      if (qLower.includes(kw.toLowerCase())) {
        score += kw.length > 5 ? 3 : 2;
      }
    }

    // Check title and symptom pattern overlap
    if (qLower.includes(item.title.toLowerCase())) {
      score += 4;
    }

    // Weight by confidence score
    score = score * (item.confidenceScore || 0.8);

    if (score > highestScore && score >= 2) {
      highestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

// Record feedback and dynamically adjust learning parameters
export function recordFeedbackAndLearn(params: {
  sessionId?: string;
  userQuery: string;
  botReplyText?: string;
  botResponseText?: string;
  model?: EquipmentModel;
  equipmentModel?: EquipmentModel;
  isHelpful?: boolean;
  feedback?: ChatMessageFeedback;
  userCorrectionTip?: string;
  comment?: string;
  matchedSOPCode?: string;
}): { updatedKnowledge: LearnedKnowledgeEntry[]; matchedEntry?: LearnedKnowledgeEntry; newEntryCreated?: boolean } {
  const allKnowledge = getStoredLearnedKnowledge();
  const now = new Date().toLocaleString('vi-VN');

  const model = params.equipmentModel || params.model || 'Zybio EXC200/220';
  const isHelpful = params.feedback ? params.feedback.rating === 'helpful' : params.isHelpful ?? true;
  const userTip = params.feedback?.userTip || params.userCorrectionTip || params.feedback?.comment || params.comment;
  const sessionId = params.sessionId || 'SES-USER-FEEDBACK';

  // Try to find if an existing learned item was triggered
  const matched = findMatchingLearnedKnowledge(params.userQuery, model, allKnowledge);
  let newEntryCreated = false;

  let nextKnowledge = [...allKnowledge];

  if (matched) {
    nextKnowledge = nextKnowledge.map(item => {
      if (item.id === matched.id) {
        const curHelpful = item.helpfulVotes ?? item.helpfulCount ?? 0;
        const curUnhelpful = item.unhelpfulVotes ?? item.unhelpfulCount ?? 0;
        const newHelpful = isHelpful ? curHelpful + 1 : curHelpful;
        const newUnhelpful = !isHelpful ? curUnhelpful + 1 : curUnhelpful;
        // Laplace smoothed Bayesian confidence update
        const updatedConfidence = Math.min(
          0.99,
          Math.max(0.4, Number(((newHelpful + 3) / (newHelpful + newUnhelpful + 4)).toFixed(2)))
        );

        return {
          ...item,
          helpfulVotes: newHelpful,
          helpfulCount: newHelpful,
          unhelpfulVotes: newUnhelpful,
          unhelpfulCount: newUnhelpful,
          confidenceScore: updatedConfidence,
          usageCount: (item.usageCount || 0) + 1,
          lastAppliedAt: now,
          updatedAt: now,
          sourceSessionIds: (item.sourceSessionIds || []).includes(sessionId) 
            ? item.sourceSessionIds 
            : [...(item.sourceSessionIds || []), sessionId]
        };
      }
      return item;
    });
  }

  // If user provided an explicit field correction or practical tip, create a new learned rule!
  if (userTip && userTip.trim().length > 8) {
    const tip = userTip.trim();
    const query = params.userQuery.trim();

    // Extract quick title
    const titleSnippet = query.length > 50 ? `${query.slice(0, 50)}...` : query;
    const cleanTitle = `Kinh nghiệm KTV xử lý: ${titleSnippet}`;

    // Extract keywords from query
    const words = query.toLowerCase().replace(/[,.:;?!]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
    const keywords = Array.from(new Set(words)).slice(0, 6);

    const newLearnedItem: LearnedKnowledgeEntry = {
      id: `LRN-${Date.now().toString(36).toUpperCase()}`,
      title: cleanTitle,
      equipmentModel: model,
      errorCode: params.matchedSOPCode,
      category: 'Kinh nghiệm thực chiến',
      triggerKeywords: keywords.length > 0 ? keywords : [query.slice(0, 20)],
      matchedKeywords: keywords,
      symptomPattern: query,
      symptomSummary: query,
      learnedSolution: tip,
      solutionSteps: [tip],
      rootCauseAnalysis: 'Đúc kết trực tiếp từ kỹ thuật viên tại phòng xét nghiệm.',
      safetyNotes: ['Đeo găng tay y tế bảo hộ'],
      preventionTip: 'Ghi nhận trực tiếp từ kỹ thuật viên tại cơ sở y tế.',
      confidenceScore: 0.85,
      helpfulVotes: 1,
      helpfulCount: 1,
      unhelpfulVotes: 0,
      unhelpfulCount: 0,
      usageCount: 1,
      sourceSessionIds: [sessionId],
      learningSource: 'user_feedback',
      status: 'active',
      learnedAt: now,
      lastAppliedAt: now,
      createdAt: now,
      updatedAt: now
    };

    nextKnowledge = [newLearnedItem, ...nextKnowledge];
    newEntryCreated = true;
  }

  saveLearnedKnowledge(nextKnowledge);
  return { updatedKnowledge: nextKnowledge, matchedEntry: matched || undefined, newEntryCreated };
}

// Convert a high-confidence Learned Knowledge Entry to an official SOP Article
export function promoteLearnedEntryToSOP(entry: LearnedKnowledgeEntry): SOPArticle {
  const steps = (entry.solutionSteps && entry.solutionSteps.length > 0)
    ? entry.solutionSteps
    : (entry.learnedSolution || '')
        .split(/\n|\r\n|;\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);

  const formattedSteps = steps.length > 0
    ? steps.map((s, idx) => s.startsWith('Bước') ? s : `Bước ${idx + 1}: ${s}`)
    : [
        `Bước 1: Tiếp cận thiết bị ${entry.equipmentModel} và kiểm tra ngoại quan.`,
        `Bước 2: Áp dụng giải pháp đã kiểm chứng: ${entry.learnedSolution || ''}`,
        'Bước 3: Chạy lại mẫu trắng Blank / QC nội kiểm để xác nhận kết quả đạt trước khi bàn giao.'
      ];

  // Category mapping
  let category: SOPArticle['category'] = 'Cơ khí & Kim hút';
  if (entry.category === 'Quang học & Cảm biến') category = 'Quang học & Cảm biến';
  else if (entry.category === 'Hóa chất & Buồng đếm') category = 'Hóa chất & Buồng đếm';
  else if (entry.category === 'Điện tử & Nhiệt độ') category = 'Điện tử & Nhiệt độ';
  else if (entry.category === 'Phần mềm & Kết nối') category = 'Phần mềm & Kết nối';

  const modelCode = entry.equipmentModel.includes('EXC') ? 'E' :
                    entry.equipmentModel.includes('Z3') ? 'H' :
                    entry.equipmentModel.includes('Z50') ? 'Z' : 'FS';

  const newSOP: SOPArticle = {
    id: `SOP-LRN-${Date.now().toString(36).toUpperCase()}`,
    equipmentModel: entry.equipmentModel === 'Tất cả dòng máy' ? 'Zybio EXC200/220' : entry.equipmentModel,
    category: category,
    errorCode: entry.errorCode ? entry.errorCode.trim().toUpperCase() : '',
    title: entry.title,
    symptom: entry.symptomSummary || entry.symptomPattern,
    rootCause: entry.rootCauseAnalysis || `Đúc kết từ ${entry.usageCount || 1} ca thực tế và phản hồi của KTV bệnh viện.`,
    resolutionSteps: formattedSteps,
    safetyWarnings: entry.safetyNotes && entry.safetyNotes.length > 0 ? entry.safetyNotes : [
      'Bắt buộc đeo găng tay y tế chống lây nhiễm sinh học.',
      entry.preventionTip || 'Bảo dưỡng định kỳ theo đúng khuyến cáo kỹ thuật ADC.'
    ],
    componentLocation: 'Cụm thiết bị theo quy trình',
    isCommon: true,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  return newSOP;
}

// Client service calling server synthesis
export async function runServerKnowledgeSynthesis(
  sessions: ChatbotSessionRecord[],
  currentKnowledge: LearnedKnowledgeEntry[]
): Promise<{ updatedKnowledge: LearnedKnowledgeEntry[]; newItemsCount: number }> {
  try {
    const res = await fetch('/api/chatbot-learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions, existingCount: currentKnowledge.length })
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.newLearnedEntries) && data.newLearnedEntries.length > 0) {
        const merged = [...data.newLearnedEntries, ...currentKnowledge];
        saveLearnedKnowledge(merged);
        return { updatedKnowledge: merged, newItemsCount: data.newLearnedEntries.length };
      }
    }
  } catch (err) {
    console.warn('Server synthesis error, falling back to local synthesis:', err);
  }

  // Local fallback synthesis
  const localList = runLocalKnowledgeSynthesis(sessions, currentKnowledge);
  return { updatedKnowledge: localList, newItemsCount: Math.max(0, localList.length - currentKnowledge.length) };
}

// Local synthesis logic analyzing chat sessions
export function runLocalKnowledgeSynthesis(
  sessions: ChatbotSessionRecord[],
  currentKnowledge: LearnedKnowledgeEntry[]
): LearnedKnowledgeEntry[] {
  const existingTitles = new Set(currentKnowledge.map(k => k.title.toLowerCase()));
  const newEntries: LearnedKnowledgeEntry[] = [];
  const now = new Date().toLocaleString('vi-VN');

  // Filter resolved sessions with multiple messages or positive feedback
  const valuableSessions = sessions.filter(
    s => s.isResolvedByBot || s.feedbackRating === 'helpful' || s.userCorrectionTip
  );

  // Group by equipmentModel
  const byModel: Record<string, ChatbotSessionRecord[]> = {};
  valuableSessions.forEach(s => {
    const m = s.equipmentModel || 'Zybio EXC200/220';
    if (!byModel[m]) byModel[m] = [];
    byModel[m].push(s);
  });

  Object.entries(byModel).forEach(([modelStr, modelSessions]) => {
    const model = modelStr as EquipmentModel;

    // Detect recurring questions
    const questionCounts: Record<string, { count: number; sessions: string[]; sample: string }> = {};
    modelSessions.forEach(s => {
      (s.userQuerySnippets || []).forEach(q => {
        const qClean = q.trim();
        if (qClean.length > 8) {
          const key = qClean.slice(0, 30).toLowerCase();
          if (!questionCounts[key]) {
            questionCounts[key] = { count: 0, sessions: [], sample: qClean };
          }
          questionCounts[key].count++;
          if (!questionCounts[key].sessions.includes(s.id)) {
            questionCounts[key].sessions.push(s.id);
          }
        }
      });
    });

    // For any recurring problem, synthesize a rule
    Object.values(questionCounts).forEach(item => {
      const title = `Kinh nghiệm đúc kết: Xử lý ${item.sample}`;
      if (!existingTitles.has(title.toLowerCase())) {
        existingTitles.add(title.toLowerCase());

        const words = item.sample.toLowerCase().replace(/[,.:;?!]/g, ' ').split(/\s+/).filter(w => w.length >= 3);
        const keywords = Array.from(new Set(words)).slice(0, 6);

        newEntries.push({
          id: `LRN-AUTO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`,
          title: title,
          equipmentModel: model,
          category: 'Kinh nghiệm thực chiến',
          triggerKeywords: keywords.length > 0 ? keywords : [item.sample.slice(0, 20)],
          symptomPattern: item.sample,
          learnedSolution: `1. Kiểm tra trạng thái cảm biến và vệ sinh buồng phản ứng trên máy ${model}.\n2. Thực hiện lệnh Rinse / Flush đường ống 2 lần.\n3. Chạy mẫu trắng Blank để kiểm tra độ ổn định nền trước khi tiếp tục.`,
          preventionTip: 'Chạy bảo dưỡng và rửa cuối ca định kỳ với dung dịch chính hãng ADC.',
          confidenceScore: 0.88,
          helpfulVotes: item.count,
          unhelpfulVotes: 0,
          usageCount: item.count,
          sourceSessionIds: item.sessions,
          learningSource: 'auto_synthesis',
          status: 'active',
          lastAppliedAt: now,
          createdAt: now,
          updatedAt: now
        });
      }
    });
  });

  const finalResult = [...newEntries, ...currentKnowledge];
  saveLearnedKnowledge(finalResult);
  return finalResult;
}
