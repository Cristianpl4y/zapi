// Nesta linha, o módulo venom-bot é importado. É um wrapper para interagir com a API do WhatsApp utilizando o headless browser Puppeteer.
const venom = require('venom-bot');

// Esta linha importa o módulo express, que é um framework web para Node.js. Ele permite criar aplicativos web e APIs de forma mais fácil e eficiente.
const express = require('express');

// O módulo http é importado. Ele é um módulo integrado do Node.js que fornece recursos para criar um servidor HTTP.
const http = require('http');

// Aqui, uma instância do aplicativo Express é criada chamando a função express().
const app = express();

// Essa linha define a variável port para armazenar o número da porta em que o servidor irá escutar. 
// Ele verifica se há uma variável de ambiente chamada PORT definida (usada em ambientes de hospedagem) e, se não houver, define o valor padrão como 8000.
const port = process.env.PORT || 8000;

// Aqui, o servidor HTTP é criado usando a função createServer do módulo http. 
// O parâmetro app é passado para o servidor, indicando que o aplicativo Express será tratado pelo servidor HTTP.
const server = http.createServer(app);

// Nesta linha, o módulo express-validator é importado e as variáveis body e validationResult são extraídas do módulo. 
// O body é usado para acessar o corpo das solicitações HTTP e validationResult é usado para validar e lidar com os resultados da validação.
const { body, validationResult } = require('express-validator');

// O método use é chamado no aplicativo Express para adicionar middlewares. Nesse caso,
// express.json() é um middleware embutido que analisa o corpo da solicitação como JSON, tornando os dados JSON disponíveis no objeto req.body para manipulação.
app.use(express.json());

// Outro middleware embutido é adicionado usando o método use.
// express.urlencoded() é um middleware que analisa os dados do corpo da solicitação codificados em URL e os torna acessíveis em req.body.
app.use(express.urlencoded({ extended: true }));

// Em resumo, esse código cria um cliente do WhatsApp usando o módulo venom-bot com a opção de executá-lo em modo "headless".
// Em seguida, inicia a função start(client) quando o cliente estiver pronto. Caso ocorra algum erro durante a criação do cliente, uma mensagem de erro é exibida no console.
venom.create({
    headless: true
})
.then((client) => start(client)).catch((erro) => {
    console.log("Erro ao iniciar o client", erro);
});

// Essa função start(client) define rotas para dois endpoints em um servidor Express.
function start(client){

    // Metodo send-message - Está funcionando!
    app.post('/send-message', [
        body('number').notEmpty(),
        body('message').notEmpty()
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({ msg })=>{ return msg });

        if(!errors.isEmpty()){
            return res.status(422).json({
                stats: false,
                message: errors.mapped()
            });
        }

        const number = req.body.number + '@c.us';
        const message = req.body.message;

        // Envia a mensagem 
        client.sendText(number, message).then(response => {
            res.status(200).json({
                status: true,
                message: 'Mensagem enviada',
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: 'Mensagem não enviada',
                response: err.text
            });
        });
    });

    // Metodo send-buttons - Não funciona (Lamento informar, mas atualmente o WhatsApp tem políticas de uso restritivas que podem resultar no bloqueio do uso de automações como bots de terceiros.)
    app.post('/send-buttons', [
        body('number').notEmpty(),
        body('btn1').notEmpty(),
        body('btn2').notEmpty(),
        body('title').notEmpty(),
        body('desc').notEmpty(),
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({msg})=> {return msg; });

        if(!errors.isEmpty()){
            return res.status(422).json({
                status: false,
                message: errors.mapped()
            });
        }


        // recuperando params
        const number = req.body.number + '@c.us';
        const btn1 = req.body.btn1;
        const btn2 = req.body.btn2;
        const title = req.body.title;
        const desc = req.body.desc;
        const buttons = [
            {
              "buttonText": {
                "displayText": btn1
                }
              },
            {
              "buttonText": {
                "displayText": btn2
                }
              }
            ]


        client.sendButtons(number, title, buttons, desc).then(response =>{
            res.status(200).json({
                status : true,
                message: "Mensagem enviada com sucesso",
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: "Mensagem não enviada",
                response: err.text
            });
        });

    });

    // Metodo send-image - Está funcionando!
    app.post('/send-image', [
        body('number').notEmpty(),
        body('imgUrl').notEmpty(),
        body('imgName').notEmpty(),
        body('desc').notEmpty()
    ], async (req, res) => {
        const errors = validationResult(req).formatWith(({ msg })=>{ return msg });

        if(!errors.isEmpty()){
            return res.status(422).json({
                stats: false,
                message: errors.mapped()
            });
        }

        const number = req.body.number + '@c.us';
        const imgUrl = req.body.imgUrl;
        const imgName = req.body.imgName;
        const desc = req.body.desc;

        // Envia a mensagem com imagem e descrição
        client.sendImage(number,imgUrl,imgName,desc).then(response => {
            res.status(200).json({
                status: true,
                message: 'Mensagem enviada',
                response: response
            });
        }).catch(err => {
            res.status(500).json({
                status: false,
                message: 'Mensagem não enviada',
                response: err.text
            });
        });
    });

    // Criar outros endpoints...

}

// essa parte do código inicia o servidor HTTP criado anteriormente e faz com que ele escute as solicitações na porta especificada. 
// Em seguida, uma mensagem é exibida no console para informar que o servidor está rodando e em qual porta ele está escutando.
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


// Atenção: ajustar código se venom-bot estiver na versão 5.0.6
/**
 *  caminho: zapi/node_modules/venom-bot/dist/controlles/browser.js 
 *  função: folderSession()
 *  adicionar o seguinte código: 
 *     const sessionName = options.session || '';
 *     const folderSession = path.join(path.resolve(process.cwd(), options.mkdirFolderToken, options.folderNameToken, sessionName));
 *     //const folderSession = path.join(path.resolve(process.cwd(), options.mkdirFolderToken, options.folderNameToken, options.session));
 * 
 */