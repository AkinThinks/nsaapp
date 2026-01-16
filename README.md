# SafetyAlerts Nigeria

A real-time community safety alert PWA for Nigeria. Report incidents, receive instant notifications, and help keep your community safe.

## Features

### User App (`/app`)
- **Real-time Alerts** - Get instant push notifications for incidents in your monitored areas
- **Report Incidents** - Submit reports with location, type, and description
- **Community Verification** - Confirm or deny reports to build trust scores
- **Multiple Areas** - Monitor home, work, and anywhere you care about
- **Offline Support** - View cached alerts even without internet

### Admin Dashboard (`/admin`)
- **Report Moderation** - Approve or remove reports with audit trail
- **User Management** - View users, issue warnings, suspend or ban
- **Team Management** - Invite admins with role-based permissions
- **Audit Log** - Complete history of all admin actions
- **Analytics Dashboard** - Reports today, active alerts, user stats

## Tech Stack

- **Next.js 14** - App Router, Server Components, API Routes
- **Supabase** - PostgreSQL database, real-time subscriptions, RLS
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **next-pwa** - Service worker, offline support, installable
- **Africa's Talking** - SMS OTP for phone verification
- **Web Push** - Browser push notifications

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Africa's Talking account (for SMS)

### 1. Clone and Install

```bash
git clone https://github.com/your-repo/nigeria-security-alert.git
cd nigeria-security-alert
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Authentication
ADMIN_JWT_SECRET=generate_a_secure_random_string_here

# Africa's Talking SMS
AT_API_KEY=your_api_key
AT_USERNAME=your_username  # or "sandbox" for testing

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

### 3. Setup Database

Run the SQL schemas in your Supabase SQL Editor:

1. `scripts/database-schema.sql` - Main app tables
2. `scripts/admin-schema.sql` - Admin dashboard tables

### 4. Create First Admin

```bash
npx tsx scripts/create-first-admin.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── app/                   # User PWA
│   │   ├── page.tsx          # Alert feed
│   │   ├── report/           # Report incident
│   │   ├── alert/[id]/       # Alert details
│   │   ├── settings/         # User settings
│   │   └── onboarding/       # First-time setup
│   ├── admin/                 # Admin dashboard
│   │   ├── page.tsx          # Dashboard home
│   │   ├── login/            # Admin login
│   │   ├── reports/          # Report management
│   │   ├── users/            # User management
│   │   ├── team/             # Admin team
│   │   ├── audit-log/        # Audit trail
│   │   └── settings/         # System settings
│   └── api/                   # API routes
├── components/
│   ├── admin/                # Admin UI components
│   ├── app/                  # User app components
│   ├── landing/              # Landing page components
│   └── ui/                   # Shared UI components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities and helpers
└── types/                    # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Environment variables needed in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_JWT_SECRET`
- `AT_API_KEY`
- `AT_USERNAME`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

### Cron Jobs

The `vercel.json` configures a keep-alive cron job that runs every 12 hours to prevent Supabase from pausing on free tier.

## Admin Roles

| Role | Permissions |
|------|-------------|
| `super_admin` | Full access, manage other admins |
| `admin` | Full access except system settings |
| `moderator` | Review reports, warn users |
| `analyst` | View analytics, export data |
| `support` | View users, handle appeals |

## API Endpoints

### Auth
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP and login

### Reports
- `GET /api/reports` - List reports (with area filter)
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `POST /api/reports/[id]/confirm` - Confirm/deny report

### Admin
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/reports` - List all reports
- `POST /api/admin/reports/[id]/moderate` - Approve/remove report
- `GET /api/admin/users` - List users
- `POST /api/admin/users/[id]/warn` - Warn user
- `POST /api/admin/users/[id]/ban` - Ban user

## License

MIT License - Built by [Thinknodes Innovation Lab](https://thinknodes.com)

## Support

- Email: akin@thinknodes.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)
