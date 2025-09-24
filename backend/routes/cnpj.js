import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.post('/validar-cnpj', async (req, res) => {
    const { cnpj } = req.body;

    const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .eq('cnpj', cnpj)
        .single();

    if (error || !data) {
        return res.json({ valido: false });
    }

    res.json({ valido: true, empresaId: data.id });
});

export default router;
