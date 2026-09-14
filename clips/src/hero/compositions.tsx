import React from "react";
import { HeroTopology } from "./HeroTopology";
import { loopDuration, narrowLayout, wideLayout } from "./topology";

export const heroFps = 60;
/** 15s at 60fps. The scene is periodic over this span, so the video loops without a cut. */
export const heroDurationInFrames = (loopDuration / 1000) * heroFps;

export const HeroTopologyWide: React.FC = () => <HeroTopology layout={wideLayout} />;
export const HeroTopologyNarrow: React.FC = () => <HeroTopology layout={narrowLayout} />;
