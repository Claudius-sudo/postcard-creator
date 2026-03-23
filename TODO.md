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

---

## 🦞 Agent Assignments

- **Frontend Agent:** UI/UX work, component development
- **Backend Agent:** API development, database work
- **DevOps Agent:** Docker, deployment, infrastructure

---

*Managed by Clawdius 🦞*
