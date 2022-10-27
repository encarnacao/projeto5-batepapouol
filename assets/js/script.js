/* Variáveis globais */
const chat = document.querySelector("#chat");
let messages, conexao, busca;
//Utilizado um setTimeout para a página carregar antes de colocar seu nome.
let nome = prompt("Insira seu nome:"), i = 0;
/*------------------*/


function entrarNaSala() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });
    promise.then(entrarNaSalaSucesso);
    promise.catch(entrarNaSalaErro);
}

function manterConexao() {
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", { name: nome });
    promise.catch(manterConexaoErro);
}

function entrarNaSalaSucesso(response) {
    /**
     * Caso entre com sucesso, permanece mantendo a conexão com o servidor a cada 5 segundos.
     */
    conexao = setInterval(manterConexao, 5000);
    buscarMensagens();
}

function entrarNaSalaErro(erro) {
    /**
     * Caso não entre com sucesso, pede para que usuário entre com novo nome
     */
    console.log(erro);
    if (erro.response.status === 400) {
        nome = prompt("Nome já em uso. Insira novo nome:");
        entrarNaSala();
    }
}

function manterConexaoErro(erro) {
    /**
     * Caso a conexão seja perdida, pede para que usuário entre com novo nome
     */
    clearInterval(conexao);
    nome = prompt("Conexão perdida. Insira novo nome:");
    entrarNaSala();
}

function buscarMensagens() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(buscarMensagensSucesso);
    promise.catch(buscarMensagensErro);
}

function buscarMensagensSucesso(response) {
    mensagens = response.data;
    if (i === 0) {
        renderizarMensagens(mensagens[mensagens.length - 1], true);
        i++;
    } else {
        renderizarMensagens(mensagens[mensagens.length - 1]);
    }
    busca = setInterval(buscarMensagens, 3000);
}

function buscarMensagensErro(erro) {
    alert("Deu erro");
    clearInterval(busca);
}

function conteudoMensagem(mensagem) {
    if (mensagem.type === "status") {
        return `<span class="username">${mensagem.from}</span> ${mensagem.text}`;
    }
    if (mensagem.type === "message") {
        return `<span class="username">${mensagem.from}</span> para <span class="username">${mensagem.to}</span>: ${mensagem.text}`;
    }
    if (mensagem.type === "private_message") {
        return `<span class="username">${mensagem.from}</span> reservadamente para <span class="username">${mensagem.to}</span>: ${mensagem.text}`;
    }
}

function renderizarMensagens(ultimaMensagem, scroll = false) {
    chat.innerHTML = "";
    for (let i = 0; i < mensagens.length; i++) {
        const mensagem = mensagens[i];
        //Não renderiza mensagens que não são para todos ou para você.
        if (mensagem.to !== "Todos" && mensagem.to !== nome) continue;
        const div = document.createElement("div");
        const paragraph = document.createElement("p");
        div.classList.add(mensagem.type);
        paragraph.innerHTML = `<span class="time">${mensagem.time}</span>&nbsp;&nbsp;` + conteudoMensagem(mensagem);
        div.appendChild(paragraph);
        chat.appendChild(div);
        //Caso haja uma nova mensagem, rola a página para baixo.
        if (i === mensagens.length - 1 && (ultimaMensagem !== mensagem || scroll)) div.scrollIntoView();
    }
}

entrarNaSala();