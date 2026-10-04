"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, ZoomIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

/** Edge length of the exported square, in device pixels. */
const OUTPUT_SIZE = 768;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

type Offset = { x: number; y: number };

type ImageCropperProps = {
  /**
   * The file the user picked. The parent renders this component only when it
   * has one, and keys it by the file — so every pick gets a fresh mount with
   * fresh zoom and offset, and none of that has to be reset by hand.
   */
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
  title?: string;
  description?: string;
};

/**
 * Square crop with drag-to-reposition and a zoom slider.
 *
 * Everything is drawn from one `cover`-fitted baseline: at zoom 1 the image
 * exactly fills the square, so there is never a gap to drag into, and offsets
 * are clamped to the overflow at the current zoom. The same maths runs for the
 * preview and for the canvas export, which is what keeps "what you see" and
 * "what you get" identical.
 *
 * Exported as JPEG — a photograph re-encoded as PNG is several times larger
 * for no visible gain, and the 5 MB upload limit is real.
 */
export function ImageCropper({
  file,
  onCancel,
  onCropped,
  title = "Adjust your photo",
  description = "Drag to reposition, and zoom until it looks right. The square is what everyone else sees.",
}: ImageCropperProps) {
  /**
   * The decoded file and the URL it was decoded from, published together once
   * the image is ready.
   *
   * Creating the URL and revoking it must live in the *same* effect. A lazy
   * `useState` initialiser looks tidier, but in development React mounts,
   * tears down and remounts: the cleanup would revoke a URL the second run
   * then tries to load, and the image silently fails with ERR_FILE_NOT_FOUND.
   */
  const [source, setSource] = useState<{
    url: string;
    image: HTMLImageElement;
  } | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isExporting, setIsExporting] = useState(false);

  const [viewport, setViewport] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const dragStart = useRef<{ x: number; y: number; offset: Offset } | null>(
    null,
  );

  /**
   * Measure the square with a ResizeObserver attached through a *callback
   * ref*, not an effect.
   *
   * An effect with `[]` deps binds the observer to whichever node existed on
   * the first commit. Radix renders dialog content through a portal and can
   * swap that node, leaving the observer watching a detached element that
   * never resizes again — so the measurement stayed 0 and the image, sized
   * from it, never appeared. A callback ref re-runs whenever the node changes,
   * which is exactly the guarantee this needs.
   */
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();

    if (!node) {
      observerRef.current = null;
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      setViewport(entry.contentRect.width);
    });

    observer.observe(node);
    observerRef.current = observer;
  }, []);

  /**
   * Decode the file so its natural dimensions are known. setState happens in
   * the load callback — an external system reporting back — not in the effect
   * body, so this does not trip the cascading-render rule.
   */
  useEffect(() => {
    const url = URL.createObjectURL(file);

    const element = new window.Image();
    element.onload = () => setSource({ url, image: element });
    element.src = url;

    // Revoking on unmount is what keeps a long editing session from holding
    // every previously picked file in memory.
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const image = source?.image ?? null;

  /**
   * How far the scaled image overflows the square, per axis. Offsets live
   * within ±half of that, which is what stops the image being dragged off.
   */
  /** Scale at which the image exactly covers the square, before zoom. */
  const cover =
    image && viewport
      ? Math.max(viewport / image.naturalWidth, viewport / image.naturalHeight)
      : 0;

  const clamp = useCallback(
    (next: Offset): Offset => {
      if (!image || !viewport) return next;

      const scale = cover * zoom;
      const limitX = Math.max(0, (image.naturalWidth * scale - viewport) / 2);
      const limitY = Math.max(0, (image.naturalHeight * scale - viewport) / 2);

      return {
        x: Math.min(limitX, Math.max(-limitX, next.x)),
        y: Math.min(limitY, Math.max(-limitY, next.y)),
      };
    },
    [image, viewport, cover, zoom],
  );

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (!image) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, offset };
  }

  function onDrag(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStart.current;
    if (!start) return;

    setOffset(
      clamp({
        x: start.offset.x + (event.clientX - start.x),
        y: start.offset.y + (event.clientY - start.y),
      }),
    );
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragStart.current = null;
  }

  /** Nudge with the keyboard, so this is not a mouse-only control. */
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 24 : 8;
    const moves: Record<string, Offset> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };

    const move = moves[event.key];
    if (!move) return;

    event.preventDefault();
    setOffset((current) =>
      clamp({ x: current.x + move.x, y: current.y + move.y }),
    );
  }

  async function exportCrop() {
    if (!image || !viewport) return;

    setIsExporting(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");

      // The preview is `viewport` wide; the export is OUTPUT_SIZE wide. Scale
      // the same geometry up by that ratio and the two cannot disagree.
      const ratio = OUTPUT_SIZE / viewport;
      const exportCover = Math.max(
        OUTPUT_SIZE / image.naturalWidth,
        OUTPUT_SIZE / image.naturalHeight,
      );
      const scale = exportCover * zoom;

      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;

      context.imageSmoothingQuality = "high";
      context.drawImage(
        image,
        (OUTPUT_SIZE - drawWidth) / 2 + offset.x * ratio,
        (OUTPUT_SIZE - drawHeight) / 2 + offset.y * ratio,
        drawWidth,
        drawHeight,
      );

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) throw new Error("Could not read the cropped image.");

      const name = file.name.replace(/\.[^.]+$/, "") || "photo";
      onCropped(
        new File([blob], `${name}-cropped.jpg`, { type: "image/jpeg" }),
      );
    } catch (error) {
      console.error("Crop failed", error);
      // Fall back to the original rather than losing the user's pick.
      onCropped(file);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div
          ref={measureRef}
          role="application"
          aria-label="Drag to reposition the photo. Arrow keys nudge it."
          tabIndex={0}
          onPointerDown={startDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
          className="relative aspect-square w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-muted outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
        >
          {source && cover > 0 ? (
            /* eslint-disable-next-line @next/next/no-img-element -- a local
               object URL for a file the user just picked; next/image would
               try to optimise a blob that only exists in this tab. */
            <img
              src={source.url}
              alt=""
              draggable={false}
              style={{
                // Sized to `cover` at zoom 1, so the square is always filled.
                width: source.image.naturalWidth * cover,
                height: source.image.naturalHeight * cover,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
              }}
              className="absolute top-1/2 left-1/2 max-w-none"
            />
          ) : null}

          {/*
            Avatars render round, so the crop is previewed against a circle.
            One round element with an enormous shadow *spread*: the shadow
            fills everything outside the circle and the parent's overflow
            clips it to the square. Dimming the outside with a clip-path would
            have dimmed the inside instead.
          */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ring-2 ring-white/70"
          />
        </div>

        <div className="flex items-center gap-3">
          <ZoomIn
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <Slider
            value={[zoom]}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            onValueChange={([next]) => setZoom(next)}
            aria-label="Zoom"
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reset position and zoom"
            onClick={() => {
              setZoom(MIN_ZOOM);
              setOffset({ x: 0, y: 0 });
            }}
          >
            <RotateCcw className="size-4" aria-hidden />
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={exportCrop}
            disabled={!image || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Preparing…
              </>
            ) : (
              "Use this photo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
