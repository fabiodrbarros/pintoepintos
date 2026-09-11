'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '@/components/locale';
import { mountPintoFlow } from '@/pinto-pintos-transicoes-codex/pinto-flow.mjs';

const flowVersion = 'catalog-layout-v3';

const flowCopy = {
  pt: {
    aria: 'Da origem à matéria',
    familyEyebrow: 'Do desenho à instalação.',
    familyLead: 'Um saber construído',
    familyAccent: 'ao longo do tempo.',
    familyBody: 'A Carpintaria Pinto & Pintos é feita por profissionais especializados, experientes e qualificados, que trabalham em conjunto em todas as fases de cada projeto. Da conceção técnica e desenho 3D ao fabrico, acabamentos e instalação, cada trabalho é acompanhado com rigor, atenção ao detalhe e compromisso com a qualidade. Desde 1975, a experiência acumulada da nossa equipa traduz-se em soluções bem executadas, materiais selecionados e um acompanhamento próximo do cliente.',
    catalogEyebrow: 'Catálogo',
    catalogLead: 'Soluções para',
    catalogAccent: 'cada espaço.',
    materialEyebrow: 'Texturas e acabamentos',
    materialLead: 'A natureza dá a matéria,',
    materialAccent: 'nós damos-lhe forma.',
    materialBody: 'Cada madeira tem a sua cor, textura e personalidade. A escolha da essência e do acabamento faz parte da identidade de cada projeto.',
    detailEyebrow: 'Madeira ao detalhe',
    returnSample: 'Voltar à prateleira',
  },
  en: {
    aria: 'From origin to material',
    familyEyebrow: 'From design to installation.',
    familyLead: 'Knowledge built',
    familyAccent: 'over time.',
    familyBody: 'Carpintaria Pinto & Pintos is made up of specialised, experienced and qualified professionals who work together at every stage of each project. From technical design and 3D drawings to manufacturing, finishing and installation, every job is followed with rigour, attention to detail and a commitment to quality. Since 1975, our team’s accumulated experience has translated into well-executed solutions, carefully selected materials and close support for each client.',
    catalogEyebrow: 'Catalogue',
    catalogLead: 'Solutions for',
    catalogAccent: 'every space.',
    materialEyebrow: 'Textures and finishes',
    materialLead: 'Nature provides the material,',
    materialAccent: 'we give it form.',
    materialBody: 'Each wood has its own colour, texture and personality. The choice of species and finish is part of the identity of every project.',
    detailEyebrow: 'Wood in detail',
    returnSample: 'Return to the shelf',
  },
  fr: {
    aria: 'De l’origine à la matière',
    familyEyebrow: 'De la conception à la pose.',
    familyLead: 'Un savoir construit',
    familyAccent: 'au fil du temps.',
    familyBody: 'Carpintaria Pinto & Pintos réunit des professionnels spécialisés, expérimentés et qualifiés, qui travaillent ensemble à chaque étape de chaque projet. De la conception technique et du dessin 3D à la fabrication, aux finitions et à la pose, chaque réalisation est suivie avec rigueur, souci du détail et engagement envers la qualité. Depuis 1975, l’expérience accumulée de notre équipe se traduit par des solutions bien exécutées, des matériaux sélectionnés et un accompagnement attentif de chaque client.',
    catalogEyebrow: 'Catalogue',
    catalogLead: 'Des solutions pour',
    catalogAccent: 'chaque espace.',
    materialEyebrow: 'Textures et finitions',
    materialLead: 'La nature donne la matière,',
    materialAccent: 'nous lui donnons forme.',
    materialBody: 'Chaque bois a sa couleur, sa texture et sa personnalité. Le choix de l’essence et de la finition fait partie de l’identité de chaque projet.',
    detailEyebrow: 'Le bois en détail',
    returnSample: 'Remettre sur l’étagère',
  },
} as const;

export function PintoFlow() {
  const rootRef = useRef<HTMLElement>(null);
  const { locale, t } = useLocale();
  const copy = flowCopy[locale];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const flow = mountPintoFlow(root);
    return () => flow.destroy();
  }, [flowVersion]);

  return (
    <section
      ref={rootRef}
      className="pinto-flow story"
      aria-label={copy.aria}
      style={{ '--pinto-flow-top': '0px' } as CSSProperties}
    >
      <div className="cinema">
        <div className="room" aria-hidden="true" />
        <fieldset className="wood-world" aria-label={copy.materialEyebrow}>
          <div className="pickup-shadow" aria-hidden="true" />
        </fieldset>

        <section className="copy copy-origin" aria-labelledby="pinto-origin-title">
          <h1 id="pinto-origin-title">
            <span className="hero-title-line">{t.hero1}</span>
            <span className="hero-title-line hero-title-emphasis">{t.hero2}</span>
          </h1>
          <i className="fine-rule" aria-hidden="true" />
          <p>{t.heroIntro}</p>
        </section>

        <div className="pinto-hero-foot" aria-label={t.companyInformation}>
          <div className="pinto-hero-signature">
            <span>Carpintaria Pinto &amp; Pintos</span>
            <i aria-hidden="true" />
            <span>{t.quality} · {t.since}</span>
          </div>
          <div className="pinto-hero-actions">
            <a
              href="https://www.facebook.com/profile.php?id=61578810787879"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.2c-.4-.1-1.8-.2-3-.2-3 0-5 1.8-5 5v2H7v3h3v8z" /></svg>
            </a>
            <a
              href="https://www.instagram.com/carpintariapintos/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
            </a>
            <i aria-hidden="true" />
            <a className="pinto-hero-contact" href="/contactos">{t.contact} <ArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>

        <section className="copy copy-form" aria-labelledby="pinto-form-title">
          <span className="eyebrow">{copy.familyEyebrow}</span>
          <h2 id="pinto-form-title">
            {copy.familyLead}
            <br />
            <em>{copy.familyAccent}</em>
          </h2>
          <i className="fine-rule" aria-hidden="true" />
          <p>{copy.familyBody}</p>
        </section>

        <section className="copy copy-catalog" aria-labelledby="pinto-catalog-title">
          <span className="eyebrow">{copy.catalogEyebrow}</span>
          <h2 id="pinto-catalog-title">
            {copy.catalogLead} <em>{copy.catalogAccent}</em>
          </h2>
          <i className="fine-rule" aria-hidden="true" />
          <p className="catalog-caption" aria-hidden="true" />
        </section>

        <section className="copy copy-material" aria-labelledby="pinto-material-title">
          <span className="eyebrow">{copy.materialEyebrow}</span>
          <h2 id="pinto-material-title">
            {copy.materialLead}
            <br />
            <em>{copy.materialAccent}</em>
          </h2>
          <i className="fine-rule" aria-hidden="true" />
          <p>{copy.materialBody}</p>
        </section>

        <aside
          className="material-inspector"
          id="pinto-sample-detail"
          aria-labelledby="pinto-sample-name"
          aria-hidden="true"
          inert
        >
          <span className="eyebrow">{copy.detailEyebrow}</span>
          <h2 id="pinto-sample-name" className="sample-name">
            <span className="sr-only">{copy.detailEyebrow}</span>
          </h2>
          <span className="sample-appearance" />
          <p className="sample-description" />
          <button className="return-sample" type="button">
            {copy.returnSample} <span aria-hidden="true">↘</span>
          </button>
        </aside>
        <output className="sr-only sample-announcement" aria-live="polite" />
      </div>
    </section>
  );
}
