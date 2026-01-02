import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Truck, Lock, Mail, AlertCircle, Eye, EyeOff, Shield, UserCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, senha);
      if (!success) {
        setError('Email ou senha incorretos. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setSenha(userPassword);
    setError('');
    setLoading(true);

    try {
      await login(userEmail, userPassword);
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E3A5F] via-[#2A4A6F] to-[#1E3A5F] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-[#5DADE2] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-[#F5A623] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-4 bg-gradient-to-br from-[#F5A623] to-[#E59400] rounded-2xl shadow-2xl">
              <Truck className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            ITAMOVING
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#5DADE2] text-lg"
          >
            Sistema de Gerenciamento de Mudanças Internacionais
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card de Login */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lock className="w-6 h-6 text-[#1E3A5F]" />
                  Login
                </CardTitle>
                <CardDescription>
                  Entre com suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="senha"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#1E3A5F] to-[#2A4A6F] hover:from-[#2A4A6F] hover:to-[#1E3A5F] text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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

          {/* Card de Acesso Rápido */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#F5A623]" />
                  Acesso Rápido Demo
                </CardTitle>
                <CardDescription>
                  Clique para fazer login com um usuário de demonstração
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => quickLogin('admin@itamoving.com', 'admin123')}
                    className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                    disabled={loading}
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Admin Master</div>
                      <div className="text-xs opacity-90">Acesso total ao sistema</div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">Admin</Badge>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => quickLogin('comercial@itamoving.com', 'comercial123')}
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    disabled={loading}
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Carlos Vendas</div>
                      <div className="text-xs opacity-90">Clientes, Agendamentos, Atendimentos</div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">Comercial</Badge>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => quickLogin('raquel@itamoving.com', 'raquel123')}
                    className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    disabled={loading}
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">Raquel Logística</div>
                      <div className="text-xs opacity-90">Agendamentos, Containers, Rotas</div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">Logístico</Badge>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => quickLogin('motorista@itamoving.com', 'motorista123')}
                    className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    disabled={loading}
                  >
                    <UserCircle className="w-5 h-5 mr-2" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">João Motorista</div>
                      <div className="text-xs opacity-90">Ordens de Serviço, Recibos</div>
                    </div>
                    <Badge className="bg-white/20 text-white border-0">Motorista</Badge>
                  </Button>
                </motion.div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Credenciais de Demonstração:</p>
                      <ul className="text-xs space-y-1 opacity-90">
                        <li>• Admin: admin@itamoving.com / admin123</li>
                        <li>• Comercial: comercial@itamoving.com / comercial123</li>
                        <li>• Logístico: raquel@itamoving.com / raquel123</li>
                        <li>• Motorista: motorista@itamoving.com / motorista123</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-white/60 text-sm"
        >
          <p>© 2025 ITAMOVING - Mudanças Internacionais EUA-Brasil</p>
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