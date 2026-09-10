'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import { convexHull, projectiveTransform } from '@/pinto-pintos-transicoes-codex/geometry.mjs';
import {
  clamp,
  logoFaces,
  logoPhoto,
  poseFromFace,
  project,
  segment,
  surfaces,
  viewport,
} from '@/pinto-pintos-transicoes-codex/choreography.mjs';
import {
  referenceEdges,
  referenceFaces,
} from '@/pinto-pintos-transicoes-codex/photography.mjs';

type Face = {
  element: HTMLSpanElement;
  image: HTMLImageElement;
  source: number[][];
};

type Body = {
  element: HTMLSpanElement;
  hull: HTMLSpanElement;
  faces: Record<string, Face>;
};

const faceKinds = ['front', 'back', 'left', 'right', 'top', 'bottom'] as const;

const polygon = (points: number[][]) =>
  `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(5)}% ${(y * 100).toFixed(5)}%`).join(',')})`;

function sourceImage(source: number[][]) {
  const image = document.createElement('img');
  image.src = logoPhoto.src;
  image.width = logoPhoto.width;
  image.height = logoPhoto.height;
  image.alt = '';
  image.draggable = false;
  image.style.width = `${logoPhoto.width}px`;
  image.style.height = `${logoPhoto.height}px`;
  image.style.clipPath = polygon(
    source.map(([x, y]) => [x / logoPhoto.width, y / logoPhoto.height]),
  );
  return image;
}

function createBody(index: number): Body {
  const element = document.createElement('span');
  element.className = 'studio-object-body';
  const hull = document.createElement('span');
  hull.className = 'studio-object-hull';
  element.append(hull);

  const faces = Object.fromEntries(
    faceKinds.map((kind) => {
      const source =
        kind === 'front' || kind === 'back'
          ? referenceFaces[index]
          : referenceEdges[index];
      const face = document.createElement('span');
      face.className = `studio-object-face studio-object-${kind}`;
      const image = sourceImage(source);
      face.append(image);
      hull.append(face);
      return [kind, { element: face, image, source }];
    }),
  ) as Record<string, Face>;

  return { element, hull, faces };
}

function faceArea(points: number[][]) {
  return (
    Math.abs(
      points.reduce((sum, [x, y], index) => {
        const next = points[(index + 1) % points.length];
        return sum + x * next[1] - y * next[0];
      }, 0),
    ) / 2
  );
}

export default function StudioPanels({
  progress,
  mode = 'studio',
}: {
  progress: MutableRefObject<number>;
  mode?: 'studio' | 'home' | 'contact';
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const bodies = Array.from({ length: referenceFaces.length }, (_, index) =>
      createBody(index),
    );
    bodies.forEach((body) => root.append(body.element));

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;
    let displayedProgress = clamp(progress.current);

    const render = () => {
      const width = root.clientWidth;
      const height = root.clientHeight;
      const contactMode = mode === 'contact';
      const portrait = width < 760 && height > width;
      const targetProgress = clamp(progress.current);
      displayedProgress = reducedMotion.matches
        ? targetProgress
        : displayedProgress + (targetProgress - displayedProgress) * 0.1;

      const descend = segment(displayedProgress, 0.04, 0.48);
      const moveLeft = segment(displayedProgress, 0.52, 1);
      const base = viewport(width, height, 0);
      const startScale = portrait ? 0.72 : 0.82;
      const settledScale = portrait ? 0.43 : 0.76;
      const scaleFactor =
        startScale +
        (settledScale - startScale) * moveLeft -
        0.06 * descend * (1 - moveLeft);
      const startX = contactMode || portrait ? 0 : width * 0.23;
      const finalX = portrait ? -width * 0.18 : -width * 0.2;
      const descendedY = portrait ? height * 0.2 : height * 0.17;
      const finalY = portrait ? -height * 0.2 : 0;
      const view = {
        scale: base.scale * scaleFactor,
        x: base.x + startX + (finalX - startX) * moveLeft,
        y: base.y + descendedY * descend + (finalY - descendedY) * moveLeft,
      };

      bodies.forEach((body, index) => {
        const pose = poseFromFace(logoFaces[index]);
        const projected = surfaces(pose).map(
          (surface: { kind: string; points: number[][]; visible: boolean }) => ({
            ...surface,
            projected: surface.points.map((point) => {
              const [x, y] = project(point as [number, number, number]);
              return [view.x + x * view.scale, view.y + y * view.scale];
            }),
          }),
        );
        const corners = projected.flatMap(
          (surface: { projected: number[][] }) => surface.projected,
        );
        const left = Math.min(...corners.map(([x]) => x));
        const top = Math.min(...corners.map(([, y]) => y));
        const bodyWidth = Math.max(...corners.map(([x]) => x)) - left;
        const bodyHeight = Math.max(...corners.map(([, y]) => y)) - top;

        Object.assign(body.element.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${bodyWidth}px`,
          height: `${bodyHeight}px`,
          zIndex: String(Math.round(1000 - pose.center[2] * 100)),
        });
        body.hull.style.clipPath = polygon(
          convexHull(corners).map(([x, y]: number[]) => [
            (x - left) / bodyWidth,
            (y - top) / bodyHeight,
          ]),
        );

        projected.forEach(
          (surface: { kind: string; projected: number[][]; visible: boolean }) => {
            const face = body.faces[surface.kind];
            face.element.hidden =
              !surface.visible || faceArea(surface.projected) < 0.15;
            if (face.element.hidden) return;
            const local = surface.projected.map(([x, y]) => [x - left, y - top]);
            face.element.style.clipPath = polygon(
              local.map(([x, y]) => [x / bodyWidth, y / bodyHeight]),
            );
            face.image.style.transform = `matrix3d(${projectiveTransform(face.source, local).join(',')})`;
            face.element.style.filter =
              surface.kind === 'bottom'
                ? 'brightness(.86)'
                : surface.kind === 'left' || surface.kind === 'right'
                  ? 'brightness(.94)'
                  : surface.kind === 'back'
                    ? 'brightness(.92)'
                    : 'none';
          },
        );
      });

      root.classList.add('is-ready');
      if (!contactMode) animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    const resizeObserver = mode === 'contact' ? new ResizeObserver(render) : null;
    if (resizeObserver) resizeObserver.observe(root);
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      bodies.forEach((body) => body.element.remove());
    };
  }, [mode, progress]);

  return <div ref={rootRef} className="studio-object" aria-hidden="true" />;
}
