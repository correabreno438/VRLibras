# LIBRAS VR - MVP
breno gabriel de santana correakmmmmdasdbksbabren gabriel de sam basbrenodsbdabsdbiww
Protótipo funcional: **câmera do celular (passthrough)** + **modo tela
dividida estilo VR** + **legenda em tempo real** + **avatar 3D VLibras
sinalizando**, tudo capturado a partir da voz (Web Speech API).

## Passo a passo de instalação

1. Instale o [Node.js](https://nodejs.org/) (versão LTS) — isso já traz o `npm` junto.
2. Abra esta pasta no VSCode.
3. No terminal do VSCode, rode:
   ```
   npm install
   ```
4. **Copie os arquivos do avatar 3D (assets do VLibras Player):**
   Depois do `npm install`, os arquivos do avatar ficam em
   `node_modules/vlibras-player-webjs/assets`. Copie essa pasta inteira para
   `public/assets/vlibras`:

   - Windows (PowerShell):
     ```
     mkdir public\assets\vlibras
     Copy-Item node_modules\vlibras-player-webjs\assets\* public\assets\vlibras -Recurse
     ```
   - Mac/Linux:
     ```
     mkdir -p public/assets/vlibras
     cp -r node_modules/vlibras-player-webjs/assets/* public/assets/vlibras/
     ```

5. **Acesso à câmera exige HTTPS** (ou `localhost`) — navegadores bloqueiam
   `getUserMedia` em conexões HTTP simples. O Vite já resolve isso com um
   certificado local. Rode:
   ```
   npm run dev
   ```
   Se o navegador do celular reclamar de "conexão não seer segura" ao abrir
   pelo IP de rede, veja a seção **"Câmera não funciona pelo IP de rede"**
   mais abaixo — é o problema mais comum desse tipo de projeto.

6. No celular, abra o endereço mostrado no terminal **no Chrome**, permita o
   acesso à câmera e ao microfone quando pedido, encaixe o celular no óculos
   Cardboard, e toque no botão de microfone e no botão "Ativar modo VR"
   antes de encaixar (ou peça pra alguém tocar por você).

## Câmera não funciona pelo IP de rede (erro comum)

Celulares só liberam a câmera em páginas HTTPS (ou `localhost`). Ao acessar
pelo IP da rede (ex: `http://192.168.0.x:5173`), o Chrome pode bloquear por
não ser HTTPS. Duas soluções simples:

- **Opção mais fácil**: instale a extensão `@vitejs/plugin-basic-ssl`
  (`npm install --save-dev @vitejs/plugin-basic-ssl`) e ative HTTPS local no
  Vite — depois disso o endereço de rede vai abrir como `https://...`. Na
  primeira vez, o Chrome no celular vai avisar "conexão não seer segura":
  toque em "Avançado" → "Acessar mesmo assim" (é o certificado local, é
  seguro nesse contexto).
- **Alternativa**: use o **ngrok** (gratuito) pra gerar um link HTTPS público
  temporário apontando pro seu `localhost`, e abra esse link no celular.

## O que já funciona neste app

- Acesso real à câmera do celular (passthrough), com botão pra alternar
  entre visão única e **tela dividida estilo VR** (dois "olhos")
- Reconhecimento de voz em português, em tempo real, direto no navegador
- Legenda em texto ao vivo (funcionalidade garantida, mesmo se o avatar falhar)
- Avatar 3D do VLibras sinalizando automaticamente cada frase reconhecida

## Limitação importante (documente isso no relatório do trabalho)

A legenda e o avatar VLibras aparecem como um **painel central fixo por
cima** da visão dividida (não são duplicados um por olho com profundidade
própria). Ou seja: o ambiente ao redor (câmera) é visto em estéreo real, mas
o "painel de informação" (legenda + avatar) é uma camada plana por cima,
igual num HUD de jogo. Isso é uma limitação técnica conhecida e aceitável
pra um MVP de 2 semanas — o sistema funciona de ponta a ponta, só não tem
profundidade 3D real no HUD. Documente como próximo passo: renderizar o
avatar como textura projetada dentro de cada metade da tela, com a devida
correção de lente (distorção de barril) pra cada olho.

## Próximos passos (se sobrar tempo)

- Trocar Web Speech API por um motor open-source (Vosk/Whisper.cpp) se o
  requisito do trabalho exigir 100% open source
- Adicionar o ESP32 como controle remoto simples (start/stop do microfone)
- Correção de distorção de lente por olho (shader de barril) pra reduzir
  desconforto visual no Cardboard
- Detecção de pessoa (ex: TensorFlow.js) pra destacar o professor na câmera
  — funcionalidade extra, não essencial pro funcionamento do sistema
# VRLibras
