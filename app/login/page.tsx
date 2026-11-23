'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [nume, setNume] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Adaugam utilizatorul si in tabela noastra "utilizatori" cu rol implicit "cititor"
      const { error: dbError } = await supabase.from('utilizatori').insert([
        {
          nume: nume || email.split('@')[0],
          email,
          rol: 'cititor',
        },
      ]);

      if (dbError) {
        setError(`Cont creat, dar eroare la profil: ${dbError.message}`);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Email sau parola incorecta.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F1E7] flex items-center justify-center p-6 text-stone-900">
      <div className="w-full max-w-md bg-[#FFFDF9] border border-stone-300 rounded-xl shadow-md overflow-hidden">
        {/* Antet */}
        <div className="bg-[#2C1E16] text-[#F6F1E7] px-6 py-6 border-b-4 border-amber-700 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-1">
            Biblioteca Hibrida
          </p>
          <h1 className="text-3xl font-serif font-bold">Ink &amp; Click</h1>
          <p className="text-xs text-stone-300 mt-1">
            {isRegister ? 'Creeaza un cont nou de cititor' : 'Autentifica-te pentru a intra in registru'}
          </p>
        </div>

        {/* Formular */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border-l-4 border-rose-700 text-rose-900 px-3 py-2 text-sm rounded-r">
              {error}
            </div>
          )}

          {isRegister && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-600 uppercase">Nume complet</label>
              <input
                type="text"
                required
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                placeholder="ex: Ion Popescu"
                className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-600 uppercase">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nume@exemplu.ro"
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-600 uppercase">Parola</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minim 6 caractere"
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-amber-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-900 hover:bg-amber-800 text-[#FAF6F0] py-2.5 rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            {loading
              ? 'Se proceseaza...'
              : isRegister
              ? 'Creeaza cont'
              : 'Intra in cont'}
          </button>

          <div className="text-center pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-amber-900 hover:underline font-medium"
            >
              {isRegister
                ? 'Ai deja un cont? Autentifica-te'
                : 'Nu ai cont? Inregistreaza-te aici'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}