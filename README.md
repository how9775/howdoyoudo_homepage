# 기업 웹페이지 리뉴얼 — HOWDOYOUDO

> 기존 WordPress 기반 기업 웹사이트를 Next.js 15 풀스택으로 전면 리뉴얼한 프로젝트

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **프로젝트명** | 기업 웹페이지 리뉴얼 |
| **개발 기간** | 2025.11 ~ 2025.11 (1개월) |
| **개발 인원** | FE + BE (1인) |
| **배포 URL** | [howdoyoudo.kr](https://howdoyoudo.kr) |

### 요약 설명

기존 WordPress 기반 기업 웹사이트를 Next.js로 전면 리뉴얼한 프로젝트입니다.<br/>
검색 노출 강화를 위한 SEO 구조 개선, 모바일 UI 최적화, Contact 페이지 문의 메일 기능을 중심으로 개발했습니다.<br/>
기업 소개·연혁·작업물 목록을 가독성과 탐색성이 높도록 재구성하여 정보 전달력을 개선했습니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| **Framework** | Next.js 15 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 4 |
| **Animation** | Framer Motion, GSAP, Lenis (Smooth Scroll) |
| **Database** | MySQL (외부 DB) |
| **Storage** | Cloudflare R2 (S3 호환) |
| **Auth** | JWT (jsonwebtoken + jose) + bcrypt |
| **Email** | Nodemailer (SMTP) |
| **Form** | React Hook Form + Zod |
| **Map** | Kakao Maps SDK |
| **Chart** | Recharts |
| **Icons** | Lucide React |

---
### 디렉토리 구조

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # 루트 레이아웃 (메타데이터, SEO)
│   ├── page.tsx                # 홈페이지 (Hero + Gallery)
│   ├── about/                  # 회사 소개 (3D 스크롤 인터랙션)
│   ├── works/                  # 포트폴리오 목록 + 상세
│   │   └── [id]/               # 동적 라우팅 (작업물 상세)
│   ├── history/                # 연혁
│   ├── reel/                   # 릴 영상
│   ├── contact/                # 문의 (폼 + 지도)
│   └── api/                    # REST API (21개 엔드포인트)
│       ├── works/              # 작업물 조회 API
│       ├── contact/submit/     # 문의 메일 발송
│       ├── admin/auth/         # 인증 (login/logout/session)
│       ├── admin/works/        # 작업물 관리 API
│       ├── admin/categories/   # 카테고리 관리
│       ├── admin/settings/     # 설정 관리
│       └── admin/history/      # 연혁 관리
├── components/                 # React 컴포넌트
│   ├── layout/                 # Header, Footer
│   ├── sections/               # HeroSection, ImageGallery, PageHeader
│   ├── contact/                # ContactForm, ContactInfo, SocialLinks
│   ├── admin/                  # LoginForm, WorkForm, ImageUploader 등
│   └── ui/                     # Logo, KakaoMap, CTAButton, ScrollToTop
├── lib/                        # 서버 유틸리티
│   ├── jwt.ts / jwt-edge.ts    # JWT 토큰 생성·검증
│   ├── validation.ts           # 입력값 검증·살균(Sanitize)
│   ├── rateLimiter.ts          # IP 기반 요청 제한
│   ├── emailService.ts         # SMTP 메일 발송
│   └── gtag.ts                 # Google Analytics
├── utils/                      # DB 연결
│   ├── supabase.ts             # Supabase 클라이언트
│   └── db.ts                   # MySQL 커넥션 풀
├── types/                      # TypeScript 타입 정의
├── hooks/                      # Custom React Hooks
└── styles/                     # 글로벌 CSS (Tailwind)
```


## 기술 목표


### CMS 아키텍처

관리자가 별도의 외부 도구 없이 웹사이트 콘텐츠를 직접 관리할 수 있는 CMS를 구축했습니다.

**Admin CMS 기능 구조**

```
/admin
├── dashboard        통계 대시보드 (방문자, 문의, 작업물 현황)
├── works
│   ├── (list)       작업물 목록 (필터, 검색, 페이지네이션)
│   ├── new          작업물 등록 (이미지 R2 업로드, 카테고리 선택)
│   └── [id]/edit    작업물 수정
├── history          연혁 관리 (CRUD)
├── analytics        Google Analytics 연동 분석
└── settings
    ├── general      기본 정보 설정
    ├── contact      연락처 정보 관리
    └── introduction 소개 콘텐츠 관리
```

### SEO 최적화 구조 설계

WordPress에서 마이그레이션하면서 검색 엔진 노출을 유지·강화하기 위한 SEO 구조를 설계

**적용 항목**

| 항목 | 구현 방식 |
|------|----------|
| 메타데이터 | Next.js `Metadata` API로 페이지별 title, description, keywords 관리 |
| Open Graph | 페이지별 OG 이미지(1200x630), locale(ko_KR), type(website) 설정 |
| 사이트맵 | `robots.txt` + `sitemap.xml` 자동 생성 |
| 검색엔진 등록 | Google Search Console, Naver Search Advisor 사이트 인증 |
| 폰트 최적화 | `next/font`으로 FOUT/FOIT 방지 + `display: swap` |

---

### Cloudflare R2 기반 파일 관리 시스템

AWS S3 호환 API를 사용하는 Cloudflare R2를 파일 스토리지로 채택하여, 이미지 업로드와 설정 파일 관리를 구현

```
[Admin 이미지 업로드]
    │
    ▼
POST /api/admin/works/upload
    │  ① 파일 유효성 검사
    │  ② @aws-sdk/client-s3로 R2 버킷에 업로드
    │  ③ R2 Public Domain 기반 URL 반환
    ▼
[R2 Bucket: howdoyoudo]
    ├── images/          작업물 이미지
    └── files/config/    설정 파일 (contact.config.json 등)
```

---

### 문의 메일 발송 시스템

Contact 페이지에서 사용자가 작성한 문의를 SMTP를 통해 기업 이메일로 전달하는 시스템을 구현했습니다.

- **SMTP 프로바이더**: Mailplug (`smtp.mailplug.co.kr:465`, TLS)
- **이메일 템플릿**: 테이블 기반 HTML (메일플러그, Gmail, Outlook 등 모든 메일 클라이언트 호환)
- **보안**: Rate Limiting + Honeypot + 입력 Sanitize로 스팸·악용 방지
- **수신 주소**: R2에 저장된 `contact.config.json`에서 동적으로 로드 (CMS에서 주소 변경 가능)