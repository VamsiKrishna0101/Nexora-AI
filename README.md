# Nexora AI — Executive & Corporate Intelligence Platform

> Turn a name and a domain into a boardroom-ready intelligence dossier in minutes.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-multi--agent-blue)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Node.js-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-336791?style=flat&logo=postgresql)](https://www.postgresql.org)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-00B050?style=flat)](https://www.pinecone.io)

---

## What Is Nexora AI?

Nexora AI is a B2B SaaS intelligence platform that uses multi-agent AI pipelines to generate deep intelligence reports on companies and executives. Give it a company domain — it delivers a 12-section corporate dossier covering financials, tech stack, competitive landscape, leadership personas, and strategic signals. Give it a person's name and LinkedIn — it delivers a 12-node executive profile covering identity, personality, behavioral analysis, red flags, and an engagement playbook.

Built on LangGraph, FastAPI, and a Node.js/TypeScript backend with PostgreSQL persistence and Pinecone-powered RAG for on-demand chat and forensic insights.

---

## Key Features

**Company Intelligence**
- 12-section AI report: Executive Brief, Market Position, Product Intelligence, Financial Profile, Competitive Landscape, Technology Fingerprint, Talent & Org Intelligence, Leadership Personas, Content & Messaging, Strategic Signals, SWOT, Analyst Verdict
- Sections 1–10 run in parallel via a thread pool; SWOT and Verdict synthesize sequentially after join
- RAG indexing of the full report into Pinecone post-generation for on-demand AI Insights cards
- Company-to-company comparison with forensic analysis per theme

**Persona Deep Dive**
- 12-node sequential LangGraph pipeline: Identity → Professional Background → Skills & Expertise → Personality → Online Presence → Content & Thought Leadership → Social Post Intelligence → Network Influence → Achievements → Red Flags → How to Engage → Analyst Verdict
- Multi-source data fusion: LinkedIn profile, LinkedIn posts, Twitter/X posts
- RAG-powered chat: ask any question about a saved persona report
- Forensic insights: on-demand deep analysis per theme (behavioral tension, adversarial modeling, network collision, strategic verdict)
- Persona-vs-persona comparison with 7 insight dimensions

**Platform**
- JWT-authenticated multi-user system with saved reports per user
- Full PPT export for both company and persona reports
- PDF export
- Subscription page with plan tiers
- Image proxy to bypass LinkedIn/Twitter CORS and referrer blocks

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│     Vite · TypeScript · TailwindCSS · shadcn/ui      │
└──────────────────────┬──────────────────────────────┘
                       │ REST
┌──────────────────────▼──────────────────────────────┐
│              Node.js / Express Backend               │
│         TypeScript · Prisma ORM · PostgreSQL         │
│  auth · company · persona · reports · compare · ...  │
└──────────────────────┬──────────────────────────────┘
                       │ internal HTTP
┌──────────────────────▼──────────────────────────────┐
│               Python AI Agent Service                │
│              FastAPI · LangGraph · Gemini            │
│                                                      │
│  Company Track                  Persona Track        │
│  ─────────────                  ─────────────        │
│  parallel_analysis (S01–S10)    identity_node        │
│       │                         professional_node    │
│      swot_node                  skills_node          │
│       │                         personality_node     │
│    verdict_node                 online_presence_node │
│                                 content_node         │
│                                 social_post_node     │
│                                 network_node         │
│                                 achievements_node    │
│                                 red_flags_node       │
│                                 how_to_engage_node   │
│                                 analyst_verdict_node │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
   ┌──────▼──────┐          ┌───────▼──────┐
   │  Pinecone   │          │  Gemini LLM  │
   │  Vector DB  │          │  + Groq      │
   │  (RAG/Chat) │          │  (agents)    │
   └─────────────┘          └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Gemini (google-genai) + Groq |
| Agent Orchestration | LangGraph |
| AI Backend | FastAPI + Python |
| App Backend | Node.js + Express + TypeScript |
| ORM / DB | Prisma + PostgreSQL |
| Vector DB | Pinecone |
| Data Enrichment | Apify, LinkedIn API, Twitter API |
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + shadcn/ui |
| Export | PptxGenJS (PPT) + PDF |
| Auth | JWT + bcrypt |

---

## Project Structure

```
Nexora-AI/
├── Agents/                   # Python AI agent service
│   ├── main.py               # FastAPI entry point — all agent endpoints
│   ├── src/                  # Company intelligence pipeline
│   │   ├── graph.py          # LangGraph graph (parallel + sequential)
│   │   ├── nodes.py          # 12 report section nodes
│   │   ├── state.py          # AppState definition
│   │   └── services/         # Per-section AI services + RAG
│   ├── persona/              # Persona deep dive pipeline
│   │   ├── graph.py          # 12-node sequential LangGraph graph
│   │   ├── nodes.py          # Node wiring + logging per run
│   │   ├── runner.py         # Pipeline entry point
│   │   ├── services/         # Per-node services (LinkedIn, Twitter, RAG, chat, forensic)
│   │   ├── compare/          # Persona comparison graph + 7 insight dimensions
│   │   ├── common/           # Auth, report saving, insight helpers
│   │   └── prompts/          # All LLM prompt templates
│   └── requirements.txt
│
├── Backend/                  # Node.js/TypeScript app backend
│   ├── server.ts             # Express entry point
│   ├── prisma/schema.prisma  # Full data model
│   └── src/modules/          # Feature modules
│       ├── auth/             # JWT auth
│       ├── companyData/      # Company enrichment
│       ├── companyEmployees/ # Employee/leadership data
│       ├── gather/           # Data aggregation (Mega-Object builder)
│       ├── reports/          # Report CRUD
│       ├── compare/          # Company comparison
│       ├── saved/            # Saved companies per user
│       ├── financials/       # Financial data
│       ├── techstack/        # Tech stack detection
│       ├── competitors/      # Competitor mapping
│       ├── newsfeed/         # Company news
│       ├── companyjobs/      # Job postings
│       └── linkedinposts/    # LinkedIn post scraping
│
└── Frontend/                 # React + TypeScript SPA
    └── src/
        ├── components/       # Company, Persona, Compare UI components
        ├── pages/            # Dashboard, CompanyList, PersonaList, Compare, etc.
        ├── utils/pptx/       # Persona PPT generator (PptxGenJS)
        ├── utils/company_pptx/ # Company PPT generator
        └── services/api.ts   # Typed API client
```

---

## API Endpoints

### Company Intelligence (Python)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/agents/full-report` | Generate 12-section company report from domain |
| POST | `/api/agents/full-report/raw` | Generate report from raw data object (testing) |
| POST | `/api/agents/company-forensic` | On-demand forensic insight for a company theme |

### Persona Deep Dive (Python)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/persona/deep-dive` | Run 12-node persona pipeline |
| POST | `/api/persona/chat` | RAG-powered chat on a saved persona report |
| POST | `/api/persona/compare` | Compare two persona reports |
| POST | `/api/persona/forensic-insight` | On-demand forensic insight per theme |
| POST | `/api/persona/compare/network` | Network collision insight |
| POST | `/api/persona/compare/dominance` | Executive dominance insight |
| POST | `/api/persona/compare/behavior` | Behavioral tension insight |
| POST | `/api/persona/compare/adversarial` | Adversarial modeling insight |
| POST | `/api/persona/compare/verdict` | Strategic verdict insight |

### App Backend (Node.js)
Full REST API covering auth, company data, employees, financials, tech stack, competitors, news, jobs, LinkedIn posts, reports, compare, and saved companies.

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Pinecone account
- Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Python Agent Service

```bash
cd Agents
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your API keys
uvicorn main:app --reload --port 8001
```

### Node.js Backend

```bash
cd Backend
npm install
cp .env.example .env      # Fill in DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx ts-node server.ts
```

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Environment Variables

**Agents `.env`**
```
GEMINI_API_KEY=
GROQ_API_KEY=
PINECONE_API_KEY=
PINECONE_INDEX=
BACKEND_URL=http://localhost:3000
```

**Backend `.env`**
```
DATABASE_URL=postgresql://user:password@localhost:5432/nexora
JWT_SECRET=
BACKEND_INTERNAL_SECRET=
```

**Frontend `.env.local`**
```
VITE_API_URL=http://localhost:3000
VITE_AGENT_URL=http://localhost:8001
```

---

## Data Model (key entities)

- **User** — auth, owns reports and saved companies
- **Report** — persona deep dive result per user + LinkedIn URL (deduplicated)
- **SavedCompany** — company tracked by a user (PARTIAL or DEEP_DIVE)
- **CompanyIntelligenceReport** — 12-section company report per user + domain
- **PersonaForensic / CompanyForensic** — on-demand forensic insight cache per theme
- **PersonaComparison** — comparison result between two persona reports
- **Domain / Company / Timeline / Employees / TechStack / Financials / Newsfeed / CompanyJobs / competitors** — enrichment data cache layer

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Nexora AI — Know who you're dealing with before the first meeting.*
