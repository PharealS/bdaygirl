/* cake.js
 * Handles the cake screen: the cake rising into view, the
 * flickering candle, blowing it out, and the confetti-and-crumb
 * explosion that follows.
 *
 * Colors below were sampled directly from assets/cake.png so the
 * explosion always matches the actual artwork.
 */
(function () {
  "use strict";

  var CAKE_COLORS = [
    "#f7c2da", // frosting pink
    "#ffffff", // white icing
    "#f5efd6", // cream
    "#d9c3e0", // lavender plate
    "#c9899f", // rose shadow
    "#f2ddc2"  // sponge tan
  ];

  var FLAME_COLORS = ["#fff6cf", "#ffcf5c", "#ff8fc7"];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function start(onDone) {
    var screen = document.getElementById("cake-screen");
    var stage = document.getElementById("cake-stage");
    var flame = document.getElementById("flame");
    var hint = document.getElementById("cake-hint");
    var explosionCanvas = document.getElementById("explosion-canvas");
    var blown = false;

    screen.classList.remove("hidden");

    requestAnimationFrame(function () {
      stage.classList.add("rise");
    });

    function blowOut() {
      if (blown) return;
      blown = true;
      flame.classList.add("blown");
      flame.setAttribute("aria-label", "Candle blown out");
      hint.style.transition = "opacity 0.6s ease";
      hint.style.opacity = "0";

      setTimeout(function () {
        explode();
      }, 900);
    }

    flame.addEventListener("click", blowOut);
    flame.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        blowOut();
      }
    });

    function explode() {
      var rect = stage.getBoundingClientRect();
      var originX = rect.left + rect.width / 2;
      var originY = rect.top + rect.height * 0.45;

      screen.classList.add("fading-out");

      var ctx = explosionCanvas.getContext("2d");
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = window.innerWidth;
      var height = window.innerHeight;
      explosionCanvas.width = Math.floor(width * dpr);
      explosionCanvas.height = Math.floor(height * dpr);
      explosionCanvas.style.width = width + "px";
      explosionCanvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var particles = [];
      var count = 220;

      for (var i = 0; i < count; i++) {
        var angle = rand(0, Math.PI * 2);
        var speed = rand(2.5, 13);
        var isSpark = i < 20;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - rand(2, 6),
          size: isSpark ? rand(2, 3) : rand(3, 9),
          color: isSpark
            ? FLAME_COLORS[Math.floor(Math.random() * FLAME_COLORS.length)]
            : CAKE_COLORS[Math.floor(Math.random() * CAKE_COLORS.length)],
          rotation: rand(0, Math.PI * 2),
          spin: rand(-0.3, 0.3),
          gravity: rand(0.18, 0.32),
          drag: rand(0.985, 0.995),
          life: 0,
          maxLife: rand(55, 95)
        });
      }

      var start = performance.now();

      function frame(now) {
        ctx.clearRect(0, 0, width, height);
        var alive = false;

        for (var p = 0; p < particles.length; p++) {
          var particle = particles[p];
          if (particle.life >= particle.maxLife) continue;
          alive = true;

          particle.vx *= particle.drag;
          particle.vy *= particle.drag;
          particle.vy += particle.gravity;
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.rotation += particle.spin;
          particle.life++;

          var fade = 1 - particle.life / particle.maxLife;
          ctx.save();
          ctx.globalAlpha = Math.max(fade, 0);
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.rotation);
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          ctx.restore();
        }

        if (alive) {
          requestAnimationFrame(frame);
        } else {
          ctx.clearRect(0, 0, width, height);
          screen.classList.add("hidden");
          onDone();
        }
      }

      requestAnimationFrame(frame);
    }
  }

  window.Cake = { start: start };
})();
