/* Variáveis globais */
const chat = document.querySelector("#chat");
const telaInicial = document.querySelector(".tela-inicial");
const visibilidades = document.querySelector(".visibility").children;
let mensagens, conexao, destinatario, buscando, visibilidade, participantes, ultimaMensagem = { time: "mock message" };
//Utilizado um setTimeout para a página carregar antes de colocar seu nome.
let nome;
/*------------------*/

function alternarVisibilidade(erro = false) {
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
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
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
        if ((mensagem.to !== nome && mensagem.from !== nome) && mensagem.type === "private_message") continue;
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
    const mensagemPrivada = visibilidade === "restricted";
    if (destinatario === undefined) {
        destinatario = "Todos";
    } else if (mensagemPrivada) {
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



function buscarParticipantes() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(buscarParticipantesSucesso);
    promise.catch(buscarParticipantesErro);
}

function buscarParticipantesSucesso(response) {
    console.log("Achou participantes");
    participantes = response.data;
    renderizarParticipantes();
}

function buscarParticipantesErro(erro) {
    clearInterval(busca);
    clearInterval(conexao);
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
}

function resetarVisibilidade() {
    if (visibilidades[1].classList.contains("selected")) {
        visibilidades[0].classList.add("selected");
        visibilidades[1].classList.remove("selected");
        visibility = "public";
    }
}

function renderizarParticipantes() {
    const lista = document.querySelector(".participants-list");
    lista.innerHTML = `
    <li>
        <div>
            <ion-icon class="left-icon" name="people"></ion-icon>
            <p>Todos</p>
        </div>
        <ion-icon class="right-icon" name="checkmark"></ion-icon>
    </li>`;
    lista.querySelector("li").addEventListener("click", selecionarParticipante);
    for (let i = 0; i < participantes.length; i++) {
        const li = document.createElement("li");
        li.innerHTML = `
        <div>
            <ion-icon class="left-icon" name="person-circle"></ion-icon>
            <p>${participantes[i].name}</p>
        </div>
        <ion-icon class="right-icon" name="checkmark"></ion-icon>`;
        if (destinatario === participantes[i].name) {
            li.classList.add("selected");
        }
        li.setAttribute("data-identifier", "participant");
        lista.appendChild(li);
        li.addEventListener("click", selecionarParticipante);
    }
    //Caso a pessoa tenha saído, o destinatário é resetado.
    if (lista.querySelector("li.selected") === null) {
        lista.children[0].classList.add("selected");
        destinatario = "Todos";
        resetarVisibilidade();
    }
    destinationMessage();

}


function desselecionar(pai) {
    if (pai.querySelector(".selected") !== null) {
        pai.querySelector(".selected").classList.remove("selected");
    }
}

function selecionarParticipante(e) {
    const target = this;
    const pai = target.parentNode;
    desselecionar(pai);
    target.classList.add("selected");
    destinatario = target.querySelector("p").innerHTML;
    destinationMessage();
}

function publicoOuReservado() {
    if (visibilidade !== "restricted") {
        return "(publicamente)";
    } else {
        return "(reservadamente)";
    }
}

function destinatarioValido() {
    if (destinatario === "Todos" || destinatario === undefined) return true;
    return false;
}

function destinationMessage() {
    /**
     * Altera a mensagem abaixo do campo de mensagem falando destino de mensagem
     */
    const destination = document.querySelector(".destination");
    destination.innerHTML = "";
    if (destinatarioValido()) {
        return;
    } else {
        destination.innerHTML = `Enviando para ${destinatario}` + publicoOuReservado();
    }
}

function alternarOverlay() {
    const overlay = document.querySelector(".overlay-participants");
    const escondido = overlay.classList.contains("hidden");
    //Usar toggle estava causando alguns bugs, decidi adicionar e remover manualmente.
    //Caso esteja não estja escondido, esconde. Caso contrário, mostra.
    if (!escondido) {
        //Para de buscar participantes
        clearInterval(buscando);
        setTimeout(() => { overlay.classList.add("hidden") }, 1000);
        setTimeout(function () {
            const asideMenu = document.querySelector("aside");
            asideMenu.classList.add("translated");
            overlay.children[0].classList.add("transparent");
        }, 100);
    } else {
        buscarParticipantes();
        //Busca novos participantes a cada 10 segundos.
        buscando = setInterval(buscarParticipantes, 10000);
        overlay.classList.remove("hidden");
        setTimeout(function () {
            const asideMenu = document.querySelector("aside");
            asideMenu.classList.remove("translated");
            overlay.children[0].classList.remove("transparent");
        }, 100);
    }
}

function selecionarVisibilidade(e) {
    const pai = this.parentNode;
    pai.querySelector(".selected").classList.remove("selected");
    this.classList.add("selected");
    visibilidade = this.getAttribute("visibility");
    destinationMessage();
}

/* Ações ao carregar a página */
busca = setInterval(buscarMensagens, 3000);


document.querySelector("#send").addEventListener("click", enviar);
document.querySelector("#message-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") enviar();
});

document.querySelector("#nome").addEventListener("input", function (e) {
    nome = e.target.value;
    if (nome === "") {
        document.querySelector("#btn-entrar").disabled = true;
    } else {
        document.querySelector("#btn-entrar").disabled = false;
    }
});

document.querySelector("#nome").addEventListener("keypress", function (e) {
    if (e.key === "Enter") entrarNaSala();
});

for (let i = 0; i < visibilidades.length; i++) {
    visibilidades[i].addEventListener("click", selecionarVisibilidade);
}
document.querySelector("#people").addEventListener("click", alternarOverlay);


/* ------------------------------------- */