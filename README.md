# Projeto #05 - Bate-Papo Uol

O terceiro projeto com JavaScript é a implementação de um bate-papo completamente funcional inspirado no Bate-Papo UOL. Para a implementação de tal, a Driven forneceu uma API cuja documentação estará no fim deste README.

## Requisitos

### Geral
Como no projeto passado, temos que os requisitos gerais são:
+ Utilizar apenas JavaScript puro;
+ Utilizar Git e GitHub, com um repositório público, para versionamento;
+ Realizar commits a cada requisito implementado.

Além disso, o layout deve seguir o [figma](https://www.figma.com/file/Xc2rk591z7YuTZ4pxVjtaO/Chat-UOL-(Copy)), sendo necessário apenas a implementação de um layout mobile.

### Chat

+ Ao entrar no site, este deve carregar as mensagens do servidor e exibi-las conforme layout fornecido;
+ Existem 3 tipos de mensagem:
  + Mensagens de Status(**Entrou** ou **Saiu** da Sala), com fundo cinza;
  + Mensagens reservadas(**Reservadamente**), com fundo rosa;
  + Mensagens normais, com fundo branco.
+ A cada 3 segundos o site deve re-carregar as mensagens do servidor para manter sempre atualizado;
+ O chat deve ter rolagem automática por padrão. Sempre que novas mensagens forem adicionadas, ele scrolla para o final;
  + *Dica*: a função `scrollIntoView` pode ser utilizada para isto
  ```javascript
  const elementoQueQueroQueApareca = document.querySelector('.mensagem');
  elementoQueQueroQueApareca.scrollIntoView();
  ```
+ As mensagens com **Reservadamente** só devem ser exibidas se o nome do destinatário for igual ao nome do usuário que está escrevendo no chat (ou senão ele poderia ver as mensagens reservadas para outras pessoas).
  + Para fazer essa filtragem no front-end não é uma boa prática, o ideal seria o servidor não fornecer essas mensagens para outras pessoas. Este método foi mantido por fins didáticos.
  
### Entrada na sala

+ Ao entrar no site, o usuário é perguntado pelo nome por um `prompt`;
+ Após a inserção do nome, este deve ser enviado para o servidor pra cadastrar o usuário;
  + Caso o servidor responda com sucesso, o usuário poderá entrar na sala;
  + Caso o serviro responda com erro, deve-se pedir pro usuário digitar outro nome, pois já está em uso.
+ Enquanto o usuário estiver em sala, a cada 5 segundos o site deve avisat ao servidor que o usuário ainda está presente, senão será considerado que **saiu da sala**.

### Envio de mensagem

+ Ao enviar uma mensagem, esta deve ser enviada ao servidor;
  + Caso responda com sucesso, deve obter novamente as mensagens do servidor e atualizar o chat;
  + Caso responda com erro, significa que o usuário não está mais na sala. A página deve ser recarregada com `window.location.reload()`;
+ Neste envio, deve ser informado o remetente, destinatário e se a mensagem é reservada ou não.
  + *Escolher um destinatário* e se a mensagem *é reservada ou pública* é um requisito bônus.
  
## Bônus

### Participantes ativos

+ Ao clicar no ícone superior direito de participantes, o menu lateral deve abrir por cima do chat conforme o layout;
+ Ao clicar no fundo escuro, o menu lateral deve ser ocultado novamente;
+ O site deve obter a lista de participantes ao entrar no chat e deve atualizar a cada 10 segundos;
+ Ao clicar em uma pessoa, ou em público/reservadamente, a opção clicada deve ser marcada com um check e as demais desmarcadas;
+ Além do check, ao trocar esses parâmetros também deve ser alterada a frase que informa o destinatário, localizada abaixo do input de mensagem.

### Tela de entrada

+ Implemente uma tela inicial no lugar do prompt para pedir o nome do usuário seguindo o seguinte layout:
![](https://i.imgur.com/dQXMEXj.png) ![](https://i.imgur.com/sAvRaRI.png)

### Envio com enter

+ Ao usuário teclar enter no campo de mensagem, ela deverá ser enviada.

## API de Mensagens da Driven

### Entrar na sala

Para entrar na sala, deve-se enviar ao servidor o nome do usuário. Para isso, envie uma requisição `POST` para a URL:

```jsx
https://mock-api.driven.com.br/api/v6/uol/participants 
```

Enviando um objeto no formato:

```jsx
{
  name: "João"
}
```

O servidor pode responder com status `400` se já houver um usuário online com esse nome. Se for o caso, a aplicação deve pedir um novo nome até que o servidor responda com status `200`.

### Manter conexão

O servidor precisa saber que o usuário continua online. Se o usuário não envia nenhuma mensagem, como ele pode inferir se o usuário continua ou não na página?

Para resolver isso, o servidor espera que seu sistema avise continuamente que o usuário permanece utilizando o chat. Para isso, o sistema deve enviar uma requisição `POST` para a URL:

```jsx
https://mock-api.driven.com.br/api/v6/uol/status
```

Enviando um objeto no formato

```jsx
{
  name: "João"
}
```

enviando o nome do usuário que foi pedido ao entrar na página.

Esta requisição deve ser feita a cada 5s.

### Buscar mensagens

Para buscar mensagens do servidor, mande uma requisição `GET` para a URL:

```jsx
https://mock-api.driven.com.br/api/v6/uol/messages
```

A resposta será um array de objetos, como o seguinte:

```jsx
[
	{
		from: "João",
		to: "Todos",
		text: "entra na sala...",
		type: "status",
		time: "08:01:17"
	},
	{
		from: "João",
		to: "Todos",
		text: "Bom dia",
		type: "message",
		time: "08:02:50"
	},
]
```

Nos objetos, o campo `type` identifica o tipo da mensagem. Existem os seguintes valores:

+ `status`: mensagem de estado, como entrou ou saiu da sala
+ `message`: mensagem pública
+ `private_message`: mensagem particular


### Enviar mensagens

Para enviar mensagens, você deve fazer uma requisição `POST` para a URL:

```jsx
https://mock-api.driven.com.br/api/v6/uol/messages
```

Nesta requisição, você deve enviar um objeto como o seguinte:

```jsx
{
	from: "nome do usuário",
	to: "nome do destinatário (Todos se não for um específico)",
	text: "mensagem digitada",
	type: "message" // ou "private_message" para o bônus
}
```


### *Bônus*: Buscar participantes
    
Para buscar a lista de participantes, envie uma requisição `GET` para a URL:
    
 ```jsx
 https://mock-api.driven.com.br/api/v6/uol/participants
 ```
 
 Esta requisição retornará um array de objetos no formato:
 
 ```jsx
[
	{
		name: "João"
	},
	{
		name: "Maria"
	}
]
 ```
