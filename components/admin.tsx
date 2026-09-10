'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Languages, LogOut, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import type { CmsCategory, CmsItem, ContentKind, Locale } from '@/lib/cms-types';
import { emptyLocalizedText } from '@/lib/cms-types';
import { slugify } from '@/lib/slug';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function blankItem(kind: ContentKind): CmsItem {
  return {
    id: '',
    kind,
    slug: '',
    category: '',
    title: emptyLocalizedText(),
    description: emptyLocalizedText(),
    materials: emptyLocalizedText(),
    coverImage: '',
    images: [],
    client: '',
    location: '',
    year: '',
    sortOrder: 0,
    published: true,
  };
}

export function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="admin-login">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setLoading(true);
          setError('');
          const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
          });
          const result = (await response.json()) as { error?: string };
          if (!response.ok) {
            setError(result.error || 'Não foi possível iniciar sessão.');
            setLoading(false);
            return;
          }
          window.location.href = '/admin';
        }}
      >
        <Image
          src="/carpintaria-pintos-logo-menu-transparent.png"
          width={2071}
          height={759}
          alt="Carpintaria Pinto & Pintos"
          unoptimized
        />
        <span>Painel de gestão</span>
        <h1>Iniciar sessão</h1>
        <label>
          Palavra-passe
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
        <a href="/"><ArrowLeft size={15} /> Voltar ao site</a>
      </form>
    </div>
  );
}

export function AdminDashboard() {
  const [kind, setKind] = useState<ContentKind>('project');
  const [items, setItems] = useState<CmsItem[]>([]);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selected, setSelected] = useState<CmsItem>(blankItem('project'));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const visibleItems = useMemo(
    () => items.filter((item) => item.kind === kind),
    [items, kind],
  );

  async function loadItems() {
    const response = await fetch('/api/admin/items', { cache: 'no-store' });
    if (response.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    setItems((await response.json()) as CmsItem[]);
  }

  async function loadCategories() {
    const response = await fetch('/api/admin/categories', { cache: 'no-store' });
    if (response.ok) setCategories((await response.json()) as CmsCategory[]);
  }

  useEffect(() => {
    void loadItems();
    void loadCategories();
  }, []);

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setBusy(true);
    setStatus('A criar e traduzir categoria…');
    const response = await fetch('/api/admin/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, name: newCategory }),
    });
    const result = await response.json();
    if (!response.ok) setStatus(result.error || 'Não foi possível criar a categoria.');
    else {
      setNewCategory('');
      await loadCategories();
      setSelected((current) => ({ ...current, category: result.slug }));
      setStatus('Categoria criada e selecionada.');
    }
    setBusy(false);
  }

  async function removeCategory(category: CmsCategory) {
    const response = await fetch(`/api/admin/categories?id=${encodeURIComponent(category.id)}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) setStatus(result.error || 'Não foi possível eliminar a categoria.');
    else {
      await loadCategories();
      if (selected.category === category.slug) setSelected((current) => ({ ...current, category: '' }));
      setStatus('Categoria eliminada.');
    }
  }

  function changeKind(nextKind: ContentKind) {
    setKind(nextKind);
    setSelected(blankItem(nextKind));
    setStatus('');
  }

  function updateLocalized(
    field: 'title' | 'description' | 'materials',
    locale: Locale,
    value: string,
  ) {
    setSelected((current) => ({
      ...current,
      ...(field === 'title' && locale === 'pt' ? { slug: slugify(value) } : {}),
      [field]: { ...current[field], [locale]: value },
    }));
  }

  async function uploadImage(file: File, gallery = false) {
    const form = new FormData();
    form.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const result = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !result.url) throw new Error(result.error || 'Upload falhou.');
    setSelected((current) => ({
      ...current,
      coverImage: gallery ? current.coverImage || result.url! : result.url!,
      images: gallery ? [...current.images, result.url!] : current.images,
    }));
  }

  async function handleUpload(file: File, gallery = false) {
    setBusy(true);
    setStatus('A carregar imagem…');
    try {
      await uploadImage(file, gallery);
      setStatus('Imagem carregada. Guarde o conteúdo para concluir.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível carregar a imagem.');
    } finally {
      setBusy(false);
    }
  }

  async function translate() {
    setBusy(true);
    setStatus('A traduzir…');
    const response = await fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selected.title.pt,
        description: selected.description.pt,
        materials: selected.materials.pt,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus(result.error || 'A tradução falhou.');
    } else {
      setSelected((current) => ({
        ...current,
        title: { ...current.title, en: result.en.title, fr: result.fr.title },
        description: {
          ...current.description,
          en: result.en.description,
          fr: result.fr.description,
        },
        materials: {
          ...current.materials,
          en: result.en.materials,
          fr: result.fr.materials,
        },
      }));
      setStatus('Traduções preenchidas. Confirme antes de guardar.');
    }
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    setStatus('A guardar…');
    const response = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    });
    const result = await response.json();
    if (!response.ok) setStatus(result.error || 'Não foi possível guardar.');
    else {
      setSelected(result as CmsItem);
      await loadItems();
      setStatus('Alterações guardadas.');
    }
    setBusy(false);
  }

  async function remove() {
    if (!selected.id) return;
    await fetch(`/api/admin/items?id=${encodeURIComponent(selected.id)}`, {
      method: 'DELETE',
    });
    await loadItems();
    setSelected(blankItem(kind));
    setStatus('Conteúdo eliminado.');
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Image
          src="/carpintaria-pintos-logo-menu-transparent.png"
          width={2071}
          height={759}
          alt="Carpintaria Pinto & Pintos"
          unoptimized
        />
        <span>Gestão de conteúdos</span>
        <a href="/" target="_blank" rel="noreferrer">Ver site</a>
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            window.location.href = '/admin/login';
          }}
        ><LogOut size={16} /> Sair</button>
      </header>

      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="admin-kind-switch">
            <button className={kind === 'project' ? 'is-active' : ''} onClick={() => changeKind('project')}>Projetos</button>
            <button className={kind === 'catalog' ? 'is-active' : ''} onClick={() => changeKind('catalog')}>Catálogo</button>
          </div>
          <div className="admin-category-manager">
            <span>Categorias de {kind === 'project' ? 'projetos' : 'catálogo'}</span>
            <form onSubmit={createCategory}>
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Nova categoria" aria-label="Nova categoria" />
              <button type="submit" disabled={busy} aria-label="Criar categoria"><Plus size={15} /></button>
            </form>
            <div>
              {categories.filter((category) => category.kind === kind).map((category) => (
                <span key={category.id}>{category.name.pt}<button type="button" aria-label={`Eliminar ${category.name.pt}`} onClick={() => void removeCategory(category)}><X size={12} /></button></span>
              ))}
            </div>
          </div>
          <button className="admin-new" type="button" onClick={() => setSelected(blankItem(kind))}>
            <Plus size={16} /> Novo conteúdo
          </button>
          <div className="admin-item-list">
            {visibleItems.map((item) => (
              <button
                type="button"
                className={selected.id === item.id ? 'is-active' : ''}
                key={item.id}
                onClick={() => { setSelected(item); setStatus(''); }}
              >
                <span>{item.title.pt}</span>
                <small>{item.published ? 'Publicado' : 'Rascunho'}</small>
              </button>
            ))}
          </div>
        </aside>

        <section className="admin-editor">
          <div className="admin-editor-heading">
            <div><span>{kind === 'project' ? 'Projeto' : 'Catálogo'}</span><h1>{selected.id ? 'Editar conteúdo' : 'Novo conteúdo'}</h1></div>
            <div className="admin-editor-actions">
              <button type="button" onClick={translate} disabled={busy}><Languages size={17} /> Traduzir EN + FR</button>
              <button className="is-primary" type="button" onClick={save} disabled={busy}><Save size={17} /> Guardar</button>
            </div>
          </div>

          <div className="admin-fields admin-fields-meta">
            <label>Categoria<select value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value })}><option value="">Selecionar categoria</option>{categories.filter((category) => category.kind === kind).map((category) => <option value={category.slug} key={category.id}>{category.name.pt}</option>)}</select></label>
            <label>Ordem<input type="number" value={selected.sortOrder} onChange={(e) => setSelected({ ...selected, sortOrder: Number(e.target.value) })} /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={selected.published} onChange={(e) => setSelected({ ...selected, published: e.target.checked })} /> Publicado</label>
          </div>

          <Tabs defaultValue="pt" className="admin-language-tabs">
            <TabsList variant="line">
              <TabsTrigger value="pt">Português</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="fr">Français</TabsTrigger>
            </TabsList>
            {(['pt', 'en', 'fr'] as Locale[]).map((locale) => (
              <TabsContent value={locale} key={locale}>
                <div className="admin-fields">
                  <label>Título<input value={selected.title[locale]} onChange={(e) => updateLocalized('title', locale, e.target.value)} /></label>
                  <label>Descrição<textarea rows={5} value={selected.description[locale]} onChange={(e) => updateLocalized('description', locale, e.target.value)} /></label>
                  {kind === 'project' && <label>Materiais<textarea rows={3} value={selected.materials[locale]} onChange={(e) => updateLocalized('materials', locale, e.target.value)} /></label>}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {kind === 'project' && (
            <div className="admin-fields admin-project-fields">
              <label>Cliente<input value={selected.client} onChange={(e) => setSelected({ ...selected, client: e.target.value })} /></label>
              <label>Localização<input value={selected.location} onChange={(e) => setSelected({ ...selected, location: e.target.value })} /></label>
              <label>Ano<input value={selected.year} onChange={(e) => setSelected({ ...selected, year: e.target.value })} /></label>
            </div>
          )}

          <div className="admin-media">
            <div>
              <span>Imagem principal</span>
              {selected.coverImage && <img src={selected.coverImage} alt="" />}
              <label className="admin-upload"><Upload size={16} /> Carregar imagem<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { if (e.target.files?.[0]) void handleUpload(e.target.files[0]); }} /></label>
            </div>
            {kind === 'project' && <div>
              <span>Galeria</span>
              <div className="admin-gallery">{selected.images.map((image, index) => <button type="button" key={`${image}-${index}`} onClick={() => setSelected({ ...selected, images: selected.images.filter((_, i) => i !== index) })}><img src={image} alt="" /><Trash2 size={14} /></button>)}</div>
              <label className="admin-upload"><Plus size={16} /> Adicionar fotografia<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { Array.from(e.target.files || []).forEach((file) => void handleUpload(file, true)); }} /></label>
            </div>}
          </div>

          <div className="admin-editor-footer">
            <output>{status}</output>
            {selected.id && <AlertDialog>
              <AlertDialogTrigger className="admin-delete"><Trash2 size={16} /> Eliminar</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Eliminar este conteúdo?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser anulada.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>}
          </div>
        </section>
      </div>
    </div>
  );
}
