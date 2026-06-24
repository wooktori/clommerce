# 바이모노

## Mission
Create implementation-ready, token-driven UI guidance for 바이모노 that is optimized for consistency, accessibility, and fast delivery across e-commerce storefront.

## Brand
- Product/brand: 바이모노
- URL: https://bymono.com/?srsltid=AfmBOopHz_kR49qXUxUHu4Eqjn0fSE6BZGAvlMRG-Sooh28Y5ocEBs0W
- Audience: online shoppers and consumers
- Product surface: e-commerce storefront

## Style Foundations
- Visual style: minimal, utility-first, accessibility-prioritized
- Main font style: `font.family.primary=Lato`, `font.family.stack=Lato, Pretendard, Apple SD Gothic Neo, 맑은 고딕, malgun gothic, 돋움, dotum, sans-serif`, `font.size.base=12px`, `font.weight.base=500`, `font.lineHeight.base=18px`
- Typography scale: `font.size.xs=10px`, `font.size.sm=11px`, `font.size.md=12px`, `font.size.lg=13px`, `font.size.xl=14px`, `font.size.2xl=15px`, `font.size.3xl=24px`, `font.size.4xl=28px`
- Color palette: `color.text.primary=#444444`, `color.surface.base=#000000`, `color.text.tertiary=#ffffff`, `color.text.inverse=#222222`
- Spacing scale: `space.1=2px`, `space.2=6px`, `space.3=8px`, `space.4=10px`, `space.5=15px`, `space.6=25px`, `space.7=50px`
- Radius/shadow/motion tokens: `motion.duration.instant=500ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (772), lists (248), buttons (238), inputs (126), navigation (3).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
