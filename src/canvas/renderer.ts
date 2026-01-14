/**
 * Canvas Renderer
 *
 * Core rendering engine using Canvas API.
 * DPI-safe, viewport-correct, React-independent.
 */

import type { ViewportState, RenderCallback, CanvasSize } from './types'
import { Viewport } from './viewport'

export class Renderer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private viewport: Viewport
  private rafId: number | null = null
  private callbacks = new Set<RenderCallback>()
  private dpr = 1
  private resizeHandler: () => void

  constructor(viewport?: Viewport) {
    this.viewport = viewport ?? new Viewport()
    this.resizeHandler = this.handleResize.bind(this)
  }

  /* ------------------------------------------------------------------ */
  /* Lifecycle                                                          */
  /* ------------------------------------------------------------------ */

  init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('2D context not available')
    this.ctx = ctx

    this.dpr = window.devicePixelRatio || 1

    this.handleResize()
    window.addEventListener('resize', this.resizeHandler)

    this.start()
  }

  destroy(): void {
    this.stop()
    window.removeEventListener('resize', this.resizeHandler)
    this.callbacks.clear()
    this.canvas = null
    this.ctx = null
  }

  /* ------------------------------------------------------------------ */

  getViewport(): Viewport {
    return this.viewport
  }

  getCanvasSize(): CanvasSize {
    if (!this.canvas) return { width: 0, height: 0 }
    return {
      width: this.canvas.clientWidth,
      height: this.canvas.clientHeight,
    }
  }

  /* ------------------------------------------------------------------ */
  /* Callbacks                                                          */
  /* ------------------------------------------------------------------ */

  addRenderCallback(cb: RenderCallback): () => void {
    this.callbacks.add(cb)
    return () => this.callbacks.delete(cb)
  }

  /* ------------------------------------------------------------------ */
  /* Resize / DPI                                                       */
  /* ------------------------------------------------------------------ */

  private handleResize(): void {
    if (!this.canvas || !this.ctx) return

    const { width, height } = this.canvas.getBoundingClientRect()

    this.canvas.width = Math.floor(width * this.dpr)
    this.canvas.height = Math.floor(height * this.dpr)
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
  }

  /* ------------------------------------------------------------------ */
  /* Render Loop                                                        */
  /* ------------------------------------------------------------------ */

  private start(): void {
    const loop = () => {
      this.render()
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  private stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId)
    this.rafId = null
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                          */
  /* ------------------------------------------------------------------ */

  private render(): void {
    if (!this.ctx || !this.canvas) return

    const ctx = this.ctx
    const { width, height } = this.getCanvasSize()

    /* ---------- RESET ---------- */
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    /* ---------- DPI SCALE ---------- */
    ctx.scale(this.dpr, this.dpr)

    /* ---------- CLEAR ---------- */
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    /* ---------- VIEWPORT ---------- */
    const vp = this.viewport.getTransform()
    ctx.transform(vp.a, vp.b, vp.c, vp.d, vp.e, vp.f)

    /* ---------- DEBUG GRID (TEMP) ---------- */
    this.drawDebugGrid(ctx)

    /* ---------- SHAPES ---------- */
    for (const cb of this.callbacks) {
      ctx.save()
      cb(ctx)
      ctx.restore()
    }
  }

  /* ------------------------------------------------------------------ */
  /* Debug                                                              */
  /* ------------------------------------------------------------------ */

  private drawDebugGrid(ctx: CanvasRenderingContext2D): void {
    const size = 1000
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1 / this.viewport.getZoom()

    for (let x = -size; x <= size; x += 100) {
      ctx.beginPath()
      ctx.moveTo(x, -size)
      ctx.lineTo(x, size)
      ctx.stroke()
    }

    for (let y = -size; y <= size; y += 100) {
      ctx.beginPath()
      ctx.moveTo(-size, y)
      ctx.lineTo(size, y)
      ctx.stroke()
    }

    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(0, 0, 6 / this.viewport.getZoom(), 0, Math.PI * 2)
    ctx.fill()
  }

  /* ------------------------------------------------------------------ */

  updateViewport(state: Partial<ViewportState>): void {
    this.viewport.setState(state)
  }
}
