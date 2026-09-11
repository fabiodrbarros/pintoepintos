'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Locale, LocalizedText } from '@/lib/cms-types';

type Dictionary = {
  nav: readonly string[]; home: string; menu: string; close: string; phone: string; email: string;
  fixedCall: string; contact: string; explore: string; complaints: string; filter: string; all: string;
  projects: string; catalog: string; houses: string; commercial: string; catalogTitle1: string;
  catalogTitle2: string; catalogIntro: string; projectsTitle1: string; projectsTitle2: string;
  projectsIntro: string; viewImage: string; closeImage: string; noProjects: string; allProjects: string;
  location: string; year: string; materials: string; siteTagline: string; quality: string;
  hero1: string; hero2: string; heroIntro: string; workshop: string; story1: string; story2: string;
  storyP1: string; storyP2: string; knowStory: string; since: string; whatWeDo: string;
  made1: string; made2: string; madeIntro: string; viewCatalog: string; featured: string;
  viewProjects: string; aboutUs: string; aboutIntro: string; ourHistory: string; historyP1: string;
  historyP2: string; defines: string; detail1: string; detail2: string; qualityP: string;
  stages: readonly string[]; contacts: string; contact1: string; contact2: string; contactIntro: string;
  viewMap: string; name: string; subject: string; message: string; consent: string; prepare: string;
  essence: string; skipToContent: string; mainNavigation: string; socialNetworks: string;
  companyInformation: string; fundingDownload: string; fundingLogosAlt: string; startWithIdea: string;
  fromIdeaToSpace: string; catalogSolutions: string; filterCatalog: string; workStages: string;
  projectPhotos: string; viewPhoto: string; noCatalogImages: string; notFoundTitle1: string;
  notFoundTitle2: string; backHome: string;
  natureToSpaces: string; workshopAlt: string; workshopCaption: string; emailNote: string;
  emailPrepared: string;
  capabilities: readonly (readonly [string, string])[];
};

const dictionaries = {
  pt: {
    nav: ['Projetos', 'Catálogo', 'A Carpintaria', 'Contactos'],
    home: 'Início', menu: 'Menu', close: 'Fechar menu', phone: 'Telefone', email: 'Email',
    fixedCall: 'Chamada para a rede fixa nacional', contact: 'Fale connosco', explore: 'Explorar',
    complaints: 'Livro de reclamações', filter: 'Filtrar', all: 'Todos',
    projects: 'Projetos', catalog: 'Catálogo', houses: 'Moradias', commercial: 'Espaços comerciais',
    catalogTitle1: 'O nosso trabalho,', catalogTitle2: 'em cada detalhe.',
    catalogIntro: 'Uma seleção de soluções desenhadas, fabricadas e instaladas à medida de cada espaço.',
    projectsTitle1: 'A madeira transforma,', projectsTitle2: 'o espaço ganha vida.',
    projectsIntro: 'Uma seleção de trabalhos criados à medida de cada espaço e de cada cliente.',
    viewImage: 'Ampliar', closeImage: 'Fechar imagem', noProjects: 'Ainda não existem projetos publicados nesta categoria.',
    allProjects: 'Todos os projetos', location: 'Localização', year: 'Ano', materials: 'Materiais',
    siteTagline: 'Soluções à medida, com a qualidade e o rigor de quem trabalha a madeira há gerações.',
    quality: 'Qualidade, tradição e detalhe em cada peça.',
    hero1: 'Mais do que madeira,', hero2: 'realizamos ideias.', heroIntro: 'Projetamos, fabricamos e instalamos soluções à medida, pensadas para responder às necessidades de cada espaço e de cada cliente. Trabalhamos cada projeto com rigor, atenção ao detalhe e respeito pela matéria, acompanhando todo o processo desde a conceção até à instalação final. A experiência acumulada ao longo de gerações traduz-se num trabalho cuidado, funcional e feito para durar.',
    workshop: 'A Carpintaria', story1: 'De pai para filhos.', story2: 'Tradição com futuro.',
    storyP1: 'A história começou em 1975 como Carpintaria Pinto. Em 1995, a continuidade entre pai e filhos deu origem à Carpintaria Pinto & Pintos — uma empresa familiar especializada em carpintaria e marcenaria.',
    storyP2: 'Hoje, uma equipa experiente acompanha cada trabalho desde a conceção técnica e o desenho 3D até ao fabrico e à instalação.', knowStory: 'Conheça a nossa história', since: 'Desde 1975',
    whatWeDo: 'O que fazemos', made1: 'Da ideia à instalação.', made2: 'Tudo à medida.', madeIntro: 'Soluções para habitação, espaços comerciais e projetos especiais, executadas com rigor nos materiais, na construção e nos acabamentos.', viewCatalog: 'Ver catálogo', featured: 'Projetos em destaque', viewProjects: 'Ver todos os projetos',
    aboutUs: 'Sobre nós', aboutIntro: 'Somos uma empresa familiar, reconhecida pela qualidade do nosso trabalho, pelo profissionalismo da nossa equipa e pela forma como procuramos responder, e sempre que possível superar, as expectativas dos nossos clientes e as exigências do mercado.', ourHistory: 'Uma história de família',
    historyP1: 'A nossa origem remonta a 1975, quando iniciou atividade como Carpintaria Pinto. Em 1995, com a continuidade do negócio entre pai e filhos, passou a designar-se Carpintaria Pinto & Pintos.', historyP2: 'Desde então, crescemos com o mesmo propósito: aliar o saber-fazer tradicional à tecnologia para criar soluções em madeira à medida de cada cliente.',
    defines: 'Da ideia à instalação', detail1: 'Qualidade', detail2: 'em cada detalhe.', qualityP: 'Selecionamos cuidadosamente os materiais, trabalhamos com rigor em todas as etapas e acompanhamos cada projeto desde o desenho técnico à instalação, garantindo soluções duradouras e um acabamento irrepreensível.', stages: ['Conceção', 'Fabrico', 'Instalação'],
    contacts: 'Contactos', contact1: 'Vamos dar forma', contact2: 'ao seu próximo projeto.', contactIntro: 'Fale connosco e descubra como podemos realizar o seu projeto. Estamos disponíveis para o acompanhar desde a ideia até à concretização.', viewMap: 'Ver no mapa', name: 'Nome', subject: 'Assunto', message: 'Mensagem', consent: 'Concordo com o tratamento dos meus dados para efeitos de contacto.', prepare: 'Preparar mensagem',
    essence: 'A nossa essência', skipToContent: 'Saltar para o conteúdo', mainNavigation: 'Menu principal', socialNetworks: 'Redes sociais', companyInformation: 'Informação da carpintaria', fundingDownload: 'Descarregar cartaz de financiamento PRR', fundingLogosAlt: 'PRR, República Portuguesa e Financiado pela União Europeia', startWithIdea: 'Começa com uma ideia', fromIdeaToSpace: 'Da ideia ao espaço', catalogSolutions: 'Catálogo de soluções', filterCatalog: 'Filtrar catálogo', workStages: 'Etapas do nosso trabalho', projectPhotos: 'Fotografias do projeto', viewPhoto: 'Ver fotografia', noCatalogImages: 'Não existem imagens nesta categoria.', notFoundTitle1: 'Este espaço ainda', notFoundTitle2: 'não tem forma.', backHome: 'Voltar ao início', natureToSpaces: 'Da natureza aos seus espaços', workshopAlt: 'Área de produção da Carpintaria Pinto & Pintos em Prozelo', workshopCaption: 'A nossa oficina, onde cada projeto ganha forma.', emailNote: 'Conclua o envio no seu programa de email.', emailPrepared: 'O pedido foi preparado no seu programa de email. Conclua o envio nessa aplicação.',
    capabilities: [['Cozinhas', 'Personalizadas em madeira, lacado ou termolaminado.'], ['Roupeiros', 'Interiores práticos, funcionais e adaptados ao espaço.'], ['Portas e janelas', 'Madeiras e ferragens escolhidas para cada utilização.'], ['Móveis', 'Mobiliário personalizado, desenvolvido e visualizado em 3D.'], ['Pavimentos', 'Soalhos, rodapés e decks para interior e exterior.'], ['Tetos e revestimentos', 'Estruturas e painéis em diferentes materiais e acabamentos.']],
  },
  en: {
    nav: ['Projects', 'Catalogue', 'The Workshop', 'Contacts'],
    home: 'Home', menu: 'Menu', close: 'Close menu', phone: 'Phone', email: 'Email',
    fixedCall: 'Call to the Portuguese fixed network', contact: 'Contact us', explore: 'Explore',
    complaints: 'Complaints book', filter: 'Filter', all: 'All',
    projects: 'Projects', catalog: 'Catalogue', houses: 'Homes', commercial: 'Commercial spaces',
    catalogTitle1: 'Our work,', catalogTitle2: 'in every detail.',
    catalogIntro: 'A selection of solutions designed, manufactured and installed to fit each space.',
    projectsTitle1: 'Wood transforms,', projectsTitle2: 'space comes to life.',
    projectsIntro: 'A selection of bespoke projects created for every space and every client.',
    viewImage: 'Enlarge', closeImage: 'Close image', noProjects: 'There are no published projects in this category yet.',
    allProjects: 'All projects', location: 'Location', year: 'Year', materials: 'Materials',
    siteTagline: 'Bespoke solutions, with the quality and precision of generations working with wood.',
    quality: 'Quality, tradition and detail in every piece.',
    hero1: 'More than wood,', hero2: 'we bring ideas to life.', heroIntro: 'We design, manufacture and install bespoke solutions, conceived to meet the needs of every space and every client. We approach each project with rigour, attention to detail and respect for the material, guiding the full process from concept to final installation. Experience accumulated over generations results in careful, functional work made to last.',
    workshop: 'The Workshop', story1: 'From father to sons.', story2: 'Tradition with a future.', storyP1: 'The story began in 1975 as Carpintaria Pinto. In 1995, continuity between father and sons gave rise to Carpintaria Pinto & Pintos — a family business specialising in carpentry and joinery.', storyP2: 'Today, an experienced team follows every job from technical design and 3D drawing through to manufacture and installation.', knowStory: 'Discover our story', since: 'Since 1975',
    whatWeDo: 'What we do', made1: 'From idea to installation.', made2: 'Entirely bespoke.', madeIntro: 'Solutions for homes, commercial spaces and special projects, delivered with precision in materials, construction and finishes.', viewCatalog: 'View catalogue', featured: 'Featured projects', viewProjects: 'View all projects',
    aboutUs: 'About us', aboutIntro: 'We are a family business, recognised for the quality of our work, the professionalism of our team and the way we seek to meet, and whenever possible exceed, the expectations of our clients and the demands of the market.', ourHistory: 'A family story', historyP1: 'Our origins date back to 1975, when Carpintaria Pinto began trading. In 1995, as the business passed from father to sons, it became Carpintaria Pinto & Pintos.', historyP2: 'Since then, we have grown with the same purpose: combining traditional craftsmanship with technology to create bespoke wood solutions for every client.', defines: 'From concept to installation', detail1: 'Quality', detail2: 'in every detail.', qualityP: 'We carefully select materials, work rigorously at every stage and follow each project from technical drawing to installation, ensuring durable solutions and impeccable finishes.', stages: ['Design', 'Manufacture', 'Installation'],
    contacts: 'Contacts', contact1: 'Let us shape', contact2: 'your next project.', contactIntro: 'Talk to us and discover how we can bring your project to life. We will support you from the first idea through to completion.', viewMap: 'View on map', name: 'Name', subject: 'Subject', message: 'Message', consent: 'I agree to the processing of my data for contact purposes.', prepare: 'Prepare message',
    essence: 'Our essence', skipToContent: 'Skip to content', mainNavigation: 'Main navigation', socialNetworks: 'Social media', companyInformation: 'Workshop information', fundingDownload: 'Download PRR funding poster', fundingLogosAlt: 'PRR, Portuguese Republic and funded by the European Union', startWithIdea: 'It starts with an idea', fromIdeaToSpace: 'From idea to space', catalogSolutions: 'Catalogue of solutions', filterCatalog: 'Filter catalogue', workStages: 'Our work stages', projectPhotos: 'Project photographs', viewPhoto: 'View photograph', noCatalogImages: 'There are no images in this category.', notFoundTitle1: 'This space has not', notFoundTitle2: 'taken shape yet.', backHome: 'Back to home', natureToSpaces: 'From nature to your spaces', workshopAlt: 'Carpintaria Pinto & Pintos production area in Prozelo', workshopCaption: 'Our workshop, where every project takes shape.', emailNote: 'Complete the sending process in your email application.', emailPrepared: 'The request has been prepared in your email application. Complete sending it there.',
    capabilities: [['Kitchens', 'Made to measure in wood, lacquer or laminate.'], ['Wardrobes', 'Practical, functional interiors adapted to the space.'], ['Doors and windows', 'Wood and hardware selected for each use.'], ['Furniture', 'Bespoke furniture developed and visualised in 3D.'], ['Flooring', 'Floors, skirting and decking for interiors and exteriors.'], ['Ceilings and wall cladding', 'Structures and panels in different materials and finishes.']],
  },
  fr: {
    nav: ['Projets', 'Catalogue', "L’Atelier", 'Contacts'],
    home: 'Accueil', menu: 'Menu', close: 'Fermer le menu', phone: 'Téléphone', email: 'E-mail',
    fixedCall: 'Appel vers le réseau fixe portugais', contact: 'Contactez-nous', explore: 'Explorer',
    complaints: 'Livre de réclamations', filter: 'Filtrer', all: 'Tous',
    projects: 'Projets', catalog: 'Catalogue', houses: 'Habitations', commercial: 'Espaces commerciaux',
    catalogTitle1: 'Notre travail,', catalogTitle2: 'dans chaque détail.',
    catalogIntro: 'Une sélection de solutions conçues, fabriquées et installées sur mesure pour chaque espace.',
    projectsTitle1: 'Le bois transforme,', projectsTitle2: "l’espace prend vie.",
    projectsIntro: 'Une sélection de projets sur mesure, créés pour chaque espace et chaque client.',
    viewImage: 'Agrandir', closeImage: "Fermer l’image", noProjects: "Aucun projet n’est encore publié dans cette catégorie.",
    allProjects: 'Tous les projets', location: 'Localisation', year: 'Année', materials: 'Matériaux',
    siteTagline: 'Des solutions sur mesure, avec la qualité et la rigueur de générations dédiées au bois.',
    quality: 'Qualité, tradition et souci du détail dans chaque pièce.',
    hero1: 'Bien plus que du bois,', hero2: 'nous réalisons des idées.', heroIntro: 'Nous concevons, fabriquons et installons des solutions sur mesure, pensées pour répondre aux besoins de chaque espace et de chaque client. Nous menons chaque projet avec rigueur, attention au détail et respect de la matière, en accompagnant tout le processus de la conception à l’installation finale. L’expérience accumulée au fil des générations se traduit par un travail soigné, fonctionnel et fait pour durer.',
    workshop: "L’Atelier", story1: 'De père en fils.', story2: 'La tradition tournée vers l’avenir.', storyP1: 'L’histoire commence en 1975 avec Carpintaria Pinto. En 1995, la transmission du père aux fils donne naissance à Carpintaria Pinto & Pintos — une entreprise familiale spécialisée en menuiserie et ébénisterie.', storyP2: 'Aujourd’hui, une équipe expérimentée suit chaque réalisation, de la conception technique et du dessin 3D à la fabrication et à la pose.', knowStory: 'Découvrir notre histoire', since: 'Depuis 1975',
    whatWeDo: 'Notre savoir-faire', made1: "De l’idée à la pose.", made2: 'Entièrement sur mesure.', madeIntro: 'Des solutions pour les habitations, les espaces commerciaux et les projets spéciaux, réalisées avec rigueur dans les matériaux, la construction et les finitions.', viewCatalog: 'Voir le catalogue', featured: 'Projets à la une', viewProjects: 'Voir tous les projets',
    aboutUs: 'À propos', aboutIntro: 'Nous sommes une entreprise familiale, reconnue pour la qualité de notre travail, le professionnalisme de notre équipe et notre volonté de répondre, et chaque fois que possible de dépasser, les attentes de nos clients et les exigences du marché.', ourHistory: 'Une histoire de famille', historyP1: 'Nos origines remontent à 1975, avec la création de Carpintaria Pinto. En 1995, la transmission de l’activité du père aux fils donne naissance à Carpintaria Pinto & Pintos.', historyP2: 'Depuis, nous grandissons avec la même ambition : associer le savoir-faire traditionnel à la technologie pour créer des solutions en bois sur mesure.', defines: 'De l’idée à la pose', detail1: 'La qualité', detail2: 'dans chaque détail.', qualityP: 'Nous sélectionnons soigneusement les matériaux, travaillons avec rigueur à chaque étape et suivons chaque projet du dessin technique à la pose, pour garantir des solutions durables et des finitions impeccables.', stages: ['Conception', 'Fabrication', 'Installation'],
    contacts: 'Contacts', contact1: 'Donnons forme', contact2: 'à votre prochain projet.', contactIntro: 'Contactez-nous pour découvrir comment réaliser votre projet. Nous vous accompagnons de la première idée jusqu’à sa concrétisation.', viewMap: 'Voir sur la carte', name: 'Nom', subject: 'Objet', message: 'Message', consent: 'J’accepte le traitement de mes données à des fins de contact.', prepare: 'Préparer le message',
    essence: 'Notre essence', skipToContent: 'Aller au contenu', mainNavigation: 'Navigation principale', socialNetworks: 'Réseaux sociaux', companyInformation: 'Informations de l’atelier', fundingDownload: 'Télécharger l’affiche de financement PRR', fundingLogosAlt: 'PRR, République portugaise et financement de l’Union européenne', startWithIdea: 'Tout commence par une idée', fromIdeaToSpace: 'De l’idée à l’espace', catalogSolutions: 'Catalogue de solutions', filterCatalog: 'Filtrer le catalogue', workStages: 'Étapes de notre travail', projectPhotos: 'Photographies du projet', viewPhoto: 'Voir la photographie', noCatalogImages: 'Il n’y a pas d’images dans cette catégorie.', notFoundTitle1: 'Cet espace n’a pas encore', notFoundTitle2: 'pris forme.', backHome: 'Retour à l’accueil', natureToSpaces: 'De la nature à vos espaces', workshopAlt: 'Zone de production de Carpintaria Pinto & Pintos à Prozelo', workshopCaption: 'Notre atelier, où chaque projet prend forme.', emailNote: 'Terminez l’envoi dans votre application de messagerie.', emailPrepared: 'La demande a été préparée dans votre application de messagerie. Terminez l’envoi dans cette application.',
    capabilities: [['Cuisines', 'Sur mesure en bois, laqué ou stratifié.'], ['Armoires', 'Des intérieurs pratiques et fonctionnels adaptés à l’espace.'], ['Portes et fenêtres', 'Bois et ferrures sélectionnés pour chaque usage.'], ['Mobilier', 'Mobilier sur mesure conçu et visualisé en 3D.'], ['Revêtements de sol', 'Parquets, plinthes et terrasses pour intérieur et extérieur.'], ['Plafonds et revêtements', 'Structures et panneaux dans différents matériaux et finitions.']],
  },
} as const;

const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void; t: Dictionary }>({
  locale: 'pt', setLocale: () => undefined, t: dictionaries.pt,
});

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-PT' : locale;
  }, [locale]);
  const value = useMemo(() => ({
    locale,
    setLocale(next: Locale) {
      updateLocale(next);
      document.cookie = `pintos_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    },
    t: dictionaries[locale] as Dictionary,
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() { return useContext(LocaleContext); }

export function localized(value: LocalizedText, locale: Locale) {
  return value[locale] || value.pt;
}

export function translatedCategory(value: string, locale: Locale) {
  const key = value.trim().toLocaleLowerCase('pt');
  if (key === 'moradia') return locale === 'en' ? 'Home' : locale === 'fr' ? 'Habitation' : value;
  if (key === 'espaço comercial' || key === 'espaco-comercial') return locale === 'en' ? 'Commercial space' : locale === 'fr' ? 'Espace commercial' : value;
  return value;
}

export function translatedCatalogCategory(value: string, locale: Locale) {
  const key = value.trim().toLocaleLowerCase('pt').replace(/\s+/g, '-');
  const labels: Record<string, Record<Locale, string>> = {
    cozinhas: { pt: 'Cozinhas', en: 'Kitchens', fr: 'Cuisines' },
    roupeiros: { pt: 'Roupeiros', en: 'Wardrobes', fr: 'Armoires' },
    'portas-janelas': { pt: 'Portas e Janelas', en: 'Doors and Windows', fr: 'Portes et Fenêtres' },
    'portas-e-janelas': { pt: 'Portas e Janelas', en: 'Doors and Windows', fr: 'Portes et Fenêtres' },
    móveis: { pt: 'Móveis', en: 'Furniture', fr: 'Mobilier' },
    moveis: { pt: 'Móveis', en: 'Furniture', fr: 'Mobilier' },
    pavimentos: { pt: 'Pavimentos', en: 'Flooring', fr: 'Revêtements de sol' },
    'tetos-revestimentos': { pt: 'Tetos e Revestimentos', en: 'Ceilings and Cladding', fr: 'Plafonds et Revêtements' },
    'tetos-e-revestimentos': { pt: 'Tetos e Revestimentos', en: 'Ceilings and Cladding', fr: 'Plafonds et Revêtements' },
  };
  return labels[key]?.[locale] || value;
}

export function LanguageSelect({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className={`language-switch ${className || ''}`} role="group" aria-label="Language / Langue / Idioma">
      {(['pt', 'en', 'fr'] as const).map((value, index) => (
        <span key={value}>
          {index > 0 && <i aria-hidden="true">|</i>}
          <button
            type="button"
            onClick={() => setLocale(value)}
            aria-pressed={locale === value}
          >
            {value.toUpperCase()}
          </button>
        </span>
      ))}
    </div>
  );
}
