// Bot WhatsApp - CommonJS (FUNCIONA!)
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

// Configuração
const CONFIG = {
    produto: {
        nome: "50 Exercícios de Inteligência Emocional",
        preco: 27.70,
        link: "https://pay.cakto.com.br/ww9ugua_567793"
    }
};

// Bot simples
class BotSimples {
    responder(mensagem) {
        const msg = mensagem.toLowerCase();
        
        if (msg.includes('oi') || msg.includes('olá')) {
            return `👋 Olá! Bem-vindo ao ${CONFIG.produto.nome}!\n\n💰 Preço: R$ ${CONFIG.produto.preco}\n\nDigite "preço" ou "comprar"!`;
        }
        
        if (msg.includes('preço') || msg.includes('valor')) {
            return `💰 ${CONFIG.produto.nome}\n\n💵 R$ ${CONFIG.produto.preco}\n\n🔗 ${CONFIG.produto.link}`;
        }
        
        if (msg.includes('comprar')) {
            return `🎉 Compre aqui: ${CONFIG.produto.link}\n\n💰 R$ ${CONFIG.produto.preco}`;
        }
        
        return `💬 Olá! Digite "preço" para valores ou "comprar"!`;
    }
}

// Conexão WhatsApp
async function conectarWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        const sock = makeWASocket({ 
            auth: state,
            printQRInTerminal: false
        });
        
        const bot = new BotSimples();
        
        sock.ev.on('creds.update', saveCreds);
        
        sock.ev.on('connection.update', (update) => {
            const { connection, qr } = update;
            
            if (qr) {
                console.log('\n📱 QR CODE PARA CONECTAR:\n');
                qrcode.generate(qr, { small: true });
            }
            
            if (connection === 'open') {
                console.log('✅ BOT CONECTADO!');
            }
        });
        
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;
            
            const numero = msg.key.remoteJid;
            const texto = msg.message.conversation || '';
            
            if (texto) {
                const resposta = bot.responder(texto);
                await sock.sendMessage(numero, { text: resposta });
                console.log('📨 Mensagem de', numero, '->', texto);
            }
        });
        
    } catch (error) {
        console.log('❌ Erro:', error.message);
        setTimeout(conectarWhatsApp, 5000);
    }
}

// Iniciar
console.log('🚀 Iniciando Bot WhatsApp...');
conectarWhatsApp();