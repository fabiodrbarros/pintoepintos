import { redirect } from 'next/navigation';
import { AdminLogin } from '@/components/admin';
import { isAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect('/admin');
  return <AdminLogin />;
}
