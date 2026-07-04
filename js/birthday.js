/* birthday.js
 * Everything that happens once the birthday has arrived: the
 * fireworks display, the typewriter message, the gift button,
 * and the envelope/letter overlay with music playback.
 */
(function () {
  "use strict";

  var FIREWORK_COLORS = ["#ffb3d9", "#ffffff", "#c9a8f7"];
  var MESSAGE = "I made something for you.";

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function initFireworks(canvas) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var particles = [];
    var running = true;
    var nextBurstAt = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function scheduleNextBurst(now) {
      nextBurstAt = now + rand(2000, 5000);
    }

    function burst() {
      var cx = rand(width * 0.15, width * 0.85);
      var cy = rand(height * 0.15, height * 0.5);
      var color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      var count = Math.floor(rand(28, 42));

      for (var i = 0; i < count; i++) {
        var angle = (Math.PI * 2 * i) / count + rand(-0.15, 0.15);
        var speed = rand(1.8, 4.2);
        particles.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          life: 0,
          maxLife: rand(50, 80),
          size: rand(2, 3)
        });
      }
    }

    function frame(now) {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      if (now > nextBurstAt) {
        burst();
        scheduleNextBurst(now);
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vy += 0.02;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        var fade = 1 - p.life / p.maxLife;
        if (fade <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    scheduleNextBurst(performance.now() + 400);
    requestAnimationFrame(frame);

    return {
      stop: function () {
        running = false;
      }
    };
  }

  function typewrite(el, text, onDone) {
    var i = 0;
    el.textContent = "";
    el.classList.remove("done");

    function step() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(step, 45);
      } else {
        el.classList.add("done");
        onDone();
      }
    }

    setTimeout(step, 500);
  }

  function setupLetter() {
    var overlay = document.getElementById("letter-overlay");
    var envelope = document.getElementById("envelope");
    var giftButton = document.getElementById("gift-button");
    var closeButton = document.getElementById("close-letter");
    var music = document.getElementById("bg-music");
    var musicStarted = false;

    giftButton.addEventListener("click", function () {
      overlay.classList.remove("hidden");

      if (!musicStarted) {
        musicStarted = true;
        var playPromise = music.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            /* Autoplay was blocked; a later interaction with the
               page will allow playback to begin naturally. */
          });
        }
      }

      requestAnimationFrame(function () {
        setTimeout(function () {
          envelope.classList.add("open");
        }, 120);
      });
    });

    closeButton.addEventListener("click", function () {
      envelope.classList.remove("open");
      setTimeout(function () {
        overlay.classList.add("hidden");
      }, 500);
    });
  }

  function start() {
    var screen = document.getElementById("birthday-screen");
    var fireworksCanvas = document.getElementById("fireworks-canvas");
    var typewriterEl = document.getElementById("typewriter");
    var giftButton = document.getElementById("gift-button");

    screen.classList.remove("hidden");
    initFireworks(fireworksCanvas);
    setupLetter();

    typewrite(typewriterEl, MESSAGE, function () {
      giftButton.classList.remove("hidden");
      requestAnimationFrame(function () {
        giftButton.classList.add("show");
      });
    });
  }

  window.Birthday = { start: start };
})();
