import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Lock, Search, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
}
interface PremiumArticlesProps {
  isPro: boolean;
}
export function PremiumArticles({
  isPro
}: PremiumArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadArticles();
  }, []);
  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, categoryFilter]);
  const loadArticles = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('premium_articles').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os artigos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filterArticles = () => {
    let filtered = articles;
    if (searchQuery) {
      filtered = filtered.filter(article => article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }
    setFilteredArticles(filtered);
  };
  const handleReadArticle = (article: Article) => {
    if (!isPro) {
      toast({
        title: 'Recurso Premium',
        description: 'Faça upgrade para o Plano Pro para acessar este artigo',
        variant: 'destructive'
      });
      return;
    }
    setSelectedArticle(article);
  };
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      saude: 'Saúde',
      'bem-estar': 'Bem-Estar',
      dicas: 'Dicas',
      nutricao: 'Nutrição',
      exercicios: 'Exercícios'
    };
    return labels[category] || category;
  };
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      saude: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'bem-estar': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      dicas: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      nutricao: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      exercicios: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Artigos e Conteúdos Premium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">Carregando artigos...</p>
        </CardContent>
      </Card>;
  }
  return <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Artigos e Conteúdos Premium
              </CardTitle>
              <CardDescription className="mt-1">
                {isPro ? 'Explore nosso conteúdo exclusivo' : 'Disponível para assinantes Pro'}
              </CardDescription>
            </div>
            {!isPro && <Badge variant="secondary" className="gap-1">
                <Crown className="h-3 w-3" />
                Somente Pro
              </Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar artigos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="md:w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="bem-estar">Bem-Estar</SelectItem>
                <SelectItem value="dicas">Dicas</SelectItem>
                <SelectItem value="nutricao">Nutrição</SelectItem>
                <SelectItem value="exercicios">Exercícios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Artigos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map(article => <Card key={article.id} className={`relative overflow-hidden transition-all hover:shadow-md ${!isPro ? 'opacity-75' : ''}`}>
                {!isPro && <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={getCategoryColor(article.category)} variant="secondary">
                      {getCategoryLabel(article.category)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{article.summary}</p>
                  <Button onClick={() => handleReadArticle(article)} disabled={!isPro} variant={isPro ? 'default' : 'secondary'} className="w-full text-base rounded-xl">
                    {isPro ? <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ler Mais
                      </> : <>
                        <Lock className="h-4 w-4 mr-2" />
                        Disponível no Plano Pro
                      </>}
                  </Button>
                </CardContent>
              </Card>)}
          </div>

          {filteredArticles.length === 0 && <p className="text-center text-muted-foreground py-8">
              Nenhum artigo encontrado com os filtros selecionados
            </p>}
        </CardContent>
      </Card>

      {/* Dialog de Leitura */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && <>
              <DialogHeader>
                <div className="mb-2">
                  <Badge className={getCategoryColor(selectedArticle.category)} variant="secondary">
                    {getCategoryLabel(selectedArticle.category)}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="text-base">{selectedArticle.summary}</DialogDescription>
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                {selectedArticle.content.split('\n').map((paragraph, index) => <p key={index} className="mb-3 whitespace-pre-line">
                    {paragraph}
                  </p>)}
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </>;
}