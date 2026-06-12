import { useRecordStore } from "../store";

export default function LuTab({ onView }: { onView: () => void }) {
  const savedRecords = useRecordStore((s) => s.savedRecords);
  const deleteRecord = useRecordStore((s) => s.deleteRecord);
  const loadRecord = useRecordStore((s) => s.loadRecord);

  if (savedRecords.length === 0) {
    return (
      <div className="lu-tab">
        <div className="lu-empty">
          <div className="lu-empty-text">暂无保存记录</div>
          <div className="lu-empty-hint">在「命」tab 中查询后点击右下角「存」按钮即可保存</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lu-tab">
      {savedRecords.map((r) => (
        <div key={r.id} className="record-card">
          <div className="record-info">
            <span className="record-name">{r.name}</span>
            <span className="record-bazi">{r.baziSummary}</span>
            <span className="record-date">{new Date(r.savedAt).toLocaleDateString("zh-CN")}</span>
          </div>
          <div className="record-actions">
            <button
              className="btn-view"
              onClick={() => {
                loadRecord(r.id);
                onView();
              }}
            >
              查看
            </button>
            <button className="btn-delete" onClick={() => deleteRecord(r.id)}>
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
