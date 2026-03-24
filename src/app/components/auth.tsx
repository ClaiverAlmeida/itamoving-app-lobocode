import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
const logo = new URL('../assets/itamoving-logo.png', import.meta.url).href;

interface AuthProps {
  onLogin: () => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular autenticação
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EBF5FB] via-white to-[#FFF4E6] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 border border-blue-100">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <img 
              src={logo} 
              alt="ITAMOVING" 
              className="w-28 h-28 sm:w-40 sm:h-40 object-contain mb-3 sm:mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">
              Bem-vindo ao ITAMOVING
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 text-center">
              Sistema de Gestão de Mudanças Internacionais
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:border-accent focus:ring-accent"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:border-accent focus:ring-accent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Esqueci a senha */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">ou</span>
            </div>
          </div>

          {/* Demo Login */}
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-3">
              Acesso de demonstração
            </p>
            <Button
              type="button"
              onClick={onLogin}
              variant="outline"
              className="w-full h-11 border-blue-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              Entrar como Admin Demo
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            © 2024 ITAMOVING. Todos os direitos reservados.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Mudanças Internacionais USA → Brasil
          </p>
        </div>
      </div>
    </div>
  );
}
