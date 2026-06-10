import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, Briefcase, GraduationCap, Award,
  MessageSquare, Link2, Image, FileText, TrendingUp, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface ProfileData {
  url: string;
  headline: string;
  about: string;
  experiences: string; // textarea, one per line
  education: string;
  skills: string; // comma separated
  recommendations: string; // number as string
  hasPhoto: boolean;
  hasBanner: boolean;
  customUrl: boolean;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));

const statusFromScore = (s: number): "good" | "warning" | "bad" =>
  s >= 75 ? "good" : s >= 45 ? "warning" : "bad";

function analyzeProfile(data: ProfileData): AnalysisResult {
  const headline = data.headline.trim();
  const about = data.about.trim();
  const experiencesList = data.experiences.split("\n").map((l) => l.trim()).filter(Boolean);
  const educationList = data.education.split("\n").map((l) => l.trim()).filter(Boolean);
  const skillsList = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const recs = parseInt(data.recommendations || "0", 10) || 0;
  const customUrl = data.customUrl || /linkedin\.com\/in\/[a-z0-9-]{4,}\/?$/i.test(data.url);

  // ---- Per-category scores (0-100) ----
  const photoScore = data.hasPhoto ? 100 : 10;

  const headlineLen = headline.length;
  const headlineScore = clamp(
    headlineLen === 0 ? 0 :
    headlineLen < 30 ? 35 :
    headlineLen < 60 ? 65 :
    headlineLen <= 220 ? 92 : 70
  );

  const aboutLen = about.length;
  const aboutScore = clamp(
    aboutLen === 0 ? 0 :
    aboutLen < 200 ? 30 + aboutLen / 10 :
    aboutLen < 600 ? 55 + (aboutLen - 200) / 16 :
    aboutLen <= 2000 ? 88 : 75
  );

  // Experience: count + average description length
  const expCount = experiencesList.length;
  const avgExpLen = expCount ? experiencesList.reduce((a, b) => a + b.length, 0) / expCount : 0;
  const expScore = clamp(
    Math.min(expCount, 5) * 12 + Math.min(avgExpLen, 200) / 5
  );

  const eduScore = clamp(educationList.length === 0 ? 0 : 55 + Math.min(educationList.length, 3) * 15);

  const skillsCount = skillsList.length;
  const skillsScore = clamp(
    skillsCount === 0 ? 0 :
    skillsCount < 5 ? skillsCount * 10 :
    skillsCount < 10 ? 50 + (skillsCount - 5) * 6 :
    skillsCount < 25 ? 80 + (skillsCount - 10) * 1.2 :
    98
  );

  const recScore = clamp(
    recs === 0 ? 0 :
    recs < 3 ? 35 + recs * 10 :
    recs < 8 ? 65 + (recs - 3) * 5 :
    95
  );

  const urlScore = customUrl ? 100 : 20;
  const bannerScore = data.hasBanner ? 95 : 30;

  // ---- Aggregate scores ----
  const completude = clamp(
    photoScore * 0.1 + headlineScore * 0.15 + aboutScore * 0.2 +
    expScore * 0.2 + eduScore * 0.1 + skillsScore * 0.1 +
    urlScore * 0.075 + bannerScore * 0.075
  );

  const impacto = clamp(
    aboutScore * 0.25 + expScore * 0.35 + headlineScore * 0.2 +
    recScore * 0.15 + skillsScore * 0.05
  );

  const visibilidade = clamp(
    headlineScore * 0.25 + skillsScore * 0.3 + urlScore * 0.15 +
    photoScore * 0.15 + bannerScore * 0.1 + recScore * 0.05
  );

  const overall = clamp(completude * 0.4 + impacto * 0.35 + visibilidade * 0.25);

  // ---- Categories ----
  const categories: AnalysisResult["categories"] = [
    {
      icon: User, title: "Foto de Perfil",
      value: data.hasPhoto ? "Presente" : "Ausente",
      description: data.hasPhoto
        ? "Perfis com foto recebem 21x mais visualizações."
        : "Adicione uma foto profissional — é o item mais básico e impactante.",
      status: statusFromScore(photoScore),
    },
    {
      icon: FileText, title: "Headline",
      value: headlineLen ? `${headlineLen} caracteres` : "Vazio",
      description: headlineLen < 60
        ? "Headline curto. Use até 220 caracteres com palavras-chave e proposta de valor."
        : "Headline bem dimensionado com boa densidade de palavras-chave.",
      status: statusFromScore(headlineScore),
    },
    {
      icon: FileText, title: "Resumo / Sobre",
      value: aboutLen ? `${aboutLen} caracteres` : "Vazio",
      description: aboutLen < 600
        ? "Expanda seu resumo: conte sua trajetória, conquistas e diferenciais (600-2000 caracteres)."
        : "Resumo robusto e bem estruturado.",
      status: statusFromScore(aboutScore),
    },
    {
      icon: Briefcase, title: "Experiência",
      value: expCount ? `${expCount} cargo${expCount > 1 ? "s" : ""}` : "Nenhum",
      description: expCount < 2
        ? "Adicione mais experiências com descrições e métricas."
        : avgExpLen < 80
        ? "Boa quantidade de cargos, mas as descrições são curtas. Inclua resultados e métricas."
        : "Experiências bem detalhadas com descrições consistentes.",
      status: statusFromScore(expScore),
    },
    {
      icon: GraduationCap, title: "Formação",
      value: educationList.length ? `${educationList.length} item(s)` : "Nenhuma",
      description: educationList.length
        ? "Formação preenchida. Considere adicionar cursos e certificações."
        : "Adicione sua formação acadêmica e cursos relevantes.",
      status: statusFromScore(eduScore),
    },
    {
      icon: Award, title: "Competências",
      value: `${skillsCount} skill${skillsCount === 1 ? "" : "s"}`,
      description: skillsCount < 10
        ? "Adicione pelo menos 10 competências relevantes para aparecer em mais buscas."
        : skillsCount < 25
        ? "Bom volume de skills. Reorganize as 3 principais no topo."
        : "Excelente catálogo de competências.",
      status: statusFromScore(skillsScore),
    },
    {
      icon: MessageSquare, title: "Recomendações",
      value: recs ? `${recs}` : "Nenhuma",
      description: recs < 3
        ? "Peça recomendações a colegas e gestores — fortalece a prova social."
        : "Boa quantidade de recomendações, transmite credibilidade.",
      status: statusFromScore(recScore),
    },
    {
      icon: Link2, title: "URL Personalizada",
      value: customUrl ? "Sim" : "Não",
      description: customUrl
        ? "URL limpa e fácil de compartilhar."
        : "Personalize sua URL (ex: linkedin.com/in/seunome).",
      status: statusFromScore(urlScore),
    },
    {
      icon: Image, title: "Banner",
      value: data.hasBanner ? "Personalizado" : "Padrão",
      description: data.hasBanner
        ? "Banner personalizado reforça sua marca pessoal."
        : "Crie um banner com sua proposta de valor ou área de atuação.",
      status: statusFromScore(bannerScore),
    },
  ];

  // ---- Suggestions (priorizadas por score) ----
  const candidates: { score: number; text: string }[] = [
    { score: photoScore, text: "Adicione uma foto de perfil profissional, com boa iluminação e enquadramento." },
    { score: headlineScore, text: "Reescreva o headline com cargo + área + proposta de valor (até 220 caracteres)." },
    { score: aboutScore, text: "Expanda o resumo com trajetória, conquistas com métricas e palavras-chave do setor." },
    { score: expScore, text: "Detalhe cada experiência com responsabilidades, resultados e números." },
    { score: eduScore, text: "Inclua formação acadêmica, cursos e certificações relevantes." },
    { score: skillsScore, text: "Cadastre 15-25 competências e organize as 3 principais no topo." },
    { score: recScore, text: "Solicite pelo menos 3 recomendações a colegas, gestores ou clientes." },
    { score: urlScore, text: "Personalize a URL do seu LinkedIn para algo limpo e memorável." },
    { score: bannerScore, text: "Crie um banner personalizado alinhado à sua marca pessoal." },
  ];

  const suggestions: AnalysisResult["suggestions"] = candidates
    .sort((a, b) => a.score - b.score)
    .map((c) => ({
      text: c.text,
      priority: (c.score < 45 ? "high" : c.score < 75 ? "medium" : "low") as "high" | "medium" | "low",
    }));

  return {
    overallScore: overall,
    categories,
    suggestions,
    scores: [
      { label: "Completude", score: completude },
      { label: "Impacto", score: impacto },
      { label: "Visibilidade", score: visibilidade },
    ],
  };
}

const initialData: ProfileData = {
  url: "",
  headline: "",
  about: "",
  experiences: "",
  education: "",
  skills: "",
  recommendations: "0",
  hasPhoto: false,
  hasBanner: false,
  customUrl: false,
};

const LinkedInAnalyzer = () => {
  const [data, setData] = useState<ProfileData>(initialData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const update = <K extends keyof ProfileData>(k: K, v: ProfileData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.url.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(analyzeProfile(data));
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
            Preencha os dados do seu perfil e receba um score real, calculado a partir de cada item.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleAnalyze}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          <div>
            <Label className="text-foreground mb-1.5 block">URL do perfil</Label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={data.url}
                onChange={(e) => update("url", e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                className="pl-10 h-11 bg-background border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground mb-1.5 block">Headline</Label>
              <Input
                value={data.headline}
                onChange={(e) => update("headline", e.target.value)}
                placeholder="Ex: Product Designer | UX | SaaS B2B"
                className="bg-background border-border"
              />
            </div>
            <div>
              <Label className="text-foreground mb-1.5 block">Nº de recomendações</Label>
              <Input
                type="number"
                min={0}
                value={data.recommendations}
                onChange={(e) => update("recommendations", e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </div>

          <div>
            <Label className="text-foreground mb-1.5 block">Resumo / Sobre</Label>
            <Textarea
              value={data.about}
              onChange={(e) => update("about", e.target.value)}
              placeholder="Cole aqui o texto da sua seção 'Sobre'"
              className="bg-background border-border min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-foreground mb-1.5 block">Experiências (uma por linha)</Label>
              <Textarea
                value={data.experiences}
                onChange={(e) => update("experiences", e.target.value)}
                placeholder={"Designer Sr. — Empresa X (descrição com métricas)\nDesigner Pl. — Empresa Y ..."}
                className="bg-background border-border min-h-[100px]"
              />
            </div>
            <div>
              <Label className="text-foreground mb-1.5 block">Formação (uma por linha)</Label>
              <Textarea
                value={data.education}
                onChange={(e) => update("education", e.target.value)}
                placeholder={"Bacharelado em Design — USP\nCurso de UX — Coursera"}
                className="bg-background border-border min-h-[100px]"
              />
            </div>
          </div>

          <div>
            <Label className="text-foreground mb-1.5 block">Competências (separadas por vírgula)</Label>
            <Input
              value={data.skills}
              onChange={(e) => update("skills", e.target.value)}
              placeholder="Figma, UX Research, Design System, Prototipagem..."
              className="bg-background border-border"
            />
          </div>

          <div className="flex flex-wrap gap-5 pt-1">
            {[
              { key: "hasPhoto" as const, label: "Tem foto de perfil" },
              { key: "hasBanner" as const, label: "Tem banner personalizado" },
              { key: "customUrl" as const, label: "URL personalizada" },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={data[opt.key]}
                  onChange={(e) => update(opt.key, e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                {opt.label}
              </label>
            ))}
          </div>

          <Button
            type="submit"
            disabled={isAnalyzing || !data.url.trim()}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-navy-light font-medium"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar perfil"}
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
              <span className="text-sm text-muted-foreground">Calculando seu score...</span>
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
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ProfileScoreRing score={result.overallScore} label="Score Geral" />
                <div className="flex gap-6 flex-wrap justify-center">
                  {result.scores.map((s) => (
                    <ProfileScoreRing key={s.label} score={s.score} label={s.label} />
                  ))}
                </div>
              </div>
            </div>

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
