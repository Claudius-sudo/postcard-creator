# Postcard Creator - Project Todo List

## 🎯 Current Status
Last updated: 2026-03-23

---

## ✅ Completed

### Backend
- [x] FastAPI backend with PostgreSQL
- [x] Database schema for postcards, users, templates
- [x] File upload for images (PNG/JPG)
- [x] Reference images support (characters, scenes, events)
- [x] Google OAuth authentication
- [x] JWT token management
- [x] Rate limiting (100 req/hour)
- [x] Credit system (10 free credits)
- [x] API protection middleware

### Frontend
- [x] React + TypeScript + Tailwind setup
- [x] Single-page layout
- [x] Occasion selector (12 occasions)
- [x] Character showcase with 6 characters
- [x] Characters bounce in/out on scroll (parade effect)
- [x] Transparent backgrounds on characters
- [x] Before/after modal when clicking characters
- [x] Postcard editor with templates
- [x] Google Sign-In button
- [x] Auth context for user state
- [x] Credit display
- [x] Warm color palette (Nature Distilled)

### DevOps
- [x] Docker Compose setup
- [x] Tailscale access configured
- [x] GitHub repository
- [x] Auto-commit heartbeat (every 12 hours)

### Integrations
- [x] UI UX Pro Max skill
- [x] 21st.dev Magic MCP
- [x] Google Stitch MCP

---

## 🔄 In Progress

- [ ] ~~Focus mode when scrolling to bottom (zoom + fade effect)~~ - Reverted

---

## 📋 Pending / Future Features

### High Priority
- [ ] Add Google Client ID for authentication
- [ ] Nano Banana API integration for image generation
- [ ] Credit purchase system (Stripe)
- [ ] Email notifications for completed postcards

### Medium Priority
- [ ] **5x7 Portrait Card Preview with Scroll Transition**:
  - Preview window shows 5x7 portrait format card
  - As user scrolls: transitions from front page view to inner page view
  - Background stays faded out during this transition
  - After scrolling past inner page, reveal Print/Purchase options below
  - Smooth parallax-style card flip/transition effect

- [ ] **Meet the Characters Section** - Dedicated area for character images:
  - Create a "Meet the Characters" section on the page
  - Display character images in this dedicated area
  - Allow users to browse and select different characters
  - Show character details (name, style, description)
  - Link to character selection for postcard creation

- [ ] **Message Section Redesign** - Fun names, front/inside card split, AI generation:
  - Rename "Your Message" to something fun/playful
  - Split into two sections:
    - **"Picture Side"** - Text that appears on front of postcard
    - **"Inner Side"** - Text that appears inside the card
  - **"Shake It Up" button** (bottom right) - Generates new AI titles and inner card text
  - Button provides creative variations on demand
  - Update UI labels and placeholder text
  - Both sections clearly labeled and editable

- [ ] **Update Character Images** - Replace placeholder characters with uploaded assets:
  - Switch out current characters in CharacterShowcase.tsx
  - Use character images uploaded to assets folder
  - Update character data (names, styles) to match new images
  - Ensure transparent backgrounds work correctly

- [ ] **Character Card Updates** - Remove signage, fix before/after labels:
    - **"Picture Side"** - Text that appears on front of postcard
    - **"Inner Side"** - Text that appears inside the card
  - Update UI labels and placeholder text
  - Ensure both sections are clearly labeled and editable

- [ ] **Character Card Updates** - Remove signage, fix before/after labels:
  - Remove "click here" signage from characters
  - When clicked: Left side shows "Your Photo" (user's uploaded image)
  - Right side shows "Customized Photo" (AI character version displayed on page)
  - Update modal labels accordingly

- [ ] **Character Animation Refinement** - Reduce bounce, scroll with page:
  - Less bounce intensity on character entrance/exit
  - Characters should be static at fixed X% positions (left/right)
  - As user scrolls, characters move UP the screen with the scroll
  - Bounce in at their scroll threshold, then scroll normally with page
  - Bounce out when passing their exit threshold
  - More natural parallax effect rather than fixed overlay

- [ ] **Scroll-Based Preview Focus** - Progressive fade-out effect:
  - As user scrolls toward preview image, fade out surrounding elements
  - At 50% viewport (preview centered), everything except preview is faded out
  - Continue scrolling to reveal next steps: Print Card or Purchase JPEG
  - Smooth opacity transitions based on scroll position
  - Preview image remains sharp and centered throughout

- [ ] **Smart Text Customization System** - Multi-step personalization:
  - Ask user who the card is for (recipient name)
  - If Birthday: ask for age
  - Generate personalized messages using recipient name
  - Examples: "Happy birthday Natalie, here's to many more wonderful years with you!" or "Get well soon Sarah, we're all thinking about you"
  - Show 3-4 message options per occasion
  - Insert selected message as placeholder in editable text field
  - Allow user to freely edit/append to the text
  - Bottom right: "Revert to standard message" button
  - Preserve user's edits unless they explicitly revert
- [ ] More postcard templates (holiday, wedding, etc.)
- [ ] Custom font uploads
- [ ] Image filters/effects
- [ ] Share to social media
- [ ] Print and ship integration

### Low Priority
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics

---

## 🐛 Known Issues

- [ ] Frontend build warnings (version attribute in docker-compose)
- [ ] Need to add real character images (currently using placeholders)

---

## 🔐 Configuration Needed

1. **Google OAuth:**
   - GOOGLE_CLIENT_ID

2. **Nano Banana API:**
   - API key for image generation

3. **Stripe (for payments):**
   - STRIPE_PUBLIC_KEY
   - STRIPE_SECRET_KEY

---

## 📝 Notes

- **Live URL:** http://100.76.223.66:5173
- **GitHub:** https://github.com/Claudius-sudo/postcard-creator
- **Timezone:** AEST (Brisbane)
- **Heartbeat:** Daily at 7:00 AM

## 🦞 Agent Guidelines

When spawning sub-agents for postcard work, always include:
1. **Project URL:** http://100.76.223.66:5173 (include in completion summary)
2. **GitHub:** https://github.com/Claudius-sudo/postcard-creator
3. **Workspace path:** `/root/.openclaw/workspace/apps/postcard-creator`

---

## 🦞 Agent Assignments

- **Frontend Agent:** UI/UX work, component development
- **Backend Agent:** API development, database work
- **DevOps Agent:** Docker, deployment, infrastructure

---

*Managed by Clawdius 🦞*
