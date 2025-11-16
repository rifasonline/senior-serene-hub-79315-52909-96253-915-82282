-- Remover policies antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;

-- Criar nova policy mais permissiva para leitura
CREATE POLICY "Users can view their own subscription"
ON subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy para service role poder inserir/atualizar (webhook)
CREATE POLICY "Service role can manage subscriptions"
ON subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Usuários podem inserir sua própria assinatura
CREATE POLICY "Users can insert their own subscription"
ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar sua própria assinatura
CREATE POLICY "Users can update their own subscription"
ON subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());