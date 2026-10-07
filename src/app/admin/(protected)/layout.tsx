import { Button } from '@/components/ui/button';
import { requireAdmin } from '@/lib/auth/admin';
import { signOut } from './actions';
import { AdminNav } from './AdminNav';

// The admin chrome. proxy.ts only checks for some session, and this layout's check guards only
// the chrome (the email it shows): Next can render a page without its layout, and a layout's
// redirect still streams the page. So every page, action and route handler under /admin calls
// requireAdmin() itself (tests/admin-gate.test.ts). It's memoised per request, so this costs nothing extra.
export default async function ProtectedAdminLayout({ children }: LayoutProps<'/admin'>) {
  const admin = await requireAdmin();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-rc-line py-2">
        <AdminNav />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-rc-muted">
            Signed in as <span className="break-all text-rc-text">{admin.email}</span>
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </div>
      </div>
      {children}
    </>
  );
}
