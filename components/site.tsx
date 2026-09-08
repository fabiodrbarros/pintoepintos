'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { company, projects, services, stats } from '@/lib/content';
const nav = [
  ['/projetos', 'Projetos'],
  ['/servicos', 'Serviços'],
  ['/sobre', 'Sobre nós'],
  ['/contactos', 'Contactos'],
];
function Brand() {
  return company.logo ? (
    <Image
      unoptimized
      width={240}
      height={70}
      src={company.logo}
      alt="Carpintaria Pinto & Pintos"
    />
  ) : (
    <>
      <span>CARPINTARIA</span>
      <strong>
        PINTO <i>&</i> PINTOS
      </strong>
    </>
  );
}
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="menu-trigger" aria-label="Abrir menu">
        <Menu />
      </SheetTrigger>
      <SheetContent className="mobile-panel" showCloseButton={false}>
        <SheetTitle>PINTO & PINTOS</SheetTitle>
        <SheetDescription>Carpintaria à medida</SheetDescription>
        <SheetClose className="menu-close" aria-label="Fechar menu">
          <X />
        </SheetClose>
        <nav>
          {[['/', 'Início'], ...nav].map(([url, label]) => (
            <Link key={url} href={url} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
export function Header() {
  const path = usePathname();
  return (
    <header className="header">
      <Link href="/" className="brand" aria-label="Pinto & Pintos — Início">
        <Brand />
      </Link>
      <nav className="desktop-nav">
        {nav.map(([url, label]) => (
          <Link
            aria-current={path === url ? 'page' : undefined}
            key={url}
            href={url}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link className="header-cta" href="/contactos">
        Vamos conversar <ArrowUpRight size={16} />
      </Link>
      <MobileMenu />
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Link className="brand" href="/">
          <Brand />
        </Link>
        <p>
          Da sua ideia.
          <br />À nossa matéria.
        </p>
        <Link className="text-link" href="/contactos">
          Começar um projeto <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Pinto & Pintos</span>
        <nav>
          {nav.map(([url, label]) => (
            <Link key={url} href={url}>
              {label}
            </Link>
          ))}
        </nav>
        <span>Feito com detalhe.</span>
      </div>
    </footer>
  );
}
export function Reveal({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.65 }}
    >
      {children}
    </motion.div>
  );
}
export function WoodPanels({
  size = 'large',
  position = 'center',
  perspective = 1,
  interactive = true,
}: {
  size?: 'large' | 'small';
  position?: 'center' | 'right';
  perspective?: number;
  interactive?: boolean;
}) {
  const reduced = useReducedMotion();
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });
  return (
    <motion.div
      className={`wood-panels ${size} ${position}`}
      animate={rotation}
      onPointerMove={(e) => {
        if (!interactive || reduced || e.pointerType === 'touch') return;
        const r = e.currentTarget.getBoundingClientRect();
        setRotation({
          rotateX:
            (-(e.clientY - r.top - r.height / 2) / r.height) * 3 * perspective,
          rotateY:
            ((e.clientX - r.left - r.width / 2) / r.width) * 4 * perspective,
        });
      }}
      onPointerLeave={() => setRotation({ rotateX: 0, rotateY: 0 })}
      transition={{ duration: 0.5 }}
    >
      <Image
        unoptimized
        src="/wood-panels.png"
        alt="Três painéis: dois em madeira clara e um em madeira escura"
        width="1536"
        height="1024"
      />
    </motion.div>
  );
}
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="section-label">
      <span />
      {children}
    </div>
  );
}
export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>;
}
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Reveal className="page-intro">
      <SectionLabel>{label}</SectionLabel>
      <h1>{title}</h1>
      {children && <p className="lead">{children}</p>}
    </Reveal>
  );
}
export function ImageReveal({ src, alt }: { src: string; alt: string }) {
  return (
    <Reveal className="image-reveal">
      <Image
        unoptimized
        width={1671}
        height={941}
        src={src}
        alt={alt}
        loading="lazy"
      />
    </Reveal>
  );
}
export function ProjectItem({
  project,
}: {
  project: (typeof projects)[number];
}) {
  return (
    <Link className="project-item" href={`/projectos/${project.slug}`}>
      <ImageReveal src={project.image} alt={project.title} />
      <div className="project-caption">
        <div>
          <span>{project.category}</span>
          <h3>{project.title}</h3>
        </div>
        <ArrowUpRight />
      </div>
    </Link>
  );
}
export function ProjectGallery() {
  return (
    <div className="project-gallery">
      {projects.map((p) => (
        <ProjectItem key={p.slug} project={p} />
      ))}
    </div>
  );
}
export function Stats() {
  return stats.length ? (
    <div className="stats">
      {stats.map((s) => (
        <div key={s.label}>
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  ) : null;
}
export function Home() {
  return (
    <>
      <section className="hero">
        <Reveal className="hero-copy">
          <SectionLabel>Carpintaria à medida</SectionLabel>
          <h1>
            Mais do que madeira,
            <br />
            <span>realizamos ideias.</span>
          </h1>
          <p>
            Projetamos, fabricamos e instalamos soluções à medida, com a
            qualidade e o rigor de quem trabalha a madeira há gerações.
          </p>
          <Link className="button" href="/projetos">
            Conheça os nossos projetos <ArrowUpRight size={18} />
          </Link>
        </Reveal>
        <WoodPanels position="right" />
        <div className="hero-foot">
          <span>Madeira. Rigor. Identidade.</span>
          <a href="#essencia">
            Descubra a nossa essência <span>↓</span>
          </a>
          <span>Arcos de Valdevez</span>
        </div>
      </section>
      <section id="essencia" className="section essence">
        <SectionLabel>A nossa essência</SectionLabel>
        <Reveal>
          <SectionHeading>
            O que imagina.
            <br />
            <span>O que sabemos fazer.</span>
          </SectionHeading>
          <div className="essence-bottom">
            <p>
              O trabalho começa por ouvir. Damos forma a cada ideia com atenção
              ao espaço, aos materiais e aos detalhes que fazem a diferença.
            </p>
            <Link className="text-link" href="/sobre">
              Conheça a Pinto & Pintos <ArrowUpRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
      <section className="section work">
        <div className="section-top">
          <div>
            <SectionLabel>Matéria & inspiração</SectionLabel>
            <SectionHeading>Espaços com identidade.</SectionHeading>
          </div>
          <Link href="/projetos" className="text-link">
            Explorar projetos <ArrowUpRight size={18} />
          </Link>
        </div>
        <ProjectGallery />
      </section>
      <section className="section services">
        <SectionLabel>O que fazemos</SectionLabel>
        <div>
          <SectionHeading>
            À medida do seu espaço.
            <br />
            <span>À medida da sua vida.</span>
          </SectionHeading>
          {services.map(([title], i) => (
            <Link className="service-row" href="/servicos" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <ArrowUpRight size={21} />
            </Link>
          ))}
        </div>
      </section>
      <CallToAction />
    </>
  );
}
export function CallToAction() {
  return (
    <section className="cta section">
      <SectionLabel>Começa com uma ideia</SectionLabel>
      <div>
        <h2>
          Vamos dar forma
          <br />
          ao seu próximo projeto.
        </h2>
        <Link className="button" href="/contactos">
          Fale connosco <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function ProjectsPage() {
  return (
    <>
      <div className="section">
        <PageIntro
          label="Projetos"
          title={
            <>
              A madeira transforma.
              <br />
              <span>O espaço ganha vida.</span>
            </>
          }
        >
          Cada espaço começa com uma ideia.
        </PageIntro>
        <p className="editorial-note">
          Estudos visuais de referência. O portefólio de obras realizadas será
          apresentado em breve.
        </p>
        <ProjectGallery />
      </div>
      <CallToAction />
    </>
  );
}
export function ServicesPage() {
  return (
    <>
      <section className="section">
        <PageIntro
          label="Serviços"
          title={
            <>
              Da primeira ideia
              <br />
              <span>ao último detalhe.</span>
            </>
          }
        >
          Projetamos, fabricamos e instalamos soluções à medida.
        </PageIntro>
        <div className="service-details">
          {services.map(([title, description], i) => (
            <Reveal key={title} className="service-detail">
              <span className="index">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <Link className="text-link" href="/contactos">
                Falar sobre o meu projeto <ArrowUpRight size={18} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="section process">
        <SectionLabel>Como trabalhamos</SectionLabel>
        <Process />
      </section>
      <CallToAction />
    </>
  );
}
function Process() {
  return (
    <div className="process-grid">
      {[
        [
          'Ouvir & projetar',
          'Compreender a ideia, o espaço e as necessidades. Definir materiais e desenhar a solução.',
        ],
        [
          'Fabricar & aperfeiçoar',
          'Aliar o saber-fazer da carpintaria à precisão da tecnologia, com atenção a cada acabamento.',
        ],
        [
          'Instalar & cuidar',
          'Levar o trabalho até ao espaço e cuidar dos detalhes da instalação.',
        ],
      ].map(([title, text], i) => (
        <div key={title}>
          <span className="index">0{i + 1}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}
export function AboutPage() {
  return (
    <>
      <section className="section about-intro">
        <PageIntro
          label="Sobre nós"
          title={
            <>
              Mais do que madeira,
              <br />
              <span>realizamos ideias.</span>
            </>
          }
        >
          Projetamos, fabricamos e instalamos soluções à medida, com a qualidade
          e o rigor de quem trabalha a madeira há gerações.
        </PageIntro>
        <WoodPanels size="small" />
      </section>
      <section className="section essence">
        <SectionLabel>Saber-fazer</SectionLabel>
        <div>
          <SectionHeading>
            Respeito pela matéria.
            <br />
            <span>Dedicação a cada ideia.</span>
          </SectionHeading>
          <div className="body-columns">
            <p>
              Na Pinto & Pintos, cada projeto nasce do encontro entre uma ideia
              e o saber-fazer da carpintaria. Trabalhamos a madeira para criar
              soluções que respondem ao espaço e a quem o vive.
            </p>
            <p>
              O conhecimento da matéria alia-se à tecnologia e ao desenho. Do
              fabrico à montagem, a atenção ao detalhe acompanha todas as
              etapas.
            </p>
          </div>
          <Stats />
        </div>
      </section>
      <ImageReveal
        src="/wood-composition.png"
        alt="Estudo visual da composição em madeira da marca"
      />
      <section className="section process">
        <SectionLabel>O nosso processo</SectionLabel>
        <Process />
      </section>
      <CallToAction />
    </>
  );
}
export function ContactForm() {
  const [status, setStatus] = useState('');
  return (
    <form
      className="contact-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const field = (key: string) => {
          const value = data.get(key);
          return typeof value === 'string' ? value : '';
        };
        const body = `Nome: ${field('name')}\nEmail: ${field('email')}\nTelefone: ${field('phone')}\n\n${field('message')}`;
        window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Pedido de projeto — ' + field('name'))}&body=${encodeURIComponent(body)}`;
        setStatus(
          'O pedido foi preparado no seu programa de email. Conclua o envio nessa aplicação.',
        );
      }}
    >
      <h2>Conte-nos a sua ideia.</h2>
      <div className="form-grid">
        <label>
          Nome *
          <input
            autoComplete="name"
            name="name"
            required
            placeholder="O seu nome"
          />
        </label>
        <label>
          Email *
          <input
            autoComplete="email"
            name="email"
            type="email"
            required
            placeholder="O seu email"
          />
        </label>
        <label className="full">
          Telefone
          <input
            autoComplete="tel"
            name="phone"
            type="tel"
            placeholder="O seu contacto telefónico"
          />
        </label>
        <label className="full">
          O seu projeto *
          <textarea
            name="message"
            required
            rows={4}
            placeholder="O que gostaria de criar?"
          />
        </label>
      </div>
      <p className="form-note">
        Os dados introduzidos destinam-se apenas à resposta ao seu pedido. O
        pedido é enviado através do seu programa de email.
      </p>
      <button className="button" type="submit">
        Preparar pedido por email <ArrowUpRight size={18} />
      </button>
      <output className="form-status">{status}</output>
    </form>
  );
}
export function ContactPage() {
  return (
    <section className="section contact">
      <div>
        <PageIntro
          label="Contactos"
          title={
            <>
              Vamos dar forma
              <br />
              ao seu próximo
              <br />
              <span>projeto.</span>
            </>
          }
        />
        <div className="contact-data">
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a href="tel:+351258518100">{company.phone}</a>
          <span className="form-note">Chamada para a rede fixa nacional</span>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=41.871598,-8.4303126"
            target="_blank"
            rel="noreferrer"
          >
            {company.address} ↗
          </a>
        </div>
        <WoodPanels size="small" />
      </div>
      <ContactForm />
    </section>
  );
}
export function ProjectDetail({ slug }: { slug: string }) {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return null;
  return (
    <>
      <section className="section">
        <Link className="text-link" href="/projetos">
          ← Todos os projetos
        </Link>
        <PageIntro label={project.category} title={project.title}>
          {project.description}
        </PageIntro>
        <ImageReveal src={project.image} alt={project.title} />
        <p className="editorial-note">
          Imagem de referência fornecida para o design. Não representa uma obra
          realizada.
        </p>
        <Link
          className="text-link"
          href={`/projectos/${projects.find((p) => p.slug !== slug)!.slug}`}
        >
          Próximo estudo →
        </Link>
      </section>
      <CallToAction />
    </>
  );
}
