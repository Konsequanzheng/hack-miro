const URLInput = ({ placeholder, value, onChange }) => {
  return (
    <div className="form-group cs1 ce12">
      <input
        className="input"
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default URLInput;
