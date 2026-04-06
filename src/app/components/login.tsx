import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Truck, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, senha, rememberMe);
      if (!success) {
        setError('Email ou senha incorretos. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async (email: string | null, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    alert(email);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A5F] via-[#2A4A6F] to-[#1E3A5F] p-3 sm:p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 lg:left-20 w-48 h-48 lg:w-72 lg:h-72 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 lg:right-20 w-48 h-48 lg:w-72 lg:h-72 bg-[#5DADE2] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-48 h-48 lg:w-72 lg:h-72 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-5 sm:mb-6 lg:mb-8 px-2 sm:px-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-3 lg:p-4 bg-gradient-to-br from-[#F5A623] to-[#E59400] rounded-2xl shadow-2xl">
              <Truck className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
          >
            ITAMOVING
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#5DADE2] text-sm sm:text-base lg:text-lg"
          >
            Sistema de Gerenciamento de Mudanças Internacionais
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 lg:gap-6 w-full justify-center items-center">
          {/* Card de Login */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-2xl border-0 w-full max-w-md mx-auto">
              <CardHeader className="space-y-1 px-4 sm:px-5 lg:px-6 pb-0">
                <CardTitle className="text-xl lg:text-2xl flex items-center gap-2">
                  <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-[#1E3A5F]" />
                  Login
                </CardTitle>
                <CardDescription className="text-sm">
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-5 lg:px-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 lg:w-5 lg:h-5 text-muted-foreground" />
                      <Input
                        id="senha"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="pl-10 pr-10 h-11"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" />
                        ) : (
                          <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                        )}
                      </button>
                      <a href="/forget-password" onClick={(e) => handleForgetPassword(email, e)} className="text-sm text-muted-foreground hover:text-foreground w-full text-decoration-none hover:no-underline">
                        <Button variant="link" className=" text-sm text-muted-foreground hover:text-foreground p-0 text-left text-[#1E3A5F] text-decoration-none hover:no-underline">
                          Esqueceu a senha?
                        </Button>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Checkbox
                      id="remember"
                      className="cursor-pointer"
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(v === true)}
                      disabled={loading}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal leading-snug cursor-pointer">
                      Manter conectado neste dispositivo
                    </Label>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0 mt-0.5" />
                      <span className="text-xs lg:text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] hover:from-[#2A4A6F] hover:to-[#1E3A5F] text-white h-11"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 lg:mt-8 text-white/60 text-xs lg:text-sm px-4"
        >
          <p>© {currentYear} ITAMOVING - Mudanças Internacionais EUA-Brasil</p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}