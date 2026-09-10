'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useLocale } from '@/components/locale';
import { mountPintoFlow } from '@/pinto-pintos-transicoes-codex/pinto-flow.mjs';

const flowCopy = {
  pt: {
    aria: 'Da origem à matéria',
    familyEyebrow: 'Uma história de família',
    familyLead: 'De Pai',
    familyAccent: 'para Filhos.',
    catalogLead: 'O nosso',
    catalogAccent: 'catálogo.',
    materialEyebrow: 'Texturas e acabamentos',
    materialLead: 'A matéria,',
    materialAccent: 'de perto.',
    materialBody: 'Doze madeiras, doze formas de sentir a matéria. Escolha uma amostra para descobrir.',
    detailEyebrow: 'Madeira ao detalhe',
    returnSample: 'Voltar à prateleira',
  },
  en: {
    aria: 'From origin to material',
    familyEyebrow: 'A family story',
    familyLead: 'From Father',
    familyAccent: 'to Sons.',
    catalogLead: 'Our',
    catalogAccent: 'catalogue.',
    materialEyebrow: 'Textures and finishes',
    materialLead: 'The material,',
    materialAccent: 'up close.',
    materialBody: 'Twelve woods, twelve ways to experience the material. Choose a sample to discover it.',
    detailEyebrow: 'Wood in detail',
    returnSample: 'Return to the shelf',
  },
  fr: {
    aria: 'De l’origine à la matière',
    familyEyebrow: 'Une histoire de famille',
    familyLead: 'Du Père',
    familyAccent: 'aux Fils.',
    catalogLead: 'Notre',
    catalogAccent: 'catalogue.',
    materialEyebrow: 'Textures et finitions',
    materialLead: 'La matière,',
    materialAccent: 'de près.',
    materialBody: 'Douze bois, douze façons de ressentir la matière. Choisissez un échantillon pour le découvrir.',
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
  }, []);

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

        <section className="copy copy-form" aria-labelledby="pinto-form-title">
          <span className="eyebrow">{copy.familyEyebrow}</span>
          <h2 id="pinto-form-title">
            {copy.familyLead}
            <br />
            <em>{copy.familyAccent}</em>
          </h2>
          <i className="fine-rule" aria-hidden="true" />
          <p>{t.storyP1} {t.storyP2}</p>
        </section>

        <section className="copy copy-catalog" aria-labelledby="pinto-catalog-title">
          <h2 id="pinto-catalog-title">
            {copy.catalogLead} <em>{copy.catalogAccent}</em>
          </h2>
          <p className="catalog-caption" aria-hidden="true" />
        </section>

        <section className="copy copy-material" aria-labelledby="pinto-material-title">
          <span className="eyebrow">{copy.materialEyebrow}</span>
          <h2 id="pinto-material-title">
            {copy.materialLead}
            <br />
            <em>{copy.materialAccent}</em>
          </h2>
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
