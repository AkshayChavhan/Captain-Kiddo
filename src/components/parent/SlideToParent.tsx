"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";

/**
 * SlideToParent — the kid-resistant gate into the grown-up area (/parent).
 *
 * A toddler bashing the screen taps and pokes; they don't do a deliberate,
 * sustained left-to-right drag. So instead of a button (which a kid hits by
 * accident) we make the parent SLIDE a thumb the full width of a track. Only a
 * completed slide — thumb dragged past ~90% of the travel AND actually moved a
 * real distance — calls router.push to the parent dashboard. Anything less (a
 * tap, a half-hearted nudge, a random poke, even a tap that lands on the far
 * right of the pill) springs the thumb back to the start and does NOT navigate.
 *
 * DESIGN: "progress-fill" (the classic iOS slide-to-unlock). A shimmering teal
 * fill grows behind the thumb as the parent drags, and a row of chevrons points
 * the way and fades as they go — the clearest possible affordance for a
 * non-technical grown-up: "drag this, that way, until it fills up."
 *
 * Gesture handling is raw Pointer Events (onPointerDown/Move/Up/Cancel with
 * setPointerCapture). One code path covers touch (tablets — our primary device)
 * and mouse (desktop dev), and we compute the drag fraction straight from the
 * pointer's clientX vs the track's bounding rect. framer-motion drives the thumb
 * position, the growing fill, and the spring-back — never the gesture itself.
 *
 * KID-RESISTANCE ALSO COVERS THE KEYBOARD. A paired Bluetooth keyboard on the
 * tablet is a real scenario, and arrow keys are among the most-mashed by
 * toddlers. So the keyboard path mirrors the touch contract: Arrow/Home/End
 * NUDGE the value like a real ARIA slider (the standard increment semantics for
 * role="slider"), and navigation only commits once the value has been driven all
 * the way to the unlock threshold. A single stray keypress from the start can
 * never open the gate; it takes a deliberate, sustained run of presses — the
 * keyboard analogue of a full drag. Space/Enter are intentionally inert.
 *
 * SSR-safe: every DOM/width read happens inside an event handler or an effect,
 * never during render, so there is no hydration mismatch and no `window` access
 * on the server.
 */

// How far along the track (0–1) the thumb must reach to count as "unlocked".
// High enough that a casual nudge won't trip it, low enough that a parent
// doesn't have to fight the last pixel against the spring.
const UNLOCK_FRACTION = 0.9;

// A real slide also has to COVER ground. Without this, a single tap landing on
// the far-right of the pill would center the thumb under the finger at ~maxTravel
// and "unlock" with zero dragging — defeating the whole kid-resistance contract.
// Requiring more than one thumb-width of travel means only a deliberate drag
// (started left, ended right) can open the gate.
const MIN_TRAVEL_DISTANCE = 56; // px — one thumb-width of real movement

// Track geometry, in px. The thumb travels from the left padding to
// (track width − thumb width − right padding). The track's actual width is read
// live from the DOM during the gesture; these constants are only fixed sizing.
const TRACK_PADDING = 6; // breathing room around the thumb inside the pill
const THUMB_SIZE = 56; // a comfy grown-up-sized grab target

// Keyboard step, as a fraction of total travel. ArrowRight/ArrowLeft nudge the
// thumb by this much per press (standard ARIA slider increment). At 0.1 it takes
// a sustained run of ~10 presses from the start to drive the value to the unlock
// threshold — so a single stray keypress can never navigate, matching the touch
// path's "deliberate, sustained, directional" contract.
const KEYBOARD_STEP_FRACTION = 0.1;

export interface SlideToParentProps {
  /** Where a completed slide navigates to. Defaults to the parent dashboard. */
  href?: string;
  /** The instruction shown in the centre of the pill. */
  label?: string;
}

export function SlideToParent({
  href = "/parent",
  label = "Slide for grown-ups 👉",
}: SlideToParentProps = {}) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);

  // The thumb's horizontal offset in px, owned by framer-motion. Starts at 0
  // (left). We read/write it only inside event handlers and gesture animations,
  // never during render, so it's SSR-safe (no hydration mismatch).
  const x = useMotionValue(0);

  // The id of the pointer currently dragging, or null when idle. Kept in a ref
  // so the move/up handlers see the live value without forcing re-renders
  // mid-gesture (smoother drags on tablets).
  const activePointer = useRef<number | null>(null);
  // Where (clientX) the current drag started — used to measure REAL travelled
  // distance so a stationary tap can never satisfy the unlock check.
  const startClientX = useRef(0);
  // Latch so we navigate exactly once even if up + spring overlap, and so a
  // second grab during the open animation can't restart the gesture.
  const navigatedRef = useRef(false);

  // Cached max travel. Measuring clientWidth/getBoundingClientRect on every
  // pointermove forces a layout reflow per frame (the main per-frame cost on
  // tablets), so we read it ONCE on pointerdown and on resize/orientationchange
  // and reuse the cached value everywhere else.
  const maxTravelRef = useRef(0);

  // A coarse React mirror of progress (0–100) — drives aria-valuenow and the
  // swap to the "done" icon. setValueNow fires on every motion-value change, so
  // during a live drag this DOES re-render most frames; that's cheap because the
  // re-render only touches this small label/icon subtree, and the *gesture* math
  // reads refs (never state), so handlers never see a stale value.
  const [valueNow, setValueNow] = useState(0);
  const unlocked = valueNow >= UNLOCK_FRACTION * 100;

  // Normalized 0..1 progress along the available travel, derived from `x`. We
  // can't divide a motion value by a live DOM measurement inside useTransform,
  // so we maintain it as its own motion value and feed the fill / fades from it.
  const progress = useMotionValue(0);
  const fillWidth = useTransform(progress, (p) => `${p * 100}%`);
  const hintOpacity = useTransform(progress, [0, 0.55], [1, 0]);
  const chevronsOpacity = useTransform(progress, [0, 0.7], [0.9, 0]);

  // The maximum distance the thumb can travel. Read from the track and cached;
  // guarded to never go negative (e.g. before first layout the width is 0).
  const measureMaxTravel = () => {
    const track = trackRef.current;
    if (!track) return 0;
    return Math.max(0, track.clientWidth - THUMB_SIZE - TRACK_PADDING * 2);
  };

  // Keep `progress` (and the coarse React mirror) in lockstep with the thumb so
  // the fill tracks the finger exactly. Uses the cached travel (no reflow).
  useMotionValueEvent(x, "change", (latest) => {
    const travel = maxTravelRef.current;
    const p = travel > 0 ? Math.min(1, Math.max(0, latest / travel)) : 0;
    progress.set(p);
    setValueNow(Math.round(p * 100));
  });

  // On mount: measure travel and CLEAR the latch. A client-side back-navigation
  // to a cached home page could otherwise reuse this instance with navigatedRef
  // still true, leaving the slider permanently locked. We also re-clamp on
  // resize / orientationchange so a rotated tablet doesn't leave the thumb
  // overflowing past the new (smaller) maxTravel.
  useEffect(() => {
    navigatedRef.current = false;
    maxTravelRef.current = measureMaxTravel();

    const handleResize = () => {
      maxTravelRef.current = measureMaxTravel();
      // Re-clamp the thumb into the new travel zone and resync progress.
      const travel = maxTravelRef.current;
      const clamped = Math.min(Math.max(x.get(), 0), travel);
      x.set(clamped);
      progress.set(travel > 0 ? clamped / travel : 0);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      // On unmount, drop the latch so a remounted instance starts fresh.
      navigatedRef.current = false;
    };
    // x/progress are stable refs from framer-motion; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Turn a pointer's clientX into a clamped thumb offset in px. We center the
  // thumb under the finger, then clamp to the travel zone so it can't be pushed
  // past either end of the rail. Uses a live rect-left + the cached travel.
  const offsetFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const raw = clientX - rect.left - TRACK_PADDING - THUMB_SIZE / 2;
    return Math.min(Math.max(raw, 0), maxTravelRef.current);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Bail if a navigation is already underway (the open spring may still be
    // running with valueNow < 90, so we latch on navigatedRef, not `unlocked`).
    if (navigatedRef.current) return;
    // Ignore non-primary buttons on mouse (e.g. a right-click) so a desktop
    // context-menu click doesn't begin a gesture. Touch/pen report button 0 on
    // the initiating press, so this never blocks the primary (tablet) path.
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Multi-touch guard: if a finger is already driving the slide, IGNORE any
    // further pointers instead of overwriting the active one. A toddler slapping
    // the pill with a whole hand can't have a later finger hijack or assist an
    // in-progress drag — only the single first pointer drives the gesture.
    if (activePointer.current !== null) return;

    // Measure the travel once for this whole drag — no per-frame reflow.
    maxTravelRef.current = measureMaxTravel();
    startClientX.current = e.clientX;
    // Capture the pointer so move/up keep firing even if the finger strays off
    // the thumb (little — and big — hands wander off the rail).
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    // Cancel any in-flight spring-back so the thumb jumps straight to the finger.
    x.stop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId || navigatedRef.current) return;
    x.set(offsetFromClientX(e.clientX));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;

    const travel = maxTravelRef.current;
    // Two gates must BOTH pass to open:
    //   1. the thumb reached the far end (fraction >= UNLOCK_FRACTION), and
    //   2. the pointer actually moved a real distance (not a far-right tap).
    // A tap leaves both at ~0, so we fall through to spring-back — exactly the
    // behaviour we want for a toddler poking the screen.
    const fraction = travel > 0 ? x.get() / travel : 0;
    const travelledDistance = Math.abs(e.clientX - startClientX.current);

    if (
      travel > 0 &&
      fraction >= UNLOCK_FRACTION &&
      travelledDistance > MIN_TRAVEL_DISTANCE
    ) {
      open(travel);
    } else {
      reset();
    }
  };

  // An OS gesture / interruption fired pointercancel. This is NEVER a completed
  // slide — always spring back. (Routing this through pointerup could navigate
  // if the thumb happened to be past 90% when the OS yanked the gesture away.)
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    reset();
  };

  // Drag completed past the threshold: snap the thumb fully open, then navigate.
  const open = (travel: number) => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    animate(x, travel, { type: "spring", stiffness: 400, damping: 40 });
    router.push(href);
  };

  // Released too early (or just tapped): spring the thumb back home. This is the
  // "you didn't make it" gesture — the reason a stray poke can't open the gate.
  const reset = () => {
    animate(x, 0, { type: "spring", stiffness: 500, damping: 35 });
  };

  // Drive the value by a fraction of total travel (the keyboard "nudge"). Mirrors
  // the touch contract: it only COMMITS (open) once the value has been pushed all
  // the way to the unlock threshold; otherwise it springs the thumb to the new
  // intermediate position. So no single nudge from the start can ever navigate.
  const nudge = (deltaFraction: number) => {
    if (navigatedRef.current) return;
    maxTravelRef.current = measureMaxTravel();
    const travel = maxTravelRef.current;
    if (travel <= 0) return;
    const current = x.get() / travel;
    const next = Math.min(1, Math.max(0, current + deltaFraction));
    if (next >= UNLOCK_FRACTION) {
      open(travel);
    } else {
      animate(x, next * travel, { type: "spring", stiffness: 500, damping: 35 });
    }
  };

  // Keyboard fallback (touch is primary, but keep it operable AND consistent
  // with role="slider"). Arrow/Home/End behave like a STANDARD slider: they
  // NUDGE the value, they don't jump-and-navigate. We commit only when the value
  // has been driven to the unlock threshold — so the keyboard path demands the
  // same "deliberate, sustained, directional" effort as a full drag, and a
  // single stray ArrowRight from the start can never open the gate.
  //
  // ArrowRight/Up increment, ArrowLeft/Down decrement, Home -> start, End ->
  // far end. End is an explicit "jump to maximum" intent (not a reflex key the
  // way ArrowRight is), so it lands at the threshold and commits. Space/Enter
  // stay inert: a kid mashing a paired keyboard shouldn't fall into the gate on
  // a single activation key.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (navigatedRef.current) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        nudge(KEYBOARD_STEP_FRACTION);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        nudge(-KEYBOARD_STEP_FRACTION);
        break;
      case "End":
        e.preventDefault();
        nudge(1); // explicit jump to maximum -> reaches the threshold -> commits
        break;
      case "Home":
        e.preventDefault();
        reset();
        break;
      // Space/Enter and everything else: intentionally no-op.
      default:
        break;
    }
  };

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      {/* The pill track. role="slider" + aria-* makes the gesture screen-reader
          operable; Arrow/Home/End adjust aria-valuenow incrementally (standard
          slider semantics) and only a value driven to the far end commits, so
          the announced role and the actual behaviour agree. */}
      <div
        ref={trackRef}
        role="slider"
        aria-label="Slide to open the grown-ups area"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow}
        aria-valuetext={unlocked ? "Opening grown-ups area" : "Locked"}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        // touchAction:none keeps the browser from stealing the horizontal drag
        // for scroll/zoom on touch devices, so our pointer math stays accurate
        // even when this pill lives inside a vertically scrolling <main>.
        className="relative flex w-full select-none items-center overflow-hidden rounded-blob bg-kiddo-purple/15 shadow-inner focus:outline-none focus:ring-4 focus:ring-kiddo-purple focus:ring-offset-2"
        style={{
          height: THUMB_SIZE + TRACK_PADDING * 2,
          padding: TRACK_PADDING,
          touchAction: "none",
        }}
      >
        {/* Shimmering progress fill — grows behind the thumb as you slide. The
            sheen only animates while there is fill to shimmer (progress > 0), so
            an idle pill costs no battery/CPU on the tablet. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1.5 left-1.5 overflow-hidden rounded-blob bg-gradient-to-r from-kiddo-teal to-kiddo-green"
          style={{ width: fillWidth }}
        >
          {valueNow > 0 && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-white/0 via-white/40 to-white/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.div>

        {/* Instruction label, centered; fades out as the fill grows. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center pr-6 text-center text-base font-bold text-kiddo-purple"
          style={{ opacity: hintOpacity }}
        >
          {label}
        </motion.span>

        {/* Chevrons pointing the way; fade out as you go. */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute right-5 flex items-center text-2xl font-bold text-kiddo-purple"
          style={{ opacity: chevronsOpacity }}
        >
          <span className="animate-pulse">›</span>
          <span className="animate-pulse [animation-delay:150ms]">›</span>
          <span className="animate-pulse [animation-delay:300ms]">›</span>
        </motion.span>

        {/* The draggable thumb. Position is driven by the `x` motion value, so
            dragging the thumb itself never round-trips through React layout.
            Pointer events live on the TRACK, not here, so a finger that slips off
            the thumb still drives the slide and the full pill is the hit target —
            there's no tiny 56px area to miss. The lock/family emoji is purely
            decorative (aria-hidden) so a screen reader hears only the slider. */}
        <motion.div
          aria-hidden="true"
          style={{ x, width: THUMB_SIZE, height: THUMB_SIZE }}
          className="pointer-events-none relative z-10 flex shrink-0 items-center justify-center rounded-full bg-white text-3xl shadow-lg"
        >
          {unlocked ? "👨‍👩‍👧" : "🔒"}
        </motion.div>
      </div>

      {/* Tiny helper line — reinforces that a tap won't get a kid in. */}
      <motion.p
        aria-hidden="true"
        className="pointer-events-none text-sm text-gray-500"
        style={{ opacity: hintOpacity }}
      >
        Grown-ups: drag the lock all the way over 👉
      </motion.p>
    </div>
  );
}
