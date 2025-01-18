onload = () => {
  document.body.classList.remove("container");
};

window.addEventListener("DOMContentLoaded", event => {
  console.log('Trying to play Music');
  const audio = document.querySelector("audio");
  audio.volume = 0.5;
  audio.play();
});