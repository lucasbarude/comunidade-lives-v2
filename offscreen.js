

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "PLAY_SOUND") {
    const audio = document.getElementById("notify-audio");
    audio.currentTime = 0;
    audio.play().catch((err) => console.error("Canais: erro ao tocar som", err));
  }
});
