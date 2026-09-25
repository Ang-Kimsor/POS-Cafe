import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { getSettings, updateSetting } from "../../../api/settingApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const EditableCell = ({ row, value, onChange }) => {
  const isBoolean = row.key_name.startsWith("enable_") || row.key_name.startsWith("is_");

  if (isBoolean) {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={value === "1" || value === "true"} 
          onChange={(e) => onChange(e.target.checked ? "1" : "0")}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087467]"></div>
      </label>
    );
  }

  return (
    <input 
      type="text" 
      className="border border-gray-300 rounded-lg px-4 py-2.5 w-full max-w-sm focus:outline-none focus:border-[#087467] focus:ring-1 focus:ring-[#087467]"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const ViewAll = () => {
  const [settings, setSettings] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSettings({ per_page: 100 }, false);
      const fetchedData = res.data.data ? res.data.data : res.data;
      
      setSettings(fetchedData);
      
      const initialDrafts = {};
      fetchedData.forEach(s => {
        initialDrafts[s.setting_id] = s.value;
      });
      setDrafts(initialDrafts);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleDraftChange = (id, newValue) => {
    setDrafts(prev => ({
      ...prev,
      [id]: newValue
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    let hasChanges = false;
    let errorCount = 0;

    for (const setting of settings) {
      if (drafts[setting.setting_id] !== setting.value) {
        hasChanges = true;
        try {
          await updateSetting(setting.setting_id, { value: drafts[setting.setting_id] });
        } catch (err) {
          console.error("Failed to save setting", setting.key_name, err);
          errorCount++;
        }
      }
    }

    setSaving(false);

    if (errorCount > 0) {
      Swal.fire("Warning", `Saved with ${errorCount} errors. Some settings may not have updated.`, "warning");
    } else if (hasChanges) {
      Swal.fire({
        title: "Success!", 
        text: "Settings updated successfully.", 
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: "Info",
        text: "No changes detected.",
        icon: "info",
        timer: 1500,
        showConfirmButton: false
      });
    }

    fetchSettings();
  };

  const formatKeyName = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="p-6 min-h-[calc(100vh-60px)]">
      <div className="w-full mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">
              Settings Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage system configuration keys and values
            </p>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#087467] text-white rounded-xl hover:bg-[#065e53] transition-all font-bold shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* SETTINGS LIST */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading settings...</div>
          ) : settings.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No settings found</div>
          ) : (
            <div className="flex flex-col">
              {settings.map((setting) => (
                <div 
                  key={setting.setting_id} 
                  className="flex items-center justify-between py-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 px-4 -mx-4 transition-colors rounded-xl"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-800 font-semibold text-lg">{formatKeyName(setting.key_name)}</span>
                    <span className="text-gray-400 text-sm font-mono">{setting.key_name}</span>
                  </div>
                  <div className="w-1/2 flex justify-end items-center">
                    <EditableCell 
                      row={setting} 
                      value={drafts[setting.setting_id]} 
                      onChange={(newVal) => handleDraftChange(setting.setting_id, newVal)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAll;
