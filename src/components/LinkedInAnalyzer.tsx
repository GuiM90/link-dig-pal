import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, Briefcase, GraduationCap, Award,
  MessageSquare, Link2, Image, FileText, TrendingUp, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfileScoreRing from "./ProfileScoreRing";
import AnalysisCard from "./AnalysisCard";
import SuggestionItem from "./SuggestionItem";

interface AnalysisResult {
  overallScore: number;
  categories: {
    icon: any;
    title: string;
    value: string;
    description: string;
    status: "good" | "warning" | "bad";
  }[];
  suggestions: { text: string; priority: "high" | "medium" | "low" }[];
  scores: { label: string; score: number }[];
}

const mockAnalysis: AnalysisResult = {
  overallScore: 58,
  categories: [
    { icon: User, title: "Foto de Perfil", value: "Presente", description: "Perfis com foto recebem 21x mais visualizações e 9x mais pedidos de conexão.", status: "good" },
    { icon: FileText, title: "Resumo / Sobre", value: "Curto", description: "Seu resumo tem menos de 200 caracteres. O ideal são 3-5 parágrafos com palavras-chave.", status: "warning" },
    { icon: Briefcase, title: "Experiência", value: "3 cargos", description: "Bom número de experiências listadas. Adicione descrições com métricas e conquistas.", status: "good" },
    { icon: GraduationCap, title: "Formação", value: "Presente", description: "Informações acadêmicas preenchidas. Considere adicionar cursos e certificações.", status: "good" },
    { icon: Award, title: "Competências", value: "5 skills", description: "Adicione pelo menos 10 competências relevantes para melhorar sua visibilidade.", status: "warning" },
    { icon: MessageSquare, title: "Recomendações", value: "Nenhuma", description: "Recomendações são essenciais. Peça a colegas e gestores para endossar seu perfil.", status: "bad" },
    { icon: Link2, title: "URL Personalizada", value: "Não", description: "URLs personalizadas são mais profissionais e fáceis de compartilhar.", status: "bad" },
    { icon: Image, title: "Banner", value: "Padrão", description: "Um banner personalizado transmite profissionalismo e fortalece sua marca pessoal.", status: "warning" },
  ],
  suggestions: [
    { text: "Solicite pelo menos 3 recomendações de colegas ou supervisores.", priority: "high" },
    { text: "Personalize sua URL do LinkedIn (ex: linkedin.com/in/seunome).", priority: "high" },
    { text: "Expanda seu resumo com conquistas, métricas e palavras-chave do setor.", priority: "medium" },
    { text: "Crie um banner profissional com sua área de atuação.", priority: "medium" },
    { text: "Adicione mais 5+ competências relevantes à sua área.", priority: "medium" },
    { text: "Inclua descrições detalhadas com resultados em cada experiência.", priority: "medium" },
    { text: "Sua foto de perfil está bem configurada — continue assim!", priority: "low" },
    { text: "Experiências profissionais presentes — bom trabalho!", priority: "low" },
  ],
  scores: [
    { label: "Completude", score: 45 },
    { label: "Impacto", score: 62 },
    { label: "Visibilidade", score: 81 },
  ],
};

const LinkedInAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    // Simulate analysis
    await new Promise((r) => setTimeout(r, 2200));
    setResult(mockAnalysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-foreground">Profile Analyzer</h1>
            <p className="text-xs text-muted-foreground">Análise inteligente do seu LinkedIn</p>
          </div>
        </div>
      </header>

      {/* Hero / Search */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Analise seu perfil<br />
            <span className="text-accent">LinkedIn</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cole a URL do seu perfil e receba um relatório completo com score, análise detalhada e sugestões de melhoria.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleAnalyze}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto flex gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://linkedin.com/in/seu-perfil"
              className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button
            type="submit"
            disabled={isAnalyzing || !url.trim()}
            className="h-12 px-6 bg-primary text-primary-foreground hover:bg-navy-light font-medium"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Analisar"
            )}
          </Button>
        </motion.form>
      </section>

      {/* Loading */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto px-6 pb-16 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Analisando perfil...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto px-6 pb-20"
          >
            {/* Score Section */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProfileScoreRing score={result.overallScore} label="Score Geral" />
                <div className="flex gap-6">
                  {result.scores.map((s) => (
                    <ProfileScoreRing key={s.label} score={s.score} label={s.label} />
                  ))}
                </div>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="mb-8">
              <h3 className="font-serif text-2xl text-foreground mb-5">Análise Detalhada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.categories.map((cat, i) => (
                  <AnalysisCard
                    key={cat.title}
                    icon={cat.icon}
                    title={cat.title}
                    value={cat.value}
                    description={cat.description}
                    status={cat.status}
                    index={i}
                  />
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-serif text-2xl text-foreground mb-4">Sugestões de Melhoria</h3>
              <div>
                {result.suggestions.map((s, i) => (
                  <SuggestionItem key={i} text={s.text} priority={s.priority} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LinkedInAnalyzer;
