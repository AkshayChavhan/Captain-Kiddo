"use client";

import { useCallback, useEffect, useRef } from "react";

/** A point on the canvas, in canvas coordinates. */
export interface TracePoint {
  x: number;
  y: number;
}

/**
 * TraceCanvas — captures a finger/mouse drag as a path of points and draws it.
 *
 * Uses POINTER events so it works for touch (finger) and mouse alike — the same
 * choice as the drag-drop quiz, and the right call for a kids' touch app.
 *
 * It's "uncontrolled drawing": it renders the live stroke itself, and reports the
 * path via callbacks. The next tickets add the letter guide (trace02) and on-path
 * detection (trace03); this ticket is just the capture + draw surface.
 *
 * Props:
 *  - onStrokeStart: finger went down (begin a new attempt)
 *  - onStrokeMove:  called with each new point (and the full path so far)
 *  - onStrokeEnd:   finger lifted (the attempt's full path)
 */
export function TraceCanvas({
  width = 320,
  height = 320,
  strokeColor = "#6C5CE7",
  strokeWidth = 18,
  onStrokeStart,
  onStrokeMove,
  onStrokeEnd,
  children,
}: Readonly<{
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  onStrokeStart?: () => void;
  onStrokeMove?: (point: TracePoint, path: TracePoint[]) => void;
  onStrokeEnd?: (path: TracePoint[]) => void;
  /** Optional overlay (e.g. the letter guide) rendered above the canvas. */
  children?: React.ReactNode;
}>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const pathRef = useRef<TracePoint[]>([]);

  /** Convert a pointer event to canvas-space coordinates. */
  const toPoint = useCallback((e: React.PointerEvent): TracePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // Scale screen coords to the canvas's internal pixel size.
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  /** Clear the drawing surface. */
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Set up the stroke style once (and on style changes).
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth]);

  const handleDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId); // keep events even if finger strays
    drawingRef.current = true;
    pathRef.current = [];
    clear();
    const p = toPoint(e);
    pathRef.current.push(p);
    onStrokeStart?.();
    onStrokeMove?.(p, pathRef.current);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    const p = toPoint(e);
    const path = pathRef.current;
    const prev = path[path.length - 1];
    path.push(p);

    // Draw the new segment.
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    onStrokeMove?.(p, path);
  };

  const handleUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    onStrokeEnd?.(pathRef.current);
  };

  return (
    <div className="relative" style={{ width, height }}>
      {/* The guide/overlay (letter outline) sits above the canvas, non-interactive. */}
      {children && (
        <div className="pointer-events-none absolute inset-0">{children}</div>
      )}

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        className="touch-none rounded-blob bg-white shadow-inner"
        style={{ width, height }}
      />
    </div>
  );
}
