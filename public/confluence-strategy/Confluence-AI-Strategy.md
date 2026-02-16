# Confluence API 기반 AI 지식 서비스 구축 및 운영 최적화 전략서

> Confluence + Azure OpenAI (GPT-4o) + Microsoft Teams Bot
> 엔터프라이즈 RAG 파이프라인

**현대오토에버 AI 전략팀 | 2025. 02**

---

## 1. 프로젝트 개요 및 전략적 배경

현대 기업의 경쟁력은 내부 지식 자산의 가시화와 활용 속도에 의해 결정됩니다. 2025년 8월부로 시행된 사내 외용 생성형 AI 서비스 차단 조치와 전사적 AI 전환 흐름 속에서, 기존 사내 AI 서비스(H Chat Pro)가 보여준 일부 성능 격차(응답 지연 및 처리 중단)는 업무 연속성에 있어 중대한 도전 과제로 부상했습니다.

본 프로젝트는 이러한 기술적 페인 포인트를 해결하기 위해 설계되었습니다:

- **Confluence REST API v2**를 통한 고정밀 데이터 추출
- **Azure OpenAI (GPT-4o)** 기반의 맞춤형 RAG 파이프라인
- **Microsoft Teams Bot**을 결합하여 보안과 성능이 검증된 지능형 지식 어시스턴트

---

## 2. 엔터프라이즈 통합 시스템 아키텍처

확장성과 고가용성을 보장하기 위해 Azure 클라우드 생태계 기반의 계층형 마이크로서비스 아키텍처를 채택합니다.

### 2.1 계층별 구조

| 계층 | 기술 | 역할 |
|------|------|------|
| Client Layer | Azure Bot Service + React Web UI | 사용자 접점 |
| API Gateway | FastAPI (Azure App Service) | 라우팅 및 인증 |
| RAG Engine | LangChain | 문서 전처리, 청킹, 검색 체인 |
| Vector Store | Azure AI Search | 벡터 + 메타데이터 필터링 |
| AI Model | Azure OpenAI (GPT-4o + text-embedding-3-large) | 답변 생성 + 임베딩 |
| Data Source | Confluence REST API v2 | 위키 본문, 레이블, 계층 구조 |

### 2.2 FastAPI 기반 백엔드 설계

기술 스택: Python 3.12 + FastAPI + Pydantic v2

| 메서드 | 엔드포인트 | 목적 |
|--------|-----------|------|
| POST | /api/chat | RAG 기반 지능형 질의응답 (GPT-4o) |
| GET | /api/search | 의미론적(Semantic) 검색 및 문서 탐색 |
| POST | /api/index | 스페이스별 데이터 인덱싱 및 임베딩 갱신 |
| POST | /api/webhook/teams | Teams 봇 메시지 핸들링 및 상태 관리 |
| GET | /api/health | 시스템 상태 모니터링 및 가용성 체크 |

---

## 3. Confluence API 데이터 소스 통합

### 3.1 핵심 API 엔드포인트

| 엔드포인트 | 용도 |
|-----------|------|
| `GET /wiki/api/v2/spaces` | 전체 지식 지도 파악 (스페이스 목록) |
| `GET /wiki/api/v2/pages` | 개별 페이지 메타데이터 수집 |
| `GET /wiki/api/v2/pages/{id}?body-format=view` | 정제된 HTML 구조의 본문 추출 |
| `GET /wiki/api/v2/pages/{id}/children` | 지식 계층(Hierarchy) 정보 반영 |
| `GET /wiki/api/v2/pages/{id}/labels` | 부서 및 프로젝트 카테고리 분류 |

### 3.2 데이터 동기화 전략

1. **초기 전체 크롤링 (Full Crawl):** 서비스 도입 시점의 모든 데이터를 벡터화
2. **증분 동기화 (Incremental Sync):** Webhook 기본 + 30분 간격 폴링(Fallback)
3. **부분 갱신 프로세스:** 변경된 청크(Chunk) 단위만 재임베딩하여 연산 비용 최적화

---

## 4. RAG 파이프라인 설계

### 파이프라인 흐름

```
Confluence 수집 → 청킹(1,000/200) → 임베딩(3,072D) → 벡터 검색 → GPT-4o 답변 생성
```

### 4.1 텍스트 전처리 및 임베딩

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| Chunk Size | 1,000 tokens | 문맥 유지를 위한 최적 크기 |
| Overlap | 200 tokens | 청크 간 문맥 연속성 보장 |
| 벡터 차원 | 3,072 | text-embedding-3-large |
| Temperature | 0.1 | 사실적 정확도 최우선 |
| Max Tokens | 2,000 | 상세 설명 + 출처 포함 |

### 4.2 시스템 프롬프트

> "귀하는 사내 지식 어시스턴트입니다. 반드시 제공된 Confluence 컨텍스트에만 기반하여 답변하십시오. 답변 시 출처 페이지 제목과 URL을 명시해야 합니다. 만약 컨텍스트에 답변에 필요한 정보가 없다면, 명확히 모른다고 답하십시오."

---

## 5. Microsoft Teams 통합

### 핵심 기능

- **자연어 질의응답:** Bot Framework SDK + Adaptive Cards
- **슬래시 명령어:** `/filter [Space_Key]` — 특정 프로젝트/부서 범위 검색
- **멀티턴 대화:** 대화 문맥(Context) 유지
- **피드백 루프:** '도움됨/도움되지 않음' 버튼으로 정량 평가

### 인터랙션 플로우

1. 사용자 질의 (Teams 채팅)
2. 의미론적 검색 (Azure AI Search)
3. GPT-4o 답변 생성 (검색 결과 + 시스템 프롬프트)
4. Adaptive Card 응답 (답변 + 출처 + 피드백 버튼)
5. 피드백 수집 → 품질 개선 데이터

---

## 6. 운영 최적화 프레임워크

### 4대 평가 차원

| 차원 | 핵심 지표 | 설명 |
|------|----------|------|
| **Volume** | BU/팀별 세션 수, 쿼리 빈도 | 도입 성숙도 측정 |
| **Efficiency** | 응답 성공률, 토큰 소모량, API Latency, Dwell Time | 효율성 분석 |
| **Quality** | 사용자 만족도, 이상치 탐지(Outlier Detection) | 품질 저하 식별 |
| **Growth** | WAU/MAU 추이 | 서비스 확산 전략 조정 |

### Action Plan

**단기 (0-3개월):**
- 조직 특화 프롬프트 템플릿 배포
- 지연 시간 개선을 위한 캐싱 최적화
- 주간 사용량 모니터링 체계 가동

**중기 (3-6개월):**
- 부서별 토큰 예산 할당 및 최적화
- 사용량 기반 맞춤형 교육 프로그램 실시
- 경영진 보고용 KPI 대시보드 (Power BI) 연동

---

## 7. 보안 및 거버넌스

### 3중 보안 레이어

| 보안 계층 | 기술 | 설명 |
|----------|------|------|
| **Managed Identity** | Azure Managed Identity | 코드 내 자격 증명 노출 원천 차단 |
| **인프라 보안** | Azure AD (Entra ID) SSO + RBAC | 사용자 인증 및 접근 제어 |
| **콘텐츠 감사** | Azure OpenAI Content Filtering + Audit Log | 유해 응답 차단 및 질의 기록 |

**보안 원칙:** Zero Trust · 최소 권한 · 감사 추적성

---

## 8. 기대 효과

### 3대 핵심 성과

| 성과 | 내용 |
|------|------|
| **비용 효율성** | 조직별 사용량 분석을 통한 토큰 비용 최적화 및 불필요한 검색 시간 단축 |
| **생산성 극대화** | 기존 서비스 응답 지연 해결, 실시간 지식 어시스턴트 환경 구축, 지식 검색 시간 평균 70% 단축 |
| **데이터 주권 확보** | 외부 AI 차단 환경에서 내부 지식만 활용한 안전하고 신뢰할 수 있는 AI 서비스 |

### 3대 핵심 성공 요인 (KSF)

1. **기술적 무결성:** Python 3.12 비동기 아키텍처와 고성능 RAG 파이프라인의 안정적 운영
2. **사용자 경험 최적화:** Teams와의 긴밀한 통합 및 피드백 기반의 지속적 답변 품질 고도화
3. **데이터 거버넌스:** Managed Identity 및 감사 로그를 통한 엔터프라이즈 보안 요구사항 완벽 준수

### 실행 로드맵

| Phase | 내용 |
|-------|------|
| **Phase 1** | MVP 구축 — 핵심 RAG + Teams 봇 |
| **Phase 2** | 운영 최적화 — KPI 대시보드 + 피드백 루프 |
| **Phase 3** | 전사 확산 — 멀티 스페이스 + AI Agent |

---

*Confluence API 기반 AI 지식 서비스 — 현대오토에버 AI 전략팀*
