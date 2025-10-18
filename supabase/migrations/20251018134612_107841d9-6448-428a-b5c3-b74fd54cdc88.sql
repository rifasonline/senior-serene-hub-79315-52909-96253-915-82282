-- Remove image suggestions from all articles

UPDATE public.premium_articles 
SET content = REGEXP_REPLACE(content, '🖼️ \*\[Imagem sugerida:[^\]]+\]\*\n?', '', 'g')
WHERE content LIKE '%🖼️%';