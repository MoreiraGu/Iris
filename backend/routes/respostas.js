import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.post('/salvar-resposta', async (req, res) => {
    const { empresaId, pergunta, resposta } = req.body;

    const { data, error } = await supabase
        .from('respostas')
        .insert([{ empresa_id: empresaId, pergunta, resposta }]);

    if (error) return res.status(500).json({ sucesso: false, error });

    res.json({ sucesso: true });
});

export default router;
