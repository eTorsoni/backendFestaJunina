require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que seu frontend (HTML) faça requisições para esta API

// Inicializa o cliente do Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ==========================================
// ROTAS CRUD - FESTAS
// ==========================================

// 1. CREATE - Criar uma nova festa
app.post('/festas', async (req, res) => {
  const { titulo, data_festa, local, categoria } = req.body;

  const { data, error } = await supabase
    .from('festas')
    .insert([{ titulo, data_festa, local, categoria }])
    .select();

  if (error) return res.status(400).json({ erro: error.message });
  return res.status(201).json(data[0]);
});

// 2. READ ALL - Listar todas as festas
app.get('/festas', async (req, res) => {
  // Permite buscar por categoria usando query params (ex: /festas?categoria=Junina)
  const { categoria } = req.query;
  
  let query = supabase.from('festas').select('*').order('created_at', { ascending: false });
  
  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json({ erro: error.message });
  return res.status(200).json(data);
});

// 3. READ ONE - Buscar uma festa específica pelo ID
app.get('/festas/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('festas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Festa não encontrada' });
  return res.status(200).json(data);
});

// 4. UPDATE - Atualizar dados de uma festa
app.put('/festas/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, data_festa, local, categoria } = req.body;

  const { data, error } = await supabase
    .from('festas')
    .update({ titulo, data_festa, local, categoria })
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ erro: error.message });
  return res.status(200).json(data[0]);
});

// 5. DELETE - Excluir uma festa
app.delete('/festas/:id', async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('festas')
    .delete()
    .eq('id', id)
    .select();

  if (error) return res.status(400).json({ erro: error.message });
  if (data.length === 0) return res.status(404).json({ erro: 'Festa não encontrada' });
  
  return res.status(200).json({ mensagem: 'Festa excluída com sucesso', festa: data[0] });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Servidor do Arraial Connect rodando na porta ${PORT}`);
});

module.exports = app;