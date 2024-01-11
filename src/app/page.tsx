"use client";

import { useEffect, useState } from "react";
import { WebviewWindow } from "@tauri-apps/api/window";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";

export default function Home() {
  const [appWindow, setAppWindow] = useState<WebviewWindow>();
  const [greeting, setGreeting] = useState<string>();

  async function setupAppWindow() {
    const appWindow = (await import("@tauri-apps/api/window")).appWindow;
    setAppWindow(appWindow);
  }

  useEffect(() => {
    setupAppWindow();
    const unlisten = listen("tauri://file-drop", (event) => {
      // event.event is the event name (useful if you want to use a single callback fn for multiple event types)
      // event.payload is the payload object
      console.log("Event:", event.payload);
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleOpenWindow = () => {
    const webview = new WebviewWindow("google", {
      url: "https://www.google.com",
    });
    webview.once("tauri://created", () => {
      console.log("window created");
    });
  };

  const handleSendEvent = () => {
    emit("test", {
      theMessage: "Tauri is awesome!",
    });
  };

  const handleInvokeCommand = async () => {
    try {
      const result = await invoke<string>("greet");
      setGreeting(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <h1>Window label: {appWindow?.label}</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2em",
          marginTop: "1em",
          padding: "1em",
          flexWrap: "wrap",
        }}
      >
        <button style={styles.button} onClick={handleOpenWindow}>
          Open new window
        </button>
        <button style={styles.button} onClick={() => appWindow?.maximize()}>
          Maximize
        </button>
        <button
          style={styles.button}
          onClick={() => appWindow?.toggleMaximize()}
        >
          Toggle Maximize
        </button>
        <button style={styles.button} onClick={() => appWindow?.minimize()}>
          Minimize
        </button>
        <button style={styles.button} onClick={handleSendEvent}>
          Send event
        </button>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2em",
          marginTop: "1em",
          padding: "1em",
          flexWrap: "wrap",
        }}
      >
        <button style={styles.button} onClick={handleInvokeCommand}>
          Invoke command
        </button>
        <span>{greeting}</span>
      </div>
    </>
  );
}

const styles = {
  button: {
    color: "white",
    background: "green",
    borderRadius: "4px",
    fontSize: "1.2em",
    border: "none",
    padding: "0.5em",
    minWidth: "100px",
  },
};
