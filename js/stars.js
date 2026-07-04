/* stars.js
 * Renders a soft pixel-art night sky: twinkling stars plus
 * occasional shooting stars. Runs continuously for the whole
 * lifetime of the page, behind every screen.
 */
(function () {
  "use strict";

  function initStars(canvas) {
    var ctx = canvas.getContext("2d");
    var stars = [];
    var shootingStars = [];
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nextShootAt = 0;
    var running = true;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function buildStars() {
      var count = Math.round((width * height) / 6000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.85,
          size: Math.random() < 0.85 ? 1 : 2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 1.4,
          baseAlpha: 0.35 + Math.random() * 0.5
        });
      }
    }

    function scheduleNextShoot(now) {
      nextShootAt = now + 3500 + Math.random() * 6000;
    }

    function spawnShootingStar() {
      var startX = Math.random() * width * 0.6;
      var startY = Math.random() * height * 0.35;
      var angle = (Math.PI / 5) + Math.random() * (Math.PI / 10);
      var speed = 9 + Math.random() * 5;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 20
      });
    }

    function draw(now) {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var twinkle = 0.5 + 0.5 * Math.sin(now * 0.001 * s.speed + s.phase);
        var alpha = s.baseAlpha * (0.5 + twinkle * 0.5);
        ctx.fillStyle = "rgba(255, 240, 250, " + alpha.toFixed(3) + ")";
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size);
      }

      if (now > nextShootAt) {
        spawnShootingStar();
        scheduleNextShoot(now);
      }

      for (var j = shootingStars.length - 1; j >= 0; j--) {
        var sh = shootingStars[j];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.life++;

        var t = sh.life / sh.maxLife;
        var fade = 1 - t;
        if (fade > 0) {
          var tailX = sh.x - sh.vx * 3.2;
          var tailY = sh.y - sh.vy * 3.2;
          var grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
          grad.addColorStop(0, "rgba(255, 255, 255, " + fade.toFixed(3) + ")");
          grad.addColorStop(1, "rgba(255, 179, 217, 0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sh.x, sh.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        }

        if (sh.life >= sh.maxLife || sh.x > width + 50 || sh.y > height + 50) {
          shootingStars.splice(j, 1);
        }
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    scheduleNextShoot(performance.now());
    requestAnimationFrame(draw);

    return {
      stop: function () {
        running = false;
      }
    };
  }

  window.Stars = { init: initStars };
})();
