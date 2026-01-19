const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  
  let score = 0;
  
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) {
    return { level: 1, label: 'Weak', color: '#FF3B30' };
  } else if (score <= 4) {
    return { level: 2, label: 'Medium', color: '#FF9500' };
  } else {
    return { level: 3, label: 'Strong', color: '#34C759' };
  }
};

const PasswordStrengthIndicator = ({ password }) => {
  const strength = getPasswordStrength(password);
  
  if (!password) return null;
  
  return (
    <div className="password-strength-container">
      <div className="strength-bars">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className="strength-bar"
            style={{
              backgroundColor: bar <= strength.level ? strength.color : 'rgba(150, 150, 150, 0.3)',
            }}
          />
        ))}
      </div>
      <span 
        className="strength-label"
        style={{ color: strength.color }}
      >
        {strength.label}
      </span>
    </div>
  );
};

export { getPasswordStrength };
export default PasswordStrengthIndicator;
