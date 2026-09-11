import {
  featuredIndex,
  visibleCategories,
  projectiveTransform,
  modulo,
  poses,
  ringPoses,
  interpolatePose,
  panelSurfaces,
  convexHull,
} from './panel-geometry.mjs';

const defaultImageUrl = new URL('./assets/reference.png', import.meta.url).href;
const instances = new WeakMap();
let instanceNumber = 0;

/** Mount the carousel in an existing element; call destroy() before unmounting. */
export function createPintoCarousel(
  container,
  { imageUrl = defaultImageUrl, items, labels = {}, onChange } = {},
) {
  if (typeof container === 'string')
    container = document.querySelector(container);
  if (!container || container.nodeType !== 1)
    throw new Error('Indica um elemento para o carrossel.');
  if (instances.has(container)) return instances.get(container);

  let destroyed = false,
    animationId = 0;
  const abort = new AbortController();
  const observers = [];
  function observeResize(callback, element) {
    const observer = new ResizeObserver(callback);
    observer.observe(element);
    observers.push(observer);
  }

  const root = document.createElement('section');
  root.className = 'pp-carousel';
  root.setAttribute('aria-label', 'Soluções de carpintaria');
  root.setAttribute('aria-roledescription', 'carrossel');
  root.innerHTML = `
    <button class="pp-arrow pp-previous" type="button" aria-label="Solução anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>
    <div class="pp-panels"></div>
    <button class="pp-arrow pp-next" type="button" aria-label="Solução seguinte"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>
    <span class="pp-sr-only pp-announcement" aria-live="polite" aria-atomic="true"></span>`;
  container.append(root);

  const imageDialog = document.createElement('dialog');
  imageDialog.className = 'pp-image-dialog';
  const titleId = `pp-image-title-${++instanceNumber}`;
  imageDialog.setAttribute('aria-labelledby', titleId);
  imageDialog.innerHTML = `
    <div class="pp-image-dialog-photo"><img width="1672" height="941" alt="" draggable="false"></div>
    <div class="pp-image-dialog-details">
      <h2 class="pp-image-dialog-title" id="${titleId}"></h2>
      <dl>
        <div><dt>${labels.year || 'Ano'}</dt><dd class="pp-image-dialog-year"></dd></div>
        <div><dt>${labels.materials || 'Materiais'}</dt><dd class="pp-image-dialog-materials"></dd></div>
      </dl>
      <p class="pp-image-dialog-description"></p>
    </div>
    <span class="pp-image-dialog-brand" aria-label="Carpintaria Pinto & Pintos"></span>
    <button class="pp-image-dialog-close" type="button" aria-label="Fechar imagem" autofocus><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>`;
  imageDialog.querySelector('img').src = imageUrl;
  document.body.append(imageDialog);

  const atlasCategories = [
    {
      name: 'Móveis',
      face: [
        [621, 289],
        [693, 253],
        [693, 500],
        [621, 468],
      ],
    },
    {
      name: 'Roupeiros',
      face: [
        [722, 247],
        [816, 205],
        [816, 539],
        [722, 501],
      ],
    },
    {
      name: 'Cozinhas',
      face: [
        [854, 180],
        [1073, 143],
        [1073, 580],
        [854, 554],
      ],
    },
    {
      name: 'Portas e Janelas',
      face: [
        [1111, 198],
        [1224, 249],
        [1224, 524],
        [1111, 558],
      ],
    },
    {
      name: 'Pavimentos',
      face: [
        [1254, 248],
        [1354, 282],
        [1354, 503],
        [1254, 536],
      ],
    },
    {
      name: 'Tetos e Revestimentos',
      face: [
        [1382, 281],
        [1460, 307],
        [1460, 481],
        [1382, 503],
      ],
    },
  ];
  const dynamicItems = Array.isArray(items) && items.length > 0;
  const dynamicFace = [
    [0, 0],
    [424, 0],
    [424, 941],
    [0, 941],
  ];
  const categories = dynamicItems
    ? items.map((item, index) => ({
        name: item.name || `Imagem ${index + 1}`,
        description: item.description || '',
        materials: item.materials || '',
        year: item.year || '',
        imageUrl: item.imageUrl,
        face: dynamicFace,
        id: item.id ?? String(index),
      }))
    : atlasCategories;
  const woodFace = [
    [437, 661],
    [616, 661],
    [616, 758],
    [437, 758],
  ];
  const surfaceSource = (kind, category) =>
    kind === 'front'
      ? dynamicItems
        ? {
            url: categories[category].imageUrl,
            width: 424,
            height: 941,
            face: dynamicFace,
          }
        : {
            url: imageUrl,
            width: 1672,
            height: 941,
            face: categories[category].face,
          }
      : { url: imageUrl, width: 1672, height: 941, face: woodFace };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const polygon = (points) =>
    `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(6)}% ${(y * 100).toFixed(6)}%`).join(',')})`;

  const dialogPhoto = imageDialog.querySelector('.pp-image-dialog-photo');
  const dialogImage = dialogPhoto.querySelector('img');
  let dialogCategory = 0,
    dialogOpener = null,
    closeTimer = null;

  function fitDialogPhoto() {
    if (!imageDialog.open) return;
    const width = dialogPhoto.clientWidth,
      height = dialogPhoto.clientHeight;
    if (!width || !height) return;
    if (dynamicItems) {
      dialogImage.style.clipPath = 'none';
      dialogImage.style.transform = 'none';
      dialogImage.style.width = '100%';
      dialogImage.style.height = '100%';
      dialogImage.style.objectFit = 'cover';
      return;
    }
    const source = categories[dialogCategory].face;
    const target = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ];
    dialogImage.style.clipPath = polygon(
      source.map(([x, y]) => [x / 1672, y / 941]),
    );
    dialogImage.style.transform = `matrix3d(${projectiveTransform(source, target).join(',')})`;
  }

  function openImage(category, opener) {
    if (imageDialog.open) return;
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    dialogCategory = category;
    dialogOpener = opener;
    imageDialog.classList.remove('pp-is-closing');
    imageDialog.classList.toggle('pp-has-details', dynamicItems);
    imageDialog.querySelector('.pp-image-dialog-title').textContent =
      categories[category].name.toLocaleUpperCase();
    imageDialog.querySelector('.pp-image-dialog-year').textContent = categories[category].year || '—';
    imageDialog.querySelector('.pp-image-dialog-materials').textContent = categories[category].materials || '—';
    imageDialog.querySelector('.pp-image-dialog-description').textContent = categories[category].description || '—';
    dialogImage.alt = categories[category].name;
    if (dynamicItems) dialogImage.src = categories[category].imageUrl;
    imageDialog.showModal();
    fitDialogPhoto();
  }

  function closeImage() {
    if (!imageDialog.open || imageDialog.classList.contains('pp-is-closing'))
      return;
    imageDialog.close();
  }

  imageDialog.querySelector('.pp-image-dialog-close').onclick = closeImage;
  imageDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeImage();
  });
  let backdropDown = false;
  imageDialog.addEventListener('pointerdown', (event) => {
    const bounds = imageDialog.getBoundingClientRect();
    backdropDown =
      event.target === imageDialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom);
  });
  imageDialog.addEventListener('click', (event) => {
    if (backdropDown && event.target === imageDialog) closeImage();
    backdropDown = false;
  });
  imageDialog.addEventListener('close', () => {
    if (closeTimer !== null) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    imageDialog.classList.remove('pp-is-closing');
    if (!destroyed && dialogOpener?.isConnected && !dialogOpener.hidden)
      dialogOpener.focus({ preventScroll: true });
  });
  observeResize(fitDialogPhoto, dialogPhoto);
  dialogImage.addEventListener('load', fitDialogPhoto);

  class SolidCarousel {
    constructor(section) {
      this.section = section;
      this.stage = section.querySelector('.pp-panels');
      this.selected = Math.min(featuredIndex, categories.length - 1);
      this.visibleSlotCount = Math.min(categories.length, poses.length);
      const firstVisibleSlot =
        featuredIndex - Math.floor((this.visibleSlotCount - 1) / 2);
      this.visibleSlots = new Set(
        Array.from(
          { length: this.visibleSlotCount },
          (_, index) => firstVisibleSlot + index,
        ),
      );
      section.classList.toggle('pp-static', categories.length <= 1);
      this.pending = 0;
      this.turn = null;
      this.scaleX = this.stage.clientWidth / 1000;
      this.scaleY = this.stage.clientHeight / 550;
      const initial = visibleCategories(
        this.selected,
        categories.length,
        ringPoses.length,
      );
      this.cards = ringPoses.map((pose, index) => {
        const button = document.createElement('button');
        button.className = 'pp-panel pp-solid-panel';
        button.type = 'button';
        button.setAttribute('aria-haspopup', 'dialog');
        const body = document.createElement('span');
        body.className = 'pp-solid-body';
        button.append(body);
        const surfaces = Object.fromEntries(
          ['front', 'back', 'right', 'left', 'top', 'bottom'].map((kind) => {
            const element = document.createElement('span');
            element.className = `pp-solid-surface pp-solid-${kind}`;
            const photo = document.createElement('img');
            photo.alt = '';
            photo.draggable = false;
            photo.addEventListener('load', () => {
              const panel = photo.closest('.pp-panel');
              if (!panel) return;
              panel.style.opacity = '.999';
              requestAnimationFrame(() => {
                if (!destroyed) panel.style.opacity = '1';
              });
            });
            element.append(photo);
            body.append(element);
            return [kind, element];
          }),
        );
        const card = {
          button,
          body,
          surfaces,
          slot: index,
          category: initial[index],
          pose,
        };
        this.setCategory(card, initial[index]);
        // The category stays attached to this physical body for its entire lifetime.
        button.onclick = () => {
          if (performance.now() < (this.suppressClickUntil || 0)) return;
          this.pending = 0;
          openImage(card.category, button);
        };
        this.stage.append(button);
        return card;
      });
      this.draw();
      this.announce();
      section.querySelector('.pp-previous').onclick = () => this.move(-1);
      section.querySelector('.pp-next').onclick = () => this.move(1);
      section.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          this.move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      });
      let startX = 0,
        startY = 0;
      section.addEventListener(
        'touchstart',
        (event) => {
          startX = event.touches[0].clientX;
          startY = event.touches[0].clientY;
        },
        { passive: true },
      );
      section.addEventListener(
        'touchend',
        (event) => {
          const dx = event.changedTouches[0].clientX - startX,
            dy = event.changedTouches[0].clientY - startY;
          if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            this.suppressClickUntil = performance.now() + 450;
            this.move(dx < 0 ? 1 : -1);
          }
        },
        { passive: true },
      );
      observeResize(([entry]) => {
        this.scaleX = entry.contentRect.width / 1000;
        this.scaleY = entry.contentRect.height / 550;
        this.draw();
      }, this.stage);
    }

    setCategory(card, category) {
      card.category = modulo(category, categories.length);
      const item = categories[card.category];
      card.button.dataset.category = String(card.category);
      card.button.dataset.itemId = item.id ?? String(card.category);
      card.button.setAttribute(
        'aria-label',
        item.description ? `${item.name}: ${item.description}` : `Ver imagem: ${item.name}`,
      );
      for (const [kind, element] of Object.entries(card.surfaces)) {
        const source = surfaceSource(kind, card.category);
        const image = element.querySelector('img');
        image.src = source.url;
        image.width = source.width;
        image.height = source.height;
        image.style.width =
          dynamicItems && kind === 'front' ? '100%' : `${source.width}px`;
        image.style.height =
          dynamicItems && kind === 'front' ? '100%' : `${source.height}px`;
        image.style.objectFit = dynamicItems && kind === 'front' ? 'cover' : '';
        image.style.display =
          dynamicItems && kind === 'front' ? 'none' : 'block';
        if (dynamicItems && kind === 'front') {
          element.style.backgroundImage = `url("${source.url.replaceAll('"', '%22')}")`;
          element.style.backgroundPosition = 'center';
          element.style.backgroundSize = 'cover';
          element.style.backgroundRepeat = 'no-repeat';
        }
        // Clip in the image's coordinates before its 3D transform. The mask
        // remains attached to the complete panel body throughout every turn.
        image.style.clipPath =
          dynamicItems && kind === 'front'
            ? 'none'
            : polygon(
                source.face.map(([x, y]) => [
                  x / source.width,
                  y / source.height,
                ]),
              );
      }
    }

    paint(card, pose) {
      card.pose = pose;
      card.button.hidden =
        !this.turn &&
        (card.slot >= poses.length || !this.visibleSlots.has(card.slot));
      if (card.button.hidden) return;
      if (!this.scaleX || !this.scaleY) return;
      const surfaces = panelSurfaces(pose);
      const points = surfaces.flatMap((surface) => surface.projected);
      const x = Math.min(...points.map((point) => point[0]));
      const y = Math.min(...points.map((point) => point[1]));
      const w = Math.max(...points.map((point) => point[0])) - x;
      const h = Math.max(...points.map((point) => point[1])) - y;
      card.button.style.left = `${(x / 1000) * 100}%`;
      card.button.style.top = `${(y / 550) * 100}%`;
      card.button.style.width = `${(w / 1000) * 100}%`;
      card.button.style.height = `${(h / 550) * 100}%`;
      card.button.style.zIndex = String(
        Math.round(10000 - pose.center[2] * 100),
      );
      // Also bound the assembled body, including its thickness, to its silhouette.
      card.body.style.clipPath = polygon(
        convexHull(points).map((point) => [
          (point[0] - x) / w,
          (point[1] - y) / h,
        ]),
      );
      for (const surface of surfaces) {
        const element = card.surfaces[surface.kind];
        element.hidden = !surface.visible;
        if (!surface.visible) continue;
        const normalized = surface.projected.map((point) => [
          (point[0] - x) / w,
          (point[1] - y) / h,
        ]);
        element.style.clipPath = polygon(normalized);
        const target = surface.projected.map((point) => [
          (point[0] - x) * this.scaleX,
          (point[1] - y) * this.scaleY,
        ]);
        const image = element.querySelector('img');
        if (dynamicItems && surface.kind === 'front') {
          image.style.transform = 'none';
          continue;
        }
        const source = surfaceSource(surface.kind, card.category).face;
        const matrix = projectiveTransform(source, target);
        image.style.transform = `matrix3d(${matrix.join(',')})`;
      }
    }

    draw() {
      this.cards.forEach((card) => this.paint(card, card.pose));
    }

    announce() {
      this.cards.forEach((card) =>
        card.button.setAttribute(
          'aria-current',
          String(card.slot === featuredIndex),
        ),
      );
      this.section.querySelector('.pp-announcement').textContent =
        categories[this.selected].name;
      onChange?.(this.selected, categories[this.selected]);
    }

    move(steps) {
      if (destroyed || imageDialog.open || categories.length <= 1) return;
      this.pending = Math.max(-6, Math.min(6, this.pending + steps));
      if (!this.turn) this.startNext();
    }

    startNext() {
      if (this.turn || !this.pending) return;
      const direction = Math.sign(this.pending);
      this.pending -= direction;
      const hiddenCard = this.cards.find((card) => card.slot >= poses.length);
      if (hiddenCard)
        this.setCategory(hiddenCard, this.selected + (direction > 0 ? 3 : -3));
      const plan = this.cards.map((card) => ({
        from: card.slot,
        to: modulo(card.slot - direction, ringPoses.length),
      }));
      let started = performance.now(),
        pausedAt = null;
      const duration = reducedMotion.matches ? 0 : 1050;
      this.turn = { direction };
      const frame = (now) => {
        if (destroyed) return;
        if (imageDialog.open) {
          pausedAt ??= now;
          animationId = requestAnimationFrame(frame);
          return;
        }
        if (pausedAt !== null) {
          started += now - pausedAt;
          pausedAt = null;
        }
        const progress = duration ? Math.min(1, (now - started) / duration) : 1;
        const amount = ease(progress);
        this.cards.forEach((card, index) => {
          const step = plan[index];
          this.paint(
            card,
            interpolatePose(ringPoses[step.from], ringPoses[step.to], amount),
          );
        });
        if (progress < 1) animationId = requestAnimationFrame(frame);
        else {
          this.turn = null;
          this.cards.forEach((card, index) => {
            card.slot = plan[index].to;
            this.paint(card, ringPoses[card.slot]);
          });
          this.selected = modulo(this.selected + direction, categories.length);
          this.announce();
          if (this.pending) this.startNext();
        }
      };
      animationId = requestAnimationFrame(frame);
    }
  }

  const main = new SolidCarousel(root);
  let wheelAmount = 0,
    lastWheel = 0,
    lastAdvance = -Infinity;
  root.addEventListener(
    'wheel',
    (event) => {
      if (
        imageDialog.open ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented
      )
        return;
      event.preventDefault();
      const target = main;
      const now = performance.now();
      let delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      delta *=
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      if (now - lastWheel > 160 || Math.sign(delta) !== Math.sign(wheelAmount))
        wheelAmount = 0;
      lastWheel = now;
      if (now - lastAdvance < 740 || target.turn) {
        wheelAmount = 0;
        return;
      }
      wheelAmount += delta;
      if (Math.abs(wheelAmount) >= 32) {
        target.move(Math.sign(wheelAmount));
        wheelAmount = 0;
        lastAdvance = now;
      }
    },
    { passive: false, signal: abort.signal },
  );

  const controller = {
    previous: () => main.move(-1),
    next: () => main.move(1),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      main.pending = 0;
      cancelAnimationFrame(animationId);
      if (closeTimer !== null) clearTimeout(closeTimer);
      observers.forEach((observer) => observer.disconnect());
      abort.abort();
      if (imageDialog.open) imageDialog.close();
      imageDialog.remove();
      root.remove();
      instances.delete(container);
    },
  };
  instances.set(container, controller);
  return controller;
}
