import type { Metadata } from 'next';
import { ProjectDetail } from '@/components/site';
import { projects } from '@/lib/content';
import { pageMetadata } from '@/lib/site-metadata';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);

  return pageMetadata(
    project?.title ?? 'Projeto',
    project?.services ?? 'Projeto realizado pela Carpintaria Pinto & Pintos.',
    `/projectos/${slug}`,
  );
}

export default async function Page({
  params,
}: Props) {
  const { slug } = await params;
  if (!projects.some((p) => p.slug === slug)) notFound();
  return <ProjectDetail slug={slug} />;
}
