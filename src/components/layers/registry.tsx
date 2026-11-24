import React from "react";
import type { Layer } from "../../data/types";
import { Mascot } from "./Mascot";
import { PhoneGrid, PhoneRow, PhoneView, Reach } from "./PhoneLayers";
import { Counter, Dot, Ground, Pattern, Shape, Timeline } from "./ShapeLayers";

/** Associe chaque `type` de calque des données à son composant. */
export const renderLayer = (layer: Layer, t: number, d: number, key: string): React.ReactNode => {
  switch (layer.type) {
    case "phone":
      return <PhoneView key={key} layer={layer} t={t} d={d} />;
    case "phoneRow":
      return <PhoneRow key={key} layer={layer} t={t} d={d} />;
    case "phoneGrid":
      return <PhoneGrid key={key} layer={layer} t={t} d={d} />;
    case "reach":
      return <Reach key={key} layer={layer} t={t} d={d} />;
    case "pattern":
      return <Pattern key={key} layer={layer} t={t} d={d} />;
    case "counter":
      return <Counter key={key} layer={layer} t={t} d={d} />;
    case "dot":
      return <Dot key={key} layer={layer} t={t} d={d} />;
    case "shape":
      return <Shape key={key} layer={layer} t={t} d={d} />;
    case "ground":
      return <Ground key={key} layer={layer} t={t} d={d} clipId={`clip-${key}`} />;
    case "timeline":
      return <Timeline key={key} layer={layer} t={t} d={d} />;
    case "mascot":
      return <Mascot key={key} layer={layer} t={t} d={d} />;
  }
};
