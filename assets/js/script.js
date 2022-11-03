/* Variáveis globais */
const chat = document.querySelector("#chat");
const telaInicial = document.querySelector(".tela-inicial");
const visibilidades = document.querySelector(".visibility").children;
let mensagens, busca, conexao, destinatario, buscando, visibilidade, participantes, ultimaMensagem = { time: "mock message" };
let nome;
/*------------------*/

function alternarVisibilidade(erro = false) {
    /**
     * Altera visibilidade do campo de texto e do loading
     * @param {boolean} erro - Caso seja true, mostra a mensagem que um erro ocorreu
     * e pede para que usuário entre com novo nome.
     */
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
    /**
     * Envia uma requisição para o servidor para entrar na sala.
     */
    alternarVisibilidade();
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", { name: nome });
    promise.then(entrarNaSalaSucesso);
    promise.catch(entrarNaSalaErro);
}

function manterConexao() {
    /**
     * Envia uma requisição para o servidor para manter a conexão.
     * Não é necessário fazer nada caso tenha sucesso.
     */
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
     * Caso não entre com sucesso, volta para tela de inicio e pede para que usuário entre com novo nome
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
    /**
     * Envia uma requisição para o servidor para buscar as mensagens.
     */
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(buscarMensagensSucesso);
    promise.catch(buscarMensagensErro);
}

function buscarMensagensSucesso(response) {
    /**
     * Caso consiga buscar mensagens, renderiza as mensagens na tela.
     * Salva a ultima mensagem na variável global ultimaMensagem.
     * A primeira ultimaMensagem é sempre uma mensagem mockada 
     * para que inicialmente a condição final de renderizarMensagens seja verdadeira.
     */
    mensagens = response.data;
    renderizarMensagens(ultimaMensagem)
    ultimaMensagem = mensagens[mensagens.length - 1];

}

function buscarMensagensErro(erro) {
    /**
     * Caso não consiga buscar mensagens, a conexão foi perdida. Atualiza a página.
     */
    clearInterval(busca);
    clearInterval(conexao);
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
}

function conteudoMensagem(mensagem) {
    /**
     * Retorna o conteúdo da mensagem de acordo com o tipo.
     */
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
    /**
     * Renderiza as mensagens na tela.
     * Caso a mensagem seja privada, verifica se o usuário é o destinatário ou o remetente para renderizar.
     * Caso a ultima mensagem seja diferente da mensagem atual, scrolla para o final da tela.
     */
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
        div.setAttribute("data-test","message")
        chat.appendChild(div);
    }
    //Caso haja uma nova mensagem, rola a página para baixo.
    if (ultimaMensagem.time !== mensagem.time) div.scrollIntoView({behavior: "smooth"});
}

function enviarMensagem(textoDaMensagem) {
    /**
     * Cria o objeto mensagem e a enviar para o servidor.
     * Caso seja uma mensagem privada, o destinatário é o participante selecionado.
     * Caso contrário, o destinatário é todos.
     */
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
    /**
     * Caso envie a mensagem com sucesso, renderiza novas mensagens.
     */
    buscarMensagens();
}

function enviarMensagemErro(erro) {
    /**
     * Caso não consiga enviar mensagem, a conexão foi perdida. Atualiza a página.
     */
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
}

function enviar() {
    /**
     * Manda a mensagem para o servidor
     * Input é limpo após enviar mensagem.
     */
    const input = document.querySelector("#message-input");
    const textoDaMensagem = input.value;
    input.value = "";
    enviarMensagem(textoDaMensagem);
}



function buscarParticipantes() {
    /**
     * Busca os participantes da sala.
     */
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(buscarParticipantesSucesso);
    promise.catch(buscarParticipantesErro);
}

function buscarParticipantesSucesso(response) {
    /**
     * Caso ache os participantes, renderiza a lista de participantes.
     */
    console.log("Achou participantes");
    participantes = response.data;
    renderizarParticipantes();
}

function buscarParticipantesErro(erro) {
    /**
     * Caso não ache os participantes, a conexão foi perdida, então atualiza a página.
     */
    clearInterval(busca);
    clearInterval(conexao);
    console.log(erro);
    alert("Conexão perdida. Atualize a página.");
    window.location.reload();
}

function resetarVisibilidade() {
    /**
     * Reseta a visibilidade para mensagem pública
     */
    if (visibilidades[1].classList.contains("selected")) {
        visibilidades[0].classList.add("selected");
        visibilidades[1].classList.remove("selected");
        visibilidade = "public";
    }
}

function renderizarParticipantes() {
    /**
     * Renderiza os participantes no menu lateral
     * Caso nenhum participante esteja selecionado, seleciona o primeiro.
     * Caso o participante selecionado não esteja mais na lista, seleciona o primeiro.
     * Caso o participante selecionado esteja na lista, mantém a seleção.
     * Caso o participante selecionado seja o próprio usuário, mantém a seleção.
     */
    const lista = document.querySelector(".participants-list");
    lista.innerHTML = `
    <li data-test="all">
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
        <ion-icon class="right-icon" data-test="check" name="checkmark"></ion-icon>`;
        if (destinatario === participantes[i].name) {
            li.classList.add("selected");
        }
        li.setAttribute("data-test", "participant");
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
    /**
     * Desseleciona caso haja algum elemento selecionado no pai.
     */
    if (pai.querySelector(".selected") !== null) {
        pai.querySelector(".selected").classList.remove("selected");
    }
}

function selecionarParticipante() {
    /**
     * Função para selecionar os participantes do chat
     */
    const target = this;
    const pai = target.parentNode;
    desselecionar(pai);
    target.classList.add("selected");
    destinatario = target.querySelector("p").innerHTML;
    if(destinatario === "Todos") resetarVisibilidade();
    destinationMessage();
}

function publicoOuReservado() {
    /**
     * Função para determinar qual o tipo de mensagem que será enviada exbibida na tela.
     */
    if (visibilidade !== "restricted") {
        return "(publicamente)";
    } else {
        return "(reservadamente)";
    }
}

function destinatarioValido() {
    /**
     * Verifica se há um destinatario específico
     * @returns {boolean}
     */
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
    /**
     * Alterna visibilidade do overlay com menu de participantes
     */
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

function selecionarVisibilidade() {
    /**
     * Seleciona a visibilidade da mensagem e altera o texto abaixo do campo de mensagem.
     */
    const pai = this.parentNode;
    pai.querySelector(".selected").classList.remove("selected");
    this.classList.add("selected");
    visibilidade = this.getAttribute("visibility");
    destinationMessage();
}

/* Ações ao carregar a página */
busca = setInterval(buscarMensagens, 3000);

//Adiciona evento de click no botão de enviar mensagem, caso o usuário aperte enter a mensagem também é enviada
document.querySelector("#send").addEventListener("click", enviar);
document.querySelector("#message-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") enviar();
});
//Caso haja algum input no campo de texto do nome, habilita o botão de entrar
document.querySelector("#nome").addEventListener("input", function (e) {
    nome = e.target.value;
    if (nome === "") {
        document.querySelector("#btn-entrar").disabled = true;
    } else {
        document.querySelector("#btn-entrar").disabled = false;
    }
});
//Caso o usuário aperte enter no campo de nome, entra na sala
document.querySelector("#nome").addEventListener("keypress", function (e) {
    if (e.key === "Enter") entrarNaSala();
});
//Adiciona eventos nas visibilidades.
for (let i = 0; i < visibilidades.length; i++) {
    visibilidades[i].addEventListener("click", selecionarVisibilidade);
}
//Adiciona evento de click para mostrar painel com participantes.
document.querySelector("#people").addEventListener("click", alternarOverlay);


/* ------------------------------------- */
