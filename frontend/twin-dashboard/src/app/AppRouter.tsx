import React, { useState } from "react";
import LoaderPage from "../pages/LoaderPage";
import RocketDashboard from "../dashboards/RocketDashboard";
import TwinSelectionPage from "../pages/TwinSelectionPage";
import TransitionWrapper from "./TransitionWrapper";
import TransitionOverlay from "./TransitionOverlay";
import type { TwinDefinition } from "../core/TwinRegistry";
//App Flow States

type AppState = "loading" | "selection" | "dashboard";

export default function AppRouter() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [selectedTwin, setSelectedTwin] = useState<TwinDefinition | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Loader → Selection
  const handleLoaderFinish = () => {
    setAppState("selection");
  };

  //Selection → Trigger Transition
  const handleSelectTwin = (twin: TwinDefinition) => {
    setSelectedTwin(twin);
    setIsTransitioning(true);
  };

  //Transition Complete → Dashboard
  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setAppState("dashboard");
  };

  let content: React.ReactNode = null;

  if (appState === "loading") {
    content = <LoaderPage onFinish={handleLoaderFinish} />;
  }

  else if (appState === "selection") {
    content = <TwinSelectionPage onSelect={handleSelectTwin} />;
  }

  else if (appState === "dashboard") {

    if (selectedTwin) {
      content = (
        <RocketDashboard
          twin={selectedTwin}
        />
      );
    } else {
      content = (
        <div style={styles.error}>
          No Twin Selected
        </div>
      );
    }
  }

  return (
    <>
      {/* Smooth fade + depth */}
      <TransitionWrapper>{content}</TransitionWrapper>

      {/* Expansion transition (shared illusion) */}
      <TransitionOverlay
        active={isTransitioning}
        onComplete={handleTransitionComplete}
      />
    </>
  );
}

const styles: any = {
  error: {
    height: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
  },
};