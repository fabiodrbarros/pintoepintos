'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  X,
  Ruler,
  Hammer,
  Wrench,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { catalogItems, company, projects, stats } from '@/lib/content';
import type { CmsCategory, CmsItem } from '@/lib/cms-types';
import { LanguageSelect, localized, translatedCatalogCategory, translatedCategory, useLocale } from '@/components/locale';
import { useCmsCategories, useCmsItems } from '@/components/use-cms';
import { PintoFlow } from '@/components/pinto-flow';
import StudioPanels from '@/components/studio-panels';
import { catalogCategories as defaultCatalogCategories, projectCategories as defaultProjectCategories } from '@/lib/categories';
import heroWoodLogo from '@/pinto-pintos-transicoes-codex/assets/wood-logo-reference.png';
const nav = [
  ['/catalogo', 'Catálogo', 1],
  ['/sobre', 'A Carpintaria', 2],
  ['/contactos', 'Contactos', 3],
] as const;
const catalogFallback: CmsItem[] = catalogItems.map((item, index) => ({
  id: item.id, kind: 'catalog', slug: item.id, category: item.id,
  title: { pt: item.title, en: '', fr: '' }, description: { pt: '', en: '', fr: '' },
  materials: { pt: '', en: '', fr: '' }, coverImage: item.image, images: [item.image],
  client: '', location: '', year: '', sortOrder: index, published: true,
}));
const projectFallback: CmsItem[] = projects.map((project, index) => ({
  id: project.slug, kind: 'project', slug: project.slug, category: project.category === 'Moradia' ? 'moradia' : 'espaco-comercial',
  title: { pt: project.title, en: '', fr: '' },
  description: { pt: project.services, en: '', fr: '' },
  materials: { pt: project.materials, en: '', fr: '' }, coverImage: project.image,
  images: project.images, client: project.client, location: project.location,
  year: project.date, sortOrder: index, published: true,
}));
const catalogCategoryFallback: CmsCategory[] = defaultCatalogCategories.map((category, index) => ({ id: category.value, kind: 'catalog', slug: category.value, name: { pt: category.label, en: '', fr: '' }, sortOrder: index }));
const projectCategoryFallback: CmsCategory[] = defaultProjectCategories.map((category, index) => ({ id: category.value, kind: 'project', slug: category.value === 'Moradia' ? 'moradia' : 'espaco-comercial', name: { pt: category.label, en: '', fr: '' }, sortOrder: index }));
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
export function MobileMenu({ editorial = false }: { editorial?: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const { t } = useLocale();
  const translatedNav = nav.map(([url, , translationIndex]) =>
    [url, t.nav[translationIndex]] as const,
  );
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="menu-trigger"
        aria-label={t.menu}
        aria-controls="site-navigation"
      >
        <span className="menu-lines" aria-hidden="true">
          <span />
          <span />
        </span>
      </SheetTrigger>
      <SheetContent
        id="site-navigation"
        className="pp-menu-panel"
        showCloseButton={false}
        aria-label={t.menu}
      >
        <div className="pp-menu-edge" aria-hidden="true" />
        <div className="pp-menu-face">
          <div className="pp-menu-head">
            <Link className="pp-menu-brand" href="/" onClick={() => setOpen(false)}>
              <Image
                src="/carpintaria-pintos-logo-menu-transparent.png"
                alt="Carpintaria Pinto & Pintos"
                width={2071}
                height={759}
                unoptimized
              />
            </Link>
            <SheetClose className="pp-menu-close" aria-label={t.close} autoFocus>
              <X aria-hidden="true" />
            </SheetClose>
          </div>

          <nav className="pp-menu-nav" aria-label={t.mainNavigation}>
            <ul className="pp-menu-list">
              {[['/', t.home] as const, ...translatedNav].map(([url, label]) => (
                <li className="pp-menu-item" key={url}>
                  <Link
                    className="pp-menu-link"
                    aria-current={path === url ? 'page' : undefined}
                    href={url}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <dl className="pp-menu-contacts">
            <div>
              <dt>{t.phone}</dt>
              <dd>
                <a href="tel:+351258518100">+351 {company.phone}</a>
                <small>{t.fixedCall}</small>
              </dd>
            </div>
            <div>
              <dt>{t.email}</dt>
              <dd><a href={`mailto:${company.email}`}>{company.email}</a></dd>
            </div>
          </dl>
          <div className="pp-menu-socials" aria-label={t.socialNetworks}>
            <a href="https://www.facebook.com/profile.php?id=61578810787879" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.2c-.4-.1-1.8-.2-3-.2-3 0-5 1.8-5 5v2H7v3h3v8z" /></svg>
            </a>
            <a href="https://www.instagram.com/carpintariapintos/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>

          <div className="pp-menu-bottom">
            <Link
              className="pp-menu-contact"
              href="/contactos"
              onClick={() => setOpen(false)}
            >
              {t.contact} <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <div className="pp-menu-foot">
              <span>Prozelo · Arcos de Valdevez</span>
              <LanguageSelect className="pp-menu-language" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export function Header() {
  const path = usePathname();
  const { t } = useLocale();
  const projectDetail = path.startsWith('/projectos/');
  const editorial =
    path === '/' ||
    path === '/contactos' ||
    path === '/sobre' ||
    path === '/sobre-studio' ||
    path.startsWith('/catalogo') ||
    projectDetail;
  return (
    <header
      className={`header ${editorial ? 'header-editorial' : ''}${projectDetail ? ' header-project-detail' : ''}`}
    >
      <nav className="desktop-nav">
        {nav.map(([url, , translationIndex]) => (
          <Link
            aria-current={path === url ? 'page' : undefined}
            key={url}
            href={url}
          >
            {t.nav[translationIndex]}
          </Link>
        ))}
      </nav>
      <Link className="header-cta" href="/contactos">
        {t.contact} <ArrowUpRight size={16} />
      </Link>
      {editorial && (
        <Link className="header-carpintaria" href="/sobre">
          {t.nav[2]}
        </Link>
      )}
      <MobileMenu editorial={editorial} />
    </header>
  );
}
export function Footer() {
  const { t } = useLocale();
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-identity">
          <Link className="footer-logo" href="/">
            <Image
              src="/carpintaria-pintos-logo-white.png"
              alt="Carpintaria Pinto & Pintos"
              width={400}
              height={121}
              unoptimized
            />
          </Link>
          <p>{t.siteTagline}</p>
          <span>{t.quality}</span>
          <a
            className="footer-funding"
            href="/cartaz-cpp.pdf"
            download="Cartaz_CPPv2-1.pdf"
            aria-label={t.fundingDownload}
          >
            <Image
              src="/financiamento-prr.png"
              alt={t.fundingLogosAlt}
              width={1040}
              height={203}
              unoptimized
            />
          </a>
        </div>

        <nav className="footer-navigation" aria-label={t.explore}>
          <strong>{t.explore}</strong>
          {nav.map(([url, , translationIndex]) => (
            <Link key={url} href={url}>
              {t.nav[translationIndex]}
            </Link>
          ))}
        </nav>

        <div className="footer-contacts">
          <strong>{t.nav[3]}</strong>
          <a href="tel:+351258518100">
            +351 {company.phone}
            <small>{t.fixedCall}</small>
          </a>
          <a href={`mailto:${company.email}`}>{company.email}</a>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=41.871598,-8.4303126"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rua 1 de Maio, nº 167
            <br />
            Portelinha, Prozelo
            <br />
            4970-285 Arcos de Valdevez
          </a>
          <div className="footer-socials">
            <a
              href="https://www.facebook.com/profile.php?id=61578810787879"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.2c-.4-.1-1.8-.2-3-.2-3 0-5 1.8-5 5v2H7v3h3v8z"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/carpintariapintos/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r=".8"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Carpintaria Pinto &amp; Pintos</span>
        <a
          href="https://www.livroreclamacoes.pt/Inicio/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.complaints}
        </a>
        <span>Prozelo · Portugal</span>
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
  navigation = false,
}: {
  size?: 'large' | 'small';
  position?: 'center' | 'right';
  perspective?: number;
  interactive?: boolean;
  navigation?: boolean;
}) {
  const reduced = useReducedMotion();
  const { t } = useLocale();
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
      {navigation && (
        <nav className="panel-navigation" aria-label={t.workshop}>
          {nav.slice(0, 3).map(([url, label], i) => (
            <Link
              className={`panel-link panel-link-${i + 1}`}
              href={url}
              key={url}
            >
              <span>{label}</span>
              <i />
              <small>0{i + 1}</small>
            </Link>
          ))}
        </nav>
      )}
    </motion.div>
  );
}

function AboutHeroLogo() {
  const reduced = useReducedMotion();

  return (
    <motion.figure
      className="about-hero-logo"
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 34,
              scale: 0.96,
              clipPath: 'inset(0 8% 0 8%)',
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        clipPath: 'inset(0 0% 0 0%)',
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image
        src={heroWoodLogo}
        alt="Logo da Pinto & Pintos formado por três painéis de madeira"
        priority
        sizes="(max-width: 767px) 115vw, (max-width: 1279px) 64vw, 58vw"
      />
    </motion.figure>
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
  return <PintoFlow />;
}
export function CallToAction() {
  const { t } = useLocale();
  return (
    <section className="cta section">
      <SectionLabel>{t.startWithIdea}</SectionLabel>
      <div>
        <h2>
          {t.contact1}
          <br />
          {t.contact2}
        </h2>
        <Link className="button" href="/contactos">
          {t.contact} <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [selectedItem, setSelectedItem] = useState<CmsItem | null>(null);
  const { locale, t } = useLocale();
  const cmsCatalog = useCmsItems('catalog', catalogFallback);
  const cmsCatalogCategories = useCmsCategories('catalog', catalogCategoryFallback);
  const usedCategories = new Set(cmsCatalog.map((item) => item.category || item.slug));
  const catalogCategories = cmsCatalogCategories.filter((category) => usedCategories.has(category.slug));
  const visibleItems = cmsCatalog.filter(
    (item) => activeCategory === 'todos' || (item.category || item.slug) === activeCategory,
  );

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get('categoria');
    if (!requestedCategory) return;
    const frame = requestAnimationFrame(() => setActiveCategory(requestedCategory));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!selectedItem) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedItem(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [selectedItem]);

  return (
    <div className="catalog-page">
      <section className="about-opening catalog-opening">
        <Reveal className="about-opening-copy">
          <SectionLabel>{t.catalog}</SectionLabel>
          <h1>
            {t.catalogTitle1}
            <br />
            <span>{t.catalogTitle2}</span>
          </h1>
          <p>{t.catalogIntro}</p>
        </Reveal>
        <div className="about-opening-art">
          <AboutHeroLogo />
          <p className="about-opening-aside">
            <span />
            {t.fromIdeaToSpace.split(' ')[0]} {t.fromIdeaToSpace.split(' ')[1]}
            <br />
            {t.fromIdeaToSpace.split(' ').slice(2).join(' ')}
            <i />
          </p>
        </div>
      </section>
      <section id="catalogo-resultados" className="catalog-browser" aria-label={t.catalogSolutions}>
        <div className="catalog-layout">
          <aside
            className="projects-filters catalog-sidebar-filters"
            aria-label={t.filterCatalog}
          >
            <SectionLabel>{t.filter}</SectionLabel>
            <button
              type="button"
              className={activeCategory === 'todos' ? 'is-active' : ''}
              aria-pressed={activeCategory === 'todos'}
              onClick={() => setActiveCategory('todos')}
            >
              {t.all}
            </button>
            {catalogCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={activeCategory === category.slug ? 'is-active' : ''}
                aria-pressed={activeCategory === category.slug}
                onClick={() => setActiveCategory(category.slug)}
              >
                {category.name[locale] || translatedCatalogCategory(category.slug, locale)}
              </button>
            ))}
          </aside>
          {visibleItems.length > 0 ? (
            <div className="catalog-grid">
              {visibleItems.map((item) => (
                <figure className="catalog-card" key={item.id}>
                  <button
                    type="button"
                    className={`catalog-card-image catalog-card-button${item.slug === 'pavimentos' ? ' is-icon' : ''}`}
                    onClick={() => setSelectedItem(item)}
                    aria-label={`${t.viewImage} ${localized(item.title, locale)}`}
                  >
                    <Image
                      unoptimized
                      src={item.coverImage}
                      alt={localized(item.title, locale)}
                      width={620}
                      height={730}
                    />
                    <Image
                      className="catalog-card-mark"
                      src="/wood-panels.png"
                      alt=""
                      width={1536}
                      height={1024}
                      unoptimized
                      aria-hidden="true"
                    />
                  </button>
                  <figcaption>{localized(item.title, locale)}</figcaption>
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      </section>
      {selectedItem && (
        <div
          className="catalog-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={localized(selectedItem.title, locale)}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`catalog-lightbox-panel${selectedItem.slug === 'pavimentos' ? ' is-icon' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="catalog-lightbox-close"
              onClick={() => setSelectedItem(null)}
              aria-label={t.closeImage}
              autoFocus
            >
              <X aria-hidden="true" />
            </button>
            <div className="catalog-lightbox-media">
              <Image
                src={selectedItem.coverImage}
                alt={localized(selectedItem.title, locale)}
                width={1200}
                height={900}
                unoptimized
              />
            </div>
            <div className="catalog-lightbox-copy">
              <h2>{localized(selectedItem.title, locale)}</h2>
              <dl>
                <div>
                  <dt>{t.year}</dt>
                  <dd>{selectedItem.year}</dd>
                </div>
                <div>
                  <dt>{t.materials}</dt>
                  <dd>{localized(selectedItem.materials, locale)}</dd>
                </div>
              </dl>
              <p>{localized(selectedItem.description, locale)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export function AboutPage() {
  const { t } = useLocale();
  return (
    <div className="about-page">
      <section className="about-opening">
        <Reveal className="about-opening-copy">
          <SectionLabel>{t.aboutUs}</SectionLabel>
          <h1>
            {t.hero1}
            <br />
            <span>{t.hero2}</span>
          </h1>
          <p>{t.aboutIntro}</p>
          <div className="about-origin">
            <span>{t.since}</span>
            <span>Prozelo · Arcos de Valdevez</span>
          </div>
        </Reveal>
        <div className="about-opening-art">
          <WoodPanels perspective={0.25} interactive={false} />
          <p className="about-opening-aside">
            <span />
            {t.natureToSpaces.split(' ').slice(0, 2).join(' ')}
            <br />
            {t.natureToSpaces.split(' ').slice(2).join(' ')}
            <i />
          </p>
        </div>
      </section>
      <section className="about-history">
        <figure className="about-detail-photo">
          <ImageReveal
            src="/carpintaria-oficina.jpg"
            alt={t.workshopAlt}
          />
          <figcaption>{t.workshopCaption}</figcaption>
        </figure>
        <Reveal className="about-history-copy">
          <SectionLabel>{t.ourHistory}</SectionLabel>
          <h2>
            <span className="about-title-line">{t.story1}</span>
            <span className="about-title-line about-title-accent">
              {t.story2}
            </span>
          </h2>
          <p>{t.historyP1} {t.historyP2}</p>
        </Reveal>
      </section>
      <section className="about-quality">
        <Reveal className="about-quality-copy">
          <SectionLabel>{t.defines}</SectionLabel>
          <h2>
            {t.detail1}
            <br />
            <span>{t.detail2}</span>
          </h2>
          <div className="about-quality-body">
            <p>{t.qualityP}</p>
            <div className="about-stages" aria-label={t.workStages}>
              <div>
                <Ruler aria-hidden="true" />
                <span>01</span>
                <strong>{t.stages[0]}</strong>
              </div>
              <div>
                <Hammer aria-hidden="true" />
                <span>02</span>
                <strong>{t.stages[1]}</strong>
              </div>
              <div>
                <Wrench aria-hidden="true" />
                <span>03</span>
                <strong>{t.stages[2]}</strong>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
export function ContactForm() {
  const [status, setStatus] = useState('');
  const { t } = useLocale();
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
        const body = `${t.name}: ${field('name')}\n${t.email}: ${field('email')}\n${t.phone}: ${field('phone')}\n${t.subject}: ${field('subject')}\n\n${field('message')}`;
        window.location.href = `mailto:${company.email}?subject=${encodeURIComponent('Pedido de projeto — ' + field('name'))}&body=${encodeURIComponent(body)}`;
        setStatus(
          t.emailPrepared,
        );
      }}
    >
      <div className="form-grid">
        <label>
          <span className="sr-only">{t.name} *</span>
          <input
            autoComplete="name"
            name="name"
            required
            placeholder={`${t.name} *`}
          />
        </label>
        <label>
          <span className="sr-only">{t.email} *</span>
          <input
            autoComplete="email"
            name="email"
            type="email"
            required
            placeholder={`${t.email} *`}
          />
        </label>
        <label>
          <span className="sr-only">{t.phone}</span>
          <input
            autoComplete="tel"
            name="phone"
            type="tel"
            placeholder={t.phone}
          />
        </label>
        <label>
          <span className="sr-only">{t.subject}</span>
          <input name="subject" placeholder={t.subject} />
        </label>
        <label className="full">
          <span className="sr-only">{t.message} *</span>
          <textarea name="message" required rows={5} placeholder={`${t.message} *`} />
        </label>
      </div>
      <div className="contact-consent">
        <Checkbox
          id="contact-consent"
          name="consent"
          required
          className="consent-checkbox"
        />
        <label htmlFor="contact-consent">
          {t.consent} *
        </label>
      </div>
      <button className="button" type="submit">
        {t.prepare} <ArrowUpRight size={18} />
      </button>
      <p className="form-note">{t.emailNote}</p>
      <output className="form-status">{status}</output>
    </form>
  );
}
export function ContactPage() {
  const { t } = useLocale();
  const panelProgress = useRef(0);
  return (
    <section className="contact-scene">
      <Image
        className="contact-environment"
        src="/site-background.png"
        alt=""
        fill
        unoptimized
        priority
        sizes="100vw"
      />
      <div className="contact-art">
        <StudioPanels progress={panelProgress} mode="contact" />
      </div>
      <div className="contact-details">
        <PageIntro
          label={t.contacts}
          title={
            <>
              <span className="contact-title-line">{t.contact1}</span>
              <span className="contact-title-line contact-title-accent">
                {t.contact2}
              </span>
            </>
          }
        />
        <div className="contact-rule" />
        <p className="contact-introduction">{t.contactIntro}</p>
        <div className="contact-methods">
          <a href="tel:+351258518100">
            <Phone aria-hidden="true" />
            <span>
              {company.phone}
              <small>{t.fixedCall}</small>
            </span>
          </a>
          <a href={`mailto:${company.email}`}>
            <Mail aria-hidden="true" />
            <span>{company.email}</span>
          </a>
          <div>
            <MapPin aria-hidden="true" />
            <span>{company.address}</span>
          </div>
          <a
            className="map-link"
            href="https://www.google.com/maps/dir/?api=1&destination=41.871598,-8.4303126"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ArrowUpRight aria-hidden="true" />
            <span>{t.viewMap}</span>
          </a>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
export function ProjectDetail({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const cmsProjects = useCmsItems('project', projectFallback);
  const cmsProjectCategories = useCmsCategories('project', projectCategoryFallback);
  const project = cmsProjects.find((item) => item.slug === slug);
  const [selectedImage, setSelectedImage] = useState(project?.coverImage ?? '');

  useEffect(() => {
    if (project) setSelectedImage(project.coverImage);
  }, [project?.coverImage]);

  if (!project) return null;
  const activeImage = selectedImage || project.coverImage;
  return (
    <div className="project-detail-page">
      <section className="project-showcase">
        <div className="project-showcase-media">
          <div className="project-showcase-main">
            <Image
              src={activeImage}
              alt={localized(project.title, locale)}
              width={1400}
              height={1600}
              unoptimized
            />
          </div>
          <div className="project-thumbnails" aria-label={t.projectPhotos}>
            {project.images.map((image, index) => (
              <button
                type="button"
                key={image}
                className={activeImage === image ? 'is-active' : ''}
                aria-pressed={activeImage === image}
                aria-label={`${t.viewPhoto} ${index + 1}`}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt=""
                  width={180}
                  height={130}
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
        <aside className="project-showcase-info">
          <Link className="project-back" href="/">
            ← {t.home}
          </Link>
          <SectionLabel>{cmsProjectCategories.find((category) => category.slug === project.category)?.name[locale] || translatedCategory(project.category, locale)}</SectionLabel>
          <h1>{localized(project.title, locale)}</h1>
          <p className="project-description">{localized(project.description, locale)}</p>
          <p className="project-materials">
            <strong>{t.materials}:</strong> {localized(project.materials, locale)}
          </p>
          <dl className="project-summary">
          <div>
            <dt>{t.location}</dt>
            <dd>{project.location}</dd>
          </div>
          <div>
            <dt>{t.year}</dt>
            <dd>{project.year}</dd>
          </div>
          </dl>
        </aside>
      </section>
    </div>
  );
}
