import "./index.css";
import { Composition } from "remotion";
import { AUTH_DURATION, AuthAccess } from "./clips/AuthAccess";
import { ECOMMERCE_DURATION, EcommercePayment } from "./clips/EcommercePayment";
import { LOAN_DURATION, LoanCollection } from "./clips/LoanCollection";
import { PrReviewer } from "./clips/PrReviewer";
import {
  heroDurationInFrames,
  heroFps,
  HeroTopologyNarrow,
  HeroTopologyWide,
} from "./hero/compositions";
import { clipConfig } from "./theme";

/**
 * One composition per Work Samples project. Filenames in the site's
 * `portfolio-home-data.ts` are fixed, so each render target is named there.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition {...clipConfig} component={PrReviewer} id="PrReviewer" />
      <Composition
        {...clipConfig}
        component={AuthAccess}
        durationInFrames={AUTH_DURATION}
        id="AuthAccess"
      />
      <Composition
        {...clipConfig}
        component={LoanCollection}
        durationInFrames={LOAN_DURATION}
        id="LoanCollection"
      />
      <Composition
        {...clipConfig}
        component={EcommercePayment}
        durationInFrames={ECOMMERCE_DURATION}
        id="EcommercePayment"
      />
      <Composition
        component={HeroTopologyWide}
        durationInFrames={heroDurationInFrames}
        fps={heroFps}
        height={880}
        id="HeroTopologyWide"
        width={2000}
      />
      <Composition
        component={HeroTopologyNarrow}
        durationInFrames={heroDurationInFrames}
        fps={heroFps}
        height={1520}
        id="HeroTopologyNarrow"
        width={720}
      />
    </>
  );
};
