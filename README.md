# 🚀 LaunchPilot

LaunchPilot is an AI-powered go-to-market copilot that helps founders transform a product idea into a complete launch strategy through customer research, positioning, messaging, content creation, and growth planning.

## 🌐 Live Demo

**LaunchPilot:** _https://launch-pilot1.vercel.app_

## ✨ Features

### Product Intelligence

* Analyze product positioning
* Identify customer pain points  
* Discover competitive advantages
* Generate strategic insights

### Audience Discovery

* Define ideal customer profiles
* Identify user motivations
* Understand buying triggers
* Discover acquisition channels

### Messaging Engine

* Generate positioning statements
* Create value propositions
* Develop marketing hooks
* Build messaging frameworks

### Content Engine

* Generate content ideas
* Create social media content
* Plan content calendars
* Produce campaign concepts

### Growth Experiments

* Generate growth hypotheses
* Plan acquisition experiments
* Track opportunities
* Prioritize initiatives

### Persistence

* User authentication
* Product storage
* Generation history
* Workspace restoration

### Authentication

* Google OAuth Login
* Email & Password Authentication
* Persistent User Sessions
* Secure Workspace Access

### GTM Dashboard

* Project Tracking
* Generation Analytics
* Most Used Module Tracking
* Last Generated Asset Tracking
* Growth Funnel Visualization
  
---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* Recharts
* Lucide React

### Backend

* Vercel Serverless Functions

### Database & Authentication

* Supabase

### AI

* Groq API
* Llama 3.3 70B

### Deployment

* Vercel

---

## 📸 Screenshots

### Login & Authentication
?????????????????????????????????????

### Mission Setup
<img width="960" height="502" alt="image" src="https://github.com/user-attachments/assets/e45cebda-99bd-47af-8977-ccd260037899" />


### Product Intelligence
<img width="960" height="503" alt="image" src="https://github.com/user-attachments/assets/8a4b8ab5-24aa-4928-adbc-6057bb56ed5a" />


### GTM Dashboard
<img width="960" height="501" alt="image" src="https://github.com/user-attachments/assets/3a404be0-8822-43e0-b285-161d8a88602e" />



---

## 🏗 Architecture

User
 ↓
React + Vite Frontend
 ↓
Supabase Authentication
 ↓
LaunchPilot Workspace
 ↓
Vercel Serverless API
 ↓
Groq Llama 3.3 70B
 ↓
Generated GTM Assets
 ↓
Supabase Storage & Analytics

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/nuthanbaskar01-jpg/launch-pilot.git
cd launch-pilot
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### Run Development Server

```bash
npm run dev
```

---
