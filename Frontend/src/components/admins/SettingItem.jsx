const SettingItem = ({ label, value }) => (
  <div>
    <h3 className="text-gray-500 text-sm">{label}</h3>
    <p className="text-lg font-semibold wrap-break-words">{value || "-"}</p>
  </div>
);
export default SettingItem;
