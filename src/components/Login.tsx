import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // الاتصال الحقيقي بـ Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة!');
      }

      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في تسجيل الدخول، تأكد من البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 rtl" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* رأس الصفحة / الشعار */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-50 text-blue-900 p-3 rounded-xl mb-4 font-bold text-xl">
            ✈️ زاد للسفر والسياحة
          </div>
          <h2 className="text-2xl font-bold text-slate-800">تسجيل الدخول للنظام</h2>
          <p className="text-slate-500 text-sm mt-1">أدخل بيانات الموظف أو المسير للمتابعة</p>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* نموذج الدخول */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
                placeholder="admin@zadtravel.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md"
          >
            <span>{loading ? 'جاري التحقق...' : 'دخول للنظام'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400">
          جميع الحقوق محفوظة © 2026 - وكالة زاد للسفر والسياحة
        </div>
      </div>
    </div>
  );
}