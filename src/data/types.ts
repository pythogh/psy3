/**
 * Types du projet, déduits du schéma (src/data/schema.ts).
 * Pour ajouter ou modifier un réglage, c'est le schéma qu'il faut changer.
 */
import type { z } from "zod";
import type { cameraSchema, layerSchema, shotSchema, shotTextSchema, transitionSchema, VideoProps } from "./schema";

export type VideoData = VideoProps;
export type { RecipeShot } from "./schema";
export type Shot = z.infer<typeof shotSchema>;
export type ShotText = z.infer<typeof shotTextSchema>;
export type Camera = z.infer<typeof cameraSchema>;
export type Transition = z.infer<typeof transitionSchema>;
export type TransitionType = Transition["type"];
export type Layer = z.infer<typeof layerSchema>;

type LayerOf<T extends Layer["type"]> = Extract<Layer, { type: T }>;
export type PhoneLayer = LayerOf<"phone">;
export type PhoneRowLayer = LayerOf<"phoneRow">;
export type PhoneGridLayer = LayerOf<"phoneGrid">;
export type PatternLayer = LayerOf<"pattern">;
export type CounterLayer = LayerOf<"counter">;
export type DotLayer = LayerOf<"dot">;
export type ShapeLayer = LayerOf<"shape">;
export type GroundLayer = LayerOf<"ground">;
export type TimelineLayer = LayerOf<"timeline">;
export type ReachLayer = LayerOf<"reach">;
export type MascotLayer = LayerOf<"mascot">;
export type MascotMood = MascotLayer["mood"];
export type ContextKind = NonNullable<GroundLayer["context"]>["kind"];
