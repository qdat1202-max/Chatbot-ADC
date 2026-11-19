# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity & Email Verification**: No read, list, create, update, or delete is permitted without a valid authenticated Firebase user whose `email_verified == true`.
2. **PII Isolation & Ownership Boundaries**: `/engineers/{engineerId}` and `/system_settings/{settingId}` store PII (`phone`, `email`, `dutyEngineerPhone`). `/sop_articles/{sopId}` and `/sop_pdf_chunks/{chunkId}` store long-term technical SOP records and PDF chunks. Reads and list queries across all collections are strictly limited to the verified admin (`qdat1202@gmail.com`) or the authenticated document owner (`ownerUid == request.auth.uid`). No blanket `isSignedIn()` or public reads exist.
3. **Immutable Ownership & Temporal Integrity**: `ownerUid` and `createdAt` cannot be modified after creation. `createdAt` on create and `updatedAt` on create/update must equal server `request.time`.
4. **Strict Schema & No Shadow Fields**: Every write must match `hasAll(...)` and `hasOnly(...)` on `Engineer`, `SystemSettingConfig`, `SOPArticleRecord`, or `SOPPdfChunk`, with explicit `.size()` bounds on every string, map, and array (`specialties.size() <= 10`, `allowedTabs.size() >= 1 && <= 20`, `resolutionSteps.size() <= 40`, `safetyWarnings.size() <= 20`, `dataBase64.size() <= 750000`).
5. **Privilege Escalation Prevention**: Non-admin users cannot create `director`, `css`, `warehouse`, or `sales` personnel records, and on update non-admins may only update `status`, `activeTicketsCount`, and `updatedAt` of their own owned engineer document (`ownerUid == request.auth.uid`), or update/delete only their own `ownerUid` SOP/PDF documents.
6. **Path Variable Hardening**: Every document ID (`engineerId`, `settingId`, `sopId`, `chunkId`) must match `^[a-zA-Z0-9_\-]+$`, length `<= 128`, and `data.id == <pathId>`.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Read/Write**: Read or write `/engineers/ENG-001` or `/sop_articles/SOP-001` with `auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: Write/read as `email: "qdat1202@gmail.com"` with `email_verified: false` -> `PERMISSION_DENIED`.
3. **Cross-Tenant Read (`get`/`list`)**: Non-admin verified user attempts to read/list another owner's `/engineers/{id}` or `/sop_articles/{id}` -> `PERMISSION_DENIED`.
4. **Shadow / Ghost Field Injection**: Admin or user sends `{ ..., isSuperAdmin: true }` or `{ ..., password: "leak" }` on create or update -> `PERMISSION_DENIED`.
5. **Identity Spoofing on Create**: Verified user sets `ownerUid` to another user's UID -> `PERMISSION_DENIED`.
6. **Immortal Field Tampering (`ownerUid` / `createdAt`)**: Update attempts to change `ownerUid` or `createdAt` -> `PERMISSION_DENIED`.
7. **Client Timestamp Forgery**: Create or update sends a client-supplied past/future timestamp instead of `request.time` -> `PERMISSION_DENIED`.
8. **Role Privilege Escalation**: Non-admin verified user attempts to create an engineer with `role: "director"` or update their own `role`/`allowedTabs` -> `PERMISSION_DENIED`.
9. **ID Poisoning / Oversized Document ID**: Create with `engineerId` or `sopId` containing slashes/spaces or >128 characters -> `PERMISSION_DENIED`.
10. **Path/Payload ID Mismatch**: Create `/sop_articles/SOP-1` with `{ id: "SOP-2", ... }` -> `PERMISSION_DENIED`.
11. **Denial-of-Wallet Oversized String, Array, or Chunk**: Send `name` > 120 chars, `specialties` > 10 items, `resolutionSteps` > 40 items, or `dataBase64` > 750,000 chars -> `PERMISSION_DENIED`.
12. **Type / Enum Poisoning on Write**: Write invalid `equipmentModel`, negative `activeTicketsCount`, invalid `chunkIndex >= totalChunks`, or invalid `pdfAttachment` map keys -> `PERMISSION_DENIED`.
