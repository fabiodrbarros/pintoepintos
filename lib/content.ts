import { catalog2026 } from '@/db/seeds/catalog-2026.mjs';

export const company = {
  email: 'carpintaria.pintos@sapo.pt',
  phone: '258 518 100',
  address:
    'Rua 1 de Maio, nº 167, Portelinha, Prozelo, 4970-285 Arcos de Valdevez',
  logo: '',
};
// Inserir apenas estatísticas confirmadas e o caminho do logótipo original.
export const stats: { value: string; label: string }[] = [];
export const catalogItems = catalog2026.items;
export const projects = [
  {
    slug: 'moradia-vilafonche',
    title: 'Moradia — Vilafonche',
    category: 'Moradia',
    region: 'portugal',
    client: 'Particular',
    location: 'Vila Fonche, Arcos de Valdevez',
    date: '2016',
    services:
      'Porta de entrada personalizada em carvalho com cor wengué, portas interiores lacadas, escadas em carvalho com cor wengué, pavimento flutuante Quick-Step e cozinha personalizada em carvalho lacado.',
    materials:
      'Madeira maciça de carvalho, MDF hidrófugo e pavimento flutuante Quick-Step.',
    image: '/projetos/moradia-vilafonche/1.jpg',
    images: [
      '/projetos/moradia-vilafonche/1.jpg',
      '/projetos/moradia-vilafonche/2.jpg',
      '/projetos/moradia-vilafonche/3.jpg',
      '/projetos/moradia-vilafonche/4.jpg',
    ],
  },
  {
    slug: 'moradia-serreleis',
    title: 'Moradia — Serreleis',
    category: 'Moradia',
    region: 'portugal',
    client: 'Particular',
    location: 'Serreleis, Viana do Castelo',
    date: '2016',
    services:
      'Portas de entrada em lacado preto mate, revestimentos em nogueira, pavimento flutuante, mobiliário de escadas, portas interiores, roupeiros e móveis iluminados por medida.',
    materials:
      'Folheado de nogueira, MDF hidrófugo e pavimento Kronotex Mammut.',
    image: '/projetos/moradia-serreleis/1.jpg',
    images: [
      '/projetos/moradia-serreleis/1.jpg',
      '/projetos/moradia-serreleis/2.jpg',
      '/projetos/moradia-serreleis/3.jpg',
      '/projetos/moradia-serreleis/4.jpg',
    ],
  },
  {
    slug: 'moradia-bordeus',
    title: 'Moradia — Bordéus',
    category: 'Moradia',
    region: 'franca',
    client: 'Particular',
    location: 'Bordéus, França',
    date: '2014',
    services:
      'Cozinha em termolaminado branco brilho, portas interiores e degraus em carvalho, roupeiros e móvel de casa de banho em termolaminado branco brilho.',
    materials:
      'Termolaminado W1000 Branco Premium, Compac Nocturno, Compac Branco Absoluto e folheado de carvalho.',
    image: '/projetos/moradia-bordeus/1.jpg',
    images: [
      '/projetos/moradia-bordeus/1.jpg',
      '/projetos/moradia-bordeus/2.jpg',
      '/projetos/moradia-bordeus/3.jpg',
      '/projetos/moradia-bordeus/4.jpg',
    ],
  },
];
export const services = [
  [
    'Cozinhas à medida',
    'Espaços desenhados em torno de quem os utiliza. Da organização interior à escolha dos materiais e acabamentos.',
  ],
  [
    'Roupeiros e closets',
    'Arrumação integrada na arquitetura, com dimensões e soluções adaptadas a cada espaço.',
  ],
  [
    'Portas e revestimentos',
    'Continuidade entre espaços através de portas, painéis e revestimentos de madeira.',
  ],
  [
    'Mobiliário personalizado',
    'Peças pensadas para uma função, um lugar e uma forma de viver.',
  ],
];
