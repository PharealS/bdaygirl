/* main.js
 * Entry point. Decides, based on the real date, whether to show
 * the countdown, or whether the target date has already arrived
 * and the full cake-to-birthday sequence should play immediately
 * (and replay from the beginning on every visit) instead.
 */
(function () {
  "use strict";

  // Ara turns 14 at the start of August 7th, 2026 (local time).
  var BIRTHDAY = new Date(2026, 7, 7, 0, 0, 0);

  var activeCountdown = null;
  var sequenceTriggered = false;

  // Once the target date has passed, the countdown must never be
  // shown again -- but every visit should still replay the exact
  // cake -> candle -> explosion -> birthday sequence in full, as if
  // the countdown had just reached zero. So this hides the countdown
  // (it was never shown) and starts the cake straight away.
  function playSequenceWithoutCountdown() {
    sequenceTriggered = true;
    document.getElementById("countdown-screen").classList.add("hidden");
    window.Cake.start(function () {
      window.Birthday.start();
    });
  }

  // Shared by the real countdown reaching zero AND by the developer
  // test shortcut below, so both paths play the exact same sequence:
  // fade out the countdown, rise the cake, then hand off to the
  // birthday screen once the cake explodes.
  function playFullBirthdaySequence() {
    if (sequenceTriggered) return;
    sequenceTriggered = true;

    if (activeCountdown) {
      activeCountdown.stop();
    }

    var countdownScreen = document.getElementById("countdown-screen");
    countdownScreen.classList.add("fading-out");

    setTimeout(function () {
      countdownScreen.classList.add("hidden");
      window.Cake.start(function () {
        window.Birthday.start();
      });
    }, 1100);
  }

  function runCountdownSequence() {
    activeCountdown = window.Countdown.start(BIRTHDAY, {
      onComplete: playFullBirthdaySequence
    });
  }

  /* ---------------------------------------------------------------
   * Developer Test Shortcut
   * Pressing Ctrl+Shift+B instantly plays the full birthday sequence
   * (cake rise -> candle -> explosion -> fireworks -> letter) without
   * waiting for the real countdown, so the experience can be tested
   * without changing the system clock. Invisible in the UI, only
   * reachable via this exact key combo. Safe to delete this whole
   * block (and nothing else) to remove the shortcut entirely.
   * --------------------------------------------------------------- */
  document.addEventListener("keydown", function (e) {
    var isShortcut = e.ctrlKey && e.shiftKey && (e.key === "B" || e.key === "b");
    if (!isShortcut) return;
    if (sequenceTriggered) return; // already playing/played, nothing to skip
    e.preventDefault();
    playFullBirthdaySequence();
  });
  /* ------------------------- End Developer Test Shortcut ------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    window.Stars.init(document.getElementById("sky-canvas"));

    if (Date.now() >= BIRTHDAY.getTime()) {
      playSequenceWithoutCountdown();
    } else {
      runCountdownSequence();
    }
  });
})();
