# SyncFlow 🔄

> **The Ultimate Multi-Platform Data Sync Hub.**

SyncFlow is a powerful, Supabase-native integration platform designed to bridge the gap between static data (Excel/CSV) and modern CRM/Invoicing systems. With a "Dark Luxe" aesthetic and a high-performance Bento-box dashboard, SyncFlow makes complex data mapping feel effortless.

![SyncFlow Hero](/path/to/hero_image.png)

## ✨ Features

- **Multi-Source Ingestion**: Seamlessly upload and process Excel sheets and CSV files.
- **Smart Mapping**: A visual field mapper that allows you to link source columns to target API fields with just a few clicks.
- **Supabase Integration**: Robust data storage and real-time capabilities powered by Supabase.
- **Real-time Monitoring**: A beautiful Bento-box dashboard providing instant insights into sync health and record impact.
- **Premium UI**: Built with a "Premium Dark Luxe" theme, featuring glassmorphism and smooth Framer Motion animations.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Framer Motion, Lucide Icons, Vanilla CSS.
- **Backend**: Supabase (Database, Auth, Storage).
- **Deployment**: Vercel.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase Project (URL & Anon Key)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/syncflow.git
   cd syncflow
   ```

2. **Setup Environment Variables**:
   In the `client` directory, create a `.env.local` file with:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Locally**:
   ```bash
   npm install
   npm run dev
   ```

## 📂 Project Structure

```text
├── client/          # React + Vite Frontend
├── package.json     # Root configuration
└── vercel.json      # Vercel deployment configuration
```

## 🚀 Deployment (Vercel)

1. Push your code to a GitHub repository.
2. Connect your repository to [Vercel](https://vercel.com).
3. Set the following Environment Variables in the Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with precision by the SyncFlow Team.
