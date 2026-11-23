'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

type UserRole = 'cititor' | 'bibliotecar' | 'admin';

type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required?: boolean;
};

type TableConfig = {
  key: string;
  label: string;
  subtitle: string;
  pk: string;
  titleField: string;
  fields: FieldConfig[];
  extraColumns?: string[];
  allowedRoles: UserRole[];
};

const TABLES: TableConfig[] = [
  {
    key: 'carti',
    label: 'Carti',
    subtitle: 'Catalogul general de volume si autori',
    pk: 'id_carte',
    titleField: 'titlu',
    allowedRoles: ['cititor', 'bibliotecar', 'admin'],
    fields: [
      { name: 'titlu', label: 'Titlu', type: 'text', required: true },
      { name: 'autor', label: 'Autor', type: 'text', required: true },
      { name: 'isbn', label: 'ISBN', type: 'text', required: true },
    ],
  },
  {
    key: 'utilizatori',
    label: 'Utilizatori',
    subtitle: 'Cititori, bibliotecari si administratori',
    pk: 'id_utilizator',
    titleField: 'nume',
    allowedRoles: ['admin'],
    fields: [
      { name: 'nume', label: 'Nume', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'rol', label: 'Rol', type: 'select', options: ['cititor', 'bibliotecar', 'admin'], required: true },
    ],
  },
  {
    key: 'inventar_fizic',
    label: 'Inventar Fizic',
    subtitle: 'Exemplare tiparite si locatia lor pe raft',
    pk: 'id_exemplar',
    titleField: 'locatie_raft',
    allowedRoles: ['cititor', 'bibliotecar', 'admin'],
    fields: [
      { name: 'id_carte', label: 'ID Carte', type: 'number', required: true },
      { name: 'locatie_raft', label: 'Locatie Raft', type: 'text' },
      { name: 'stare', label: 'Stare', type: 'select', options: ['disponibil', 'imprumutat', 'deteriorat', 'pierdut'], required: true },
    ],
  },
  {
    key: 'imprumuturi_fizice',
    label: 'Imprumuturi Fizice',
    subtitle: 'Evidenta cartilor imprumutate si scadente',
    pk: 'id_imprumut',
    titleField: 'data_scadenta',
    allowedRoles: ['bibliotecar', 'admin'],
    fields: [
      { name: 'id_utilizator', label: 'ID Utilizator', type: 'number', required: true },
      { name: 'id_exemplar', label: 'ID Exemplar', type: 'number', required: true },
      { name: 'data_imprumut', label: 'Data Imprumut', type: 'date' },
      { name: 'data_scadenta', label: 'Data Scadenta', type: 'date', required: true },
    ],
  },
  {
    key: 'editii_virtuale',
    label: 'Editii Virtuale',
    subtitle: 'Carti digitale in format PDF, EPUB si MP3',
    pk: 'id_editie',
    titleField: 'format_fisier',
    allowedRoles: ['cititor', 'bibliotecar', 'admin'],
    fields: [
      { name: 'id_carte', label: 'ID Carte', type: 'number', required: true },
      { name: 'format_fisier', label: 'Format Fisier', type: 'select', options: ['PDF', 'EPUB', 'MP3'], required: true },
      { name: 'pret_achizitie', label: 'Pret Achizitie', type: 'number', required: true },
    ],
  },
  {
    key: 'achizitii_virtuale',
    label: 'Achizitii Virtuale',
    subtitle: 'Registrul tranzactiilor pentru editii digitale',
    pk: 'id_tranzactie',
    titleField: 'data_achizitie',
    allowedRoles: ['bibliotecar', 'admin'],
    fields: [
      { name: 'id_utilizator', label: 'ID Utilizator', type: 'number', required: true },
      { name: 'id_editie', label: 'ID Editie', type: 'number', required: true },
    ],
    extraColumns: ['data_achizitie'],
  },
];

function getBadgeStyle(value: string) {
  const v = String(value).toLowerCase();
  if (v === 'disponibil' || v === 'admin') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (v === 'imprumutat' || v === 'bibliotecar' || v === 'epub') return 'bg-amber-100 text-amber-900 border-amber-300';
  if (v === 'deteriorat' || v === 'pierdut') return 'bg-rose-100 text-rose-900 border-rose-300';
  if (v === 'pdf' || v === 'mp3' || v === 'cititor') return 'bg-stone-200 text-stone-800 border-stone-300';
  return '';
}

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('cititor');
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<string>('carti');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState<string>('');
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const visibleTables = TABLES.filter((t) => t.allowedRoles.includes(userRole));
  const currentTable = visibleTables.find((t) => t.key === activeTab) || visibleTables[0];
  const canEdit = userRole === 'admin' || userRole === 'bibliotecar';

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
        return;
      }

      const email = data.session.user.email ?? null;
      setUserEmail(email);

      if (email) {
        const { data: userProfile } = await supabase
          .from('utilizatori')
          .select('rol')
          .eq('email', email)
          .single();

        if (userProfile?.rol) {
          setUserRole(userProfile.rol as UserRole);
        }
      }

      setAuthChecking(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(currentTable.key)
      .select('*')
      .order(currentTable.pk, { ascending: true });

    if (error) {
      setError(`Eroare la citire: ${error.message}`);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authChecking) return;
    setFormData({});
    setEditingId(null);
    setSearch('');
    fetchRows();
  }, [activeTab, authChecking, userRole]);

  const handleChange = (name: string, value: string, type: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setError(null);

    const payload: Record<string, any> = {};
    currentTable.fields.forEach((f) => {
      if (formData[f.name] !== undefined && formData[f.name] !== '') {
        payload[f.name] = formData[f.name];
      } else if (f.type === 'select' && f.options) {
        payload[f.name] = f.options[0];
      }
    });

    if (editingId !== null) {
      const { error } = await supabase
        .from(currentTable.key)
        .update(payload)
        .eq(currentTable.pk, editingId);

      if (error) return setError(`Eroare la actualizare: ${error.message}`);
    } else {
      const { error } = await supabase.from(currentTable.key).insert([payload]);
      if (error) return setError(`Eroare la adaugare: ${error.message}`);
    }

    setFormData({});
    setEditingId(null);
    fetchRows();
  };

  const handleEdit = (row: Record<string, any>) => {
    if (!canEdit) return;
    setEditingId(row[currentTable.pk]);
    const initial: Record<string, any> = {};
    currentTable.fields.forEach((f) => {
      initial[f.name] = row[f.name] ?? '';
    });
    setFormData(initial);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!canEdit) return;
    if (!confirm('Sigur vrei sa stergi aceasta inregistrare din registru?')) return;
    setError(null);
    const { error } = await supabase
      .from(currentTable.key)
      .delete()
      .eq(currentTable.pk, id);

    if (error) {
      setError(`Eroare la stergere: ${error.message}`);
    } else {
      fetchRows();
    }
  };

  const displayColumns = [
    currentTable.pk,
    ...currentTable.fields.map((f) => f.name),
    ...(currentTable.extraColumns || []),
  ];

  const filteredRows = rows.filter((row) =>
    displayColumns.some((col) =>
      String(row[col] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#F6F1E7] flex items-center justify-center font-serif text-stone-600">
        Se verifica autentificarea...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1E7] text-stone-900">
      {/* Antet tip coperta de carte / firma de librarie */}
      <header className="bg-[#2C1E16] text-[#F6F1E7] border-b-4 border-amber-700 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-1">
              Biblioteca Hibrida &bull; Registru Digital
            </p>
            <h1 className="text-4xl font-serif font-bold tracking-tight">
              Ink &amp; Click
            </h1>
            <p className="text-stone-300 text-sm mt-1">
              Administrare volume tiparite, editii digitale, cititori si imprumuturi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#3B281E] border border-amber-700/40 rounded-lg px-4 py-2.5 text-right">
              <span className="text-xs uppercase tracking-wider text-amber-300 block">
                Sectiune activa
              </span>
              <span className="font-serif text-lg font-semibold">
                {currentTable.label} ({rows.length})
              </span>
            </div>

            <div className="bg-[#3B281E] border border-amber-700/40 rounded-lg px-4 py-2.5 text-right text-xs">
              <div className="flex items-center justify-end gap-2">
                <span className="text-stone-300">{userEmail}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getBadgeStyle(userRole)}`}>
                  {userRole}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-amber-400 hover:underline font-semibold mt-1"
              >
                Deconectare
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Navigare tip semne de carte (bookmarks) */}
        <nav className="flex flex-wrap gap-2 border-b border-stone-300 pb-4">
          {visibleTables.map((t) => {
            const active = currentTable.key === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setRows([]);
                  setActiveTab(t.key);
                }}
                className={`px-4 py-2.5 rounded-t-lg text-sm font-serif font-semibold transition-all border-b-2 ${
                  active
                    ? 'bg-amber-900 text-[#FAF6F0] border-amber-500 shadow-sm -translate-y-0.5'
                    : 'bg-[#EDE4D3] text-stone-800 border-transparent hover:bg-[#E4D7C0]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-700 text-rose-900 px-4 py-3 rounded-r-lg text-sm shadow-sm">
            <strong>Atentie:</strong> {error}
          </div>
        )}

        {/* Formular stil fisa de registru - vizibil doar pentru bibliotecar si admin */}
        {canEdit ? (
          <section className="bg-[#FFFDF9] p-6 rounded-xl shadow-sm border border-stone-300/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-800" />
            <div className="pl-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-serif font-bold text-stone-900">
                    {editingId !== null
                      ? `Modifica inregistrarea #${editingId}`
                      : `Inregistrare noua in ${currentTable.label}`}
                  </h2>
                  <p className="text-xs text-stone-500">{currentTable.subtitle}</p>
                </div>
                {editingId !== null && (
                  <span className="text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                    Mod Editare
                  </span>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end"
              >
                {currentTable.fields.map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={formData[field.name] ?? field.options?.[0] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                        className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-amber-700"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        step={field.name === 'pret_achizitie' ? '0.01' : undefined}
                        required={field.required}
                        value={formData[field.name] ?? ''}
                        onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                        className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-amber-700"
                      />
                    )}
                  </div>
                ))}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-amber-900 hover:bg-amber-800 text-[#FAF6F0] px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                  >
                    {editingId !== null ? 'Salveaza' : 'Adauga'}
                  </button>
                  {editingId !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setFormData({});
                      }}
                      className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      Anuleaza
                    </button>
                  )}
                </div>
              </form>
            </div>
          </section>
        ) : (
          <div className="bg-[#EDE4D3] border border-stone-300 rounded-xl px-5 py-3.5 text-sm text-stone-700">
            Esti conectat cu rolul de <strong>cititor</strong>. Poti rasfoi catalogul de carti, inventarul fizic si editiile virtuale in mod doar-citire.
          </div>
        )}

        {/* Bara de cautare si comutator Fise / Tabel */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            placeholder={`Cauta in ${currentTable.label}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 border border-stone-300 rounded-lg px-4 py-2 text-sm bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-amber-700"
          />

          <div className="inline-flex rounded-lg border border-stone-300 bg-[#EDE4D3] p-1 self-start">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-[#2C1E16] text-[#FAF6F0] shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Fise Biblioteca
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-[#2C1E16] text-[#FAF6F0] shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Tabel Clasic
            </button>
          </div>
        </div>

        {/* Afisare date: Fise sau Tabel */}
        {loading ? (
          <div className="bg-[#FFFDF9] border border-stone-300 rounded-xl p-10 text-center text-stone-500 font-serif">
            Se rasfoieste registrul...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-[#FFFDF9] border border-stone-300 rounded-xl p-10 text-center text-stone-500 font-serif">
            Nu exista inregistrari in {currentTable.label}.
          </div>
        ) : viewMode === 'cards' ? (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRows.map((row, idx) => (
              <article
                key={row[currentTable.pk] ?? `${currentTable.key}-${idx}`}
                className="bg-[#FFFDF9] border border-stone-300 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Cotorul fisei */}
                <div className="bg-[#EDE4D3] px-4 py-2.5 border-b border-stone-300 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-stone-600">
                    #{row[currentTable.pk]}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-900">
                    {currentTable.label}
                  </span>
                </div>

                {/* Continutul fisei */}
                <div className="p-4 space-y-2.5 flex-1">
                  <h3 className="font-serif text-lg font-bold text-stone-900 border-b border-dashed border-stone-300 pb-2">
                    {String(row[currentTable.titleField] ?? `Inregistrare #${row[currentTable.pk]}`)}
                  </h3>

                  <dl className="space-y-1.5 text-sm">
                    {displayColumns
                      .filter((col) => col !== currentTable.pk && col !== currentTable.titleField)
                      .map((col) => {
                        const val = row[col];
                        const badge = getBadgeStyle(val);
                        return (
                          <div key={col} className="flex items-center justify-between gap-2">
                            <dt className="text-xs uppercase tracking-wide text-stone-500">
                              {col.replace(/_/g, ' ')}
                            </dt>
                            <dd className="font-medium text-stone-800 text-right">
                              {badge ? (
                                <span className={`px-2 py-0.5 rounded-full text-xs border ${badge}`}>
                                  {String(val)}
                                </span>
                              ) : (
                                String(val ?? '-')
                              )}
                            </dd>
                          </div>
                        );
                      })}
                  </dl>
                </div>

                {/* Actiuni - doar pentru bibliotecar si admin */}
                {canEdit && (
                  <div className="px-4 py-3 bg-[#FAF6F0] border-t border-stone-200 flex justify-end gap-3 text-xs font-semibold">
                    <button
                      onClick={() => handleEdit(row)}
                      className="text-amber-900 hover:text-amber-700 hover:underline"
                    >
                      Editeaza
                    </button>
                    <button
                      onClick={() => handleDelete(row[currentTable.pk])}
                      className="text-rose-700 hover:text-rose-900 hover:underline"
                    >
                      Sterge
                    </button>
                  </div>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="bg-[#FFFDF9] rounded-xl shadow-sm border border-stone-300 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#EDE4D3] border-b border-stone-300">
                  {displayColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-serif font-bold text-stone-700 uppercase text-xs"
                    >
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                  {canEdit && (
                    <th className="px-4 py-3 font-serif font-bold text-stone-700 uppercase text-xs text-right">
                      Actiuni
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr
                    key={row[currentTable.pk] ?? `${currentTable.key}-${idx}`}
                    className="border-b border-stone-200 hover:bg-[#FAF6F0]"
                  >
                    {displayColumns.map((col) => {
                      const val = row[col];
                      const badge = getBadgeStyle(val);
                      return (
                        <td key={col} className="px-4 py-3 text-stone-800">
                          {badge ? (
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${badge}`}>
                              {String(val)}
                            </span>
                          ) : (
                            String(val ?? '-')
                          )}
                        </td>
                      );
                    })}
                    {canEdit && (
                      <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap text-xs font-semibold">
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-amber-900 hover:underline"
                        >
                          Editeaza
                        </button>
                        <button
                          onClick={() => handleDelete(row[currentTable.pk])}
                          className="text-rose-700 hover:underline"
                        >
                          Sterge
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </main>
  );
}