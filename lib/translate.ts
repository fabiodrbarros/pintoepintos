import 'server-only';

type TranslationSource = { title: string; description: string; materials: string };
type TranslationResult = { en: TranslationSource; fr: TranslationSource };

async function libreTranslate(text: string, target: 'en' | 'fr') {
  if (!text) return '';
  const endpoint = process.env.TRANSLATION_API_URL;
  if (!endpoint) return null;
  const response = await fetch(`${endpoint.replace(/\/$/, '')}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'pt', target, format: 'text' }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`LibreTranslate respondeu com ${response.status}.`);
  const result = (await response.json()) as { translatedText?: string };
  if (!result.translatedText) throw new Error('LibreTranslate não devolveu uma tradução.');
  return result.translatedText;
}

async function myMemoryTranslate(text: string, target: 'en' | 'fr') {
  if (!text) return '';
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining) {
    if (remaining.length <= 220) {
      chunks.push(remaining);
      break;
    }
    const boundary = remaining.lastIndexOf(' ', 220);
    const end = boundary > 80 ? boundary : 220;
    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end).trimStart();
  }
  const translated = await Promise.all(chunks.map(async (chunk) => {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', chunk.trim());
    url.searchParams.set('langpair', `pt|${target}`);
    url.searchParams.set('mt', '1');
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`MyMemory respondeu com ${response.status}.`);
    const result = (await response.json()) as { responseData?: { translatedText?: string }; responseStatus?: number };
    if (!result.responseData?.translatedText || (result.responseStatus && result.responseStatus >= 400)) {
      throw new Error('O serviço gratuito não devolveu uma tradução.');
    }
    return result.responseData.translatedText;
  }));
  return translated.join(' ');
}

async function translateText(text: string, target: 'en' | 'fr') {
  try {
    const local = await libreTranslate(text, target);
    if (local !== null) return local;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
  }
  return myMemoryTranslate(text, target);
}

export async function translateContent(source: TranslationSource): Promise<TranslationResult> {
  const translateLanguage = async (target: 'en' | 'fr') => {
    const [title, description, materials] = await Promise.all([
      translateText(source.title, target),
      translateText(source.description, target),
      translateText(source.materials, target),
    ]);
    return { title, description, materials };
  };
  const [en, fr] = await Promise.all([translateLanguage('en'), translateLanguage('fr')]);
  return { en, fr };
}
