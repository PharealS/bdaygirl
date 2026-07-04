/* countdown.js
 * Drives the days/hours/minutes/seconds countdown display and
 * fires a callback the moment the target date is reached.
 */
(function () {
  "use strict";

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function start(targetDate, options) {
    options = options || {};
    var onComplete = options.onComplete || function () {};

    var els = {
      days: document.getElementById("cd-days"),
      hours: document.getElementById("cd-hours"),
      minutes: document.getElementById("cd-minutes"),
      seconds: document.getElementById("cd-seconds")
    };

    var last = { days: null, hours: null, minutes: null, seconds: null };
    var timerId = null;

    function animateChange(el) {
      el.classList.remove("tick");
      // force reflow so the animation can retrigger
      void el.offsetWidth;
      el.classList.add("tick");
    }

    function setValue(el, key, value) {
      var text = pad(value);
      if (el.textContent !== text) {
        el.textContent = text;
        if (last[key] !== null) {
          animateChange(el);
        }
      }
      last[key] = value;
    }

    function tick() {
      var now = Date.now();
      var diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setValue(els.days, "days", 0);
        setValue(els.hours, "hours", 0);
        setValue(els.minutes, "minutes", 0);
        setValue(els.seconds, "seconds", 0);
        clearInterval(timerId);
        onComplete();
        return;
      }

      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      setValue(els.days, "days", days);
      setValue(els.hours, "hours", hours);
      setValue(els.minutes, "minutes", minutes);
      setValue(els.seconds, "seconds", seconds);
    }

    tick();
    timerId = setInterval(tick, 1000);

    return {
      stop: function () {
        clearInterval(timerId);
      }
    };
  }

  window.Countdown = { start: start };
})();
