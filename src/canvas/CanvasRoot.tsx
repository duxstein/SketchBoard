/**
 * Canvas Root Component
 *
 * Lifecycle root for the entire canvas system.
 * Wires together renderer, viewport, tools, and stores.
 */

import { useEffect, useRef } from 'react';
import { Renderer } from './renderer';
import { Viewport } from './viewport';
import { ToolManager } from '@/tools/manager';
import { initializeTools } from '@/tools/registry';
import { initializeDefaultTool } from '@/store/tool';
import { useCanvasStore } from '@/store/canvas';
import { renderShapes } from './shapeRenderer';
import type { Shape, Point } from './types';
import { generateUserId } from '@/utils/id';

export default function CanvasRoot() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const rendererRef = useRef<Renderer | null>(null);
  const viewportRef = useRef<Viewport | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);

  // Imperative Zustand access (NO React subscription)
  const canvasStore = useCanvasStore.getState();

  const inputRef = useRef<{
    isPanning: boolean;
    lastPanPoint: Point | null;
  }>({
    isPanning: false,
    lastPanPoint: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ------------------------------------------------------------------ */
    /* Init                                                               */
    /* ------------------------------------------------------------------ */

    initializeTools();
    initializeDefaultTool();

    const viewport = new Viewport({ x: 0, y: 0, zoom: 1 });
    viewportRef.current = viewport;

    const renderer = new Renderer(viewport);
    renderer.init(canvas);
    rendererRef.current = renderer;

    const toolManager = new ToolManager(viewport, generateUserId());
    toolManagerRef.current = toolManager;

    const unregisterShapes = renderer.addRenderCallback(ctx => {
      const shapes: Shape[] = canvasStore.getShapesArray();
      renderShapes(
        ctx,
        viewport,
        shapes,
        renderer.getCanvasSize(),
        true
      );
    });

    /* ------------------------------------------------------------------ */
    /* Helpers                                                            */
    /* ------------------------------------------------------------------ */

    const getScreenPoint = (e: PointerEvent | WheelEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const applyToolResult = (result: any) => {
        if (!result) return;
      
        console.log('[CanvasRoot] applyToolResult:', result.type);
      
        if (result.type === 'create' || result.type === 'update') {
          canvasStore.setShape(result.shape);
        } else if (result.type === 'delete') {
          canvasStore.deleteShape(result.shapeId);
        }
      };
      
      

    /* ------------------------------------------------------------------ */
    /* Events                                                             */
    /* ------------------------------------------------------------------ */

    const onPointerDown = (e: PointerEvent) => {
      const pt = getScreenPoint(e);
      const input = inputRef.current;
      const tm = toolManagerRef.current;
      const vp = viewportRef.current;
      const r = rendererRef.current;
      if (!tm || !vp || !r) return;

      if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
        input.isPanning = true;
        input.lastPanPoint = pt;
        canvas.style.cursor = 'grabbing';
        canvas.setPointerCapture(e.pointerId);
        return;
      }

      if (e.button === 0) {
        const res = tm.handlePointerDown(pt.x, pt.y, e);
        console.log('[CanvasRoot] pointerDown result:', res);
        Promise.resolve(res).then(applyToolResult);
        canvas.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const pt = getScreenPoint(e);
      const input = inputRef.current;
      const tm = toolManagerRef.current;
      const vp = viewportRef.current;
      const r = rendererRef.current;
      if (!tm || !vp || !r) return;

      if (input.isPanning && input.lastPanPoint) {
        vp.pan(
          pt.x - input.lastPanPoint.x,
          pt.y - input.lastPanPoint.y
        );
        input.lastPanPoint = pt;
        
        return;
      }

      if (e.buttons === 1) {
        console.log(
          '[CanvasRoot] screen→world:',
          vp.screenToWorld(pt)
        );

        const res = tm.handlePointerMove(pt.x, pt.y, e);
        console.log('[CanvasRoot] pointerMove result:', res);
        Promise.resolve(res).then(applyToolResult);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const pt = getScreenPoint(e);
      const input = inputRef.current;
      const tm = toolManagerRef.current;
      const r = rendererRef.current;
      if (!tm || !r) return;

      if (input.isPanning) {
        input.isPanning = false;
        input.lastPanPoint = null;
        canvas.style.cursor = 'default';
        canvas.releasePointerCapture(e.pointerId);
        return;
      }

      const res = tm.handlePointerUp(pt.x, pt.y, e);
      console.log('[CanvasRoot] pointerUp result:', res);
      Promise.resolve(res).then(applyToolResult);
      canvas.releasePointerCapture(e.pointerId);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const pt = getScreenPoint(e);
      const vp = viewportRef.current;
      const r = rendererRef.current;
      if (!vp || !r) return;

      const zoom = vp.getZoom();
      const nextZoom = e.deltaY > 0 ? zoom * 0.9 : zoom * 1.1;
      vp.zoomToPoint(Math.max(0.1, Math.min(10, nextZoom)), pt);
      
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tm = toolManagerRef.current;
      if (!tm) return;
      const res = tm.handleKeyDown(e);
      console.log('[CanvasRoot] keyDown result:', res);
      Promise.resolve(res).then(applyToolResult);
    };

    /* ------------------------------------------------------------------ */
    /* Register                                                          */
    /* ------------------------------------------------------------------ */

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    /* ------------------------------------------------------------------ */
    /* Cleanup                                                           */
    /* ------------------------------------------------------------------ */

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);

      unregisterShapes();
      renderer.destroy();

      rendererRef.current = null;
      viewportRef.current = null;
      toolManagerRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
