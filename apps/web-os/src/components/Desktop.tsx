import React, { useEffect, useState } from "react";
import { store } from "../state/store";
import { WindowView } from "./Window";
import { AppIcon } from "./Icon";
import { initSandboxBridge } from "../os/sandbox";
import { MenuBar } from "./MenuBar";
import { Dock } from "./Dock";
import { MenuList } from "../ui/Menu";

export function Desktop() {
  const [, setTick] = useState(0);
  useEffect(() => store.on(() => setTick((x) => x + 1)), []);
  useEffect(() => {
    initSandboxBridge();
  }, []);

  // add this helper near the top of Desktop()
  const snap =
    (store && (store as any).snapshot) || {
      windows: {},
      desktop: [],
      appData: {},
    };

  useEffect(() => {
    (async () => {
      try {
        // Theme: default to light if missing
        const theme = store.getAppData("settings", "theme", "aqua-light");
        document.body.dataset.theme = theme;

        // Wallpaper: fully defensive — failure cannot crash UI
        const wall = store.getAppData("settings", "wallpaper", null);
        if (!wall) {
          document.body.style.background = "var(--bg)";
          return;
        }

        // dynamic import so the module load itself doesn't break server-side tooling
        const mod = await import("../os/storage");
        const db = await mod.db();
        const dataUrl = await db.get("files", wall.path + ":data");

        if (typeof dataUrl === "string") {
          const cssFit =
            wall.fit === "fit"
              ? "contain"
              : wall.fit === "tile"
              ? "auto"
              : "cover";
          document.body.style.background = `url(${dataUrl}) no-repeat center / ${cssFit}, var(--bg)`;
        } else {
          document.body.style.background = "var(--bg)";
        }
      } catch (e) {
        console.error("[desktop wallpaper]", e);
        document.body.style.background = "var(--bg)";
      }
    })();
  }, [store.snapshot.appData]);

  const [sysMenu, setSysMenu] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const unsub = store.on(() => {
      /* re-render on state changes */
    });
    return unsub;
  }, []);

  function onRootClick(e: React.MouseEvent) {
    const target = e.target as HTMLElement;
    if (
      target.closest(".window") ||
      target.closest(".dock") ||
      target.closest(".menubar")
    )
      return;
    // Left-click empty desktop → open system menu at cursor
    setSysMenu({ x: e.clientX, y: e.clientY });
  }

  // System menu items
  const sysItems = [
    {
      label: "New Folder",
      onClick: () => store.setAppData("desktop", "newFolder", Date.now()),
    },
    { label: "Open Explorer", onClick: () => store.openApp("explorer") },
    {
      label: "Change Wallpaper…",
      onClick: () => store.openApp("settings", { tab: "wallpaper" }),
    },
    { label: "Settings…", onClick: () => store.openApp("settings") },
    { separator: true },
    {
      label: "Sleep",
      onClick: () => store.setAppData("power", "state", "sleep"),
    },
    { label: "Restart", onClick: () => window.location.reload() },
    {
      label: "Shut Down…",
      onClick: () => store.setAppData("power", "state", "off"),
    },
  ];

  useEffect(() => {
    function listener() {
      setSysMenu(null);
    }
    window.addEventListener("mousedown", listener);
    return () => window.removeEventListener("mousedown", listener);
  }, []);

  const power = store.getAppData("power", "state", "on");

  return (
    <div
      className="desktop crt"
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={onRootClick}
    >
      <MenuBar />
      <div className="desktop-layer right-dock-gap">
        {/* Desktop icons: guard against undefined */}
        {(snap.desktop || []).map((icon: any, i: number) => (
          <AppIcon key={i} appId={icon.appId} x={icon.x} y={icon.y} />
        ))}
        {/* Windows: guard against undefined */}
        {Object.values(snap.windows || {})
          .sort((a: any, b: any) => a.z - b.z)
          .map((w: any) => (
            <WindowView key={w.id} win={w} />
          ))}
      </div>
      <Dock />
      {/* Overlays */}
      {power === "sleep" && (
        <div
          className="power sleep"
          onMouseDown={() => store.setAppData("power", "state", "on")}
        >
          <div className="power-note">Sleeping… click to wake</div>
        </div>
      )}
      {power === "off" && (
        <div className="power off">
          <button
            className="power-btn"
            onClick={() => store.setAppData("power", "state", "on")}
          >
            ⏻ Power On
          </button>
        </div>
      )}

      {sysMenu && (
        <div className="menu-pop" style={{ left: sysMenu.x, top: sysMenu.y }}>
          <MenuList items={sysItems as any} />
        </div>
      )}
    </div>
  );
}