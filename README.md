# Robotics Club - VIT Chennai

Welcome to the official web platform for the **Robotics Club at Vellore Institute of Technology, Chennai**. 
This is a modern, responsive, and dynamic web application built to showcase the club's achievements, members, galleries, events, and collaborative partners.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js
- **Database / Auth**: Supabase (PostgreSQL, JWT Authentication)
- **Image CDN**: ImageKit
- **Email Service**: Resend API
- **Deployment Configuration**: Optimized for Vercel Serverless deployments.

## Features
- **Dynamic Content:** Members, Events, Gallery, and Collaborations fetch data dynamically from Supabase.
- **Admin Dashboard:** Secured with Supabase JWT Authentication. Only authorized users with `@vitstudent.ac.in` domain emails can request clearance or gain access.
- **Secure Certificate Verification:** Includes a robust OTP-based certificate validation and retrieval pipeline using the Resend API.
- **Form Submissions:** Contact and Recruitment forms integrated directly with the backend.

## Run Locally

**Prerequisites:** 
- Node.js (v18+)
- Active Supabase, ImageKit, and Resend accounts.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   RESEND_API_KEY=your_resend_api_key

   VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   ```
3. **Database Setup:**
   Run the queries found in `supabase_schema.sql` inside your Supabase SQL Editor to generate the necessary tables and Row Level Security (RLS) policies.

4. **Run the app:**
   ```bash
   npm run dev
   ```

## Deployment
This project is configured out-of-the-box for **Vercel**. 
Simply link this repository to your Vercel account, inject your Environment Variables, and Vercel's Node builder will automatically host the React frontend and deploy the Express API as Serverless Functions via the provided `vercel.json`.
