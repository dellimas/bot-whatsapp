
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

const CONHECIMENTO = {
    produto: {
        nome: "50 Exercícios de Inteligência Emocional",
        preco_promocional: 27.70,
        preco_normal: 97.70,
        link_vendas: "https://leadership-hidden.lumi.ing",
        link_checkout: "https://pay.cakto.com.br/ww9ugua_567793"
    }
};

// Gerenciar contexto das conversas
const conversas = new Map();

class AgenteVendas {
    
    getContexto(numero) {
        if (!conversas.has(numero)) {
            conversas.set(numero, {
                ja_saudou: false,
                ja_mostrou_preco: false,
                mensagens: 0
            });
        }
        return conversas.get(numero);
    }
    
    atualizarContexto(numero, dados) {
        const ctx = this.getContexto(numero);
        conversas.set(numero, { ...ctx, ...dados, mensagens: ctx.mensagens + 1 });
    }
    
    detectarIntencao(mensagem) {
        const msg = mensagem.toLowerCase();
        
        if (/\b(oi|olá|ola|bom dia|boa tarde|boa noite|opa|e ai|eai)\b/.test(msg)) {
            return 'saudacao';
        }
        if (/\b(preço|preco|valor|quanto|custa|investimento)\b/.test(msg)) {
            return 'preco';
        }
        if (/\b(o que|sobre|conteúdo|conteudo|como funciona|explica|mostra)\b/.test(msg)) {
            return 'sobre';
        }
        if (/\b(garantia|devolução|devolver|reembolso|risco|seguro)\b/.test(msg)) {
            return 'garantia';
        }
        if (/\b(link|site|página|pagina|ver mais|informações|informacoes|manda|envia)\b/.test(msg)) {
            return 'link_info';
        }
        if (/\b(quero|comprar|fechar|pagar|adquirir|checkout|vou levar|aceito)\b/.test(msg)) {
            return 'compra';
        }
        if (/\b(obrigado|obrigada|valeu|thanks|vlw)\b/.test(msg)) {
            return 'agradecimento';
        }
        
        return 'geral';
    }
    
    gerarResposta(numero, mensagem) {
        const intencao = this.detectarIntencao(mensagem);
        const ctx = this.getContexto(numero);
        
        switch (intencao) {
            case 'saudacao':
                if (ctx.ja_saudou) {
                    return "Oi de novo! 😊\n\nEm que posso ajudar?";
                }
                this.atualizarContexto(numero, { ja_saudou: true });
                return this.respostaSaudacao();
                
            case 'preco':
                this.atualizarContexto(numero, { ja_mostrou_preco: true });
                return this.respostaPreco();
                
            case 'sobre':
                return this.respostaSobre();
                
            case 'garantia':
                return this.respostaGarantia();
                
            case 'link_info':
                return this.respostaLinkInfo();
                
            case 'compra':
                return this.respostaCompra();
                
            case 'agradecimento':
                return this.respostaAgradecimento();
                
            default:
                return this.respostaGeral(ctx);
        }
    }
    
    respostaSaudacao() {
        const hora = new Date().getHours();
        const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
        
        return `${saudacao}! 👋

Seja bem-vindo(a)! Sou o assistente do *50 Exercícios de Inteligência Emocional*.

🔥 Hoje está com promoção especial: *R$ 27,70* (de R$ 97,70)

Como posso te ajudar? 😊`;
    }
    
    respostaPreco() {
        return `💰 *PREÇO PROMOCIONAL HOJE:*

De R$ 97,70 por apenas *R$ 27,70*
📊 Você economiza R$ 70,00!

✨ Inclui:
• 50 dinâmicas práticas prontas
• 3 bônus exclusivos
• APP Mobile (liberado em 7 dias)
• Acesso vitalício

⚠️ Promoção válida só hoje!

Quer ver a página do produto ou já quer comprar? 😊`;
    }
    
    respostaSobre() {
        return `📚 *50 EXERCÍCIOS DE INTELIGÊNCIA EMOCIONAL*

São 50 dinâmicas práticas divididas em 5 fases:

✅ Autoconsciência Emocional
✅ Regulação Emocional  
✅ Automotivação
✅ Empatia e Relacionamentos
✅ Habilidades Sociais

🎯 Cada exercício tem:
• Passo a passo claro
• Exemplo prático
• Dica para profissionais
• Tempo de execução

💼 Perfeito para coaches, terapeutas, psicólogos e RH.

Quer saber o preço ou ver mais detalhes?`;
    }
    
    respostaGarantia() {
        return `✅ *GARANTIA TOTAL DE 7 DIAS*

Você pode testar TODO o material por 7 dias.

Se não gostar, é só me chamar aqui que devolvemos 100% do seu dinheiro.

Sem perguntas, sem burocracia. 

Você não corre nenhum risco! 🔒

Ficou mais tranquilo(a)? Quer comprar?`;
    }
    
    respostaLinkInfo() {
        return `📄 *PÁGINA COM TODAS AS INFORMAÇÕES:*

${CONHECIMENTO.produto.link_vendas}

Lá você vê:
• Descrição completa de cada módulo
• Depoimentos de quem já usou
• Todas as perguntas frequentes

💰 Preço promocional: *R$ 27,70*

Qualquer dúvida, é só perguntar aqui! 😊`;
    }
    
    respostaCompra() {
        return `🎉 *ÓTIMA ESCOLHA!*

Aqui está o link de pagamento seguro:

🔗 ${CONHECIMENTO.produto.link_checkout}

💳 Você pode pagar com:
• PIX (aprovação imediata)
• Cartão (parcelamento disponível)
• Boleto (1-2 dias)

📥 Assim que o pagamento for aprovado, você recebe o material no email!

✅ 50 Exercícios completos
✅ 3 Bônus
✅ APP Mobile em 7 dias
✅ Garantia de 7 dias

Clique no link acima para finalizar! 🚀`;
    }
    
    respostaAgradecimento() {
        return `Por nada! 😊

Estou aqui se precisar de mais alguma coisa!

Qualquer dúvida é só chamar! 👋`;
    }
    
    respostaGeral(ctx) {
        if (ctx.mensagens === 0) {
            return this.respostaSaudacao();
        }
        
        return `Entendi! 

Posso te ajudar com:

💰 Ver o *preço* promocional
📚 Saber *sobre* o conteúdo
🔗 Ver o *link* do produto
🛒 *Comprar* agora

É só me dizer! 😊`;
    }
}

const agent = new AgenteVendas();

async function conectarWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n📱 ESCANEIE O QR CODE ABAIXO:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n🔹 Abra o WhatsApp > Aparelhos Conectados > Conectar\n');
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('⚠️ Conexão perdida. Reconectando...');
                conectarWhatsApp();
            } else {
                console.log('❌ Desconectado. Execute novamente: node bot.js');
            }
        } else if (connection === 'open') {
            console.log('\n✅ BOT CONECTADO COM SUCESSO!');
            console.log('🎯 Bot mais conversacional e natural');
            console.log('💰 Promoção: R$ 27,70');
            console.log('🔗 Links configurados!\n');
        }
    });
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        if (!msg.message || msg.key.fromMe) return;
        
        const numero = msg.key.remoteJid;
        const texto = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';
        
        if (!texto) return;
        
        const resposta = agent.gerarResposta(numero, texto);
        
        await sock.sendMessage(numero, { text: resposta });
        
        const agora = new Date().toLocaleTimeString('pt-BR');
        console.log(`\n[${agora}] 📨 De: ${numero}`);
        console.log(`💬 Cliente: "${texto}"`);
        console.log(`🤖 Bot: "${resposta.substring(0, 50)}..."`);
    });
}

console.log(`
╔════════════════════════════════════════╗
║   🤖 BOT DE VENDAS V2.0               ║
║   Mais Natural e Conversacional       ║
║   50 Exercícios de IE                 ║
╚════════════════════════════════════════╝

🚀 Iniciando...
`);

conectarWhatsApp();