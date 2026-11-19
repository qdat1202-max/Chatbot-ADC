import {
  SOPArticle,
  SupportTicket,
  EquipmentModel,
  ChatPdfCitation,
  ChatTicketMatch
} from '../types';

export interface SOPSearchHit {
  sop: SOPArticle;
  score: number;
  matchedKeywords: string[];
  excerpt: string;
}

export interface KeywordSearchResult {
  keywords: string[];
  rawTokens: string[];
  isPdfIntent: boolean;
  isTicketLookupIntent: boolean;
  explicitModel: EquipmentModel | null;
  matchedSOPs: SOPSearchHit[];
  bestSOP?: SOPArticle;
  citedPdfs: ChatPdfCitation[];
  matchedTickets: ChatTicketMatch[];
}

const VIETNAMESE_STOPWORDS = new Set([
  'toi', 'minh', 'em', 'anh', 'chi', 'ban', 'quy', 'khach', 'chung', 'ta',
  'can', 'muon', 'tim', 'kiem', 'tra', 'cuu', 'yeu', 'cau', 'hoi', 'xem',
  'cho', 'xin', 'giup', 'voi', 'ho', 'tro', 've', 'cua', 'la', 'gi', 'nao',
  'co', 'khong', 'duoc', 'bi', 'dang', 'gap', 'phai', 'khi', 'nay', 'do',
  'cac', 'nhung', 'mot', 'hai', 'ba', 'va', 'hoac', 'hay', 'thi', 'ma',
  'de', 'tu', 'den', 'tai', 'o', 'tren', 'duoi', 'trong', 'ngoai', 'sau',
  'truoc', 'nhu', 'the', 'sao', 'vi', 'boi', 'nen', 'neu', 'vay', 'nhe',
  'a', 'nha', 'da', 'vang', 'alo', 'bot', 'ai', 'chatbot', 'gemini',
  'file', 'pdf', 'tai', 'lieu', 'trich', 'dan', 'huong', 'cach', 'xu', 'ly',
  'sua', 'chua', 'may', 'thiet', 'bi', 'xet', 'nghiem', 'loi', 'su', 'co'
]);

export function normalizeVietnamese(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^\w\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectExplicitModelInQuery(query: string): EquipmentModel | null {
  const norm = normalizeVietnamese(query);
  if (/\b(exc\s*200|exc\s*220|exc200|exc220|sinh hoa)\b/.test(norm)) return 'Zybio EXC200/220';
  if (/\b(z3|z\s*3|crp|3\s*thanh\s*phan|3tp)\b/.test(norm)) return 'Zybio Z3 CRP';
  if (/\b(z50|z\s*50|5\s*thanh\s*phan|5tp)\b/.test(norm)) return 'Zybio Z50';
  if (/\b(fs\s*-?\s*205|fs205|mien dich|cassette)\b/.test(norm)) return 'FS-205';
  return null;
}

export function extractSearchKeywords(query: string): {
  keywords: string[];
  rawTokens: string[];
  errorCodes: string[];
  ticketCodes: string[];
  phoneTokens: string[];
} {
  const norm = normalizeVietnamese(query);
  const errorCodes: string[] = [];
  const ticketCodes: string[] = [];
  const phoneTokens: string[] = [];

  // Extract TICK-xxxx codes
  const tickMatches = query.toUpperCase().match(/\bTICK-[A-Z0-9-]+\b/g);
  if (tickMatches) {
    tickMatches.forEach(t => {
      if (!ticketCodes.includes(t)) ticketCodes.push(t);
    });
  }

  // Extract standard equipment error codes (E101, H108, Z501, FS101, etc.)
  const errMatches = query.toUpperCase().match(/\b([EHZ]\d{2,4}|FS-?[A-Z0-9-]{2,8})\b/g);
  if (errMatches) {
    errMatches.forEach(c => {
      const clean = c.trim();
      if (!errorCodes.includes(clean)) errorCodes.push(clean);
    });
  }

  // Extract phone-like digit sequences (>= 4 digits)
  const digitMatches = query.match(/\d{4,11}/g);
  if (digitMatches) {
    digitMatches.forEach(d => {
      if (!phoneTokens.includes(d)) phoneTokens.push(d);
    });
  }

  // Tokenize normalized query
  const rawTokens = norm
    .split(/[\s,/;|]+/)
    .map(t => t.replace(/^\.+|\.+$/g, '').trim())
    .filter(t => t.length >= 2);

  const meaningful = rawTokens.filter(t => !VIETNAMESE_STOPWORDS.has(t));

  // Build 2-word meaningful phrases (bigrams) for stronger semantic precision
  const bigrams: string[] = [];
  for (let i = 0; i < meaningful.length - 1; i++) {
    bigrams.push(`${meaningful[i]} ${meaningful[i + 1]}`);
  }

  const combined = Array.from(
    new Set([
      ...errorCodes.map(c => c.toLowerCase()),
      ...ticketCodes.map(t => t.toLowerCase()),
      ...bigrams,
      ...meaningful
    ])
  );

  return {
    keywords: combined,
    rawTokens,
    errorCodes,
    ticketCodes,
    phoneTokens
  };
}

function buildExcerptForSOP(sop: SOPArticle, keywords: string[]): string {
  const candidates: string[] = [
    ...(sop.resolutionSteps || []),
    sop.symptom || '',
    sop.rootCause || '',
    sop.componentLocation || ''
  ].filter(Boolean);

  if (keywords.length > 0) {
    for (const item of candidates) {
      const normItem = normalizeVietnamese(item);
      if (keywords.some(kw => kw.length >= 2 && normItem.includes(normalizeVietnamese(kw)))) {
        return item.length > 180 ? `${item.slice(0, 177)}...` : item;
      }
    }
  }

  const fallback = sop.symptom || sop.resolutionSteps?.[0] || sop.rootCause || sop.title;
  return fallback.length > 180 ? `${fallback.slice(0, 177)}...` : fallback;
}

export function buildPdfCitationFromSOP(
  sop: SOPArticle,
  matchedKeywords: string[] = []
): ChatPdfCitation | null {
  const fileName = sop.pdfAttachment?.fileName || sop.sourceFile;
  if (!fileName) return null;

  return {
    sopId: sop.id,
    sopTitle: sop.title,
    errorCode: sop.errorCode || undefined,
    equipmentModel: sop.equipmentModel,
    fileName,
    pdfAttachment: sop.pdfAttachment,
    excerpt: buildExcerptForSOP(sop, matchedKeywords),
    matchedKeywords
  };
}

export function searchKnowledgeByKeywords(
  query: string,
  selectedModel: EquipmentModel,
  sops: SOPArticle[],
  tickets: SupportTicket[] = []
): KeywordSearchResult {
  const normQuery = normalizeVietnamese(query);
  const { keywords, rawTokens, errorCodes, ticketCodes, phoneTokens } = extractSearchKeywords(query);
  const explicitModel = detectExplicitModelInQuery(query);

  const isPdfIntent =
    /\b(pdf|tai lieu pdf|service manual|manual|huong dan goc|tai file|xem file|file pdf|file huong dan)\b/.test(normQuery);
  const isTicketLookupIntent =
    ticketCodes.length > 0 ||
    phoneTokens.length > 0 ||
    /\b(tra cuu phieu|tra cuu yeu cau|tien do phieu|tien do ho tro|ma phieu|ticket)\b/.test(normQuery);

  // 1. Score all SOPs
  const sopHits: SOPSearchHit[] = [];
  for (const sop of sops) {
    let score = 0;
    const matchedKws: string[] = [];

    const normCode = normalizeVietnamese(sop.errorCode || '');
    const normTitle = normalizeVietnamese(sop.title || '');
    const normSymptom = normalizeVietnamese(sop.symptom || '');
    const normRoot = normalizeVietnamese(sop.rootCause || '');
    const normSteps = normalizeVietnamese((sop.resolutionSteps || []).join(' '));
    const normLoc = normalizeVietnamese(sop.componentLocation || '');
    const normCategory = normalizeVietnamese(sop.category || '');
    const normFileName = normalizeVietnamese(sop.pdfAttachment?.fileName || sop.sourceFile || '');
    const normModel = normalizeVietnamese(sop.equipmentModel || '');

    // Exact error code match
    for (const code of errorCodes) {
      const cLower = code.toLowerCase();
      if (normCode && (normCode === cLower || normCode.includes(cLower))) {
        score += 120;
        if (!matchedKws.includes(code)) matchedKws.push(code);
      } else if (normTitle.includes(cLower) || normFileName.includes(cLower) || normSteps.includes(cLower)) {
        score += 65;
        if (!matchedKws.includes(code)) matchedKws.push(code);
      }
    }

    // Direct phrase inclusion
    if (normQuery.length >= 4 && normTitle.includes(normQuery)) {
      score += 80;
    }

    // Keyword & bigram scoring
    for (const kw of keywords) {
      if (kw.length < 2) continue;
      const isBigram = kw.includes(' ');
      const weightBoost = isBigram ? 2.2 : 1;

      let hitThisKw = false;
      if (normFileName && normFileName.includes(kw)) {
        score += Math.round(35 * weightBoost);
        hitThisKw = true;
      }
      if (normTitle.includes(kw)) {
        score += Math.round(28 * weightBoost);
        hitThisKw = true;
      }
      if (normSymptom.includes(kw)) {
        score += Math.round(18 * weightBoost);
        hitThisKw = true;
      }
      if (normRoot.includes(kw)) {
        score += Math.round(15 * weightBoost);
        hitThisKw = true;
      }
      if (normSteps.includes(kw)) {
        score += Math.round(12 * weightBoost);
        hitThisKw = true;
      }
      if (normLoc.includes(kw) || normCategory.includes(kw)) {
        score += Math.round(10 * weightBoost);
        hitThisKw = true;
      }

      if (hitThisKw && !matchedKws.includes(kw)) {
        matchedKws.push(kw);
      }
    }

    // Model relevance adjustment
    const targetModel = explicitModel || selectedModel;
    if (sop.equipmentModel === targetModel && score > 0) {
      score += 14;
    } else if (explicitModel && normModel.includes(normalizeVietnamese(explicitModel)) && isPdfIntent && sop.pdfAttachment) {
      score += 20;
    }

    // PDF intent boost when SOP actually has an attached PDF or source file
    if (isPdfIntent) {
      if (sop.pdfAttachment) {
        score += score > 0 ? 35 : (sop.equipmentModel === targetModel ? 18 : 10);
      } else if (sop.sourceFile && score > 0) {
        score += 12;
      }
    }

    if (score >= 22) {
      sopHits.push({
        sop,
        score,
        matchedKeywords: matchedKws.slice(0, 6),
        excerpt: buildExcerptForSOP(sop, matchedKws)
      });
    }
  }

  sopHits.sort((a, b) => b.score - a.score);

  // If user explicitly asked for PDFs and no keyword matched, surface PDF-attached SOPs first
  if (isPdfIntent && sopHits.length === 0) {
    const pdfSOPs = sops.filter(s => Boolean(s.pdfAttachment) || Boolean(s.sourceFile));
    const prioritized = [
      ...pdfSOPs.filter(s => s.pdfAttachment && s.equipmentModel === (explicitModel || selectedModel)),
      ...pdfSOPs.filter(s => s.pdfAttachment && s.equipmentModel !== (explicitModel || selectedModel)),
      ...pdfSOPs.filter(s => !s.pdfAttachment && s.equipmentModel === (explicitModel || selectedModel))
    ].slice(0, 4);

    prioritized.forEach((sop, idx) => {
      sopHits.push({
        sop,
        score: 25 - idx,
        matchedKeywords: ['PDF'],
        excerpt: buildExcerptForSOP(sop, [])
      });
    });
  }

  // 2. Build cited PDFs ONLY when user explicitly requested PDF documents
  const citedPdfs: ChatPdfCitation[] = [];
  if (isPdfIntent) {
    const seenSopIds = new Set<string>();
    for (const hit of sopHits) {
      if (citedPdfs.length >= 4) break;
      if (seenSopIds.has(hit.sop.id)) continue;
      const citation = buildPdfCitationFromSOP(hit.sop, hit.matchedKeywords);
      if (citation && (citation.pdfAttachment || hit.score >= 24)) {
        seenSopIds.add(hit.sop.id);
        citedPdfs.push(citation);
      }
    }
  }

  // 3. Score Support Tickets ONLY when user explicitly asks for ticket lookup
  const ticketHits: { ticket: SupportTicket; score: number }[] = [];
  if (isTicketLookupIntent) {
    for (const t of tickets) {
      let tScore = 0;
      const normTickCode = normalizeVietnamese(t.ticketCode || '');
      const normHosp = normalizeVietnamese(t.hospitalClinic || '');
      const normIssue = normalizeVietnamese(t.issueDescription || '');
      const normErr = normalizeVietnamese(t.errorCode || '');
      const normContact = normalizeVietnamese(t.contactPerson || '');
      const normEng = normalizeVietnamese(t.assignedEngineerName || '');
      const normPhone = (t.phone || '').replace(/\s+/g, '');
      const normModel = normalizeVietnamese(t.equipmentModel || '');

      for (const tc of ticketCodes) {
        if (normTickCode.includes(tc.toLowerCase())) {
          tScore += 150;
        }
      }

      for (const pt of phoneTokens) {
        if (normPhone.includes(pt)) {
          tScore += 120;
        }
      }

      for (const ec of errorCodes) {
        const cLower = ec.toLowerCase();
        if (normErr.includes(cLower) || normIssue.includes(cLower)) {
          tScore += 55;
        }
      }

      for (const kw of keywords) {
        if (kw.length < 2) continue;
        const mult = kw.includes(' ') ? 2 : 1;
        if (normHosp.includes(kw)) tScore += Math.round(30 * mult);
        if (normIssue.includes(kw)) tScore += Math.round(22 * mult);
        if (normContact.includes(kw) || normEng.includes(kw)) tScore += Math.round(20 * mult);
        if (normModel.includes(kw)) tScore += 12;
        if (normTickCode.includes(kw)) tScore += 40;
      }

      if (tScore >= 18) {
        ticketHits.push({ ticket: t, score: tScore });
      }
    }

    ticketHits.sort((a, b) => b.score - a.score);
  }

  const matchedTickets: ChatTicketMatch[] = ticketHits.slice(0, 4).map(({ ticket }) => ({
    id: ticket.id,
    ticketCode: ticket.ticketCode,
    hospitalClinic: ticket.hospitalClinic,
    equipmentModel: ticket.equipmentModel,
    errorCode: ticket.errorCode,
    issueDescription: ticket.issueDescription,
    status: ticket.status,
    priority: ticket.priority,
    assignedEngineerName: ticket.assignedEngineerName,
    createdAt: ticket.createdAt
  }));

  return {
    keywords: keywords.slice(0, 8),
    rawTokens,
    isPdfIntent,
    isTicketLookupIntent,
    explicitModel,
    matchedSOPs: sopHits.slice(0, 6),
    bestSOP: sopHits[0]?.sop,
    citedPdfs,
    matchedTickets
  };
}
