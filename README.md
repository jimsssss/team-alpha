# Team Andeng

A React/Vite workspace for team operations, published as a static site through GitHub Pages and backed by Supabase Auth and PostgreSQL.

## Production setup

1. Create a [Supabase](https://supabase.com) project.
2. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
3. In **Authentication → URL Configuration**, add your GitHub Pages URL to **Site URL** and **Redirect URLs**, for example `https://YOUR-GITHUB-USERNAME.github.io/team-alpha/`.
4. Register the trusted administrator through the site, then run the `update public.profiles ...` statement at the end of `supabase/schema.sql` with that user's email.
5. Copy `.env.example` to `.env.local` and fill in the project URL plus **publishable** key. Never use a Supabase `service_role` key in this frontend.
6. Test locally with `npm run dev`.
7. On GitHub, go to **Settings → Pages**, select **GitHub Actions** as the source.
8. In **Settings → Secrets and variables → Actions → Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
9. Push to `main`. The included GitHub Actions workflow builds and deploys the website.

## Development

```text
npm install
npm run dev
npm run build
npm run lint
```

## Security notes

- Authentication is handled by Supabase Auth; the application does not store passwords.
- Database access is protected by Row Level Security policies in `supabase/schema.sql`.
- New users are regular advisors by default. Promote administrators only through the Supabase SQL Editor or a future secured invitation flow.
- The public GitHub Pages site contains only the Supabase URL and publishable key. These are designed for browser use; access control comes from RLS.
