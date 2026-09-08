import { ProjectDetail } from '@/components/site';
import { projects } from '@/lib/content';
import { notFound } from 'next/navigation';
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!projects.some((p) => p.slug === slug)) notFound();
  return <ProjectDetail slug={slug} />;
}
