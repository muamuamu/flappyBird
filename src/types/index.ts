export interface CtxObject {
  ready: () => {}
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}