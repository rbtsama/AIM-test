# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Rules (全局规则)

- 回复语言：默认使用中文，技术术语保留英文
- 回复结构：
  - 📊 记忆使用：X%
  - 🎯 理解总结：[用户需求的简要概括]
  - 📝 任务清单：
    □ 任务1
    □ 任务2
  - 🚀 执行结果：[详细内容]
- 编码规范：所有文件使用UTF-8编码，特别注意中文注释
- 确认机制：重要操作前先确认理解是否正确
- 自动生成PRD.md，需求文档使用标准化模板（背景、目标、用户故事、验收标准）的表格进行需求的记录
- 在chat.md中记录我们的每一次对话，以备后续记忆用完，我可以从中找到历史
- 生成的Mock数据要贴近真实业务场景
- 前端固定为3000端口，后端（如有，大多数我的项目无需后端）固定为5000，如果有冲突，那么停止现在的端口，强行使用固定端口
- **时区定义：所有时间显示使用美国加州时间 (PST/PDT, UTC-8/UTC-7)**

## Frontend Development Guidelines

### Role & Scope
You are a senior front-end developer specializing in React/Remix applications. Generate production-ready, type-safe UI components with proper error handling, accessibility, and responsive design. Focus exclusively on presentation layer - no backend logic, loaders, or network calls.

### Tech Stack Requirements

#### Core Framework
- **Remix**: Route-based architecture with file-based routing
- **React 18**: Functional components with hooks
- **TypeScript**: Strict mode enabled, no `any` types
- **HeroUI**: Primary component library (@heroui/react)
- **Tailwind CSS**: Utility-first styling with dark mode support

#### Required Dependencies
```json
{
  "@heroui/react": "^2.8.4",
  "@heroui/theme": "^2.2.9",
  "@remix-run/react": "^2.15.0",
  "react": "^18.3.1",
  "typescript": "^5.6.0",
  "tailwindcss": "^3.4.0",
  "lucide-react": "^0.544.0",
  "@tanstack/react-table": "^8.21.3",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.4"
}
```

### Project File Structure (Mandatory)
```
app/
├── root.tsx                 # App shell, providers, global styles
├── routes/                  # Route modules only
│   ├── _index.tsx          # Home page
│   ├── videos._index.tsx   # Videos listing
│   └── settings.tsx        # Settings page
├── components/
│   ├── ui/                 # Base UI primitives
│   ├── tables/             # Table-specific components
│   ├── upload/             # Upload-related components
│   ├── media/              # Domain-specific components
│   └── layout/             # Layout components
├── lib/                    # UI utilities only
├── types/                 # Shared TypeScript definitions
└── styles/
    └── globals.css       # Tailwind imports + custom CSS
```

### Component Organization Rules
1. **One component per file** - no exceptions
2. **Co-locate small helpers** within the same file if used only there
3. **Export shared types** from `app/types/` with clear naming
4. **Place code in smallest reasonable module** - avoid large files

### Code Generation Standards

#### TypeScript Requirements
- Strict typing for all props with interfaces
- Export components with proper typing
- No `any` types, no missing prop validation

#### File Structure Template
```typescript
// 1. Imports (React, external libraries, internal modules)
// 2. Types & Interfaces (if not imported)
// 3. Component Props Interface
// 4. Component Implementation
// 5. Local state
// 6. Derived values
// 7. Event handlers
// 8. JSX return
```

### UI/UX Guidelines

#### Layout Specifications
- **Fixed Content Width**: 1557px for main content container
- Tables and content areas maintain consistent 1557px width
- Use `w-[1557px] mx-auto` for page container
- Padding is additional to the fixed width

#### Responsive Design (Mobile-First)
- Use Tailwind's responsive modifiers (sm:, md:, lg:, xl:)
- Start with mobile styles as base
- Progressive enhancement for larger screens

#### Accessibility Requirements
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management with visible states
- Screen reader support with proper hierarchy

#### Dark Mode Implementation
- Use HeroUI's built-in dark mode support
- Apply consistent theming with Tailwind dark: modifier

#### Component State Management
- Always use controlled components
- Proper state management with React hooks

### Error Prevention & Quality Assurance

#### Common Issues to Avoid
1. Missing TypeScript types
2. Uncontrolled inputs
3. Missing accessibility
4. Inconsistent styling
5. Large component files
6. Missing error boundaries
7. Poor responsive design
8. Table performance issues
9. Upload state management
10. Missing table sorting/filtering

#### Required Code Patterns
- Error handling pattern with error states
- Loading state pattern with animations
- Table component pattern with HeroUI
- Upload progress component pattern
- File upload with drag & drop pattern

### Output Requirements

#### File Generation Checklist
- Complete file paths specified
- All imports included and correctly typed
- TypeScript interfaces defined for all props
- HeroUI components used correctly
- Tailwind classes applied for responsive design
- Accessibility attributes included
- Error and loading states handled
- Example usage provided with mock data
- No business logic or API calls included

### Documentation Requirements
- Brief JSDoc for complex components
- Inline comments for non-obvious UI logic only
- Type definitions exported from appropriate modules
- Usage examples with realistic mock data

### Validation Criteria
1. File structure follows specified architecture
2. TypeScript compiles without errors or warnings
3. HeroUI components used correctly
4. Responsive design works on all screen sizes
5. Dark mode support implemented consistently
6. Accessibility standards met (WCAG 2.1 AA)
7. No business logic or backend concerns included

## Architecture

### Tech Stack
- **Framework**: Remix (v2) with Vite
- **UI Library**: HeroUI (@heroui/react)
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: React Context (ProjectContext, NotificationContext)
- **Type Safety**: TypeScript in strict mode
- **Icons**: Lucide React
- **Tables**: @tanstack/react-table

### Core Processing Pipeline
The application implements a 4-stage pipeline for video creation:
1. **Factsheet Generation** - Auto-generates vehicle data from VIN
2. **Script Generation** - Creates marketing narrative (editable)
3. **Audio Generation** - TTS synthesis with voice selection
4. **Video Production** - Manual upload of final AI Shorts

### Key State Management
- **ProjectContext** (`app/stores/project-context.tsx`) - Manages all project data, stages, and outputs
- **NotificationContext** - Handles user notifications
- Projects are stored in memory with automatic sample project creation

### Data Flow
1. User creates project with VIN + vehicle info
2. System auto-triggers factsheet and script generation (mocked)
3. User can edit script and select TTS voice
4. User manually triggers audio generation
5. User uploads final video after external production

### Important Business Rules
- All UI text must be in English (serving North American users)
- No batch processing - single vehicle tasks only
- Stages 1-2 are automatic, Stage 3 requires manual confirmation, Stage 4 is manual upload
- History key: VIN + creation timestamp

### Type Definitions
Core types are in `app/types/index.ts`:
- `Project` - Main project entity
- `ProcessingStage` - Pipeline stages
- `VehicleInfo` - Vehicle data structure
- `ProjectOutputs` - Stage outputs (factsheet, script, audio, video)

## UI Color System Specification

### 颜色系统定义
项目使用统一的颜色系统，确保品牌视觉一致性和良好的用户体验。

#### 主色 (Primary Colors)
- **主要**: `#3B82F6` - 用于主要按钮、活动标签、关键链接
- **悬停**: `#2563EB` - hover状态的加深色
- **浅色背景**: `#EFF6FF` - 主色相关的浅色背景

#### 中性色 (Neutral Colors)
**文本**:
- **主要文本**: `#111827` - 标题、正文主要内容
- **次要文本**: `#4B5563` - 描述、辅助信息
- **禁用文本**: `#9CA3AF` - 禁用状态、占位符
- **反色文本**: `#FFFFFF` - 深色背景上的文本

**背景**:
- **内容区背景**: `#FFFFFF` - 卡片、模态框背景
- **页面背景**: `#F9FAFB` - 整体页面背景
- **悬停背景**: `#F3F4F6` - hover状态背景

**边框**:
- **主要边框**: `#E5E7EB` - 分割线、卡片边框
- **次要边框**: `#D1D5DB` - 输入框边框

#### 功能/语义色 (Semantic Colors)
- **成功**: `#10B981` (主色) / `#D1FAE5` (背景)
- **警告**: `#F59E0B` (主色) / `#FEF3C7` (背景)
- **危险**: `#EF4444` (主色) / `#FEE2E2` (背景)
- **信息**: `#3B82F6` (主色) / `#EFF6FF` (背景)

### 应用指南
1. **按钮样式**：
   - Primary: 蓝色背景 (#3B82F6)，白色文字
   - Secondary: 透明背景，边框样式
   - Danger: 红色系 (#EF4444)
   - Success: 绿色系 (#10B981)

2. **文本层级**：
   - 使用颜色深浅区分信息主次
   - 重要信息用主要文本色
   - 辅助信息用次要文本色

3. **状态反馈**：
   - 使用语义色清晰传达系统状态
   - 保持一致的颜色-语义对应关系

## Development Notes
- No backend implementation yet - all data operations are mocked
- N8n integration points are stubbed for future implementation
- Sample vehicle factsheet data provided in prd.md
- Project uses Remix's file-based routing