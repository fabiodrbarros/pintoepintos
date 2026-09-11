import Database from 'better-sqlite3';

const db = new Database('./data/site.db');

const categories = [
  ['catalog-roupeiros', 'roupeiros', 'Roupeiros', 0],
  ['catalog-cozinhas', 'cozinhas', 'Cozinhas', 1],
  ['catalog-casas-de-banho', 'moveis-casa-de-banho', 'Móveis de casa de banho', 2],
  ['catalog-moveis-medida', 'moveis-por-medida', 'Móveis por medida', 3],
];

const items = [
  {
    id: 'catalog-2026-roupeiro-integrado', category: 'roupeiros', sortOrder: 0,
    title: 'Roupeiro integrado à medida',
    description: 'Roupeiro à medida com zonas de arrumação, gavetas e varões, concebido para aproveitar toda a altura e largura do espaço.',
    materials: 'MDF lacado mate, revestimento melamínico de madeira e ferragens de abertura suave.',
    image: '/catalogo/2026/roupeiro-integrado.jpg',
  },
  {
    id: 'catalog-2026-lavabo-iluminado', category: 'moveis-casa-de-banho', sortOrder: 1,
    title: 'Móvel de lavabo iluminado',
    description: 'Móvel suspenso para lavabo, combinado com espelho retroiluminado e arrumação discreta para um ambiente acolhedor.',
    materials: 'MDF lacado, folheado de nogueira e iluminação LED integrada.',
    image: '/catalogo/2026/lavabo-iluminado.jpg',
  },
  {
    id: 'catalog-2026-cozinha-ripada', category: 'cozinhas', sortOrder: 2,
    title: 'Cozinha com ilha ripada',
    description: 'Cozinha contemporânea com ilha central, frentes em madeira e detalhe ripado que dá textura e continuidade ao espaço.',
    materials: 'Folheado de nogueira, MDF lacado, tampo em pedra sinterizada e ferragens de alta qualidade.',
    image: '/catalogo/2026/cozinha-ilha-ripada.jpg',
  },
  {
    id: 'catalog-2026-cozinha-contemporanea', category: 'cozinhas', sortOrder: 3,
    title: 'Cozinha contemporânea em nogueira',
    description: 'Cozinha à medida com módulos altos, frentes em madeira e zona de exposição iluminada, pensada para uma utilização diária fluida.',
    materials: 'Folheado de nogueira, MDF lacado mate, vidro lacado e iluminação LED.',
    image: '/catalogo/2026/cozinha-nogueira.jpg',
  },
  {
    id: 'catalog-2026-estante-iluminada', category: 'moveis-por-medida', sortOrder: 4,
    title: 'Estante iluminada à medida',
    description: 'Estante e módulo de arrumação feitos à medida, com prateleiras abertas, gavetas e iluminação integrada para valorizar cada detalhe.',
    materials: 'Folheado de nogueira, MDF lacado mate, puxadores metálicos e iluminação LED.',
    image: '/catalogo/2026/estante-iluminada.jpg',
  },
  {
    id: 'catalog-2026-aparador-sala', category: 'moveis-por-medida', sortOrder: 5,
    title: 'Aparador de sala à medida',
    description: 'Aparador baixo de linhas depuradas, criado para complementar a zona de jantar com arrumação funcional e um acabamento elegante.',
    materials: 'Folheado de nogueira, MDF lacado e ferragens de abertura suave.',
    image: '/catalogo/2026/aparador-sala.jpg',
  },
  {
    id: 'catalog-2026-movel-banho-suspenso', category: 'moveis-casa-de-banho', sortOrder: 6,
    title: 'Móvel de casa de banho suspenso',
    description: 'Móvel suspenso de lavatório duplo, desenhado à medida para conjugar leveza visual, arrumação e materiais resistentes à humidade.',
    materials: 'Folheado de carvalho, MDF hidrófugo, tampo compacto e iluminação LED perimetral.',
    image: '/catalogo/2026/movel-banho-suspenso.jpg',
  },
  {
    id: 'catalog-2026-cozinha-azul-petroleo', category: 'cozinhas', sortOrder: 7,
    title: 'Cozinha clássica em azul petróleo',
    description: 'Cozinha à medida com portas de moldura, zona de refeições e nicho em madeira, unindo uma linguagem clássica a soluções atuais.',
    materials: 'MDF lacado em azul petróleo, folheado de carvalho, tampo compacto e ferragens de abertura suave.',
    image: '/catalogo/2026/cozinha-azul-petroleo.jpg',
  },
];

const replaceCatalog = db.transaction(() => {
  db.prepare("DELETE FROM content_items WHERE kind = 'catalog'").run();
  db.prepare("DELETE FROM categories WHERE kind = 'catalog'").run();

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, kind, slug, name_pt, name_en, name_fr, sort_order)
    VALUES (?, 'catalog', ?, ?, '', '', ?)
  `);
  categories.forEach(([id, slug, name, sortOrder]) => insertCategory.run(id, slug, name, sortOrder));

  const insertItem = db.prepare(`
    INSERT INTO content_items (
      id, kind, slug, category, title_pt, title_en, title_fr,
      description_pt, description_en, description_fr,
      materials_pt, materials_en, materials_fr,
      cover_image, images_json, client, location, year, sort_order, published
    ) VALUES (
      @id, 'catalog', @id, @category, @title, '', '',
      @description, '', '', @materials, '', '',
      @image, @images, '', '', '2026', @sortOrder, 1
    )
  `);
  items.forEach((item) => insertItem.run({ ...item, images: JSON.stringify([item.image]) }));
});

replaceCatalog();
console.log(`Catálogo substituído: ${items.length} itens e ${categories.length} categorias.`);
db.close();
