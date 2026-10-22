# Canais 🔔

Extensão pro Chrome que avisa quando seus canais favoritos do **YouTube**, da **Twitch** e da **Kick** entram ao vivo ou lançam vídeo novo. Além dos avisos, ela guarda o seu histórico de lives assistidas, mostra quando cada canal costuma entrar ao vivo e tem conquistas, níveis e desafios pra quem acompanha lives todo dia.

Tudo roda no seu navegador. Não tem cadastro, não tem servidor e nada do que você assiste é enviado pra lugar nenhum.

> **Fase de testes.** O Canais ainda está sendo testado no uso real. Algumas coisas podem falhar de vez em quando, principalmente a detecção de vídeos novos e a Kick, que às vezes bloqueia as verificações.
>
> Se algo der errado:
> - Veja se aparece uma mensagem em vermelho no card do canal. Ela mostra o motivo.
> - Use o botão **Resetar**, no rodapé do popup. Ele reinicia a extensão sem apagar seus canais.
> - Abra uma [issue](../../issues) aqui no GitHub contando o que aconteceu e, se possível, mande um print.
>
> Os sites monitorados podem mudar a qualquer momento, e isso pode quebrar alguma função até sair uma correção.

---

## Sumário

- [Como instalar](#como-instalar)
- [Primeiros passos](#primeiros-passos)
- [Avisos de live e de vídeo novo](#avisos-de-live-e-de-vídeo-novo)
- [Lista de canais](#lista-de-canais)
- [Avisos inteligentes](#avisos-inteligentes)
- [Menções no chat](#menções-no-chat)
- [Seu dia](#seu-dia)
- [Histórico de lives assistidas](#histórico-de-lives-assistidas)
- [Sequências e horário habitual](#sequências-e-horário-habitual)
- [Nível, XP e desafios](#nível-xp-e-desafios)
- [Conquistas](#conquistas)
- [Personalização](#personalização)
- [Cartão de perfil e retrospectiva](#cartão-de-perfil-e-retrospectiva)
- [Configurações](#configurações)
- [Privacidade](#privacidade)
- [Licença](#licença)

---

## Como instalar

A extensão ainda não está na loja do Chrome, então a instalação é manual. Leva uns dois minutos:

1. **Baixe o projeto.** No topo desta página, clique no botão verde **Code** e depois em **Download ZIP**.
2. **Extraia a pasta.** Na sua pasta de Downloads, clique com o botão direito no arquivo baixado e escolha **Extrair tudo...**.
3. **Abra as extensões do navegador.** No Chrome, Edge, Brave ou Opera, digite na barra de endereço: `chrome://extensions/`
4. **Ative o Modo do desenvolvedor.** É uma chave no canto superior direito da página.
5. **Carregue a extensão.** Clique em **Carregar sem compactação** (ou *Load unpacked*), no canto superior esquerdo.
6. **Selecione a pasta.** Escolha a pasta que você extraiu no passo 2 e clique em **Selecionar pasta**.

Pronto. Pra deixar sempre à mão, clique no ícone de quebra-cabeça na barra do navegador e no alfinete ao lado do Canais.

**Pra atualizar:** baixe o ZIP novo, substitua os arquivos da pasta antiga pelos novos e clique no botão de recarregar (↻) do Canais em `chrome://extensions/`. Seus canais e seu histórico continuam lá.

---

## Primeiros passos

Na primeira instalação abre uma tela de boas-vindas que ajuda a trazer seus canais. Dá pra adicionar canais de vários jeitos:

- **Importar os canais que você já segue.** Abra a página de canais seguidos da Twitch, as Inscrições do YouTube (`youtube.com/feed/channels`) ou a página Seguindo da Kick. Aparece um botão **Importar canais pro Canais** no canto da tela: a extensão carrega a lista inteira, você marca quais quer e importa de uma vez.
- **Digitar no popup.** Escolha a aba da plataforma e digite o @ do canal ou cole o link.
- **Botão direito.** Numa página de canal (ou num link de canal), clique com o botão direito e escolha **Adicionar este canal ao Canais**.
- **Estando na página do canal.** Abra o popup e aparece um aviso com o botão **Adicionar**. Funciona até em página de vídeo do YouTube: a extensão descobre o @ do dono do vídeo.

---

## Avisos de live e de vídeo novo

- **Notificação quando entra ao vivo**, com o título da live e, quando o site informa, o jogo e quantas pessoas estão assistindo.
- **Abrir a live automaticamente** (opcional, por canal). Não abre de novo se a live já estiver aberta numa aba.
- **Vídeos novos no YouTube:** avisar e/ou abrir automaticamente quando o canal publica vídeo novo.
- **Mudou o título ou o jogo:** aviso opcional quando o streamer troca o título ou a categoria da live.
- **Palavras-chave:** em cada canal dá pra definir palavras (ex.: "torneio, campeonato") pra só avisar quando o título tiver uma delas.
- **Som de notificação** próprio, que dá pra desligar por canal.
- **Contador no ícone** mostrando quantos canais estão ao vivo agora.

---

## Lista de canais

- Uma aba pra cada plataforma e a aba **Ao vivo**, que junta todo mundo que está ao vivo agora, com o botão **Abrir todas** (abre só as que ainda não estão abertas).
- Canais ao vivo aparecem primeiro, e os **favoritos** ficam no topo com uma estrela.
- Com 5 canais ou mais aparece uma busca, que procura no nome e no título da live.
- Cada canal mostra há quanto tempo está ao vivo, quanta gente está assistindo, a sua sequência de lives e o horário em que costuma entrar.
- Menu de cada canal: favoritar, verificar agora, pausar o monitoramento, abrir automaticamente, som, aviso antes do horário habitual, aviso de mudança de título, vídeos novos, palavras-chave, conquistas e histórico do canal e remover.

---

## Avisos inteligentes

- **Longe do PC:** se o computador ficar parado por 10 minutos (ou bloqueado), os avisos esperam e chegam juntos num resumo quando você volta ("enquanto você estava fora: fulano está ao vivo há 40 min"). Se você está parado mas com uma live tocando, conta como presente e avisa na hora.
- **Antes do horário habitual** (opcional, por canal): "fulano costuma entrar em ~15 min".
- **Lives que você perdeu:** quando uma live de um favorito acaba e você não assistiu, chega um aviso que leva direto pra gravação. Dá pra escolher entre só favoritos, todos os canais ou nenhum.
- **Resumo da semana:** no domingo, no horário em que você costuma assistir, um resumo com o tempo assistido, o canal mais visto e sua maior sequência.
- **Retrospectiva do mês:** no começo de cada mês, um aviso de que a retrospectiva do mês anterior está pronta.
- **Não perturbe e horário de silêncio:** silencie por 1 hora, 4 horas ou até as 8h, ou defina um horário fixo todo dia (ex.: 23h às 7h). Nesse tempo a extensão continua verificando e contando o histórico, só não avisa nem abre abas.

---

## Menções no chat

Coloque seu nick nas configurações (dá pra colocar mais de um, separados por vírgula) e a extensão avisa quando alguém te marcar no chat. Funciona enquanto o chat da live estiver aberto em alguma aba, mesmo em segundo plano, e não avisa se você já está olhando a aba. Clicar no aviso leva pra aba certa.

---

## Seu dia

Cartão **Hoje** na tela inicial (dá pra esconder): tempo assistido hoje, dias seguidos assistindo, desafios da semana e a próxima live provável. Abrindo ele você vê:

- Seu nível e quanto falta pro próximo
- Os desafios da semana
- As lives que você perdeu, com botão pra ver a gravação
- A **agenda da semana**: previsão de quando cada canal costuma entrar ao vivo

---

## Histórico de lives assistidas

Botão de quadradinhos no topo do popup. Mostra um calendário de pontos em que cada dia cresce e muda de cor conforme o tempo de live que você assistiu. Dá pra ver todos os canais juntos ou um canal específico, com:

- Tempo de hoje, dos últimos 7 dias e dos últimos 12 meses
- Dias seguidos assistindo e o seu recorde
- Canais mais assistidos e suas sequências
- Lista das lives (título, jogo, duração e quanto você assistiu)
- Opção de abrir em tela cheia pra ver os 12 meses

O tempo conta sozinho, 1 minuto por minuto, quando a aba da live está aberta e visível (ou tocando som em segundo plano).

---

## Sequências e horário habitual

- **Sequência de lives:** quantas lives seguidas de cada canal você assistiu (pelo menos 10 minutos cada). Dia sem live não quebra a sequência, só live perdida. E 1 live perdida por semana é perdoada.
- **Horário habitual:** depois de 3 lives registradas, a extensão mostra quando o canal costuma entrar (ex.: "costuma entrar seg a sex · ~20h"), com um gráfico por dia da semana no menu do canal. Usa as lives dos últimos 60 dias.

---

## Nível, XP e desafios

- **XP:** 1 por minuto de live assistida, 30 por conquista e 60 por desafio concluído.
- **Níveis:** Novato, Espectador, Frequente, Fã, Veterano e Lenda. Subir de nível libera cores e molduras (veja [Personalização](#personalização)).
- **Desafios da semana:** toda segunda saem 3 desafios novos, como "assista 3 canais diferentes" ou "fique 2h seguidas numa live".

---

## Conquistas

Botão de troféu no topo do popup. São 38 conquistas, cada uma com seu badge:

- **Tempo:** 10h, 100h, 500h e 1.000h no total · 10h, 50h, 100h e 500h num mesmo canal · Maratona de 4h, 8h e 12h numa mesma live
- **Dedicação:** 10, 30, 100 e 365 dias seguidos assistindo (1 dia de folga por semana) · Explorador: 5, 15 e 30 canais diferentes
- **Chat (experimental):** Primeira palavra · Tagarela: 100, 1.000 e 10.000 mensagens
- **Especiais:** Primeira de todas, Coruja, Madrugador, Pontual, Do começo ao fim, Fiel, Três mundos, Fim de semana, Caçador de vídeos, Nunca perde, Virada, Dia histórico e Aniversário
- **Lendárias:** Bronze (nível 50), Prata (nível 75) e Ouro (nível 100). Cada uma muda a cor da extensão pro metal e libera uma moldura de metal pro cartão de perfil

Também tem as **conquistas de cada canal** (aba "Por canal", ou pelo menu do canal): tempo no canal, maratona, lives seguidas, Pontual, Do começo ao fim, Fiel e as de chat daquele canal.

Quando você ganha uma conquista com uma live aberta, aparece uma animação no canto da tela (inclusive com o vídeo em tela cheia) que some sozinha. Se você não estiver numa live, ela aparece da próxima vez que abrir o popup. As bloqueadas mostram quanto falta.

As de chat só contam **quantas** mensagens você envia pelo navegador do PC, sem ler nem guardar o que você escreve. Podem parar de contar se o site mudar o chat, e a contagem pode ser desligada nas configurações.

---

## Personalização

Nas configurações, em **Personalizar**:

- **Cor de destaque:** Íris, Ciano (nível 5), Magenta (nível 10), Coral (nível 15), Menta (nível 20), Grafite (nível 30) e as de metal das conquistas lendárias.
- **Tema Meia-noite:** preto total, ótimo pra tela OLED. Libera com a conquista Coruja.
- **Molduras do cartão de perfil:** Neon (nível 8), Tricolor (conquista 500 horas), Lenda (nível 30) e Bronze, Prata e Ouro (conquistas lendárias).
- **Tema claro, escuro ou automático:** botão no topo do popup.

---

## Cartão de perfil e retrospectiva

Imagens prontas pra postar, geradas no seu navegador. Dá pra baixar ou copiar.

- **Cartão de perfil:** nível, XP, horas assistidas, sequência, canal favorito e seus badges mais recentes, com a moldura que você escolheu.
- **Retrospectiva:** do mês ou do ano, com horas, dias assistindo, lives assistidas, maior sequência, canais mais assistidos e conquistas do período.

---

## Configurações

Botão de engrenagem no topo do popup:

- Intervalo de verificação (de 1 a 60 minutos)
- Não perturbe e horário de silêncio
- Canais ao vivo primeiro e cartão "Hoje" na tela inicial
- Lembretes: segurar avisos quando estiver longe, resumo da semana, sequências, avisos de conquista
- Lives perdidas: só favoritos, todos ou nenhum
- Seu nick pras menções no chat
- Contagem de mensagens do chat
- **Backup:** exporta canais, configurações e histórico num arquivo `.json`. Importar junta com o que já existe, sem apagar nada. Útil pra levar pra outro computador.

E no rodapé do popup: **Verificar todos** e **Resetar** (reinicia a extensão sem apagar seus canais).

---

## Privacidade

- Seus canais, configurações e histórico ficam salvos **só no seu navegador**.
- A extensão só acessa YouTube, Twitch e Kick, pra ver se os canais estão ao vivo.
- Não tem conta, servidor, anúncio nem rastreamento.
- A contagem do chat só conta quantas mensagens você envia, nunca o conteúdo.

---

## Licença

Este projeto está disponível sob a licença MIT.
