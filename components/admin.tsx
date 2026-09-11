'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Languages, LogOut, Pencil, Plus, Save, Trash2, Upload } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

async function readJson<T>(response: Response): Promise<T | null> {
  const body = await response.text();
  if (!body.trim()) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}

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
  const [username, setUsername] = useState('');
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
            body: JSON.stringify({ username, password }),
          });
          const result = await readJson<{ error?: string }>(response);
          if (!response.ok) {
            setError(result?.error || 'Não foi possível iniciar sessão.');
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
          Utilizador
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
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
  const kind: ContentKind = 'catalog';
  const [items, setItems] = useState<CmsItem[]>([]);
  const [categories, setCategories] = useState<CmsCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<CmsItem>(blankItem('catalog'));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CmsItem | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const deleteCancelRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const newItemRef = useRef<HTMLButtonElement>(null);

  const catalogCategories = categories.filter((category) => category.kind === kind);
  const visibleItems = items.filter(
    (item) => item.kind === kind && (activeCategory === 'all' || item.category === activeCategory),
  );

  async function loadItems() {
    const response = await fetch('/api/admin/items', { cache: 'no-store' });
    if (response.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const result = await readJson<CmsItem[]>(response);
    if (!response.ok || !result) {
      setStatus('Não foi possível carregar o catálogo. Tente atualizar a página.');
      return;
    }
    setItems(result);
  }

  async function loadCategories() {
    const response = await fetch('/api/admin/categories', { cache: 'no-store' });
    const result = await readJson<CmsCategory[]>(response);
    if (response.ok && result) setCategories(result);
    else setStatus('Não foi possível carregar as categorias. Tente atualizar a página.');
  }

  useEffect(() => {
    void loadItems();
    void loadCategories();
  }, []);

  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => setStatus(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setBusy(true);
    setStatus('A criar e traduzir categoria…');
    const response = await fetch('/api/admin/categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, name: newCategory }),
    });
    const result = await readJson<{ slug: string; error?: string }>(response);
    if (!response.ok || !result) setStatus(result?.error || 'Não foi possível criar a categoria.');
    else {
      setNewCategory('');
      setCreatingCategory(false);
      await loadCategories();
      setActiveCategory(result.slug);
      setSelected({ ...blankItem(kind), category: result.slug });
      setEditing(false);
      setStatus('Categoria criada e selecionada.');
    }
    setBusy(false);
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
    const result = await readJson<{ url?: string; error?: string }>(response);
    if (!response.ok || !result?.url) throw new Error(result?.error || 'Upload falhou.');
    const uploadedUrl = result.url;
    setSelected((current) => ({
      ...current,
      coverImage: gallery ? current.coverImage || uploadedUrl : uploadedUrl,
      images: gallery ? [...current.images, uploadedUrl] : current.images,
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
    const result = await readJson<{ en: { title: string; description: string; materials: string }; fr: { title: string; description: string; materials: string }; error?: string }>(response);
    if (!response.ok || !result) {
      setStatus(result?.error || 'A tradução falhou.');
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
    const result = await readJson<CmsItem & { error?: string }>(response);
    if (!response.ok || !result) setStatus(result?.error || 'Não foi possível guardar.');
    else {
      setSelected(result as CmsItem);
      await loadItems();
      setStatus('Alterações guardadas.');
    }
    setBusy(false);
  }

  function requestDelete(item: CmsItem, trigger: HTMLButtonElement) {
    deleteTriggerRef.current = trigger;
    setDeleteError('');
    setDeleteTarget(item);
  }

  async function remove() {
    const target = deleteTarget;
    if (!target?.id || deleting) return;

    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch(`/api/admin/items?id=${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
      });
      const result = await readJson<{ ok?: boolean; error?: string }>(response);
      if (response.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'Não foi possível eliminar o produto. Tente novamente.');
      }

      setItems((current) => current.filter((item) => item.id !== target.id));
      if (selected.id === target.id) {
        setSelected(blankItem(kind));
        setEditing(false);
      }
      setDeleteTarget(null);
      setStatus(`“${target.title.pt}” foi eliminado.`);
      await loadItems();
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível eliminar o produto. Tente novamente.';
      setDeleteError(message);
      setStatus(message);
    } finally {
      setDeleting(false);
    }
  }

  const statusIsError = /não foi|falhou|obrigatóri|selecione/i.test(status);

  return (
    <div className="admin-shell">
      {status && <div className={`admin-notice ${statusIsError ? 'is-error' : ''}`} role={statusIsError ? 'alert' : 'status'}>
        {status}
      </div>}
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
          <div className="admin-category-list" aria-label="Categorias do catálogo">
            <button
              type="button"
              className={activeCategory === 'all' ? 'is-active' : ''}
              onClick={() => {
                setActiveCategory('all');
                setSelected(blankItem(kind));
                setEditing(false);
              }}
            >Todos os itens</button>
            {catalogCategories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={activeCategory === category.slug ? 'is-active' : ''}
                onClick={() => {
                  setActiveCategory(category.slug);
                  setSelected({ ...blankItem(kind), category: category.slug });
                  setEditing(false);
                }}
              >{category.name.pt}</button>
            ))}
          </div>
          <button className="admin-new admin-new-category" type="button" onClick={() => setCreatingCategory(true)}>
            <Plus size={16} /> Nova categoria
          </button>
          {creatingCategory && <div className="admin-category-manager">
            <form onSubmit={createCategory}>
              <input autoFocus value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Ex.: Cozinhas" aria-label="Nome da nova categoria" />
              <button type="submit" disabled={busy}><Plus size={15} /> Adicionar</button>
            </form>
          </div>}
        </aside>

        {!editing ? <section className="admin-editor admin-items-view">
          <div className="admin-editor-heading">
            <div>
              <span>Catálogo</span>
              <h1>{activeCategory === 'all' ? 'Todos os itens' : catalogCategories.find((category) => category.slug === activeCategory)?.name.pt}</h1>
            </div>
            <button
              ref={newItemRef}
              className="admin-new"
              type="button"
              onClick={() => {
                setSelected({ ...blankItem(kind), category: activeCategory === 'all' ? '' : activeCategory });
                setStatus('');
                setEditing(true);
              }}
            ><Plus size={16} /> Novo item</button>
          </div>
          <div className="admin-items-table-wrap">
            <table className="admin-items-table">
              <colgroup>
                <col className="admin-items-table-image-column" />
                <col />
                <col className="admin-items-table-actions-column" />
              </colgroup>
              <thead><tr><th>Imagem</th><th>Título</th><th>Ações</th></tr></thead>
              <tbody>{visibleItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.coverImage ? <img src={item.coverImage} alt="" /> : <span>—</span>}</td>
                  <td>{item.title.pt}</td>
                  <td><div className="admin-table-actions">
                      <button type="button" onClick={() => { setSelected(item); setStatus(''); setEditing(true); }}><Pencil size={15} /> Editar</button>
                      <button
                        type="button"
                        className="admin-table-delete"
                        onClick={(event) => requestDelete(item, event.currentTarget)}
                      ><Trash2 size={15} /> Apagar</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            {!visibleItems.length && <p className="admin-empty-items">Ainda não existem itens nesta categoria.</p>}
          </div>
        </section> : <section className="admin-editor">
          <div className="admin-editor-heading">
            <div><span>Catálogo</span><h1>{selected.id ? 'Editar item' : 'Novo item'}</h1></div>
            <div className="admin-editor-actions">
              <button type="button" onClick={() => setEditing(false)}>Voltar à lista</button>
              <button type="button" onClick={translate} disabled={busy}><Languages size={17} /> Traduzir EN + FR</button>
              <button className="is-primary" type="button" onClick={save} disabled={busy}><Save size={17} /> Guardar</button>
            </div>
          </div>

          <div className="admin-fields admin-fields-meta">
            <label>Categoria *<select value={selected.category} onChange={(e) => setSelected({ ...selected, category: e.target.value })}><option value="">Selecionar categoria</option>{categories.filter((category) => category.kind === kind).map((category) => <option value={category.slug} key={category.id}>{category.name.pt}</option>)}</select></label>
            <label>Ano *<input type="number" min="1900" max="2100" step="1" placeholder="Ex.: 2026" value={selected.year} onChange={(e) => setSelected({ ...selected, year: e.target.value })} /></label>
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
                  <label>Descrição{locale === 'pt' ? ' *' : ''}<textarea rows={5} value={selected.description[locale]} onChange={(e) => updateLocalized('description', locale, e.target.value)} /></label>
                  <label>Materiais{locale === 'pt' ? ' *' : ''}<textarea rows={3} value={selected.materials[locale]} onChange={(e) => updateLocalized('materials', locale, e.target.value)} /></label>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="admin-media">
            <div>
              <span>Imagem principal</span>
              {selected.coverImage && <img src={selected.coverImage} alt="" />}
              <label className="admin-upload"><Upload size={16} /> {selected.coverImage ? 'Substituir imagem' : 'Carregar imagem'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { if (e.target.files?.[0]) void handleUpload(e.target.files[0]); }} /></label>
            </div>
          </div>

          <div className="admin-editor-footer">
            {selected.id && <button
              type="button"
              className="admin-delete"
              onClick={(event) => requestDelete(selected, event.currentTarget)}
            ><Trash2 size={16} /> Eliminar</button>}
          </div>
        </section>}
      </div>
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
      >
        <AlertDialogContent
          className="admin-confirm-dialog"
          initialFocus={deleteCancelRef}
          finalFocus={() => deleteTriggerRef.current?.isConnected
            ? deleteTriggerRef.current
            : newItemRef.current}
        >
          <AlertDialogHeader className="admin-confirm-header">
            <AlertDialogTitle className="admin-confirm-title">
              Eliminar “{deleteTarget?.title.pt}”?
            </AlertDialogTitle>
            <AlertDialogDescription className="admin-confirm-description">
              Esta ação elimina definitivamente este produto do catálogo e não pode ser anulada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="admin-confirm-error" role="alert">{deleteError}</p>}
          <AlertDialogFooter className="admin-confirm-footer">
            <AlertDialogCancel
              ref={deleteCancelRef}
              className="admin-confirm-cancel"
              disabled={deleting}
            >Cancelar</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              className="admin-confirm-delete"
              disabled={deleting}
              onClick={() => void remove()}
            >{deleting ? 'A eliminar…' : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
