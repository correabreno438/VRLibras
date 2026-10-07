import { VLibrasPlayer } from "vlibras-player-webjs";

const statusEl = document.getElementById("status");
const captionEl = document.getElementById("captionBar");
const micBtn = document.getElementById("micBtn");
const vlibrasContainer = document.getElementById("vlibras-container");
const stageEl = document.getElementById("stage");
const toggleStereoBtn = document.getElementById("toggleStereoBtn");
const videoLeft = document.querySelector("#eyeLeft video");
const videoRight = document.querySelector("#eyeRight video");

// ---------------------------------------------------------------
// 1) Câmera do celular (passthrough)
// ---------------------------------------------------------------
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    videoLeft.srcObject = stream;
    videoRight.srcObject = stream;
    statusEl.textContent = "Câmera ativa.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Não foi possível acessar a câmera: " + err.message;
  }
}

startCamera();

toggleStereoBtn.addEventListener("click", () => {
  const isStereo = stageEl.classList.contains("stereo");
  stageEl.classList.toggle("stereo", !isStereo);
  stageEl.classList.toggle("mono", isStereo);
  toggleStereoBtn.textContent = isStereo ? "🥽 Modo VR" : "🥽 Sair do VR";
});

// ---------------------------------------------------------------
// 2) VLibras Player
// ---------------------------------------------------------------
function melhorarNitidez() {
  const canvas = vlibrasContainer.querySelector("canvas");
  if (!canvas) return;
  const escala = Math.max(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(vlibrasContainer.clientWidth * escala);
  canvas.height = Math.round(vlibrasContainer.clientHeight * escala);
}

let playerPronto = false;
let fraseEsperando = null; // guarda a última frase, caso o player ainda não esteja pronto

function enviarTraducao(texto) {
  try {
    player.translate(texto);
    console.log("[VLibras] Enviado para tradução:", texto);
  } catch (err) {
    console.error("[VLibras] Erro ao traduzir:", err);
    statusEl.textContent = "Erro ao traduzir para LIBRAS: " + err.message;
  }
}

const player = new VLibrasPlayer({
  targetPath: "/assets/vlibras",
  onLoad: () => {
    console.log("[VLibras] Avatar pronto.");
    playerPronto = true;
    melhorarNitidez();

    // Se alguma frase ficou esperando, manda agora
    if (fraseEsperando) {
      const texto = fraseEsperando;
      fraseEsperando = null;
      enviarTraducao(texto);
    }
  },
});

player.load(vlibrasContainer);
setTimeout(melhorarNitidez, 2000);

function traduzirParaLibras(texto) {
  if (!texto || !texto.trim()) return;
  captionEl.textContent = texto;

  if (!playerPronto) {
    console.warn("[VLibras] Avatar ainda carregando — frase guardada, será enviada assim que terminar.");
    fraseEsperando = texto; // substitui a anterior, só guarda a mais recente
    return;
  }

  enviarTraducao(texto);
}

// ---------------------------------------------------------------
// 3) Reconhecimento de voz (Web Speech API)
// ---------------------------------------------------------------
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isListening = false;

if (!SpeechRecognition) {
  statusEl.textContent = "Voz não suportada. Use o Google Chrome.";
} else {
  recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.continuous = true;
  recognition.interimResults = true;

  let silenceTimer = null;
  let ultimoParcial = "";

  // ---- Sensores de diagnóstico (mostram onde o processo trava) ----
  recognition.onaudiostart = () => {
    console.log("[Voz] Áudio começou a ser captado.");
    statusEl.textContent = "Captando áudio...";
  };
  recognition.onsoundstart = () => {
    console.log("[Voz] Som detectado.");
    statusEl.textContent = "Som detectado...";
  };
  recognition.onspeechstart = () => {
    console.log("[Voz] Fala detectada.");
    statusEl.textContent = "Fala detectada, reconhecendo...";
  };
  recognition.onspeechend = () => {
    console.log("[Voz] Fala terminou.");
  };

  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    console.log("[Voz] parcial:", interimTranscript, "| final:", finalTranscript);

    if (interimTranscript) {
      captionEl.textContent = interimTranscript;
      ultimoParcial = interimTranscript;
    }

    if (finalTranscript) {
      clearTimeout(silenceTimer);
      ultimoParcial = "";
      traduzirParaLibras(finalTranscript);
      return;
    }

    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      if (ultimoParcial) {
        traduzirParaLibras(ultimoParcial);
        ultimoParcial = "";
      }
    }, 1500);
  };

  recognition.onerror = (event) => {
    console.error("[Voz] Erro:", event.error);
    statusEl.textContent = "Erro no microfone: " + event.error;
  };

  recognition.onend = () => {
    console.log("[Voz] Sessão de reconhecimento terminou.");
    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.error("[Voz] Falha ao reiniciar:", e);
      }
    }
  };
}

// ---------------------------------------------------------------
// 4) Botão de microfone
// ---------------------------------------------------------------
micBtn.addEventListener("click", () => {
  if (!recognition) return;

  if (!isListening) {
    try {
      recognition.start();
      isListening = true;
      micBtn.classList.add("listening");
      statusEl.textContent = "Iniciando microfone...";
    } catch (e) {
      console.error("[Voz] Falha ao iniciar:", e);
      statusEl.textContent = "Erro ao iniciar microfone: " + e.message;
    }
  } else {
    isListening = false;
    recognition.stop();
    micBtn.classList.remove("listening");
    statusEl.textContent = "Microfone pausado.";
  }
});

// Teste manual: force o avatar a sinalizar sem precisar falar.
// Já confirmamos que funciona — pode apagar esta linha quando quiser.
// setTimeout(() => traduzirParaLibras("Bom dia, professor."), 4000);