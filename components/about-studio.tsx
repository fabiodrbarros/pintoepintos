'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hammer, Ruler, Wrench } from 'lucide-react';
import { SectionLabel } from '@/components/site';
import { useLocale } from '@/components/locale';
import StudioPanels from '@/components/studio-panels';

export function AboutStudioPage() {
  const { t } = useLocale();
  const sequence = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const quality = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const state = { progress: 0 };
      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: sequence.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.85,
        },
      });
      timeline
        .to(intro.current, { autoAlpha: 0, y: -24, duration: 0.48 }, 0.22)
        .to(state, { progress: 0.48, duration: 1.2, onUpdate: () => { progress.current = state.progress; } }, 0.76)
        .fromTo(history.current, { autoAlpha: 0, y: 100 }, { autoAlpha: 1, y: 0, duration: 0.96 }, 1.42)
        .to({}, { duration: 0.92 })
        .to(history.current, { autoAlpha: 0, y: -34, duration: 0.72 }, 3.12)
        .to(state, { progress: 1, duration: 1.18, onUpdate: () => { progress.current = state.progress; } }, 3.28)
        .to(canvas.current, { clipPath: mobile ? 'inset(0 0 50% 0)' : 'inset(0 0 0% 0)', duration: 0.72 }, 3.28)
        .fromTo(quality.current, { autoAlpha: 0, x: 70 }, { autoAlpha: 1, x: 0, duration: 0.88 }, 3.88)
        .to({}, { duration: 0.85 });
      return () => timeline.kill();
    });
    return () => media.revert();
  }, []);

  return (
    <div className="about-page studio-page">
      <section ref={sequence} className="studio-sequence">
        <div ref={pinned} className="studio-pin">
          <div ref={canvas} className="studio-canvas" aria-hidden="true"><StudioPanels progress={progress} /></div>
          <div ref={intro} className="studio-intro about-opening-copy">
            <SectionLabel>{t.essence}</SectionLabel>
            <h1>{t.hero1}<br /><span>{t.hero2}</span></h1>
            <i className="studio-fine-rule" aria-hidden="true" />
            <p>{t.aboutIntro}</p>
            <div className="about-origin"><span>{t.since}</span><span>Prozelo · Arcos de Valdevez</span></div>
          </div>
          <div ref={history} className="studio-history about-history-copy">
            <SectionLabel>{t.ourHistory}</SectionLabel>
            <h2><span className="about-title-line">{t.story1}</span><span className="about-title-line about-title-accent">{t.story2}</span></h2>
            <i className="studio-fine-rule" aria-hidden="true" />
            <p>{t.historyP1} {t.historyP2}</p>
          </div>
          <div ref={quality} className="studio-quality-stage">
            <SectionLabel>{t.defines}</SectionLabel>
            <h2>{t.detail1}<br /><span>{t.detail2}</span></h2>
            <i className="studio-fine-rule" aria-hidden="true" />
            <p>{t.qualityP}</p>
            <div className="about-stages" aria-label={t.workStages}>
              <div><Ruler aria-hidden="true" /><span>01</span><strong>{t.stages[0]}</strong></div>
              <div><Hammer aria-hidden="true" /><span>02</span><strong>{t.stages[1]}</strong></div>
              <div><Wrench aria-hidden="true" /><span>03</span><strong>{t.stages[2]}</strong></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
