import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import MingTab from "./components/MingTab";
import LuTab from "./components/LuTab";
import "./App.css";

const tabs = ["命", "录", "卜"] as const;
type Tab = (typeof tabs)[number];

const appWindow = getCurrentWindow();

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("命");

  return (
    <div className="app">
      <header className="titlebar" data-tauri-drag-region>
        <span className="titlebar-title" data-tauri-drag-region>五条算命</span>
        <div className="titlebar-controls">
          <button className="titlebar-btn" onClick={() => appWindow.minimize()} title="最小化">
            ─
          </button>
          <button className="titlebar-btn" onClick={() => appWindow.toggleMaximize()} title="最大化">
            □
          </button>
          <button className="titlebar-btn close" onClick={() => appWindow.close()} title="关闭">
            ✕
          </button>
        </div>
      </header>
      <div className="body">
        <aside className="sidebar">
          <nav className="tab-list">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-item ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </aside>
        <main className="content">
          {activeTab === "命" && <MingTab />}
          {activeTab === "录" && <LuTab onView={() => setActiveTab("命")} />}
          {activeTab === "卜" && (
            <>
              <h2>卜</h2>
              <p>占卜预测</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
