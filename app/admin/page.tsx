import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin';
import { isAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  return <AdminDashboard />;
}
