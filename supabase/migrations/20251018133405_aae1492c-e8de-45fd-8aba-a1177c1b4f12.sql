-- Create enum for article categories
CREATE TYPE article_category AS ENUM ('saude', 'bem-estar', 'dicas', 'nutricao', 'exercicios');

-- Create premium_articles table
CREATE TABLE public.premium_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category article_category NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.premium_articles ENABLE ROW LEVEL SECURITY;

-- Anyone can view articles list (we'll control access to content in the app)
CREATE POLICY "Anyone can view premium articles"
ON public.premium_articles
FOR SELECT
TO authenticated
USING (true);

-- Only admins can manage articles
CREATE POLICY "Only admins can insert articles"
ON public.premium_articles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update articles"
ON public.premium_articles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete articles"
ON public.premium_articles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_premium_articles_updated_at
BEFORE UPDATE ON public.premium_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample articles
INSERT INTO public.premium_articles (title, summary, content, category) VALUES
(
  'Cuidados Essenciais com a Saúde do Idoso',
  'Descubra as melhores práticas para manter a saúde e bem-estar na terceira idade.',
  'Neste artigo completo, você aprenderá sobre os principais cuidados de saúde para idosos, incluindo:\n\n• Importância dos check-ups regulares\n• Gerenciamento de medicações\n• Prevenção de quedas\n• Nutrição adequada\n• Exercícios físicos recomendados\n• Saúde mental e social\n\nManter a saúde na terceira idade requer atenção especial a diversos aspectos. É fundamental realizar consultas médicas periódicas, seguir corretamente as prescrições médicas e manter um estilo de vida ativo e saudável.',
  'saude'
),
(
  'Exercícios Seguros para a Terceira Idade',
  'Conheça atividades físicas adequadas que promovem saúde e qualidade de vida.',
  'A prática regular de exercícios físicos é fundamental para a saúde dos idosos. Neste guia completo, apresentamos:\n\n• Exercícios de baixo impacto\n• Alongamentos essenciais\n• Fortalecimento muscular\n• Exercícios de equilíbrio\n• Caminhadas orientadas\n• Hidroginástica\n\nAntes de iniciar qualquer programa de exercícios, é importante consultar um médico e contar com orientação profissional adequada.',
  'exercicios'
),
(
  'Nutrição Balanceada na Terceira Idade',
  'Alimentação adequada é fundamental para a saúde e vitalidade dos idosos.',
  'Uma dieta equilibrada é essencial para manter a saúde na terceira idade. Aprenda sobre:\n\n• Necessidades nutricionais específicas\n• Alimentos ricos em nutrientes\n• Hidratação adequada\n• Suplementação quando necessária\n• Controle de sal e açúcar\n• Preparação de refeições saudáveis\n\nUma alimentação balanceada ajuda a prevenir doenças, manter o peso adequado e proporcionar energia para as atividades diárias.',
  'nutricao'
),
(
  'Bem-Estar Emocional e Mental',
  'Saúde mental é tão importante quanto saúde física na terceira idade.',
  'O bem-estar emocional e mental dos idosos merece atenção especial. Neste artigo exploramos:\n\n• Importância da socialização\n• Atividades cognitivas\n• Gerenciamento do estresse\n• Prevenção da depressão\n• Manutenção da autoestima\n• Qualidade do sono\n\nManter a mente ativa e cultivar relacionamentos sociais são fundamentais para uma vida plena e feliz na terceira idade.',
  'bem-estar'
),
(
  'Dicas para Cuidadores: Como Oferecer o Melhor Cuidado',
  'Orientações práticas para quem cuida de pessoas na terceira idade.',
  'Ser cuidador é uma tarefa que exige dedicação e preparo. Aprenda:\n\n• Comunicação efetiva\n• Organização da rotina\n• Cuidados com higiene\n• Administração de medicamentos\n• Gerenciamento do estresse do cuidador\n• Quando buscar ajuda profissional\n\nCuidar de alguém também significa cuidar de si mesmo. É fundamental que o cuidador mantenha sua própria saúde física e mental.',
  'dicas'
);