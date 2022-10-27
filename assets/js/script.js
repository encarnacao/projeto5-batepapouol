/* Variáveis globais */
const chat = document.querySelector("#chat");
const telaInicial = document.querySelector(".tela-inicial");

let mensagens, conexao, busca, destinatario, visibility, participant, ultimaMensagem = { time: "mock message" };
//Utilizado um setTimeout para a página carregar antes de colocar seu nome.
let nome;
/*------------------*/

function alternarVisibilidade(erro = false){
    const inputArea = telaInicial.querySelector(".input-nome");
    const errorMessage = inputArea.querySelector(".erro"); 
    const loading = telaInicial.querySelector(".loading");
    inputArea.classList.toggle("hidden");
    loading.classList.toggle("hidden");
    if (erro && errorMessage.classList.contains("hidden")) {
        errorMessage.classList.remove("hidden");
    }
}

function entrarNaSala() {
    alternarVisibilidade();
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
    telaInicial.classList.add("hidden");
}

function entrarNaSalaErro(erro) {
    /**
     * Caso não entre com sucesso, pede para que usuário entre com novo nome
     */
    if (erro.response.status === 400) {
        alternarVisibilidade(true);
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
    renderizarMensagens(ultimaMensagem)
    ultimaMensagem = mensagens[mensagens.length - 1];

}

function buscarMensagensErro(erro) {
    clearInterval(busca);
    clearInterval(conexao);
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
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

function renderizarMensagens(ultimaMensagem) {
    chat.innerHTML = "";
    let mensagem, div;
    for (let i = 0; i < mensagens.length; i++) {
        mensagem = mensagens[i];
        //Não renderiza mensagens privadas de outras pessoas.
        if (mensagem.to !== nome && mensagem.type === "private_message") continue;
        div = document.createElement("div");
        const paragraph = document.createElement("p");
        div.classList.add(mensagem.type);
        paragraph.innerHTML = `<span class="time">${mensagem.time}</span>&nbsp;&nbsp;` + conteudoMensagem(mensagem);
        div.appendChild(paragraph);
        chat.appendChild(div);
    }
    //Caso haja uma nova mensagem, rola a página para baixo.
    if (ultimaMensagem.time !== mensagem.time) div.scrollIntoView();
}

function enviarMensagem(textoDaMensagem) {
    let type = "message";
    if (destinatario === undefined) {
        destinatario = "Todos";
    } else if (visibility === "restricted") {
        type = "private_message";
    }
    const mensagem = { from: nome, to: destinatario, text: textoDaMensagem, type: type };
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", mensagem);
    promise.then(enviarMensagemSucesso);
    promise.catch(enviarMensagemErro);
}

function enviarMensagemSucesso(response) {
    buscarMensagens();
}

function enviarMensagemErro(erro) {
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
}

function enviar() {
    //Queria que a mensagem fosse enviada e sumisse imediatamente, mas ainda há um delay. De qualquer forma deixarei assim.
    const input = document.querySelector("#message-input");
    const textoDaMensagem = input.value;
    input.value = "";
    enviarMensagem(textoDaMensagem);
}


/* Ações ao carregar a página */
busca = setInterval(buscarMensagens, 3000);


document.querySelector("#send").addEventListener("click", enviar);
document.querySelector("#message-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") enviar();
});

document.querySelector("#nome").addEventListener("keydown", function (e) {
    const input = document.querySelector("#nome");
    nome = input.value;
    if (nome === "") {
        document.querySelector("#btn-entrar").disabled = true;
    } else {
        document.querySelector("#btn-entrar").disabled = false;
    }
    if (e.key === "Enter") entrarNaSala();
});
/* ------------------------------------- */